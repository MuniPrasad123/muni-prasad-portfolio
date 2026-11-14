# Seven-slide LinkedIn carousel
1. **The checkout timed out. Was the card charged?** Customer screenshot concept.
2. **The trap:** future timeout ≠ canceled HTTP payment.
3. **Parallel reads:** stock and shipping safely concurrent; show split packets.
4. **Persist intent:** unique checkout attempt + provider idempotency key.
5. **Ambiguous outcome:** UNKNOWN + 202, never falsely FAILED.
6. **Recover safely:** signed webhook + status lookup + transactional outbox.
7. **Architect takeaway:** concurrency speeds reads; durability protects money. CTA: Which failure would you test first?
