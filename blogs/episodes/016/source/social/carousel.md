# Seven-slide carousel
1. The customer sees a checkout spinner (hook)
2. Traditional request thread waits for payment
3. Java 21 virtual threads unmount while waiting on supported blocking I/O
4. The catch: payment provider and DB pools remain finite
5. Add a payment bulkhead + deadlines + durable idempotency
6. Measure queue time, p99, pool wait and failures (no invented benchmarks)
7. Takeaway: cheap waiting + bounded resources + correctness
