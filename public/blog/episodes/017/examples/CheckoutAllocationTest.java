import java.math.BigDecimal;
import java.util.List;

public final class CheckoutAllocationTest {
    private static void check(boolean value) { if (!value) throw new AssertionError(); }
    private static void rejects(Runnable action, Class<? extends Throwable> expected) {
        try { action.run(); } catch (Throwable failure) {
            if (expected.isInstance(failure)) return;
            throw new AssertionError("Unexpected failure", failure);
        }
        throw new AssertionError("Expected " + expected.getName());
    }
    public static void main(String[] args) {
        var units = CheckoutAllocationExample.summarize(List.of(
                new CheckoutAllocationExample.Item("SKU-A", 2),
                new CheckoutAllocationExample.Item("SKU-B", 1)));
        check(units.lineCount() == 2 && units.units() == 3);
        check(CheckoutAllocationExample.summarize(List.of()).units() == 0);
        rejects(() -> new CheckoutAllocationExample.Item("bad", 0), IllegalArgumentException.class);
        var priced = PricedCheckoutExample.summarize(List.of(
                new PricedCheckoutExample.Line(new BigDecimal("12.50"), 2),
                new PricedCheckoutExample.Line(new BigDecimal("0.10"), 3)));
        check(priced.lines() == 2 && priced.total().compareTo(new BigDecimal("25.30")) == 0);
        check(PricedCheckoutExample.summarize(List.of()).total().signum() == 0);
        rejects(() -> new PricedCheckoutExample.Line(new BigDecimal("-0.01"), 1), IllegalArgumentException.class);
        rejects(() -> new PricedCheckoutExample.Line(BigDecimal.ONE, 0), IllegalArgumentException.class);
        rejects(() -> new PricedCheckoutExample.Line(null, 1), NullPointerException.class);
        rejects(() -> PricedCheckoutExample.summarize(null), NullPointerException.class);
        System.out.println("PASS: original SKU/quantity and priced summaries; empty input; exact decimal totals; invalid input. No allocation or latency benchmark claimed.");
    }
}
