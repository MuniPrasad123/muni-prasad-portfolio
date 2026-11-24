import java.math.BigDecimal;
import java.util.List;
public class CheckoutAllocationExample {
 record Line(BigDecimal price,int quantity) {}
 record Summary(int lines,BigDecimal total) {}
 static Summary summarize(List<Line> lines) {
  BigDecimal total=BigDecimal.ZERO;
  for(var line:lines){if(line.quantity()<1 || line.price().signum()<0) throw new IllegalArgumentException(); total=total.add(line.price().multiply(BigDecimal.valueOf(line.quantity())));}
  return new Summary(lines.size(),total);
 }
 public static void main(String[] args){var s=summarize(List.of(new Line(new BigDecimal("12.50"),2)));if(s.total().compareTo(new BigDecimal("25.00"))!=0) throw new AssertionError(); System.out.println(s);}
}
