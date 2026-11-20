import java.util.*;
public final class WebhookStateMachine {
  enum Status { PENDING, SUCCEEDED, REFUNDED }
  private final Set<String> inbox = new HashSet<>();
  private final Set<String> outbox = new HashSet<>();
  private Status status = Status.PENDING;
  private int emailIntents = 0;
  private int shipmentIntents = 0;
  public synchronized String receive(String provider, String eventId, String paymentId) {
    String eventKey = provider + ":" + eventId;
    if (!inbox.add(eventKey)) return "ACK_DUPLICATE";
    if (status != Status.PENDING) return "ACK_NO_TRANSITION";
    status = Status.SUCCEEDED;
    String businessKey = "payment-succeeded:" + paymentId;
    if (outbox.add(businessKey)) { emailIntents++; shipmentIntents++; }
    return "ACK_ACCEPTED";
  }
  public static void main(String[] args) {
    WebhookStateMachine s = new WebhookStateMachine();
    assertEquals("ACK_ACCEPTED", s.receive("acme","evt_501","pay_100"));
    assertEquals("ACK_DUPLICATE", s.receive("acme","evt_501","pay_100"));
    assertEquals("ACK_NO_TRANSITION", s.receive("acme","evt_502","pay_100"));
    if(s.emailIntents!=1 || s.shipmentIntents!=1 || s.inbox.size()!=2 || s.outbox.size()!=1)
      throw new AssertionError("Idempotency invariant violated");
    System.out.println("PASS: one transition, one email intent, one shipment intent");
  }
  private static void assertEquals(String a,String b) { if(!a.equals(b)) throw new AssertionError(a+" != "+b); }
}
// This is an in-memory teaching model, NOT a durable webhook service.
// In production use the PostgreSQL transaction in schema.sql.
