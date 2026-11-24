---
title: "Java Garbage Collection: Diagnosing Checkout Latency Before Tuning the JVM"
description: "Asha’s checkout freezes. Learn what Java garbage collection does, compare a 300 ms pause with a two-second request, and diagnose the real bottleneck before tuning."
slug: "java21-gc-checkout-latency-diagnosis"
folder: "Java & JVM reliability"
date: "2026-11-14"
updated: "2026-11-24"
tags: ["Java 21","Spring Boot","JVM","Performance"]
cover: "/blog/episodes/017/cover.svg"
coverAlt: "Java Garbage Collection: Diagnosing Checkout Latency Before Tuning the JVM"
draft: false
sample: false
level: "Architecture in Motion · Episode 017"
lab: "/blog/episodes/017/lab.html"
overview: {"problem":"Asha’s checkout stalls and payment status is uncertain. A slow request alone cannot identify GC as its cause.","solution":"Compare same-server request, pause and dependency timelines; profile a proven hotspot, change one variable and validate correctness.","note":"Customer-first redesign · local review"}
video: "/blog/episodes/017/lesson-redesign.mp4"
videoPoster: "/blog/episodes/017/poster-redesign.png"
videoCaptions: "/blog/episodes/017/captions-redesign.vtt"
videoCaption: "Indian English male neural narration · synchronized captions · illustrative diagnosis"
videoSummary: "Asha’s checkout stalls. Learn what the heap and GC do, compare a 300 ms pause with a two-second request, and follow evidence, a targeted change and payment-safe recovery."
videoChapters: [{"time": 0.0, "label": "ASHA'S CHECKOUT"}, {"time": 13.733, "label": "WHAT GARBAGE COLLECTION DOES"}, {"time": 27.333, "label": "FOLLOW THE TIMELINE"}, {"time": 42.933, "label": "COMPARE THE EVIDENCE"}, {"time": 54.7, "label": "PROFILE, CHANGE, REPEAT"}, {"time": 69.067, "label": "VALIDATE AND RECOVER"}]
---

## 1. Asha’s checkout freezes—what should we investigate?

Asha presses **Place Order**. The spinner stops moving. A moment later, the order appears—or the browser times out. She cannot tell whether payment succeeded and considers paying again.

She needs two things: a responsive checkout and a reliable answer about her existing payment. **A slow response does not prove payment failure.** Keep the original payment identity, show “We’re checking your payment” when necessary, and reconcile the result before starting another payment operation.

This is an illustrative incident, not an employer case study or measured benchmark. The article, video and lab follow the same customer problem and evidence sequence.

## 2. First, understand the normal workflow

Shopper → gateway → Java checkout → short database operations → payment service → persist the verified result → return the order status.

While preparing the cart, Java creates objects: line summaries, discount results and response data. The **heap** is memory managed by the JVM, like a workbench holding these objects. The **garbage collector**, or GC, reclaims objects that are no longer reachable through the application’s live references. “Unreachable” is a technical condition; an object that seems unnecessary to us may still be reachable and therefore retained.

GC is useful: reclaiming space lets the application keep allocating without manually freeing every object. **Some collection phases pause Java application threads; other work runs concurrently with the application.** A pause is not automatically a full collection, and a large allocation count alone does not predict a pause duration.

The payment service is a separate system. It may keep processing Asha’s payment while our JVM is paused. A blue payment-wait span in the lab means **our server awaits its answer**; it does not mean the payment service has stopped working.

## 3. Why a healthy average can hide unhappy shoppers

Consider an invented set of 100 requests: 98 take 200 ms and two take 2,000 ms. The mean is **236 ms**, while the **nearest-rank p99 is 2,000 ms**. These values explain a percentile, not a result observed on this application. The p99 describes the 99th-percentile latency; it does not describe every slow customer or the maximum.

Request latency can include queueing, application work, CPU contention, database acquisition/query time, remote calls and JVM pauses. Measure the actual request boundary, including unsuccessful outcomes. A server-side timer cannot by itself measure the customer’s complete browser experience.

## 4. The key comparison: 2,000 ms request, 300 ms pause

Open the [visual diagnosis experiment](#interactive-lab). It starts with concrete intervals on the same server:

| Evidence | Constructed interval | What it tells us |
| --- | --- | --- |
| Whole checkout | 0–2,000 ms | The full request lasts two seconds |
| GC pause | 500–800 ms | A 300 ms pause overlaps the request |
| Awaiting payment response | 900–1,800 ms | A separate 900 ms remote wait is visible |

The pause is **300 ms**, not 2,000 ms. It is a reason to investigate JVM contribution, not proof that GC caused the entire delay. The two displayed subintervals cover 1,200 ms; the remaining time needs other trace evidence. This coverage calculation is not a causal decomposition of latency.

Try **Pause inside a payment wait** next. Its pause is 600–900 ms and its payment span is 100–1,800 ms. The 300 ms pause is already inside the 1,700 ms payment span. Their combined interval coverage is **1,700 ms**, not 2,000 ms. Adding durations would count the same clock time twice. Whether the pause delayed completion requires critical-path evidence, including when the remote response arrived and when Java could process it.

The lab also includes a slow provider without a matching pause, a healthy control, and a pause from another JVM. Matching timestamps on **different servers** cannot establish that the request was paused. Synchronize clocks and correlate instance IDs.

## 5. Diagnose before changing the collector

### Capture bounded GC and safepoint logs

On Java 21, enable rotating logs in a directory that exists and is writable by the application:

```text
-Xlog:gc*,safepoint:file=gc.log:time,uptime,level,tags:filecount=5,filesize=20M
```

This creates evidence; it is not a performance fix. Record JVM instance, JDK version and collector. Match timestamps and request spans to pause intervals. Compare executor queues, database pool waits, provider latency and CPU throttling as well. If no pause overlaps, concurrent GC can still consume CPU; “no matching pause” does not prove zero GC cost.

### Use Java Flight Recorder to investigate allocation

In a controlled environment, a bounded recording can help find hotspots:

```text
jcmd <pid> JFR.start name=checkout settings=profile duration=60s filename=checkout.jfr
```

Check the available events for your JDK and recording configuration. Allocation samples help locate possible hotspots; they are not exact object counts. Retention needs separate evidence, such as old-object samples or controlled heap analysis. A heap dump or recording can contain sensitive data: restrict access, retention and export, and never log card credentials or full personal payloads.

### Fix proven unnecessary work

Repeated cart serialization, eager debug JSON and unbounded retained snapshots are possible hotspots. Reduce demonstrated redundant work, bound caches and payloads, and keep a compact immutable summary where appropriate. Do not change tax, discount, currency or order semantics merely to reduce objects.

The positive improvement is **less unnecessary allocation and retained work**, allowing the JVM to spend fewer resources on that proven overhead. Whether customer latency improves must be established with controlled measurements; an allocation slider or a smaller code sample cannot predict G1 pauses.

## 6. Practical Java 21 examples

The original [CheckoutAllocationExample.java](/blog/episodes/017/examples/CheckoutAllocationExample.java) preserves the SKU/quantity example: it calculates an immutable summary without creating a giant intermediate debug string. It uses `Math.addExact` for its unit total and validates item quantities.

The additional [PricedCheckoutExample.java](/blog/episodes/017/examples/PricedCheckoutExample.java) adapts the redesign package’s priced-line example:

```java
public record Line(BigDecimal unitPrice, int quantity) {
    public Line {
        Objects.requireNonNull(unitPrice);
        if (unitPrice.signum() < 0 || quantity < 1)
            throw new IllegalArgumentException("Invalid line");
    }
}
public record Summary(int lines, BigDecimal total) {}
```

Iterate once, multiply each unit price by its quantity, add the amounts using `BigDecimal`, and return a summary. Decimal arithmetic still creates objects. This sample does not promise zero allocation or demonstrate an allocation-rate reduction. Currency scale, rounding, tax and discount policies belong to the real checkout domain; the sample is deliberately not a full pricing engine.

The standalone Java test checks both summaries, empty input, exact decimal totals and invalid quantities/prices. No `System.gc()` loop, manufactured JVM stress test or latency benchmark is presented as proof of improvement.

## 7. Spring Boot metrics: measure the operation we care about

The existing [CheckoutMetricsExample.java](/blog/episodes/017/examples/CheckoutMetricsExample.java) wraps the actual application operation with a Micrometer `Timer`. It is a Spring/Micrometer integration fragment, not a standalone Java class you can run without dependencies.

```java
return Timer.builder("checkout.processing.duration")
    .description("Checkout application processing duration")
    .register(registry)
    .record(checkout);
```

Enable JVM metrics using Actuator and a configured registry. Configure histogram buckets around the latency SLO for the backend in use. Record failures and timeouts as well as successes; measure queueing and remote waits at the appropriate boundaries. For fleet percentiles, aggregate compatible histogram counts across replicas rather than averaging their individual p99 values.

Use bounded, low-cardinality tags such as an outcome category. Never use customer IDs, order IDs or arbitrary URLs as metric labels. The timing fragment is not an end-to-end checkout endpoint, and no real provider or production metric export is claimed here.

## 8. G1, generational ZGC and resource trade-offs

Establish a baseline before trying a different collector. Compare G1 using `-XX:+UseG1GC` with **Java 21 generational ZGC** using `-XX:+UseZGC -XX:+ZGenerational`. Keep this advice version-specific; do not apply flags blindly to another JDK.

G1 balances throughput and pause goals. ZGC targets low pauses with potential CPU and memory costs. Neither guarantees a checkout latency target. Keep JDK, hardware, warmup, heap, container limits, traffic mix and protection policies comparable, and record repeated trials.

A larger heap can change collection frequency but increases footprint and does not solve a retention bug. Leave container memory for native allocations, stacks, direct buffers and JVM overhead as well as the heap. Watch RSS, CPU throttling, OOM kills and the post-GC live set. More replicas may spread load while also increasing total memory and database connections.

Virtual threads do not eliminate GC. They help suitable blocking concurrency but still use managed objects and are affected by relevant JVM pauses. GC work, thread scheduling, database capacity and provider latency solve different parts of the request problem.

## 9. Failures, recovery and controlled validation

| What we observe | What to do next |
| --- | --- |
| Matching pause overlaps a slow request | Compare all critical-path spans and profile allocation before attributing the whole delay |
| Slow provider; no matching pause | Investigate provider/network/admission evidence; check CPU and concurrent GC too |
| A pause log from another instance | Locate the correct JVM before correlating request time |
| Live set keeps growing | Investigate retention, bounded caches and heap evidence |
| Collector change reduces pauses but raises CPU/errors | Evaluate the full SLO and resource budget; roll back if overall behavior regresses |
| Timeout leaves payment uncertain | Reuse the durable operation reference, show checking status and reconcile |

Repeat the same representative workload with **one change at a time**. Record request count, success and timeout rates, p50/p95/p99, throughput, allocation rate, pause distribution, CPU, RSS and post-GC live set. Confirm order totals and financial invariants. No numerical gain is claimed by this lesson.

The lab’s before/after comparison is a **decision comparison**: blindly tune from a spinner versus collect evidence and validate a targeted change. It is not a fabricated before/after performance result.

## 10. Run the teaching checks

```text
javac -d .cache/episode017/java public/blog/episodes/017/examples/CheckoutAllocationExample.java public/blog/episodes/017/examples/PricedCheckoutExample.java public/blog/episodes/017/examples/CheckoutAllocationTest.java
java -cp .cache/episode017/java CheckoutAllocationTest
node --test tests/gc-diagnosis.test.ts
```

The Java examples and diagnostic math are correctness checks. They do not run a live payment, database, Spring Boot registry, controlled workload benchmark or actual GC-pause simulation. The original lab and video assets remain preserved.

## 11. Interview questions and practice

**Does every GC phase pause application threads?** No. Modern collectors have concurrent phases as well as stop-the-world phases.

**Does overlap prove causation?** No. Inspect the same-server critical path, competing causes and controlled experiments. Overlapping waits cannot simply be added together.

**Will increasing heap or switching to ZGC always help?** No. Resource limits, retention, workload and collector trade-offs matter. Validate the full customer-facing objective.

**What should we improve first?** A measured hotspot or bottleneck. Preserve checkout correctness and change one variable at a time.

Try each lab scenario and predict the next investigation step before revealing the evidence. Reclaim unreachable objects in the heap picture and explain why reachable ones remain. Change the hypothetical object rate and explain why it cannot forecast a real collector’s pause time.

## Primary technical references

- [Java 21 G1 collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector1.html)
- [JEP 439: Generational ZGC in Java 21](https://openjdk.org/jeps/439)
- [Java 21 command and unified logging](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
- [Java 21 jcmd recording commands](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html)
- [Micrometer timers and distribution statistics](https://docs.micrometer.io/micrometer/reference/concepts/timers.html)
