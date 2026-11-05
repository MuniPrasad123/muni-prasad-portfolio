# LinkedIn — publication-ready draft (insert final live URL only after deployment)

🔐 **VALID JWT ≠ AUTHORIZED ORDER**

Imagine this in a shopping application:

Alice logs in. Her access token is authentic and contains `orders:read`.

She changes the order ID in `/api/orders/{id}` to Bob's order.

The API checks the JWT signature and scope, then runs:

```sql
SELECT * FROM customer_orders WHERE id = :id;
```

**200 OK. Bob's order is exposed.**

This is Broken Object Level Authorization (BOLA), not a failed login mechanism.

A safer lookup includes **order ID + verified token subject + trusted tenant**. And the API must distinguish 401 (invalid authentication), 403 (missing permission), and a policy-driven 404 (unowned/missing record).

In my latest Architecture in Motion episode, I walk through the failure, the secure Spring Boot + PostgreSQL implementation, and an interactive decision simulator.

🔗 Read the article and try the lab: [INSERT VERIFIED LIVE ARTICLE URL]

#Java #SpringBoot #OAuth2 #JWT #APISecurity #SystemDesign #PostgreSQL #BackendEngineering

---

# DEV / Hashnode teaser

## A Valid JWT. Someone Else's Order. The Authorization Bug Behind a Data Leak

JWT verification is necessary, but it cannot prove record ownership. An `orders:read` scope authorizes a class of operations, not every order row. This article shows a realistic BOLA failure in an e-commerce order API, then fixes it with tenant-aware ownership predicates, explicit audience validation, minimal DTOs, and negative authorization tests. Includes runnable Spring Boot reference code, PostgreSQL schema, and a self-contained interactive simulator.

Read the full article: [INSERT VERIFIED LIVE ARTICLE URL]
