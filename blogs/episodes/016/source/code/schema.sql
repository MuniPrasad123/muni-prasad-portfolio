-- PostgreSQL: illustration, not a complete payment ledger
CREATE TABLE checkout_attempt (id BIGSERIAL PRIMARY KEY, customer_id BIGINT NOT NULL, idempotency_key TEXT NOT NULL, payload_hash TEXT NOT NULL, state TEXT NOT NULL CHECK (state IN ('PENDING','AUTHORIZED','FAILED','UNKNOWN')), provider_reference TEXT, UNIQUE(customer_id,idempotency_key));
