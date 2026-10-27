---
title: "Rate Limiting in Shopping APIs"
description: "When bots flood checkout APIs, real shoppers can face slow pages and failed orders. Learn how rate limiting reduces overload, then try the rules yourself."
slug: "rate-limiting-shopping-apis"
date: "2026-10-26"
updated: "2026-10-27"
tags: ["Java", "Microservices", "System design", "E-commerce"]
cover: "/blog/rate-limiting/cover.svg"
coverAlt: "Eight shopping requests reach a gateway: five are accepted and three are rate limited."
draft: false
sample: true
level: "Foundations to production trade-offs"
simulation: "rate-limiting"
video: "/blog/rate-limiting/reference-animation.mp4"
videoPoster: "/blog/rate-limiting/video-poster.jpg"
videoCaption: "14-second supplied animation · Silent (no audio track)"
---

> **Sample technical article.** This is an educational scenario, not an employer incident, personal project result, or performance benchmark. Read the core idea in a few minutes, then explore the lab and implementation notes.

## The real-world problem: bot traffic disrupts checkout

Imagine an online store during a sale. A bot repeatedly calls the checkout API while genuine customers try to place orders. An overly aggressive client retry loop can create similar traffic without malicious intent.

Every request may consume application threads, database connections, or downstream calls. If incoming work exceeds available capacity, requests queue up and time out; severe resource exhaustion can make the service unavailable. Customers see a spinning checkout, errors, or an uncertain order status. Some retry, adding even more work.

**The problem is shared capacity:** one noisy caller can consume resources that other customers also need. Adding servers alone does not establish fair access or remove downstream bottlenecks.

## How we reduce the overload

Place an admission check at the gateway or API boundary, before expensive checkout processing. Set an appropriate allowance per trusted caller and operation. Requests within that allowance proceed; excess requests receive **429 Too Many Requests**, with retry guidance where available.

| Without an admission limit | With an appropriately chosen limit |
| --- | --- |
| A noisy caller can repeatedly reach expensive checkout work | Excess requests from that caller are rejected earlier |
| Genuine customers compete with avoidable work | Less avoidable work reaches shared dependencies |
| Clients may retry immediately after errors | Cooperative clients can respect Retry-After and back off |

This reduces one source of overload; it does not guarantee that every genuine customer gets through. A limiter counts requests, not intent: a bot can stay under its allowance, while a real user can exceed theirs. Distributed attacks need additional edge protection and bot controls. Service-wide capacity limits, bounded concurrency, timeouts, and monitoring address risks a per-caller limit cannot cover.

## Try a small version of the problem

The lab represents **one caller sending eight requests**, not eight separate shoppers. With an illustrative allowance of five, five requests proceed and three receive 429. Those three do not reach the simulated checkout service. Five per ten seconds is a teaching setting, not a recommended production threshold.

A rate limiter is like a doorman with an admission rule. It decides whether a request may proceed **now**. It does not reserve stock, make payments safe to retry, or guarantee payment success. The lab labels admitted requests 200 for clarity; real admitted requests can still return application errors.

[Try the interactive lab](#interactive-lab): send a burst, send another immediately, then advance time. Compare the fixed window's reset with the token bucket's gradual refill. The lab demonstrates admission rules, not measured server load or bot detection.

## Fixed windows and token buckets

A fixed window counts requests in aligned intervals: [0, 10), [10, 20), and so on. Each window starts with five available places. At t=5, the first window has not reset. At t=10, a new window begins.

A token bucket starts with five tokens, earns 0.5 tokens per second, and cannot hold more than five. Each accepted request costs one token. After spending all five tokens, waiting five seconds restores 2.5 tokens: two requests can proceed, leaving half a token.

| Decision | Fixed window | Token bucket |
| --- | --- | --- |
| Replenishment | Full reset at aligned boundaries | Continuous refill up to capacity |
| Short burst | Up to five per window | Up to available whole tokens |
| Boundary behavior | Five just before and five just after a boundary can pass | No aligned reset |
| State | Counter and window identifier | Tokens and last refill time |

This is a per-caller example. A production service may need separate limits per account, operation, merchant, and system-wide capacity.

## What does Retry-After mean?

RFC 6585 defines 429 and permits a Retry-After header. RFC 9110 allows that value to be an HTTP date or a delay in seconds. It is guidance to the client, not a reservation of future capacity.

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 10
Content-Type: application/json

{"error":"rate_limit_exceeded","message":"Please wait before retrying."}
```

At t=0 after the first burst, the fixed-window model waits ten seconds. The empty bucket needs two seconds to earn one token. The simulator rounds up to whole seconds. Another caller or request can consume new capacity before a retry arrives.

For checkout, combine respectful retry behavior with request deduplication and payment idempotency. Do not blindly retry a payment when its outcome is unknown.

## Java model: keep the boundary explicit

**Java 17+; single-process teaching model.** This complete class models one trusted caller with virtual time in milliseconds. Synchronization makes an individual check/update atomic only within this one object. It is not a production distributed rate limiter.

```java
public final class FixedWindowLimiter {
    private long window = -1;
    private long lastNow = -1;
    private int used;

    public synchronized boolean allow(long nowMillis) {
        if (nowMillis < 0 || nowMillis < lastNow) {
            throw new IllegalArgumentException("Time must not go backwards");
        }
        lastNow = nowMillis;
        long current = nowMillis / 10_000;
        if (current != window) {
            window = current;
            used = 0;
        }
        if (used >= 5) return false;
        used++;
        return true;
    }

    public static void main(String[] args) {
        FixedWindowLimiter limiter = new FixedWindowLimiter();
        for (int i = 0; i < 8; i++) {
            System.out.println(limiter.allow(0) ? "allowed" : "limited");
        }
    }
}
```

The example deliberately uses Java 8-compatible language features too; no alternative syntax is necessary. Run it with `javac FixedWindowLimiter.java` followed by `java FixedWindowLimiter`. Expect five `allowed` lines and three `limited` lines. Its clock is an input to make boundary tests reproducible.

### Spring Boot boundary

A Spring Boot application should map a limiter decision to an HTTP response at a filter, interceptor, or gateway boundary. The following is **integration pseudocode**, not a ready-to-deploy filter. The real implementation must resolve identity, call the limiter atomically, and handle timeouts.

```text
identity = resolveTrustedCaller(authenticatedPrincipal)
decision = limiter.tryAcquire(identity, operation)
if decision.denied:
    respond 429 with Retry-After and a safe error body
else:
    continue the request chain
```

Do not build a per-user map without a bound or expiration strategy. Anonymous requests and proxy headers need an explicit trust policy; a client-provided identity header is not proof of identity.

## Production trade-offs

### Correctness versus simplicity

An in-memory counter gives each application instance its own allowance. Three instances can admit more than a shared policy intends. A distributed limiter needs a shared decision point or an explicitly partitioned budget.

With Redis, the read/check/update and expiration must be atomic. A short Lua script can perform these operations together; a separate GET followed by SET is vulnerable to concurrent callers. Align key expiration with the algorithm and test retries, clock boundaries, and script failures. Atomic execution does not remove replication or failover considerations.

### Availability versus protection

If Redis is unavailable, blindly failing closed can interrupt every checkout. Failing open can overload the dependency you wanted to protect. Choose a documented policy per operation, such as a bounded local fallback for a low-risk read, with timeouts, alerts, and explicit limits. Payment or abuse-sensitive endpoints may require different behavior.

### Fairness versus identification cost

An IP-only rule can penalize people sharing a NAT and can be evaded by distributed clients. Authenticated account and operation limits are often more useful, but require bounded identity storage and protection against account rotation. Avoid raw customer identifiers in metrics labels.

Track allowed and denied decisions, limiter latency, store failures, and fallback activation. Rate-limit rejection should be distinguishable from a payment decline or service error. Load tests must include concurrent instances and boundary bursts, not only a single sequential loop.

## How to verify the fix helps real customers

Test normal customer traffic alongside an excessive caller in a controlled environment. Compare checkout latency and timeouts, dependency utilization, and rejections by policy. Check that one caller exhausting an allowance does not consume another caller's separate allowance. Also test multiple application instances, bursts at window boundaries, and limiter-store failures.

Choose limits from representative traffic and capacity measurements. Watch for false positives, such as legitimate customers behind a shared IP, and adjust the policy. The intended outcome is less avoidable load and a more dependable customer journey; this article does not claim measured improvements.

## Three takeaways

1. Excessive traffic can exhaust shared resources and disrupt genuine customers. Reject avoidable work before expensive processing.
2. Fixed windows reset at boundaries. Token buckets refill continuously and retain only a bounded burst allowance.
3. Shared state, atomic decisions, trusted identity, and an outage policy matter more than the counter alone.

## References

- [RFC 6585, section 4: 429 Too Many Requests](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)
- [RFC 9110, section 10.2.3: Retry-After](https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.3)
- [Redis: atomic execution of Lua scripts](https://redis.io/docs/latest/develop/programmability/eval-intro/)
- [Spring Cloud Gateway: RequestRateLimiter filter](https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webflux/gatewayfilter-factories/requestratelimiter-factory.html)

- [OWASP API Security: unrestricted resource consumption](https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/)
