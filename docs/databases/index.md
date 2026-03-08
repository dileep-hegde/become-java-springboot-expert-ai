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

| Topic | Note | Description |
|-------|------|-------------|
| SQL Fundamentals | [sql-fundamentals.md](./sql-fundamentals.md) | SELECT, JOIN types, GROUP BY, window functions, subqueries, CTEs. |
| Indexes & Query Performance | [indexes-query-performance.md](./indexes-query-performance.md) | B-tree indexes, composite indexes, covering indexes, EXPLAIN plans, pitfalls. |
| Transactions & ACID | [transactions-acid.md](./transactions-acid.md) | Atomicity, Consistency, Isolation levels, Durability, MVCC, deadlocks, `@Transactional`. |
| Connection Pooling | [connection-pooling.md](./connection-pooling.md) | HikariCP configuration (`maximum-pool-size`, `connection-timeout`), pool sizing, leak detection. |
| NoSQL Trade-offs | [nosql-tradeoffs.md](./nosql-tradeoffs.md) | CAP theorem, BASE; Redis, MongoDB, Cassandra, Elasticsearch — when to choose each. |
| Schema Migration | [schema-migration.md](./schema-migration.md) | Flyway vs. Liquibase; versioned migrations; repeatable scripts; expand-contract pattern. |
| MySQL, PostgreSQL & H2 | [mysql-postgresql-h2.md](./mysql-postgresql-h2.md) | Choosing between databases, UUID handling, H2 for development, migration path to production. |

## Learning Path

1. **SQL Fundamentals** — `JOIN` types and `GROUP BY` with aggregation are the most common SQL interview questions.
2. **Indexes** — understand when an index helps and when it hurts (write amplification).
3. **Transactions & ACID** — isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE) and their phantom-read implications.
4. **Connection Pooling** — HikariCP is Spring Boot's default; know the key pool size configuration settings.
5. **Schema Migration** — Flyway is the simpler option; Liquibase supports rollbacks. Know the trade-offs.
6. **MySQL, PostgreSQL & H2** — understand which database to choose for new projects, why H2 is safe for development, and how UUIDs behave differently across engines.

## Related Domains

- [Spring Data](../spring-data/index.md) — JPA and `@Transactional` are the Spring abstraction over the database layer.
- [System Design](../system-design/index.md) — database selection (relational vs. NoSQL) is a core system design skill.
- [Docker](../docker/index.md) — databases in local development environments are typically run with Docker Compose.
