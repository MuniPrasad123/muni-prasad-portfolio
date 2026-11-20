package example.webhooks;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Teaching service: Spring Boot JDBC dependencies and transaction manager required.
// No provider SDK, signature algorithm, HTTP controller or production wiring is supplied.
// The caller is a SEPARATE bean: verify original raw bytes BEFORE calling this proxy.
@Service
public class WebhookService {
  public record VerifiedSuccess(String provider, String merchantId, String eventId,
      String paymentId, String orderId, long amountMinor, String currency, String bodySha256) {}
  public enum Outcome { APPLIED, DUPLICATE, ALREADY_SUCCEEDED, RECONCILE }
  private final JdbcTemplate db;
  public WebhookService(JdbcTemplate db) { this.db = db; }

  @Transactional
  public Outcome acceptVerifiedSuccess(VerifiedSuccess event) {
    int accepted = db.update("""
        INSERT INTO webhook_inbox(provider,merchant_id,event_id,payment_id,body_sha256)
        VALUES (?,?,?,?,?) ON CONFLICT DO NOTHING
        """, event.provider(),event.merchantId(),event.eventId(),event.paymentId(),event.bodySha256());
    if (accepted == 0) {
      var prior = db.queryForMap("""
          SELECT payment_id,body_sha256 FROM webhook_inbox
          WHERE provider=? AND merchant_id=? AND event_id=?
          """,event.provider(),event.merchantId(),event.eventId());
      if (!event.paymentId().equals(prior.get("payment_id")) || !event.bodySha256().equals(prior.get("body_sha256")))
        throw new IllegalStateException("Conflicting payload for one event identity: investigate");
      return Outcome.DUPLICATE;
    }
    var payment = db.queryForMap("""
        SELECT order_id,amount_minor,currency,status FROM payments
        WHERE provider=? AND merchant_id=? AND payment_id=? FOR UPDATE
        """,event.provider(),event.merchantId(),event.paymentId());
    // Unknown payment throws: roll back inbox too; retry or durably quarantine under an explicit policy.
    if (!event.orderId().equals(payment.get("order_id"))
        || event.amountMinor()!=((Number)payment.get("amount_minor")).longValue()
        || !event.currency().equals(payment.get("currency")))
      throw new IllegalArgumentException("Payment evidence does not match checkout terms");
    if (payment.get("status").equals("SUCCEEDED")) return Outcome.ALREADY_SUCCEEDED;
    if (payment.get("status").equals("REFUNDED")) {
      db.update("""
          INSERT INTO webhook_reconciliation(provider,merchant_id,event_id,payment_id,reason)
          VALUES (?,?,?,?,'Late success after refund') ON CONFLICT DO NOTHING
          """,event.provider(),event.merchantId(),event.eventId(),event.paymentId());
      return Outcome.RECONCILE; // preserve terminal state; durable repair/audit candidate
    }
    int changed = db.update("""
        UPDATE payments SET status='SUCCEEDED'
        WHERE provider=? AND merchant_id=? AND payment_id=? AND status='PENDING'
        """,event.provider(),event.merchantId(),event.paymentId());
    if (changed != 1) throw new IllegalStateException("Unexpected payment transition");
    String key = "payment-succeeded:"+event.provider()+":"+event.merchantId()+":"+event.paymentId();
    db.update("""
        INSERT INTO outbox(event_key,event_type,payload)
        VALUES (?,'PaymentSucceeded',jsonb_build_object('paymentId',?::text,'orderId',?::text,'merchantId',?::text))
        """,key,event.paymentId(),event.orderId(),event.merchantId());
    return Outcome.APPLIED;
  }
}
// The proxy commits before returning to the controller. Only then return 2xx.
// A database exception rolls back inbox, state, reconciliation and outbox together.
// Dispatcher uses stable keys such as email:<event_key> and shipment:<event_key>.
// A send-then-crash may repeat delivery; destinations must deduplicate or reconcile.
