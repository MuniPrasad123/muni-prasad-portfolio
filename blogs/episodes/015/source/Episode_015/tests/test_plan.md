# Verification checklist
1. Send same signed event ID three times: one payment transition and one outbox event.
2. Lose ACK after commit: retry returns 2xx without duplicate effects.
3. Tamper body: signature verification rejects before DB write.
4. Expired timestamp: reject according to provider policy.
5. Outbox worker crashes before marking published: retries with stable downstream idempotency key.
6. Event arrives out of order: reconcile rather than regress state.
7. Concurrent duplicate delivery: unique constraint allows one insertion.

No live PostgreSQL, payment provider, or integration tests were run in this package.
