# LinkedIn
🚨 The Checkout Routing Failure — API Gateway, Load Balancing & Service Discovery

During a flash-sale deployment, customers see intermittent 502/503 errors and a checkout spinner; retries can submit an order twice.

Root cause: The gateway forwards requests to a terminating checkout pod because service discovery still contains its endpoint, or readiness is declared before the application can serve traffic.

Design: Use readiness probes, preStop drain, graceful shutdown, bounded gateway retries only for safe operations, and durable idempotency keys for order placement. Propagate trace IDs and measure 502/503 rates.

What would you monitor first?

#Java #SpringBoot #SystemDesign #Ecommerce #SoftwareArchitecture

# DEV teaser
The Checkout Routing Failure — API Gateway, Load Balancing & Service Discovery: learn the customer symptom, reproduce the failure and inspect the code and simulator.
