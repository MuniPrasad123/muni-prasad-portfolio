# Episode 017 — Java Garbage Collection: The 2-Second Checkout Pause Nobody Expected

**Architecture in Motion | Java 21 / Spring Boot / JVM Reliability**

## The customer problem
During a promotional campaign, customers click **Place Order**. Some see a spinner for two seconds, then retry. Support receives complaints of slow checkout and occasional repeated attempts. The payment provider may be healthy; the application itself can stall due to allocation pressure, garbage collection (GC), CPU contention, or downstream latency. **Do not diagnose GC from latency alone.** Correlate request traces with GC logs and JVM telemetry.

## Fundamentals
Java allocates most ordinary objects on the heap. The garbage collector reclaims unreachable objects. Some phases require application threads to pause (stop-the-world). A low average response time can hide dangerous p99 latency spikes. GC pause duration is not the same as end-to-end request latency: queues, network, database, and payment APIs also contribute.

## Architecture and data path
Customer → Gateway → Spring Boot Checkout → Inventory API → Payment API → PostgreSQL. OpenTelemetry traces correlate checkout spans with JVM pause metrics, heap occupancy, allocation rate, CPU, and database pool utilization. A dashboard links spikes in p99 latency to pauses; a load generator reproduces the issue with realistic order payloads. The optimization loop is **measure → attribute → change one variable → retest**.

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
The code example in `code/CheckoutAllocationExample.java` demonstrates a bounded immutable summary instead of repeatedly building oversized debug strings. The accompanying Micrometer example shows a timer for the checkout operation. In a real application use a persistent idempotency key and an outbox for payment side effects.

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

## Visuals
Use the supplied six-section storyboard: customer spinner; checkout path; heap allocation; GC pause; diagnosis; optimized flow. Animated request packets move between services, while a pause indicator briefly freezes the checkout path. All six sections remain on one screen; highlighting moves slowly between sections.

## LinkedIn teaser
A healthy payment gateway doesn't guarantee a fast checkout. In Episode 017, we investigate how Java allocation pressure and garbage collection can contribute to p99 latency—and how to prove the cause before changing JVM flags. The goal is not the smallest pause number; it is reliable customer checkout. #Java21 #SpringBoot #JVM #GarbageCollection #PerformanceEngineering #Ecommerce

## DEV teaser
**Your checkout stalled for two seconds. Was it really GC?** Learn how to correlate traces, GC logs, allocation profiles and business outcomes before tuning G1 or generational ZGC.
