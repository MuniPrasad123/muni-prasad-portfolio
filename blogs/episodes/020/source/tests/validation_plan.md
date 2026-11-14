# Test artifacts and limitations
- Java 21 demonstration: compile and run if Java 21 available; see validation.json.
- Interactive lab: inspect six panels; click scenario actions; verify payment side effect remains ambiguous after timeout; duplicate delivery is idempotent in conceptual model; quiz scores all questions.
- Provider contract: test timeout, late success, duplicate webhook, invalid signature, replay and reconciliation.
- Database: verify uniqueness `(customer_id,idempotency_key)` and outbox transactional behavior.
- Security: test customer isolation, signature verification, redaction and rate limits.
- Performance: no measured throughput or latency numbers supplied; collect p95/p99 only under controlled load.
