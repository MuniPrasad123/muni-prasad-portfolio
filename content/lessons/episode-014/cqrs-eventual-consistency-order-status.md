---
title: "CQRS and Eventual Consistency: Explaining Delayed Order Status After Payment"
description: "Payment succeeds for ORD-101, but My Orders still says PENDING. Follow the outbox, Kafka and version-aware read model through failure and recovery."
slug: "cqrs-eventual-consistency-order-status"
folder: "Kafka & distributed workflows"
date: "2026-11-14"
updated: "2026-11-19"
tags: ["Java","Spring Boot","Kafka","PostgreSQL","Distributed systems"]
cover: "/blog/thumbnails/episode-014.svg"
coverAlt: "A confirmed payment is written first and a separate order-status read model catches up later."
draft: false
sample: false
level: "Architecture in Motion · Episode 014"
lab: "/blog/episodes/014/lab.html"
overview: {"problem":"A shopper pays ₹4,999 for ORD-101. Checkout confirms the order, but My Orders still shows PENDING v1.","solution":"Keep one authoritative payment outcome, publish a durable outbox snapshot and update history with an atomic version guard.","note":"Illustrative incident · nine-step journey and eight failure scenarios · narrated video pending"}
---

## 1. The customer problem: one purchase, two answers

A shopper buys sneakers for **₹4,999**, order **ORD-101**. The payment provider confirms success. The Order Service verifies the evidence and commits **PAID v2** before returning **“Payment Successful! Order Confirmed.”**

The shopper opens My Orders and sees **“Payment Pending.”** They worry that money disappeared or that they should try paying again. This is an illustrative production-style incident, not a documented employer incident.

The two messages describe different things: checkout knows the authoritative command result; history reads a separate database that still contains **PENDING v1**. No second payment is needed to update that view.

## 2. What the customer should see

The side-by-side screens above reproduce the confusing experience. A safer history page says **“Payment confirmed. Your order history is synchronizing.”** This statement requires verified, authorized evidence: a server lookup or a signed command receipt scoped to the customer and order. A browser flag or a stale cache is insufficient.

If the provider outcome is unknown, say **“Payment verification pending”** and resolve that existing attempt. If the history database is unavailable, say so while preserving any verified payment confirmation. Never infer a failed payment from a delayed read model or automatically submit another payment.

## 3. CQRS explained simply

**Command = change information**, such as Create Order or Confirm Payment. **Query = read information**, such as View Order History or Track Order. CQRS separates these responsibilities; it does not inherently require two databases.

In this design, the command service owns a PostgreSQL write database, while a separate PostgreSQL read database stores an optimized order-status view. The latter can support read workloads independently. Because it is updated asynchronously, a committed write and the displayed query result can temporarily disagree.

Use the comparison control above to switch between a shared database and separate stores. A small application with ordinary reads may be better served by one database. Additional projections add deployment, reconciliation, security and operational costs.

## 4. System architecture and transaction boundaries

Customer → Checkout UI → Spring Boot Order Service → PostgreSQL write database + transactional outbox → outbox publisher → Kafka **order-events** → Spring Boot projection consumer → PostgreSQL read database → My Orders UI.

Click each architecture component in the lab to inspect it. The write database and outbox boxes represent **one local transaction**, not two independently committed databases. The provider's authorization is outside that transaction. If the provider succeeds but the local transaction fails, retry the verified callback or reconcile that existing payment; do not authorize again.

Kafka carries complete **order-status snapshots** keyed by `ORD-101`. It does not query the payment provider, update PostgreSQL automatically or make the two stores commit together.

## 5. Follow the nine-step journey

The original compact simulation window above retains its side-by-side unsafe/protected comparison. Expand **Explore the extended nine-step journey and eight failure scenarios** beneath it, then choose **Nine-step journey**. Each numbered step shows active components, data, customer message, explanation and accumulated trace.

1. Create ORD-101 as PENDING v1.
2. Verify the provider's payment result outside the database transaction.
3. Commit PAID v2 and its outbox event atomically; return checkout confirmation.
4. Publish `OrderPaid { orderId: ORD-101, status: PAID, version: 2 }` and wait for broker acknowledgement.
5. A consumer backlog delays projection processing.
6. History still holds PENDING v1; verified confirmation supports a synchronization message.
7. Consumer recovery commits PAID v2 to the read database.
8. An explicit replay path publishes an older PENDING v1 snapshot; reject it.
9. History reads PAID v2. One order and one payment remain.

Use Previous to revisit a teaching state, Next to process one transition, Play/Pause for timed steps and Pause motion for decorative movement. Motion replay never processes more events. Reduced-motion settings suppress the moving envelope.

## 6. Interactive failure and recovery lab

In the extended panel, switch to **Failure and recovery lab**, choose a scenario and compare **Unsafe design** with **Protected design**. Both receive the same event sequence. Unsafe means unconditional snapshot overwrites and a misleading stale history message; it does not fabricate another charge.

| Scenario | Observe | Expected protected outcome |
| --- | --- | --- |
| Normal propagation | Write commit precedes projection | PAID v2 converges |
| Consumer delay | Kafka has v2; read store has v1 | Honest synchronization message |
| Consumer restart | Delivery resumes from committed offset | Durable state survives replay |
| Duplicate delivery | PAID v2 arrives twice | Second application changes nothing |
| Out-of-order replay | Old v1 is republished after v2 | Reject v1 |
| Publisher failure | Outbox remains pending | Retry without losing event intent |
| Read model unavailable | Database write fails | No successful offset acknowledgement; retry |
| Reconciliation | Authoritative v2 repairs a stalled view | Later duplicate remains harmless |

The metrics show write/read status and version, outbox, Kafka, consumer, projection writes and the customer's current message. They are simulated state, not measurements from running infrastructure.

## 7. Root cause: three different risks

**Projection lag:** the view has not applied the latest snapshot. A version guard cannot make an absent event arrive; publishing, retry and reconciliation provide liveness.

**Business-version disorder:** an older snapshot reaches a projection after a newer snapshot. Kafka preserves order within a partition, not across topics, independent replay paths or concurrent application publishing. Here step eight deliberately republishes an old snapshot. Key by order ID and preserve publisher ordering when your consumers need it.

**Duplicate delivery:** a publisher may send successfully and crash before marking its outbox row; a consumer may commit PostgreSQL and crash before its Kafka offset commits. Either can cause replay. Kafka's exactly-once facilities do not automatically make external PostgreSQL or payment effects exactly once.

## 8. Solution architecture: durable intent and monotonic views

Store the order update and outbox snapshot together. Publish pending rows with retries and broker acknowledgement. Let consumers commit the projection before acknowledging processing. Protect every consumer replica with a **persistent database condition**, not an in-memory HashSet.

| Stored → incoming | Result |
| --- | --- |
| PENDING v1 → PAID v2 | Accept newer snapshot |
| PAID v2 → PENDING v1 | Reject stale snapshot |
| PAID v2 → identical PAID v2 | No state change |
| PAID v2 → conflicting PENDING v2 | Investigate; preserve stored snapshot |

These events are complete snapshots of this lesson's status view. A delta such as “increment total” cannot safely skip missing versions. Delta consumers may need contiguous sequence enforcement, durable gap buffering and authoritative rebuilds. Extra side effects such as emails need their own durable deduplication or outbox; a status guard alone does not protect them.

## 9. Java 21 and Spring Boot implementation

The following excerpts illustrate transaction boundaries, not a deployable checkout service. The [annotated Java source](/blog/episodes/014/examples/OrderFlow.java) includes provider verification, idempotent callback handling, publisher, consumer, history API and reconciler. Imports, dependency injection, provider adapters, serializers, authentication and exception types are deliberately documented as omitted. These excerpts have not been compiled as a Spring application.

### Event contract and verified payment

```java
record OrderSnapshot(UUID eventId, String orderId, long version, String status) {}
record VerifiedPayment(String orderId, String providerPaymentId,
                       long amountMinor, String currency, boolean successful) {}
```

**Input:** trusted provider evidence for ORD-101, amount `499900` minor units, currency INR. **Output:** a stable outbox event with a per-order version. Verify signature/server lookup, merchant account, order association, amount and currency. An unsuccessful or unknown outcome must not create a PAID event.

### Order transition and outbox transaction

```java
// Provider verification occurs first, outside the database transaction.
VerifiedPayment payment = provider.verify(signedCallback);
if (!payment.successful()) throw new PaymentNotConfirmed();
return paidCommit.commit(payment); // separate Spring-proxied bean
```

Inside `@Transactional(value="writeTx", rollbackFor=Exception.class)`, lock the order with `SELECT ... FOR UPDATE`, compare immutable checkout terms and handle an already-PAID callback using the existing stored event. Then update the order and insert the outbox row on the same connection. Any failure rolls back both. The unique provider payment ID prevents binding one receipt to multiple orders.

```java
long version = storedVersion + 1;
var event = new OrderSnapshot(UUID.randomUUID(), "ORD-101", version, "PAID");
writeJdbc.update("UPDATE orders SET status='PAID',version=?,provider_payment_id=? WHERE order_id=?",
    version, payment.providerPaymentId(), event.orderId());
writeJdbc.update("INSERT INTO outbox(event_id,order_id,version,payload) VALUES (?,?,?,?::jsonb)",
    event.eventId(), event.orderId(), event.version(), json.writeValueAsString(event));
```

**Expected:** PAID v2 and one pending outbox row. **Failure:** an outbox insert or serialization error rolls back the state transition. Self-invocation bypasses Spring transaction proxies; call a separate bean. Keep the provider network call outside the database lock and transaction.

## 10. PostgreSQL and Kafka examples

### Reliable publication

A bounded worker locks one pending outbox row using `FOR UPDATE SKIP LOCKED`. Through a separate proxied transaction bean, it performs:

```java
kafka.send("order-events", orderId, serializedSnapshot)
    .get(5, TimeUnit.SECONDS); // broker acknowledgement
writeJdbc.update("UPDATE outbox SET published_at=now() WHERE event_id=?", eventId);
```

**Input:** a pending outbox row. **Output:** acknowledged Kafka record followed by the published marker. Configure `acks=all` and producer idempotence, keep the event ID stable, retry failed batches with backoff and monitor oldest pending age. A timeout may mean the broker accepted the send. A crash between send and database commit can duplicate publication. Producer idempotence does not deduplicate every application resend after restart.

Holding a DB lock during a bounded send is a simple teaching trade-off. Production relays may use leases or CDC. Competing workers can publish aggregate versions out of order; this status-snapshot projection tolerates that, whereas consumers requiring strict sequencing need a stronger relay design.

### Atomic persistent projection guard

Run this parameterized statement against the separate read database:

```sql
INSERT INTO order_projection(order_id,status,version)
VALUES ('ORD-101','PAID',2)
ON CONFLICT (order_id) DO UPDATE
SET status=EXCLUDED.status,
    version=EXCLUDED.version,
    updated_at=now()
WHERE order_projection.version < EXCLUDED.version
RETURNING order_id,status,version;
```

**Input/output:** PENDING v1 becomes PAID v2 and returns one row. An older or equal version returns no row and performs no overwrite. If no row is returned, inspect the stored row in the same transaction: equal version plus equal payload is a duplicate; equal version plus differing payload is a conflict requiring investigation. Compare every projected field when the schema grows, not just status.

PostgreSQL coordinates concurrent writers through this single conditional statement. Reading the version first and then running an unconditional UPDATE would reintroduce a race. The [schema](/blog/episodes/014/examples/schema_postgresql.sql) labels which tables belong in each database.

### Consumer transaction and duplicate handling

```java
@KafkaListener(topics="order-events", groupId="my-orders")
public void onEvent(OrderSnapshot event) {
  writer.apply(event); // separate @Transactional("readTx") bean
}
```

Configure `enable.auto.commit=false` and Spring container `AckMode.RECORD`. The database transaction must commit before the listener returns. Let failures propagate; do not swallow them and acknowledge success. Configure bounded retry/backoff and a durable, monitored quarantine policy for poison events. Database commit followed by offset failure causes replay, which the guard handles. A restart loses no in-memory deduplication state because no such state is required.

### Integration testing with real PostgreSQL and Kafka

The repository's Episode 014 integration package uses Java 21, JUnit and Testcontainers. It publishes PAID v2, stale PENDING v1 and duplicate v2 to a real Kafka container, projects them into PostgreSQL using the conditional UPSERT, and checks the stored outcome. Additional database checks cover rollback of order/outbox together, equal-version conflict detection and concurrent stale/new writes. These tests validate the infrastructure contract, not the omitted Spring/provider wiring.

```powershell
mvn -f blogs/episodes/014/integration/pom.xml test
```

Docker must be running and dependencies/images must be available. A passing browser simulation alone is not evidence of database isolation, broker recovery or payment-provider correctness.

## 11. Recovery and observability

A reconciler obtains authoritative order-status snapshots and calls the **same version-guarded projection writer**. It never issues a payment command. Use a durable candidate queue with leases, pagination, retry history and alerts. Find candidates by comparing authoritative versions with projection versions, including missing/historical orders; Kafka lag alone cannot detect an event never published.

```java
for (String orderId : repairs.claimBoundedBatch()) {
  try {
    writer.apply(authority.snapshotForRepair(orderId));
    repairs.markDone(orderId);
  } catch (RuntimeException failure) {
    repairs.retryWithAlert(orderId, failure);
  }
}
```

**Input:** ORD-101 is PAID v2 at the authority and PENDING v1 in history. **Expected:** repair applies v2 once; a subsequent duplicate changes nothing. **Failures:** unavailable authority/read database means retain the candidate and retry. Same-version conflicts require investigation, not a forced overwrite.

| Signal | What an engineer checks |
| --- | --- |
| Oldest pending outbox age / backlog | Publisher failures, broker access, stuck locks |
| Kafka consumer lag and restart/error rate | Backlog, poison records, partition imbalance |
| Authoritative version − read version | Stale or missing projections, even when Kafka lag is zero |
| Reconciliation retries and failures | Unrepaired orders, conflicting snapshots, unavailable dependencies |
| Customer support reports | Payment confirmation vs. actual history freshness |

Set thresholds from product freshness objectives; this lesson invents no production metrics. Keep event ID, order ID, version and trace correlation in authorized logs. Avoid payment credentials and customer PII. Protect history with per-customer authorization, including authoritative fallback reads.

## 12. Trade-offs, limitations and the video

CQRS with separate stores improves flexibility for complex query workloads at the cost of propagation delay, duplication, replay, reconciliation and more infrastructure. Do not add it simply to avoid designing one good transactional database. Version guards provide monotonicity; delivery and repair provide eventual convergence. A permanently stopped publisher or failed reconciliation does not magically become consistent.

An authoritative lookup makes freshness messaging trustworthy but adds a dependency and latency. A signed, scoped confirmation receipt can support read-your-writes messaging without an authority call on every history request. Handle expiry and authorization explicitly.

**Video status:** no narrated MP4 is supplied. The Episode 014 rendering package contains six animated Remotion scenes, a complete natural-English voiceover script, synchronized draft subtitle cues and rendering instructions. The cues are synchronized to the silent scene plan; narration must be recorded, aligned and reviewed before enabling any Watch Video action. The interactive walkthrough is available now. There is no broken video player.

## 13. Interview questions and answers

**Does CQRS require two databases?** No. It separates command and query responsibilities. Separate stores are a design choice that introduces the asynchronous gap demonstrated here.

**Why does PENDING not imply payment failure?** History reads a projection; the authoritative command may already have committed PAID. Verify the existing outcome rather than charging again.

**Does keying by order ID remove the need for versions?** No. It helps partition ordering, but application replay paths and concurrent publishers can reintroduce older business versions.

**Can Kafka exactly-once replace the PostgreSQL guard?** No. A separate PostgreSQL commit and Kafka offset commit still create a replay boundary. External business effects need explicit protection.

**Why is an in-memory set insufficient?** It disappears on restart and cannot coordinate multiple consumer replicas. Persisted conditional writes protect the shared state.

**Can the snapshot rule skip v2 and apply v3?** Only if v3 completely describes the projected state and the domain permits it. Delta processing may require a gap-recovery policy.

## 14. Hands-on exercises

1. Run out-of-order replay in both designs. Predict the final read version. Protected remains PAID v2; unsafe regresses to PENDING v1.
2. Run publisher failure. Explain why Kafka lag can be zero even while history is stale. The event has not reached the broker; inspect pending outbox age.
3. Send equal version 2 with a conflicting PENDING payload. Preserve the stored PAID row, flag the conflict and investigate its source.
4. Kill the consumer after projection commit but before offset commit. Restart and verify no extra projection update or business side effect occurs.
5. Extend the projection with another field. Update payload validation, same-version comparison and integration assertions. If you switch to deltas, design missing-version recovery first.

## 15. Official technical references

- [Apache Kafka design: ordering, delivery semantics and external systems](https://kafka.apache.org/41/design/design/)
- [PostgreSQL INSERT and conditional ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html)
- [Spring Kafka listener containers and offset acknowledgement](https://docs.spring.io/spring-kafka/reference/kafka/receiving-messages/message-listener-container.html)
- [Spring declarative transaction annotations and proxy semantics](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Java 21 language and API documentation](https://docs.oracle.com/en/java/javase/21/docs/api/)
