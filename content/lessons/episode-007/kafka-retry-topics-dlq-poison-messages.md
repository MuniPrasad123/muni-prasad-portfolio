---
title: "Kafka Retry Topics and Dead-Letter Queues: Handling Poison Messages in Spring Boot"
slug: "kafka-retry-topics-dlq-poison-messages"
folder: "Kafka & distributed workflows"
date: "2026-11-03"
description: "One poison event can delay healthy orders. Learn bounded retries, dead-letter triage, idempotent processing and the ordering trade-off with an interactive Kafka failure lab."
tags: ["Java 21", "Spring Boot", "Kafka", "PostgreSQL", "Distributed systems", "E-commerce"]
cover: "/blog/kafka-retries/cover.svg"
coverAlt: "Kafka main-topic events route through bounded retries or dead-letter triage."
draft: false
sample: false
level: "Architecture in Motion · Episode 007"
simulation: "kafka-retries"
video: "/blog/kafka-retries/lesson.mp4"
videoPoster: "/blog/kafka-retries/poster.png"
videoCaption: "Supplied narrated architecture lesson · conceptual scenario"
---


**Java 21 · Spring Boot · Apache Kafka · PostgreSQL · Event-driven e-commerce**  


**Series:** Architecture in Motion / Production Engineering Patterns

> A failed Kafka message is not always a reason to retry. A shipping provider returning HTTP 503 might recover in seconds. A permanently invalid order address will not repair itself after ten retries. Treating both failures the same way turns one bad event into a backlog, duplicate side effects, and an operational incident.

## 1. The business problem: checkout succeeds, fulfillment stops

At 7:00 PM, a retailer starts a flash sale. Checkout accepts orders and publishes `OrderPlaced` events to Kafka. The fulfillment consumer enriches the order with a carrier shipping label. One event, `evt-1042`, has an invalid destination postal code. The carrier responds `400 INVALID_ADDRESS`.

The consumer throws an exception. If it keeps retrying the same record with long blocking sleeps, the partition makes no progress. Subsequent healthy orders sharing that partition wait behind the poison record. If someone instead commits the offset before recovery, the bad event can disappear from processing without a remediation trail. And if a retry succeeds after a database write but before the offset commit, the same business event may be processed again.

**Incident symptoms:** growing consumer lag; order states stuck at `PLACED`; repeated `400` logs; healthy orders delayed; noisy alerting; and, if side effects are not idempotent, duplicate shipping labels or notifications.

### The first principle

A *poison message* is a record that consistently fails processing under the current consumer code, data, or schema. A *transient failure* is a condition likely to resolve without changing the record, such as a temporary downstream `503` or network timeout. Your retry policy must distinguish them.

## 2. How Kafka offsets and ordering actually work

Kafka stores ordered records **within a partition**, not across an entire topic. A consumer group assigns each partition to one member at a time. A consumer's current fetch position is different from its **committed offset**, which is the restart point. Committing only after business processing or reliable recovery supports at-least-once processing, but a crash between the business effect and offset commit can cause redelivery.

![Illustrative Kafka retry routing: main topic, bounded retry topics, and dead-letter triage.](/blog/kafka-retries/cover.svg)

The retry delay labels illustrate the configured backoff schedule; actual delivery timing depends on consumer scheduling and load. **A retry topic is not a global exactly-once guarantee.**

## 3. Why naive retry loops fail

**Naive approach:**

```java
@KafkaListener(topics = "orders.events", groupId = "fulfillment-v1")
void onOrder(OrderPlaced event) throws InterruptedException {
    while (true) {
        try {
            carrier.createLabel(event);
            return;
        } catch (Exception ignored) {
            Thread.sleep(10_000); // BAD: no classification or bounded budget
        }
    }
}
```

This can hold a consumer thread indefinitely, cause partition lag, repeat non-retryable errors, and fail to respect shutdown or rebalancing. If the loop exceeds `max.poll.interval.ms`, group membership can change. Catching every exception also hides malformed messages and programming defects.

**Never** treat a DLQ as a trash can: it is a durable quarantine with ownership, alerting, retention, and a replay policy.

## 4. A better decision tree: classify before retrying

| Failure | Classification | Recommended action |
|---|---|---|
| Carrier returns `503` | Transient | Retry with exponential backoff, bounded attempts |
| Carrier times out | Transient, outcome possibly unknown | Reconcile or use carrier idempotency before retry |
| Address fails schema/business validation | Permanent for current payload | Send directly to DLT; fix data or mapping |
| Unknown JSON version / incompatible schema | Permanent until consumer/schema fix | DLT with original payload and schema metadata |
| PostgreSQL temporarily unavailable | Transient | Bounded retries, backpressure, alarms |
| Unauthorized downstream API `401` | Usually configuration/security failure | Alert and fix credentials; avoid blind retry storm |

**Important:** HTTP codes alone do not always determine retryability. Some `429` responses are retryable with `Retry-After`; a `409` may be an idempotency success or a business conflict. Classify using the provider's contract.

## 5. Spring Boot implementation: non-blocking retries and a DLT

This example targets the **Spring Boot 3.x / Spring for Apache Kafka 3.x API style**, with Java 21. It is a reference implementation, not a claim of live broker testing. Keep your producer/consumer serializers, topic creation, security, and exact Spring versions aligned in your application.

```java
@Component
public class FulfillmentListener {
    private final FulfillmentService fulfillment;
    private final DltAuditService dltAudit;

    public FulfillmentListener(FulfillmentService fulfillment, DltAuditService dltAudit) {
        this.fulfillment = fulfillment;
        this.dltAudit = dltAudit;
    }

    @RetryableTopic(
        attempts = "4", // one original delivery + up to three retries
        backOff = @BackOff(delay = 1_000, multiplier = 2.0, maxDelay = 4_000),
        include = TransientCarrierException.class,
        autoCreateTopics = "false",
        kafkaTemplate = "kafkaTemplate")
    @KafkaListener(topics = "orders.events", groupId = "fulfillment-v1")
    public void onOrder(OrderPlaced event) {
        fulfillment.applyIdempotently(event);
    }

    @DltHandler
    public void onDeadLetter(OrderPlaced event) {
        // Persist the event ID and a reference for human triage.
        // Throw if the audit write fails: never silently lose a DLT record.
        dltAudit.recordForReview(event);
    }
}
```

The annotation creates listener infrastructure for retry topics and the dead-letter topic. With `autoCreateTopics = "false"`, **provision all required topics in advance** (or use KafkaAdmin and reviewed NewTopic definitions). The retry infrastructure must have a correctly configured KafkaTemplate. A `@DltHandler` is not a replacement for alerts and replay controls.

**Why four attempts?** It means one original attempt plus three retries; it does **not** mean four retries. The exponential backoff here is approximately 1s, 2s, and 4s. Spring Kafka documents that the initial attempt counts toward the configured total.

### Data model and domain exceptions

```java
public record OrderPlaced(
    UUID eventId,
    String orderId,
    long orderVersion,
    String postalCode,
    Instant occurredAt
) {}

public final class TransientCarrierException extends RuntimeException {
    public TransientCarrierException(String message, Throwable cause) {
        super(message, cause);
    }
}

public final class InvalidOrderEventException extends RuntimeException {
    public InvalidOrderEventException(String message) { super(message); }
}
```

Permanent exceptions are excluded from retry by the `include` filter and routed to the DLT. For invalid bytes that cannot be deserialized into `OrderPlaced`, configure Spring Kafka's **ErrorHandlingDeserializer** and a DLT publisher able to serialize both normal objects and raw `byte[]`; otherwise malformed input may fail before your listener is called.

## 6. The second problem: retries can duplicate business effects

Suppose the consumer inserts a fulfillment row and then crashes before committing its Kafka offset. Kafka can deliver the same event again. The retry must not create another label, charge, or shipment.

**PostgreSQL table:**

```sql
CREATE TABLE processed_event (
    consumer_name TEXT NOT NULL,
    event_id UUID NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (consumer_name, event_id)
);

CREATE TABLE fulfillment (
    order_id TEXT PRIMARY KEY,
    order_version BIGINT NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Transaction boundary:** within one database transaction, insert the `(consumer_name, event_id)` idempotency marker using `ON CONFLICT DO NOTHING`, check whether the row was inserted, then apply the local fulfillment update. If the transaction rolls back, the marker rolls back too. Do **not** mark an event processed before its database effect succeeds.

```java
@Transactional
public void applyIdempotently(OrderPlaced e) {
    int firstDelivery = jdbc.update("""
        INSERT INTO processed_event (consumer_name, event_id)
        VALUES (?, ?) ON CONFLICT DO NOTHING
        """, "fulfillment-v1", e.eventId());
    if (firstDelivery == 0) return; // previously committed

    if (e.orderVersion() <= 0 || e.postalCode() == null || e.postalCode().isBlank()) {
        throw new InvalidOrderEventException("Invalid order event");
    }

    int changed = jdbc.update("""
        INSERT INTO fulfillment(order_id, order_version, status)
        VALUES (?, ?, 'READY_FOR_SHIPPING')
        ON CONFLICT (order_id) DO UPDATE
        SET order_version = EXCLUDED.order_version,
            status = EXCLUDED.status,
            updated_at = now()
        WHERE fulfillment.order_version < EXCLUDED.order_version
        """, e.orderId(), e.orderVersion());
    // The version guard prevents a late old event overwriting a newer snapshot.
}
```

The `processed_event` marker and fulfillment row share the same database transaction. For **external carrier calls**, the database transaction cannot atomically include the provider. Use a durable outbound command/outbox and a provider-supported idempotency key, then reconcile ambiguous responses. Do not hold a database transaction open across a slow network call.

### When ordering is mandatory

**Critical trade-off:** Spring Kafka's non-blocking retry topics can let `OrderUpdated(v2)` complete before a delayed `OrderCreated(v1)`. Kafka preserves the original partition order, but moving failed records into retry topics changes when side effects occur. If the business workflow requires strict per-order state transitions, choose in-partition blocking retry with a bounded error handler, an ordered per-key work queue, or explicit sequencing and gap detection. A version check alone may avoid regression, but cannot reconstruct every missing intermediate business transition.

## 7. Blocking vs non-blocking retries: choose intentionally

| Design | Healthy records behind failure | Ordering | Operational cost |
|---|---|---|---|
| Blocking retry (same partition) | Wait until success/recovery | Maintained for that partition | Partition stalls; retry delay affects throughput |
| Non-blocking retry topics | Main topic can advance | Cross-topic side-effect order **not guaranteed** | More topics/consumers, headers, retry routing |
| Immediate DLT for permanent error | Main topic can advance after durable recovery | Business needs a reconciliation policy | Manual triage, replay tooling |

For independent notifications, non-blocking retries often improve availability. For payment capture or order-state transitions, stronger ordering and idempotency requirements may justify partition blocking or orchestration.

## 8. What happens when the DLT itself fails?

A DLT publish can fail because of broker unavailability, ACLs, wrong serialization, partition configuration, or message size. A production consumer must not acknowledge the original record as recovered until its dead-letter publish is confirmed according to the configured error handler's guarantees. Test this failure path explicitly. DLT consumers should also persist triage metadata durably; if that persistence fails, throw and allow redelivery rather than silently swallowing the record.

**Operational DLT envelope:** `eventId`, `orderId` (if safe), source topic/partition/offset, event schema version, error category, first/last failure timestamps, retry count, trace ID, payload reference, and remediation state. Minimize PII, encrypt data in transit/at rest, and restrict DLT access.

## 9. Scaling, performance, resilience and security

- **Partitioning:** key by `orderId` when per-order affinity matters; monitor skew from hot orders and large customers. Increasing partitions changes key-to-partition assignment for new records.
- **Backoff:** exponential backoff with jitter reduces synchronized retry storms; enforce a maximum attempt budget and a total age/TTL policy.
- **Lag metrics:** track `records-lag-max`, oldest unprocessed event age, retry-topic depth, DLT ingress rate, DLT unresolved age, replay success/failure, and end-to-end fulfillment latency.
- **Capacity:** retries consume broker bandwidth and consumer CPU. A downstream outage can make retry traffic larger than fresh traffic; bound concurrency and apply backpressure.
- **Schema:** version contracts; use schema compatibility checks in CI and test deserialization failures, not only listener exceptions.
- **Security:** Kafka TLS/SASL, least-privilege ACLs per topic, secret rotation, audit logs, PII redaction and restricted replay permissions.
- **Failure injection:** test `503`, malformed JSON, timeout after a successful external side effect, rebalance during processing, DLT broker failure, and duplicate event IDs.
- **Replay safety:** fix root cause, use a controlled replay ID or traceable source reference, throttle, preserve original event identity for deduplication, and audit every action. A fixed schema/consumer may need a deliberate deduplication migration strategy if the old event was marked processed.

### Design review checklist

1. Does the exception taxonomy distinguish permanent from transient errors?
2. Is the retry budget finite, observable, and appropriate for the downstream SLO?
3. Can a late retry reorder state changes? If yes, what enforces business sequencing?
4. Are database writes idempotent? Are external side effects idempotent or reconciled?
5. Is DLT publication confirmed before a source offset is considered recovered?
6. Can operators inspect, fix, and replay records safely without exposing PII?

## 10. Interactive lab: simulate a poison message

The companion HTML simulator lets readers choose **blocking or non-blocking** retry, a transient or permanent failure, and a retry budget. Step through three events keyed to the same order and watch a healthy event either wait behind a poison record or overtake it in a retry topic. The simulation models state transitions; it does **not** connect to a Kafka broker and is **not** a benchmark.

**Suggested visuals:** (1) split-screen blocked vs advancing partition; (2) animated `orders.events → retry-1s → retry-2s → retry-4s → DLT`; (3) event-version race with red out-of-order warning; (4) a DBA/operations DLT triage panel; (5) database uniqueness shield intercepting a duplicate event.

## 11. Three hands-on exercises

**Beginner — classify failures.** Given `503`, invalid postal code, and deserialization error, assign each to transient or permanent and justify whether it belongs in retry or DLT.

**Intermediate — change the retry budget.** Configure `attempts = "3"`, initial delay 2 seconds and multiplier 2. Explain the total number of deliveries and approximate delays. **Answer:** 1 original + 2 retries, approximately 2s and 4s, before DLT if all fail.

**Advanced — preserve business ordering.** An `OrderPaid(v2)` event succeeds while `OrderCreated(v1)` waits in a retry topic. Design a per-order sequencing mechanism that does not silently discard required intermediate state changes. Consider partition blocking, pending-version storage, a gap timeout, and replay after recovery.

## 12. Senior engineer interview Q&A

**Q1. Does a DLT guarantee zero message loss?** No. Correct producer acknowledgments, offset/recovery configuration, broker durability, retention, and DLT publish failure handling still matter.

**Q2. Is `@RetryableTopic` always better than blocking retry?** No. It improves main-topic progress at the cost of ordering across retry topics. Choose based on event semantics.

**Q3. Does Kafka exactly-once processing protect a third-party shipping API?** No. Kafka transactions can coordinate Kafka reads/writes, but external side effects require provider idempotency and reconciliation.

**Q4. Why not retry every `400`?** Deterministic invalid input is unlikely to become valid merely by waiting. Classify, quarantine, correct, and replay.

**Q5. What if a consumer crashes after inserting a fulfillment row but before committing its offset?** The event can redeliver. A unique processed-event marker in the same DB transaction prevents a duplicate local effect.

**Q6. What metric catches a stuck pipeline fastest?** Consumer lag is useful but not sufficient; combine it with oldest-event age, per-order SLO, retry counts, DLT ingress and unresolved DLT age.

## 13. Key takeaway

**Retry is a recovery strategy, not an infinite loop.** Classify the failure, bound the attempts, quarantine irrecoverable events, design for at-least-once delivery, protect external side effects, and choose whether business ordering or main-topic progress is more important.

---

### References and verification notes

- [Spring Kafka: How the Pattern Works](https://docs.spring.io/spring-kafka/reference/retrytopic/how-the-pattern-works.html) — retry topic routing and ordering warning.
- [Spring Kafka: Retry Configuration](https://docs.spring.io/spring-kafka/reference/retrytopic/retry-config.html) — `@RetryableTopic` and `@DltHandler`.
- [Spring Kafka: Retry Features](https://docs.spring.io/spring-kafka/reference/retrytopic/features.html) — attempts, backoff and exception classification.
- [Spring Kafka: Handling Exceptions](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html) — DLT recovery and deserialization considerations.
- [Apache Kafka Design](https://kafka.apache.org/documentation/#semantics) — delivery semantics and offset behavior.

**Evidence labels:** Architecture examples are reference designs. All traffic counts and animated counters are illustrative; no throughput or latency numbers are presented as measured benchmarks. Java source and SQL require a configured broker/database to run; no live Kafka/PostgreSQL integration test is claimed.
