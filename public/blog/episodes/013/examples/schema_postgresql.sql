-- PostgreSQL: durable order idempotency, unique per customer and operation
CREATE TABLE checkout_requests (
 customer_id BIGINT NOT NULL,
 idempotency_key TEXT NOT NULL,
 order_id BIGINT,
 state TEXT NOT NULL CHECK (state IN ('PROCESSING','COMPLETED','FAILED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (customer_id,idempotency_key)
);
-- Acquire a unique key transactionally before submitting payment/order effects.
