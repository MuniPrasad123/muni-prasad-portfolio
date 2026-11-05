# Episode 008 — LinkedIn and DEV Teasers

## LinkedIn post

**💳 Payment succeeded. 📦 Inventory failed. Who gives the money back?**

A checkout request can cross several independently committed systems. One Spring `@Transactional` annotation cannot roll back a payment provider.

In Episode 008 of **Architecture in Motion**, I explain how a **Saga orchestrator** recovers from partial failures:

- Authorization vs capture: why **void** and **refund** are not interchangeable.
- Durable Saga state, transactional outbox and idempotent event consumers.
- Why a payment timeout means **unknown**, not **failed**.
- How to keep customer order status honest while compensation is pending.

The article includes a Java 21 state machine, Spring Boot/PostgreSQL code, an animated lesson and an interactive failure simulator.

🔗 [Insert published episode URL after deployment]

#Java #SpringBoot #Microservices #SystemDesign #Kafka #DistributedSystems #SoftwareArchitecture

## DEV / Hashnode teaser

**Title:** Payment Succeeded, Inventory Failed: A Practical Saga Pattern for E-Commerce

**Excerpt:** A database rollback cannot reverse a payment that already happened elsewhere. This walkthrough builds an order Saga with durable orchestration, void/refund compensation, idempotent event handling, and reconciliation for unknown payment outcomes. Try the interactive simulator and inspect the Java 21 and PostgreSQL examples.

**Tags:** java, microservices, architecture, kafka
