import java.util.*;
import java.util.concurrent.*;
/** Self-contained Java 21 demonstration, not a production cache. */
public final class RetentionLab {
  record CartSnapshot(String customerId, byte[] payload) {}
  static final class BoundedCache {
    private final int capacity;
    private final LinkedHashMap<String, CartSnapshot> map = new LinkedHashMap<>(16, .75f, true);
    BoundedCache(int capacity) { if (capacity < 1) throw new IllegalArgumentException(); this.capacity = capacity; }
    synchronized void put(String key, CartSnapshot value) {
      map.put(key, value);
      while (map.size() > capacity) map.remove(map.keySet().iterator().next());
    }
    synchronized int size() { return map.size(); }
  }
  public static void main(String[] args) {
    Map<String,CartSnapshot> unbounded = new ConcurrentHashMap<>();
    BoundedCache bounded = new BoundedCache(500);
    for (int i=0; i<20_000; i++) {
      String key="session-"+i;
      CartSnapshot cart=new CartSnapshot("customer-"+i, new byte[256]);
      unbounded.put(key,cart); bounded.put(key,cart);
    }
    System.out.println("Unbounded entries="+unbounded.size());
    System.out.println("Bounded entries="+bounded.size());
    if (bounded.size()!=500 || unbounded.size()!=20_000) throw new AssertionError("Unexpected cache count");
  }
}
