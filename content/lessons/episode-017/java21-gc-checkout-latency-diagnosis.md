---
title: "Java 21 Generational ZGC: Diagnosing Slow Product Search"
description: "Why do search results sometimes take two seconds? Understand temporary objects, GC pauses and Java 21 Generational ZGC, then investigate the real bottleneck."
slug: "java21-gc-checkout-latency-diagnosis"
folder: "Java & JVM reliability"
date: "2026-11-14"
updated: "2026-11-25"
tags: ["Java 21","Spring Boot","JVM","Performance"]
cover: "/blog/episodes/017/cover-search.svg"
coverAlt: "Slow product search: diagnose the delay and evaluate Java 21 Generational ZGC"
draft: false
sample: false
level: "Architecture in Motion · Episode 017"
lab: "/blog/episodes/017/lab.html"
overview: {"problem": "Asha searches for running shoes, but results take two seconds. Is memory collection or inventory latency responsible?", "solution": "Compare same-JVM evidence, remove measured allocation waste and evaluate Java 21 Generational ZGC under the same workload.", "note": "Product-search example \u00b7 illustrative evidence, not a benchmark"}
video: "/blog/episodes/017/lesson-search.mp4"
videoPoster: "/blog/episodes/017/poster-search.png"
videoCaptions: "/blog/episodes/017/captions-search.vtt"
videoCaption: "Indian English male neural narration · synchronized captions · illustrative diagnosis"
videoSummary: "A shopper waits for product search. Follow temporary objects, a 300 ms pause within a two-second search, and Java 21 Generational ZGC before validating real improvements."
videoChapters: [{"time": 0.0, "label": "A SHOPPER WAITS FOR RESULTS"}, {"time": 13.533333333333333, "label": "HEAP AND REACHABILITY"}, {"time": 29.5, "label": "COMPARE SAME-SERVER EVIDENCE"}, {"time": 42.5, "label": "REMOVE PROVEN REDUNDANT WORK"}, {"time": 58.333333333333336, "label": "YOUNG AND OLD GENERATIONS"}, {"time": 73.83333333333333, "label": "VALIDATE THE WHOLE SEARCH SERVICE"}]
---

## 1. Searching for shoes should not feel stuck

Asha types **running shoes** and waits for the results. The spinner keeps moving, then the page takes two seconds to respond. She tries again. The service might be waiting for inventory, running a slow query, competing for CPU, or doing memory-management work. A slow search alone does not tell us which one.

Our goal is clear: return correct product prices and availability promptly. This article, its narrated video and its interactive experiment use the same product-search example. All numbers are constructed teaching values, not measurements from this portfolio or a claimed production improvement.

## 2. What happens during a normal search?

Shopper → Java search service → catalogue database and inventory API → build result summaries → return the results.

Java creates objects while doing this work: product summaries, temporary strings and response buffers. The **heap** is the JVM-managed memory holding objects. After a response, many temporary objects become **unreachable**: the application no longer has a live path to them. Garbage collection, or GC, can reclaim that space for future work. Objects still reachable through a cache or another live reference must remain.

Think of clearing a workbench so the next job has room. Collection helps the service keep running; it does not make a slow inventory API answer faster. Some collector phases pause Java application threads, while other work runs concurrently. A JVM pause does not stop the separate inventory service.

## 3. What exactly does Java 21 add?

**Generational ZGC**, delivered in Java 21, separates young and older objects. Many short-lived search temporaries die young, so collecting young objects separately can avoid repeatedly processing the whole older population during young collections. Reachable young objects survive; old objects can also become garbage. Age is not the same as reachability.

ZGC performs most collection work concurrently with application work, with short stop-the-world phases. Generational ZGC aims to reduce allocation stalls and collection overhead compared with non-generational ZGC. That is a reason to evaluate it, not a promise of a particular search latency. G1 is also generational; GC, G1, ZGC and JFR were not all introduced in Java 21.

For JDK 21, explicitly enable it with:

```bash
java -XX:+UseZGC -XX:+ZGenerational -jar search-service.jar
```

Use this exact version context: defaults and flags differ in later JDK releases. Check CPU capacity, heap headroom and your service's real workload before selecting a collector.

## 4. Two-second search does not mean a two-second GC pause

Open the [interactive experiment](#interactive-lab). The article, video and default scenario show these same intervals on the same JVM:

| Evidence | Illustrative interval | Interpretation |
| --- | --- | --- |
| Whole product search | 0–2,000 ms | Customer-facing server request duration |
| GC pause | 500–800 ms | 300 ms of overlapping pause evidence |
| Awaiting inventory response | 900–1,800 ms | 900 ms waiting for another system |

The pause is **300 ms**, not 2,000 ms. These two disjoint intervals cover 1,200 ms; the rest needs more trace evidence. Coverage is not a causal attribution. If a pause lies inside an inventory wait, do not add it twice: the remote system may continue processing while Java is paused. Match timestamps and JVM instance IDs before comparing them.

Try **Slow inventory service** in the lab: there is no overlapping pause and a 1,800 ms inventory span. Collector flags cannot fix that remote delay. Try **Pause inside an inventory wait** to see why overlapping durations must not be double-counted.

## 5. How to see what the feature actually changes

Expand **Java 21 Generational ZGC** in the experiment. Before collection, there are six unreachable young temporaries, three reachable young result objects and three reachable older cache objects. Press **Collect young generation**: the six unreachable young objects become free space; the live objects remain. This deliberately simplified picture explains reachability and generations. It does not implement a JVM collector or predict a pause duration.

The positive improvement to investigate is less memory-management interference with search: fewer allocation stalls and acceptable tail latency while preserving results. The experiment does not fabricate a faster "after" number. A real comparison needs repeated equivalent workloads, the same limits and measured results.

## 6. First remove unnecessary allocation work

Use JFR allocation samples to find a real hotspot. For example, calculate a small stock summary directly instead of serializing the whole result set into an unused debug string on every request. Keep the actual response and prices unchanged.

```java
import java.math.BigDecimal;
import java.util.List;

record Product(String sku, BigDecimal price, boolean available) {}
record SearchSummary(int matched, int available) {}

// Inside your search service class:
static SearchSummary summarize(List<Product> products) {
    int available = 0;
    for (Product product : products) {
        if (product.available()) available++;
    }
    return new SearchSummary(products.size(), available);
}
```

This Java 21-compatible method avoids an unnecessary intermediate collection for this summary; it still allocates the summary object. It is not a replacement for the result payload or a measured optimization. Bound page sizes and caches, preserve accurate price/availability semantics, and do not retain entire result histories accidentally. An unbounded cache retains reachable objects; switching collectors cannot make those objects safely disappear.

Download the [standalone Java example](/blog/episodes/017/examples/SearchAllocationExample.java) and its [executable correctness checks](/blog/episodes/017/examples/SearchAllocationTest.java). Compile both with `javac --release 21` and run `java SearchAllocationTest`. The checks cover counts, availability, unchanged prices, empty results and negative-price rejection; they do not benchmark GC.

## 7. Measure before and after under the same conditions

Capture request traces, GC logs and JFR on the correct instance. For a controlled recording:

```bash
java -XX:+UseZGC -XX:+ZGenerational \
  -Xlog:gc*,safepoint:file=search-gc.log:time,uptime,level,tags \
  -XX:StartFlightRecording=filename=search.jfr,duration=60s,settings=profile \
  -jar search-service.jar
```

In Spring Boot, time the full search operation including failed attempts using Micrometer/Actuator, and correlate it with dependency spans. Use bounded labels such as outcome; do not use search terms, customer IDs or request IDs as metric tags. Protect JFR/log files because recordings can contain operational details.

Compare request p95/p99, throughput, timeouts/errors, allocation rate and stalls, pause distributions, CPU, process memory and post-GC live set. Keep dataset, concurrency, warm-up, CPU/memory limits and dependency behaviour equivalent. Test one variable at a time: allocation change first, then a collector comparison such as G1 versus Generational ZGC. Concurrent collection consumes CPU and needs headroom; a lower pause number alone is not sufficient evidence of a better service.

An average can hide unhappy shoppers: in an invented set of 100 requests, 98 at 200 ms and two at 2,000 ms give a mean of 236 ms and nearest-rank p99 of 2,000 ms. A server timer does not measure the entire browser experience.

## 8. What can still go wrong?

Slow database queries and inventory calls need their own fixes. CPU saturation can delay application and collector work. Retained objects can exhaust memory even with a good collector. Large result pages can create unnecessary allocation pressure. A small heap or constrained container can change the trade-offs. No overlapping pause does not prove GC consumes zero CPU.

Validate correctness as well as speed: the same query should return the expected products, prices and availability under load. Roll back a change that worsens errors, memory use or sustained throughput even if one latency percentile improves.

The original URL and archived checkout-based comparison remain available for continuity. The main explanation, new video and current diagnosis experiment all use product search.

## Further reading

- [OpenJDK JEP 439: Generational ZGC](https://openjdk.org/jeps/439)
- [Oracle Java team's Generational ZGC explainer](https://inside.java/2023/11/28/gen-zgc-explainer/)
- [JDK 21 available collectors](https://docs.oracle.com/en/java/javase/21/gctuning/available-collectors.html)
