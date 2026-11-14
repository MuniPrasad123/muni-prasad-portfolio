---
title: "API Gateway and Service Discovery: Keeping Checkout Available During Deployments"
description: "Checkout fails intermittently during a deployment because a gateway still routes new requests to a terminating instance."
slug: "api-gateway-readiness-graceful-shutdown"
folder: "Resilience & API protection"
date: "2026-11-14"
tags: ["Java","Spring Boot","Microservices","Kubernetes"]
cover: "/blog/episodes/013/cover.svg"
coverAlt: "API Gateway and Service Discovery: Keeping Checkout Available During Deployments"
draft: false
sample: false
level: "Architecture in Motion · Episode 013"
lab: "/blog/episodes/013/lab.html"
overview: {"problem":"Checkout fails intermittently during a deployment because a gateway still routes new requests to a terminating instance.","solution":"Readiness-aware routing, connection draining, graceful shutdown, and durable idempotency for order retries.","note":"Illustrative system · animated browser lesson; no rendered MP4 supplied"}
---

## Start with the customer

A shopper presses Place Order during a deployment. One request works; another returns an error. The shopper cannot tell whether retrying will create another order.

**Normal behavior:** A healthy gateway selects a ready checkout instance. That instance commits one order for the shopper’s logical request and returns the saved result.

**What protects the customer:** Readiness-aware routing, connection draining, graceful shutdown, and durable idempotency for order retries.

This is an illustrative engineering incident, not an employer case study or a performance benchmark. The article, comparison lab, and any supplied video explain the same core failure.

## Follow the incident yourself

[Open the interactive lab](#interactive-lab). Choose **Rolling deployment** and predict the outcome before each step. The unsafe and protected paths receive the same situation.

1. **A is draining; B is ready.** Discovery and connection state may take time to converge during termination. A must stop accepting new work while existing work has time to finish. Protected outcome: B receives new requests.
2. **A fresh checkout request arrives.** Routing blindly to a known endpoint can hit a worker that is no longer serving. Routing checks are necessary, but existing connections also need draining. Protected outcome: B accepts checkout.
3. **B commits, but its reply is lost.** After the failed request to A, a later retry reaches B and commits successfully. A lost response is an ambiguous outcome, not evidence that the database rolled back. Protected outcome: Shopper sees pending status.
4. **The shopper retries the same purchase.** The unsafe retry creates another logical order. A durable customer-and-operation-scoped key returns the existing result instead. Protected outcome: Original order returned.

Then choose **No ready instance** to test a different cause or a healthy/control path. Previous revisits the teaching state; Reset starts the experiment again. Autoplay and visual motion have separate pause controls.

## Watch the animated walkthrough

Use Auto-play in the interactive lab to follow the failure and recovery, or advance one event at a time. A narrated video is not available for this episode.


## Request path and root cause

Shopper / mobile checkout → API gateway: auth, request ID, timeouts → Readiness-aware service endpoint selection → Spring Boot checkout pod → PostgreSQL order/idempotency store

Observability measures the request path; safe retry policy governs retries. Neither is a downstream business hop.

The gateway forwards requests to a terminating checkout pod because service discovery still contains its endpoint, or readiness is declared before the application can serve traffic.

## Solution: design for correctness before speed

Use readiness probes, preStop drain, graceful shutdown, bounded gateway retries only for safe operations, and durable idempotency keys for order placement. Propagate trace IDs and measure 502/503 rates.

## Implementation decisions

Readiness answers whether an instance can receive traffic; liveness answers whether it should be restarted. Do not make a slow external provider restart every checkout pod. Mark a terminating instance unavailable for new work, allow routing updates to propagate, and finish in-flight requests within the termination grace period. A fixed sleep alone cannot guarantee that all connections have drained.

If no ready instance remains, return an explicit retryable response and preserve the logical order identity. Never retry a side-effecting operation with a new identity merely because a gateway deadline expired.

The Java selector below illustrates endpoint eligibility only. It does not implement Kubernetes discovery, connection draining, or a production idempotency store.

## Trade-offs, scaling and performance

A retry is not safe merely because the gateway timed out: the upstream may have committed the order.

Scale independently where justified; monitor tail latency, error budgets, retry rates, event or endpoint freshness, and business correctness. All timing illustrations are conceptual, not benchmark results.

## Failure handling and resilience

Apply explicit timeout budgets; retry only when semantics are safe; protect payment and order side effects with durable idempotency; use structured logs, traces, alerting and reconciliation.

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
-- PostgreSQL: durable order idempotency, unique per customer and operation
CREATE TABLE checkout_requests (
 customer_id BIGINT NOT NULL,
 idempotency_key TEXT NOT NULL,
 order_id BIGINT,
 state TEXT NOT NULL CHECK (state IN ('PROCESSING','COMPLETED','FAILED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (customer_id,idempotency_key)
);
-- Acquire a unique key transactionally before submitting payment/order effects.
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

These are supplied teaching examples, not a complete deployable checkout service. They have not been executed as JVM or database tests in this integration. Read their dependencies and limits before running them in an isolated environment.

## Primary references used for this lesson

- [Reference 1](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Reference 2](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)
