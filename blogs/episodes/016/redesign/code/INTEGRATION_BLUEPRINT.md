# Spring Boot integration blueprint (not a complete application)
1. Authenticate caller and derive customer ID from verified security context.
2. In PostgreSQL, insert/retrieve checkout_attempt by (customer_id, idempotency_key); compare request_hash. Lock or claim attempt state durably.
3. Admit new provider calls through bounded per-provider bulkhead and global capacity policy. If not admitted, return busy only for an attempt that was not started.
4. Send provider_reference as provider-supported idempotency key. Configure actual HTTP connection/response timeouts.
5. Persist CONFIRMED on confirmed success; UNKNOWN on ambiguous timeout. Use reconciliation job to query provider before retries.
6. Commit state and transactional outbox event together; downstream workers must be idempotent.
7. Avoid holding database transactions open while making external HTTP calls.
8. Instrument admission, queue wait, DB pool wait, provider response and reconciliation lag.
