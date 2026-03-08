---
id: spring-data-index
title: Spring Data
description: JPA, repositories, transactions, caching, query methods.
sidebar_position: 1
tags:
  - spring-data
  - overview
last_updated: 2026-03-07
---

# Spring Data

> Spring Data eliminates the DAO boilerplate that previously required writing CRUD operations by hand. Through `JpaRepository` and query-method derivation, you get database access with almost zero implementation code. The important things to master are the N+1 query problem, transaction propagation rules, and when to step outside Spring Data's conventions for complex queries.

## What You'll Find Here

| Topic | Description |
|-------|-------------|
| [JPA vs Hibernate vs Spring Data](./jpa-vs-spring-data.md) | The layered model: JPA spec, Hibernate implementation, Spring Data Commons, Spring Data JPA — how they relate. |
| [Hibernate Basics](./hibernate-basics.md) | `SessionFactory` vs `Session` thread safety, entity lifecycle states, dirty checking, first-level cache, OSIV, `LazyInitializationException`. |
| [JPA Basics](./jpa-basics.md) | `@Entity`, `@Id`, `@GeneratedValue`, relationships (`@OneToMany`, `@ManyToOne`), fetch types, lifecycle callbacks, auditing. |
| [Spring Data Repositories](./spring-data-repositories.md) | `CrudRepository`, `JpaRepository`; query method derivation; `@Query` JPQL/native; pagination; Specification API. |
| [Transactions](./transactions.md) | `@Transactional` — propagation, isolation, `readOnly`, `rollbackFor`; self-invocation trap; `TransactionTemplate`. |
| [N+1 Query Problem](./n-plus-one-problem.md) | EAGER vs. LAZY fetch; JOIN FETCH; `@EntityGraph`; `@BatchSize`; DTO projections as fix. |
| [Projections](./projections.md) | Closed interface, open interface, DTO record, nested, and dynamic projections. |
| [Spring Data Caching](./spring-data-caching.md) | `@Cacheable`, `@CacheEvict`, `@CachePut`, Caffeine, Redis, per-cache TTL configuration. |

## Demos

Hands-on step-by-step code walkthroughs for each topic:

| Demo | What It Shows |
|------|---------------|
| [JPA Basics Demo](./demo/jpa-basics-demo.md) | Entity definition, ManyToOne relationships, lifecycle callbacks, Spring Data auditing. |
| [Spring Data Repositories Demo](./demo/spring-data-repositories-demo.md) | Derived queries, `@Query` JPQL/native, pagination, Specification API for dynamic filters. |
| [Transactions Demo](./demo/transactions-demo.md) | `@Transactional` rollback, self-invocation trap, `readOnly` pattern, `REQUIRES_NEW` audit logging. |
| [N+1 Problem Demo](./demo/n-plus-one-problem-demo.md) | Reproducing N+1 with SQL logs, fixing with JOIN FETCH, `@EntityGraph`, and `@BatchSize`. |
| [Projections Demo](./demo/projections-demo.md) | Closed interface, nested, DTO record, and dynamic projections with SQL output comparison. |
| [Spring Data Caching Demo](./demo/spring-data-caching-demo.md) | `@Cacheable` hit/miss, `@CacheEvict` on writes, `@CachePut`, Redis per-cache TTL. |

## Learning Path

1. **JPA vs Hibernate vs Spring Data** — read this first; understand the full stack before diving into individual APIs.
2. **Hibernate Basics** — `SessionFactory` vs `Session` thread safety, entity states, dirty checking; these underpin everything else.
3. **JPA Basics** — entity mapping and relationship annotations are the foundation; understand `LAZY` vs. `EAGER`.
4. **Spring Data Repositories** — query method derivation (`findByEmailAndStatus`) and `@Query` are the two main patterns.
5. **Transactions** — the self-invocation trap (`this.method()` bypasses the proxy) is the most common Spring bug.
6. **N+1 Problem** — this is the single most common JPA performance problem; understand it deeply.
7. **Caching** — `@Cacheable` reduces database load; understand cache eviction and time-to-live.

## Related Domains

- [Spring Framework](../spring-framework/index.md) — transaction management and AOP underpin `@Transactional`.
- [Databases](../databases/index.md) — SQL, connection pooling, and schema migration (Flyway/Liquibase) work alongside JPA.
- [Spring Boot](../spring-boot/index.md) — `spring-boot-starter-data-jpa` auto-configures the JPA stack.
