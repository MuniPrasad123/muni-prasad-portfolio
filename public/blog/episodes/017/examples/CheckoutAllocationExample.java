import java.util.List;
import java.util.Objects;

public final class CheckoutAllocationExample {
    public record Item(String sku, int quantity) {
        public Item { Objects.requireNonNull(sku); if (quantity <= 0) throw new IllegalArgumentException(); }
    }
    public record Summary(int lineCount, long units) {}
    // Avoid constructing giant intermediate strings just to calculate order totals.
    public static Summary summarize(List<Item> items) {
        Objects.requireNonNull(items);
        long units = 0;
        for (Item item : items) units = Math.addExact(units, item.quantity());
        return new Summary(items.size(), units);
    }
    public static void main(String[] args) {
        System.out.println(summarize(List.of(new Item("SKU-1", 2), new Item("SKU-2", 1))));
    }
}
