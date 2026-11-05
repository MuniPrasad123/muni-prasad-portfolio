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

## Add the next episode

1. Create content/lessons/episode-013/<slug>.md and public/blog/episodes/013/.
2. Copy the frontmatter from a recent episode. Name the concept in the title; explain the shopper problem, business impact, root cause, solution and trade-offs. Use the actual publication date.
3. Add lab: "/blog/episodes/013/lab.html" for a self-contained interactive lesson. Keep scripts local, preserve keyboard controls and reduced-motion support. Do not publish personal claims or simulated numbers as measured outcomes.
4. Add video/poster paths and captions when supplied. Do not add a written video transcript.
5. Keep publishing prompts and social copy in blogs/episodes/013/, outside the article.
6. Check the new lesson and run the production build. Completed episodes are published by default unless the owner requests a local draft. The index, RSS and sitemap discover nested article files automatically.
