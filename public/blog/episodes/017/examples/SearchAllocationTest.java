import java.math.BigDecimal;
import java.util.List;

public final class SearchAllocationTest {
    public static void main(String[] args) {
        var products = List.of(
            new SearchAllocationExample.Product("shoe-1", new BigDecimal("1499.00"), true),
            new SearchAllocationExample.Product("shoe-2", new BigDecimal("1999.00"), false));
        var result = SearchAllocationExample.summarize(products);
        if (result.matched() != 2 || result.available() != 1) throw new AssertionError(result);
        if (!products.getFirst().price().equals(new BigDecimal("1499.00"))) throw new AssertionError("Price changed");
        if (!SearchAllocationExample.summarize(List.of()).equals(new SearchAllocationExample.SearchSummary(0, 0))) throw new AssertionError("Empty search");
        try {
            new SearchAllocationExample.Product("bad", new BigDecimal("-1"), true);
            throw new AssertionError("Negative price accepted");
        } catch (IllegalArgumentException expected) { /* Price contract preserved. */ }
        System.out.println("PASS: product counts, availability, unchanged prices, empty results and invalid prices");
    }
}
