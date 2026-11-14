# Architecture in Motion 018 — The Checkout That Got Slower Every Hour: Diagnosing Java Memory Leaks

**Hook:** At 9 AM, checkout responds normally. By lunchtime, customers see spinning buttons and timeouts. Restarting the service restores speed—until it happens again. What if the database is healthy, but the Java heap keeps retaining abandoned checkout sessions?

## The real customer problem
During a promotional sale, customers see slow cart updates, delayed payment confirmation, and intermittent HTTP 503 responses. They retry because they cannot tell whether the first request succeeded. These are illustrative symptoms, not observations from a real incident.

## What is a memory leak in Java?
A Java memory leak is *unwanted retention*: objects remain reachable from GC roots even though the application no longer needs them. Garbage collection correctly preserves reachable objects; it cannot infer business usefulness. A static map holding cart sessions forever is a common example. A rising heap alone is not proof: healthy caches and allocation bursts can also grow usage.

## Request and failure path
1. Client sends cart update through API gateway to Spring Boot checkout service.
2. A session-tracking component inserts the customer's cart snapshot into a process-wide map.
3. The map never evicts entries. The objects remain strongly reachable after sessions expire.
4. Old-generation occupancy rises, GC frequency and CPU pressure may rise, and eventually allocation can fail with OutOfMemoryError.
5. The gateway reports slow responses or 5xx; customer retries risk duplicated business actions unless checkout has durable idempotency.

## Investigation before changing code
* Record heap usage *after GC*, allocation rate, GC pauses, live threads, RSS, and checkout p95/p99 over time. Correlation is evidence, not proof.
* Enable Java Flight Recorder in a controlled environment; capture `jcmd <pid> GC.heap_dump /secure/path/heap.hprof` when permitted. Heap dumps can contain credentials and personal data; encrypt, restrict access, and apply retention policies.
* Compare dominator trees and retained sizes across two dumps; find which GC roots keep cart objects alive.
* Use a controlled load test with bounded requests; measure retained objects after explicit workload completion, not fabricated latency numbers.
* Examine alternatives: direct/native memory, Metaspace, thread stacks, connection pools, caches, and Kubernetes memory limits.

## Before: an unbounded retention bug
```java
private static final Map<String, CartSnapshot> SESSIONS = new ConcurrentHashMap<>();
public void remember(String id, CartSnapshot cart) { SESSIONS.put(id, cart); }
```
This thread-safe map prevents races but does not solve retention; it is not a production session store.

## After: bounded and expiring cache
The runnable Java 21 example in `code/RetentionLab.java` implements a size-bounded map for demonstration (TTL is shown separately in the Caffeine example). In Spring Boot, use a maintained cache library such as Caffeine with `maximumSize` and `expireAfterAccess`, or use Redis with explicit TTL for cross-instance session data. Never store payment secrets or sensitive card data in a session cache.

```java
@Bean
Cache<String, CartSnapshot> cartCache() {
    return Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterAccess(Duration.ofMinutes(20))
        .recordStats()
        .build();
}
```
Add the `com.github.ben-manes.caffeine:caffeine` dependency when using this Spring configuration. Cache expiry is not a replacement for persistent order state, distributed coordination, or payment idempotency.

## Trade-offs, scale and resilience
A local cache is fast but per-instance; requests routed to another pod may miss. Redis offers shared state but adds network latency and an operational dependency. TTL and size limits prevent indefinite retention but may evict active carts; design graceful misses and persistent cart recovery. Avoid unbounded cardinality in metric labels and logs. Alert on *post-GC live-set growth*, sustained GC overhead, OOM restarts, and customer latency. Set heap and container limits together, leaving native-memory headroom.

## Security and validation
Restrict heap dump access; sanitize logs; protect session identifiers; avoid secrets in caches. Test expiry, capacity, concurrency, multi-pod behavior, graceful cache misses, and duplicate checkout submissions. Confirm improvement using the same workload and heap/JFR analysis; do not declare success based on a single restart.

## Common pitfalls
* Calling every rising heap chart a leak.
* Increasing `-Xmx` indefinitely instead of finding retention roots.
* Treating `ConcurrentHashMap` as a bounded cache.
* Assuming a GC change repairs an application-level leak.
* Using `System.gc()` as a production fix.

## Interview Q&A
**Q: Why doesn't GC remove unused cart sessions?** Because a static map still strongly references them.
**Q: What is retained size?** The memory that becomes reclaimable if an object and its exclusively dominated objects become unreachable.
**Q: Heap leak or native leak?** Heap dumps primarily explain Java heap retention; compare process RSS and native memory tracking for off-heap growth.
**Q: Why not simply restart?** Restart temporarily releases retained memory but does not repair the underlying lifecycle bug.
**Q: Which customer metric matters?** Checkout success rate and tail latency, correlated with heap and GC telemetry.

## Three hands-on exercises
1. Run `RetentionLab.java` and compare bounded vs unbounded entries after 20,000 insertions.
2. Add a TTL expiration test with a fake clock, and prove stale entries disappear without sleeping.
3. Design a two-pod checkout where cache eviction cannot lose committed orders or duplicate payment capture.

## Visual and interactive concepts
A six-section persistent architecture board: customer symptoms, request path, retained references, GC pressure, diagnosis, and bounded-cache recovery. Each section stays on screen; only the active section pulses. The included interactive simulation is conceptual, not a measured JVM benchmark.

## Key takeaway
**Garbage collection reclaims unreachable memory, not business-obsolete objects.** Diagnose retained references, bound cache lifetimes, and validate customer outcomes under controlled load.
