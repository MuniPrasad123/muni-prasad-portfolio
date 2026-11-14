import java.lang.management.ManagementFactory;
import java.lang.management.ThreadInfo;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.CountDownLatch;

public class DeadlockDemo {
    static final Object INVENTORY = new Object();
    static final Object PAYMENT = new Object();
    static final CountDownLatch BOTH_FIRST_LOCKS = new CountDownLatch(2);
    static void run(Object first, Object second) {
        synchronized (first) {
            BOTH_FIRST_LOCKS.countDown();
            try { BOTH_FIRST_LOCKS.await(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
            synchronized (second) { System.out.println("unreachable"); }
        }
    }
    public static void main(String[] args) throws Exception {
        Thread a = new Thread(() -> run(INVENTORY, PAYMENT), "checkout-inventory-first");
        Thread b = new Thread(() -> run(PAYMENT, INVENTORY), "checkout-payment-first");
        a.setDaemon(true); b.setDaemon(true); a.start(); b.start();
        ThreadMXBean bean = ManagementFactory.getThreadMXBean();
        long[] ids = null;
        for (int i=0; i<30 && ids == null; i++) { Thread.sleep(100); ids = bean.findDeadlockedThreads(); }
        if (ids == null) throw new AssertionError("Deadlock was not detected");
        System.out.println("DEADLOCK DETECTED: " + ids.length + " threads");
        for (ThreadInfo t : bean.getThreadInfo(ids, true, true)) {
            System.out.println(t.getThreadName() + " waits for " + t.getLockName() + " owned by " + t.getLockOwnerName());
        }
    }
}
