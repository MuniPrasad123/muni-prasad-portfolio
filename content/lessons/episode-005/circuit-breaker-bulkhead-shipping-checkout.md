---
title: "Circuit Breakers and Bulkheads in Spring Boot: Protecting Checkout from Slow Services"
slug: "circuit-breaker-bulkhead-shipping-checkout"
folder: "Resilience & API protection"
date: "2026-11-03"
description: "Shoppers cannot finish checkout because a slow shipping provider ties up application workers."
tags: ["Java", "Spring Boot", "Microservices", "System design", "E-commerce"]
cover: "/blog/circuit-breaker/cover.svg"
coverAlt: "Circuit Breakers and Bulkheads in Spring Boot: Protecting Checkout from Slow Services"
draft: false
sample: false
level: "Architecture in Motion · Episode 005"
simulation: "circuit-breaker"
video: "/blog/circuit-breaker/lesson.mp4"
videoPoster: "/blog/circuit-breaker/poster.png"
videoCaptions: "/blog/circuit-breaker/captions.vtt"
videoCaption: "Supplied narrated lesson · illustrative architecture"
---

## What does the shopper experience?

Shoppers cannot finish checkout because a slow shipping provider ties up application workers.

## What are we fixing?

Set HTTP timeouts, limit concurrent shipping calls with a bulkhead, and temporarily stop calls to an unhealthy provider with a circuit breaker.


**Architecture in Motion — Episode 005 | Java 21 · Spring Boot 3 · Resilience4j · Microservices**

> A third-party shipping service is slow. Your checkout service is healthy. So why are customers seeing timeouts across the entire store?

The answer is **cascading failure**. A dependency can exhaust the resources of an otherwise healthy service unless you establish a bounded time budget, isolate its concurrency and stop calling it when it is consistently failing.

[Watch the lesson](#lesson-video) or [try the interactive lab](#interactive-lab).

## 1. The real-world problem: a carrier outage at checkout

Imagine a retailer using an Oracle ATG storefront backed by a Spring Boot checkout orchestration service. Checkout asks a third-party carrier API for live shipping quotes before showing the final payable total. During a flash sale, the carrier starts taking eight seconds to respond instead of its normal 120 milliseconds.

This is an **illustrative incident**, not a claim about a particular retailer. Suppose 80 quote requests arrive per second and every request waits eight seconds. Little's Law suggests approximately **640 concurrent requests** could accumulate if the rate persists and there is no protective bound (`L = λ × W = 80 × 8`). That is a conceptual capacity calculation, **not a measured benchmark**. A 100-thread server cannot dedicate 640 threads to that dependency; queues grow, request deadlines expire, and unrelated checkout work becomes slow.

The immediate temptation is to increase the thread pool or retry every error. Both can make the outage worse. More threads consume resources; retries multiply requests into an already struggling provider.

## 2. Architecture before and after

![Illustrative architecture](/blog/circuit-breaker/cover.svg)

The arrows show the logical protections, not the exact Java decorator nesting. Actual annotation aspect order must be checked when combining Resilience4j annotations.

### The four defenses, in the right roles

| Defense | What it controls | What it does *not* guarantee |
|---|---|---|
| **HTTP timeout** | Upper bound for connection/read waiting on the carrier, subject to client semantics | Doesn't isolate concurrency or cancel every possible downstream side effect |
| **Semaphore bulkhead** | Maximum simultaneous calls to that dependency | Doesn't detect repeated failures |
| **Circuit breaker** | Opens after sufficient measured failures, then allows limited recovery probes | Doesn't cap concurrent calls or enforce a timeout on its own |
| **Graceful degradation** | Gives the shopper an honest, controlled outcome | Cannot safely invent a shipping charge or confirm a payable total |

A circuit breaker has three main states: **CLOSED** (allow and measure), **OPEN** (reject immediately), and **HALF_OPEN** (allow limited probes). A bulkhead protects the shared resource pool even *before* the breaker has enough evidence to open.

## 3. Implement the guarded shipping quote call

These examples target **Spring Boot 3 / Spring Framework 6.x** with the `resilience4j-spring-boot3` starter and AOP. Pin compatible library versions through your build's dependency management; do not copy an unverified version number from a blog.

**Dependencies (Gradle):**

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-aop'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.github.resilience4j:resilience4j-spring-boot3'
}
```

**Create an HTTP client with explicit connect/read timeouts:**

```java
@Configuration
class ShippingHttpConfig {
    @Bean
    RestClient shippingRestClient(RestClient.Builder builder,
                                  @Value("${shipping.base-url}") String baseUrl) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(300); // milliseconds
        factory.setReadTimeout(800);    // milliseconds
        return builder.baseUrl(baseUrl).requestFactory(factory).build();
    }
}
```

`RestClient` is a synchronous HTTP client. A configured HTTP read timeout is not the same as a universal end-to-end request deadline; establish an overall checkout budget as well. For production, choose and test a pooled HTTP client implementation with suitable connection limits.

**Isolate the carrier dependency and fail honestly:**

```java
@Service
public class ShippingQuoteService {
    private final RestClient client;

    public ShippingQuoteService(RestClient shippingRestClient) {
        this.client = shippingRestClient;
    }

    @CircuitBreaker(name = "shippingQuotes", fallbackMethod = "quoteUnavailable")
    @Bulkhead(name = "shippingQuotes", type = Bulkhead.Type.SEMAPHORE)
    public ShippingQuote quote(QuoteRequest request) {
        ShippingQuote quote = client.post()
                .uri("/quotes")
                .body(request)
                .retrieve()
                .body(ShippingQuote.class);
        if (quote == null) throw new IllegalStateException("Empty carrier quote");
        return quote;
    }

    private ShippingQuote quoteUnavailable(QuoteRequest request, Throwable failure) {
        // Log an internal correlation ID and exception class, not addresses/tokens.
        throw new ShippingQuoteUnavailableException("Live shipping quote unavailable", failure);
    }
}
```

Import `io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker`, `io.github.resilience4j.bulkhead.annotation.Bulkhead`, and the Spring `RestClient` / `SimpleClientHttpRequestFactory` types. Define `QuoteRequest`, `ShippingQuote` and `ShippingQuoteUnavailableException` as your domain DTO/exception types. Keep this service in a different Spring bean from the caller so AOP proxy interception is applied; **self-invocation bypasses Spring proxy advice**.

**Resilience4j configuration:**

```yaml
resilience4j:
  circuitbreaker:
    instances:
      shippingQuotes:
        slidingWindowType: COUNT_BASED
        slidingWindowSize: 20
        minimumNumberOfCalls: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true
  bulkhead:
    instances:
      shippingQuotes:
        maxConcurrentCalls: 20
        maxWaitDuration: 0ms
```

These are **starting hypotheses**, not universal tuning recommendations. A 50% failure threshold on a 20-call window opens only once at least 10 calls have been recorded and the configured failure-rate rule is met. Configure exception recording to distinguish dependency failures from client validation errors; otherwise a flood of customer 4xx errors could incorrectly open the breaker. `@Bulkhead` with semaphore type rejects excess concurrent calls instead of queueing them.

**Return a controlled response:**

```java
@RestControllerAdvice
class ShippingErrors {
    @ExceptionHandler(ShippingQuoteUnavailableException.class)
    ResponseEntity<ProblemDetail> unavailable(ShippingQuoteUnavailableException ex) {
        var problem = ProblemDetail.forStatus(HttpStatus.SERVICE_UNAVAILABLE);
        problem.setTitle("Shipping quote temporarily unavailable");
        problem.setDetail("Please retry shipping selection shortly. No payment was taken.");
        return ResponseEntity.status(503)
                .header(HttpHeaders.RETRY_AFTER, "10")
                .body(problem);
    }
}
```

`Retry-After: 10` is an example response policy, not a promise that the carrier recovers in ten seconds. Show a friendly shipping-unavailable message in ATG and keep the cart intact. **Do not submit payment or promise an order total until the authoritative shipping amount is known.** If your business supports pickup or free-shipping eligibility, those must be independently verified business rules.

## 4. What happens under failure?

**T+0:** Carrier latency spikes. Requests accumulate. The 800 ms HTTP read timeout bounds many waits, but the exact behavior depends on the client and transport.

**T+0.8 s:** Timeouts begin. The semaphore bulkhead admits at most 20 concurrent carrier calls *per application instance* and rejects excess immediately.

**After sufficient recorded failures:** The circuit breaker opens. New carrier calls fail fast, preserving capacity for cart, login, pricing and other checkout work.

**After the configured open wait:** The breaker enters HALF_OPEN and permits a small number of probe calls. Successful probes can close it; failures can reopen it. The configured transition and evaluation rules determine the precise behavior.

**On recovery:** The carrier returns to normal latency. Shipping quotes resume, and checkout can present a verified total.

**Important nuance:** Each application replica normally has its own in-memory breaker state and bulkhead permits. Twenty permits across three replicas can mean up to sixty in-flight carrier calls. To enforce a provider-wide cap, use an additional shared quota or gateway policy.

## 5. Why not just add retries?

A timeout is ambiguous: the remote service may have received the request. Retrying an idempotent quote read can be safe **only if the provider contract guarantees the required semantics**. Never automatically retry a payment capture or order creation without a stable idempotency key and reconciliation. Limit retries to transient failures, use exponential backoff with jitter, and ensure the retry budget fits inside the customer's overall deadline. Place retries carefully relative to the breaker: annotation aspect ordering changes what counts as one observed failure.

## 6. Performance, scaling, resilience and security checklist

- Track **p95/p99 quote latency**, connection-pool utilization, active bulkhead calls, bulkhead rejections, breaker state transitions, failure-rate window and carrier response codes.
- Keep timeout and bulkhead budgets below the end-to-end checkout deadline. A circuit breaker does **not** substitute for either.
- Never use a generic `catch (Exception)` fallback that hides validation errors or corrupts pricing. Classify exceptions.
- Use mTLS or server-side API credentials where required, rotate secrets, mask addresses and payment identifiers in logs, and enforce TLS.
- Test a carrier outage with **fault injection** and **measured load testing** before choosing thresholds. The accompanying browser simulator is only a deterministic conceptual model.
- Avoid storing personally identifiable shipping addresses in circuit-breaker event labels or high-cardinality metrics.
- Provide a manual recovery / feature-flag path if the provider stays unavailable, and communicate honest user-facing errors.

## 7. Interactive experiment: failure containment

Open [the interactive lab](#interactive-lab). Toggle protection mode, request rate, outage latency, and provider recovery. Observe simulated active calls, rejected calls and the breaker state. The browser model uses intentionally simplified deterministic rules and is **not a benchmark**, load test or substitute for a real PostgreSQL / Java / HTTP integration test.

## 8. Common pitfalls

1. **Circuit breaker only:** allows concurrency spikes until enough failures are observed; use a bulkhead and timeouts too.
2. **Huge bulkhead queue:** converts a short provider outage into long customer waiting times.
3. **Fake fallback shipping price:** can cause undercharging, overcharging and checkout disputes.
4. **Unbounded retries:** creates a retry storm and hides root cause.
5. **One global breaker for all providers:** an outage in Carrier A may block healthy Carrier B.
6. **Counting all 4xx as failures:** bad user inputs may trip a dependency breaker unnecessarily.
7. **Treating per-pod limits as global limits:** replicas multiply concurrency.

## 9. Senior engineer interview Q&A

**Q: What is the difference between a circuit breaker and a bulkhead?**
A: A breaker decides whether a call should be attempted based on recent outcomes. A bulkhead bounds how many concurrent calls can consume a shared resource. They solve different failure modes.

**Q: Does a circuit breaker stop slow requests?**
A: No. It rejects calls after opening, but already-running calls need HTTP timeouts or other cancellation/deadline mechanisms.

**Q: How do you choose `maxConcurrentCalls`?**
A: Use provider quotas, measured latency distributions, target throughput and a concurrency budget, then validate under fault injection. Little's Law is a planning aid, not a replacement for load tests.

**Q: What is HALF_OPEN?**
A: A limited recovery probe state after OPEN. A small number of calls are permitted to determine whether the dependency can be trusted again.

**Q: Would you cache shipping quotes?**
A: Only if business rules and the carrier contract permit a bounded, clearly labeled estimate. Never treat an unverified cached estimate as the final payable shipping amount.

**Q: What changes when checkout runs in Kubernetes?**
A: Circuit breaker states and semaphore permits are normally local to each pod. Scale-aware budgets, connection pools and provider quotas must be considered across replicas.

## References

- Resilience4j Spring Boot 3 starter, annotations, circuit breaker and bulkhead configuration: https://resilience4j.readme.io/docs/getting-started-3
- Spring Cloud CircuitBreaker Resilience4j property configuration and time limiter semantics: https://docs.spring.io/spring-cloud-circuitbreaker/reference/3.3/spring-cloud-circuitbreaker-resilience4j/circuit-breaker-properties-configuration.html
- Resilience4j source and design: https://github.com/resilience4j/resilience4j

**Publication note:** This is a technically reviewed editorial draft. The example thresholds and simulator outcomes are conceptual. The code is illustrative and has not been compiled against a pinned dependency set in this run; compile and integration-test against the target repository before deployment.


