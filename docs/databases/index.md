---
id: databases-index
title: Databases
description: SQL, NoSQL, connection pooling, schema migration (Flyway/Liquibase).
sidebar_position: 1
tags:
  - java
  - spring-data
  - overview
last_updated: 2026-03-07
---

# Databases

> Data persistence is at the heart of every backend system. This domain covers relational databases (SQL, indexes, transactions), NoSQL trade-offs, connection pooling (HikariCP), and schema migration tools (Flyway and Liquibase). Understanding how to write efficient queries and manage schema evolution safely is expected at every level.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| SQL Fundamentals | SELECT, JOIN types, GROUP BY, window functions, subqueries. |
| Indexes & Query Performance | B-tree indexes, composite indexes, EXPLAIN plans, index pitfalls. |
| Transactions & ACID | Atomicity, Consistency, Isolation (levels), Durability; deadlocks. |
| Connection Pooling | HikariCP configuration (`maximum-pool-size`, `connection-timeout`). |
| NoSQL Trade-offs | CAP theorem; when to use Redis, MongoDB, Cassandra, or Elasticsearch. |
| Schema Migration | Flyway vs. Liquibase; versioned migrations; repeatable scripts. |

## Learning Path

1. **SQL Fundamentals** — `JOIN` types and `GROUP BY` with aggregation are the most common SQL interview questions.
2. **Indexes** — understand when an index helps and when it hurts (write amplification).
3. **Transactions & ACID** — isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE) and their phantom-read implications.
4. **Connection Pooling** — HikariCP is Spring Boot's default; know the key pool size configuration settings.
5. **Schema Migration** — Flyway is the simpler option; Liquibase supports rollbacks. Know the trade-offs.

## Related Domains

- [Spring Data](../spring-data/index.md) — JPA and `@Transactional` are the Spring abstraction over the database layer.
- [System Design](../system-design/index.md) — database selection (relational vs. NoSQL) is a core system design skill.
- [Docker](../docker/index.md) — databases in local development environments are typically run with Docker Compose.
