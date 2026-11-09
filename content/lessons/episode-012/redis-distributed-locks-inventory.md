---
title: "Redis Distributed Locks and Fencing: Preventing Stale Inventory Writers"
slug: "redis-distributed-locks-inventory"
folder: "Payments & inventory correctness"
date: "2026-11-05"
description: "A Redis lease expires while a checkout worker pauses. Learn why stale writers still need database invariants, ownership checks, and fencing enforced by the protected resource."
tags: ["Java", "Spring Boot", "System design", "E-commerce", "Redis"]
cover: "/blog/episodes/012/cover.svg"
coverAlt: "Redis Distributed Locks and Fencing: Preventing Stale Inventory Writers"
draft: false
sample: false
level: "Architecture in Motion · Episode 012"
lab: "/blog/episodes/012/lab.html"
video: "/blog/episodes/012/lesson.mp4"
videoPoster: "/blog/episodes/012/poster.png"
videoCaptions: "/blog/episodes/012/captions.vtt"
videoCaption: "Supplied narrated architecture lesson · illustrative scenario"
---

## What will you learn?

A Redis lease expires while a checkout worker pauses. Learn why stale writers still need database invariants, ownership checks, and fencing enforced by the protected resource.


**Java 21 · Spring Boot 3 · Redis · PostgreSQL · Distributed Coordination**

## The customer incident

During a limited-edition sneaker launch, the website says **“Order confirmed”** to two shoppers even though only one pair remains. The second shopper is later refunded. Customer support sees duplicate reservations and a sharp rise in cancellations. The incident is illustrative, not a report of a real customer.

## Trace the failure

Two checkout pods read stock=1. A naive Redis lock `SETNX inventory:sku123 pod-A` appears to serialize them. But the implementation never sets an expiration. If pod A crashes, everyone waits forever. Adding a 10-second TTL avoids permanent lockout, but introduces another failure: A pauses for 12 seconds (GC or downstream timeout), its lease expires, B obtains the lock and reserves stock, then A resumes and also reserves stock. **A Redis lock is a lease, not an unbreakable guarantee of exclusivity.**

## Architecture and guarantees

1. The checkout API validates the shopper and creates an idempotency key for the request.
2. Each pod attempts `SET lock:sku123 <random-token> NX PX 10000` and fails fast or retries with jitter under a strict deadline.
3. Inside the critical section, the **database is the source of truth**: a conditional atomic SQL update decrements stock only when `available > 0`. The affected-row count determines success.
4. Release with an atomic compare-token-and-delete operation, never an unconditional `DEL`.
5. Commit the reservation and transactional outbox in the same PostgreSQL transaction. Publish the order event asynchronously.
6. If lock acquisition fails, return a retryable response or queue fairly; never promise stock without a committed reservation.

**Important:** A token-checked Redis unlock prevents an old owner from deleting a new owner's lock. It does **not** prevent a paused old owner from performing stale writes. The conditional SQL update is the final oversell defense; for general stale-write fencing, use a monotonically increasing fencing token validated by the downstream system. A Redis `INCR` token must not be assumed durable/monotonic across failover without a stronger design.

## Request flow

![Simplified topic overview](/blog/episodes/012/cover.svg)

## Spring Boot implementation notes

The code samples include a Lua compare-and-delete script, Redis acquisition with unique owner tokens, a PostgreSQL conditional stock update, and transaction boundaries. The database update remains mandatory even when Redis locking appears reliable.

## Trade-offs

- **No distributed lock:** For a single inventory row, an atomic SQL update is often simpler, more reliable, and sufficient. Start here.
- **Redis lease:** Useful to reduce contention or coordinate expensive work, but adds operational complexity and lease-expiry hazards.
- **PostgreSQL row lock:** Appropriate when multiple rows must be updated consistently; be mindful of contention and deadlocks.
- **Fencing:** Needed when an expired lock holder can still mutate an external system that cannot otherwise reject stale operations.
- **Scaling:** Partition by SKU and use bounded retry with jitter; hot SKUs still require admission control or queuing.

## Production failure modes and observability

Monitor lock acquisition p95/p99, contention rate, expired leases, retry counts, database zero-row updates, reservation uniqueness conflicts, outbox lag and customer cancellation rate. Inject pod termination, GC pauses longer than TTL, Redis failover, and concurrent 100-client races. The sample simulator is conceptual and reports no real benchmark.

## Security and privacy

Generate lock tokens using a cryptographically secure random source. Namespace keys by environment and tenant; avoid customer PII in keys. Restrict Redis network access and credentials; set request timeouts and enforce authorization at the checkout API.

## Common mistakes

- `SETNX` without TTL: abandoned locks.
- Unconditional `DEL`: old worker deletes a newer worker's lease.
- Assuming lease expiry stops a running process: it does not.
- Trusting Redis lock as the only stock correctness control: overselling risk.
- Retrying payments without idempotency: duplicate charge risk.

## Interview Q&A

**Q: Does Redlock guarantee that an old lock holder cannot write?** No. An expired holder can resume; use downstream fencing or atomic source-of-truth constraints.

**Q: Why compare the lock token on release?** To avoid deleting a lease acquired by another process after expiration.

**Q: Is Redis required to prevent inventory oversell?** No. A conditional database update can guarantee that a stock count never goes negative for the targeted row under proper transactional semantics.

**Q: What happens if the database commit succeeds but HTTP response is lost?** The client retries with the same idempotency key; the API returns the prior reservation outcome rather than decrementing stock again.

## Interactive practice

1. [Open the Redis practice lab](#interactive-lab). Advance one event at a time and track who owns the lease as worker A pauses and worker B takes over.
2. With **Decrement after an earlier stock check**, watch what happens when A resumes after B reserves the final pair.
3. Switch to **Atomically decrement only if stock is positive** and replay the race. Compare the stock and confirmations. Use the last trace entry to explain what the token check protects in both runs.

**Next:** Episode 013 — API Gateway, Load Balancing and Service Discovery.
