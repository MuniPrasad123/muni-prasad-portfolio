CREATE TABLE payments (
 payment_id text PRIMARY KEY,
 order_id text NOT NULL,
 merchant_id text NOT NULL,
 status text NOT NULL CHECK(status IN ('PENDING','SUCCEEDED','REFUNDED'))
);
CREATE TABLE webhook_inbox (
 provider text NOT NULL,
 event_id text NOT NULL,
 payment_id text NOT NULL,
 received_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(provider,event_id)
);
CREATE TABLE outbox (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 event_key text NOT NULL UNIQUE,
 event_type text NOT NULL,
 payload jsonb NOT NULL,
 published_at timestamptz
);
INSERT INTO payments VALUES ('pay_100','order_100','merchant_1','PENDING');
-- One transaction, only after signature/merchant validation:
BEGIN;
WITH accepted AS (
 INSERT INTO webhook_inbox(provider,event_id,payment_id)
 VALUES ('acme','evt_501','pay_100')
 ON CONFLICT DO NOTHING RETURNING payment_id
), changed AS (
 UPDATE payments p SET status='SUCCEEDED'
 WHERE p.payment_id IN (SELECT payment_id FROM accepted)
 AND p.merchant_id='merchant_1' AND p.status='PENDING'
 RETURNING p.payment_id,p.order_id
)
INSERT INTO outbox(event_key,event_type,payload)
SELECT 'payment-succeeded:'||payment_id,'PaymentSucceeded',
 jsonb_build_object('paymentId',payment_id,'orderId',order_id)
FROM changed ON CONFLICT DO NOTHING;
COMMIT;
-- For duplicate event IDs, accepted is empty; no new state or outbox event.
-- For different event IDs on the same succeeded payment, changed is empty.
