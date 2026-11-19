// Algorithm-only Java 21 example. NOT durable: use the PostgreSQL guard in OrderFlow.java
// for multiple replicas and restarts. This file exercises comparison semantics only.
package demo;
public class ProjectionDemo {
  record Snapshot(long version, String status) {}
  static Snapshot apply(Snapshot stored, Snapshot incoming) {
    if (incoming.version() == stored.version() && !incoming.status().equals(stored.status()))
      throw new IllegalArgumentException("Conflicting snapshot: investigate");
    return incoming.version() > stored.version() ? incoming : stored;
  }
  public static void main(String[] args) {
    var paid = new Snapshot(2,"PAID");
    var state = apply(new Snapshot(1,"PENDING"),paid);
    state = apply(state,new Snapshot(1,"PENDING"));
    state = apply(state,paid);
    if (!state.equals(paid)) throw new AssertionError("Projection regressed");
    try { apply(state,new Snapshot(2,"PENDING")); throw new AssertionError("Conflict accepted"); }
    catch (IllegalArgumentException expected) { }
    System.out.println("PASS: newer accepted; stale and duplicate ignored; conflict detected");
  }
}
