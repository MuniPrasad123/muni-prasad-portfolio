# Validation plan (not executed against production)
- Concurrent duplicate requests: one unique attempt per customer/key; reject changed payload.
- Provider timeout after acceptance: reconcile by provider reference; never blind-retry charge.
- Connection pool saturation: monitor pending connections and timeouts.
- Virtual thread vs platform thread: same load profile, capture JFR and latency histograms.
- Bulkhead rejection: verify fast controlled response, no payment invocation.
- Security: cross-user idempotency key must not disclose another order.
