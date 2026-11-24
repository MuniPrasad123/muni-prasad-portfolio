import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/** Teaching example: summarize results without serializing them for logging. */
public final class SearchAllocationExample {
    public record Product(String sku, BigDecimal price, boolean available) {
        public Product {
            Objects.requireNonNull(sku);
            Objects.requireNonNull(price);
            if (price.signum() < 0) throw new IllegalArgumentException("Negative price");
        }
    }
    public record SearchSummary(int matched, int available) {}
    public static SearchSummary summarize(List<Product> products) {
        int available = 0;
        for (Product product : products) {
            if (product.available()) available++;
        }
        return new SearchSummary(products.size(), available);
    }
}
