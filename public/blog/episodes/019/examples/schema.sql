-- PostgreSQL illustrative checkout data model
CREATE TABLE inventory (sku text PRIMARY KEY, available integer NOT NULL CHECK (available >= 0));
CREATE TABLE checkout_orders (id bigint PRIMARY KEY, status text NOT NULL, version integer NOT NULL DEFAULT 0, payment_key text NOT NULL UNIQUE);
CREATE TABLE outbox (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, order_id bigint NOT NULL REFERENCES checkout_orders(id), event_type text NOT NULL, published_at timestamptz);
INSERT INTO inventory VALUES ('SKU-RED', 3);
INSERT INTO checkout_orders(id,status,payment_key) VALUES (1001,'PENDING','pay-order-1001');
-- Use a single atomic conditional UPDATE for reservation and check affected row count.
UPDATE inventory SET available=available-1 WHERE sku='SKU-RED' AND available>=1;
