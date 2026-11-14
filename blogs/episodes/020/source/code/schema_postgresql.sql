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
