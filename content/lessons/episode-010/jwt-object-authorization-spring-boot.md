---
title: "JWT and Object-Level Authorization in Spring Boot: Protecting Customer Orders"
slug: "jwt-object-authorization-spring-boot"
folder: "API security"
date: "2026-11-05"
description: "Alice signs in and opens Bob’s order by changing the order ID. Follow the leak, fix the lookup, and verify that each shopper can still see their own orders."
tags: ["Java", "Spring Boot", "System design", "E-commerce", "API security"]
cover: "/blog/episodes/010/cover.svg"
coverAlt: "JWT and Object-Level Authorization in Spring Boot: Protecting Customer Orders"
draft: false
sample: false
level: "Architecture in Motion · Episode 010"
lab: "/blog/episodes/010/lab.html"
video: "/blog/episodes/010/lesson.mp4"
videoPoster: "/blog/episodes/010/poster.png"
videoCaptions: "/blog/episodes/010/captions.vtt"
videoCaption: "Narrated walkthrough · Alice’s request, the leak, and the fix"
---

## The customer problem

Alice opens her own order, **A-101**. Then she changes the order ID in the URL to **B-102**, which belongs to Bob. The API accepts Alice’s valid sign-in token and looks up B-102 by ID alone. It returns Bob’s order details to Alice. Bob’s purchase history and any address fields in the response are now exposed.

This is **Broken Object Level Authorization (BOLA)**. The API checked who Alice was and whether she could read orders, then skipped the check that ties this specific order to Alice.

## The fix and how to verify it

1. **Verify the token and scope.** The API checks that the token is valid for this service and carries `orders:read`.
2. **Look up the order within the shopper’s account.** Use the requested order ID plus the owner and tenant from verified identity. The tenant is the store or organization the caller belongs to.
3. **Retry both requests.** Alice gets **404** and no order details for B-102 under this API’s concealment policy. Her own order A-101 still returns **200**. [Try the walkthrough](#interactive-lab).

## 1. Authentication, scopes, and object authorization are different decisions

| Layer | Question | Example result |
|---|---|---|
| Authentication | Is this a valid token from a trusted issuer? | Invalid signature → 401 |
| Token validation | Is it intended for this API and still valid? | Wrong `aud` / expired → 401 |
| Endpoint authorization | Does it carry `orders:read`? | Missing scope → 403 |
| Object authorization | Does this order belong to this authenticated customer and tenant? | No matching owned order → 404 |

**401 Unauthorized** means the request lacks acceptable authentication credentials. **403 Forbidden** means the caller is authenticated but lacks permission. For an order lookup, a consistent **404 Not Found** for missing *or unowned* records can reduce information disclosure about order existence. Choose a consistent API policy, do not claim 404 is universally required, and avoid leaking identifiers through timing, errors, or logs.

A JWT is typically a signed set of claims. It is **not encrypted by default**; never store passwords or card data in its payload. The API must verify the signature, accepted algorithm, trusted issuer (`iss`), intended audience (`aud`), and time claims (`exp`, `nbf`) using a trusted identity provider. Spring Security's resource server verifies many of these by default; **audience validation should be configured explicitly** for your API.

## 2. The failure path

The vulnerable path is `valid token → orders:read → lookup by order ID → return the matching row`. The lookup gives the API no reason to reject B-102.

## 3. Correct architecture: make ownership part of the lookup

The corrected path is `valid token → orders:read → lookup by order ID, owner, and tenant`. For B-102, the owner check eliminates the row before any order details are returned.

**Important:** The gateway is useful for edge policy and rate limiting, but the order service still enforces ownership. Do not trust a client-supplied `customerId`, `tenantId`, or a plain unsigned header as an identity source. For delegated staff access, create a separate explicit authorization policy, with purpose-limited roles, audited access, and tenant restrictions.

## 4. PostgreSQL: the secure predicate

For a self-contained demo, create the table below. In production, order IDs should be opaque, and indexes and retention policies should be designed for your workload.

```sql
CREATE TABLE customer_orders (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  customer_subject VARCHAR(128) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  status VARCHAR(32) NOT NULL
);

INSERT INTO customer_orders VALUES
 ('00000000-0000-0000-0000-000000000101','store-a','alice',129.00,'USD','SHIPPED'),
 ('00000000-0000-0000-0000-000000000102','store-a','bob',399.00,'USD','PROCESSING'),
 ('00000000-0000-0000-0000-000000000103','store-b','alice',89.00,'USD','DELIVERED');
```

**Wrong query** — checks only a user-controlled object ID:

```sql
SELECT id, status, total_amount
FROM customer_orders
WHERE id = :requested_order_id;
```

**Correct query** — scopes by trusted identity and tenant:

```sql
SELECT id, status, total_amount, currency
FROM customer_orders
WHERE id = :requested_order_id
  AND customer_subject = :authenticated_jwt_sub
  AND tenant_id = :trusted_tenant_id;
```

The database now returns **zero rows** if Alice asks for Bob's order. It also rejects Alice's similarly named identity in another tenant. A primary-key lookup by `id` is already selective; the extra predicates are essential for authorization, not necessarily for a faster plan. Do not claim that adding a composite index always improves this exact primary-key query. For listing a customer's orders, an index on `(tenant_id, customer_subject, id)` may help, subject to real `EXPLAIN (ANALYZE, BUFFERS)` measurements and data distribution.

## 5. Spring Boot 3.x / Java 21 implementation

**Dependencies:** `spring-boot-starter-web`, `spring-boot-starter-security`, `spring-boot-starter-oauth2-resource-server`, `spring-boot-starter-data-jpa`, `postgresql`, and `spring-boot-starter-test`. The companion source files contain a minimal example. The code uses an externally managed HTTPS identity provider and JWKS endpoint; it does not mint its own tokens.

### Security configuration: reject unknown endpoints, require scope, validate audience

```java
@Configuration
@EnableMethodSecurity
class SecurityConfig {
  @Bean
  SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http
      .csrf(AbstractHttpConfigurer::disable) // only for stateless bearer API; assess browser cookie flows separately
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(a -> a
        .requestMatchers(HttpMethod.GET, "/api/orders/**")
          .hasAuthority("SCOPE_orders:read")
        .anyRequest().denyAll())
      .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
      .build();
  }

  @Bean
  JwtDecoder jwtDecoder(@Value("${app.security.jwk-set-uri}") String jwks,
                        @Value("${app.security.issuer}") String issuer,
                        @Value("${app.security.audience}") String audience) {
    NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwks).build();
    OAuth2TokenValidator<Jwt> defaultChecks = JwtValidators.createDefaultWithIssuer(issuer);
    OAuth2TokenValidator<Jwt> aud = jwt -> jwt.getAudience().contains(audience)
      ? OAuth2TokenValidatorResult.success()
      : OAuth2TokenValidatorResult.failure(
          new OAuth2Error("invalid_token", "Wrong audience", null));
    decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(defaultChecks, aud));
    return decoder;
  }
}
```

Spring Security maps standard `scope`/`scp` values to authorities prefixed `SCOPE_`. `JwtValidators.createDefaultWithIssuer` applies the default timestamp checks and issuer validation. The example adds audience validation, which should match the registered resource API. Pin trusted JWKS/issuer endpoints; never construct JWKS URLs from untrusted request data. If the identity provider uses a nonstandard claim for scope, configure a `JwtAuthenticationConverter` explicitly.

### Controller: derive identity from verified claims, not the URL

```java
@GetMapping("/api/orders/{orderId}")
OrderView getOrder(@PathVariable UUID orderId, @AuthenticationPrincipal Jwt jwt) {
  String tenant = jwt.getClaimAsString("tenant_id");
  if (tenant == null || tenant.isBlank()) {
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tenant context missing");
  }
  return orderService.getOwnedOrder(orderId, jwt.getSubject(), tenant);
}
```

### Repository: enforce tenant + owner at the data boundary

```java
interface OrderRepository extends JpaRepository<CustomerOrder, UUID> {
  Optional<CustomerOrder> findByIdAndCustomerSubjectAndTenantId(
      UUID id, String customerSubject, String tenantId);
}

@Service
class OrderService {
  private final OrderRepository repository;
  OrderService(OrderRepository repository) { this.repository = repository; }

  @Transactional(readOnly = true)
  public OrderView getOwnedOrder(UUID id, String subject, String tenant) {
    return repository.findByIdAndCustomerSubjectAndTenantId(id, subject, tenant)
      .map(o -> new OrderView(o.getId(), o.getStatus(), o.getTotalAmount(), o.getCurrency()))
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
  }
}
```

The DTO returns only the fields the caller needs. Do not expose the JPA entity with internal fulfillment notes, payment tokens, or address fields by default. In a larger system, consider explicit domain authorization services, database row-level security as defense in depth, and audited support-agent delegation. A plain `@PreAuthorize("hasRole('CUSTOMER')")` alone is **not** sufficient to protect an individual order.

## 6. Failure modes and production trade-offs

| Failure | Root cause | Correct response |
|---|---|---|
| Expired or tampered token | Invalid credential | 401, no DB lookup |
| Valid token, wrong audience | Token intended for another service | 401; validate `aud` |
| Valid token, missing scope | Operation not permitted | 403 |
| Valid token, Bob's order | Ownership predicate missing | 404 or explicit policy-driven 403 |
| Same subject across two tenants | Missing tenant filter | Require tenant + subject |
| Admin bypass accidentally broad | Generic `ROLE_ADMIN` used everywhere | Separate audited support-access policy |
| Logs contain bearer token | Unsafe request logging | Redact Authorization headers and claims |
| Stale permission after role change | Long-lived JWT | Short access-token TTL and revocation/introspection strategy as needed |
| Browser uses cookies alongside bearer auth | Misapplied CSRF disable | Review cookie/session and CSRF threat model |

**Performance:** With a primary-key lookup, ownership checks usually add negligible application complexity but are security-critical. Measure DB work with real query plans; do not use fabricated speedup percentages. Caching must include tenant and subject in the authorization boundary or reauthorize on each retrieval. Never cache a raw order response globally by order ID without access controls.

**Observability:** Track 401/403/404 rates, denied access attempts, issuer/audience validation failures, and repeated cross-object probes. Log a correlation ID and hashed identifiers where appropriate—not tokens, PII, or full card details. Rate limiting is complementary; it does not repair BOLA.

## 7. Interactive experiment

In the [walkthrough](#interactive-lab), open Alice’s order, reproduce the leak with Bob’s order ID, and apply the ownership fix. Retry both orders to verify that the API protects Bob’s details and still serves Alice’s order. In the [advanced lab](/blog/episodes/010/lab.html), try **Wrong audience**, **Missing scope**, and **Wrong tenant** to see where each request stops.

## 8. Three practice exercises

**Beginner:** Alice has a valid token with `orders:read`. She requests Bob's order ID. What HTTP result should the secure order endpoint return under the demo's concealment policy? Explain why token validity is not sufficient.

**Intermediate:** Add `GET /api/orders` to return only the caller's orders, sorted by creation time, with keyset pagination. Write the repository query, indexes to consider, and an authorization test covering a cross-tenant user with the same `sub`.

**Advanced:** A support agent needs temporary access to a customer's order for a refund dispute. Design explicit delegated authorization with an audit trail, time-bounded approval, tenant restrictions, and a negative test preventing access after approval expires. Avoid turning every support token into a global bypass.

### Exercise answers (read after attempting)

1. **404** in this tutorial's consistent concealment policy. The token establishes Alice's identity and operation scope, not ownership of Bob's order.
2. Query `WHERE tenant_id = :tenant AND customer_subject = :sub AND (created_at,id) < (:cursorTime,:cursorId) ORDER BY created_at DESC,id DESC LIMIT :limit`; consider `(tenant_id, customer_subject, created_at DESC, id DESC)` and verify plans. Always derive tenant/sub from verified identity.
3. Store approval records keyed by agent, order, tenant, purpose and expiration; enforce them on each access, log every read, and revoke centrally. Add tests for wrong tenant, wrong order, expired approval and agent without permission.

## 9. Senior engineer interview questions

**Q: Is a signed JWT encrypted?** No. Standard JWS signatures provide integrity/authenticity, not payload confidentiality. Use TLS and minimize claims.

**Q: Does `hasAuthority("SCOPE_orders:read")` prevent BOLA?** No. It grants operation-level permission, not access to a particular order.

**Q: Why validate `aud`?** A token legitimately issued for service A must not be accepted by service B simply because its signature is valid.

**Q: Should the API return 403 or 404 for an unowned order?** Both can be defensible depending on the contract and disclosure policy. This tutorial uses 404 for both absent and unowned orders.

**Q: Can random UUIDs solve BOLA?** No. They make guessing harder, but leaked identifiers still require authorization checks.

**Q: What about database row-level security?** Useful defense in depth, especially for multi-tenant data. It requires correct trusted session context, connection-pool hygiene, tests, and careful bypass-role management; it does not replace API authorization.

## 10. The architectural takeaway

**Authentication answers “Who are you?” Authorization answers “Can you do this?” Object-level authorization answers “Can you do this to this specific record?”**

In a production commerce API, a valid token is only the beginning of the security decision. The order lookup must still be scoped to the authenticated customer and trusted tenant. That one missing predicate can be the difference between a routine checkout journey and a customer-data incident.

---

### Sources and further reading

- [OWASP API1:2023 — Broken Object Level Authorization](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/)
- [Spring Security — OAuth 2.0 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [Spring Security — Method Security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)
- [RFC 7519 — JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

**Editorial note:** All shopper names, order IDs, and HTTP scenarios are fictional. No production customer data or benchmark results are used. Java source is a reference implementation requiring environment-specific IdP, database, and integration testing before deployment.
