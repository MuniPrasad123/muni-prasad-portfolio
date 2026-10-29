---
title: "Pessimistic vs Optimistic Locking in Spring Boot: Preventing Inventory Overselling"
slug: "pessimistic-vs-optimistic-locking-inventory"
date: "2026-10-30"
description: "Two shoppers try to reserve the last item. Compare row locks, version checks, and atomic SQL updates with a four-mode interactive race simulator."
tags: ["Java 21", "Spring Boot", "PostgreSQL", "JPA", "Concurrency", "Oracle ATG", "E-commerce"]
cover: "/blog/locking/cover.svg"
coverAlt: "Pessimistic and optimistic locking compared with an atomic guarded inventory update."
draft: false
sample: false
level: "Architecture in Motion · Episode 004"
simulation: "locking"
video: "/blog/locking/lesson.mp4"
videoPoster: "/blog/locking/poster.png"
videoCaptions: "/blog/locking/captions.vtt"
videoCaption: "84-second animated lesson · synthetic English narration · illustrative scenario"
---

> **A product page is allowed to be slightly out of date. A purchase promise is not.** Two checkout servers can both see one unit available. The real question is what happens when both try to *reserve* it.

**In this lesson:** the race condition; row locking with PostgreSQL `FOR UPDATE`; JPA `@Version`; atomic conditional updates; trade-offs and deadlocks; retries and idempotency; Oracle ATG integration; reservation expiry; hands-on simulation; interview scenarios. 

**Watch:** [Narrated lesson](#lesson-video). **Try:** [Four-strategy race simulator](#interactive-lab).

*This is a constructed, realistic retail scenario; it is not a claim about an actual customer incident. Simulated request outcomes and timelines are illustrative, not measured database performance.*

## 1. The real-world problem: a flash sale goes wrong

At 12:00:00, SKU `PHONE-256` has **one sellable unit**. The storefront shows it to two buyers. Buyer A uses checkout pod `checkout-1`; Buyer B uses `checkout-2`.

| Sequence | Checkout A | Checkout B |
|---|---|---|
| t0 | `SELECT available` → 1 | `SELECT available` → 1 |
| t1 | validate stock as sufficient | validate stock as sufficient |
| t2 | issue an unconditional stock update | issue an unconditional stock update |
| t3 | create reservation A | create reservation B |
| result | accepts one order | accepts another order |

A naive implementation separates **read**, **decision**, and **write**:

```java
int available = repository.readAvailable(sku);
if (available >= quantity) {
    repository.writeNewAvailable(sku, available - quantity); // stale calculation
    return createReservation(sku, quantity);
}
```

Even if the resulting database stock appears `0` because one update overwrites another, the service might have promised **two units against one physical unit**. If both use unguarded decrements, stock may become negative instead. Putting `@Transactional` around the naive read-and-write does **not automatically protect the business invariant** at PostgreSQL's default `READ COMMITTED` isolation.

**Business impact:** missed fulfillment, payment refunds, order cancellations, support tickets, unreliable OMS quantities, and expensive reconciliation. Our invariant is: `available >= 0` and each reservation must correspond to exactly one successful inventory claim.

## 2. Architecture: where the authoritative decision belongs

![Simplified inventory architecture: two shoppers share a reservation API; PostgreSQL commits the stock claim, reservation and outbox together.](/blog/locking/architecture.svg)

The product-page cache is for *display*. PostgreSQL (or the selected inventory source of truth) decides whether stock can be reserved. A reservation and its inventory update must commit **atomically**, together with a durable idempotency key. Use an outbox for reliable OMS messaging; do not hold database row locks while calling payment gateways or external APIs.

## 3. Strategy A — Pessimistic locking: make the second writer wait

**Mental model:** "I am changing this row now; competing writers must wait." Lock the row inside a short transaction, verify availability, then update stock and create the reservation before committing.

**PostgreSQL:**

```sql
BEGIN;
SELECT available, held
  FROM inventory
 WHERE sku = 'PHONE-256'
 FOR UPDATE;
-- application checks available >= 1
UPDATE inventory
   SET available = available - 1,
       held = held + 1,
       version = version + 1
 WHERE sku = 'PHONE-256';
-- INSERT reservation with unique request key, in this same transaction
COMMIT;
```

Transaction A acquires `FOR UPDATE`. B's conflicting `FOR UPDATE` waits. When A commits, at `READ COMMITTED`, B locks/reads the updated version and finds `available=0`. If A rolls back instead, B can proceed against the restored state. A normal `SELECT` is **not blocked** by this row-level lock; other writers/lockers are. Lock waits are not proof of deadlock.

**Spring Data JPA mapping:**

```java
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Inventory i where i.sku = :sku")
    Optional<Inventory> lockForReservation(@Param("sku") String sku);
}

@Service
@RequiredArgsConstructor
public class PessimisticReservationService {
    private final InventoryRepository inventory;
    private final ReservationRepository reservations;

    @Transactional(timeout = 3)
    public UUID reserve(String sku, int quantity, String customerId, String key) {
        if (quantity <= 0) throw new IllegalArgumentException("quantity");
        Inventory item = inventory.lockForReservation(sku)
                .orElseThrow(SkuNotFoundException::new);
        if (item.getAvailable() < quantity) throw new SoldOutException();
        item.setAvailable(item.getAvailable() - quantity);
        item.setHeld(item.getHeld() + quantity);
        UUID id = UUID.randomUUID();
        reservations.save(new Reservation(id, customerId, key, sku, quantity));
        // JPA dirty checking updates item when transaction flushes.
        return id;
    }
}
```

This fragment shows the lock lifecycle, **not** the complete idempotent reservation implementation. The `reservation` table must have a unique `(customer_id, request_key)` constraint, and duplicate keys must return the original result without decrementing again. Ensure the `Inventory` entity maps its `version` column with `@Version` if mixed writers use version checks. Pessimistic locking **does not mean a Redis lock**: the database coordinates the conflicting transactions across application replicas.

**Good when:** frequent contention on a few hot SKUs, strict serial decision-making, short DB-only critical sections.

**Costs:** queueing, throughput bottlenecks, lock timeouts, possible deadlocks (especially multi-SKU orders), and higher tail latency. Use consistent SKU lock ordering, instrument wait times, bound transaction duration, and retry whole transactions after retriable deadlocks. `NOWAIT` fails immediately; `SKIP LOCKED` is useful for worker queues, **not** for silently skipping an inventory SKU in customer checkout.

## 4. Strategy B — Optimistic locking: compare the version at write time

**Mental model:** "Don't block readers now; reject a stale writer at commit/flush." Add a numeric version field. Every successful update changes the version, so a competing writer with an older version cannot silently overwrite it.

```sql
CREATE TABLE inventory (
  sku text PRIMARY KEY,
  available integer NOT NULL CHECK (available >= 0),
  held integer NOT NULL DEFAULT 0 CHECK (held >= 0),
  version bigint NOT NULL DEFAULT 0
);
INSERT INTO inventory VALUES ('PHONE-256', 1, 0, 5);
```

**JPA entity (abbreviated):**

```java
@Entity
@Table(name = "inventory")
public class Inventory {
    @Id private String sku;
    @Column(nullable = false) private int available;
    @Column(nullable = false) private int held;
    @Version @Column(nullable = false) private long version;
    // public no-args constructor and accessors omitted
}
```

**Service, requiring a real transaction:**

```java
@Service
@RequiredArgsConstructor
public class OptimisticReservationService {
    private final InventoryRepository inventory;
    private final ReservationRepository reservations;

    @Transactional
    public UUID reserve(String sku, int quantity, String customerId, String key) {
        if (quantity <= 0) throw new IllegalArgumentException("quantity");
        Inventory item = inventory.findById(sku).orElseThrow(SkuNotFoundException::new);
        if (item.getAvailable() < quantity) throw new SoldOutException();
        item.setAvailable(item.getAvailable() - quantity);
        item.setHeld(item.getHeld() + quantity);
        UUID id = UUID.randomUUID();
        reservations.save(new Reservation(id, customerId, key, sku, quantity));
        // @Version is verified on flush/commit; losing transaction rolls back.
        return id;
    }
}
```

JPA/Hibernate conceptually issues a version-checked update like this:

```sql
UPDATE inventory
   SET available = 0, held = 1, version = 6
 WHERE sku = 'PHONE-256' AND version = 5;
```

The first update affects one row. The second update based on `version=5` affects **zero**, so the ORM raises an optimistic-lock exception (often translated by Spring into an `OptimisticLockingFailureException`). The losing transaction must roll back its reservation insert too.

**Do not catch the conflict inside the same rollback-only transaction and keep going.** Retry, when appropriate, from an **outer boundary using a new transaction**, reload current stock, and use a bounded retry policy. On the last remaining unit the correct next result is generally **sold out**, not an endless retry. Two app instances can share this strategy because the version comparison happens in the database.

**Good when:** conflicts are uncommon, different SKUs dominate traffic, operations need fast reads without preemptive row locks.

**Costs:** hot rows trigger repeated conflicts/retries; client-visible tail latency and write amplification can grow. Each ORM/SQL writer must obey the same version policy. Bulk updates or external integrations that change inventory without incrementing the version break the protection.

## 5. Strategy C — Atomic conditional update: the simplest single-row inventory claim

For a single SKU, a carefully designed **single SQL statement** is often preferable to a separate locking query or a read/version round-trip:

```sql
UPDATE inventory
   SET available = available - :qty,
       held = held + :qty,
       version = version + 1
 WHERE sku = :sku
   AND available >= :qty
RETURNING available, held, version;
```

Under PostgreSQL `READ COMMITTED`, concurrent `UPDATE`s serialize on the row. After the first commits, the second transaction checks the `WHERE` clause on the latest committed version. If no inventory is left it affects **zero rows**. This is a **database-backed atomic decision**, not a performance benchmark or a claim that it is lock-free: the update itself acquires row locks.

**Spring Boot `JdbcClient` implementation:**

```java
@Service
@RequiredArgsConstructor
public class AtomicReservationService {
    private final JdbcClient jdbc;

    @Transactional
    public void claim(String sku, int qty) {
        if (qty <= 0) throw new IllegalArgumentException("qty");
        int updated = jdbc.sql("""
            UPDATE inventory
               SET available = available - :qty,
                   held = held + :qty,
                   version = version + 1
             WHERE sku = :sku AND available >= :qty
            """)
            .param("sku", sku).param("qty", qty)
            .update();
        if (updated != 1) throw new SoldOutException();
        // Create reservation + store idempotency key here in the SAME transaction.
    }
}
```

This is deliberately a **claim primitive**, not a complete checkout API. Before production, implement authenticated request-key claiming, a unique constraint, stable replay behavior, reservation lifecycle, expiry, OMS outbox, observability, and integration tests. Both optimistic and pessimistic approaches can be valid; the conditional update is a particularly effective default when the invariant fits in one row.

## 6. Compare approaches at architecture-review level

| Dimension | Pessimistic `FOR UPDATE` | Optimistic `@Version` | Guarded `UPDATE` |
|---|---|---|---|
| Writer behavior | Waits for earlier lock holder | Stale writer fails on flush/commit | Waits if necessary, then rechecks predicate |
| Explicit version column | Not required by lock itself | Required | Optional (increment it if mixed with JPA) |
| Hot SKU contention | Lock queue | Many conflicts/retries | Lock queue for one short statement |
| Multi-row business logic | Useful with ordered locks | Possible with careful rollback/retry | Requires broader transaction strategy |
| Implementation risk | Long transactions and deadlocks | Retry storms and bypassed version checks | Forgetting idempotency or other writers |
| Choice for one-row stock | Valid but more round trips | Valid at low contention | Often the simplest correct option |

**The important distinction:** pessimistic locking *waits before deciding*; optimistic locking *checks a competing edit at write time*. A guarded update *checks the invariant during the write*. All three can be correct; none alone solves duplicate checkout retries, stock held too long, cross-system inventory drift, or exactly-once order fulfillment.

## 7. The same real-world race with four behaviors

```text
INITIAL: available=1, held=0, version=5

NAIVE:
  A reads 1; B reads 1; both create promise -> 2 promises / 1 item (BUG)

PESSIMISTIC:
  A locks; B waits; A commits available=0; B rechecks -> SOLD OUT

OPTIMISTIC:
  A reads v5; B reads v5; A commits v6; B's v5 update -> CONFLICT
  New transaction reloads available=0 -> SOLD OUT

ATOMIC UPDATE:
  A guarded UPDATE -> 1 row; B guarded UPDATE -> 0 rows -> SOLD OUT
```

**Try each mode** in the interactive simulator. It is a deterministic state machine to visualize the sequencing, not actual PostgreSQL sessions.

## 8. What else is required in a real checkout?

1. **Idempotency:** a client timeout can retry the *same* reservation request. Enforce uniqueness on `(tenant_id, customer_id, request_key)` and verify that the key is not reused with different SKU/quantity. Duplicate calls return the original reservation or stable terminal result.
2. **Lifecycle:** `ACTIVE → CONFIRMED`, or `ACTIVE → EXPIRED/CANCELLED`. A release operation must guard the status transition and restore `available` **only once**. Never release a confirmed hold.
3. **Ownership:** one authoritative writer for stock or an explicit synchronization protocol between ATG, reservation service, warehouse/OMS, and store availability. Redis/caches must not become a competing authority.
4. **Outbox and reconciliation:** persist inventory claim, reservation, and event together. Publish asynchronously, tolerate duplicate delivery, and reconcile confirmed orders and held stock against OMS records.
5. **Multi-SKU carts:** acquire locks in deterministic SKU order or design guarded writes with rollback of the entire transaction. Monitor deadlocks. An order containing two SKUs should either reserve both or neither.
6. **Bounded transactions:** make no external network calls while holding stock locks; use DB lock timeout/statement timeout policies and backoff for known-retriable errors.
7. **Isolation:** behavior described assumes PostgreSQL `READ COMMITTED`; `REPEATABLE READ` / `SERIALIZABLE` may surface serialization failures requiring retry of the *entire transaction*.
8. **Monitoring:** sold-out ratio, `409`s, lock-wait latency, deadlocks, optimistic conflict ratio, retry counts, active-hold age, stock-ledger discrepancies, and OMS lag.

### Oracle ATG Commerce-specific architecture note

Oracle ATG has an Inventory Repository with stock and availability data. The ATG SQL Repository also supports optimistic locking via a descriptor `version-property`; a version mismatch raises `ConcurrentUpdateException`. That mechanism **must be configured for the relevant item descriptor**, and should not be assumed to protect every ATG inventory workflow automatically.

A representative (not drop-in) descriptor pattern from Oracle's repository guide:

```xml
<item-descriptor name="inventoryItem" version-property="version">
  <table name="inventory_table" id-column-names="sku">
    <property name="version" data-type="long"/>
  </table>
</item-descriptor>
```

**Do not paste this over an existing ATG descriptor.** Inspect installed ATG version, inventory manager, repository definitions, caching, backorder settings, custom pipelines, database, and OMS integration first. Decide whether to enhance ATG's existing source of truth or introduce a new reservation service—not both as independent writers. Spring `@Version` does not automatically apply to ATG repository items.

## 9. Testing that proves the protection

For each strategy, start two real transactions against one PostgreSQL row (e.g. with Testcontainers), coordinate them with barriers, and assert the invariant:

| Test | Expected |
|---|---|
| Two different keys, qty 1, available 1 | Exactly one reservation succeeds |
| Two retries, same key | One stock decrement and same reservation ID |
| A rolls back while B waits on row | B can obtain unit after A rollback |
| A commits and B retries stale version | B reloads and sees sold out |
| Deadlock while reserving two SKUs | One transaction rolled back; controlled retry |
| Expiry worker races with confirm | Exactly one legal state transition |
| Concurrent reservation with external inventory writer | Single authority/version coordination enforced |
| Client times out after DB commit | Retry returns existing result, never double-reserves |

Additionally assert `available >= 0`, `held >= 0`, reservation auditability, and reservation/OMS reconciliation. Do not infer throughput claims from the learning simulator; benchmark real contention, retries, transaction times, and p95/p99 latency separately.

## 10. Architect interview questions and answers

**Q: Which is better for flash-sale inventory: optimistic or pessimistic locking?**  
**A:** It depends on contention and critical-section complexity. Optimistic locking avoids preemptive row locks but produces conflicts on a hot SKU. Pessimistic locking serializes competing writes but may queue. A guarded single-row SQL update is often the cleanest stock-claim primitive, combined with idempotency and reservations.

**Q: Does `@Transactional` alone prevent overselling?**  
**A:** No. A read-then-unconditional-write at `READ COMMITTED` can act on stale data. Transactions ensure atomic commit/rollback, but you still need a concurrency-safe stock predicate or locking/version strategy.

**Q: Does `@Version` lock the database row when reading?**  
**A:** No. The version protects the *write* by detecting stale changes. The actual `UPDATE` still takes normal database write locks.

**Q: Why not Redis distributed locking?**  
**A:** If all stock writes go to a single transactional database row, its own atomic predicate and row locks usually suffice. Adding Redis locks introduces lease/expiry/fencing concerns. A cache is not a substitute for authoritative DB invariants.

**Q: What about two different orders sharing the same idempotency key?**  
**A:** Scope keys to authenticated principal/tenant and compare the canonical request content. Return `409 Conflict` rather than treating changed parameters as a valid replay.

**Q: Is `SKIP LOCKED` safe for customer inventory?**  
**A:** Usually not. It can skip an available-but-locked row and give a misleading sold-out result. It is intended for queue-like workers rather than reliable customer-facing stock selection.

### Sources and further reading

- PostgreSQL — Explicit Locking: https://www.postgresql.org/docs/current/explicit-locking.html
- PostgreSQL — Transaction Isolation: https://www.postgresql.org/docs/current/transaction-iso.html
- Spring Data JPA — Locking: https://docs.spring.io/spring-data/jpa/reference/jpa/locking.html
- Spring Data Relational — Optimistic Locking: https://docs.spring.io/spring-data/relational/reference/jdbc/entity-persistence.html
- Spring Framework — Declarative Transactions: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
- Oracle ATG — Maintaining Item Concurrency with Version Property: https://docs.oracle.com/cd/E24152_01/Platform.10-1/ATGRepositoryGuide/html/s0709maintainingitemconcurrencywithth01.html
- Oracle Commerce — Inventory Repository: https://docs.oracle.com/cd/E55783_01/Platform.11-2/ATGCommProgGuide/html/s1908inventoryrepository01.html

## Continue the series

- [Payment Idempotency in Spring Boot](/blog/spring-boot-payment-idempotency-timeouts)
- [Transactional Outbox in Spring Boot and Kafka](/blog/transactional-outbox-kafka-spring-boot)

## Video transcript


A flash sale has one iPhone

left. Two shoppers tap Place Order

on different checkout servers.

Both see stock equal to one.

Who gets the item?

Without concurrency control,

both requests pass the stock check.

The database may show zero,

but two reservations have already been

promised. That is an oversell.

With pessimistic locking,

transaction A selects the inventory row

for update. Transaction B waits for

the lock. No external payment call

belongs inside this transaction.

A reserves the item and commits.

B then reads the updated row,

finds zero available,

and returns sold out.

The critical section stays short.

With optimistic locking,

both transactions read version five.

A updates successfully to version six.

B attempts to write version five,

and its update is rejected.

The losing optimistic transaction rolls back.

A new transaction reloads stock.

With zero remaining,

the correct business outcome is sold

out, not repeated retries.

For a single stock counter,

use one guarded SQL update:

decrement only where available is at

least the requested quantity.

PostgreSQL rechecks the condition after competing

writes.

Choose based on contention.

Keep idempotency, reservation expiry,

consistent database ownership,

and order reconciliation.

Test concurrent transactions,

monitor lock waits,

and never confuse cached availability with

a reservation.

