import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/** Teaching HTTP adapter, not a complete authenticated provider integration.
 * Endpoint is trusted configuration, not an arbitrary customer-supplied URL.
 * Invoke within PaymentBulkhead.call() after a durable operation claim.
 * Provider auth/signing, result validation and durable UNKNOWN recovery are omitted.
 */
public final class DeadlinePaymentClient {
  private final URI endpoint;
  private final HttpClient client;
  private final Duration responseBudget;
  public DeadlinePaymentClient(URI endpoint,Duration connectBudget,Duration responseBudget){
    this.endpoint=endpoint;this.responseBudget=responseBudget;
    client=HttpClient.newBuilder().connectTimeout(connectBudget).build();
  }
  public HttpResponse<String> authorize(String stableReference,String trustedBody) throws Exception {
    var request=HttpRequest.newBuilder(endpoint)
        .timeout(responseBudget)
        // Header is illustrative: follow the actual provider's idempotency contract.
        .header("Idempotency-Key",stableReference)
        .header("Content-Type","application/json")
        .POST(HttpRequest.BodyPublishers.ofString(trustedBody)).build();
    return client.send(request,HttpResponse.BodyHandlers.ofString());
  }
  public HttpResponse<String> lookup(String stableReference) throws Exception {
    var encoded=java.net.URLEncoder.encode(stableReference,java.nio.charset.StandardCharsets.UTF_8);
    var request=HttpRequest.newBuilder(endpoint.resolve("/payments/"+encoded))
        .timeout(responseBudget).GET().build();
    return client.send(request,HttpResponse.BodyHandlers.ofString());
  }
  // Any ambiguous timeout/I/O failure must propagate to the durable coordinator.
  // It is NOT proof of decline or remote cancellation. Validate actual provider responses.
}
