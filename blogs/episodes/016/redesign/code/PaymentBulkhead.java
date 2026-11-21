import java.util.concurrent.*;
/** Teaching demo: local admission only, not payment correctness or global quotas. */
public final class PaymentBulkhead implements AutoCloseable {
  private final Semaphore slots;
  private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
  public PaymentBulkhead(int maxConcurrent) {
    if (maxConcurrent < 1) throw new IllegalArgumentException();
    slots = new Semaphore(maxConcurrent, true);
  }
  public <T> Future<T> submit(Callable<T> task) {
    return executor.submit(() -> {
      if (!slots.tryAcquire(100, TimeUnit.MILLISECONDS))
        throw new RejectedExecutionException("Dependency at capacity");
      try { return task.call(); }
      finally { slots.release(); }
    });
  }
  public int availablePermits() { return slots.availablePermits(); }
  public void close() { executor.close(); }
}
