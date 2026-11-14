// Illustrative Spring Boot service excerpt; requires Micrometer on classpath.
// Timer records checkout execution time, not just garbage collection pauses.
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.util.function.Supplier;
public final class CheckoutMetricsExample {
  private final MeterRegistry registry;
  public CheckoutMetricsExample(MeterRegistry registry) { this.registry = registry; }
  public <T> T record(Supplier<T> checkout) {
    return Timer.builder("checkout.processing.duration")
      .description("Checkout application processing duration")
      .register(registry).record(checkout);
  }
}
