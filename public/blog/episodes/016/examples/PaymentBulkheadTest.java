import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BooleanSupplier;

/** Real Java 21 concurrency tests, not performance benchmarks. */
public final class PaymentBulkheadTest {
  static void check(boolean condition,String message){if(!condition)throw new AssertionError(message);}
  static void until(BooleanSupplier condition) throws Exception {
    long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(3);
    while(!condition.getAsBoolean()&&System.nanoTime()<deadline)Thread.sleep(2);
    check(condition.getAsBoolean(),"Condition not reached");
  }
  public static void main(String[] args) throws Exception {
    boundedWaitingAndNoExtraWork(); releasesOnFailure(); timedOutWaiterDoesNotLeak(); callerTimeoutDoesNotReleaseRunningPermit(); interruptedWaiterReleasesAdmission();
    System.out.println("PASS: active + waiting bounds, failure/timeout/interruption release, and caller-timeout safety");
  }
  static void boundedWaitingAndNoExtraWork() throws Exception {
    var bulkhead=new PaymentBulkhead(1,1,Duration.ofSeconds(2));
    var entered=new CountDownLatch(1);var release=new CountDownLatch(1);var active=new AtomicInteger();var max=new AtomicInteger();
    try(var executor=Executors.newVirtualThreadPerTaskExecutor()){
      try {
        var first=executor.submit(()->bulkhead.call(()->{int n=active.incrementAndGet();max.accumulateAndGet(n,Math::max);entered.countDown();try{release.await();return 42;}finally{active.decrementAndGet();}}));
        check(entered.await(3,TimeUnit.SECONDS),"First not running");
        var second=executor.submit(()->bulkhead.call(()->7));until(()->bulkhead.admittedOperations()==2);
        try{bulkhead.call(()->{throw new AssertionError("Rejected work executed");});throw new AssertionError("Unbounded admission");}catch(RejectedExecutionException expected){}
        release.countDown();check(first.get(3,TimeUnit.SECONDS)==42,"First result");check(second.get(3,TimeUnit.SECONDS)==7,"Second result");
        check(max.get()==1&&bulkhead.availablePermits()==1&&bulkhead.admittedOperations()==0,"Capacity leak");
      } finally {release.countDown();}
    }
  }
  static void releasesOnFailure() throws Exception {
    var bulkhead=new PaymentBulkhead(1,0,Duration.ZERO);
    try{bulkhead.call(()->{throw new IllegalStateException("Provider failed");});throw new AssertionError();}catch(IllegalStateException expected){}
    check(bulkhead.availablePermits()==1&&bulkhead.admittedOperations()==0,"Exception leak");
    check(bulkhead.call(()->9)==9,"Later operation blocked");
  }
  static void timedOutWaiterDoesNotLeak() throws Exception {
    var bulkhead=new PaymentBulkhead(1,1,Duration.ofMillis(40));var entered=new CountDownLatch(1);var release=new CountDownLatch(1);
    try(var executor=Executors.newVirtualThreadPerTaskExecutor()){
      try{var first=executor.submit(()->bulkhead.call(()->{entered.countDown();release.await();return 1;}));check(entered.await(3,TimeUnit.SECONDS),"First missing");
        try{bulkhead.call(()->2);throw new AssertionError("Wait did not expire");}catch(RejectedExecutionException expected){}
        check(bulkhead.admittedOperations()==1,"Timed-out waiter leaked");release.countDown();first.get(3,TimeUnit.SECONDS);
      }finally{release.countDown();}
    }
    check(bulkhead.availablePermits()==1&&bulkhead.admittedOperations()==0,"Final permit leak");
  }
  static void callerTimeoutDoesNotReleaseRunningPermit() throws Exception {
    var bulkhead=new PaymentBulkhead(1,0,Duration.ZERO);var entered=new CountDownLatch(1);var release=new CountDownLatch(1);
    try(var executor=Executors.newVirtualThreadPerTaskExecutor()){
      try{var first=executor.submit(()->bulkhead.call(()->{entered.countDown();release.await();return 1;}));check(entered.await(3,TimeUnit.SECONDS),"First missing");
        try{first.get(10,TimeUnit.MILLISECONDS);throw new AssertionError("Expected caller timeout");}catch(TimeoutException expected){}
        check(bulkhead.availablePermits()==0,"Caller timeout released a running call's permit");
        try{bulkhead.call(()->2);throw new AssertionError("Second call admitted");}catch(RejectedExecutionException expected){}
        release.countDown();first.get(3,TimeUnit.SECONDS);
      }finally{release.countDown();}
    }
  }
  static void interruptedWaiterReleasesAdmission() throws Exception {
    var bulkhead=new PaymentBulkhead(1,1,Duration.ofSeconds(2));var entered=new CountDownLatch(1);var release=new CountDownLatch(1);var interrupted=new CountDownLatch(1);
    try(var executor=Executors.newVirtualThreadPerTaskExecutor()){
      try{var first=executor.submit(()->bulkhead.call(()->{entered.countDown();release.await();return 1;}));check(entered.await(3,TimeUnit.SECONDS),"First missing");
        Thread waiter=Thread.ofVirtual().start(()->{try{bulkhead.call(()->2);}catch(InterruptedException expected){interrupted.countDown();}catch(Exception e){throw new RuntimeException(e);}});
        until(()->bulkhead.admittedOperations()==2);waiter.interrupt();check(interrupted.await(3,TimeUnit.SECONDS),"Interrupt not propagated");waiter.join();
        check(bulkhead.admittedOperations()==1,"Interrupted waiter leaked");release.countDown();first.get(3,TimeUnit.SECONDS);
      }finally{release.countDown();}
    }
  }
}
