---
title: "Saga Pattern in Spring Boot: Recovering Failed Checkout Steps"
slug: "saga-pattern-checkout-compensation"
date: "2026-11-05"
description: "A payment authorization succeeds but inventory reservation fails. Learn durable Saga steps, compensation, idempotency, and recovery that gives the shopper a clear order status."
tags: ["Java", "Spring Boot", "System design", "E-commerce", "Microservices"]
cover: "/blog/episodes/008/cover.svg"
coverAlt: "Saga Pattern in Spring Boot: Recovering Failed Checkout Steps"
draft: false
sample: false
level: "Architecture in Motion · Episode 008"
lab: "/blog/episodes/008/lab.html"
video: "/blog/episodes/008/lesson.mp4"
videoPoster: "/blog/episodes/008/poster.png"
videoCaptions: "/blog/episodes/008/captions.vtt"
videoCaption: "Supplied narrated architecture lesson · illustrative scenario"
---

## What will you learn?

A payment authorization succeeds but inventory reservation fails. Learn durable Saga steps, compensation, idempotency, and recovery that gives the shopper a clear order status.



**Architecture in Motion — Episode 008 | Java 21 · Spring Boot · PostgreSQL · Kafka · Payment orchestration**

> A database rollback cannot reverse a payment that another service already authorized or captured. Distributed checkout needs a business recovery plan, not just a `@Transactional` annotation.

## 1. The incident: a successful payment, a failed order

It is 8:00 p.m. during a flash sale. A shopper places an order for a $399 headset. The payment provider accepts an authorization, but the Inventory Service reports `OUT_OF_STOCK` after another buyer reserved the final unit. The checkout API returns an error. The shopper now sees a pending card authorization—or, in a poorly designed capture-first flow, an actual charge—without a confirmed order.

The business question is not merely **"Which HTTP call failed?"** It is **"Which side effects already happened, and how do we return the system to an acceptable business state?"**

A Spring `@Transactional` method only controls transactions managed by its transaction manager. It cannot roll back a committed inventory transaction in another service or a payment authorization at a provider.

### Business impact

- A customer may see funds held or charged without an order.
- Support receives complaints and must reconcile order, inventory and payment ledgers.
- Naive retries can create duplicate payment attempts or double inventory reservations.
- A misleading `CANCELLED` order status may hide a failed refund or void operation.

**Production-style scenario, not a claim about any specific merchant's incident.**

## 2. The architecture: one order, several local transactions

![Simplified topic overview](/blog/episodes/008/cover.svg)

The **Saga pattern** coordinates a sequence of *local* transactions. Each participant commits only to its own database; when a later step fails, the system issues **compensating business actions**. A compensation is not a time machine: a refund can take time, incur fees, or fail. It must be tracked as a first-class workflow.

### Why not one giant transaction?

A database transaction cannot atomically include a typical external payment API. Two-phase commit across independent databases and external providers is often unavailable, costly or inappropriate. A Saga makes partial failure explicit, at the cost of additional states, retries, reconciliation and temporarily inconsistent views.

## 3. Prefer reserve → authorize → capture, when the business allows it

The problem headline uses **payment-first** because it exposes the failure clearly. For a new checkout design, a safer common sequence is:

1. Create a `PENDING` order with a unique order ID and client idempotency key.
2. **Reserve inventory** with a short-lived reservation and a deterministic reservation ID.
3. **Authorize payment** without capturing it immediately, when supported by the payment method/provider.
4. **Capture** after prerequisites pass; confirm the order only after the payment outcome is known.
5. On authorization failure, release the reservation. On inventory failure in a payment-first flow, **void/cancel an uncaptured authorization**.
6. If money was already captured, initiate a **refund** and track `REFUND_PENDING` until the provider confirms the outcome.

Actual payment flows vary: some payment methods capture immediately, some require customer authentication, and authorization holds expire. Model these differences explicitly instead of assuming every provider supports an identical API.

### Happy path vs failure path

| Step | Happy path | Inventory failure after authorization | Capture-first failure |
|---|---|---|---|
| Order | `PENDING` | `PENDING` | `PENDING` |
| Payment | `AUTHORIZED` | `AUTHORIZED` | `CAPTURED` |
| Inventory | `RESERVED` | `REJECTED` | `REJECTED` |
| Compensation | None | Void authorization | Refund payment |
| Final state | `CONFIRMED` | `CANCELLED` only after void is resolved | `CANCELLED` only after refund is resolved |

Do not tell a customer **"refunded"** merely because a refund request was sent. Use `REFUND_PENDING` until the provider confirms the operation; reflect settlement timing accurately.

## 4. Orchestration vs choreography

**Orchestration:** One durable coordinator knows the state of each order and sends commands. It is a strong default for complex checkout flows, especially when refunds, timeouts and manual review are involved. The coordinator must be highly available, replayable and auditable.

**Choreography:** Services react to domain events without a central workflow coordinator. It can be elegant for a small number of independent participants, but the global business flow becomes harder to inspect as event chains and compensation paths multiply.

Neither approach guarantees success by itself. Both require durable state, deduplication, timeouts, business invariants and an operator recovery path.

## 5. PostgreSQL: persist the Saga and its next command atomically

Use a transaction for the local order state and the outbox row. Never do an HTTP call to the payment provider inside this database transaction.

```sql
-- PostgreSQL: simplified teaching schema; see code/schema.sql for full DDL.
CREATE TABLE orders (
  order_id UUID PRIMARY KEY,
  status TEXT NOT NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0)
);
CREATE TABLE order_sagas (
  order_id UUID PRIMARY KEY REFERENCES orders(order_id),
  state TEXT NOT NULL,
  version BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE outbox (
  event_id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  published_at TIMESTAMPTZ
);
CREATE TABLE processed_messages (
  consumer_name TEXT NOT NULL,
  message_id UUID NOT NULL,
  PRIMARY KEY (consumer_name, message_id)
);
```

In one local transaction, insert the order, the Saga state and the command to reserve stock:

```java
@Service
public class CheckoutStartService {
    private final JdbcTemplate jdbc;
    public CheckoutStartService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional
    public UUID start(UUID orderId, long amountCents, String sku) {
        jdbc.update("INSERT INTO orders(order_id,status,amount_cents) VALUES (?,?,?)",
            orderId, "PENDING", amountCents);
        jdbc.update("INSERT INTO order_sagas(order_id,state) VALUES (?,?)",
            orderId, "RESERVATION_REQUESTED");
        jdbc.update("""
            INSERT INTO outbox(event_id,aggregate_id,event_type,payload)
            VALUES (?,?,?,jsonb_build_object('orderId',?,'sku',?))
            """, UUID.randomUUID(), orderId, "ReserveInventory", orderId.toString(), sku);
        return orderId;
    }
}
```

This excerpt assumes the caller has already enforced a **unique checkout idempotency key** (the complete schema includes that constraint). If the API request is retried, return the existing order instead of generating another payment workflow.

An outbox relay publishes pending commands to Kafka and marks them published. A crash between publish and mark may publish twice, so consumers **must be idempotent**. The outbox closes the local DB/publish dual-write gap; it does not guarantee exactly-once effects across every downstream system.

## 6. React to a failed inventory step, safely

When an inventory rejection event arrives, the orchestrator checks the recorded payment state and emits a compensation command. The state change and outbox insertion happen in the same local transaction.

```java
@Transactional
public void inventoryRejected(UUID eventId, UUID orderId) {
    // Claim event once using the (consumer_name, message_id) unique key.
    int accepted = jdbc.update("""
        INSERT INTO processed_messages(consumer_name, message_id)
        VALUES ('saga-orchestrator', ?) ON CONFLICT DO NOTHING
        """, eventId);
    if (accepted == 0) return;

    String state = jdbc.queryForObject("""
        SELECT state FROM order_sagas WHERE order_id = ? FOR UPDATE
        """, String.class, orderId);

    String command;
    if ("PAYMENT_AUTHORIZED".equals(state)) command = "VoidAuthorization";
    else if ("PAYMENT_CAPTURED".equals(state)) command = "RefundPayment";
    else if ("RESERVATION_REQUESTED".equals(state)) command = "RejectOrder";
    else return; // Other states need explicit policy and event-order handling.

    jdbc.update("""
        UPDATE order_sagas SET state='COMPENSATION_PENDING',
            version=version+1, updated_at=now() WHERE order_id=?
        """, orderId);
    jdbc.update("""
        INSERT INTO outbox(event_id,aggregate_id,event_type,payload)
        VALUES (?,?,?,jsonb_build_object('orderId',?))
        """, UUID.randomUUID(), orderId, command, orderId.toString());
}
```

**Important:** This is an instructional handler, not a complete workflow engine. A real implementation must explicitly handle out-of-order events, late provider callbacks, timeouts, state-specific invariants and failed compensations. The source kit includes a deterministic Java 21 state-machine demonstration.

## 7. Idempotency: retry the command, not the side effect

Use three different identifiers:

- **Client checkout key**: prevents duplicate orders when the customer taps Place Order twice.
- **Message ID**: lets a consumer deduplicate re-delivered Kafka events with a unique database constraint.
- **Provider operation key**: a stable key for the same authorization, capture, void or refund request. Never generate a fresh key just because an HTTP call timed out.

A payment timeout means **unknown outcome**, not **payment failed**. Query the provider or wait for a verified webhook, then resume the Saga. Repeating a financial operation with a different idempotency key may create another charge.

## 8. Failure modes that matter in production

| Failure | Unsafe reaction | Production-safe response |
|---|---|---|
| Payment API times out | Assume failure and start a new payment | Record `UNKNOWN`; reconcile with provider using stable key |
| Inventory rejects after authorization | Cancel order and forget payment | Void authorization; await confirmation |
| Inventory rejects after capture | Mark `REFUNDED` immediately | Request refund; track pending/completed/failed |
| Compensation API fails | Retry forever without visibility | Bounded backoff, durable pending state, alert/manual review |
| Kafka redelivers event | Execute compensation twice | Inbox dedup + provider idempotency |
| Outbox relay crashes after publish | Assume exactly-once publish | Accept possible duplicates; make handlers idempotent |
| Late success callback arrives | Reopen a cancelled order | Validate allowed state transitions and reconcile |
| Saga worker restarts | Lose in-memory progress | Recover from persisted Saga state and outbox |

## 9. Scaling, performance, resilience and security

**Scaling:** Partition events by `orderId` to preserve per-order Kafka ordering within a partition. Use worker groups to scale across orders. Track backlog age, compensation latency, stuck Saga count and provider error rates. A single hot order should not block unrelated orders.

**Performance:** The orchestrator performs short DB transactions, with network I/O outside the transaction. Avoid holding row locks while waiting for a payment provider. Index `order_sagas(state, updated_at)` for recovery scans and `outbox(published_at)` for pending delivery. Measure real p95/p99 latency under controlled load before claiming throughput gains.

**Resilience:** Use bounded retries with jitter, per-operation deadlines, a reconciliation job for `UNKNOWN`/`COMPENSATION_PENDING`, and explicit operator tooling. Define what happens if a refund is permanently rejected.

**Security:** Never put card PAN/CVV in Saga events or logs. Use payment-provider tokens, encrypt secrets, verify webhook signatures, authorize order lookups by customer ownership, and minimize sensitive event payloads. Retain an audit trail of financial state transitions.

**Consistency:** A Saga provides eventual business consistency, not ACID isolation across all services. Inventory reservations need their own concurrency protection and expiry safeguards; compensation commands also need their own idempotency.

## 10. Practice: three exercises

1. **Beginner:** Draw the state transitions when inventory is reserved but payment authorization fails. What compensation is required?
2. **Intermediate:** A Kafka consumer receives the same `InventoryRejected` event three times. Design a `processed_messages` uniqueness constraint and prove only one compensation command is inserted.
3. **Advanced:** The payment provider times out after accepting a capture, then a delayed `PaymentCaptured` webhook arrives after `REFUND_PENDING`. Define legal transitions, reconciliation and customer-facing status. Explain why a new capture idempotency key would be unsafe.

**Suggested solutions:** (1) Release the reservation, then mark cancelled after release is resolved. (2) Unique `(consumer_name,message_id)` insert in the same transaction as Saga transition/outbox; duplicate inserts do nothing. (3) Reconcile provider operation status by stable ID, ignore or audit stale callbacks, preserve `REFUND_PENDING` until a verified refund outcome, never repeat capture with a new key.

## 11. Interview Q&A

**Q: Is a Saga the same as a database rollback?** No. It uses explicit business compensations, which may be asynchronous or fail.

**Q: Why is Kafka exactly-once not enough for payment safety?** Kafka transactional guarantees do not automatically make external provider side effects exactly once. Application/provider idempotency remains necessary.

**Q: Orchestration or choreography for checkout?** Prefer orchestration when compensation, auditability and recovery are complex; choreography can suit smaller, loosely coupled flows.

**Q: When should we capture payment?** Prefer after inventory and other prerequisites are secured, where provider and business rules allow it; distinguish authorization from capture.

**Q: What is the hardest failure?** Unknown external outcome after timeout. The correct response is durable uncertainty plus reconciliation, not an assumption of failure.

## 12. An interactive lab readers can actually use

The accompanying single-file HTML lets readers select **happy path**, **inventory failure after authorization**, **inventory failure after capture**, **unknown payment outcome**, and **compensation failure**. It animates commands across services, advances state transitions, shows durable order/payment/inventory states, and can inject duplicate events. This is a **deterministic conceptual simulation**, not a live Kafka/Stripe/PostgreSQL benchmark.

## Conclusion

**A successful API call is not a successful order.** A production checkout succeeds only when inventory, payment and order state reach a consistent, verifiable business outcome. Design for the moment after the first partial failure: persist progress, compensate carefully, reconcile unknown outcomes, and never hide financial uncertainty behind a generic `500` error.

---

### References and further reading

- Chris Richardson, *Saga pattern*: https://microservices.io/patterns/data/saga.html
- Spring Kafka, *Exactly Once Semantics*: https://docs.spring.io/spring-kafka/reference/4.0/kafka/exactly-once.html
- Spring Framework, *Transaction-bound events*: https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html
- Stripe, *Separate authorization and capture*: https://docs.stripe.com/payments/capture-later

*Original educational article. Examples use a hypothetical e-commerce checkout and are not benchmark results or a complete payment integration.*
