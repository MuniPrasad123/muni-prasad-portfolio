# Java 21 Garbage Collection: Why does checkout suddenly freeze?

## Start with the shopper
Asha presses Place Order. The spinner freezes, then checkout completes. Another shopper gets a timeout. Asha wonders whether to pay again. This fictional incident illustrates a real class of reliability problems; it is not an employer incident or measured benchmark.

## What is garbage collection?
Imagine a kitchen with a workbench. Every cart calculation creates temporary objects: price summaries, discount results and response data. The Java heap is the workbench. Objects still reachable by the application must stay; unreachable objects can be reclaimed by the garbage collector. Unlike a human cleaner, a collector uses reachability, not whether an object seems useful. Some phases pause application threads; other work runs concurrently. A pause is not necessarily a full collection.

## Why a healthy average hides unhappy customers
Suppose 98 requests take 200 ms and two take 2,000 ms. The mean is 236 ms; the nearest-rank p99 is 2,000 ms. These invented numbers explain tail latency, not an observed workload. A slow request may include queueing, database waits, network delays, CPU contention and pauses. Do not add overlapping intervals blindly.

## Follow the request
Customer → gateway → checkout JVM → database and payment provider. Checkout creates temporary objects on the heap. GC and safepoints, request spans, connection pool waits and CPU metrics feed the diagnostic timeline. The diagram in architecture.mmd shows the evidence path.

## Investigate before tuning
1. Establish checkout success, timeout, p95/p99 and retry objectives. Record per-instance metrics and synchronized timestamps.
2. Enable rotating Java 21 GC/safepoint logs: `-Xlog:gc*,safepoint:file=gc.log:time,uptime,level,tags:filecount=5,filesize=20M`. Ensure a writable directory and retention limits.
3. Correlate a slow request with pause intervals on the same JVM instance. Overlap supports a possible contribution but does not prove the entire delay. Compare database and payment spans, CPU throttling, executor queues and connection waits. If no pause overlaps, concurrent GC CPU use may still contribute; investigate rather than dismiss it.
4. Capture a short JFR recording in a controlled environment: `jcmd <pid> JFR.start name=checkout settings=profile duration=60s filename=checkout.jfr`. Inspect allocation samples, GC events, CPU and locks. Allocation samples are not exact counts. Retention requires separate evidence such as old-object samples or controlled heap analysis.
5. Remove repeated serialization and eager debug payload creation. Use compact immutable summaries and bounded caches; do not change tax or discount semantics merely to reduce allocation. See CheckoutAllocationExample.java for an isolated teaching example.
6. Compare G1 (`-XX:+UseG1GC`) and Java 21 generational ZGC (`-XX:+UseZGC -XX:+ZGenerational`) only after establishing a baseline. G1 balances throughput and pause goals; ZGC targets low pauses with potential CPU and memory costs. Neither guarantees a latency target. Keep JDK, traffic mix, warmup, heap and container limits comparable; record repeated trials.
7. Keep payment correctness independent: reuse a durable operation key; if outcome is uncertain show “We're checking your payment” and reconcile with the provider. Never assume timeout means failure.

## Spring Boot integration
Use a Micrometer Timer around the actual checkout operation (including failures), export histogram buckets aligned with the latency SLO, and aggregate across replicas using histogram counts rather than averaging per-instance percentiles. Enable JVM metrics with Actuator and a configured registry. See MetricsExample.java (integration fragment, not standalone).

## Scaling and trade-offs
More replicas may spread allocation load but also increase total memory and database connections. Set container memory above heap needs to account for native memory, threads and JVM overhead; monitor CPU throttling and OOM kills. Larger heaps may reduce collection frequency but increase footprint. Optimize proven hotspots first. Restrict metrics cardinality: never tag by customer or order ID. GC logs, JFR and heap dumps require restricted access, retention and redaction; never log card data.

## Validate the change
Repeat identical staging tests with one change at a time. Record request count, success and timeout rates, p50/p95/p99, throughput, allocation rate, pause distributions, CPU, RSS and post-GC live set. Confirm financial invariants and order correctness. Roll back if resource usage or errors regress. No numerical improvement is claimed here.

## Common pitfalls and interview questions
- Does every GC phase stop all application threads? No; many phases are concurrent.
- Does overlap prove causation? No; compare the critical path and controlled experiments.
- Will virtual threads eliminate GC? No; they still use managed heap objects.
- Does increasing heap always help? No; footprint, retention and container limits matter.
- Why not switch immediately to ZGC? Collector selection requires workload-specific validation.

## Practice
Use the lab to compare a pause overlap with a slow provider and a healthy trace. Predict which evidence to collect before revealing the diagnosis. Then change allocation pressure and explain why no simulated index can predict real G1 pauses.

## Further reading
https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector1.html
https://docs.oracle.com/en/java/javase/21/gctuning/z-garbage-collector.html
