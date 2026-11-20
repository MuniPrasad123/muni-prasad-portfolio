# Spring Boot 3 / Java 21 integration blueprint

1. `@PostMapping` accepts `@RequestBody byte[] rawBody` and signature/timestamp headers.
2. Provider adapter verifies raw-body HMAC/signature, timestamp, account and merchant; never trust JSON before verification.
3. Call a separate `@Service` method annotated `@Transactional` (through Spring proxy) that performs PostgreSQL inbox insert, guarded state update and outbox insert, branching on affected row counts.
4. On verified duplicate, return 2xx. On DB failure, return non-2xx to permit provider retry. On invalid signature, reject without DB writes.
5. Outbox dispatcher uses `FOR UPDATE SKIP LOCKED` or a reliable CDC pipeline; records delivery attempts and uses stable keys for email/warehouse consumers.
6. Use integration tests with Testcontainers PostgreSQL and provider-supplied signature fixtures before deployment.

The included Java class is a standalone teaching simulation, not a compiled Spring Boot service. Do not deploy it as an HTTP endpoint.
