# LinkedIn / DEV teaser

🚨 **ONE PAYMENT. THREE CONFIRMATION EMAILS. TWO SHIPMENT REQUESTS.**

Maya paid once. Her bank showed one transaction. Why did our e-commerce system keep telling her the order was confirmed?

The payment provider didn't necessarily charge her again. It retried a **webhook notification** after our acknowledgment was lost. Our unsafe handler repeated downstream business actions.

The production-safe design has three layers:

1️⃣ **Inbox** — durable `(provider,event_id)` uniqueness blocks repeated delivery.
2️⃣ **Payment state guard** — a payment can transition to `SUCCEEDED` once.
3️⃣ **Transactional outbox** — commit one downstream intent with the state change, then deliver with consumer idempotency.

A successful HTTP 200 does not magically provide exactly-once external effects. Design for retries and prove your business invariants.

Full visual breakdown and interactive lab: https://www.muniprasad.in/blog/payment-webhook-idempotency-inbox-outbox

#Java #SpringBoot #PostgreSQL #Microservices #SystemDesign #Payments #SoftwareArchitecture #Idempotency #DistributedSystems
