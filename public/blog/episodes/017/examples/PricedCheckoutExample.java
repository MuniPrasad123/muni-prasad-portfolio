import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/** One-pass teaching summary. Not a pricing engine or an allocation benchmark. */
public final class PricedCheckoutExample {
    public record Line(BigDecimal unitPrice, int quantity) {
        public Line {
            Objects.requireNonNull(unitPrice);
            if (unitPrice.signum() < 0 || quantity < 1)
                throw new IllegalArgumentException("Invalid line");
        }
    }
    public record Summary(int lines, BigDecimal total) {}
    public static Summary summarize(List<Line> lines) {
        Objects.requireNonNull(lines);
        BigDecimal total = BigDecimal.ZERO;
        for (Line line : lines) {
            Objects.requireNonNull(line);
            total = total.add(line.unitPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }
        return new Summary(lines.size(), total);
    }
}
