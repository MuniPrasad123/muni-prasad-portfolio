# Architecture in Motion 015 — The Payment Webhook That Arrived Three Times

> **A customer sees a successful payment, then three order-confirmation emails and two duplicate fulfillment requests.** The payment provider retried its webhook after your endpoint timed out. A webhook is a delivery notification—not a command you can safely execute twice.

## What the customer sees
A shopper checks out once. Their bank shows one authorization, but the merchant sends multiple emails, the order page changes status unexpectedly, or a warehouse creates two shipments. These are possible outcomes of an incorrectly implemented webhook consumer, not evidence that the provider charged twice. Support must distinguish duplicate webhook deliveries from duplicate charges by checking payment-provider transaction IDs.

## Follow the request
1. The payment provider sends `payment.succeeded` with an event ID and signed body to `/webhooks/payments`.
2. The gateway terminates TLS and enforces a modest request-size limit; it must preserve the **raw request body** for signature verification.
3. The webhook controller verifies the provider-specific HMAC signature, timestamp tolerance, and expected account/merchant identifier. Reject invalid signatures before any state change.
4. The application stores a unique `(provider, event_id)` inbox record in PostgreSQL in the **same transaction** as a guarded payment/order transition and an outbox record.
5. Return a 2xx only after the durable transaction commits. A retry of an already committed event returns 2xx without repeating side effects.
6. A separate outbox worker sends notifications or fulfillment commands with their own idempotency keys. Consumer-side deduplication is still required.

## Root cause: at-least-once delivery
A provider may retry after a lost response even if the server committed. Events may be delayed, duplicated, or delivered out of order. A 200 response is not a global exactly-once guarantee. Ordering is enforced through authoritative payment state and guarded transitions, not through arrival time.

## Why not Redis-only deduplication?
A TTL cache is useful as an optimization but loses entries on expiration or failover. A PostgreSQL unique constraint gives durable event deduplication. It still does not atomically commit changes in external systems; the outbox and downstream idempotency close that gap. Do not hold database transactions open while making network calls.

## Runnable PostgreSQL schema
```sql
CREATE TABLE webhook_inbox (
  provider text NOT NULL,
  event_id text NOT NULL,
  payment_id text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(provider,event_id)
);
CREATE TABLE payments (
  payment_id text PRIMARY KEY,
  order_id text NOT NULL,
  status text NOT NULL CHECK(status IN ('PENDING','SUCCEEDED','REFUNDED'))
);
CREATE TABLE outbox (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_key text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  published_at timestamptz
);
INSERT INTO payments VALUES ('pay_100','order_100','PENDING');
```

## Safe transactional algorithm
```sql
BEGIN;
INSERT INTO webhook_inbox(provider,event_id,payment_id)
VALUES ('acme','evt_501','pay_100') ON CONFLICT DO NOTHING;
-- Only continue if the INSERT returned one row. Otherwise COMMIT and ACK.
UPDATE payments SET status='SUCCEEDED'
WHERE payment_id='pay_100' AND status='PENDING';
-- Only insert the outbox event if the UPDATE changed one row.
INSERT INTO outbox(event_key,event_type,payload)
VALUES ('payment-succeeded:pay_100','PaymentSucceeded',
        '{"paymentId":"pay_100","orderId":"order_100"}')
ON CONFLICT DO NOTHING;
COMMIT;
```
**Important:** The SQL above illustrates the transaction steps; a production implementation must branch on affected-row counts. The Java sample does this using a single transaction. Do not blindly run the outbox insert after a duplicate event.

## Spring Boot / Java 21 implementation
The accompanying `code/WebhookService.java` shows transactional inbox insert, conditional state update, and outbox insert. Signature verification is a provider-specific adapter: never substitute an arbitrary shared secret or parse/re-serialize JSON before HMAC verification. Use constant-time comparison and bounded replay tolerance; verify key rotation and webhook endpoint configuration.

## Failure modes and validation
- **Response lost after commit:** provider retries; inbox unique key turns retry into safe ACK.
- **Database unavailable:** return 5xx; provider retries with backoff; alert on persistent failure.
- **Notification worker crashes:** outbox row remains unpublished; worker retries; email service must deduplicate by event key.
- **Refund arrives before success:** reconcile from provider's authoritative API, apply valid state machine transitions; never regress `REFUNDED` to `SUCCEEDED`.
- **Forged/replayed payload:** validate raw-body signature and timestamp; event ID dedup alone does not authenticate.
- **Tenant crossover:** verify merchant/account mapping and authorization boundaries before updating orders.

## Scaling and trade-offs
Partition inbox/outbox retention by time when event volume warrants it, but preserve the deduplication window required by provider retries and audits. Monitor duplicate rate, webhook ACK latency, outbox age, dead-letter volume, and mismatch between provider and local payment state. Apply bounded worker concurrency and exponential backoff with jitter. Separate webhook acceptance latency from downstream notification latency.

## Architecture diagram
```mermaid
flowchart TD
  A[Payment provider] -->|Signed webhook, may retry| B[WAF / Webhook endpoint]
  B --> C{Raw body signature valid?}
  C -->|No| X[Reject 4xx]
  C -->|Yes| D[(PostgreSQL inbox unique event ID)]
  D -->|Duplicate| E[ACK 2xx, no side effects]
  D -->|New, same transaction| F[Guarded payment transition]
  F --> G[(Transactional outbox)]
  G --> H[Async worker]
  H --> I[Email / fulfillment with idempotency]
  F --> J[ACK 2xx after commit]
```

## Three practice exercises
1. Send `evt_501` twice. Explain why only one inbox row and one outbox event should exist.
2. Simulate a crash after database commit but before HTTP ACK. What does the retry do?
3. Model `refunded` arriving before `succeeded`. Define a safe reconciliation policy and metrics.

## Interview Q&A
**Q: Are webhooks exactly once?** No. Assume at-least-once delivery and make processing idempotent.

**Q: Is a Redis SETNX enough?** No. A lock/TTL is not durable deduplication tied atomically to the payment transition.

**Q: When should we return 200?** After signature verification and durable acceptance/commit, not after slow external email or shipping calls.

**Q: Can an outbox guarantee one email?** It guarantees retryable intent, not exactly-once delivery at the email provider. Use downstream idempotency.

## Practical takeaway
**One payment event may arrive multiple times. One business transition must happen once.** Design for retries, not for perfect networks.
