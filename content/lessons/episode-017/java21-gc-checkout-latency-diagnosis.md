---
title: "Java Garbage Collection: Diagnosing Checkout Latency Before Tuning the JVM"
description: "Some shoppers see checkout stalls even though averages look healthy; a latency spike alone cannot tell whether GC is responsible."
slug: "java21-gc-checkout-latency-diagnosis"
folder: "Java & JVM reliability"
date: "2026-11-14"
tags: ["Java 21","Spring Boot","JVM","Performance"]
cover: "/blog/episodes/017/cover.svg"
coverAlt: "Java Garbage Collection: Diagnosing Checkout Latency Before Tuning the JVM"
draft: false
sample: false
level: "Architecture in Motion · Episode 017"
lab: "/blog/episodes/017/lab.html"
overview: {"problem":"Some shoppers see checkout stalls even though averages look healthy; a latency spike alone cannot tell whether GC is responsible.","solution":"Correlate request traces, GC and safepoint logs, allocation evidence, CPU, and dependency waits before changing one variable.","note":"Illustrative system · supplied narrated video and interactive lab"}
video: "/blog/episodes/017/lesson.mp4"
videoPoster: "/blog/episodes/017/poster.png"
videoCaptions: "/blog/episodes/017/captions.vtt"
videoCaption: "Supplied narrated lesson · English captions · illustrative scenario"
videoSummary: "Some shoppers see checkout stalls even though averages look healthy; a latency spike alone cannot tell whether GC is responsible. Correlate request traces, GC and safepoint logs, allocation evidence, CPU, and dependency waits before changing one variable."
videoChapters: [{"time":0,"label":"The customer symptom"},{"time":19.242,"label":"Allocation pressure inside the JVM"},{"time":39.108,"label":"Correlate evidence before tuning"}]
---

## Start with the customer

A shopper watches checkout freeze briefly, then complete. Before changing JVM settings, find out whether garbage collection actually overlaps the delay.

**Normal behavior:** Requests complete within their budget. Short-lived allocations are reclaimed, and latency measurements include the whole request path.

**What protects the customer:** Correlate request traces, GC and safepoint logs, allocation evidence, CPU, and dependency waits before changing one variable.

This is an illustrative engineering incident, not an employer case study or a performance benchmark. The article, comparison lab, and any supplied video explain the same core failure.

## Follow the incident yourself

[Open the interactive lab](#interactive-lab). Choose **Pause evidence correlates** and predict the outcome before each step. The unsafe and protected paths receive the same situation.

1. **The shopper sees a slow checkout request.** The example timing is illustrative. Request latency includes queues, database work, network waits, and JVM activity. Protected outcome: Collects a correlated trace.
2. **A GC pause overlaps the request.** An overlapping pause supports a contribution from GC; compare other spans and repeat the workload before attributing all delay to it. Protected outcome: Checks pause and allocation evidence.
3. **A profile identifies excessive temporary allocations.** Repeated cart serialization or large debug strings are possible causes, not claims about this portfolio owner’s projects. Protected outcome: Reduces unnecessary allocation.
4. **Repeat a controlled run.** Compare allocation rate, pause distribution, CPU, memory, throughput, and tail latency. The lab asserts no numerical improvement. Protected outcome: Requires measured validation.

Then choose **No GC pause overlaps** to test a different cause or a healthy/control path. Previous revisits the teaching state; Reset starts the experiment again. Autoplay and visual motion have separate pause controls.

## Watch the supplied lesson

The video includes English narration and captions. Use the player to pause, seek, and enable captions, then compare its example with the lab. Narration is synthetic; animations and quantities are illustrative.

**Architecture in Motion | Java 21 / Spring Boot / JVM Reliability**

## The customer problem
During a promotional campaign, customers click **Place Order**. Some see a spinner for two seconds, then retry. Support receives complaints of slow checkout and occasional repeated attempts. The payment provider may be healthy; the application itself can stall due to allocation pressure, garbage collection (GC), CPU contention, or downstream latency. **Do not diagnose GC from latency alone.** Correlate request traces with GC logs and JVM telemetry.

## Fundamentals
Java allocates most ordinary objects on the heap. The garbage collector reclaims unreachable objects. Some phases require application threads to pause (stop-the-world). A low average response time can hide dangerous p99 latency spikes. GC pause duration is not the same as end-to-end request latency: queues, network, database, and payment APIs also contribute.

## Why allocation pressure happens
A naïve checkout implementation may materialize enormous cart representations, serialize the same payload repeatedly, retain per-request buffers, and log full JSON objects. High allocation rates cause more frequent collections; oversized heaps can also increase memory footprint. Long-lived caches may retain objects and pressure old generations. Avoid assuming a single collector solves all workloads.

## Step-by-step design
1. Establish customer-facing SLOs: p95/p99 checkout latency, timeout rate, successful order creation, and retry rate.
2. Enable production-safe GC logging (`-Xlog:gc*,safepoint:file=/logs/gc.log:time,uptime,level,tags:filecount=5,filesize=20M`) and expose Micrometer JVM metrics; control access to logs.
3. Correlate request trace timestamps with GC pause durations and CPU, network, pool wait, and provider latency.
4. Use Java Flight Recorder in a representative environment to identify allocation hotspots and object retention. Handle recordings as potentially sensitive.
5. Reduce unnecessary temporary objects, cap payload sizes, stream large responses where suitable, and avoid unbounded caches. Verify correctness.
6. Compare G1 and ZGC on the same JDK, heap budget, workload, hardware and warm-up period. Java 21 supports generational ZGC via `-XX:+UseZGC -XX:+ZGenerational`; G1 is the default in common server configurations. **Do not assume ZGC is always faster**: compare CPU, throughput, pause times and memory footprint.
7. Apply checkout idempotency and payment reconciliation so user retries cannot create duplicate business effects; GC tuning alone cannot provide correctness.

## Java 21 / Spring Boot example
The code example in [CheckoutAllocationExample.java](/blog/episodes/017/examples/CheckoutAllocationExample.java) demonstrates a bounded immutable summary instead of repeatedly building oversized debug strings. The accompanying Micrometer example shows a timer for the checkout operation. In a real application use a persistent idempotency key and an outbox for payment side effects.

## Trade-offs
G1 generally offers a balanced throughput/latency profile and broad operational familiarity. Generational ZGC targets very low pause times, but may require more CPU and memory headroom. A larger heap can reduce collection frequency while increasing footprint and potentially delaying discovery of retention bugs. A smaller heap can increase collection frequency. Benchmark with your actual allocation profile and deployment limits.

## Failure modes and security
Watch for out-of-memory errors, container OOM kills, heap growth, excessive safepoints, thread-pool saturation and slow downstream dependencies. Heap dumps, JFR recordings and logs can contain customer data; restrict access and retention. Never log payment credentials or full personal data. Alert on latency SLO breaches, not solely on GC counts.

## Validation checklist
Record baseline and after-change p50/p95/p99 latency, allocation MB/s, GC pause distribution, throughput, CPU, heap occupancy, errors, and payment reconciliation outcomes. Repeat controlled runs. No numerical improvement is claimed without an actual benchmark.

## Pitfalls
- Treating every latency spike as GC.
- Optimizing average latency while ignoring p99.
- Selecting a collector based on marketing claims rather than measured workload.
- Using unlimited caching or giant in-memory order snapshots.
- Ignoring duplicate retries after checkout timeouts.

## Interview Q&A
**Q: Does GC stop every thread for every phase?** No. Modern collectors have concurrent phases, though some safepoint pauses remain.
**Q: Does a virtual thread eliminate GC pauses?** No. Virtual threads reduce blocking-thread cost; they still allocate objects on the managed heap.
**Q: Why use p99?** It exposes the slowest one percent of requests and can reveal customer-visible stalls obscured by averages.
**Q: When would you consider ZGC?** When measured pause sensitivity justifies evaluating its resource trade-offs under realistic load.

## Hands-on exercise
Run a checkout workload; collect GC logs and request latency. Inject temporary allocation pressure in a staging-only build, compare the timeline, then remove it. Explain which evidence proves or disproves GC as the root cause. Never intentionally stress production.

## Teaching source files

- [CheckoutAllocationExample.java](/blog/episodes/017/examples/CheckoutAllocationExample.java)
- [CheckoutMetricsExample.java](/blog/episodes/017/examples/CheckoutMetricsExample.java)

These are supplied teaching examples, not a complete deployable checkout service. They have not been executed as JVM or database tests in this integration. Read their dependencies and limits before running them in an isolated environment.

## Primary references used for this lesson

- [Reference 1](https://docs.oracle.com/en/java/javase/21/gctuning/)
- [Reference 2](https://docs.oracle.com/en/java/javase/21/jfr/)
