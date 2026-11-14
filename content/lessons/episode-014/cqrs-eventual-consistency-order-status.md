---
title: "CQRS and Eventual Consistency: Explaining Delayed Order Status After Payment"
description: "Checkout confirms payment, but My Orders still shows an older status because its separate read database has not caught up."
slug: "cqrs-eventual-consistency-order-status"
folder: "Kafka & distributed workflows"
date: "2026-11-14"
tags: ["Java","Spring Boot","Kafka","PostgreSQL","Distributed systems"]
cover: "/blog/episodes/014/cover.svg"
coverAlt: "CQRS and Eventual Consistency: Explaining Delayed Order Status After Payment"
draft: false
sample: false
level: "Architecture in Motion · Episode 014"
lab: "/blog/episodes/014/lab.html"
overview: {"problem":"Checkout confirms payment, but My Orders still shows an older status because its separate read database has not caught up.","solution":"Commit state and outbox together, display synchronization clearly, and apply versioned snapshots without regressing.","note":"Illustrative system · animated browser lesson; no rendered MP4 supplied"}
---

## Start with the customer

Checkout confirms the purchase, but My Orders still says Payment pending. The payment succeeded; the separate order-history view has not caught up yet.

**Normal behavior:** Checkout reads its confirmed command result. A background consumer then updates the separate My Orders read model; it is not a second payment attempt.

**What protects the customer:** Commit state and outbox together, display synchronization clearly, and apply versioned snapshots without regressing.

This is an illustrative engineering incident, not an employer case study or a performance benchmark. The article, comparison lab, and any supplied video explain the same core failure.

## Follow the incident yourself

[Open the interactive lab](#interactive-lab). Choose **Lag, recovery, and stale replay** and predict the outcome before each step. The unsafe and protected paths receive the same situation.

1. **PAID v2 commits in the order service.** Payment success and the command result are already known. The projection still has a full PENDING v1 snapshot. Protected outcome: Confirmed checkout; syncing account.
2. **The relay or consumer is delayed.** An outbox retains event intent across process failures. Lag must be monitored; eventual consistency is not a promise of instant delivery. Protected outcome: No new payment request.
3. **The PAID v2 snapshot reaches the read model.** This lesson uses complete status snapshots. A newer snapshot can replace an older snapshot; delta events with missing versions require a different reconciliation policy. Protected outcome: My Orders becomes Paid.
4. **PENDING v1 is replayed late.** The update must compare stored and incoming versions atomically. Identical versions with conflicting contents need investigation. Protected outcome: Older snapshot ignored.

Then choose **Normal propagation** to test a different cause or a healthy/control path. Previous revisits the teaching state; Reset starts the experiment again. Autoplay and visual motion have separate pause controls.

## Watch the animated walkthrough

Use Auto-play in the interactive lab to follow the failure and recovery, or advance one event at a time. A narrated video is not available for this episode.


## Request path and root cause

Checkout payment authorization → Order command + PostgreSQL transaction → Transactional outbox → Kafka order-events topic → Idempotent version-aware projection consumer → My Orders read model + freshness indicator

The payment write transaction succeeds, but a separate read-model projection lags or loses an event. A naive consumer can also overwrite a newer PAID status with an older PENDING event.

## Solution: design for correctness before speed

Commit order state and outbox event in one database transaction, publish asynchronously, consume idempotently using monotonically increasing versions, and reconcile stale projections. Show pending synchronization rather than falsely claiming payment failed.

## Implementation decisions

The order service records PAID only after it has verified the payment outcome. Its transaction commits the order state and an outbox record together; the payment provider itself is outside that database transaction.

This example sends complete status snapshots with an order-specific increasing version. Apply a snapshot only when its version exceeds the stored version, using an atomic database condition. In-memory sets alone cannot protect multiple consumers or survive a restart. Conflicting payloads for the same version require investigation. Delta events require contiguous processing or a durable gap-recovery design instead of blindly skipping versions.

If projection delivery stalls, keep the confirmed checkout result and show that account history is synchronizing. Monitor outbox age and consumer lag, then replay or rebuild from an authoritative source. Do not ask the shopper to pay again.

## Trade-offs, scaling and performance

CQRS improves independent read scaling but introduces propagation delay, replay requirements, and operational complexity. Never assume Kafka delivery means exactly-once business effects.

Scale independently where justified; monitor tail latency, error budgets, retry rates, event or endpoint freshness, and business correctness. All timing illustrations are conceptual, not benchmark results.

## Failure handling and resilience

Apply explicit timeout budgets; retry only when semantics are safe; protect payment and order side effects with durable idempotency; use structured logs, traces, alerting and reconciliation.

## Security

Authenticate at gateway and service boundaries, authorize per customer/order, validate signed events where applicable, restrict infrastructure credentials, avoid PII in traces and logs, and use TLS in transit.

## Java 21 teaching example

```java
package demo;
import java.util.*;
public class ProjectionDemo {
  record Event(String id, long version, String status) {}
  static class Projection {
    long version = -1; String status = "UNKNOWN"; Set<String> seen = new HashSet<>();
    boolean apply(Event e) {
      if (!seen.add(e.id())) return false;
      if (e.version() <= version) return false;
      version = e.version(); status = e.status(); return true;
    }
  }
  public static void main(String[] args) {
    var p = new Projection();
    p.apply(new Event("evt-paid", 2, "PAID"));
    p.apply(new Event("evt-pending", 1, "PENDING"));
    p.apply(new Event("evt-paid", 2, "PAID"));
    if (!p.status.equals("PAID") || p.version != 2) throw new AssertionError("Projection regressed");
    System.out.println("PASS: status=" + p.status + ", version=" + p.version);
  }
}
```

## PostgreSQL teaching schema

```sql
-- PostgreSQL: command state and outbox share one transaction
CREATE TABLE orders (id BIGINT PRIMARY KEY, status TEXT NOT NULL, version BIGINT NOT NULL);
CREATE TABLE outbox (event_id UUID PRIMARY KEY, order_id BIGINT NOT NULL, version BIGINT NOT NULL, event_type TEXT NOT NULL, payload JSONB NOT NULL, published_at TIMESTAMPTZ);
CREATE TABLE order_projection (order_id BIGINT PRIMARY KEY, status TEXT NOT NULL, version BIGINT NOT NULL);
WITH changed AS (
 UPDATE orders SET status='PAID', version=version+1
 WHERE id=101 AND status='PENDING'
 RETURNING id, version, status
)
INSERT INTO outbox(event_id,order_id,version,event_type,payload)
SELECT gen_random_uuid(),id,version,'OrderPaid',
       jsonb_build_object('status',status) FROM changed;
-- In production, ensure the UPDATE actually transitioned exactly one row and outbox publication is atomic with that transition.
-- Projection upsert only advances newer versions:
INSERT INTO order_projection(order_id,status,version) VALUES (101,'PAID',2)
ON CONFLICT (order_id) DO UPDATE SET status=EXCLUDED.status,version=EXCLUDED.version
WHERE order_projection.version < EXCLUDED.version;
```

## Step-by-step implementation

1. Capture the customer-visible failure and a correlation ID.
2. Reproduce the failing ordering/routing case.
3. Add a business correctness invariant before optimizing.
4. Make failure/retry semantics explicit.
5. Validate under fault injection, then monitor in staging.

## Pitfalls

- Treating timeouts as proof of rollback.
- Relying on in-memory locks or counters for distributed correctness.
- Omitting authorization or observability.
- Claiming performance gains without controlled measurements.

## Interview Q&A

**Q: What is the core failure?** A: The payment write transaction succeeds, but a separate read-model projection lags or loses an event. A naive consumer can also overwrite a newer PAID status with an older PENDING event.

**Q: What is the most important protection?** A: Commit order state and outbox event in one database transaction, publish asynchronously, consume idempotently using monotonically increasing versions, and reconcile stale projections. Show pending synchronization rather than falsely claiming payment failed.

**Q: What would you test?** A: Duplicate requests, process termination, delayed events, recovery, authorization, and tail latency.

## Exercises

1. Identify the incorrect transition in the simulator.
2. Add a retry/duplicate case and explain the correct outcome.
3. Design a chaos test and define a measurable acceptance criterion.

### Exercise solution ideas

Use readiness/version guards, stable idempotency keys, and assert no duplicate business side effects under retries or delayed delivery.

## References for further verification

- Java 21 API documentation: https://docs.oracle.com/en/java/javase/21/docs/api/
- Spring Boot reference: https://docs.spring.io/spring-boot/reference/
- PostgreSQL documentation: https://www.postgresql.org/docs/current/
- Kubernetes probes: https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/
- Apache Kafka documentation: https://kafka.apache.org/documentation/

## Teaching source files

- [ProjectionDemo.java](/blog/episodes/014/examples/ProjectionDemo.java)
- [schema_postgresql.sql](/blog/episodes/014/examples/schema_postgresql.sql)

These are supplied teaching examples, not a complete deployable checkout service. They have not been executed as JVM or database tests in this integration. Read their dependencies and limits before running them in an isolated environment.

## Primary references used for this lesson

- [Reference 1](https://kafka.apache.org/41/design/design/)
- [Reference 2](https://www.postgresql.org/docs/current/transaction-iso.html)
