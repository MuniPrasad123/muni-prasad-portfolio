---
title: "Redis Cache Stampede in Spring Boot: Protecting PostgreSQL When Hot Keys Expire"
slug: "redis-cache-stampede-spring-boot"
folder: "Caching & database performance"
date: "2026-11-03"
description: "A popular product’s cache expires. Many shoppers load the same product at once, overloading PostgreSQL and slowing the storefront."
tags: ["Java", "Spring Boot", "Microservices", "System design", "E-commerce"]
cover: "/blog/cache-stampede/cover.svg"
coverAlt: "Redis Cache Stampede in Spring Boot: Protecting PostgreSQL When Hot Keys Expire"
draft: false
sample: false
level: "Architecture in Motion · Episode 006"
simulation: "cache-stampede"
video: "/blog/cache-stampede/lesson.mp4"
videoPoster: "/blog/cache-stampede/poster.png"
videoCaptions: "/blog/cache-stampede/captions.vtt"
videoCaption: "Supplied narrated lesson · illustrative architecture"
---

## What does the shopper experience?

A popular product’s cache expires. Many shoppers load the same product at once, overloading PostgreSQL and slowing the storefront.

## What are we fixing?

Coalesce duplicate loads, coordinate replicas with a bounded Redis lease, and serve permitted stale catalog data while refreshing. Add TTL jitter to spread expirations.


> **A cache is supposed to protect the database. But at 12:00:00, one expired product key can turn thousands of ordinary reads into a database incident.**

**Reading time:** ~12 minutes · **Difficulty:** Beginner → Senior Architect · **Stack:** Java 21, Spring Boot 3.x, Redis, PostgreSQL

## 1. The real-world incident: a product launch turns into a database outage

Picture an e-commerce flash sale. A product-detail page for SKU `SHOE-42` is receiving **1,000 requests per second**. Its product-summary object—title, images, descriptions, category, and a *display-only* price—is cached in Redis for 60 seconds. The PostgreSQL query takes **300 ms** under normal conditions.

At **12:00:00**, `catalog:SHOE-42` expires. All application replicas see a cache miss. Without coordination, every concurrent request attempts to reload the same row. A rough *concurrency* estimate is `arrival_rate × query_time = 1,000 × 0.3 = 300` simultaneous database loads. This is an illustrative steady-state estimate, **not a measured benchmark**; saturation can lengthen query times and amplify the problem.

### What the team sees

- Cache hit rate drops sharply for a hot key; database active sessions and connection-pool wait time rise.
- Product pages become slow, then 5xx errors appear as timeouts and pool exhaustion spread.
- The application itself may be healthy. The failure is the **synchronized cache miss**, also called a *cache stampede* or *thundering herd*.

**Business impact:** Shoppers abandon pages; checkout may be affected if catalog reads share the same database connection pool. The incident is hypothetical but reflects a real production failure class.

## 2. The broken implementation

```java
// Java 21 / Spring Boot 3.x — intentionally unsafe under concurrent misses
public ProductView findProduct(String sku) {
    String key = "catalog:" + sku;
    String cached = redis.opsForValue().get(key);
    if (cached != null) return deserialize(cached);

    ProductView product = repository.load(sku); // EVERY miss can query PostgreSQL
    redis.opsForValue().set(key, serialize(product), Duration.ofSeconds(60));
    return product;
}
```

This is ordinary cache-aside logic. It is fine at low concurrency, but **cache-aside by itself does not coordinate misses**. Adding more application replicas does not solve it; it may create more independent loaders.

## 3. Architecture: protect the database at the cache-miss boundary

![Illustrative architecture](/blog/cache-stampede/cover.svg)

**Read the flow:** A shopper requests a product; the app checks Redis. On a miss, one instance obtains a short **per-key lease** and loads PostgreSQL. Other instances wait briefly, then read the newly populated cache. The lease holder rechecks the cache after acquisition because another loader may have completed between the initial miss and lock acquisition.

## 4. Four defenses—and their limits

| Technique | What it prevents | What it does **not** guarantee | Best use |
|---|---|---|---|
| **Local single-flight** | Duplicate loads within one JVM | Coordination across replicas | One instance, or first defense before distributed coordination |
| **Redis per-key lease** | Most simultaneous cross-replica loads | Exactly-once loads; lease expiry may allow a second leader | Expensive hot-key regeneration |
| **Stale-while-revalidate (SWR)** | Waiting on a refresh while safe stale data exists | Freshness or correctness for checkout-critical values | Product descriptions, thumbnails, editorial content |
| **TTL jitter / early refresh** | Many different keys expiring at the same instant | A stampede on one extremely popular key | Large catalogs and batch-warmed caches |

**Important nuance:** TTL jitter spreads expiry times **across keys**. It does not prevent thousands of requests for **one** key from missing together. Similarly, Spring `@Cacheable(sync = true)` is a provider-dependent hint, not a blanket guarantee of per-key cross-node coordination. Spring Data Redis's locking cache writer uses a **cache-level** lock for certain cache operations, not the per-product regeneration lease in this article. See the official Spring and Redis documentation linked below.

## 5. The production-oriented Java solution

The following example uses `StringRedisTemplate`, `JdbcTemplate`, and Jackson. It is deliberately bounded: no unending spin loop, no unprotected DB fallback by every follower, and no unsafe `DEL` of another owner's lock. Complete source files and SQL schema are included in the companion package.

```java
@Service
public final class ProductCatalogService {
    private static final Duration LEASE = Duration.ofSeconds(5);
    private static final long WAIT_NANOS = Duration.ofMillis(350).toNanos();
    private static final String UNLOCK = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
          return redis.call('del', KEYS[1])
        else
          return 0
        end
        """;

    private final StringRedisTemplate redis;
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final DefaultRedisScript<Long> unlockScript;

    public ProductCatalogService(StringRedisTemplate redis, JdbcTemplate jdbc,
                                 ObjectMapper json) {
        this.redis = redis;
        this.jdbc = jdbc;
        this.json = json;
        this.unlockScript = new DefaultRedisScript<>(UNLOCK, Long.class);
    }

    public ProductView get(String sku) {
        if (!sku.matches("[A-Za-z0-9_-]{1,64}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid SKU");
        }
        String key = "catalog:" + sku;
        ProductView hit = read(key);
        if (hit != null) return hit;

        String lockKey = "lock:" + key;
        String token = UUID.randomUUID().toString();
        boolean leader = Boolean.TRUE.equals(
            redis.opsForValue().setIfAbsent(lockKey, token, LEASE));

        if (leader) {
            try {
                ProductView winner = read(key); // double-check after lease
                if (winner != null) return winner;

                ProductView loaded = jdbc.queryForObject(
                    "SELECT sku, title, description FROM catalog_product WHERE sku = ?",
                    (rs, row) -> new ProductView(rs.getString("sku"),
                        rs.getString("title"), rs.getString("description")), sku);
                // TTL jitter spreads expiration of *different* keys.
                long seconds = 60 + ThreadLocalRandom.current().nextLong(0, 16);
                redis.opsForValue().set(key, write(loaded), Duration.ofSeconds(seconds));
                return loaded;
            } finally {
                redis.execute(unlockScript, List.of(lockKey), token);
            }
        }

        // Followers have a bounded wait. No duplicate DB fallback.
        long deadline = System.nanoTime() + WAIT_NANOS;
        while (System.nanoTime() < deadline) {
            ProductView ready = read(key);
            if (ready != null) return ready;
            if (Thread.currentThread().isInterrupted()) {
                Thread.currentThread().interrupt();
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Request interrupted");
            }
            LockSupport.parkNanos(Duration.ofMillis(20).toNanos());
        }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
            "Catalog refresh in progress; retry shortly");
    }

    private ProductView read(String key) {
        String raw = redis.opsForValue().get(key);
        if (raw == null) return null;
        try { return json.readValue(raw, ProductView.class); }
        catch (JsonProcessingException e) { throw new IllegalStateException(e); }
    }

    private String write(ProductView view) {
        try { return json.writeValueAsString(view); }
        catch (JsonProcessingException e) { throw new IllegalStateException(e); }
    }
}

public record ProductView(String sku, String title, String description) {}
```

**Imports:** `java.time.Duration`, `java.util.List`, `java.util.UUID`, `java.util.concurrent.ThreadLocalRandom`, `java.util.concurrent.locks.LockSupport`, Jackson, Spring JDBC, Spring Data Redis, Spring HTTP, Spring stereotype, and Spring Web exception types. A complete import-ready file is in `code/`.

### Why each detail matters

1. **Per-key lease:** `SET lock:catalog:SHOE-42 <random-token> NX PX 5000` admits one leader while the lease is valid.
2. **Random token:** Identifies the current owner. Lua compare-and-delete prevents an old leader from removing a new leader's lock after expiry.
3. **Double-check:** Avoids reloading after another request filled the cache between the first read and lock acquisition.
4. **Bounded followers:** Followers retry a few Redis reads, not an unbounded number of PostgreSQL queries.
5. **DB query timeout:** Configure a DB statement timeout below the lease duration; otherwise the lease can expire while a slow leader is still working.
6. **TTL jitter:** Reduces simultaneous expiry across many catalog keys, but is not the core hot-key defense.

**Critical limitation:** A lease is not a database transaction or a fencing token. If a loader pauses beyond its lease, another loader can take over; an old loader may later overwrite a newer cache value. For mutable, correctness-sensitive data, add version-aware cache writes or a generation/fencing scheme, and make the source of truth enforce the invariant. Never treat this example as a mechanism for safely reserving inventory or charging a payment.

### Minimal PostgreSQL fixture

```sql
CREATE TABLE catalog_product (
    sku varchar(64) PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL
);
INSERT INTO catalog_product(sku, title, description)
VALUES ('SHOE-42', 'Trail Runner 42', 'Breathable everyday running shoe');
```

### Minimal Spring configuration

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
  datasource:
    url: jdbc:postgresql://localhost:5432/catalog
    username: catalog
    password: ${DB_PASSWORD}
  jdbc:
    template:
      query-timeout: 2s
server:
  shutdown: graceful
```

This demonstrates a synchronous Spring MVC read path. In a high-throughput service, also size connection pools, apply per-endpoint admission control, and prefer a nonblocking follower strategy when thread usage is material.

## 6. What happens when Redis, the loader, or the database fails?

**Redis unavailable:** The above example fails closed for catalog reads because it cannot coordinate safely. A production system may return a separately stored, explicitly time-limited stale *catalog* snapshot or a controlled 503. Do not unleash unrestricted fallback database reads.

**Leader crashes:** The lease expires; a later request can become the next leader. During the gap, followers wait only within their deadlines and may receive 503.

**Loader exceeds lease:** A second leader may start. Use a short DB timeout, adequate lease budget, metrics, and version-aware writes for mutable content. A Redis lock alone does not ensure exact-once computation.

**Hot-key invalidation:** On a product edit, invalidate or update the appropriate cache key after committing the authoritative change. Beware the race in which an old read populates stale content after invalidation; use source version checks if necessary.

**Pricing and inventory:** Display catalog descriptions can tolerate limited staleness; payment amounts, promotions, and available-to-promise stock must be revalidated against authoritative rules during checkout. Never rely on a stale Redis catalog snapshot to authorize a sale.

## 7. Observability and load-test plan

Instrument `cache_hit`, `cache_miss`, `lease_acquired`, `lease_contended`, `refresh_success`, `refresh_failure`, `follower_timeout`, `cache_age`, and database query duration. Avoid high-cardinality SKU labels in general-purpose metrics; use exemplars or sampled structured logs for hot keys.

**Reproducible test:** Warm one key, wait for its TTL to expire, then send a synchronized burst from 1, 4, and 12 Spring Boot replicas. Compare (a) DB SELECTs per expired key, (b) p95/p99 response time, (c) pool wait, (d) 503 rate, and (e) Redis commands. Also inject a leader crash, Redis outage, and a loader longer than the lease. Test with a real PostgreSQL + Redis deployment before making any performance claim.

**Conceptual example:** At 1,000 RPS and 300 ms DB time, up to roughly 300 overlapping requests can miss before the first fill. A correctly functioning lease design aims for ~1 loader per refresh cycle while the lease remains valid; this is an *idealized model*, not a measured result or strict guarantee.

## 8. Architecture trade-offs

- **Local single-flight:** Cheapest; useful when each replica can afford one duplicate load. With 12 replicas, up to ~12 leaders may still query the DB.
- **Distributed lease:** Stronger load control, but introduces Redis dependency, waiting, lease-expiry races, and extra operations.
- **Stale-while-revalidate:** Often best for product descriptions and images when the business accepts a bounded stale window. Model *soft expiry* separately from *hard expiry*; only one background refresh should run per key.
- **Early refresh:** Reduces the chance of mass expiry at the cost of refreshes before TTL. Combine with jitter for catalogs warmed in bulk.
- **Cache invalidation:** TTL is a freshness budget, not a substitute for update-driven invalidation and source versioning.

## 9. Common mistakes

1. Increasing TTL without changing miss coordination.
2. Believing TTL jitter fixes a single hot key.
3. Calling `DEL lock:key` unconditionally after the lease expires.
4. Letting every follower fall back to PostgreSQL after a short wait.
5. Using `@Cacheable(sync=true)` as a universal distributed mutex.
6. Serving stale payment totals or inventory availability as authoritative.
7. Calling a conceptual request-rate formula a real performance benchmark.

## 10. Interview Q&A

**Q1. Why does a cache stampede happen even with Redis?** Redis stores data; ordinary cache-aside misses are not automatically coalesced. Several clients can observe the same missing key before one populates it.

**Q2. Does `SET NX PX` guarantee exactly one database read?** No. It provides a time-limited lease. A crash, pause, lease expiry, or network partition can permit a later leader while the first is still running.

**Q3. Why compare the random token before deleting a lock?** To avoid deleting a successor's lock after the original lease expires.

**Q4. What is the difference between local single-flight and distributed locking?** Local single-flight merges calls within one process; a distributed lease coordinates across replicas sharing Redis.

**Q5. Why not serve stale inventory at checkout?** Cache freshness is not a transactional inventory guarantee. The checkout path must validate authoritative stock and reserve atomically.

**Q6. Does Spring Data Redis's locking cache writer implement per-SKU single-flight?** Its documented locking writer uses cache-level locking for cache operations. That is different from a dedicated per-key regeneration lease.

## 11. Interactive lab and picture ideas

**Interactive lab:** Sliders for requests/sec, DB query time, and Spring Boot replica count. Switch between naive cache-aside, JVM single-flight, Redis per-key lease, and SWR. Visualize packets, estimated simultaneous misses, estimated DB loads, and blocked vs stale-served requests. Explicitly label the numbers as **conceptual estimates**.

**Illustrations:** (1) The 12:00:00 cache expiry timeline; (2) a 3-column comparison of naive, local, distributed; (3) token-safe lock release; (4) a heatmap of TTL jitter across product keys; (5) a “safe to serve stale?” matrix distinguishing catalog from checkout.

## 12. Practice exercises

**Beginner:** Explain why 1,000 RPS × 300 ms is ~300 overlapping requests, not 1,000 queries per millisecond. **Expected:** It estimates in-flight requests in a 300-ms interval at steady arrival rate.

**Intermediate:** Add a 200-ms follower deadline and a metric for timeouts. Decide whether a 503 or stale product description is appropriate. **Expected:** Bounded wait, observable fallback, no unrestricted DB fan-out.

**Advanced:** Show the lease-expiry race: A acquires a 5-second lease, pauses 6 seconds; B acquires a new lease and populates version 8; A resumes with version 7. Propose version-aware cache writes or fencing and explain why a token-safe unlock alone does not prevent stale overwrites.

## Primary references

- Redis, [Cache-aside pattern](https://redis.io/docs/latest/develop/use-cases/cache-aside/)
- Redis, [Distributed locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)
- Redis, [SET command and token-safe release](https://redis.io/docs/latest/commands/set/)
- Spring Framework, [`@Cacheable(sync=true)` limitations](https://www.springframework.org/spring/docs/6.2.18/javadoc-api/org/springframework/cache/annotation/Cacheable.html)
- Spring Data Redis, [Redis cache writer and cache-level locking](https://docs.spring.io/spring-data/redis/reference/3.5/redis/redis-cache.html)

*All traffic/load figures in this lesson are hypothetical calculations or interactive model outputs. No production or synthetic benchmark has been run for this article.*


