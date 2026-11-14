import java.util.concurrent.*;
public final class PaymentBulkhead implements AutoCloseable {
 private final Semaphore permits = new Semaphore(40, true);
 private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
 public <T> Future<T> submit(Callable<T> call) {
  return executor.submit(() -> {
   if (!permits.tryAcquire(200, TimeUnit.MILLISECONDS)) throw new RejectedExecutionException("Payment capacity reached");
   try { return call.call(); } finally { permits.release(); }
  });
 }
 public void close() { executor.close(); }
}
