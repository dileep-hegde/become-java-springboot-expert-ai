---
id: system-design-index
title: System Design
description: High-level architecture, microservices, distributed systems, SOLID principles.
sidebar_position: 1
tags:
  - java
  - spring-boot
  - overview
last_updated: 2026-03-07
---

# System Design

> System design interviews test your ability to trade off between correctness, performance, scalability, and maintainability at the architecture level. For senior Java/Spring Boot engineers, this means understanding microservices trade-offs, database selection, caching strategies, API design, and reliability patterns (circuit breaker, retry, bulkhead, rate limiting).

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| SOLID Principles | Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion. |
| Microservices | Service decomposition, inter-service communication (REST vs. messaging), eventual consistency. |
| API Design | REST vs. gRPC vs. GraphQL; versioning; pagination; rate limiting. |
| Caching Strategies | Cache-aside, write-through, write-behind; eviction policies; cache stampede. |
| Reliability Patterns | Circuit Breaker (Resilience4j), Retry, Bulkhead, Timeout, Rate Limiter. |
| Distributed Systems | CAP theorem, consistency models, idempotency, distributed transactions (Saga pattern). |
| Scalability Patterns | Horizontal vs. vertical scaling, stateless services, read replicas, sharding. |

## Learning Path

1. **SOLID Principles** — these are the “grammar” of good OOP design; expected at every level.
2. **Caching Strategies** — cache-aside with Redis is the most common pattern; understand eviction and consistency trade-offs.
3. **Reliability Patterns** — Circuit Breaker and Retry with Resilience4j appear in almost every microservices setup.
4. **Microservices** — service decomposition trade-offs and inter-service communication choices are standard interview questions.
5. **Distributed Systems** — CAP theorem, eventual consistency, and Saga are senior-level topics.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — most distributed system patterns have Spring Boot implementation examples.
- [Messaging](../messaging/index.md) — Saga and event-driven architectures rely on Kafka or RabbitMQ.
- [Databases](../databases/index.md) — database selection, sharding, and replication are system design concerns.
