---
title: "Redis Distributed Locks and Fencing: Preventing Inventory Overselling"
slug: "redis-distributed-locks-inventory"
folder: "Payments & inventory correctness"
date: "2026-11-05"
updated: "2026-11-14"
description: "Two shoppers try to reserve the last pair of sneakers. Watch an expired Redis lease let an old worker resume, then see how atomic stock checks and fencing prevent unsafe writes."
tags: ["Java", "Spring Boot", "System design", "E-commerce", "Redis", "PostgreSQL"]
cover: "/blog/episodes/012/cover.svg"
coverAlt: "Redis coordinates checkout workers; PostgreSQL validates inventory reservations"
draft: false
sample: false
level: "Architecture in Motion · Episode 012"
lab: "/blog/episodes/012/lab.html"
video: "/blog/episodes/012/lesson.mp4"
videoPoster: "/blog/episodes/012/poster.png"
videoCaptions: "/blog/episodes/012/captions.vtt"
videoCaption: "70-second narrated lesson · English captions · illustrative checkout race"
---

## The customer problem: two stock promises, one pair

A limited-edition sneaker has **one pair left**. Two shoppers press Buy within seconds of each other. An unsafe checkout tells both shoppers that their inventory reservation succeeded. The warehouse can fulfill only one order, so the other shopper faces a cancellation and, if payment was already taken, a refund.

**This lesson is about reserving stock, not charging a card.** A reservation confirmation means the application believes it secured an item. Payment authorization, capture, and final order confirmation are separate steps whose order varies by checkout design. The lab does not simulate them or imply that a successful stock reservation proves payment succeeded.

This is an illustrative failure scenario, not a report of an employer incident or a measured customer outage.

### What should happen normally?

The checkout asks the inventory service to reserve a pair. The service checks and updates available stock in the database as one operation. It commits the reservation before reporting success. A second request then sees that no stock remains and receives a clear sold-out response instead of a promise the store cannot fulfill.

A Redis lock can reduce competing work, but **the database must still validate the stock change**. For a single inventory row, that database check can be sufficient without Redis.

### Why use a distributed lock at all?

Two copies of a Spring Boot application may run on different servers. A Java `synchronized` block in one copy cannot coordinate the other. A shared Redis key can give one worker temporary permission to proceed.

That permission has an expiry time, or **lease**. Expiry lets another worker take over if the first one crashes. It does not terminate the first worker or cancel its database requests.

## Follow the incident in seven steps

Worker A serves shopper A; worker B serves shopper B. The example lease lasts 10 seconds. These timings are simulated, not recommended production settings.

| Time | What happens | Why it matters |
| --- | --- | --- |
| 0s | A obtains a lease and reads one pair available | This read will become stale |
| 1s | A pauses before updating stock | A long garbage-collection pause is one possible cause |
| 10s | A's lease expires | Redis makes the key available; A's process still exists |
| 11s | B obtains a new lease with a different owner token | B is now the current lease holder |
| 12s | B reserves the final pair and commits | Available stock becomes zero |
| 13s | A resumes and attempts its old stock operation | Without a fresh atomic condition, A can create a second reservation |
| 14s | A tries to release its expired lease | Token comparison must prevent A from deleting B's lease |

The unsafe lab deliberately allows an unconditional decrement after A's earlier stock check. It reaches stock **−1**, making the oversell visible. An application that writes a cached absolute value might instead leave stock at zero while still creating two reservations. **A nonnegative-looking counter alone does not prove the reservation records are correct.**

[Try the simulation](#interactive-lab): advance to 13s and compare the shoppers' reservation outcomes with and without a database guard. Then inspect the unlock at 14s.

## Four terms that solve different problems

- **Lease:** permission that lasts for a limited time. Losing it does not stop a running process.
- **Owner token:** a unique value for one lock acquisition. Compare it when releasing the key so an old worker cannot delete someone else's lock.
- **Atomic stock check:** a database operation that checks availability and decrements it together. An earlier application-level read cannot replace it.
- **Fencing token:** an increasing generation number checked by the resource being written. Once the resource has accepted a newer generation, it rejects an older writer.

A random owner token and an increasing fencing token are different things. Neither helps if the database or downstream resource ignores the required checks.

## The solution: coordinate work, validate the write

### 1. Acquire a short-lived lease with an owner token

```text
SET lock:inventory:sku123 <unique-owner-token> NX PX 10000
```

`NX` creates the key only when it is absent; `PX` sets its lifetime in milliseconds. Acquire and set the expiry in the same operation. A separate `SETNX` followed by an expiry command can leave a permanent lock if the process crashes between them.

Use bounded retries with jitter and a request deadline. If the lease cannot be acquired in time, return a retryable result. Do not report a reservation that has not committed.

### 2. Let PostgreSQL make the inventory decision

```sql
UPDATE inventory
SET available = available - 1
WHERE sku = :sku
  AND available > 0
RETURNING available;
```

For the targeted row, **one returned row** means the decrement succeeded; **zero returned rows** means it did not. Confirm a reservation only after the surrounding transaction commits. If the SKU might not exist, distinguish that condition from sold out in the application.

When concurrent updates target this row, PostgreSQL's Read Committed behavior rechecks the `WHERE` condition against the updated row after waiting for the other updater. After B commits stock zero, A's guarded update cannot also decrement it. At stronger isolation levels, handle possible transaction retries rather than assuming every conflict returns zero rows.

The application must commit the stock change and reservation record together. If it publishes an event, record the outbox entry in that transaction too. Enforce uniqueness for the logical reservation request so a retried HTTP call does not consume another pair. A failure while inserting the reservation or outbox must roll back the stock decrement.

A `CHECK (available >= 0)` constraint is useful defense in depth, but it does not replace request uniqueness or transactional reservation records.

### 3. Release only the lease you own

```lua
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
```

Run the comparison and deletion atomically in Redis. At 14s, A supplies token A while the key contains token B, so nothing is deleted. A plain `DEL` would remove B's valid lease.

**This protects the Redis key, not the inventory row.** It cannot undo an unsafe reservation A already wrote at 13s. Redis 8.4 also offers conditional deletion with `DELEX`; the Lua example remains useful for earlier versions.

### 4. Add fencing when the resource must reject stale owners

Imagine A receives generation **41** and B receives **42** from a fencing authority. The protected resource stores the highest generation it has accepted. Once it accepts B's 42, it must reject A's 41 even if A wakes up later.

```sql
-- Illustrative resource-side gate: every relevant write must enforce it.
UPDATE inventory
SET available = available - 1,
    last_fence = :incoming_fence
WHERE sku = :sku
  AND available > 0
  AND last_fence < :incoming_fence
RETURNING available;
```

This simplified example permits one reservation write per fencing generation. A real protocol must define repeated operations, equal tokens, request idempotency, and atomic enforcement for every write path. A fencing gate rejects older generations **after the resource has observed a newer one**; it is not a universal clock that instantly detects lease expiry.

The lab lets you select **Fencing + stock check**. With two pairs available, the plain atomic stock check can correctly accept both distinct requests. With fencing enabled, B's newer accepted generation also causes A's stale write to be rejected; shopper A must retry through a fresh attempt under the application's idempotency policy.

The lab assigns 41 and 42 as conceptual generations. It does not claim that a Redis counter stays monotonic across failover. The issuer and the resource must provide the guarantees the protocol needs.

## What each shopper should be told

| Outcome | Customer response |
| --- | --- |
| Reservation committed | Stock reserved; continue through the remaining checkout steps |
| Another shopper took the last pair | Sold out; do not claim a reservation |
| Lease acquisition timed out | Reservation not yet confirmed; retry within a bounded policy |
| Stale fenced write rejected | Reservation not confirmed for this attempt; resolve or retry safely |
| Database commit result is uncertain | Look up the same reservation request before creating another |

A stock failure after payment authorization needs a void or other compensating action; a captured payment may require a refund. That is a separate payment workflow, covered in the [Saga compensation lesson](/blog/saga-pattern-checkout-compensation). Do not infer a charge from a reservation counter.

## Watch, then test the failure yourself

The supplied video is approximately 70 seconds long. Use the chapter buttons to jump to the customer problem, lease expiry, safe unlock, the database guard, or the reservation transaction. English captions are available in the player. Narration is synthetic.

Then run the same race in the lab:

1. **One pair + atomic stock check:** B succeeds; A receives sold out. Compare this with the unsafe counter of two confirmations.
2. **Two pairs + atomic stock check:** both distinct reservations can succeed. An expired lease does not itself prove the database write is invalid.
3. **Two pairs + fencing and stock check:** B succeeds; A's older generation is rejected despite remaining stock.
4. At the unlock step, explain why B keeps its lease in all three experiments.

Use Previous to revisit a decision, Auto-play to follow the sequence, or pause motion to read at your own pace. The animation only replays the current step visually; it does not create additional reservations.

## Operational limits and failure handling

Start with an atomic database update when it fits the problem. Redis adds a network dependency and contention management; it is not mandatory for this single-row reservation.

Lease renewal can reduce accidental expiry but does not eliminate pauses or network failures. Avoid slow external calls inside critical sections. Do not hold a database transaction open throughout a payment call merely because the lab uses a short example timeline.

Track lease contention, expired leases, zero-row inventory updates, reservation uniqueness conflicts, stale-generation rejections, outbox backlog, and ambiguous request outcomes. Use tenant-scoped keys without private customer data. Test expiry, process pauses, duplicate requests, and dependency failures against the real implementation before relying on it.

This browser model has no actual Redis, PostgreSQL, payment provider, or durable storage. It is designed to explain decisions, not to benchmark or prove a production locking protocol.

## Interview questions

**Does lease expiry stop worker A?** No. A can resume after B acquires the key.

**Does token-safe unlock prevent overselling?** No. It prevents deletion of another owner's lease. The reservation write needs its own correctness checks.

**Is Redis required for this stock row?** No. A properly transactional conditional update and request uniqueness may be sufficient.

**What does fencing add?** Once a resource accepts a newer generation, it rejects writes using older generations. The resource must enforce that rule atomically.

**Can a retry reserve stock again?** It must not reserve again for the same logical request. Persist and retrieve the request outcome using an idempotency key, including when the response was lost.

## References

- [Redis: distributed locks, expiry, and ownership-safe release](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)
- [PostgreSQL: concurrent updates and transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Inventory locking: compare row locks, optimistic checks, and atomic SQL](/blog/pessimistic-vs-optimistic-locking-inventory)
- [Payment idempotency: retry without creating another logical payment](/blog/spring-boot-payment-idempotency-timeouts)
