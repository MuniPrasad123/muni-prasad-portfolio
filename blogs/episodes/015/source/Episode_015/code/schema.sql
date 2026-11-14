
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
