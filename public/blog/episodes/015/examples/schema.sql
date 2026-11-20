-- PostgreSQL teaching schema; disposable test database only.
CREATE TABLE payments (
 provider text NOT NULL, merchant_id text NOT NULL, payment_id text NOT NULL,
 order_id text NOT NULL, amount_minor bigint NOT NULL CHECK(amount_minor>0),
 currency text NOT NULL,
 status text NOT NULL CHECK(status IN ('PENDING','SUCCEEDED','REFUNDED')),
 PRIMARY KEY(provider,merchant_id,payment_id)
);
CREATE TABLE webhook_inbox (
 provider text NOT NULL, merchant_id text NOT NULL, event_id text NOT NULL,
 payment_id text NOT NULL, body_sha256 text NOT NULL,
 received_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(provider,merchant_id,event_id)
);
CREATE TABLE outbox (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 event_key text NOT NULL UNIQUE, event_type text NOT NULL, payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz
);
CREATE INDEX outbox_pending ON outbox(created_at) WHERE published_at IS NULL;
CREATE TABLE webhook_reconciliation (
 provider text NOT NULL, merchant_id text NOT NULL, event_id text NOT NULL,
 payment_id text NOT NULL, reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz,
 PRIMARY KEY(provider,merchant_id,event_id)
);
INSERT INTO payments VALUES ('acme','merchant_1','pay_100','order_100',12000,'USD','PENDING');
-- Signature, timestamp, account mapping and raw-body integrity are verified BEFORE DB mutation.
-- WebhookService.java branches on row counts inside one transaction. This file only defines tables.
-- Event identity is account-scoped here. Use the exact uniqueness scope promised by your provider.
