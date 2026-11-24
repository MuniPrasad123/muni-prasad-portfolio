---
title: 'Kubernetes Checkout Failures: Readiness, Graceful Shutdown and Idempotency'
description: >-
  Why Kubernetes rolling updates can cause checkout errors: use readiness,
  connection draining, graceful shutdown and durable idempotency to handle
  retries safely.
slug: api-gateway-readiness-graceful-shutdown
folder: Resilience & API protection
date: '2026-11-14'
tags:
  - Java
  - Spring Boot
  - Microservices
  - Kubernetes
cover: "/blog/thumbnails/episode-013.svg"
coverAlt: "A Kubernetes instance becomes unready, drains traffic and then stops safely."
draft: false
sample: false
level: Architecture in Motion · Episode 013
lab: /blog/episodes/013/lab.html
overview:
  problem: >-
    A shopper sees an unconfirmed checkout during a deployment and cannot tell
    whether retrying will duplicate a saved order.
  solution: >-
    Drain terminating pods for routing; preserve a customer-scoped operation key
    for durable idempotency.
  note: >-
    Illustrative system · six-step lab and narrated MP4; no production incident
    or benchmark claimed.
updated: '2026-11-18'
video: /blog/episodes/013/episode013_narrated.mp4
videoPoster: /blog/episodes/013/video-poster.png
videoCaptions: /blog/episodes/013/episode013_narrated.vtt
videoCaption: Narrated animation · Indian English male voice
videoSummary: >-
  Six steps separate a routing failure from an order that committed but lost its
  reply. Indian English male narration explains the journey; captions and
  chapter buttons remain available.
videoChapters:
  - time: 0
    label: '00:00 · Place Order'
  - time: 12.25
    label: '00:12 · Rollout starts'
  - time: 24.542
    label: '00:24 · Stale route'
  - time: 37.833
    label: '00:37 · Lost confirmation'
  - time: 49.583
    label: '00:49 · Same purchase retried'
  - time: 63.833
    label: '01:03 · Protected recovery'
---

## Start with the customer

A shopper adds a ₹4,999 pair of shoes, enters shipping and payment details, and clicks **Place Order**. The button spins, then shows **“We couldn't confirm your order. Please check your orders before retrying.”** Another shopper completes checkout normally. The first shopper cannot tell whether an order exists or whether another click would create a duplicate.

**Normal behavior:** A healthy gateway selects a ready checkout instance, the service commits one order for the logical purchase, and the shopper receives its confirmation.

**Two failures, two protections:** Routing to a terminating pod can cause a 502/503, connection reset, or timeout. Separately, an order can commit and its reply can be lost. Draining improves routing; durable idempotency protects the logical purchase when the customer retries.

This is an illustrative engineering scenario, not an employer incident or a performance benchmark. The video and lab use teaching values.

## Follow the incident yourself

[Open the interactive lab](#interactive-lab). Choose **Rolling deployment · six-step journey**. Both designs receive the same sequence; predict the customer outcome before advancing.

1. **Place Order.** The shopper expects one confirmation for one purchase. The protected client creates a stable checkout identity before the first request.
2. **The rollout starts.** Pod A begins terminating while B becomes ready. The shopper has no reason to know about the deployment.
3. **The gateway reaches A.** A stale endpoint or pooled connection reaches the terminating pod. The shopper sees an error; readiness-aware routing and connection draining move new work toward B.
4. **A retry commits on B, but the reply is lost.** The shopper still sees uncertainty even though an order was saved. A timeout is not proof of rollback.
5. **The same purchase is retried again.** A fresh identity can produce another order. Reuse the original customer-scoped key and check the request payload.
6. **Recover the original confirmation.** The protected flow returns the original saved order. Readiness fixes the route; the database idempotency record prevents a second logical order.

Choose **No ready instance** for the additional capacity scenario. Previous and Reset rebuild teaching state; they do not undo real transactions. Autoplay and visual-motion pause are separate controls.

## Watch the animated walkthrough

The **narrated MP4** is playable above with Indian English male narration, on-screen text, an English caption track, and six chapter buttons. Each scene has been extended to keep the explanation clear.

Use the video to see the customer journey, then advance the lab to compare routing and duplicate-order protections at your own pace.

## Request path and root cause

Shopper → API gateway → ready Spring Boot checkout pod → PostgreSQL order and idempotency records.

The gateway may still hold a stale endpoint or an existing connection while Kubernetes is terminating Pod A. Endpoint updates, connection draining, and application shutdown are not one instantaneous event. A request can reach A after it can no longer serve it.

A later request can reach B and commit successfully, yet lose its HTTP response independently. That is a second failure mode: the customer sees “not confirmed” while the business outcome may already exist. Observability and retry policy govern this path; they are not extra business-service hops.

## Solution: design for correctness before speed

Use readiness-aware routing, connection draining and bounded graceful shutdown for availability. Use a stable idempotency key and durable database coordination for repeated checkout requests.

Generate the key once per logical checkout and **reuse it on every retry**, including retries from the gateway. Bind it to the authenticated customer and a canonical payload hash. A different payload with the same key should receive **409 Conflict** rather than reusing another operation.

Atomically claim the unique database key before creating the order. A completed match returns its saved response; an in-progress match waits within a bound or returns an explicit pending state. Store the business order and idempotency completion in the same transaction. **Do not automatically retry a non-idempotent order POST with a fresh identity.**

Payment-provider calls and fulfillment are external effects. They require their own idempotency contracts and reconciliation, often with an outbox or saga; a PostgreSQL constraint alone cannot make an external charge exactly-once.

## Implementation decisions

Readiness answers whether an instance should receive new traffic; liveness detects when a restart is appropriate. A slow external provider should not trigger restart loops across every checkout pod.

During termination, Kubernetes marks terminating endpoints not ready, but endpoint consumers and pooled connections still need to converge. Test your ingress and server behavior while marking application readiness unavailable and draining existing connections.

The teaching deployment reserves **60 seconds** of termination grace. Its **10-second preStop delay consumes part of that budget**, leaving less time for application shutdown. Spring Boot's **40-second per-phase timeout** is not a guarantee that the entire application closes in 40 seconds: multiple lifecycle phases and cleanup need headroom. Size and verify the full budget against real request duration and cluster behavior.

A fixed sleep is only an illustrative propagation window. It does not itself drain every connection or guarantee zero errors. With three replicas, maxUnavailable: 0 and maxSurge: 1 aim to retain ready capacity, subject to scheduling capacity and actual readiness.

The Java selector below illustrates endpoint eligibility only. It does not implement Kubernetes discovery, connection draining, or a production idempotency store.

## Trade-offs, scaling and performance

Readiness improves new-request routing but cannot erase work already in flight. Graceful shutdown allows bounded completion; it does not promise unlimited time. Longer grace budgets slow rollout and capacity turnover.

Idempotency requires scoped keys, atomic claims, matching payloads, retention rules and handling for concurrent PROCESSING requests. Do not expire a key while legitimate retries can still arrive. The invariant is one committed logical order for the same authorized operation, not a claim of exactly-once HTTP delivery.

All timings and counts in the lab are conceptual, not measured latency or production results.

## Failure handling and resilience

Show **“We are checking your order”** after an ambiguous response and query status using the same checkout identity. If no ready instance remains, return an explicit temporary-unavailable response rather than routing to an instance known to be unready.

Use bounded deadlines, retry budgets, structured correlation IDs and reconciliation. Never interpret a gateway timeout as proof that the database or payment provider rolled back.

## Verification and observability

Run repeated checkouts during controlled rolling updates. Inject stale endpoint routing, connection resets, response loss and duplicate concurrent requests. Verify that:

- New traffic avoids terminating endpoints after tested propagation and drain behavior.
- In-flight requests complete within the full termination budget.
- A committed order can be recovered by the authorized customer's stable checkout identity.
- Identical retries and concurrent claims cannot create a second committed logical order.
- Mismatched payloads are rejected, and cross-customer requests cannot reveal another customer's order.
- Payment-provider outcomes can be reconciled independently.

Track readiness transitions, in-flight work, gateway 502/503/504 responses, connection resets and retry counts. Avoid logging credentials, payment details or personal data. These are suggested tests; this content integration does not execute them against a live cluster.

## Security

Authenticate at gateway and service boundaries, authorize per customer/order, validate signed events where applicable, restrict infrastructure credentials, avoid PII in traces and logs, and use TLS in transit.

## Java 21 teaching example

```java
package demo;
import java.util.*;
import java.util.concurrent.*;
public class RoutingDemo {
  record Pod(String name, boolean ready, boolean terminating) {}
  static Optional<Pod> choose(List<Pod> pods) {
    return pods.stream().filter(p -> p.ready() && !p.terminating()).findFirst();
  }
  public static void main(String[] args) {
    var pods = List.of(new Pod("checkout-a", true, true), new Pod("checkout-b", true, false));
    var selected = choose(pods).orElseThrow();
    if (!selected.name().equals("checkout-b")) throw new AssertionError("Unsafe route");
    System.out.println("PASS: routed to " + selected.name());
  }
}
```

## PostgreSQL teaching schema

```sql
-- Teaching design; not a complete transaction/payment integration.
CREATE TABLE checkout_requests (
  customer_id BIGINT NOT NULL,
  idempotency_key VARCHAR(160) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  state VARCHAR(20) NOT NULL CHECK (state IN ('PROCESSING','COMPLETED','FAILED')),
  order_id BIGINT,
  response_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, idempotency_key)
);
-- Acquire atomically with INSERT ... ON CONFLICT DO NOTHING.
-- On conflict: lock/select existing row and compare request_hash.
-- Same hash + completed => return original result; mismatched hash => 409.
-- Processing => bounded pending response / status endpoint, never create a new order.
-- Ensure business order insert and idempotency completion share a transaction.
-- Payments outside DB require provider idempotency + outbox/saga reconciliation.
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

**Q: What is the core failure?** A: The gateway forwards requests to a terminating checkout pod because service discovery still contains its endpoint, or readiness is declared before the application can serve traffic.

**Q: What is the most important protection?** A: Use readiness probes, preStop drain, graceful shutdown, bounded gateway retries only for safe operations, and durable idempotency keys for order placement. Propagate trace IDs and measure 502/503 rates.

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

- [RoutingDemo.java](/blog/episodes/013/examples/RoutingDemo.java)
- [schema_postgresql.sql](/blog/episodes/013/examples/schema_postgresql.sql)
- [Spring Boot application.properties](/blog/episodes/013/examples/application.properties)
- [Kubernetes checkout deployment example](/blog/episodes/013/examples/checkout-deployment-example.yaml)

These are teaching artifacts, not a complete deployable checkout service. The configuration files must be adapted to the actual application, endpoints, gateway and runtime version. No cluster, JVM or database execution is claimed for this content update.

## Primary references used for this lesson

- [Kubernetes pod lifecycle and termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Kubernetes readiness, liveness and startup probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)
- [Spring Boot graceful shutdown](https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
