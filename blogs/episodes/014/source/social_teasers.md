# LinkedIn
🚨 The Order Was Paid, But My Account Still Says Pending — CQRS & Eventual Consistency

Payment is confirmed, but My Orders still displays PENDING for several seconds or longer. Customers retry, contact support, or fear they were charged without an order.

Root cause: The payment write transaction succeeds, but a separate read-model projection lags or loses an event. A naive consumer can also overwrite a newer PAID status with an older PENDING event.

Design: Commit order state and outbox event in one database transaction, publish asynchronously, consume idempotently using monotonically increasing versions, and reconcile stale projections. Show pending synchronization rather than falsely claiming payment failed.

What would you monitor first?

#Java #SpringBoot #SystemDesign #Ecommerce #SoftwareArchitecture

# DEV teaser
The Order Was Paid, But My Account Still Says Pending — CQRS & Eventual Consistency: learn the customer symptom, reproduce the failure and inspect the code and simulator.
