---
title: "Java Deadlocks and Thread Dumps: Diagnosing Checkout That Stops Making Progress"
description: "The checkout spinner never finishes while CPU stays low; two workers may hold locks that each other needs."
slug: "java-deadlocks-thread-dump-checkout"
folder: "Java & JVM reliability"
date: "2026-11-14"
tags: ["Java 21","Spring Boot","JVM","Concurrency"]
cover: "/blog/episodes/019/cover.svg"
coverAlt: "Java Deadlocks and Thread Dumps: Diagnosing Checkout That Stops Making Progress"
draft: false
sample: false
level: "Architecture in Motion · Episode 019"
lab: "/blog/episodes/019/lab.html"
overview: {"problem":"The checkout spinner never finishes while CPU stays low; two workers may hold locks that each other needs.","solution":"Find the actual wait chain, enforce a consistent lock order where needed, and remove remote calls from locked sections.","note":"Illustrative system · animated browser lesson; no rendered MP4 supplied"}
---

## Start with the customer

Two checkout requests stop making progress even though the CPU is quiet. Each thread holds a lock that the other needs.

**Normal behavior:** Each request obtains short-lived resources without a circular wait. Dependency and pool waits remain bounded and observable.

**What protects the customer:** Find the actual wait chain, enforce a consistent lock order where needed, and remove remote calls from locked sections.

This is an illustrative engineering incident, not an employer case study or a performance benchmark. The article, comparison lab, and any supplied video explain the same core failure.

## Follow the incident yourself

[Open the interactive lab](#interactive-lab). Choose **Circular wait** and predict the outcome before each step. The unsafe and protected paths receive the same situation.

1. **A acquires inventory; B acquires payment.** Two code paths acquire the same two monitors in different orders. Protected outcome: Both paths agree to acquire X first.
2. **Each request asks for the other lock.** Inconsistent order creates a cycle. With consistent order, B waits without holding Y, so A can finish. Protected outcome: No circular wait.
3. **Inspect repeated ownership snapshots.** This is a deterministic teaching model, not a real JVM dump. A cycle explains lack of progress even when CPU is low. Protected outcome: A releases; B can proceed.
4. **Redesign the locked work.** Do not call the payment provider while holding these monitors. Use transactional state and idempotency for multi-instance business correctness. Protected outcome: Removes cycle and validates progress.

Then choose **Connection-pool wait** to test a different cause or a healthy/control path. Previous revisits the teaching state; Reset starts the experiment again. Autoplay and visual motion have separate pause controls.

## Watch the animated walkthrough

Use Auto-play in the interactive lab to follow the failure and recovery, or advance one event at a time. A narrated video is not available for this episode.

**Java 21 thread dumps, deadlocks, lock contention and production checkout diagnosis**

*The checkout button spins. CPU looks normal. Payment requests pile up. Why?*

## 1. Customer impact and the business question
During a flash sale, customers submit orders and wait indefinitely. Some refresh or retry. A blocked checkout is more than an inconvenience: uncertain payment status drives abandonment and duplicate requests. This is an illustrative incident, not a report of a real retailer.

**Question:** How do we identify whether Java lock contention, a genuine deadlock, slow I/O, or connection-pool exhaustion is causing the delay—and prevent unsafe payment retries?

## 2. Fundamentals: blocked is not deadlocked
A Java thread in `BLOCKED` is waiting to enter a synchronized monitor. A thread in `WAITING` or `TIMED_WAITING` may be parked for a lock, queue, or I/O coordination; the state alone does not establish root cause. A deadlock is a cycle: thread A owns lock X and needs Y; thread B owns Y and needs X. Lock contention may simply serialize requests without a cycle. Virtual threads do not make shared mutable state safe and cannot fix a deadlock.

## 3. A plausible failure path
Customer → Gateway → Checkout API → inventory reservation → payment authorization → PostgreSQL order commit. In a flawed checkout coordinator, inventory and payment operations hold nested Java locks in inconsistent order. Under load, one path acquires `inventoryLock` then `paymentLock`, while another acquires them in reverse. Requests stop making progress, even though CPU can remain low. A different but visually similar incident may be an exhausted Hikari connection pool: diagnose rather than assume.

## 4. Reproduce safely, outside production
[DeadlockDemo.java](/blog/episodes/019/examples/DeadlockDemo.java) intentionally deadlocks two daemon threads, then uses `ThreadMXBean.findDeadlockedThreads()` to identify the cycle. Run `javac code/DeadlockDemo.java && java -cp code DeadlockDemo`; it exits after reporting the detected deadlock. Never execute intentionally deadlocking code inside a production service.

## 5. Capture production evidence
1. Check p95/p99 latency, request rate, active requests, Hikari pending/active connections, payment latency, and recent deployments.
2. Capture **three** thread dumps about 5–10 seconds apart using `jcmd <pid> Thread.dump_to_file -format=text /tmp/checkout-threads.txt` on a compatible JDK; use `jcmd <pid> Thread.print -l` if appropriate. Ensure permissions and safe handling of potentially sensitive stack information.
3. Look for repeated monitor ownership, blocked stacks, deadlock cycles, and pool waits. Compare multiple snapshots and correlate with trace IDs.
4. Use JFR (`jcmd <pid> JFR.start name=checkout settings=profile duration=60s filename=/tmp/checkout.jfr`) when authorized; inspect Java monitor-blocked events and allocation/CPU context.
5. Check downstream latency and database locks. Do not treat a single thread dump as a complete performance profile.

## 6. Fix the design rather than hide the symptom
The preferred design minimizes shared JVM locks in checkout orchestration. Use short database transactions for order state, atomic inventory updates with conditional SQL, durable payment idempotency keys, bounded outbound concurrency, and explicit deadlines. If two in-memory locks are unavoidable, use one globally consistent acquisition order and never call remote services while holding them. Database row locking and distributed coordination have separate semantics; replacing `synchronized` with a distributed lock is not automatically safer.

Example PostgreSQL conditional reservation:
```sql
UPDATE inventory SET available = available - :qty
WHERE sku = :sku AND available >= :qty;
-- Require exactly one updated row; otherwise reject reservation.
```
A payment timeout is **unknown**, not necessarily a decline. Reconcile by payment provider idempotency key before retrying. Persist order transitions with optimistic version checks; publish fulfillment via a transactional outbox.

## 7. Trade-offs, scaling, resilience, security
Coarse JVM locks are easy to reason about at low concurrency but serialize throughput and are local to one process. Optimistic database concurrency improves parallelism but requires conflict handling; row locks provide stronger serialization at the cost of waits and deadlock risk. Bounded queues and bulkheads protect the payment provider but require clear overload responses. Instrument lock wait, pool wait, checkout p99, payment authorization outcome, and idempotency conflicts. Protect dumps and traces because they can contain customer identifiers or tokens; never log card data or secrets.

## 8. Verification plan
Run an isolated load test with unique idempotency keys and a controlled slow-payment stub. Verify no deadlock cycles, bounded queue growth, correct inventory non-negativity, one payment authorization per idempotency key, and successful reconciliation after ambiguous timeouts. Compare measured p99 and throughput only after collecting actual test results. No benchmark numbers are asserted here.

## 9. Common pitfalls
- Increasing thread count without checking downstream capacity.
- Treating `WAITING` as proof of deadlock.
- Holding a Java monitor during a network call.
- Retrying payment authorization with a new idempotency key after timeout.
- Assuming JVM locks protect data across replicas.

## 10. Interview questions
**Q: How is deadlock different from contention?** Deadlock forms a circular wait and cannot resolve without intervention; contention can progress when the holder releases the lock.

**Q: Can virtual threads prevent deadlocks?** No. Scheduling efficiency does not change lock ordering or business consistency.

**Q: How do you distinguish Hikari exhaustion from monitor contention?** Correlate connection-pool metrics and stacks waiting for connections with monitor owner/waiter chains and JFR events.

**Q: What if payment times out?** Preserve the original idempotency key, query/reconcile provider state, and avoid blindly creating a new charge.

## 11. Practice
1. Run the deliberate deadlock and identify the two lock names.
2. Change the demonstration to acquire locks in the same order; verify no deadlock is reported.
3. Design a multi-instance checkout workflow with conditional inventory reservation, durable payment reconciliation and outbox-based fulfillment.

## Teaching source files

- [DeadlockDemo.java](/blog/episodes/019/examples/DeadlockDemo.java)
- [schema.sql](/blog/episodes/019/examples/schema.sql)

These are supplied teaching examples, not a complete deployable checkout service. They have not been executed as JVM or database tests in this integration. Read their dependencies and limits before running them in an isolated environment.

## Primary references used for this lesson

- [Reference 1](https://docs.oracle.com/en/java/javase/21/docs/api/java.management/java/lang/management/ThreadMXBean.html)
- [Reference 2](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html)
