---
title: "PostgreSQL Indexing and Keyset Pagination: Fixing Slow Order History"
slug: "postgresql-indexing-order-history"
folder: "Caching & database performance"
date: "2026-11-05"
description: "Shoppers wait for order history as orders grow. Learn how query shape, composite indexes, EXPLAIN, and keyset pagination reduce unnecessary database work."
tags: ["Java", "Spring Boot", "System design", "E-commerce", "PostgreSQL"]
cover: "/blog/episodes/009/cover.svg"
coverAlt: "PostgreSQL Indexing and Keyset Pagination: Fixing Slow Order History"
draft: false
sample: false
level: "Architecture in Motion · Episode 009"
lab: "/blog/episodes/009/lab.html"
video: "/blog/episodes/009/lesson.mp4"
videoPoster: "/blog/episodes/009/poster.png"
videoCaption: "Supplied narrated architecture lesson · illustrative scenario"
---

## What will you learn?

Shoppers wait for order history as orders grow. Learn how query shape, composite indexes, EXPLAIN, and keyset pagination reduce unnecessary database work.


**Architecture in Motion · Java 21 · Spring Boot · PostgreSQL · Database performance · 1 November 2026**

> A customer opens order history. The API waits. The database CPU rises. A developer adds `LIMIT 20`, yet the page still feels slow. Why? Because limiting the *output* does not necessarily limit the *work*.

**Reading time:** 12–15 minutes · **Difficulty:** beginner → senior engineer · **Lab:** PostgreSQL 15+ · **Performance data:** illustrative unless explicitly captured on your database.

## 1. Business problem: the order-history incident

A retail application stores millions of orders. A customer's order-history endpoint is written as a simple SQL query, but under traffic spikes the query must filter, sort, and skip large result sets. The API may appear healthy at low traffic, then suffer high p95 latency as data grows. An operations dashboard might show CPU, buffer reads, and connection-pool pressure; those are symptoms, not a root-cause proof.

We will diagnose three independent issues: (1) a non-SARGable date filter, (2) an index that does not match the filtering and ordering pattern, and (3) deep `OFFSET` pagination. We'll fix them in that order, measure actual plans, and discuss when a sequential scan is *correct*.

### Architecture and request flow

![Simplified topic overview](/blog/episodes/009/cover.svg)

**Important:** The diagram shows a possible index-driven plan. PostgreSQL chooses plans based on statistics and costs; an index is not guaranteed to be selected.

## 2. Reproduce the issue (PostgreSQL)

```sql
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0)
);
INSERT INTO orders(order_id, customer_id, created_at, status, total_amount) VALUES
(1001,42,'2026-10-30 09:00+00','PAID',49.99),
(1002,42,'2026-10-30 10:00+00','PAID',129.00),
(1003,42,'2026-10-30 10:00+00','SHIPPED',19.50),
(1004,42,'2026-10-31 08:30+00','PAID',240.00),
(1005,42,'2026-10-31 12:00+00','DELIVERED',87.20),
(1006,42,'2026-11-01 06:00+00','PAID',15.00),
(1007,99,'2026-11-01 07:00+00','PAID',600.00),
(1008,42,'2026-11-01 08:00+00','PAID',45.00);
ANALYZE orders;
```

**Challenge:** Return customer 42's newest three orders, deterministically, and then fetch the next three without scanning all earlier pages.

### The tempting query

```sql
SELECT order_id, created_at, total_amount
FROM orders
WHERE customer_id = 42
  AND DATE(created_at AT TIME ZONE 'UTC') >= DATE '2026-10-30'
ORDER BY created_at DESC
LIMIT 3 OFFSET 100000;
```

This query has three flaws: (1) wrapping `created_at` in an expression can prevent an ordinary B-tree index on that column from supporting a direct range condition; (2) ordering by timestamp alone is nondeterministic when two orders share a timestamp; (3) `OFFSET 100000` still requires finding/skipping preceding rows. An expression index can support some function predicates, but it is not our first choice for this range query.

### Better query: half-open range, deterministic keyset

```sql
CREATE INDEX idx_orders_customer_created_id
ON orders (customer_id, created_at DESC, order_id DESC)
INCLUDE (status, total_amount);

-- First page: customer 42, newest three orders
SELECT order_id, created_at, status, total_amount
FROM orders
WHERE customer_id = 42
  AND created_at >= TIMESTAMPTZ '2026-10-30 00:00+00'
  AND created_at <  TIMESTAMPTZ '2026-11-02 00:00+00'
ORDER BY created_at DESC, order_id DESC
LIMIT 3;

-- Next page: cursor is the LAST row returned on the previous page.
-- For this sample, that row is (2026-10-31 12:00+00, 1005).
SELECT order_id, created_at, status, total_amount
FROM orders
WHERE customer_id = 42
  AND created_at >= TIMESTAMPTZ '2026-10-30 00:00+00'
  AND created_at <  TIMESTAMPTZ '2026-11-02 00:00+00'
  AND (created_at, order_id) <
      (TIMESTAMPTZ '2026-10-31 12:00+00', 1005)
ORDER BY created_at DESC, order_id DESC
LIMIT 3;
```

**Expected first page** (descending): `(1008, 2026-11-01 08:00, $45.00)`, `(1006, 2026-11-01 06:00, $15.00)`, `(1005, 2026-10-31 12:00, $87.20)`.

**Expected second page:** `(1004, 2026-10-31 08:30, $240.00)`, `(1003, 2026-10-30 10:00, $19.50)`, `(1002, 2026-10-30 10:00, $129.00)`. The timestamp tie is resolved by `order_id DESC`.

**Why it works:** `customer_id` is the equality prefix; `created_at` and `order_id` support the descending order and the lexicographic continuation cursor. The half-open range preserves index-friendly filtering and avoids end-of-day precision bugs. `INCLUDE` stores projected columns in the index, but a true index-only scan also depends on MVCC visibility-map conditions. On a tiny eight-row table, PostgreSQL may prefer a sequential scan; that is normal.

### Line-by-line mental model

1. `customer_id = 42` restricts the customer's partition of the logical index keyspace.
2. `created_at >= start AND created_at < end` defines a precise half-open UTC range. Convert user-local day boundaries to UTC in the application.
3. `(created_at, order_id) < (cursor_time, cursor_id)` continues after the last seen pair; both columns are non-null and sorted descending.
4. `ORDER BY created_at DESC, order_id DESC` makes the result stable even for tied timestamps.
5. `LIMIT 3` bounds the returned rows. For API pagination, fetch `pageSize + 1` to calculate `hasNext`.

## 3. Diagnose instead of guessing

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT order_id, created_at, status, total_amount
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC, order_id DESC
LIMIT 3;
```

`EXPLAIN` describes a plan; `ANALYZE` executes the statement; `BUFFERS` exposes shared-block activity. Compare estimated versus actual rows, sort nodes, buffer hits/reads, execution time, and repeated runs under controlled conditions. Never compare made-up '12 seconds before, 30 ms after' numbers as measured evidence. Query plans can change with data distribution, statistics, and PostgreSQL version. `EXPLAIN ANALYZE` on data-modifying SQL **actually modifies data** unless you wrap it in a transaction and roll it back.

**Illustrative plan shapes, NOT captured plans:**

```text
BEFORE (possible): Limit → Sort → Seq Scan on orders
AFTER  (possible): Limit → Index Scan using idx_orders_customer_created_id
```

An index is not a free performance upgrade. It consumes disk and memory, slows inserts/updates, increases WAL, and may have poor selectivity for some predicates. Validate with realistic data, including cold/warm cache behavior and representative customer skew.

## 4. Java 21 + Spring Boot implementation

Use a parameterized JDBC query with a customer ID derived from authentication, not from a user-supplied query string. This sample uses an exclusive cursor and a fixed high sentinel for the first page. In production, encode cursor values in an authenticated, tamper-evident token bound to customer and filters; validate max page size and cursor lifetime.

```java
package example.orders;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class OrderHistoryRepository {
  private final NamedParameterJdbcTemplate jdbc;
  public OrderHistoryRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }

  public record OrderRow(long orderId, Instant createdAt,
                         String status, BigDecimal totalAmount) {}

  private static final RowMapper<OrderRow> MAPPER = (rs, rowNum) ->
      new OrderRow(rs.getLong("order_id"),
          rs.getTimestamp("created_at").toInstant(),
          rs.getString("status"), rs.getBigDecimal("total_amount"));

  public List<OrderRow> findPage(long authenticatedCustomerId,
                                  Instant startUtc, Instant endUtc,
                                  Instant beforeUtc, long beforeOrderId,
                                  int requestedSize) {
    if (authenticatedCustomerId <= 0 || !startUtc.isBefore(endUtc)
        || requestedSize < 1 || requestedSize > 100) {
      throw new IllegalArgumentException("Invalid order-history parameters");
    }
    String sql = """
        SELECT order_id, created_at, status, total_amount
        FROM orders
        WHERE customer_id = :customerId
          AND created_at >= :startUtc
          AND created_at < :endUtc
          AND (created_at, order_id) < (:beforeUtc, :beforeId)
        ORDER BY created_at DESC, order_id DESC
        LIMIT :limit
        """;
    return jdbc.query(sql, Map.of(
        "customerId", authenticatedCustomerId,
        "startUtc", java.sql.Timestamp.from(startUtc),
        "endUtc", java.sql.Timestamp.from(endUtc),
        "beforeUtc", java.sql.Timestamp.from(beforeUtc),
        "beforeId", beforeOrderId,
        "limit", requestedSize + 1), MAPPER);
  }
}
```

**First-page cursor:** `beforeUtc = 9999-12-31T00:00:00Z`, `beforeOrderId = Long.MAX_VALUE` (or use a separate first-page SQL without a cursor predicate). The method returns `requestedSize + 1` rows intentionally; service code should trim to `requestedSize`, build the next cursor from the last returned row, and sign it. Do not expose the extra row as part of the current page. For a public API, consider a snapshot cutoff to prevent newly inserted rows from shifting the apparent browsing window; keyset reduces but does not eliminate all concurrent-update anomalies.

### Production safety checklist

- **Security:** authenticated customer ID; tenant scoping; parameterized SQL; opaque HMAC-signed cursors; least-privilege database credentials; avoid logging PII and cursor contents.
- **Performance:** monitor p50/p95/p99, `pg_stat_statements` where enabled, `EXPLAIN (ANALYZE, BUFFERS)`, buffer read ratios, rows examined, HikariCP wait time; tune after measurement.
- **Scale:** index based on workload; cap page size; cache selectively; use read replicas only when stale reads are acceptable; avoid unnecessary total-count queries.
- **Failure modes:** slow queries can exhaust the connection pool; enforce query/transaction timeouts, cancel abandoned requests, and return controlled errors rather than spawning unbounded retries.
- **Correctness:** `created_at` and `order_id` must be non-null and immutable for stable keyset semantics; define time zone boundaries explicitly; use a tie-breaker.
- **Operations:** use `CREATE INDEX CONCURRENTLY` on large live PostgreSQL tables when appropriate (cannot run inside a transaction block); assess extra write load, disk capacity and replication lag.

## 5. Trade-offs: when NOT to use this design

`OFFSET` is fine for small admin lists and jump-to-page UIs where absolute page numbers matter. Keyset pagination excels for forward/backward sequential browsing and large histories, but does not naturally support 'go to page 700'. A single composite index will not accelerate every possible filter combination. For broad analytical queries or large fractions of a table, a sequential scan can be cheaper. Index-only scans are not guaranteed just because all selected columns appear in an index.

### SQL Server / DP-800 translation

The same principles apply in T-SQL, but syntax and optimizer details differ:

```sql
-- SQL Server T-SQL (assumes dbo.Orders with datetime2 UTC timestamps)
CREATE INDEX IX_Orders_Customer_Created_Id
ON dbo.Orders (CustomerId, CreatedAt DESC, OrderId DESC)
INCLUDE (Status, TotalAmount);

SELECT TOP (20) OrderId, CreatedAt, Status, TotalAmount
FROM dbo.Orders
WHERE CustomerId = @CustomerId
  AND CreatedAt >= @StartUtc
  AND CreatedAt < @EndUtc
  AND (CreatedAt < @BeforeUtc
       OR (CreatedAt = @BeforeUtc AND OrderId < @BeforeId))
ORDER BY CreatedAt DESC, OrderId DESC;
```

SQL Server does not support PostgreSQL's row-constructor comparison syntax for this query. Inspect *actual execution plans*, logical reads (`SET STATISTICS IO ON`), Query Store when enabled, and cardinality estimates. SARGable half-open ranges and appropriate index key order matter in both engines; plans and cost estimates are engine-specific.

## 6. Interactive lab: three experiments

**Experiment A — SARGability:** Toggle `DATE(created_at)` versus a half-open timestamp range. Observe the *illustrative* number of rows the simulator considers eligible for index-range filtering.

**Experiment B — Pagination:** Increase the page number with `OFFSET` and compare it with a keyset cursor. Watch how skipped rows grow even though the result page stays at 20.

**Experiment C — Composite index:** Change the index prefix from `(created_at, customer_id)` to `(customer_id, created_at, order_id)` and observe how equality prefix and sort compatibility change the model. This is a teaching simulation, not a PostgreSQL query planner.

**Picture ideas:** animated B-tree seeking into a customer's key range; 100,000 skipped rows streaming past a 20-row output; red `DATE(column)` expression changing to a green half-open range; buffer-read meter and connection-pool queue.

## 7. Practice: beginner → architect

Start with the [order history lab](#interactive-lab). Save the first page, insert a newer order, and fetch page two with OFFSET. Then fetch it again using the saved keyset cursor. Check which method repeats order #104 and how the order ID breaks the timestamp tie.

**Exercise 1 (beginner):** Return orders for customer 42 created on 2026-10-31 UTC, without wrapping `created_at` in a function.

<details><summary>Solution</summary>

```sql
SELECT order_id FROM orders
WHERE customer_id = 42
  AND created_at >= TIMESTAMPTZ '2026-10-31 00:00+00'
  AND created_at < TIMESTAMPTZ '2026-11-01 00:00+00'
ORDER BY created_at DESC, order_id DESC;
```

Expected IDs: 1005, 1004.
</details>

**Exercise 2 (intermediate):** Fetch the two records after `(2026-11-01 06:00+00, 1006)` for customer 42.

<details><summary>Solution</summary>

```sql
SELECT order_id FROM orders
WHERE customer_id = 42
AND (created_at, order_id) < (TIMESTAMPTZ '2026-11-01 06:00+00', 1006)
ORDER BY created_at DESC, order_id DESC
LIMIT 2;
```

Expected IDs: 1005, 1004.
</details>

**Exercise 3 (architect):** Explain why a covering index might still trigger heap reads and design a rollout plan for a 200-million-row production table.

<details><summary>Solution sketch</summary>

PostgreSQL MVCC visibility rules can require heap visits even when all projected columns exist in the index. Capture real `EXPLAIN (ANALYZE, BUFFERS)` plans and workload statistics; evaluate index size/write amplification, deploy with `CREATE INDEX CONCURRENTLY` outside a transaction, monitor disk/WAL/replication lag, validate p95/p99 and rollback by dropping the index concurrently if warranted.
</details>

## 8. Senior engineer interview Q&A

**Q: Does `LIMIT 20` guarantee reading 20 rows?** No. The database may scan, filter, sort, or skip many more rows to determine those 20.

**Q: Why add `order_id` to `ORDER BY`?** To break ties deterministically. Without a unique final key, keyset pagination can duplicate or omit tied rows.

**Q: Why might PostgreSQL ignore an index?** Small tables, low selectivity, stale statistics, I/O cost, or an index order that does not help the predicate/order.

**Q: Is `EXPLAIN ANALYZE` safe on UPDATE?** It executes the UPDATE. Wrap in `BEGIN; ... ROLLBACK;` in an appropriate test context.

**Q: Is a covering index always an index-only scan?** No. PostgreSQL's visibility map and MVCC may still require heap access.

**Q: What is the primary cost of deep OFFSET?** Finding and discarding preceding qualifying rows; the returned page size is not the full work size.

## 9. A useful mental model

A database index is like a well-organized library catalog. It helps only if you ask a question that aligns with how the catalog is organized. A query that changes the indexed value with a function, requests a different order, or skips 100,000 entries can still require substantial work. **Optimize the access path, not just the SQL syntax.**

### LinkedIn teaser

**Your SQL query returns only 20 rows. So why does it scan thousands?**

In Episode 009 of *Architecture in Motion*, I walk through a real e-commerce order-history problem: SARGable date filters, composite B-tree indexes, `EXPLAIN (ANALYZE, BUFFERS)`, and keyset pagination with Java 21 + Spring Boot. The interactive lab shows why `LIMIT 20` isn't a performance strategy. The simulation is conceptual—not a benchmark. #Java #SpringBoot #PostgreSQL #SQLPerformance #SystemDesign

### DEV.to teaser

**Why your order-history API gets slower as your database grows** — a beginner-friendly but production-grade guide to query plans, composite indexes, half-open date ranges, and keyset pagination. Includes runnable SQL, Spring Boot repository code, an interactive explainer, exercises, and architect interview Q&A.

### References (official documentation)

- PostgreSQL EXPLAIN: https://www.postgresql.org/docs/current/sql-explain.html
- PostgreSQL multicolumn indexes: https://www.postgresql.org/docs/current/indexes-multicolumn.html
- PostgreSQL index-only scans: https://www.postgresql.org/docs/current/indexes-index-only-scans.html
- PostgreSQL partial indexes: https://www.postgresql.org/docs/current/indexes-partial.html
- Spring Data JPA keyset scrolling: https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#repositories.scrolling

*Editorial note: no live performance measurements were conducted for this episode. All numbers in visual simulations are illustrative and explicitly labeled.*
