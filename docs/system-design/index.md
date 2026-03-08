---
id: system-design-index
title: System Design
description: High-level architecture, microservices, distributed systems, SOLID principles, caching, reliability patterns, API design, and scalability for Java/Spring Boot engineers.
sidebar_position: 1
tags:
  - java
  - spring-boot
  - overview
last_updated: 2026-03-08
---

# System Design

> System design interviews test your ability to trade off between correctness, performance, scalability, and maintainability at the architecture level. For senior Java/Spring Boot engineers, this means understanding microservices trade-offs, database selection, caching strategies, API design, and reliability patterns (circuit breaker, retry, bulkhead, rate limiting).

## What You'll Find Here

| Note | Description |
|-------|-------------|
| [SOLID Principles](./solid-principles.md) | Five OOP design principles — SRP, OCP, LSP, ISP, DIP — that reduce coupling and improve testability. |
| [Microservices](./microservices.md) | Service decomposition, database-per-service, service discovery, and async communication patterns. |
| [API Design](./api-design.md) | REST resource modeling, versioning, pagination, structured error responses, REST vs gRPC vs GraphQL. |
| [Caching Strategies](./caching-strategies.md) | Cache-aside, write-through, write-behind; eviction policies; TTL design; cache stampede prevention. |
| [Reliability Patterns](./reliability-patterns.md) | Circuit Breaker, Retry, Bulkhead, Timeout, and Rate Limiter with Resilience4j in Spring Boot. |
| [Distributed Systems](./distributed-systems.md) | CAP theorem, consistency models, idempotency, and distributed transactions via the Saga pattern. |
| [Scalability Patterns](./scalability-patterns.md) | Horizontal vs vertical scaling, stateless services, read replicas, sharding, async offloading. |

## Learning Path

A suggested reading order for a returning Java developer preparing for senior backend interviews:

1. [SOLID Principles](./solid-principles.md) — the "grammar" of good OOP design; expected at every level of interview.
2. [API Design](./api-design.md) — REST semantics, versioning, and error contracts are foundational before discussing services.
3. [Caching Strategies](./caching-strategies.md) — cache-aside with Redis is the most common pattern; understand eviction and consistency trade-offs.
4. [Reliability Patterns](./reliability-patterns.md) — Circuit Breaker and Retry with Resilience4j appear in almost every microservices setup.
5. [Microservices](./microservices.md) — service decomposition trade-offs and inter-service communication choices are standard senior questions.
6. [Distributed Systems](./distributed-systems.md) — CAP theorem, eventual consistency, and Saga are advanced topics; build on the microservices foundation.
7. [Scalability Patterns](./scalability-patterns.md) — horizontal scaling, stateless session, and read replicas complete the picture for large-scale system design.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — most distributed system patterns have Spring Boot implementation examples.
- [Messaging](../messaging/index.md) — Saga and event-driven architectures rely on Kafka or RabbitMQ.
- [Databases](../databases/index.md) — database selection, sharding, and replication are system design concerns.

## Demos

Hands-on, runnable demos for common System Design scenarios:

| Demo | What It Shows |
|------|---------------|
| [SOLID Principles — Practical Demo](./demo/solid-principles-demo.md) | SRP, OCP, LSP, ISP, and DIP applied to a notification system with refactors and Spring wiring. |
| [Microservices — Practical Demo](./demo/microservices-demo.md) | E‑commerce order flow: Kafka events, persist-before-publish, idempotent consumers, and compensation handling. |
| [API Design — Practical Demo](./demo/api-design-demo.md) | Versioned APIs, cursor pagination examples, OpenAPI integration, and RFC 7807 error handling. |
| [Caching Strategies — Practical Demo](./demo/caching-strategies-demo.md) | Cache-aside vs write-through examples, TTL jitter, mutex protection, and common pitfalls. |
| [Reliability Patterns — Practical Demo](./demo/reliability-patterns-demo.md) | Resilience4j: circuit breaker, retry, bulkhead, timeouts, and testing patterns. |
| [Distributed Systems — Practical Demo](./demo/distributed-systems-demo.md) | Choreography-based Saga, idempotency keys, compensating transactions, and event design. |
| [Scalability Patterns — Practical Demo](./demo/scalability-patterns-demo.md) | Redis session migration, HikariCP tuning, read-replica routing, and async offloading with metrics. |


## Helpful Links

- [Domain Overview](../overviews/system-design-overview.md)
- [Interview Prep](../interview-prep/system-design-interview-prep.md)
