package demo;
import java.util.*;
import java.util.concurrent.*;
public class RoutingDemo {
  record Pod(String name, boolean ready, boolean terminating) {}
  static Optional<Pod> choose(List<Pod> pods) {
    return pods.stream().filter(p -> p.ready() && !p.terminating()).findFirst();
  }
  public static void main(String[] args) {
    var pods = List.of(new Pod("checkout-a", true, true), new Pod("checkout-b", true, false));
    var selected = choose(pods).orElseThrow();
    if (!selected.name().equals("checkout-b")) throw new AssertionError("Unsafe route");
    System.out.println("PASS: routed to " + selected.name());
  }
}
