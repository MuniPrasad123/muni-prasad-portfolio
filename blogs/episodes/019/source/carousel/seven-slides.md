# 7-slide carousel (1080×1350 each)
1. Hook: “Checkout froze. CPU was fine. What happened?” — customer spinner.
2. Symptom: delayed checkout, repeated clicks, uncertain payment status.
3. Two locks: thread A holds inventory, B holds payment; each waits for the other.
4. Evidence: three thread dumps, lock owner chains, JFR, pool metrics.
5. Architecture fix: short transactions, consistent lock ordering, conditional inventory update.
6. Payment safety: durable idempotency key, reconcile unknown outcomes, transactional outbox.
7. Validation + CTA: measure p99, deadlock count, no duplicate authorizations; open lab.
