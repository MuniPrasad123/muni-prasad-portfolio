import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/** Java 21 teaching adapter. Run call() on an existing virtual request/task thread.
 * No hidden executor or unbounded population of permit-waiting tasks is created.
 * This limits LOCAL calls only, not durable payment identity or global quotas. */
public final class PaymentBulkhead {
  private final Semaphore admitted;
  private final Semaphore active;
  private final int totalCapacity;
  private final long waitNanos;
  public PaymentBulkhead(int maxActive, int maxWaiting, Duration maxWait) {
    if (maxActive<1 || maxWaiting<0 || maxWait==null || maxWait.isNegative())
      throw new IllegalArgumentException("Invalid bulkhead bounds");
    totalCapacity=Math.addExact(maxActive,maxWaiting);
    admitted=new Semaphore(totalCapacity,true);
    active=new Semaphore(maxActive,true);
    waitNanos=maxWait.toNanos();
  }
  public <T> T call(Callable<T> operation) throws Exception {
    if(!admitted.tryAcquire()) throw new RejectedExecutionException("Active and waiting budgets full");
    boolean acquired=false;
    try {
      acquired=active.tryAcquire(waitNanos,TimeUnit.NANOSECONDS);
      if(!acquired) throw new RejectedExecutionException("Bounded permit wait expired before execution");
      return operation.call();
    } finally {
      if(acquired) active.release();
      admitted.release();
    }
  }
  public int availablePermits(){return active.availablePermits();}
  public int admittedOperations(){return totalCapacity-admitted.availablePermits();}
}
