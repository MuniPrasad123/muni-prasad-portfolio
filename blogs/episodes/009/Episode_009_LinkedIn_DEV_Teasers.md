# LinkedIn

**🚨 LIMIT 20. Why does PostgreSQL still work so hard?**

A retail order-history endpoint can return just 20 orders and still scan, sort, or skip far more rows. The mistake is treating output size as query cost.

In **Architecture in Motion — Episode 009**, I explain three production fixes: SARGable timestamp ranges, composite B-tree indexes aligned with the query, and deterministic keyset pagination instead of deep OFFSET.

Includes runnable PostgreSQL SQL, Java 21 + Spring Boot repository code, an animated architecture lesson, and an interactive *conceptual* simulator—not a fabricated benchmark.

**Optimize the access path, not just the SQL syntax.**

#Java #SpringBoot #PostgreSQL #SQL #DatabasePerformance #SystemDesign #BackendEngineering

# DEV.to

**Title:** Your Order History Is Slow: PostgreSQL Indexing, EXPLAIN and Keyset Pagination

A query can return 20 rows while still doing much more work. This hands-on guide shows how to spot non-SARGable date predicates, build a composite B-tree index, replace deep OFFSET pagination with a stable cursor, and verify the actual plan with EXPLAIN ANALYZE BUFFERS. Includes sample data, Java 21 code, a self-contained simulation, and senior engineer interview questions.
