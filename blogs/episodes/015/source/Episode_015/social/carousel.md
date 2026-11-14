# Seven-slide carousel
1. **Paid once, emailed three times** — Customer trust problem
2. **Retries are normal** — Lost ACK creates duplicate deliveries
3. **Verify before trusting** — HMAC over raw body
4. **Inbox unique key** — Durable event ID deduplication
5. **One transaction** — Payment state + outbox
6. **Async workers** — Retry with downstream idempotency
7. **Operational checklist** — Lag, duplicates, reconciliation
