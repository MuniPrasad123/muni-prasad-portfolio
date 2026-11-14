import java.time.Duration;
import java.util.concurrent.*;

public class CheckoutReadFanout {
  record Quote(int stock, int shippingCents) {}
  static Quote quote(Executor executor) throws Exception {
    CompletableFuture<Integer> stock = CompletableFuture.supplyAsync(() -> 4, executor);
    CompletableFuture<Integer> shipping = CompletableFuture.supplyAsync(() -> 799, executor);
    try {
      return stock.thenCombine(shipping, Quote::new).get(500, TimeUnit.MILLISECONDS);
    } catch (TimeoutException ex) {
      stock.cancel(true); shipping.cancel(true); // best effort, NOT guaranteed interruption
      throw ex;
    }
  }
  public static void main(String[] args) throws Exception {
    ExecutorService pool = Executors.newFixedThreadPool(4);
    try { System.out.println(quote(pool)); } finally { pool.shutdownNow(); }
  }
}
