---
title: "Payment Webhook Idempotency: Preventing Duplicate Emails and Fulfillment"
description: "Maya pays $120 once, then receives three confirmations. Follow lost webhook acknowledgements, durable inbox deduplication, payment state guards and retryable outbox delivery."
slug: "payment-webhook-idempotency-inbox-outbox"
folder: "Payments & inventory correctness"
date: "2026-11-14"
updated: "2026-11-20"
tags: ["Java","Spring Boot","Payments","PostgreSQL","E-commerce"]
cover: "/blog/thumbnails/episode-015.svg"
coverAlt: "An inbox and state guard deduplicate payment webhooks before outbox-driven effects."
draft: false
sample: false
level: "Architecture in Motion · Episode 015"
lab: "/blog/episodes/015/lab.html"
overview: {"problem":"Maya pays once. Her bank shows one transaction, but repeated confirmations and shipping requests make her worry she was charged again.","solution":"Authenticate the notification, accept each delivery durably, guard the payment transition and commit one retryable business intent.","note":"Illustrative scenario · customer-first lab · original comparison preserved · local review"}
video: "/blog/episodes/015/lesson-redesign.mp4"
videoPoster: "/blog/episodes/015/poster-redesign.png"
videoCaptions: "/blog/episodes/015/captions-redesign.vtt"
videoCaption: "New narrated animation · synthetic English voice · speech-aligned English captions"
videoSummary: "Maya pays once. Follow the lost acknowledgement and retry, then see durable inbox acceptance, the payment state guard, transactional outbox and destination idempotency protect the customer."
videoChapters: [{"time":0,"label":"MAYA'S CHECKOUT"},{"time":13.9,"label":"WHAT WENT WRONG?"},{"time":26.5,"label":"SAME EVENT, AGAIN"},{"time":41.1,"label":"VERIFY, THEN ACCEPT"},{"time":56.1,"label":"NEW ID, SAME PAYMENT"},{"time":70.16666666666667,"label":"OUTBOX + DESTINATION KEYS"},{"time":85.76666666666667,"label":"CUSTOMER PROTECTED"}]
---

## 1. Start with the customer, not the database

Meet Maya. She buys a pair of headphones for $120. Her checkout page says **Payment successful**, and her banking app shows **one** payment. One minute later she receives three emails saying **Your order is confirmed**. A warehouse integration also sees repeated requests to prepare the package. Maya wonders: *Was I charged three times? Will three packages arrive? Should I cancel?*

The support team must check the payment provider's actual transaction ID to answer whether any duplicate charge occurred. **Duplicate webhooks are notifications, not additional charges.** The defect is that the merchant repeatedly triggers business side effects for the same completed payment.

**Customer-visible symptoms:** repeated emails, conflicting order-status updates, duplicate fulfillment intents, increased support volume. Duplicate charges are a *different* possible defect requiring independent payment evidence.

## 2. The sequence that caused the incident

1. The provider completes payment `pay_100` and sends signed webhook `evt_501`.
2. The merchant accepts the notification, marks payment successful, and initiates an email and shipping command.
3. The merchant's HTTP acknowledgment is lost or times out **after** processing.
4. The provider cannot tell whether processing succeeded, so it sends `evt_501` again.
5. An unsafe handler repeats email and shipping side effects. It may do so a third time.
6. The customer sees repeated confirmations although the provider processed only one payment.

**Important:** The webhook does not instruct the merchant to charge the customer again. It reports an existing payment outcome.

## 3. Why the unsafe implementation fails

```java
@PostMapping("/webhooks/payments")
public ResponseEntity<Void> unsafe(@RequestBody PaymentEvent event) {
    emailClient.sendConfirmation(event.orderId());
    fulfillmentClient.createShipment(event.orderId());
    return ResponseEntity.ok().build();
}
```

Every delivery invokes both external systems. A 200 response may be lost. No durable uniqueness, signature check, payment state guard or recovery boundary exists. Worse, the network calls occur before a durable acceptance boundary.

## 4. Follow the diagram and test the incident

The diagram above separates provider verification, the single PostgreSQL transaction and downstream delivery. The provider payment already exists before any webhook arrives.

[Open the customer-first lab](#interactive-lab). Compare **Unsafe: lost ACK + retries** with **Protected: lost ACK + retries**, then try invalid signatures, a different event ID for the same payment, late success after a refund, a wrong merchant and a worker crash after sending. Every step shows active components, the customer impact and a cumulative trace.

The original side-by-side lab is preserved in **Open the original side-by-side comparison** underneath. Its URL and existing controls still work. Play/Pause, Previous, Next, Reset, speed, independent motion pause and reduced-motion support are available in the customer-first lab. Previous and Reset reconstruct teaching state; they do not roll back a real payment.

**Read the counters carefully:** three unsafe deliveries can produce three email/shipment intents, but only one actual `PENDING → SUCCEEDED` transition. Repeating an assignment or business side effect is not a new payment-state transition or a new provider charge. One `PaymentSucceeded` outbox row can fan out to one intent per destination; it is not two payment events.

## 5. Explain the three protections in plain English

**Inbox = the guest list.** The event has a unique identity `(provider, event_id)`. If that exact event comes back, the database knows it has already been accepted. The unique constraint works across application restarts and multiple pods. This is durable *delivery* deduplication.

**Payment state guard = the one-way turnstile.** A new event ID can still describe the same payment. Update `PENDING -> SUCCEEDED` only if the payment is currently pending; if no state change occurs, do not create another `PaymentSucceeded` business event. Never regress `REFUNDED` to `SUCCEEDED` because of a late event.

**Outbox = the reliable dispatch tray.** Save the intention to notify and fulfill in the same PostgreSQL transaction as the payment state change. A worker later dispatches it. If the worker crashes, it retries. Downstream email and warehouse systems must also deduplicate by a stable business key: the outbox alone cannot guarantee that an external provider delivers exactly once.

## 6. Step-by-step safe algorithm

1. Receive the **original raw request bytes**; enforce HTTPS, request size and rate limits.
2. Verify provider-specific signature against the raw bytes, timestamp tolerance, expected merchant/account and key rotation policy. Do this before state mutation.
3. Start a PostgreSQL transaction.
4. `INSERT ... ON CONFLICT DO NOTHING RETURNING ...` into the inbox; if already present, commit and return 2xx.
5. Guard the payment transition by payment ID and expected state. If it changes no rows, treat as already applied or a state conflict requiring reconciliation.
6. Only on a real transition, insert one unique business event into the outbox.
7. Commit. **Then** acknowledge the webhook with 2xx.
8. Outbox workers deliver with bounded retries, backoff and stable downstream idempotency keys; track acknowledgment, failures and reconciliation.

Never hold the database transaction open while calling the email, shipping or payment provider API.

## Java 21, Spring and PostgreSQL teaching implementation

The downloadable [WebhookService.java](/blog/episodes/015/examples/WebhookService.java) is compiled and exercised against real PostgreSQL by the integration package. It demonstrates acceptance after verification, not a complete payment application. Provider-specific cryptographic verification, HTTP controllers, configuration, dispatch adapters and production observability remain integration work.

The signature adapter must accept the **original raw bytes**. It verifies the provider protocol, timestamp tolerance, key rotation and expected account, then produces a trusted event bound to the stored order, amount and currency. Never replace this with a parsed JSON boolean or a generic signature format copied from another provider.

A separate Spring-proxied service performs the transaction; the controller returns 2xx **after the proxy returns and commit succeeds**:

```java
@Transactional
public Outcome acceptVerifiedSuccess(VerifiedSuccess event) {
    // 1. Insert inbox identity; duplicate means validate the stored binding and ACK.
    // 2. Lock the matching provider/merchant/payment row and check checkout terms.
    // 3. If already SUCCEEDED, create no new intent.
    // 4. If REFUNDED, preserve it and persist a reconciliation candidate.
    // 5. Only PENDING -> SUCCEEDED creates one unique PaymentSucceeded outbox row.
    // No email, warehouse or provider network calls inside this transaction.
}
```

The comments above describe the control flow. The download contains the actual SQL and row-count branches. Self-invocation bypasses Spring proxy advice; call the annotated service through its injected proxy. A database exception must propagate to roll back inbox and state with the outbox.

### Scope delivery identity to the provider contract

This example uses a trusted merchant/account scope in addition to provider and event ID. If the provider guarantees globally unique event IDs, a smaller key may suffice; do not assume uniqueness across accounts without its documented contract.

```sql
CREATE TABLE webhook_inbox (
  provider text NOT NULL,
  merchant_id text NOT NULL,
  event_id text NOT NULL,
  payment_id text NOT NULL,
  body_sha256 text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, merchant_id, event_id)
);
```

A repeated ID with a conflicting payment binding or body hash needs investigation, not silent success. Hashing the original body detects conflict; it does not authenticate a sender. Signature/timestamp checks remain separate. Keep signed raw payload retention restricted and avoid payment PII in routine logs.

### The guarded transition

```sql
UPDATE payments SET status = 'SUCCEEDED'
WHERE provider = :provider
  AND merchant_id = :trustedMerchant
  AND payment_id = :paymentId
  AND status = 'PENDING';
-- Only one affected row permits the success outbox INSERT.
-- No affected row: inspect already-applied vs. incompatible state.
```

The actual service first locks the scoped payment row, checks its order, amount and currency, and branches on state. Unknown payments or mismatched terms roll back acceptance and require retry/quarantine according to the provider integration policy. A late success on REFUNDED persists a reconciliation candidate without changing state or generating fulfillment.

The [full schema](/blog/episodes/015/examples/schema.sql) defines scoped payments, inbox, outbox and durable reconciliation candidates. One outbox insertion failure rolls back the entire acceptance transaction. The tests deliberately inject that failure.

### Dispatch is a second boundary

A worker claims pending outbox rows with bounded leases or a short 'FOR UPDATE SKIP LOCKED' transaction. Send outside the webhook acceptance transaction. Use stable keys such as 'email:payment-succeeded:acme:merchant_1:pay_100' and 'shipment:payment-succeeded:acme:merchant_1:pay_100'. Mark delivery only after destination acknowledgement. A crash after send may resend; retain per-destination progress or let each destination deduplicate its key. Without that support, reconcile ambiguous outcomes instead of promising exactly-once delivery.

### Run the teaching examples

```powershell
java public/blog/episodes/015/examples/WebhookStateMachine.java
node --test tests/webhook-lesson.test.ts
mvn -B -f blogs/episodes/015/integration/pom.xml test
```

The supplied [standalone state machine](/blog/episodes/015/examples/WebhookStateMachine.java) is a **single-payment, in-memory algorithm exercise**, not durable storage or a multi-payment service. Its synchronized sets do not protect a production cluster. The database tests compile the actual Spring/JDBC service and wrap it in a real transaction manager, checking duplicates, lost ACK, distinct IDs, concurrency, merchant mismatch, rollback, same-ID conflict and refund preservation. Their generic HMAC fixture proves raw-body mutation rejection, not compatibility with any real provider's signature protocol.

## 7. Real failure paths

| Failure | Correct behavior | Customer outcome |
|---|---|---|
| ACK lost after commit | Same event ID hits inbox uniqueness; return 2xx | No new logical confirmation |
| Duplicate event with different ID | Guarded payment transition blocks second success intent | No second business transition |
| DB unavailable | Return non-2xx and rely on provider retry policy | Event eventually processed or escalated |
| Outbox worker crashes after send | Retry using same idempotency key; reconcile ambiguous delivery | Avoid repeat external side effect when provider supports dedup |
| `refunded` event arrives before `succeeded` | Verify authoritative state; do not regress terminal state | Accurate order/payment history |
| Forged webhook | Reject before mutation; alert and audit | Prevent fraudulent status updates |
| Wrong merchant or tenant | Reject / quarantine | No cross-tenant order mutation |

## 8. Why not Redis SETNX alone?

Redis TTL-based deduplication can expire, be evicted or be lost under some failure configurations, and it is not atomically committed with the PostgreSQL payment update. It can reduce duplicate load, but the authoritative unique constraint and state transition belong in durable storage.

## 9. Scale, performance and security

Keep the webhook path short: verify, persist, commit, acknowledge. Dispatch separately. Monitor webhook signature failures, duplicate rate, acknowledgment latency, outbox oldest age, worker retry count, DLQ volume and mismatched payment statuses. Use bounded concurrency, exponential backoff with jitter and retention aligned to the provider retry horizon and audit needs. Do not expose raw payment PII or secrets in logs. Verify merchant mapping and least-privilege DB credentials. Use a stable event key at *each* side-effect boundary.

This article provides no measured performance numbers. The lab uses **conceptual counters**, not throughput or latency benchmarks.

## 10. Three exercises

1. **Beginner:** Deliver `evt_501` three times. How many inbox records and `PaymentSucceeded` outbox intents exist? Answer: one each, assuming one valid payment transition.
2. **Intermediate:** Simulate a crash after commit but before the HTTP response. What happens on retry? Answer: the inbox conflict is recognized and the handler safely acknowledges without repeating the transition.
3. **Advanced:** A refund notification arrives before a delayed success notification. Design state-machine guards and provider reconciliation. Answer: verify the authoritative provider state, do not regress refunded state, and audit conflicts for manual or automated reconciliation.

## 11. Interview Q&A

**Does Kafka or a webhook provider guarantee exactly once?** No external side effect is automatically exactly-once. At-least-once delivery is common; design idempotent processing.

**Why both inbox and outbox?** Inbox protects against duplicate *input*. Outbox ensures the database transition and the *intent* to publish downstream commit together.

**Is unique `(provider,event_id)` enough?** No. Two distinct event IDs can describe the same payment; guard the business transition and downstream effects.

**When do we send HTTP 200?** After authenticating the request and durably accepting/committing it, not after performing slow external side effects.

**Does one outbox record guarantee one physical email?** No. A crash after an external send but before marking the outbox published may cause retry. Downstream idempotency is essential where supported; otherwise reconciliation/compensation is required.

## 12. The takeaway

**One payment may generate many notifications. The merchant must create one logical payment transition and one set of downstream business intents.** The inbox blocks repeated delivery, the state guard blocks repeated business transitions, and the outbox makes follow-up actions recoverable.

## Official technical references

- [Stripe webhook delivery, duplicates, signatures and ordering](https://docs.stripe.com/webhooks) — a concrete provider example; follow your own provider's contract.
- [PostgreSQL INSERT and ON CONFLICT](https://www.postgresql.org/docs/17/sql-insert.html) — durable uniqueness and affected-row semantics used in this example.
- [Spring transaction annotations and proxy semantics](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html) — why the service must be invoked through a proxy.

The customer counts are illustrative. The article, lab and narrated animation make no production throughput, latency or exactly-once external-delivery claim.
