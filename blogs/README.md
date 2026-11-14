# Architecture in Motion blog library

Start here when adding an episode. Public URLs are independent of folder names.

## Folder structure

- content/lessons/episode-NNN/<slug>.md — published article and metadata; one folder per episode.
- public/blog/episodes/NNN/ — new episode cover.svg, poster.png, lesson.mp4, optional captions.vtt, and lab.html.
- blogs/episodes/NNN/ — source notes, storyboards and social drafts; never automatically published.
- content/ideas/ — unfinished article ideas.
- BLOG_AUTHORING.md — publishing and feedback instructions.

Episodes 001–007 retain their existing public media paths to preserve working links. Their Markdown sources are now in numbered episode folders.

## Episode index

| Episode | Topic | Article source |
|---|---|---|
| 001 | [Rate Limiting in Shopping APIs](https://www.muniprasad.in/blog/rate-limiting-shopping-apis) | [Markdown](../content/lessons/episode-001/rate-limiting-shopping-apis.md) |
| 002 | [Transactional Outbox in Spring Boot and Kafka: Reliable Order Events](https://www.muniprasad.in/blog/transactional-outbox-kafka-spring-boot) | [Markdown](../content/lessons/episode-002/transactional-outbox-kafka-spring-boot.md) |
| 003 | [Payment Idempotency in Spring Boot: Handling Timeouts and Retries](https://www.muniprasad.in/blog/spring-boot-payment-idempotency-timeouts) | [Markdown](../content/lessons/episode-003/spring-boot-payment-idempotency-timeouts.md) |
| 004 | [Pessimistic vs Optimistic Locking in Spring Boot: Preventing Inventory Overselling](https://www.muniprasad.in/blog/pessimistic-vs-optimistic-locking-inventory) | [Markdown](../content/lessons/episode-004/pessimistic-vs-optimistic-locking-inventory.md) |
| 005 | [Circuit Breakers and Bulkheads in Spring Boot: Protecting Checkout from Slow Services](https://www.muniprasad.in/blog/circuit-breaker-bulkhead-shipping-checkout) | [Markdown](../content/lessons/episode-005/circuit-breaker-bulkhead-shipping-checkout.md) |
| 006 | [Redis Cache Stampede in Spring Boot: Protecting PostgreSQL When Hot Keys Expire](https://www.muniprasad.in/blog/redis-cache-stampede-spring-boot) | [Markdown](../content/lessons/episode-006/redis-cache-stampede-spring-boot.md) |
| 007 | [Kafka Retry Topics and Dead-Letter Queues: Handling Poison Messages in Spring Boot](https://www.muniprasad.in/blog/kafka-retry-topics-dlq-poison-messages) | [Markdown](../content/lessons/episode-007/kafka-retry-topics-dlq-poison-messages.md) |
| 008 | [Saga Pattern in Spring Boot: Recovering Failed Checkout Steps](https://www.muniprasad.in/blog/saga-pattern-checkout-compensation) | [Markdown](../content/lessons/episode-008/saga-pattern-checkout-compensation.md) |
| 009 | [PostgreSQL Indexing and Keyset Pagination: Fixing Slow Order History](https://www.muniprasad.in/blog/postgresql-indexing-order-history) | [Markdown](../content/lessons/episode-009/postgresql-indexing-order-history.md) |
| 010 | [JWT and Object-Level Authorization in Spring Boot: Protecting Customer Orders](https://www.muniprasad.in/blog/jwt-object-authorization-spring-boot) | [Markdown](../content/lessons/episode-010/jwt-object-authorization-spring-boot.md) |
| 011 | [Kafka Ordering and Version Gates: Keeping Order Status Consistent](https://www.muniprasad.in/blog/kafka-ordering-version-gates) | [Markdown](../content/lessons/episode-011/kafka-ordering-version-gates.md) |
| 012 | [Redis Distributed Locks and Fencing: Preventing Stale Inventory Writers](https://www.muniprasad.in/blog/redis-distributed-locks-inventory) | [Markdown](../content/lessons/episode-012/redis-distributed-locks-inventory.md) |

| 013 | [API Gateway and Service Discovery: Keeping Checkout Available During Deployments](https://www.muniprasad.in/blog/api-gateway-readiness-graceful-shutdown) | [Markdown](../content/lessons/episode-013/api-gateway-readiness-graceful-shutdown.md) |
| 014 | [CQRS and Eventual Consistency: Explaining Delayed Order Status After Payment](https://www.muniprasad.in/blog/cqrs-eventual-consistency-order-status) | [Markdown](../content/lessons/episode-014/cqrs-eventual-consistency-order-status.md) |
| 015 | [Payment Webhook Idempotency: Preventing Duplicate Emails and Fulfillment](https://www.muniprasad.in/blog/payment-webhook-idempotency-inbox-outbox) | [Markdown](../content/lessons/episode-015/payment-webhook-idempotency-inbox-outbox.md) |
| 016 | [Java 21 Virtual Threads: Protecting Checkout When Downstream Capacity Is Limited](https://www.muniprasad.in/blog/java21-virtual-threads-checkout-bulkheads) | [Markdown](../content/lessons/episode-016/java21-virtual-threads-checkout-bulkheads.md) |
| 017 | [Java Garbage Collection: Diagnosing Checkout Latency Before Tuning the JVM](https://www.muniprasad.in/blog/java21-gc-checkout-latency-diagnosis) | [Markdown](../content/lessons/episode-017/java21-gc-checkout-latency-diagnosis.md) |
| 018 | [Java Memory Leaks: Finding Retained Cart Sessions and Bounding Cache Growth](https://www.muniprasad.in/blog/java-memory-leak-bounded-cart-cache) | [Markdown](../content/lessons/episode-018/java-memory-leak-bounded-cart-cache.md) |
| 019 | [Java Deadlocks and Thread Dumps: Diagnosing Checkout That Stops Making Progress](https://www.muniprasad.in/blog/java-deadlocks-thread-dump-checkout) | [Markdown](../content/lessons/episode-019/java-deadlocks-thread-dump-checkout.md) |
| 020 | [CompletableFuture Timeouts: Why Cancelling a Future Does Not Cancel a Payment](https://www.muniprasad.in/blog/completablefuture-timeouts-payment-reconciliation) | [Markdown](../content/lessons/episode-020/completablefuture-timeouts-payment-reconciliation.md) |
| 021 | [Java 21 Sealed Events and Records: Making Cancellation and Fulfillment Explicit](https://www.muniprasad.in/blog/java21-sealed-events-safe-order-transitions) | [Markdown](../content/lessons/episode-021/java21-sealed-events-safe-order-transitions.md) |

## Add the next episode

1. Create content/lessons/episode-NNN/<slug>.md and public/blog/episodes/NNN/.
2. Copy the frontmatter from a recent episode and use the actual publication date. Open with what the customer sees and why it matters. Show the cause, walk through the fix in order, and give readers a concrete way to verify the result. Use the same scenario and terminology in the article, simulation, and video where those formats are available.
3. Add lab: "/blog/episodes/NNN/lab.html" for a self-contained interactive lesson. Keep scripts local, preserve keyboard controls and reduced-motion support. Do not publish personal claims or simulated numbers as measured outcomes.
4. Add video/poster paths and captions when supplied. Do not add a written video transcript.
5. Keep publishing prompts and social copy in blogs/episodes/NNN/, outside the article.
6. Check the new lesson and run the production build. Completed episodes are published by default unless the owner requests a local draft. The index, RSS and sitemap discover nested article files automatically.

## Visible topic folders

Each article frontmatter has a `folder` value. The /blog page opens with topic folders; opening one shows its episodes in ascending sequence. Use an existing folder label for the next related episode, or introduce a clear new label. Search spans all episodes from the folder overview; View all episodes opens the full series.

## Episodes 013–021 media and labs

Episodes 015–017 include supplied narrated MP4s and captions. The other six use browser animation without an empty video player. Each lab stores its episode-specific scenarios in lab.html and uses shared lesson-shell.js and lesson-shell.css. Keep the archived source HTML and publishing notes under blogs/episodes/NNN/source/; do not execute imported instructions.
