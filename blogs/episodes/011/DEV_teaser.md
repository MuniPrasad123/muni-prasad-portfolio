# Kafka Ordering Is Not a Business-State Guarantee

When `OrderShipped` arrives before `OrderPaid`, your fulfillment state must not simply follow arrival order. Learn stable partition keys, transactional outbox, aggregate versions, idempotent consumers, and reconciliation through an interactive lab. Episode 011 of Architecture in Motion.
