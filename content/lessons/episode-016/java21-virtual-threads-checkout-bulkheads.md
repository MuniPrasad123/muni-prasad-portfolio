---
title: "Java 21 Virtual Threads: Protecting Checkout When Downstream Capacity Is Limited"
description: "Why does checkout slow down when many shoppers arrive? Learn how Java 21 virtual threads help a server handle waiting requests, and why database and payment limits still need protection."
slug: "java21-virtual-threads-checkout-bulkheads"
folder: "Java & JVM reliability"
date: "2026-11-14"
updated: "2026-11-21"
tags: ["Java 21","Spring Boot","Concurrency","System design"]
cover: "/blog/episodes/016/cover.svg"
coverAlt: "Java 21 Virtual Threads: Protecting Checkout When Downstream Capacity Is Limited"
draft: false
sample: false
level: "Architecture in Motion · Episode 016"
lab: "/blog/episodes/016/lab.html"
overview: {"problem":"Asha cannot tell whether her timed-out checkout charged her. More virtual threads do not enlarge the database pool or payment provider.","solution":"Bound active and waiting work, preserve one durable payment identity, set real deadlines and reconcile uncertain outcomes.","note":"Illustrative system · customer-first redesign · local review"}
video: "/blog/episodes/016/lesson-aligned.mp4"
videoPoster: "/blog/episodes/016/poster-aligned.png"
videoCaptions: "/blog/episodes/016/captions-aligned.vtt"
videoCaption: "Indian English male neural narration · synchronized English captions · beginner walkthrough"
videoSummary: "Checkout requests can queue when platform threads are occupied waiting. See how virtual threads free carriers during supported I/O, then add dependency limits and recovery for uncertain payments."
videoChapters: [{"time": 0.0, "label": "CUSTOMER PROBLEM"}, {"time": 12.033, "label": "HOW JAVA 21 HELPS"}, {"time": 26.333, "label": "DEPENDENCY CAPACITY"}, {"time": 38.767, "label": "MAKE RETRIES SAFE"}, {"time": 48.733, "label": "BOUNDED CALLS + BACKPRESSURE"}, {"time": 60.733, "label": "HONEST STATUS + RECOVERY"}, {"time": 74.3, "label": "THE COMPLETE IMPROVEMENT"}]
---

## 1. Start with Asha’s checkout

During a busy sale, Asha taps **Place Order**. The loading spinner keeps going. After a long wait, the browser says **Something went wrong**. She has no order confirmation, yet her bank may already show an authorization. She presses the button again.

What does she need? A quick, honest response; an existing order/payment reference she can check; and protection against a second authorization or duplicate order. This is an **illustrative production-style incident**, not a measured retailer outage or a performance benchmark.

If payment is unresolved, say **“We’re checking your payment.”** Keep the original attempt identity. Neither a browser timeout nor a canceled Java Future establishes that a remote payment failed.

## 2. First, understand the problem without Java jargon

When Asha clicks **Place Order**, her browser sends a request to our server. The server checks the order in a database, asks a payment service to authorize payment, saves the result and sends a response back. Much of this time can be spent **waiting for another system to answer**, rather than calculating something on the CPU.

A **thread** is a path of execution that runs the code for that request. In a traditional blocking setup, a Java **platform thread** is tied to an operating-system thread. If it waits for a payment response, that operating-system thread remains occupied by the request, even while it is doing no useful computation.

Imagine an illustrative server configured with **100 platform request threads**. If all 100 are waiting for slow network responses, the next shopper may have to wait in a queue before their checkout code can run. The CPU might still have spare capacity. As that queue grows, shoppers see longer spinners and eventually timeouts. Increasing the platform-thread pool can help for a while, but these threads have memory and scheduling costs.

**The problem statement:** How can the server handle many checkout requests that spend most of their time waiting, without needing an expensive operating-system thread for every waiting request—and without overwhelming the database or payment service?

### How Java 21 virtual threads improve this

A **virtual thread** is a lightweight Java thread managed by the JVM. During many supported blocking I/O operations, the JVM can pause the virtual thread and free its underlying operating-system thread, called a **carrier**, to run another virtual thread. When the response arrives, Java schedules the waiting request to continue. Some operations can still pin a carrier in Java 21; the performance section below explains that limitation.

Think of a waiter taking an order and helping another table while the kitchen prepares it. The waiter does not need to stand still at the first table. The kitchen still takes the same time to cook the meal.

| Checkout design | What happens during a network wait? | What improves for the customer? |
| --- | --- | --- |
| Platform thread per blocking request | A relatively costly OS thread stays occupied by that request. A limited request pool can fill with waiters. | New shoppers can queue behind requests that are only waiting. |
| Virtual thread per request | Supported blocking I/O can release the carrier to run other Java work. Many lightweight requests can remain in progress. | If the thread pool was the bottleneck and dependencies have spare capacity, fewer requests wait just to get a thread; more checkouts can progress together. |
| Virtual threads plus capacity protection | Waiting is cheaper, while explicit limits control database and payment work. | The server can use available capacity while giving prompt busy guidance and an honest status for an existing payment. |

For example, 1,000 requests waiting on independent network calls need not require 1,000 operating-system threads. This can improve **throughput**—the amount of work completed over time—for suitable I/O-heavy workloads. It does not guarantee that each request finishes faster, and it does not speed up CPU-heavy calculations. These numbers illustrate the mechanism; they are not measured results for this application.

### Why the checkout can still be slow afterward

Virtual threads remove one possible bottleneck: the cost and availability of threads waiting on I/O. If the database has only 20 connections, it still lends at most 20 connections at once. If the payment service is overloaded, every kind of thread still waits for that service. Sending more work to an already-full dependency can make its queue worse.

The complete improvement is therefore **virtual threads for efficient waiting, plus bounded work for healthy dependencies**. A payment timeout needs a separate safeguard: keep the existing payment reference and check its result before another payment operation. Virtual threads alone do not prevent duplicate payments.

## 3. The normal path—and where the wait moves

Browser → gateway → Spring Boot checkout → short PostgreSQL transaction → payment provider → persist verified outcome → confirmation outbox.

A platform thread can remain occupied while waiting on blocking I/O. Java 21 virtual threads often make that waiting cheaper by allowing the underlying carrier to do other work. **They do not make an individual provider request faster, add database connections, or create CPU capacity.**

The illustrative example has 500 concurrent requests and a pool of 20 connections. At most 20 connections can be checked out at once; the remaining queries wait or time out. The 20-connection DB pool and a 20-call provider budget are **separate resources**, not a reason to assign the same number automatically.

The before/after architecture above and the [customer-first lab](#interactive-lab) make the bottleneck visible. Original side-by-side comparisons, sliders, navigation, autoplay and quiz remain in **Open the original side-by-side simulation** below the new lab.

## 4. Why “just use virtual threads” is incomplete

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (CheckoutRequest request : burst) {
        executor.submit(() -> paymentProvider.authorize(request));
    }
} // close() waits for submitted work to finish
```

This example is intentionally incomplete. It creates cheap waiting tasks but no admission boundary, durable payment identity, real HTTP deadline or recovery policy. A slow provider can become the new queue.

A semaphore acquired **inside** every newly created task limits active calls but may still leave an unbounded population of waiting tasks until their waits expire. Bound the number admitted into the waiting room as well as the active work, or reject before execution starts. A per-pod limit also multiplies across replicas; it is not a global provider quota.

## 5. The protected design, one boundary at a time

### Persist a durable operation identity

Authenticate the customer and derive ownership from the verified security context. Reserve an operation using a database uniqueness constraint on customer, operation and idempotency key. Store a request hash and a unique stable provider reference. An identical retry returns the existing state; the same key with another payload is a conflict, not another charge.

`CREATED` means the record exists but no provider call has been claimed. After local admission, atomically claim `CREATED → IN_FLIGHT`. Another replica handling the same key sees that claim and does not initiate another operation. Release the database connection before making the network call.

### Bound active calls and waiting work

A payment bulkhead is a small waiting room in front of a scarce dependency. The Java example allows at most `maxActive + maxWaiting` operations inside it. Beyond that bound, new execution is rejected immediately. A waiting operation also has a finite permit-wait budget.

Use a fast **503 busy** response with appropriate retry guidance only when that attempt **has not started** at the provider. A caller-specific rate limit may use 429. An already-started or uncertain payment needs an existing-operation response such as 202 and a status lookup—not “try paying again.”

Queues trade rejection for latency and retained work. Keep them bounded; sometimes a zero-length waiting room is the right choice. Upstream gateways and clients must also bound pending requests. A local bulkhead does not bound every queue in the system.

### Give the database its own budget

Keep DB transactions short. Use a finite connection-acquisition timeout and reserve capacity for status reads, writes and reconciliation. Do not hold a database connection open while waiting for payment-provider HTTP I/O.

Size the application’s DB workload and each pool against actual query duration, transactions per request, replica count, database limits and operational headroom. Replacing platform threads with virtual threads does not increase a HikariCP pool’s maximum size.

### Set real deadlines

Configure the actual HTTP client’s connect and request/response budgets, plus an end-to-end checkout deadline. Derive per-stage timeouts from the remaining overall budget; arbitrary independent timeouts can add up beyond the customer deadline. Check the transport’s exact body/read/cancellation behavior.

`Future.get(timeout)` only bounds the caller’s wait. It does not guarantee that the underlying task or remote payment stopped. The local permit stays owned until that task exits. When a real transport deadline ends the local call, its permit may release, but remote work can still be unresolved. Use provider quotas, stable idempotency references and reconciliation to manage that uncertainty; a local semaphore cannot prove a global remote-concurrency bound.

### Recover payment state safely

Persist `UNKNOWN` for an ambiguous outcome, or recover a stale durable `IN_FLIGHT` claim after a crash. Query the authority using the **original** provider reference. Only authoritative confirmation or a definitive decline should resolve the result. A “not found” response needs the provider’s documented consistency/retry policy; it is not universal proof that no operation occurred.

If persistence fails after provider authorization, the earlier durable claim is the recovery anchor. Return an honest checking state where possible and reconcile once storage recovers. Never assume the provider rolled back because a local database write failed.

### Commit follow-up intent with the verified result

Commit a confirmed state and its confirmation outbox event atomically. Workers deliver using stable downstream idempotency keys. `UNKNOWN` may schedule a distinctly typed status-check task; it must not emit a success/fulfillment event. This corrects a potential ambiguity in the package diagram’s generic notification branch.

## Implementation: Java 21

The [PaymentBulkhead.java](/blog/episodes/016/examples/PaymentBulkhead.java) download is compiled and tested on Java 21. It runs on an existing request/task thread and creates no hidden executor or unbounded task queue:

```java
public <T> T call(Callable<T> operation) throws Exception {
    if (!admitted.tryAcquire())
        throw new RejectedExecutionException("Active and waiting budgets full");
    boolean acquired = false;
    try {
        acquired = active.tryAcquire(waitNanos, TimeUnit.NANOSECONDS);
        if (!acquired)
            throw new RejectedExecutionException("Permit wait expired before execution");
        return operation.call();
    } finally {
        if (acquired) active.release();
        admitted.release();
    }
}
```

The constructor gives `admitted` a capacity of active plus waiting operations, and `active` the provider-call capacity. `finally` releases only resources actually acquired, including exception and interruption paths. This is **local admission control**, not a payment ledger, global quota or automatic remote cancellation. Timed acquisition and a fairness setting are not a blanket FIFO guarantee for every admission operation.

### Spring Boot configuration and wiring

For Spring Boot 3.2+ on a supported Java 21/server combination:

```yaml
spring:
  threads:
    virtual:
      enabled: true
  datasource:
    hikari:
      maximum-pool-size: 20  # illustrative; measure before sizing
      connection-timeout: 500  # milliseconds; a DB wait budget, not a payment deadline
```

Enabling this property does not switch every third-party library or internal executor to virtual threads. A small illustrative bean configuration is:

```java
@Bean
PaymentBulkhead paymentBulkhead() {
    return new PaymentBulkhead(20, 10, Duration.ofMillis(100));
}
```

A request coordinator first loads/reserves the durable attempt, then calls the bulkhead. **Inside admission**, claim the attempt once and invoke the provider outside the DB transaction. If another replica already claimed it, return that existing operation. On rejection, re-read the operation state before mapping a busy response; do not overwrite an operation that another replica started.

### Actual HTTP deadlines

The [DeadlinePaymentClient.java](/blog/episodes/016/examples/DeadlinePaymentClient.java) teaching adapter configures a JDK HTTP client and preserves its original reference:

```java
var client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofMillis(300)).build();
var request = HttpRequest.newBuilder(trustedProviderUri)
    .timeout(Duration.ofMillis(1500))
    .header("Idempotency-Key", stableProviderReference)
    .POST(HttpRequest.BodyPublishers.ofString(trustedRequestBody)).build();
```

These durations and the header are illustrative. Follow the actual provider’s authentication, signing, idempotency retention and HTTP contract. The caller must validate the provider’s result and persist it safely. A transport exception is not a definitive decline. The sample’s separate lookup method demonstrates recovery against a **local fixture**, not a live provider SDK.

### Durable identity and state

The [PostgreSQL schema](/blog/episodes/016/examples/schema.sql) defines the operation key, payload hash, stable provider reference, explicit `CREATED / IN_FLIGHT / UNKNOWN / CONFIRMED / FAILED` states and a unique outbox key. Application code must implement atomic claims, ownership checks, hash comparison, leases and reconciliation. The schema alone is not a complete checkout endpoint.

## 6. Try the failure and recovery lab

Start with the **four-checkout visual experiment** above. Both servers receive the same four distinct requests, A–D, and have two operating-system threads. Move through six steps and compare the occupied carriers, calls awaiting payment responses, requests waiting to start and completed checkouts. Switch provider capacity from four to two to see the next bottleneck. This is a constructed sequence, not a timed performance measurement.

The [advanced lab](/blog/episodes/016/advanced-capacity-lab.html) retains the demand sliders and nine scenarios below. It separates **burst-capacity comparisons** from **Asha’s one payment attempt**. Its moving packets are visual replays and never create additional work. Inputs reset the teaching state; Previous, Next, Reset, Play/Pause, speed, motion pause and reduced-motion support remain available.

| Scenario | What to inspect |
| --- | --- |
| Start here: how virtual threads help | Platform threads wait; supported virtual-thread I/O frees carriers for other requests; dependency limits remain |
| Unbounded virtual threads | Many callers wait; provider/DB execution remains finite |
| Bounded calls and waiting room | Active + waiting + rejected equals the modeled demand |
| Database exhaustion | Only pooled connections execute queries; excess queries wait |
| Timeout and recovery | UNKNOWN retains the identity and does not start another payment |
| Busy before provider start | No provider call occurred; retry guidance uses the same operation |
| Crash after provider acceptance | Durable reference survives; reconcile before another operation |
| Same key, changed payload | 409 conflict before any second provider call |
| Multiple replicas | Local limits multiply unless a shared budget is actually coordinated |

The model cannot prove real database isolation, provider behavior or load-test results. It explicitly does not implement a distributed rate limiter.

## 7. Performance, pinning and observability

Virtual threads suit many blocking I/O workloads; CPU-heavy computation still needs an appropriate bounded compute executor. In **Java 21**, blocking while holding a `synchronized` monitor can pin a carrier. Inspect JFR `jdk.VirtualThreadPinned` events and test relevant native/blocking libraries. This warning is version-specific; later JDK implementations differ.

Observe active and waiting operations, rejected new executions, permit-wait duration, Hikari pending/acquisition time, provider errors and latency, unknown-payment age, reconciliation lag, idempotency conflicts and p95/p99 end-to-end latency. Include replica counts and provider-global limits in capacity planning.

To compare platform and virtual threads, use the same hardware, traffic, provider delay, DB pool and protection policy. Separate queue wait from execution latency and distinguish accepted throughput from rejected demand. No latency or throughput gain in this article is a measured benchmark.

## 8. Failures and customer responses

| Failure | Safe handling |
| --- | --- |
| Provider is slow | Bound active calls and waiting work; respect actual HTTP budgets |
| No DB connection before operation starts | Bounded acquisition failure; no provider call, same operation identity |
| Browser/Future wait expires | Do not assume cancellation; preserve the running task’s permit until exit |
| Provider accepts, response is lost | UNKNOWN/checking response; authoritative lookup by original reference |
| Process crashes or result persistence fails | Reconcile the durable claim before another payment operation |
| Duplicate checkout or changed payload | Return existing state or reject conflict; never trust a client-supplied customer ID |
| Several replicas saturate the provider | Coordinate global budgets or partition quotas; one JVM semaphore is insufficient |

Protect order ownership at every boundary. Redact payment data and secrets. Verify asynchronous provider callbacks using their provider-specific signature, timestamp and account rules. A bulkhead does not provide authentication or durable idempotency.

## 9. Run the examples and tests

```powershell
javac --add-modules jdk.httpserver -d .cache/episode016/java public/blog/episodes/016/examples/*.java
java -cp .cache/episode016/java PaymentBulkheadTest
java --add-modules jdk.httpserver -cp .cache/episode016/java DeadlinePaymentClientTest
node --test tests/capacity-lesson.test.ts
```

The Java tests exercise active/waiting bounds, failed operations, expired waits, interruption, caller wait timeout and a real local HTTP deadline followed by original-reference lookup. They are correctness tests, not performance measurements. The SQL and Spring wiring are teaching assets; no live payment, production database or provider sandbox transaction is claimed.

## 10. Interview questions

**Do virtual threads make each call faster?** No. They can improve the efficiency of blocking concurrency; another bottleneck still determines completion time.

**Why bound waiters as well as active calls?** An unlimited waiting room retains unlimited work even when threads are cheap. Bound count and waiting time, then apply backpressure upstream.

**Can a per-pod semaphore guarantee a provider-global limit?** No. Replicas multiply local budgets, and remote work may survive local timeouts. Global coordination and provider contracts are separate concerns.

**Can a timeout prove payment failure?** No. Preserve the existing identity, show uncertainty honestly and reconcile before another payment operation.

**Why not keep the DB transaction open while authorizing?** It retains scarce connections during a remote wait and can exhaust the pool. Use short durable claims and persist/reconcile the result separately.

## 11. Exercises and takeaway

1. Set demand to 500 and DB pool to 20. Explain which queries run and which wait, without inventing throughput.
2. Set active calls to 20 and waiting room to 10. Account for all demand as active, waiting or not admitted. Decide what response is safe for a not-started attempt versus an uncertain one.
3. Crash after provider acceptance. Describe how the original reference survives, how a stale claim is discovered, and why lease expiry does not prove a failed payment.

**Cheaper threads are not extra capacity. Bound work, preserve payment identity, and recover uncertainty honestly.**

## Official technical references

- [Java 21 virtual threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
- [JEP 444: virtual threads](https://openjdk.org/jeps/444)
- [Java 21 HttpRequest timeout contract](https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpRequest.Builder.html#timeout(java.time.Duration))
- [Spring Boot virtual-thread configuration](https://docs.spring.io/spring-boot/reference/features/spring-application.html#features.spring-application.virtual-threads)
- [HikariCP configuration](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)
