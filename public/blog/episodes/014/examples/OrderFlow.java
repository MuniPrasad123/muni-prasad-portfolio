// Java 21 / Spring Boot TEACHING EXCERPTS, not a standalone application.
// Imports, bean wiring, serializers, auth and custom exceptions omitted.
// writeJdbc/writeTx use write PostgreSQL; readJdbc/readTx use separate read PostgreSQL.
// Transactional methods are invoked through separate Spring-proxied beans.
record OrderSnapshot(UUID eventId, String orderId, long version, String status) {}
record VerifiedPayment(String orderId, String providerPaymentId, long amountMinor,
                       String currency, boolean successful) {}

class OrderCommands {
  PaymentProvider provider;
  PaidCommit paidCommit;
  OrderSnapshot confirm(String signedCallback) {
    // Verify signature/server lookup, merchant, order binding, amount and currency.
    VerifiedPayment payment = provider.verify(signedCallback); // no DB transaction
    if (!payment.successful()) throw new PaymentNotConfirmed();
    return paidCommit.commit(payment); // separate proxied bean
  }
}
class PaidCommit {
  JdbcTemplate writeJdbc;
  ObjectMapper json;
  @Transactional(value="writeTx", rollbackFor=Exception.class)
  public OrderSnapshot commit(VerifiedPayment payment) throws Exception {
    var order = writeJdbc.queryForMap(
        "SELECT * FROM orders WHERE order_id=? FOR UPDATE", payment.orderId());
    if (((Number)order.get("amount_minor")).longValue() != payment.amountMinor()
        || !order.get("currency").equals(payment.currency())) throw new ReceiptMismatch();
    if (order.get("status").equals("PAID")) {
      if (!payment.providerPaymentId().equals(order.get("provider_payment_id")))
        throw new ConflictingPayment();
      return json.readValue(writeJdbc.queryForObject(
          "SELECT payload::text FROM outbox WHERE order_id=? AND version=?",
          String.class, payment.orderId(), order.get("version")), OrderSnapshot.class);
    }
    if (!order.get("status").equals("PENDING")) throw new InvalidOrderState();
    long version = ((Number)order.get("version")).longValue() + 1;
    var event = new OrderSnapshot(UUID.randomUUID(), payment.orderId(), version, "PAID");
    writeJdbc.update("UPDATE orders SET status='PAID',version=?,provider_payment_id=? WHERE order_id=?",
        version, payment.providerPaymentId(), payment.orderId());
    writeJdbc.update("INSERT INTO outbox(event_id,order_id,version,payload) VALUES (?,?,?,?::jsonb)",
        event.eventId(), event.orderId(), event.version(), json.writeValueAsString(event));
    return event; // Proxy commits before command caller receives success.
  }
}
class OutboxBatch {
  JdbcTemplate writeJdbc;
  KafkaTemplate<String,String> kafka;
  @Transactional(value="writeTx", rollbackFor=Exception.class)
  public void publish() throws Exception {
    var rows = writeJdbc.queryForList("SELECT event_id,order_id,payload::text AS body FROM outbox " +
        "WHERE published_at IS NULL ORDER BY created_at,event_id LIMIT 1 FOR UPDATE SKIP LOCKED");
    for (var row : rows) {
      kafka.send("order-events", row.get("order_id").toString(), row.get("body").toString())
          .get(5, TimeUnit.SECONDS);
      writeJdbc.update("UPDATE outbox SET published_at=now() WHERE event_id=?", row.get("event_id"));
    }
  }
}
// Scheduler calls proxied OutboxBatch. One-row tx bounds DB locks; not a high-throughput relay.
// acks=all, enable.idempotence=true. A crash/timeout after Kafka send can cause resend.
// Concurrent workers can publish versions out of order: safe for this status SNAPSHOT.
// Use per-aggregate sequencing/CDC if other consumers require strict version order.
class ProjectionWriter {
  JdbcTemplate readJdbc;
  static final String UPSERT = """
      INSERT INTO order_projection(order_id,status,version) VALUES (?,?,?)
      ON CONFLICT(order_id) DO UPDATE
      SET status=EXCLUDED.status,version=EXCLUDED.version,updated_at=now()
      WHERE order_projection.version < EXCLUDED.version
      RETURNING order_id
      """;
  @Transactional("readTx")
  public String apply(OrderSnapshot event) {
    // Validate trusted event schema, status and positive version first.
    var applied = readJdbc.queryForList(UPSERT,event.orderId(),event.status(),event.version());
    if (!applied.isEmpty()) return "APPLIED";
    var stored = readJdbc.queryForMap(
        "SELECT status,version FROM order_projection WHERE order_id=? FOR UPDATE",event.orderId());
    long version = ((Number)stored.get("version")).longValue();
    if (version == event.version() && !stored.get("status").equals(event.status()))
      throw new ConflictingSnapshot(); // alert/quarantine; do not overwrite
    return version > event.version() ? "STALE" : "DUPLICATE";
  }
}
class ProjectionListener {
  ProjectionWriter writer; // Separate bean commits read transaction before listener returns.
  @KafkaListener(topics="order-events", groupId="my-orders")
  public void onEvent(OrderSnapshot event) { writer.apply(event); }
}
// enable.auto.commit=false; container AckMode.RECORD; configure record deserialization.
// Propagate DB failures. Commit DB before offset; a crash between them means safe replay.
// Retry transient failures with bounded backoff. Poison/conflicting records need monitored
// durable quarantine, offset policy and repair; do not silently skip records.
record HistoryResponse(String orderId, String status, long version,
                       boolean synchronizing, String message) {}
class HistoryQuery {
  OrderAuthority authority;
  ReadView readView;
  HistoryResponse get(String authenticatedCustomer, String orderId) {
    var confirmed = authority.authorizedSnapshot(authenticatedCustomer, orderId);
    var view = readView.find(orderId); // outage => explicit unavailable response
    boolean lagging = view.isEmpty() || view.get().version() < confirmed.version();
    return new HistoryResponse(orderId, view.map(OrderSnapshot::status).orElse("UNKNOWN"),
        view.map(OrderSnapshot::version).orElse(0L), lagging,
        confirmed.status().equals("PAID") && lagging
            ? "Payment confirmed. Your order history is synchronizing."
            : confirmed.status().equals("PAID") ? "Paid" : "Payment verification pending.");
  }
}
// Authority lookup costs latency/availability. Alternative: a short-lived signed command
// receipt bound to the authenticated customer/order; never trust a browser boolean.
class ReconciliationJob {
  OrderAuthority authority;
  ProjectionWriter writer;
  RepairQueue repairs; // Durable leases, pagination, retries and operator visibility.
  @Scheduled(fixedDelayString="${reconciliation.delay:30000}")
  public void repair() {
    for (var orderId : repairs.claimBoundedBatch()) {
      try {
        writer.apply(authority.snapshotForRepair(orderId));
        repairs.markDone(orderId);
      } catch (RuntimeException failure) { repairs.retryWithAlert(orderId, failure); }
    }
  }
}
// Find candidates by authoritative-version inventory/CDC, including historical orders.
// An unpublished event cannot create Kafka consumer lag. Reuse the projection guard;
// do not mutate authoritative payment state. Conflicts need human investigation.
