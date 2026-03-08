---
id: spring-data-overview
title: Spring Data Overview
description: Quick-reference summary of Spring Data JPA — entity mapping, repository methods, transactions, N+1, projections, and caching.
sidebar_position: 13
tags:
  - spring-data
  - jpa
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Spring Data Overview

> Spring Data JPA is the persistence layer of a Spring Boot application. To use it effectively, you need to understand the full stack beneath it: **JPA** (the specification defining annotations and the `EntityManager` API), **Hibernate** (the ORM implementation that generates SQL, manages Sessions, and handles dirty checking), and **Spring Data JPA** (the convenience layer providing zero-boilerplate repositories and query generation on top of JPA). Mastering Spring Data means understanding not just the annotations, but the Hibernate internals (Session lifecycle, thread safety, entity states) and performance trade-offs (N+1 queries, fetch strategies, projection types) that determine whether an application runs well under production load.

## Key Concepts at a Glance

- **JPA (Jakarta Persistence API)**: A *specification* — defines annotations (`@Entity`, `@Id`) and the `EntityManager` API. Not an implementation.
- **Hibernate**: The most widely used JPA *implementation*. Generates SQL, manages the `Session`, handles dirty checking and caching. Active under every Spring Boot JPA call.
- **Spring Data JPA**: Spring's convenience layer over JPA. Provides `JpaRepository`, query method derivation, and `@Query`.
- **`SessionFactory`**: Hibernate singleton — thread-safe, created once at startup, holds all ORM metadata.
- **`Session`**: Hibernate unit-of-work — NOT thread-safe, one per request/transaction, holds first-level cache and dirty-checking snapshots.
- **Entity states**: Transient (new, untracked), Persistent (in session, tracked), Detached (session closed), Removed (scheduled for DELETE).
- **Dirty checking**: Hibernate auto-detects field changes on persistent entities and generates `UPDATE` at flush time — no explicit `save()` needed.
- **First-level cache**: Per-`Session` identity map. Loading the same entity twice returns the same Java object with no extra SQL.
- **`@Entity`**: Marks a class as a JPA-managed persistent object. Requires `@Id`.
- **`@Id` / `@GeneratedValue`**: Declares the primary key and its generation strategy (`IDENTITY`, `SEQUENCE`, `UUID`).
- **`FetchType.LAZY` / `FetchType.EAGER`**: Controls when associated entities are loaded. LAZY = on demand; EAGER = always with parent.
- **`CrudRepository` / `JpaRepository`**: Spring Data interfaces that provide CRUD and pagination out of the box, with zero SQL.
- **Derived query methods**: Spring Data generates JPQL from the method name — `findByStatusAndCustomerId(...)`.
- **`@Query`**: Override derived methods with explicit JPQL or native SQL for complex queries.
- **`@Transactional`**: Declarative transaction boundary. Works through an AOP proxy. Default propagation: `REQUIRED`.
- **Propagation**: Controls what happens when a transactional method calls another — `REQUIRED` (join), `REQUIRES_NEW` (new TX), etc.
- **N+1 Problem**: Loading N entities with a LAZY association triggers N extra queries. Fixed with JOIN FETCH, `@EntityGraph`, or `@BatchSize`.
- **Projection**: A technique to select only a columns subset — interface projections, DTO projections, or dynamic projections.
- **`@Cacheable`**: Caches method results after the first call; subsequent calls with the same key skip the method body.
- **`@CacheEvict`**: Removes a cache entry when data is updated or deleted.
- **OSIV (Open Session in View)**: Spring Boot default that keeps Hibernate Session open for entire HTTP request — disable in production (`spring.jpa.open-in-view=false`).

## Quick-Reference Table

| Annotation / API | Purpose | Key Notes |
|---|---|---|
| `@Entity` | Marks a class as a JPA entity | Requires `@Id`; class must have a no-arg constructor |
| `@Id` | Primary key field | Required on every entity |
| `@GeneratedValue(strategy=IDENTITY)` | DB auto-increment PK | Most common; `SEQUENCE` preferred for batching |
| `@ManyToOne(fetch=LAZY)` | Many-to-one association | Override EAGER default to LAZY |
| `@OneToMany(mappedBy=..., cascade=ALL)` | One-to-many (inverse side) | `mappedBy` = no FK column on this side |
| `SessionFactory` | Hibernate singleton — thread-safe | Created once at startup; holds ORM metadata |
| `Session` / `EntityManager` | Hibernate unit-of-work — NOT thread-safe | One per request/TX; holds first-level cache |
| `session.flush()` | Send pending SQL to DB (before commit) | Does not commit; use with `clear()` in batch jobs |
| `session.clear()` | Evict all entities from first-level cache | Use after `flush()` in bulk inserts to free memory |
| `Hibernate.initialize(proxy)` | Force-load a LAZY proxy in current session | Prevents `LazyInitializationException` |
| `spring.jpa.open-in-view=false` | Disable Open Session In View | Always set this in production |
| `@Transactional` | Declarative transaction | Proxy-based; self-invocation bypasses it |
| `@Transactional(readOnly=true)` | Read-only transaction hint | Skips dirty-check flush; may route to replica |
| `@Transactional(propagation=REQUIRES_NEW)` | New independent transaction | Audit logging; commits even if outer TX rolls back |
| `@Query` | Custom JPQL or native SQL | `nativeQuery=true` for native; `@Modifying` for writes |
| `@Modifying` | Marks a `@Query` as DML | Must be paired with `@Transactional` |
| `@EntityGraph(attributePaths={"x"})` | Fetch association for one query | Cleaner than JOIN FETCH for simple cases |
| `@BatchSize(size=25)` | Batch lazy collection loads | Low-effort N+1 fix for `@OneToMany` |
| `@Cacheable(cacheNames="x", key="#id")` | Cache method result | Skip method body on cache hit |
| `@CacheEvict(cacheNames="x", key="#id")` | Evict cache on write | Pair with every `@Transactional` update/delete |
| `@CachePut(cacheNames="x", key="#result.id")` | Update cache on write | Always executes method + refreshes cache |
| `@EnableCaching` | Activates cache AOP proxy | Required on a `@Configuration` class |
| `@EnableJpaAuditing` | Enables `@CreatedDate`, `@LastModifiedDate` | Requires `AuditorAware` bean for `@CreatedBy` |

## Learning Path

Suggested reading order for a returning Java developer:

1. [JPA vs Hibernate vs Spring Data](../spring-data/jpa-vs-spring-data.md) — start here: understand what each term means and how the four layers (JPA, Hibernate, Spring Data Commons, Spring Data JPA) relate before writing a single annotation.
2. [Hibernate Basics](../spring-data/hibernate-basics.md) — Session vs SessionFactory thread safety, entity lifecycle states, dirty checking, and first-level cache; these underpin everything you'll do in Spring Data JPA.
3. [JPA Basics](../spring-data/jpa-basics.md) — entity mapping, relationship annotations, fetch types, and lifecycle callbacks are the foundation of everything else.
4. [Spring Data Repositories](../spring-data/spring-data-repositories.md) — once you understand entities, learn how zero-boilerplate repositories generate SQL from method names and `@Query`.
5. [Transactions](../spring-data/transactions.md) — transactions underpin every DB write; understand propagation, isolation, `readOnly`, and the self-invocation trap before moving on.
6. [N+1 Query Problem](../spring-data/n-plus-one-problem.md) — the most common Spring Data performance problem; learn to diagnose it and apply JOIN FETCH, `@EntityGraph`, and `@BatchSize` fixes.
7. [Projections](../spring-data/projections.md) — learn to select only the data you need; complement to N+1 fixes for API endpoints.
8. [Spring Data Caching](../spring-data/spring-data-caching.md) — once persistence is solid, add caching as a performance layer on top of repository calls.

## Notes in This Domain

| Note | What It Covers |
|---|---|
| [JPA vs Hibernate vs Spring Data](../spring-data/jpa-vs-spring-data.md) | The layered model: JPA spec, Hibernate implementation, Spring Data Commons, Spring Data JPA |
| [Hibernate Basics](../spring-data/hibernate-basics.md) | `SessionFactory` vs `Session` thread safety, entity states, dirty checking, first-level cache, OSIV |
| [JPA Basics](../spring-data/jpa-basics.md) | `@Entity`, `@Id`, `@GeneratedValue`, relationship annotations, fetch types, lifecycle callbacks, auditing |
| [Spring Data Repositories](../spring-data/spring-data-repositories.md) | `CrudRepository`/`JpaRepository`, query derivation, `@Query`, `@Modifying`, pagination, Specification API |
| [Transactions](../spring-data/transactions.md) | `@Transactional`, propagation table, isolation levels, `readOnly`, rollback rules, self-invocation trap |
| [N+1 Query Problem](../spring-data/n-plus-one-problem.md) | N+1 diagnosis, JOIN FETCH, `@EntityGraph`, `@BatchSize`, DTO projections as fix |
| [Projections](../spring-data/projections.md) | Closed interface, open interface, DTO record, nested, and dynamic projections |
| [Spring Data Caching](../spring-data/spring-data-caching.md) | `@Cacheable`, `@CacheEvict`, `@CachePut`, Caffeine, Redis, per-cache TTL |

## Top 5 Interview Questions

**1. What is the difference between JPA, Hibernate, and Spring Data JPA?**
JPA is a specification — a set of interfaces and annotations with no implementation. Hibernate is the JPA *implementation* that generates SQL and manages Sessions. Spring Data JPA is a spring library that wraps JPA to provide `JpaRepository`, query method derivation, and `@Query` — you almost never write `EntityManager` code directly.

**2. Is `Session` thread-safe? What about `SessionFactory`?**
`SessionFactory` is thread-safe and a singleton — shared across all threads. A `Session` is NOT thread-safe: it holds a first-level cache and dirty-checking state that would be corrupted by concurrent access. Each request/transaction must have its own `Session`. Spring binds a new `Session` per `@Transactional` method via a `ThreadLocal`.

**3. What is the N+1 problem and how do you fix it?**
Accessing a LAZY association on N loaded entities triggers N extra SQL queries. Fix with JOIN FETCH (explicit JPQL join), `@EntityGraph` (declarative fetch path for derived methods), `@BatchSize` (batch the N queries into groups), or DTO projections (include the needed columns in a single query).

**4. Explain `@Transactional` propagation — specifically `REQUIRED` vs `REQUIRES_NEW`.**
`REQUIRED` joins an existing transaction or creates one. `REQUIRES_NEW` always suspends the outer transaction and starts a fresh independent one. Use `REQUIRES_NEW` for audit logging that must commit even if the outer transaction rolls back.

**5. What causes `LazyInitializationException` and how do you fix it?**
It occurs when a LAZY-loaded association is accessed after the Hibernate `Session` has closed (after the `@Transactional` method returned). Fix by returning DTOs or projections from service methods, initializing the association inside the transaction with `JOIN FETCH` or `Hibernate.initialize()`, or disabling OSIV and properly fixing the fetch strategy.

## Further Reading

- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/reference/) — official docs
- [Hibernate User Guide](https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html) — fetch strategies, caching, and performance
- [Spring Transaction Reference](https://docs.spring.io/spring-framework/reference/data-access/transaction.html) — complete `@Transactional` documentation

## Related Sections

- [Spring Data Interview Prep](../interview-prep/spring-data-interview-prep.md) — full Q&A for revision
- [Spring Boot Overview](./spring-boot-overview.md) — auto-configuration and testing context that wraps Spring Data
- [Spring Framework Overview](./spring-framework-overview.md) — IoC and AOP fundamentals that underpin `@Transactional`
