-- PostgreSQL: command state and outbox share one transaction
CREATE TABLE orders (id BIGINT PRIMARY KEY, status TEXT NOT NULL, version BIGINT NOT NULL);
CREATE TABLE outbox (event_id UUID PRIMARY KEY, order_id BIGINT NOT NULL, version BIGINT NOT NULL, event_type TEXT NOT NULL, payload JSONB NOT NULL, published_at TIMESTAMPTZ);
CREATE TABLE order_projection (order_id BIGINT PRIMARY KEY, status TEXT NOT NULL, version BIGINT NOT NULL);
BEGIN;
UPDATE orders SET status='PAID',version=version+1 WHERE id=101 AND status='PENDING';
INSERT INTO outbox(event_id,order_id,version,event_type,payload)
SELECT gen_random_uuid(),id,version,'OrderPaid',jsonb_build_object('status',status) FROM orders WHERE id=101 AND status='PAID';
COMMIT;
-- In production, ensure the UPDATE actually transitioned exactly one row and outbox publication is atomic with that transition.
-- Projection upsert only advances newer versions:
INSERT INTO order_projection(order_id,status,version) VALUES (101,'PAID',2)
ON CONFLICT (order_id) DO UPDATE SET status=EXCLUDED.status,version=EXCLUDED.version
WHERE order_projection.version < EXCLUDED.version;
