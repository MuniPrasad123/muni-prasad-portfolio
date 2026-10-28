---
title: "The Order Was Saved. Why Did Kafka Never Hear About It?"
description: "Checkout succeeds, but fulfilment and confirmation never start. Explore the dual-write gap, then recover delivery with a transactional outbox and idempotent consumers."
slug: "transactional-outbox-kafka-spring-boot"
date: "2026-10-27"
tags: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Distributed systems", "E-commerce"]
cover: "/blog/outbox/cover.svg"
coverAlt: "PostgreSQL commits order and outbox together; CDC relays to Kafka and independent consumers."
draft: false
sample: false
level: "Architecture in Motion · Episode 002"
simulation: "outbox"
video: "/blog/outbox/lesson.mp4"
videoPoster: "/blog/outbox/poster.png"
videoCaption: "74-second animated lesson · English synthetic narration"
videoCaptions: "/blog/outbox/captions.vtt"
---


**Architecture in Motion · Episode 002 · October 27, 2026**

> Your checkout API returned **200 OK**. PostgreSQL contains the order. But the customer never received confirmation, the order management system never started fulfillment, and analytics never counted the purchase. How can all four statements be true?

**Watch the 74-second narrated animation above**, then run the failure simulation below. This is a hypothetical production-style incident, not a report of an actual customer outage.

## The real-world problem: a flash-sale order disappears downstream

Imagine an e-commerce store processing order **#1042** during a flash sale. The checkout service saves the order and publishes an `OrderPlaced` event. Three independent services should react: an **OMS** creates a fulfillment task, an **email** service sends confirmation, and **analytics** records the conversion.

A fragile implementation might use this illustrative snippet. The save and send calls are separate operations; the Kafka send is asynchronous:

```java
@Transactional
public UUID placeOrder(CheckoutRequest request) {
    UUID orderId = orderRepository.save(request).getId();
    kafkaTemplate.send("orders.placed", orderId.toString(), "OrderPlaced");
    return orderId;
}
```

**Failure window:** the method initiates an asynchronous send, then the database transaction commits when the proxied method returns. If Kafka publication later fails and there is no durable retry, the order exists without an event. A different implementation that commits first and sends afterward also has a crash gap. Depending on call timing and error handling, the order can exist without a downstream event. The reverse ordering—publishing before database commit—can produce a **phantom event** if the database transaction later rolls back. `@Transactional` alone does not make PostgreSQL and Kafka one atomic resource.

### Business impact

A missing event can mean an order waits unfulfilled, a customer never receives confirmation, or a business dashboard undercounts revenue. A retry of the HTTP checkout request can introduce a second order unless the checkout API also uses an **idempotency key**. These are separate failure problems that require separate safeguards.

## Architecture: transactional outbox + change data capture

Instead of publishing from the request thread, write the order **and a description of the event** in the **same PostgreSQL transaction**. A change-data-capture (CDC) relay publishes committed outbox inserts to Kafka later.

![Simplified outbox architecture: PostgreSQL order and event commit together, then CDC relays to Kafka and separate consumers.](/blog/outbox/cover.svg)

**Atomicity boundary:** `orders` and `outbox_event` commit together in one database. **Delivery boundary:** Debezium and Kafka operate asynchronously and can retry. **Side-effect boundary:** email, payment, and other external APIs require their own idempotency and reconciliation plans.

## Step 1 — Create the tables

The following schema is simplified for teaching, but the outbox column names follow Debezium's default outbox event-router conventions.

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    status VARCHAR(24) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL
);

CREATE TABLE outbox_event (
    id UUID PRIMARY KEY,                 -- unique event ID
    aggregatetype VARCHAR(255) NOT NULL, -- topic routing: orders
    aggregateid VARCHAR(255) NOT NULL,   -- Kafka key: order ID
    type VARCHAR(255) NOT NULL,          -- OrderPlaced
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Keep the outbox **append-only** for Debezium's default event-router transform. Avoid in-place status updates on outbox records in the CDC path. Plan retention and cleanup separately, after confirming connector progress and replay requirements.

## Step 2 — Write order + event in one Spring transaction

The Java snippets omit imports and application configuration. They assume Spring-managed beans, a configured JdbcTemplate transaction manager, and external calls through the transactional proxy; they are teaching excerpts, not a complete application.

```java
@Service
public class CheckoutService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public CheckoutService(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    @Transactional
    public UUID placeOrder(UUID customerId, BigDecimal total) {
        UUID orderId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();

        jdbc.update("""
            INSERT INTO orders(id, customer_id, status, total_amount)
            VALUES (?, ?, 'PLACED', ?)
            """, orderId, customerId, total);

        String json = mapper.valueToTree(Map.of(
            "orderId", orderId.toString(),
            "customerId", customerId.toString(),
            "total", total
        )).toString();

        jdbc.update("""
            INSERT INTO outbox_event(id, aggregatetype, aggregateid, type, payload)
            VALUES (?, 'orders', ?, 'OrderPlaced', CAST(? AS jsonb))
            """, eventId, orderId.toString(), json);

        return orderId;
    }
}
```

**Why this works:** if either SQL statement fails, the database transaction rolls back both writes. If Kafka is offline after commit, the outbox event remains durable in PostgreSQL until the relay catches up (subject to healthy database durability, CDC configuration, and log retention). No network call to Kafka is required inside checkout's database transaction.

**Production refinement:** persist a unique checkout idempotency key so HTTP retries cannot create duplicate orders. Include event schema version, correlation ID, trace ID, and only the customer data needed by consumers. For a real payment workflow, coordinate payment authorization, order state transitions, and compensating actions explicitly; the outbox alone is not a distributed transaction manager.

## Step 3 — Publish with Debezium CDC

Debezium tails committed changes from PostgreSQL's write-ahead log and its **Outbox Event Router** transforms the insert into a Kafka record. An illustrative connector configuration excerpt:

```json
{
  "table.include.list": "public.outbox_event",
  "transforms": "outbox",
  "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
  "transforms.outbox.route.topic.replacement": "outbox.event.${routedByValue}"
}
```

This is **not** a complete runnable connector configuration: a real deployment also needs the PostgreSQL connector class, replication slot/publication settings, credentials, broker endpoints, converter settings, and operational security. With the default mapping, `aggregatetype=orders` routes to `outbox.event.orders`, `aggregateid` becomes the Kafka key, and `id` becomes the event ID header. Using **order ID as the Kafka key** keeps events for that order together in a partition, supporting per-order ordering; it does not create a global order across partitions.

## Step 4 — Make every consumer idempotent

At-least-once delivery means the same event can arrive more than once. For the OMS, insert an event ID into a unique **processed-events** table and create the fulfillment job **in one local transaction**.

```sql
-- In the OMS database, not necessarily the checkout database
CREATE TABLE processed_events (
    consumer_name VARCHAR(80) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (consumer_name, event_id)
);

CREATE TABLE fulfillment_jobs (
    order_id UUID PRIMARY KEY,
    status VARCHAR(20) NOT NULL
);
```

```java
@Service
public class OmsEventHandler {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public OmsEventHandler(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    @Transactional(rollbackFor = Exception.class)
    public void apply(String eventId, String payload) throws JsonProcessingException {
        UUID orderId = UUID.fromString(
            mapper.readTree(payload).path("orderId").asText());

        int firstDelivery = jdbc.update("""
            INSERT INTO processed_events(consumer_name, event_id)
            VALUES ('oms-service', ?)
            ON CONFLICT DO NOTHING
            """, eventId);
        if (firstDelivery == 0) return; // already processed

        jdbc.update("""
            INSERT INTO fulfillment_jobs(order_id, status)
            VALUES (?, 'PENDING')
            ON CONFLICT (order_id) DO NOTHING
            """, orderId);
    }
}
```

Your `@KafkaListener` reads the outbox event ID from the `id` Kafka header and delegates to this **separate Spring bean**. Configure offset acknowledgement, retries, and dead-letter handling so a failed transaction does **not** advance the consumer offset as if processing succeeded. An inbox row and business write must use the same local database transaction. For external email sends, a database-only dedup table does **not** guarantee the provider did not send twice if a crash occurs between the provider call and recording success; use provider-supported idempotency, an email delivery state machine, and reconciliation.

## Try it: interactive failure simulation

In the interactive lab above, run the five scenarios: **Naive dual-write crash**, **Outbox while Kafka is down**, **Restore Kafka**, **Replay the same event**, and **Database rollback** (or **Reset** to start over). Observe order rows, outbox rows, Kafka events, and consumer effects. The numbers are deterministic **illustrations**, not live Kafka traffic or performance measurements.

| Scenario | Order row | Outbox row | Kafka event | OMS action | Meaning |
|---|---:|---:|---:|---:|---|
| Naive dual-write, crash before send | 1 | 0 | 0 | 0 | Committed order, lost event |
| Outbox committed, Kafka offline | 1 | 1 | 0 | 0 | Durable event waits for relay |
| Kafka restored and relay catches up | 1 | 1 | 1 | 1 | Event delivered and processed |
| Same event replayed | 1 | 1 | 2 deliveries | 1 | OMS dedup prevents a second job |
| DB transaction fails | 0 | 0 | 0 | 0 | Both writes roll back |

## Architecture trade-offs and failure checklist

**What you gain:** atomic order/event intent, asynchronous fan-out, isolation from temporary Kafka outages, and the ability to replay consumers safely when they are idempotent.

**What you pay for:** additional database writes, CDC infrastructure, connector lag, WAL/replication-slot management, event schema evolution, monitoring, deduplication state, and eventually outbox cleanup. For a small system, a carefully implemented polling outbox relay can be simpler than deploying CDC, but it must coordinate workers and handle the crash-after-publish-before-marking-sent window; duplicates are still possible.

**Operational checks:** monitor connector source offsets, end-to-end event age, and consumer lag. In this append-only CDC design, a retained row is not proof that an event is unpublished; correlate relay progress rather than assuming a sent-status column exists. alert on stalled replication slots and WAL growth; ensure Kafka ACLs and TLS; avoid putting card data or unnecessary PII in events; add consumer retry limits and DLQ handling; keep event IDs stable across retries; test DB rollback, broker downtime, connector restarts, and duplicate delivery. Kafka's exactly-once processing features have a defined scope; they do not automatically make arbitrary external effects exactly-once.

## Interview question: why not just use Kafka transactions?

**Question:** "Our producer enables Kafka transactions. Do we still need an outbox?"

**Architect answer:** Kafka transactions help atomically coordinate Kafka records and offsets within Kafka's processing model. They do **not** automatically make an ordinary PostgreSQL order commit and a Kafka publication one atomic transaction. If the order database is the source of truth, a transactional outbox closes that **database-to-event dual-write gap**. Consumers must still be idempotent, especially when they call external systems.

## Primary references

- [Debezium — Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html)
- [Spring Framework — Rolling Back a Declarative Transaction](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html)
- [Confluent — Kafka Message Delivery Guarantees](https://docs.confluent.io/kafka/design/delivery-semantics.html)

*The scenario, order IDs, event IDs, and simulation outcomes are illustrative. No production incident or benchmark is claimed.*

## Video transcript


**Voice:** English, synthetic narration (eSpeak). **Duration:** 74.0 seconds.

## 1. THE MISSING EVENT (0.0s)

Checkout succeeded. The order is in Postgres. But Kafka never received its event. How can that happen?

## 2. THE DUAL-WRITE GAP (8.0s)

Saving an order and publishing to Kafka are separate operations. A crash between them can lose the notification.

## 3. ONE ATOMIC COMMIT (16.0s)

Use the transactional outbox. Insert the order and its event in one database transaction. Both commit, or both roll back.

## 4. CHANGE DATA CAPTURE (25.0s)

Debezium reads the committed outbox insert from the database change log and publishes it to Kafka, keyed by order ID.

## 5. THREE CONSUMER GROUPS (33.2s)

Three independent consumer groups react: order management, customer notifications, and business analytics. A broker outage delays delivery.

## 6. RETRIES ARE NORMAL (43.2s)

Retries may deliver the event again. Consumers deduplicate using the event ID, and commit business updates with the deduplication record.

## 7. EXTERNAL SIDE EFFECTS (52.6s)

External email is another boundary. Use provider idempotency when available, plus retries and reconciliation. Never promise universal exactly once.

## 8. DESIGN FOR FAILURE (63.2s)

Monitor connector lag, protect customer data, test outages, and alert on failures. Reliable commerce is designed for crashes, not perfect networks.


