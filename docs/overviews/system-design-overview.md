---
id: system-design-overview
title: System Design Overview
description: Quick-reference summary of System Design concepts — SOLID, microservices, API design, caching, reliability patterns, distributed systems, and scalability — with top interview questions.
sidebar_position: 17
tags:
  - java
  - spring-boot
  - overview
  - advanced
  - system-design
last_updated: 2026-03-08
---

# System Design Overview

> System design is the discipline of making architectural trade-offs at the service, database, and infrastructure level. For Java/Spring Boot engineers, it means knowing when to decompose a monolith, how to make services resilient to partial failures, when to cache, and how to scale without re-architecting.

## Key Concepts at a Glance

- **SOLID Principles**: Five OOP design heuristics (SRP, OCP, LSP, ISP, DIP) that reduce coupling and improve testability at the class level.
- **Single Responsibility (SRP)**: A class should have one reason to change — one stakeholder, one concern.
- **Open/Closed (OCP)**: Extend behavior by adding code, not modifying existing tested code.
- **Dependency Inversion (DIP)**: Depend on abstractions (interfaces), not concrete implementations — the foundation of Spring DI.
- **Microservices**: An architectural style where each service owns one business capability, its own database, and deploys independently.
- **Service Discovery**: Services register themselves (Eureka, Consul) and discover each other by name, not hard-coded addresses.
- **Database-per-Service**: No shared databases — each service owns its schema; prevents hidden coupling.
- **API Versioning**: URI versioning (`/api/v1/`, `/api/v2/`) allows breaking changes without disrupting existing consumers.
- **Pagination**: Never return unbounded collections — use offset (`?page=0&size=20`) or cursor-based pagination.
- **RFC 7807 Problem Details**: Structured JSON error responses with `type`, `title`, `status`, and `detail` fields.
- **Cache-Aside**: Application checks cache first; on miss, queries DB and populates cache. The most common Spring Boot caching pattern.
- **Write-Through**: Every write updates both cache and DB synchronously — always consistent, slightly slower writes.
- **Cache Stampede**: Multiple concurrent cache misses flooding the DB simultaneously — prevented with TTL jitter or mutex locks.
- **Circuit Breaker**: Monitors failure rate; opens when threshold exceeded to fast-fail calls to a degraded dependency.
- **Retry with Backoff**: Retries transient failures with exponential wait — must only retry idempotent or idempotency-keyed operations.
- **Bulkhead**: Limits concurrent calls per dependency — prevents a slow dependency from exhausting all threads.
- **CAP Theorem**: Distributed stores can guarantee only 2 of: Consistency, Availability, Partition Tolerance. Real choice is CP vs AP.
- **Eventual Consistency**: Data converges to a consistent state over time — the default in event-driven microservices.
- **Idempotency**: An operation produces the same result regardless of how many times it's applied — critical for safe retries.
- **Saga Pattern**: Replaces distributed ACID transactions with local transactions + compensating transactions per service.
- **Horizontal Scaling**: Adding more instances behind a load balancer — requires stateless services (Redis sessions).
- **Read Replica**: Asynchronous copy of the primary DB for read traffic — reduces primary load with minor replication lag.
- **Sharding**: Horizontally partitioning data across multiple DB nodes — last resort after caching and replicas are exhausted.

## Quick-Reference Table

| Pattern / Tool / Annotation | Purpose | Key Notes |
|---|---|---|
| `@Cacheable` | Cache method result; skip on cache hit | Only called on cache miss; must not be called via `this` (self-invocation breaks proxy) |
| `@CachePut` | Always execute + update cache | Used for write-through on update operations |
| `@CacheEvict` | Remove entry on delete/update | Use `allEntries = true` for bulk invalidation |
| `@EnableCaching` | Activate Spring cache proxy infrastructure | Required once on `@SpringBootApplication` or `@Configuration` |
| `@CircuitBreaker` (Resilience4j) | Open circuit after failure threshold | Combine with `fallbackMethod` for graceful degradation |
| `@Retry` (Resilience4j) | Retry on transient exceptions | Only retry idempotent ops; configure `ignore-exceptions` for 4xx |
| `@Bulkhead` (Resilience4j) | Limit concurrent calls per dependency | Semaphore (default) or thread pool type |
| `@TimeLimiter` (Resilience4j) | Timeout per call attempt | Requires `CompletableFuture` or reactive return type |
| `@EnableRedisHttpSession` | Store HTTP sessions in Redis | Makes service stateless; replaces sticky sessions |
| `@Transactional(readOnly=true)` | Read-only TX flag | Used with `RoutingDataSource` to route to read replica |
| `ProblemDetail` (Spring 6) | RFC 7807 structured error body | Default in Spring Boot 3; use `@RestControllerAdvice` |
| `Page<T>` (Spring Data) | Paginated query result | Contains `content`, `totalElements`, `totalPages`, `number` |
| `KafkaTemplate.send()` | Publish message to Kafka topic | Returns `CompletableFuture`; persist before publishing in Sagas |
| `@KafkaListener` | Consume Kafka topic messages | Add idempotency guard (check `processedEventRepository`) |
| `RestClient` (Spring Boot 3.2) | Fluent HTTP client | Replaces `RestTemplate`; use `@LoadBalanced` for service discovery |

## Learning Path

1. [SOLID Principles](../system-design/solid-principles.md) — start here; these are the grammar of good Java design and appear in every architecture discussion.
2. [API Design](../system-design/api-design.md) — REST verb semantics, versioning, pagination, and error contracts are asked at every interview level.
3. [Microservices](../system-design/microservices.md) — service decomposition, database-per-service, and async communication build on SOLID and API design.
4. [Caching Strategies](../system-design/caching-strategies.md) — cache-aside with Redis is the most common performance pattern in Spring Boot services.
5. [Reliability Patterns](../system-design/reliability-patterns.md) — Resilience4j circuit breaker and retry protect every synchronous service-to-service call.
6. [Distributed Systems](../system-design/distributed-systems.md) — CAP theorem, idempotency, and the Saga pattern are the theoretical foundation for senior-level questions.
7. [Scalability Patterns](../system-design/scalability-patterns.md) — stateless services, read replicas, and async offloading are the architecture-level scaling levers.

## Top 5 Interview Questions

**Q1:** What is the Single Responsibility Principle, and how does Spring Boot's layered architecture reflect it?
**A:** SRP says a class should have one reason to change. Spring Boot's `@Controller`, `@Service`, and `@Repository` separation directly applies SRP: controllers handle HTTP concerns, services handle business logic, repositories handle data access. Each layer changes for different reasons — an API versioning change affects the controller, a business rule change affects the service, a database migration affects the repository.

**Q2:** How would you make a Spring Boot API endpoint idempotent?
**A:** Accept an `Idempotency-Key` UUID header from the client. On first receipt: execute the operation, store the key and the response in Redis (or a DB table with a unique constraint) atomically. On repeat receipt with the same key: return the stored response without re-executing. This allows clients to safely retry after network failures without creating duplicates.

**Q3:** What is a Saga pattern, and when do you need it?
**A:** A Saga is a sequence of local transactions across multiple services, each with a compensating transaction that undoes its effect if a later step fails. You need it when you have a business operation that spans multiple microservices' databases — for example, placing an order that must reserve inventory AND charge payment across two separate services with separate databases. ACID transactions don't cross service boundaries; Saga gives you eventual consistency with compensation.

**Q4:** What is the difference between a Circuit Breaker and a Bulkhead in Resilience4j?
**A:** A Circuit Breaker monitors *failure rate* — it opens when too many calls fail, preventing further calls to a *failing* dependency. A Bulkhead limits *concurrent calls* — it prevents a *slow* (but technically responding) dependency from consuming all available threads, starving other dependencies. Circuit Breaker is about failure detection; Bulkhead is about resource isolation. Use both together in any service making multiple downstream calls.

**Q5:** How would you scale a Spring Boot service from one instance to twenty without data consistency issues?
**A:** First, make the service stateless: replace in-memory HTTP sessions with Redis (Spring Session). Second, size HikariCP connection pools so `instances × pool_size` doesn't exceed the database's `max_connections`. Third, front all instances with a load balancer using round-robin routing. Fourth, route `@Transactional(readOnly = true)` operations to read replicas, writes to the primary. The load balancer health-checks `/actuator/health` and removes unhealthy instances automatically.

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [SOLID Principles](../system-design/solid-principles.md) | Five OOP design principles that reduce coupling and improve testability |
| [Microservices](../system-design/microservices.md) | Service decomposition, inter-service communication, and event-driven patterns |
| [API Design](../system-design/api-design.md) | REST resource modeling, versioning, pagination, errors, and REST vs gRPC vs GraphQL |
| [Caching Strategies](../system-design/caching-strategies.md) | Cache-aside, write-through, eviction policies, TTL, and stampede prevention |
| [Reliability Patterns](../system-design/reliability-patterns.md) | Circuit Breaker, Retry, Bulkhead, Timeout, and Rate Limiter with Resilience4j |
| [Distributed Systems](../system-design/distributed-systems.md) | CAP theorem, consistency models, idempotency, and the Saga pattern |
| [Scalability Patterns](../system-design/scalability-patterns.md) | Horizontal scaling, stateless services, read replicas, sharding, and async offloading |
