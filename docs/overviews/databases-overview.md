---
id: databases-overview
title: Databases Overview
description: Quick-reference summary of SQL, indexes, transactions, connection pooling, NoSQL trade-offs, and schema migration for Java backend engineers.
sidebar_position: 15
tags:
  - java
  - spring-boot
  - databases
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Databases Overview

> This domain covers the full data persistence stack for Java backend engineers: relational SQL with indexes and transactions, connection pooling with HikariCP, NoSQL store selection using CAP theorem reasoning, and safe schema evolution with migration tools. These topics surface in every backend interview — from basic JOIN types through to isolation levels and production migration patterns.

## Key Concepts at a Glance

- **SQL**: a declarative language for querying relational databases; logical processing order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.
- **JOIN**: combines rows from two tables; INNER (both match), LEFT (all from left), RIGHT (all from right), FULL OUTER (all from both).
- **GROUP BY + HAVING**: `GROUP BY` collapses rows into groups; `HAVING` filters groups by aggregates (COUNT, SUM, etc.).
- **Window function**: computes aggregates/rankings over a partition of rows without collapsing them; `OVER (PARTITION BY ... ORDER BY ...)`.
- **B-Tree index**: the default index type; stores sorted values for O(log n) lookup; supports equality, range, and prefix queries.
- **Composite index**: covers multiple columns in order; the left-prefix rule determines which queries can use it.
- **Covering index**: includes all columns the query needs — enables `Index Only Scan` (no heap access).
- **EXPLAIN ANALYZE**: shows the query execution plan; look for `Seq Scan` on large tables as a signal for a missing index.
- **ACID**: Atomicity, Consistency, Isolation, Durability — the four guarantees of a relational transaction.
- **Isolation levels**: READ COMMITTED (default in PostgreSQL), REPEATABLE READ (default in MySQL), SERIALIZABLE (strictest); each prevents different read anomalies.
- **MVCC**: Multi-Version Concurrency Control — readers see a consistent snapshot without blocking writers; used by PostgreSQL.
- **Deadlock**: two transactions each hold a lock the other needs; the database aborts one; application must catch and retry.
- **HikariCP**: Spring Boot's default connection pool; maintains pre-established connections for reuse; key setting is `maximum-pool-size`.
- **Connection leak**: a connection borrowed from the pool and never returned; detected with `leak-detection-threshold`; prevented with try-with-resources.
- **CAP theorem**: distributed systems can guarantee at most two of Consistency, Availability, Partition Tolerance; real choice is CP vs AP.
- **BASE**: Basically Available, Soft state, Eventually Consistent — the counterpart to ACID for AP NoSQL systems.
- **Redis**: in-memory key-value store; use for caching, session storage, rate limiting, leaderboards.
- **MongoDB**: document store with flexible JSON-like schema; use for variable-attribute or hierarchically nested data.
- **Cassandra**: wide-column store designed for massive write throughput and linear horizontal scale; queries must use the partition key.
- **Flyway**: SQL file-based schema migration tool; migrations named `V{n}__{desc}.sql`; never modify an applied migration.
- **Liquibase**: structured changelog-based migration tool; YAML/XML format; built-in rollback support.
- **Expand-contract pattern**: safe way to add a NOT NULL column in three steps: add nullable → backfill → set NOT NULL.
- **PostgreSQL**: open-source RDBMS; native `UUID` type, `JSONB`, `RETURNING`, partial indexes, strict SQL compliance, process-per-connection model; default isolation `READ COMMITTED`.
- **MySQL**: most deployed open-source RDBMS; no native UUID type, `TINYINT(1)` booleans, optional strict mode, thread-per-connection; default isolation `REPEATABLE READ`; excels in managed cloud offerings (Aurora).
- **H2**: pure-Java embeddable database; in-memory or file-based; runs inside the JVM for dev/test; `MODE=PostgreSQL` covers ~95% of PostgreSQL syntax for local dev without Docker.
- **H2 compatibility mode**: `MODE=PostgreSQL` or `MODE=MySQL` in the JDBC URL instructs H2 to accept database-specific DDL/DML syntax.
- **UUID in PostgreSQL**: native 16-byte type; `gen_random_uuid()` built-in; no fragmentation issues.
- **UUID in MySQL**: no native type; `BINARY(16)` with `UUID_TO_BIN(uuid, 1)` swap flag for time-ordered, compact storage.
- **PgBouncer**: connection pooler for PostgreSQL; transaction-pooling mode multiplexes thousands of app connections onto a small number of DB processes; needed at scale.
- **B-Tree fragmentation (MySQL + UUID)**: random v4 UUIDs as InnoDB primary keys fragment the B-Tree index; fix with time-ordered UUIDs or a BIGINT surrogate key.

---

## Quick-Reference Table

### SQL

| Feature | Syntax / Rule | Key Note |
|---------|--------------|---------|
| Logical SELECT order | `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY` | Aliases defined in SELECT are not available in WHERE |
| INNER JOIN | `JOIN t2 ON t1.id = t2.fk` | Excludes non-matching rows from both sides |
| LEFT JOIN | `LEFT JOIN t2 ON t1.id = t2.fk` | NULLs for unmatched right rows |
| GROUP BY + aggregate | `GROUP BY col HAVING COUNT(*) > n` | HAVING filters groups, not rows |
| Window function | `SUM(x) OVER (PARTITION BY y ORDER BY z)` | No row collapse |
| CTE | `WITH name AS (SELECT ...)` | Reusable named subquery |
| NULL comparison | `IS NULL` / `IS NOT NULL` | `= NULL` always evaluates to UNKNOWN |
| Parameterized query | `WHERE id = ?` or `WHERE id = :id` | Always use — prevents SQL injection |

### Indexes

| Type | When to Use | Pitfall |
|------|------------|---------|
| B-Tree (default) | Equality, range, prefix, sort | Write amplification on heavy writes |
| Composite `(a, b)` | Both columns often in WHERE | Left-prefix rule — `b` alone can't use it |
| Covering index | Frequent high-traffic queries | Wider index = more write overhead |
| Partial index | Subset of rows (e.g., active=true) | Only helps queries matching predicate |
| Functional index | `LOWER(email)` comparisons | Must match the expression exactly |

### Transactions & @Transactional

| Property | Spring Annotation | Default |
|----------|------------------|---------|
| Isolation level | `@Transactional(isolation = Isolation.X)` | Database default (READ_COMMITTED for PG) |
| Propagation | `@Transactional(propagation = Propagation.X)` | `REQUIRED` |
| Read-only hint | `@Transactional(readOnly = true)` | `false` |
| Rollback on checked ex | `@Transactional(rollbackFor = IOException.class)` | Only unchecked by default |
| Independent tx | `Propagation.REQUIRES_NEW` | – |
| Pessimistic lock | `@Lock(LockModeType.PESSIMISTIC_WRITE)` | `SELECT ... FOR UPDATE` |
| Optimistic lock | `@Version` field on entity | Checks version column on UPDATE |

### HikariCP

| Property | Recommended Value | Purpose |
|----------|------------------|---------|
| `maximum-pool-size` | `(cores × 2) + 1 ≈ 10` | Max connections in pool |
| `minimum-idle` | `5` | Warm connections at rest |
| `connection-timeout` | `30000` ms | Max wait before exception |
| `max-lifetime` | `1800000` ms | Recycle before DB kills |
| `keepalive-time` | `60000` ms | Keep idle connections alive |
| `leak-detection-threshold` | `2000` ms (dev only) | Log connections held too long |

### NoSQL Decision Guide

| Use Case | Technology |
|----------|-----------|
| Sub-ms reads, caching, sessions | Redis |
| Variable schema, nested documents | MongoDB |
| Massive writes, time-series, multi-DC | Cassandra / DynamoDB |
| Full-text search, log analytics | Elasticsearch |
| Complex queries + ACID | PostgreSQL (relational) |

### Flyway Migration Naming

| Prefix | Meaning | Re-runs? |
|--------|---------|----------|
| `V{n}__desc.sql` | Versioned — runs once | No |
| `R__desc.sql` | Repeatable — runs when checksum changes | Yes |
| `U{n}__desc.sql` | Undo (Flyway Teams) | On rollback only |

### MySQL vs PostgreSQL vs H2 Quick Comparison

| Feature | MySQL | PostgreSQL | H2 |
|---------|-------|------------|-----|
| Native UUID type | No | Yes (`UUID`) | Yes (`UUID`) |
| Default isolation | REPEATABLE READ | READ COMMITTED | READ COMMITTED |
| `BOOLEAN` storage | `TINYINT(1)` | True BOOLEAN | True BOOLEAN |
| `RETURNING` clause | No | Yes | Yes |
| `JSONB` support | No (`JSON` only) | Yes (indexed) | No |
| Strict mode | Optional | Always | Configurable |
| H2 compat mode | `MODE=MySQL` | `MODE=PostgreSQL` (~95%) | N/A |
| Use for | Legacy / Aurora | New projects | Dev & tests only |

### UUID Primary Key Strategy

| Database | Efficient Strategy |
|----------|--------------------|
| PostgreSQL | `UUID` type + `DEFAULT gen_random_uuid()` |
| MySQL | `BINARY(16)` + `UUID_TO_BIN(UUID(), 1)` swap flag |
| H2 (dev) | `UUID` type (auto-compat with PostgreSQL mode) |
| JPA (all) | `@GeneratedValue(strategy = GenerationType.UUID)` (Hibernate 6+) |

---

## Learning Path

1. [SQL Fundamentals](../databases/sql-fundamentals.md) — start here; JOIN types and GROUP BY are first-round interview questions.
2. [Indexes & Query Performance](../databases/indexes-query-performance.md) — EXPLAIN plan reading and composite index design are mid-level expectations.
3. [Transactions & ACID](../databases/transactions-acid.md) — isolation levels and `@Transactional` behavior are probed at every level.
4. [Connection Pooling](../databases/connection-pooling.md) — HikariCP configuration, pool sizing, and leak detection are Spring Boot production essentials.
5. [NoSQL Trade-offs](../databases/nosql-tradeoffs.md) — CAP theorem and "when to use Redis vs MongoDB" are common system design warm-up questions.
6. [Schema Migration](../databases/schema-migration.md) — Flyway naming conventions and the expand-contract pattern signal production experience.
7. [MySQL, PostgreSQL & H2](../databases/mysql-postgresql-h2.md) — once you understand SQL and transactions, understand which database to run them on and why H2 is the right choice for local development.

---

## Top 5 Interview Questions

**Q1: What is the difference between WHERE and HAVING?**  
**A:** `WHERE` filters rows before `GROUP BY` runs — it cannot reference aggregate functions. `HAVING` filters after `GROUP BY` — it filters groups by aggregated values like `COUNT(*)` or `SUM()`. A common mistake is trying to filter on an aggregate in `WHERE`, which is a syntax error.

**Q2: What are the SQL isolation levels and what anomaly does each prevent?**  
**A:** Four levels in ascending strictness: `READ UNCOMMITTED` prevents nothing (rarely used). `READ COMMITTED` prevents dirty reads (default in PostgreSQL). `REPEATABLE READ` additionally prevents non-repeatable reads (same row returning different values on two reads). `SERIALIZABLE` additionally prevents phantom reads (range queries returning different rows). Each higher level trades concurrency for correctness.

**Q3: How does a composite index work and what is the left-prefix rule?**  
**A:** A composite index `(user_id, status)` sorts data first by `user_id`, then by `status` within each user group. A query using the index must include the **leftmost column(s)** in its filter — `WHERE user_id = ?` can use it, `WHERE status = ?` alone cannot because data is not globally sorted by `status`. Always put the most selective column or the column used in equality filters first.

**Q4: What happens when all HikariCP connections are in use?**  
**A:** The requesting thread blocks and waits up to `connectionTimeout` milliseconds. If no connection is returned within that window, HikariCP throws `SQLTimeoutException` (wrapped as `DataAccessException` in Spring). A persistent queue of waiting threads (`hikaricp.connections.pending > 0`) signals that the pool is undersized for the load.

**Q5: When would you reach for Redis instead of adding another SQL table?**  
**A:** Redis is the right choice when you need sub-millisecond access to data that changes frequently and doesn't require complex querying: caching DB query results (with TTL), storing HTTP sessions, rate-limiting counters (atomic `INCR`), and real-time leaderboards (sorted sets). Keep your relational database as the source of truth and use Redis as a performance layer in front of it.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [SQL Fundamentals](../databases/sql-fundamentals.md) | SELECT, JOIN types, GROUP BY, window functions, CTEs, and Spring JDBC usage. |
| [Indexes & Query Performance](../databases/indexes-query-performance.md) | B-Tree indexes, composite + covering indexes, EXPLAIN plans, JPA index annotations. |
| [Transactions & ACID](../databases/transactions-acid.md) | ACID properties, isolation levels, MVCC, deadlocks, `@Transactional` propagation. |
| [Connection Pooling](../databases/connection-pooling.md) | HikariCP setup, pool sizing formula, monitoring with Actuator, leak detection. |
| [NoSQL Trade-offs](../databases/nosql-tradeoffs.md) | CAP theorem, BASE, Redis/MongoDB/Cassandra/Elasticsearch decision guide. |
| [Schema Migration](../databases/schema-migration.md) | Flyway vs Liquibase, versioned migrations, repeatable scripts, expand-contract pattern. |
| [MySQL, PostgreSQL & H2](../databases/mysql-postgresql-h2.md) | Database comparison, UUID handling, H2 for development, migration path to PostgreSQL. |

## Related Domains

- [Spring Data](../spring-data/index.md) — JPA, `@Transactional`, and repositories are the Spring abstraction over the SQL layer covered here.
- [System Design](../system-design/index.md) — database selection (relational vs NoSQL) and sharding are core system design decisions.
- [Databases Interview Prep](../interview-prep/databases-interview-prep.md) — consolidated Q&A for rapid interview revision on all topics in this domain.
