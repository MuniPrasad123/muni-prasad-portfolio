# Six-slide carousel

1. **Flash-sale symptom** — Customers see 503 at checkout; the order status is uncertain.

2. **Request route** — Browser packet enters gateway and selects a checkout endpoint.

3. **Root cause** — Terminating pod still receives traffic while readiness is stale.

4. **Safer deployment** — Readiness fails first; connections drain before pod termination.

5. **Retry safety** — Idempotency key protects POST /checkout from duplicate orders.

6. **Validate** — Trace request IDs, watch 5xx, drain behavior, and order uniqueness.
