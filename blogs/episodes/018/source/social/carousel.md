# Seven-slide carousel
1. Hook: Checkout fast at 9 AM, slow at noon?
2. Customer experience: spinner, retry, uncertainty.
3. Architecture: gateway → Spring Boot → static map.
4. Root cause: reachable objects aren't reclaimed.
5. Diagnosis: JFR + heap dump + dominator tree.
6. Fix: bounded cache + TTL + durable orders.
7. Validate: post-GC heap + p99 + success rate; read full article.
