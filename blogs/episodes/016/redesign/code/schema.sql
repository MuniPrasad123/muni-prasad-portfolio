-- PostgreSQL teaching schema: durable checkout operation identity.
CREATE TABLE checkout_attempt (
  attempt_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  provider_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('CREATED','UNKNOWN','CONFIRMED','FAILED')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, idempotency_key)
);
-- An identical key + different request_hash must be rejected by application logic.
