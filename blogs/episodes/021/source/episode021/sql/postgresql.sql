-- PostgreSQL 15+ illustrative schema. Run in a test database.
CREATE TABLE IF NOT EXISTS orders (id text PRIMARY KEY, status text NOT NULL CHECK (status IN ('PAID','CANCELLATION_PENDING','REFUND_PENDING','REFUNDED','SHIPPED')), version bigint NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS outbox (event_id uuid PRIMARY KEY, aggregate_id text NOT NULL, aggregate_version bigint NOT NULL, event_type text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS consumer_inbox (consumer_name text NOT NULL, event_id uuid NOT NULL, processed_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(consumer_name,event_id));
INSERT INTO orders(id,status,version) VALUES ('ORD-42','PAID',3) ON CONFLICT (id) DO NOTHING;
-- Application transaction: run UPDATE; only if affected rows=1, insert outbox; commit together.
BEGIN;
UPDATE orders SET status='CANCELLATION_PENDING',version=version+1 WHERE id='ORD-42' AND status='PAID' AND version=3 RETURNING id,status,version;
-- Only execute INSERT if UPDATE returned one row; UUID supplied by application.
-- INSERT INTO outbox(event_id,aggregate_id,aggregate_version,event_type,payload) VALUES (...);
ROLLBACK; -- demonstration safe: replace with COMMIT when integrated with outbox logic
