-- Teaching design; not a complete transaction/payment integration.
CREATE TABLE checkout_requests (
  customer_id BIGINT NOT NULL,
  idempotency_key VARCHAR(160) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  state VARCHAR(20) NOT NULL CHECK (state IN ('PROCESSING','COMPLETED','FAILED')),
  order_id BIGINT,
  response_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, idempotency_key)
);
-- Acquire atomically with INSERT ... ON CONFLICT DO NOTHING.
-- On conflict: lock/select existing row and compare request_hash.
-- Same hash + completed => return original result; mismatched hash => 409.
-- Processing => bounded pending response / status endpoint, never create a new order.
-- Ensure business order insert and idempotency completion share a transaction.
-- Payments outside DB require provider idempotency + outbox/saga reconciliation.
