-- Teaching schema: a durable identity is separate from execution admission.
CREATE TABLE checkout_attempt (
 attempt_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 customer_id bigint NOT NULL, operation text NOT NULL DEFAULT 'checkout',
 idempotency_key text NOT NULL, request_hash text NOT NULL,
 provider_reference text NOT NULL UNIQUE,
 status text NOT NULL CHECK(status IN ('CREATED','IN_FLIGHT','UNKNOWN','CONFIRMED','FAILED')),
 claimed_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(customer_id,operation,idempotency_key)
);
CREATE TABLE checkout_outbox (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 event_key text NOT NULL UNIQUE, event_type text NOT NULL,
 payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 published_at timestamptz
);
-- Compare request_hash on every same-key request; reject a conflicting payload.
-- Claim CREATED -> IN_FLIGHT durably after local admission and before provider I/O.
-- Do not hold this transaction open during the HTTP call.
-- UNKNOWN and stale IN_FLIGHT require authoritative reconciliation by original reference.
-- Only a verified CONFIRMED transition emits a confirmation/fulfillment intent.
-- UNKNOWN may emit a differently typed status-check task, never a success notification.
-- A browser timeout, expired lease or Future cancellation does not authorize a new charge.
