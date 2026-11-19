-- WRITE DATABASE: order and outbox share one local transaction.
CREATE TABLE orders (
  order_id text PRIMARY KEY, customer_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','PAID')),
  version bigint NOT NULL CHECK (version > 0),
  amount_minor bigint NOT NULL, currency text NOT NULL,
  provider_payment_id text UNIQUE
);
CREATE TABLE outbox (
  event_id uuid PRIMARY KEY, order_id text NOT NULL REFERENCES orders(order_id),
  version bigint NOT NULL, payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
  UNIQUE(order_id,version)
);
CREATE INDEX pending_outbox ON outbox(created_at) WHERE published_at IS NULL;
-- READ DATABASE: separate service-owned store.
CREATE TABLE order_projection (
  order_id text PRIMARY KEY, status text NOT NULL CHECK (status IN ('PENDING','PAID')),
  version bigint NOT NULL CHECK (version > 0), updated_at timestamptz NOT NULL DEFAULT now()
);
-- Parameterized conditional UPSERT (bind ?, do not interpolate):
-- INSERT INTO order_projection(order_id,status,version) VALUES (?,?,?)
-- ON CONFLICT(order_id) DO UPDATE
-- SET status=EXCLUDED.status,version=EXCLUDED.version,updated_at=now()
-- WHERE order_projection.version < EXCLUDED.version
-- RETURNING order_id,status,version;
