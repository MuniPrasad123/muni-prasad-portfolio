---
title: "CompletableFuture Timeouts: Why Cancelling a Future Does Not Cancel a Payment"
description: "Checkout stops waiting for a payment reply, reports failure, and invites a retry even though the provider may still complete the original request."
slug: "completablefuture-timeouts-payment-reconciliation"
folder: "Payments & inventory correctness"
date: "2026-11-14"
tags: ["Java 21","Spring Boot","Concurrency","Payments"]
cover: "/blog/episodes/020/cover.svg"
coverAlt: "CompletableFuture Timeouts: Why Cancelling a Future Does Not Cancel a Payment"
draft: false
sample: false
level: "Architecture in Motion · Episode 020"
lab: "/blog/episodes/020/lab.html"
overview: {"problem":"Checkout stops waiting for a payment reply, reports failure, and invites a retry even though the provider may still complete the original request.","solution":"Separate read-only fan-out from payment effects, persist the attempt, reuse provider idempotency, and reconcile unknown outcomes.","note":"Illustrative system · animated browser lesson; no rendered MP4 supplied"}
---

## Start with the customer

Checkout says Payment failed after a timeout. The shopper retries, but the original request may still authorize at the provider. Stopping the wait does not stop the payment.

**Normal behavior:** Checkout records a logical payment attempt, sends its stable identity to the provider, and confirms only after a known successful result.

**What protects the customer:** Separate read-only fan-out from payment effects, persist the attempt, reuse provider idempotency, and reconcile unknown outcomes.

This is an illustrative engineering incident, not an employer case study or a performance benchmark. The article, comparison lab, and any supplied video explain the same core failure.

## Follow the incident yourself

[Open the interactive lab](#interactive-lab). Choose **Timeout, late success, duplicate event** and predict the outcome before each step. The unsafe and protected paths receive the same situation.

1. **Payment attempt is persisted before the call.** The provider receives a stable idempotency key. A future represents local completion, not the remote transaction. Protected outcome: Stores the logical attempt.
2. **The checkout future reaches its deadline.** The provider response is not known. cancel(true) or orTimeout does not undo a remote authorization. Protected outcome: Persists UNKNOWN; returns pending.
3. **The shopper retries before reconciliation.** The unsafe path can create a second payment operation. The protected path retrieves the original attempt instead. Protected outcome: Reuses operation A.
4. **A verified late success arrives.** Resolve the saved attempt and commit a fulfillment intent with guarded state. Do not infer a second charge merely from repeated messages. Protected outcome: One confirmed attempt and outbox.
5. **The success event is delivered again.** Deduplicate the event and external fulfillment work; an outbox record is not itself a delivered shipment. Protected outcome: No duplicate fulfillment intent.

Then choose **Known decline** to test a different cause or a healthy/control path. Previous revisits the teaching state; Reset starts the experiment again. Autoplay and visual motion have separate pause controls.

## Watch the animated walkthrough

Use Auto-play in the interactive lab to follow the failure and recovery, or advance one event at a time. A narrated video is not available for this episode.

**Java 21 CompletableFuture, cancellation, deadlines and checkout failure propagation**

*Architecture in Motion · Java/JVM phase · Original educational scenario · Not a real customer incident*

## The customer-facing failure
A shopper presses **Place Order**. Inventory reservation returns in 80 ms, but the payment gateway takes six seconds. The checkout API gives up after two seconds and displays “Payment failed—try again.” The shopper retries. Meanwhile the first payment request may still be executing, creating an ambiguous outcome and possible duplicate authorization if idempotency is missing. A timeout is not a rollback.

## The underlying failure
A common implementation uses `CompletableFuture.supplyAsync()` for inventory, pricing and payment, then `allOf(...).join()`. There are three traps: (1) the default common pool is a shared resource; blocking HTTP calls can starve unrelated work, (2) `orTimeout()` completes the *future* exceptionally but does not reliably interrupt or cancel the underlying network call, and (3) sibling work can continue after one branch fails. `CompletableFuture.cancel(true)` likewise does not guarantee interruption of its running computation. A client disconnect does not reverse a payment.

## Java 21 code: safe read-only fan-out
The following JDK-only example runs on Java 21. It illustrates deadline handling, not payment authorization. Java 21's `StructuredTaskScope` is a preview API; this lesson uses standard `CompletableFuture` instead. Spring Boot should manage a dedicated bounded executor, rather than relying on `ForkJoinPool.commonPool()` for blocking I/O.

```java
import java.time.Duration;
import java.util.concurrent.*;

public class CheckoutReadFanout {
  record Quote(int stock, int shippingCents) {}
  static Quote quote(Executor executor) throws Exception {
    CompletableFuture<Integer> stock = CompletableFuture.supplyAsync(() -> 4, executor);
    CompletableFuture<Integer> shipping = CompletableFuture.supplyAsync(() -> 799, executor);
    try {
      return stock.thenCombine(shipping, Quote::new).get(500, TimeUnit.MILLISECONDS);
    } catch (TimeoutException ex) {
      stock.cancel(true); shipping.cancel(true); // best effort, NOT guaranteed interruption
      throw ex;
    }
  }
  public static void main(String[] args) throws Exception {
    ExecutorService pool = Executors.newFixedThreadPool(4);
    try { System.out.println(quote(pool)); } finally { pool.shutdownNow(); }
  }
}
```

**Spring Boot design sketch:** Configure `ThreadPoolTaskExecutor` with explicit core/max sizes, queue capacity, rejection policy and shutdown behavior. Inject the executor into the quote service. Use a payment client with HTTP deadlines, a durable `checkout_attempt` table, and a provider-specific idempotency key. Map uncertain outcomes to 202, not a misleading failure. Do not send raw card details to application logs or tracing.

## Database schema (PostgreSQL)
```sql
CREATE TABLE checkout_attempt (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 customer_id BIGINT NOT NULL,
 idempotency_key TEXT NOT NULL,
 provider_reference TEXT,
 state TEXT NOT NULL CHECK (state IN ('NEW','PAYMENT_PENDING','UNKNOWN','CONFIRMED','FAILED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE (customer_id,idempotency_key)
);
CREATE TABLE checkout_outbox (
 event_id UUID PRIMARY KEY,
 attempt_id BIGINT NOT NULL REFERENCES checkout_attempt(id),
 event_type TEXT NOT NULL,
 payload JSONB NOT NULL,
 published_at TIMESTAMPTZ
);
```

## Failure-mode and trade-off review
**Deadline vs cancellation:** A future timeout is an observation; it does not cancel the external side effect. Configure transport timeouts and provider-side idempotency. **Thread pools vs virtual threads:** Virtual threads can improve blocking-I/O concurrency, but do not expand database or provider capacity; bound downstream concurrency. **Fast fail vs reconciliation:** Returning `202` is less immediately satisfying but avoids telling the customer an unknown payment definitely failed. **Retries:** Retry only when safe, with stable keys, exponential backoff and jitter; cap attempts. **Security:** Verify signed webhooks against raw request bytes, use least-privilege credentials, avoid logging PII and card data. **Scaling:** Partition reconciliation jobs and index `state,created_at`; observe age of UNKNOWN attempts, payment reconciliation time, queue saturation and p95/p99 checkout latency.

## Validation plan (not executed against a real provider)
Use a fake payment server to simulate success, 6-second delay, connection reset and duplicate webhook. Assert one payment intent per idempotency key; an uncertain timeout yields 202; reconciliation converges to CONFIRMED or FAILED; fulfillment emits once; logs exclude sensitive payment fields. Repeat under load and collect actual latency and error rates before claiming performance improvements.

## Three exercises
1. **Beginner:** Explain why `orTimeout` cannot guarantee that a charge was canceled.
2. **Intermediate:** Add a bounded executor and a 500 ms quote deadline; distinguish rejected work from timeout.
3. **Senior:** Implement a durable state machine and reconciliation worker with a provider idempotency key and an outbox. Prove duplicate webhook delivery does not duplicate fulfillment.

### Exercise solutions


1. It completes the future exceptionally; the HTTP request may still be in flight. 2. Use a dedicated bounded executor, catch `RejectedExecutionException` and `TimeoutException` separately, and apply transport deadlines. 3. Use a unique `(customer_id,idempotency_key)`, conditional state transitions, an outbox committed with the state change, and a deduplicating fulfillment consumer.


## Interview questions
**Q: Does `CompletableFuture.cancel(true)` interrupt an active supplier?** Not reliably; cancellation is not a remote side-effect rollback. **Q: Should payment be inside `allOf` with stock and shipping?** Usually no: isolate irreversible payment actions behind durable state and idempotency. **Q: Why return 202?** Because an ambiguous remote timeout cannot be represented truthfully as payment failure. **Q: What changes with Java 21 virtual threads?** Blocking waits become cheaper, but downstream capacity and business semantics remain unchanged.

## Architecture decision
Use concurrency for independent read-only work; use durable orchestration for money-moving side effects. The goal is not the shortest checkout code. It is a checkout that tells the truth when networks fail.

*Illustrations and lab are conceptual; no real performance benchmarks were conducted.*

## Teaching source files

- [CheckoutReadFanout.java](/blog/episodes/020/examples/CheckoutReadFanout.java)
- [schema_postgresql.sql](/blog/episodes/020/examples/schema_postgresql.sql)

These are supplied teaching examples, not a complete deployable checkout service. They have not been executed as JVM or database tests in this integration. Read their dependencies and limits before running them in an isolated environment.

## Primary references used for this lesson

- [Reference 1](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html)
- [Reference 2](https://docs.stripe.com/api/idempotent_requests)
