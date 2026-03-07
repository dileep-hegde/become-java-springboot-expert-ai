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

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| JPA Basics | `@Entity`, `@Id`, `@GeneratedValue`, relationships (`@OneToMany`, `@ManyToOne`), fetch types. |
| Spring Data Repositories | `CrudRepository`, `JpaRepository`; query methods; `@Query` with JPQL/native SQL. |
| Transactions | `@Transactional` — propagation, isolation, `readOnly`, `rollbackFor`; self-invocation trap. |
| N+1 Query Problem | EAGER vs. LAZY fetch; join fetch queries; `@EntityGraph` as the solution. |
| Projections | Interface and DTO projections to avoid loading full entities. |
| Spring Data Caching | `@Cacheable`, `@CacheEvict`, cache providers (Caffeine, Redis). |

## Learning Path

1. **JPA Basics** — entity mapping and relationship annotations are the foundation; understand `LAZY` vs. `EAGER`.
2. **Spring Data Repositories** — query method derivation (`findByEmailAndStatus`) and `@Query` are the two main patterns.
3. **Transactions** — the self-invocation trap (`this.method()` bypasses the proxy) is the most common Spring bug.
4. **N+1 Problem** — this is the single most common JPA performance problem; understand it deeply.
5. **Caching** — `@Cacheable` reduces database load; understand cache eviction and time-to-live.

## Related Domains

- [Spring Framework](../spring-framework/index.md) — transaction management and AOP underpin `@Transactional`.
- [Databases](../databases/index.md) — SQL, connection pooling, and schema migration (Flyway/Liquibase) work alongside JPA.
- [Spring Boot](../spring-boot/index.md) — `spring-boot-starter-data-jpa` auto-configures the JPA stack.
