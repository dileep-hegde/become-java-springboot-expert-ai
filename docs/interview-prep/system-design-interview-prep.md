---
id: system-design-interview-prep
title: System Design Interview Questions
description: Consolidated interview Q&A for System Design — covering SOLID principles, microservices, API design, caching, reliability patterns, distributed systems, and scalability.
sidebar_position: 18
tags:
  - interview-prep
  - java
  - spring-boot
  - system-design
  - microservices
last_updated: 2026-03-08
---

# System Design Interview Questions

> Consolidated Q&A for System Design. Covers SOLID principles, microservices, API design, caching, reliability patterns, distributed systems, and scalability — use for rapid revision before backend interviews.

## How to Use This Page
- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles (3–5 YOE)
- **Advanced** questions signal senior-level depth (5+ YOE) and system design rounds

---

## Beginner

### Q: What does SOLID stand for, and why does it matter?

**A:** SOLID is five design principles: **S**ingle Responsibility (one reason to change), **O**pen/Closed (extend without modifying), **L**iskov Substitution (subtypes must be substitutable for base types), **I**nterface Segregation (no fat interfaces), and **D**ependency Inversion (depend on abstractions). They matter because following them reduces coupling, makes code easier to test, and lets you add features without fear of breaking existing behavior.

---

### Q: What is a microservice?

**A:** A microservice is a small, independently deployable service that focuses on a single business capability, owns its own database, and communicates with other services via APIs or messaging. It deploys, scales, and fails independently from other services.

---

### Q: What is the difference between horizontal and vertical scaling?

**A:** Vertical scaling adds more resources (CPU, RAM) to a single machine — it has a hardware ceiling and a single point of failure. Horizontal scaling adds more instances of the service behind a load balancer — it scales with virtually no ceiling but requires stateless services.

---

### Q: What is caching used for?

**A:** Caching stores a copy of expensive data (database query results, computed values) in a faster store (Redis, memory) so repeat requests skip the expensive operation. It reduces latency, reduces database load, and improves throughput for read-heavy workloads.

---

### Q: What is a Circuit Breaker?

**A:** A Circuit Breaker monitors calls to a downstream service. When the failure rate exceeds a threshold, it *opens* and subsequent calls fast-fail without hitting the dependency. After a wait period, it moves to *half-open* and allows probe requests. If they succeed, it *closes*. This prevents cascading failures when a downstream service is degraded.

---

### Q: What does the CAP theorem state?

**A:** A distributed data store can guarantee only two of three properties: **C**onsistency (all nodes see the same data), **A**vailability (every request gets a response), and **P**artition Tolerance (survives network failures). Since network partitions are unavoidable, the real choice is CP (consistent but may be unavailable during partitions) vs AP (always available but may return stale data).

---

### Q: What HTTP status code should a successful resource creation return?

**A:** `201 Created`, along with a `Location` header pointing to the new resource (`Location: /orders/42`). Returning `200 OK` for a creation is technically incorrect per HTTP semantics.

---

## Intermediate

### Q: What is the difference between SRP and Separation of Concerns?

**A:** Separation of Concerns (SoC) is the broader architectural principle of isolating different aspects of a system (UI, business logic, persistence). SRP is the class-level rule derived from SoC: a class should serve exactly one stakeholder and have only one reason to change. SoC is an architectural goal; SRP is a design heuristic for individual classes.

---

### Q: What is the database-per-service pattern and why is it required in microservices?

**A:** Each microservice owns its own schema or database — no other service directly queries it. This prevents hidden coupling through shared tables: a schema change in one service won't affect another. The trade-off is that cross-service queries must be composed at the API layer or via events, and cross-service transactions require the Saga pattern instead of ACID.

---

### Q: What is the difference between `@Cacheable` and `@CachePut`?

**A:** `@Cacheable` reads from the cache first and only calls the method on a cache miss — it's for read operations. `@CachePut` always calls the method and always updates the cache regardless — it's for write-through caching on update operations. Both take the same `value` (cache name) and `key` parameters.

---

### Q: How do Retry and Circuit Breaker work together?

**A:** Retry handles *transient* failures — it retries the call a few times with backoff for network blips. Circuit Breaker handles *sustained* failures — after a threshold of failures it stops sending calls at all. Used together: all retry attempts for a single request count as one failure toward the circuit breaker threshold. Always configure Retry to only retry on recoverable exceptions (IOExceptions, timeouts), never on 4xx errors.

---

### Q: What is eventual consistency and when is it acceptable?

**A:** Eventual consistency means that if no new updates are made, all copies of data will eventually converge to the same state — but there's a temporary window where they differ. It's acceptable for non-critical reads (product catalog, recommendations, notifications) where slight staleness is tolerable. It's not acceptable for financial transactions or inventory that must reflect exact state immediately.

---

### Q: How would you version a REST API in Spring Boot?

**A:** The most common approach is URI versioning: `/api/v1/products` and `/api/v2/products` map to separate controller classes. On a breaking change, create a new controller for V2 while V1 continues working. Deprecated versions should respond with a `Sunset` header announcing when support ends, giving clients a migration window.

---

### Q: What is a Saga pattern and why is it needed?

**A:** The Saga pattern replaces distributed ACID transactions (impossible across microservices with separate databases) with a sequence of local transactions. Each step has a compensating transaction that undoes its effect if a later step fails. Two variants: choreography (services react to each other's events autonomously) and orchestration (a central orchestrator commands each service and manages compensations).

---

### Q: What makes a Spring Boot service "stateless" and why does it matter for scaling?

**A:** A stateless service holds no per-user data in JVM memory between requests. All shared state — HTTP sessions, user-specific data — lives in an external store like Redis. This is what makes horizontal scaling possible: any instance can serve any request because no request-specific data is local to an instance. Without statelessness, a load balancer must use sticky sessions to always route the same user to the same instance, which defeats scaling.

---

### Q: What is a read replica and what is its main limitation?

**A:** A read replica is an asynchronous copy of the primary database that serves read queries, offloading read traffic from the primary. Its main limitation is **replication lag** — writes take a few milliseconds to propagate, so read-after-write consistency on a replica isn't guaranteed. Route user-facing post-write reads to the primary; route analytics and catalog reads to replicas.

---

## Advanced

### Q: Can you over-apply SOLID? Give an example.

**A:** Yes. Applying OCP (Open/Closed) to a class that never changes creates needless abstraction layers. If an `EmailSender` has a single implementation and there's no realistic reason to swap it, wrapping it in an interface adds indirection with no benefit. DIP doesn't mean "always use an interface" — it means manage dependency instability. Apply SOLID principles where their specific failure mode is a real risk, not prophylactically everywhere.

---

### Q: How would you design a cache consistency strategy in a microservices architecture?

**A:** Each service owns its cache — other services never directly access it. When source data changes, event-driven invalidation is the most common approach: the owning service emits an `EntityUpdated` event; all services with a local cache subscribe and evict the stale entry. Alternatively, use short TTLs (30–60 seconds) to bound staleness without explicit invalidation. Avoid shared distributed caches between services — they reintroduce coupling, defeating database-per-service.

---

### Q: How would you handle a distributed transaction across Order and Inventory services without a shared database?

**A:** Use the **Saga pattern**. In the choreography variant: Order Service persists a PENDING order and publishes `OrderPlaced`. Inventory Service subscribes, attempts reservation, and publishes `InventoryReserved` or `InventoryFailed`. If failed, Order Service subscribes to `InventoryFailed` and cancels the order. Every handler must be **idempotent** (check a processed-event ID before acting) because Kafka's at-least-once delivery can redeliver messages. Each step is a local transaction — eventual consistency is the consistency model.

---

### Q: How would you decompose a monolith into microservices without a big-bang rewrite?

**A:** Use the **Strangler Fig pattern**: build new features as separate microservices. Route new endpoint traffic to the microservice and legacy traffic to the monolith via an API Gateway. Over time, extract existing modules to services. The `User` module becomes User Service; the `Order` module becomes Order Service. The monolith shrinks as functionality migrates. Never do a big-bang cutover — validate each extracted service in production before moving on.

---

### Q: What is the difference between CP and AP systems? Which would you choose for a banking balance query?

**A:** CP systems (ZooKeeper, etcd, MongoDB with majority-write concern) choose consistency during partitions — they refuse to serve requests that can't be answered with current consensus data. AP systems (Cassandra, DynamoDB, Couchbase) always serve requests, potentially returning stale data. For a banking balance query, choose **CP**: a `503 Unavailable` is better than a stale balance that doesn't reflect a recent transfer. The account owner would rather see an error than an incorrect balance.

---

### Q: How do you design a scalability strategy for a system expected to handle 100× current traffic?

**A:**
1. **API tier**: ensure statelessness (Redis sessions), add instances behind a load balancer.
2. **Database reads**: add read replicas, route `@Transactional(readOnly = true)` queries to replicas.
3. **Caching**: cache frequently-read, rarely-changed data in Redis to reduce replica hits.
4. **Async offloading**: move non-critical processing (notifications, searches, reports) to Kafka workers — decouples producers from consumers.
5. **Connection pooling**: size HikariCP pools per instance to stay within database `max_connections`.
6. **Sharding**: only if write throughput exceeds what a well-tuned primary handles — this is the last resort.
Each step should be validated with metrics (Prometheus/Grafana) before adding the next.

---

### Q: How do you prevent a cache stampede on a high-traffic Redis cache?

**A:** Three techniques: (1) **TTL Jitter** — add random seconds to each entry's TTL to stagger expiry times, preventing simultaneous expirations. (2) **Distributed Mutex** — use `SETNX` (Redis set-if-not-exists) to ensure only one thread recomputes the value; others return stale data or wait briefly. (3) **Probabilistic Early Expiration (PER)** — begin recomputing the value slightly before it expires using a random probability that increases as the expiry approaches, requiring no locks.

---

### Q: How would you implement a Saga timeout for an order stuck forever in PENDING state?

**A:** Use a `@Scheduled` Spring job that queries for orders in `PENDING` state older than a threshold (e.g., 15 minutes). For each stale order, trigger compensation: cancel the order, publish a `SagaTimedOut` event so all participant services (Inventory, Payment) can release any partial reservations. The scheduler must be idempotent (set order to `TIMED_OUT` before compensation to prevent double-processing). For distributed deployments, use a distributed scheduler (Quartz with a JDBC store) to prevent multiple instances from running the job simultaneously.

---

### Q: What is the difference between Circuit Breaker with Retry vs Bulkhead?

**A:** Circuit Breaker + Retry handle **temporal failures** — the dependency is failing (too many errors) or had a transient blip. Circuit Breaker prevents call storms to a failing dependency; Retry recovers from transient blips. Bulkhead handles **resource exhaustion** — a slow (but technically responding) dependency consumes all available threads, starving other dependencies. Bulkhead isolates concurrency slots per dependency so a slow payment service doesn't prevent user lookups. Typically all three are used together: Bulkhead → Circuit Breaker → Retry as layered defense.

---

## Further Reading

- [SOLID Principles](../system-design/solid-principles.md) — foundational OOP design principles applied throughout Java/Spring Boot
- [Microservices](../system-design/microservices.md) — service decomposition, service discovery, and async communication
- [Reliability Patterns](../system-design/reliability-patterns.md) — Resilience4j circuit breaker, retry, and bulkhead in Spring Boot
- [Distributed Systems](../system-design/distributed-systems.md) — CAP theorem, idempotency, and the Saga pattern
- [Scalability Patterns](../system-design/scalability-patterns.md) — stateless services, read replicas, and async offloading
