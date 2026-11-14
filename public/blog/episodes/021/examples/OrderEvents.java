import java.util.*;
public class OrderEvents {
  sealed interface OrderEvent permits Paid, CancellationRequested, Refunded, Shipped { String orderId(); }
  record Paid(String orderId, long cents, List<String> items) implements OrderEvent {
    Paid { requireId(orderId); if(cents < 0) throw new IllegalArgumentException("negative amount"); items = List.copyOf(items); }
  }
  record CancellationRequested(String orderId, String reason) implements OrderEvent {
    CancellationRequested { requireId(orderId); if(reason == null || reason.isBlank()) throw new IllegalArgumentException("reason required"); }
  }
  record Refunded(String orderId, String refundReference) implements OrderEvent {
    Refunded { requireId(orderId); if(refundReference == null || refundReference.isBlank()) throw new IllegalArgumentException("reference required"); }
  }
  record Shipped(String orderId, String trackingCode) implements OrderEvent {
    Shipped { requireId(orderId); if(trackingCode == null || trackingCode.isBlank()) throw new IllegalArgumentException("tracking required"); }
  }
  static void requireId(String id) { if(id == null || id.isBlank()) throw new IllegalArgumentException("order id required"); }
  static String handle(OrderEvent event) {
    return switch(event) {
      case Paid p -> "confirm payment " + p.cents();
      case CancellationRequested c -> "hold fulfillment: " + c.reason();
      case Refunded r -> "mark refund confirmed: " + r.refundReference();
      case Shipped s -> "display tracking: " + s.trackingCode();
    };
  }
  public static void main(String[] args) {
    var original = new ArrayList<>(List.of("SKU-7"));
    Paid paid = new Paid("ORD-42", 4999, original);
    original.add("INJECTED");
    if(paid.items().size() != 1) throw new AssertionError("not immutable");
    List<OrderEvent> events = List.of(paid, new CancellationRequested("ORD-42", "customer request"), new Refunded("ORD-42", "RF-12"), new Shipped("ORD-99", "TR-8"));
    for(var event : events) System.out.println(handle(event));
    try { new Paid(" ", -1, List.of()); throw new AssertionError("validation missing"); }
    catch(IllegalArgumentException expected) { System.out.println("validation PASS"); }
  }
}
