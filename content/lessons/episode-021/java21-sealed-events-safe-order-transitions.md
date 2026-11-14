---
title: "Java 21 Sealed Events and Records: Making Cancellation and Fulfillment Explicit"
description: "A permissive event handler treats a cancellation or refund event like a paid order and schedules shipment incorrectly."
slug: "java21-sealed-events-safe-order-transitions"
folder: "Java & JVM reliability"
date: "2026-11-14"
tags: ["Java 21","Spring Boot","Kafka","System design"]
cover: "/blog/episodes/021/cover.svg"
coverAlt: "Java 21 Sealed Events and Records: Making Cancellation and Fulfillment Explicit"
draft: false
sample: false
level: "Architecture in Motion · Episode 021"
lab: "/blog/episodes/021/lab.html"
overview: {"problem":"A permissive event handler treats a cancellation or refund event like a paid order and schedules shipment incorrectly.","solution":"Model event variants explicitly, handle sealed types exhaustively when rebuilt, and enforce durable state and fulfillment authorization.","note":"Illustrative system · animated browser lesson; no rendered MP4 supplied"}
---

## Start with the customer

A shopper cancels an order, but a generic event handler starts fulfillment anyway. Explicit event types help express intent; durable state checks must still prevent an invalid dispatch.

**Normal behavior:** The order service records an accepted cancellation, coordinates fulfillment hold and refund as needed, and exposes truthful pending outcomes.

**What protects the customer:** Model event variants explicitly, handle sealed types exhaustively when rebuilt, and enforce durable state and fulfillment authorization.

This is an illustrative engineering incident, not an employer case study or a performance benchmark. The article, comparison lab, and any supplied video explain the same core failure.

## Follow the incident yourself

[Open the interactive lab](#interactive-lab). Choose **Cancellation mistaken for paid event** and predict the outcome before each step. The unsafe and protected paths receive the same situation.

1. **Customer requests cancellation after payment.** A request is not proof that refund or cancellation completed. Check ownership and the current order version. Protected outcome: Records cancellation pending.
2. **CancellationRequested reaches the consumer.** An unsafe catch-all branch treats any recognized payload like a paid event. Explicit handling keeps cancellation separate. Protected outcome: Requests a fulfillment hold.
3. **Dispatch checks the latest authoritative state.** A stale paid event is not permanent shipment permission. Dispatch must atomically check the current business rules. Protected outcome: Blocks dispatch when cancellation wins.
4. **Refund outcome is confirmed separately.** Only a verified provider result establishes refund completion. Already-dispatched parcels need a different workflow. Protected outcome: Displays the actual confirmed outcome.

Then choose **Unknown event variant** to test a different cause or a healthy/control path. Previous revisits the teaching state; Reset starts the experiment again. Autoplay and visual motion have separate pause controls.

## Watch the animated walkthrough

Use Auto-play in the interactive lab to follow the failure and recovery, or advance one event at a time. A narrated video is not available for this episode.

**Architecture in Motion | Java 21 records, sealed interfaces, exhaustive pattern matching**

## The customer-facing failure
A shopper cancels an order after payment. The customer account says **Refund requested**, but an asynchronous fulfillment handler interprets a loosely typed status payload as an ordinary paid order and dispatches the parcel. Support must investigate a refund and shipment for the same purchase. This is a constructed engineering scenario, not a report of a specific production incident.

## Why this happens
Many services represent order state as `String status`, `Map<String,Object> payload`, or an enum with a large `default` branch. New states can be silently accepted by older consumers; nullable fields permit invalid combinations such as `REFUNDED` with a shipment authorization. Serialization boundaries can also bypass domain invariants unless inputs are validated.

## Design principle
Make invalid *in-memory* states harder to construct. Model **events** as a sealed interface and records, use exhaustive Java 21 switch pattern matching to force explicit handling, and keep persistence transitions guarded by transactional checks. A type-safe model does **not** provide exactly-once delivery, distributed atomicity, or authorization on its own.

## Architecture path
1. Customer sends cancel request to authenticated Order API with stable idempotency key.
2. Order service loads current state and checks order ownership and transition preconditions.
3. PostgreSQL conditional update advances `version` only if expected status/version match; transaction writes outbox event.
4. Outbox relay publishes the typed event envelope to Kafka (at-least-once).
5. Fulfillment consumer validates schema/version, deduplicates by event ID, and switches exhaustively on event type.
6. Refund consumer requests payment refund with provider idempotency key; webhook/reconciliation resolves unknown outcomes.
7. UI shows a truthful `Cancellation pending` state until both fulfillment hold and refund outcomes are known.

## Why Java 21?
A `record` generates final fields, accessors, constructor, equality and `toString`, ideal for small immutable transport values. A `sealed interface` restricts permitted implementations. A pattern-matching `switch` over the sealed hierarchy can be exhaustive without a default; adding a new permitted event then forces consumers to revisit their switch at compile time **when rebuilt against the new type**. Records are shallowly immutable: mutable nested lists/maps must be defensively copied.

## Example (Java 21)
See the supplied OrderEvents.java example for a runnable demonstration. Its compact constructors validate nonblank order IDs, nonnegative amounts, and immutable copies of item lists. The event handler returns explicit effects for paid, cancellation requested, refunded and shipped events. A new event subtype requires the handler switch to be updated.

## Durable data and concurrency
See the supplied postgresql.sql example. The conditional update uses `WHERE id = ? AND status = 'PAID' AND version = ?`, and a transactional outbox row is inserted in the **same transaction** only when one row changes. Concurrent cancellation and shipment authorization cannot both win the same expected version. If shipment already started, cancellation requires a different business workflow; never label a refund complete before confirmation.

## Failure modes and recovery
- **Duplicate Kafka events:** unique `(consumer_name,event_id)` inbox key; ack only after DB commit.
- **Out-of-order events:** enforce aggregate version and business transition rules; buffer/retry missing versions rather than applying stale updates.
- **Producer crash after commit:** outbox relay retries; downstream deduplicates.
- **Refund timeout:** status becomes `REFUND_PENDING`; reconcile via provider reference; never blindly retry with a new key.
- **Unknown JSON subtype:** reject or quarantine with alerting; do not map it to a permissive default.
- **PII leakage:** log order/event IDs, not card details or addresses; enforce ownership and webhook signatures.

## Trade-offs
Records simplify value modeling but do not replace JPA entities; use persistence models separately. Sealed hierarchies improve compile-time completeness in a coordinated codebase but can complicate cross-team schema evolution. A strict consumer must support versioned wire schemas and rolling deployments. An exhaustive switch is a *local* compile-time guarantee, not a distributed compatibility guarantee.

## Scaling, performance and validation
Kafka partitions by `orderId` to improve per-order ordering, but retries and replay still require version guards. Keep DB transactions short; bound consumer concurrency and use DLQ with investigation, not automatic infinite replay. Track duplicate event rate, transition conflicts, pending refunds, outbox age, consumer lag, checkout p95/p99 and customer support contacts. Run fault-injection tests: duplicate event, reverse delivery, concurrent cancel/ship, provider timeout and process crash. No performance benchmarks were executed for this episode.

## Common pitfalls
Using `default -> ignore` hides newly introduced event types. A `record` containing a mutable `List` is not deeply immutable without `List.copyOf`. Do not deserialize arbitrary untrusted `@class` fields. Java exhaustiveness does not validate event signatures or payment ownership. A sealed model cannot prevent a stale binary consumer from receiving an unknown wire event.

## Interview Q&A
**Q: Why use sealed types instead of an enum?** A: Each subtype can carry distinct validated data, while a sealed switch checks every permitted variant.
**Q: Are Java records immutable?** A: Their fields are final, but referenced objects can still mutate; copy mutable collections.
**Q: Does exhaustive pattern matching solve event ordering?** A: No. Use aggregate versions, partition keys and state-transition guards.
**Q: How do you deploy a new event variant safely?** A: Version schemas, expand consumers first, use compatibility tests, then publish new events.
**Q: How do you prevent a cancelled order from shipping?** A: Atomic transition/fulfillment authorization, version checks and compensating workflow for already dispatched parcels.

## Hands-on exercises
1. Add validation rejecting blank payment references.
2. Add `ReturnRequested` as a permitted subtype and update the exhaustive switch. Observe compilation failure before updating the switch.
3. Simulate two concurrent transitions from `PAID` with the same expected version; show only one conditional update succeeds.

## Key takeaway
**Model business possibilities explicitly, and enforce business transitions durably.** Java 21 improves correctness at compile time; PostgreSQL and idempotent consumers preserve correctness across failures.

## Teaching source files

- [postgresql.sql](/blog/episodes/021/examples/postgresql.sql)
- [OrderEvents.java](/blog/episodes/021/examples/OrderEvents.java)

These are supplied teaching examples, not a complete deployable checkout service. They have not been executed as JVM or database tests in this integration. Read their dependencies and limits before running them in an isolated environment.

## Primary references used for this lesson

- [Reference 1](https://docs.oracle.com/en/java/javase/21/language/pattern-matching-switch.html)
- [Reference 2](https://docs.oracle.com/en/java/javase/21/language/records.html)
