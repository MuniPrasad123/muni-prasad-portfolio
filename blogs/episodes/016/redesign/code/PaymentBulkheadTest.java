import java.util.concurrent.*;
public class PaymentBulkheadTest {
  public static void main(String[] args) throws Exception {
    try (var bulkhead = new PaymentBulkhead(1)) {
      CountDownLatch entered = new CountDownLatch(1), release = new CountDownLatch(1);
      Future<Integer> first = bulkhead.submit(() -> { entered.countDown(); release.await(); return 42; });
      if (!entered.await(2, TimeUnit.SECONDS)) throw new AssertionError("first not started");
      Future<Integer> second = bulkhead.submit(() -> 7);
      try { second.get(2, TimeUnit.SECONDS); throw new AssertionError("should reject"); }
      catch (ExecutionException e) { if (!(e.getCause() instanceof RejectedExecutionException)) throw e; }
      release.countDown();
      if (first.get(2, TimeUnit.SECONDS) != 42) throw new AssertionError();
      if (bulkhead.availablePermits()!=1) throw new AssertionError("permit leak");
    }
    System.out.println("PASS: saturation rejects; permit released");
  }
}
