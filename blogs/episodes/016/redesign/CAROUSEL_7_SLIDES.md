# 7-slide LinkedIn carousel
1. **Customer problem:** Checkout spinner; did payment go through? Show phone and uncertain order status.
2. **Before:** Many request threads wait on payment provider; long queue.
3. **Virtual threads:** Cheaper waiting, not faster payments or more DB connections.
4. **Bulkhead:** Only safe provider concurrency admitted; overload gets quick guidance.
5. **Payment correctness:** Stable durable idempotency key, guarded state, no blind retry.
6. **Timeout recovery:** UNKNOWN → reconcile provider reference → accurate customer status.
7. **Takeaway:** Cheap threads ≠ extra capacity. Measure, bound, reconcile. Link to article.
