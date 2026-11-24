// Integration fragment: requires Micrometer in a Spring Boot application.
import io.micrometer.core.instrument.MeterRegistry;
import java.util.function.Supplier;
class MetricsExample {
 static <T> T measure(MeterRegistry registry, Supplier<T> checkout) {
  return registry.timer("checkout.duration").record(checkout);
 }
}
