# Six-slide carousel

1. **Customer confusion** — Payment succeeds but My Orders still says Pending.

2. **Command side** — Payment callback updates order and outbox atomically.

3. **Kafka flow** — Outbox relay publishes versioned OrderPaid event.

4. **Projection lag** — Read model may be behind; do not mislabel payment as failed.

5. **Version guard** — Duplicate and older events cannot roll the projection backward.

6. **Reconciliation** — Detect lag, replay safely, and show synchronization status.
