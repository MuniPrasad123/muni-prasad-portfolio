package demo;
import java.util.*;
public class ProjectionDemo {
  record Event(String id, long version, String status) {}
  static class Projection {
    long version = -1; String status = "UNKNOWN"; Set<String> seen = new HashSet<>();
    boolean apply(Event e) {
      if (!seen.add(e.id())) return false;
      if (e.version() <= version) return false;
      version = e.version(); status = e.status(); return true;
    }
  }
  public static void main(String[] args) {
    var p = new Projection();
    p.apply(new Event("evt-paid", 2, "PAID"));
    p.apply(new Event("evt-pending", 1, "PENDING"));
    p.apply(new Event("evt-paid", 2, "PAID"));
    if (!p.status.equals("PAID") || p.version != 2) throw new AssertionError("Projection regressed");
    System.out.println("PASS: status=" + p.status + ", version=" + p.version);
  }
}
