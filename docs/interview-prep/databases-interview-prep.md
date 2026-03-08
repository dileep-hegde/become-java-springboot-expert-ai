---
id: databases-interview-prep
title: Databases Interview Questions
description: Consolidated interview Q&A for the Databases domain — SQL, indexes, transactions, connection pooling, NoSQL, and schema migration — beginner through advanced.
sidebar_position: 16
tags:
  - interview-prep
  - databases
  - sql
  - java
  - spring-boot
last_updated: 2026-03-08
---

# Databases Interview Questions

> Consolidated Q&A for the Databases domain. Covers SQL fundamentals, indexing, ACID transactions, HikariCP, NoSQL trade-offs, and schema migration with Flyway/Liquibase. Essential for any Java backend role.

## How to Use This Page

- Skim **Beginner** questions to confirm you have no blind spots.
- Focus revision time on **Intermediate** questions — these are the standard for most backend roles (3–5 YOE).
- Work through **Advanced** questions for senior and staff-level interviews where system design depth is expected.

---

## Beginner

### Q: What is the difference between WHERE and HAVING in SQL?

`WHERE` filters individual rows **before** grouping occurs. `HAVING` filters **groups** after `GROUP BY` has been applied. You must use `HAVING` when your filter condition involves an aggregate function like `COUNT(*)` or `SUM()`, because aggregate values are not computed until after `GROUP BY`.

```sql
-- WHERE: filters raw rows before grouping
SELECT user_id, COUNT(*) AS order_count
FROM orders
WHERE status = 'COMPLETED'    -- executed before GROUP BY
GROUP BY user_id
HAVING COUNT(*) > 5;          -- executed after GROUP BY
```

---

### Q: What are the SQL JOIN types and when do you use each?

| JOIN Type | Returns | When to use |
|-----------|---------|-------------|
| `INNER JOIN` | Only rows matching in both tables | Both sides required |
| `LEFT JOIN` | All left rows + matching right (NULL if no match) | Right side is optional |
| `RIGHT JOIN` | All right rows + matching left (NULL if no match) | Left side is optional |
| `FULL OUTER JOIN` | All rows from both tables | Find all unmatched rows |
| `CROSS JOIN` | Cartesian product | Rare — combining all possibilities |

Use `LEFT JOIN` when the second table is optional data — e.g., users who may or may not have orders.

---

### Q: What is a database index and why do you use it?

An index is a separate sorted data structure on one or more columns that lets the database find matching rows without scanning every row in the table. It transforms an O(n) full table scan into an O(log n) B-tree traversal. Indexes are added to columns used in `WHERE` clauses, `JOIN ON` conditions, and `ORDER BY` on large tables.

---

### Q: What does ACID stand for?

| Letter | Property | Meaning |
|--------|----------|---------|
| **A** | Atomicity | All operations in a transaction succeed together, or none are applied |
| **C** | Consistency | Transaction brings the DB from one valid state to another (constraints hold) |
| **I** | Isolation | Concurrent transactions do not interfere with each other |
| **D** | Durability | Committed changes survive crashes (written to WAL/disk) |

---

### Q: What is Spring Boot's default connection pool and how do you configure it?

HikariCP, since Spring Boot 2.0. It's auto-configured when `spring-boot-starter-data-jpa` or `spring-boot-starter-jdbc` is on the classpath. Configure it via:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      connection-timeout: 30000
      max-lifetime: 1800000
```

---

### Q: What is a database migration tool and why do you use one?

Tools like Flyway and Liquibase track and apply schema changes as versioned files stored alongside your code. They ensure every environment (dev, CI, staging, production) applies the same sequence of changes reproducibly. Without them, schema changes are manual and lead to environment drift and broken CI builds.

---

### Q: What is the difference between a primary key and a unique constraint?

A primary key uniquely identifies each row, is never NULL, and every table has exactly one. A unique constraint also enforces uniqueness but allows NULL values (one NULL per unique constraint in most databases) and a table can have multiple. In InnoDB (MySQL), the primary key is also the clustered index — the physical row order. Secondary unique constraints are non-clustered.

---

## Intermediate

### Q: Explain window functions and how they differ from GROUP BY.

Window functions (`OVER (PARTITION BY ... ORDER BY ...)`) compute an aggregate or ranking **across a set of rows related to the current row** without collapsing those rows from the result. `GROUP BY` collapses rows into one per group.

```sql
-- GROUP BY: gives one row per user with sum
SELECT user_id, SUM(total_amount) AS total FROM orders GROUP BY user_id;

-- Window function: gives every order row PLUS the running total for that user
SELECT user_id, order_id, total_amount,
       SUM(total_amount) OVER (PARTITION BY user_id ORDER BY created_at) AS running_total
FROM orders;
```

Use window functions when you need both the detail rows and the aggregate in the same result set.

---

### Q: What is the left-prefix rule for composite indexes?

A composite index `(user_id, status)` is organized first by `user_id`, then by `status` within each user. A query can use the index only if it filters on the **leftmost column(s)** in the index definition. Filtering on `status` alone cannot use the index because the data is not globally sorted by `status`.

| Query | Uses `(user_id, status)` index? |
|-------|--------------------------------|
| `WHERE user_id = 1` | ✅ (prefix match) |
| `WHERE user_id = 1 AND status = 'PAID'` | ✅ (full match) |
| `WHERE status = 'PAID'` | ❌ (left column skipped) |

---

### Q: What are the SQL isolation levels and the anomalies they prevent?

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|-----------|---------------------|--------------|
| `READ UNCOMMITTED` | Possible | Possible | Possible |
| `READ COMMITTED` | ✅ Prevented | Possible | Possible |
| `REPEATABLE READ` | ✅ | ✅ Prevented | Possible |
| `SERIALIZABLE` | ✅ | ✅ | ✅ Prevented |

**Dirty Read** — reading uncommitted data from another transaction. **Non-Repeatable Read** — reading the same row twice in one transaction and getting different values. **Phantom Read** — a range query returns different rows on two executions in the same transaction. `READ COMMITTED` (PostgreSQL default) is correct for most applications; escalate to `REPEATABLE READ` only when you need consistent multi-read snapshots.

---

### Q: Why doesn't @Transactional work on private methods or self-invocations?

Spring implements `@Transactional` via a proxy that wraps the bean. Calls go through the proxy, which applies transaction logic. When a method calls another method **on the same object** (`this.method()`), it bypasses the proxy and transaction advice is never applied. Always call transactional methods from a different bean.

---

### Q: How do you choose the right HikariCP maximum-pool-size?

Use the HikariCP formula: `pool_size = (core_count × 2) + effective_spindle_count`. For a 4-core app server with SSDs: `(4 × 2) + 1 = 9`, rounded to 10. Setting it too large causes database-side CPU contention — too many concurrent queries competing for limited database cores. A smaller pool with threads waiting has higher throughput than a large pool thrashing the database CPU.

---

### Q: What is the CAP theorem and how does it relate to NoSQL databases?

CAP states a distributed system can guarantee at most two of: Consistency (every read returns the latest write), Availability (every request gets a non-error response), and Partition Tolerance (system works despite network failures). Since network partitions are unavoidable, real systems choose CP (consistent, may be unavailable during partition — PostgreSQL, HBase) or AP (always available, may return stale data — Cassandra, DynamoDB, Redis cluster).

---

### Q: What is the difference between WHERE in Flyway migration files after applying them?

Flyway records a **checksum** (CRC32) of each migration file in the `flyway_schema_history` table at the time it runs. If you later modify the file on disk, the checksum no longer matches, and Flyway throws `MigrationChecksumMismatch` on the next startup — aborting before running any new migrations. The fix is always to create a **new migration file** that corrects the mistake.

---

### Q: When would you choose Redis, MongoDB, Cassandra, or Elasticsearch?

| Database | Choose When |
|----------|------------|
| **Redis** | Sub-millisecond caching, session storage, rate limiting, leaderboards |
| **MongoDB** | Variable-schema documents, hierarchical data, flexible attribute sets |
| **Cassandra** | Massive write throughput, time-series data, multi-DC distribution |
| **Elasticsearch** | Full-text search with relevance scoring, log aggregation, analytics |

Start with PostgreSQL (relational). Add NoSQL only when you have a specific, demonstrated need.

---

## Advanced

### Q: How does MVCC implement isolation without blocking reads?

Multi-Version Concurrency Control (used by PostgreSQL) keeps multiple versions of each row. Each row has `xmin` (created by which transaction) and `xmax` (deleted by which transaction) metadata. When a transaction starts, it gets a snapshot ID. It sees only rows where `xmin ≤ snapshot_id` and `xmax` is either 0 (not deleted) or `> snapshot_id`. Writers create new versions; readers see the old version simultaneously. Reads and concurrent writes never block each other. A background vacuum process cleans up old versions.

---

### Q: What is write amplification in database indexes and how do you manage it?

Every index must be updated on every write (`INSERT`/`UPDATE`/`DELETE`). A table with 8 indexes requires 9 writes per logical write. On write-heavy tables, this can saturate I/O. Management strategies:
- Audit and drop unused indexes (`pg_stat_user_indexes.idx_scan = 0`)
- Use **partial indexes** `CREATE INDEX ... WHERE status = 'ACTIVE'` — smaller, faster, only maintained for filtered rows
- Batch bulk inserts to reduce per-row overhead
- Delay index creation with `CREATE INDEX CONCURRENTLY` for large tables

---

### Q: How do you safely add a NOT NULL column to a production table with millions of rows?

Use the **expand-contract pattern** across three separate deployments:

1. **Migration 1**: `ALTER TABLE ADD COLUMN phone VARCHAR(30)` — nullable, instant (no rewrite)
2. **App deploy**: application populates `phone` for new rows
3. **Migration 2**: Batch UPDATE existing rows in small chunks with `pg_sleep()` delays
4. **Migration 3**: `ALTER COLUMN phone SET NOT NULL` — fast constraint check, no data scan needed

Never do a single `ADD COLUMN phone VARCHAR(30) NOT NULL DEFAULT 'x'` on a large table — it acquires an `AccessExclusiveLock` and rewrites every row, causing a complete outage.

---

### Q: How would you design a high-throughput event store with Cassandra?

Design the data model around the access pattern first. For "get all events for user X in the last 30 days ordered by time":

```sql
CREATE TABLE user_events (
    user_id      UUID,
    occurred_at  TIMESTAMP,
    event_type   TEXT,
    payload      TEXT,
    PRIMARY KEY (user_id, occurred_at)   -- user_id = partition key, occurred_at = clustering key
) WITH CLUSTERING ORDER BY (occurred_at DESC);
```

This stores all events for a user on the same partition node, sorted in descending time order. Range reads are O(1) partition lookups plus a sequential scan of the clustering key — extremely fast. Pitfalls: avoid huge partitions (time-bucket: use `(user_id, YYYYMM)` as partition key for users with millions of events); never use `ALLOW FILTERING` in production.

---

### Q: How do you detect and fix N+1 queries when using JPA with Spring Data?

**N+1 problem**: fetching 100 orders with a lazy `@ManyToOne` User relationship results in 1 query for orders + 100 queries for users = 101 queries. Detection: enable `spring.jpa.show-sql=true` and count `SELECT` statements, or use Hibernate's `generate_statistics=true` + P6Spy for low overhead monitoring. Fixes:
- **JPQL JOIN FETCH**: `SELECT o FROM Order o JOIN FETCH o.user`
- **`@EntityGraph`**: `@EntityGraph(attributePaths = {"user"})` on the repository method
- **DTO projections** to select only needed columns without loading full entities

---

### Q: What is a covering index and when does it matter?

A covering index includes all columns that a query reads (both filter columns and output columns). The database can answer the query entirely from the index without reading the actual table rows (PostgreSQL: `Index Only Scan`). This is the fastest possible access path — especially important for high-frequency queries on large tables. Add output columns to the index with `INCLUDE` (PostgreSQL) or by making them part of the index column list.

```sql
-- Query: SELECT status, total_amount FROM orders WHERE user_id = ?
-- Covering index covers all three columns
CREATE INDEX idx_orders_covering ON orders(user_id) INCLUDE (status, total_amount);
-- Results in Index Only Scan with Heap Fetches: 0
```

---

## Quick Reference

### SQL Logical Processing Order
```
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

### Isolation Level Defaults
- PostgreSQL: `READ COMMITTED`
- MySQL InnoDB: `REPEATABLE READ`

### HikariCP Key Properties
| Property | Default | Purpose |
|----------|---------|---------|
| `maximum-pool-size` | 10 | Max connections |
| `connection-timeout` | 30,000 ms | Wait before exception |
| `max-lifetime` | 1,800,000 ms | Recycle connections |
| `idle-timeout` | 600,000 ms | Evict idle connections |

### Flyway vs Liquibase At-a-Glance
| | Flyway | Liquibase |
|-|--------|-----------|
| Format | SQL files | YAML/XML/JSON/SQL |
| Rollback | Manual | Built-in |
| Learning curve | Low | Medium |

### MySQL vs PostgreSQL vs H2 At-a-Glance
| Feature | MySQL | PostgreSQL | H2 |
|---------|-------|------------|----|
| Native UUID type | No (`CHAR(36)` or `BINARY(16)`) | Yes (`UUID`) | Yes (`UUID`) |
| Default isolation | REPEATABLE READ | READ COMMITTED | READ COMMITTED |
| `BOOLEAN` type | `TINYINT(1)` alias | True BOOLEAN | True BOOLEAN |
| `RETURNING` clause | No | Yes | Yes |
| Strict SQL mode | Optional | Always | Configurable |
| H2 compat mode | `MODE=MySQL` (partial) | `MODE=PostgreSQL` (~95%) | N/A |
| Best for | Managed cloud (Aurora) | New projects / correctness | Dev & test only |

---

## MySQL, PostgreSQL & H2

### Beginner

**Q: What is the difference between MySQL and PostgreSQL?**  
**A:** Both are relational databases. PostgreSQL is stricter about SQL compliance — it errors on bad data rather than silently truncating. PostgreSQL has a native `UUID` type, `JSONB` columns with indexing, and `RETURNING` clauses. MySQL is simpler to operate, has a larger managed cloud ecosystem (Aurora), and is the default in LAMP stacks. PostgreSQL is preferred for new projects that need correctness; MySQL is common in existing ecosystems.

**Q: Why do developers use H2 in development and tests?**  
**A:** H2 runs embedded inside the JVM — no Docker, no external process, no setup. An in-memory H2 database starts in milliseconds and is wiped clean each test run, giving a fresh schema with no cross-test state. It is 10–50× faster than a Testcontainers PostgreSQL container, making it ideal for unit tests and `@DataJpaTest` suites.

**Q: What does `MODE=PostgreSQL` do in an H2 JDBC URL?**  
**A:** It enables H2's PostgreSQL compatibility mode: H2 accepts PostgreSQL-specific syntax like `SERIAL`/`BIGSERIAL` pseudo-types, `ILIKE`, `gen_random_uuid()`, and timezone-aware `NOW()`. This means production Flyway migrations written for PostgreSQL can run on H2 without modification in ~90–95% of cases.

**Q: Why should you never set `ddl-auto=create-drop` in production?**  
**A:** Hibernate will drop all managed tables on application start, recreate them from the entity model, then drop them again on shutdown — complete data loss. In production always use `ddl-auto=validate` (check schema matches entities, fail fast if not) or `ddl-auto=none`, and manage all schema changes through Flyway or Liquibase.

### Intermediate

**Q: How does UUID primary key performance differ between MySQL and PostgreSQL?**  
**A:** PostgreSQL stores `UUID` natively as 16 bytes and its MVCC heap is less sensitive to non-sequential inserts. MySQL has no native UUID type; using `CHAR(36)` (36 bytes) or random v4 UUIDs as `BINARY(16)` causes B-Tree fragmentation because rows are inserted at random positions. The fix for MySQL is `UUID_TO_BIN(uuid, 1)` — the swap flag makes UUIDs time-ordered, reducing fragmentation by ~80%. Alternatively, use a BIGINT surrogate primary key and store the UUID in a `UNIQUE` secondary column.

**Q: What is the MySQL `STRICT_TRANS_TABLES` mode and why does it matter?**  
**A:** Without `STRICT_TRANS_TABLES`, MySQL silently truncates `VARCHAR(10)` when you insert 20 characters — no error, just data loss. PostgreSQL always enforces column lengths. Enable strict mode in the JDBC URL: `jdbc:mysql://host/db?sessionVariables=sql_mode='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`. Spring Boot applications targeting MySQL should always include this.

**Q: Why does MySQL require `serverTimezone=UTC` in the JDBC URL?**  
**A:** The MySQL JDBC driver maps Java `LocalDateTime`/`Timestamp` to the server's timezone. Without `serverTimezone=UTC`, the driver uses the JVM's default timezone. If JVM runs in `Europe/London` (UTC+1 in summer) and the DB is in UTC, timestamps shift by an hour, causing date-range queries to return wrong results. Always include `?serverTimezone=UTC&useSSL=true` in MySQL JDBC URLs.

**Q: How do you configure Spring Boot to use H2 locally but PostgreSQL in production?**  
**A:** Use Spring profiles. Create `application-dev.yml` with H2 datasource config (including `MODE=PostgreSQL`) and `application-prod.yml` with PostgreSQL config. Activate the production profile via `SPRING_PROFILES_ACTIVE=prod` environment variable. Never hard-code credentials — use `${DB_PASSWORD}` and inject from environment variables or Kubernetes Secrets.

### Advanced

**Q: What is PostgreSQL's process-per-connection model and how do you scale past it?**  
**A:** PostgreSQL forks a new OS process (not a thread) for each client connection, consuming ~5–10 MB of memory per process. At 500 connections that is ~2.5–5 GB just for connection overhead. The solution is **PgBouncer** in transaction-pooling mode in front of PostgreSQL — it multiplexes thousands of logical connections onto 20–50 actual PostgreSQL processes. Spring Boot's HikariCP pool connects to PgBouncer, not directly to PostgreSQL, at scale. MySQL uses threads instead of processes, making it lighter per connection but with its own thread-safety considerations.

**Q: When would you choose MySQL Aurora over PostgreSQL for a new project?**  
**A:** MySQL Aurora is the better choice when: (1) you need Aurora Serverless v2 for infrequent/bursty workloads with near-zero idle cost and fast scale-to-zero; (2) the team has deep MySQL operational expertise; (3) migrating an existing MySQL application where DDL changes would be costly. PostgreSQL is preferred otherwise — especially if you need `LISTEN/NOTIFY`, `JSONB` with GIN indexing, partial indexes, or `RETURNING` clauses in `INSERT/UPDATE` statements.

## Related Interview Pages

- [Spring Data Q&A](./spring-data-interview-prep.md) — JPA, `@Transactional`, N+1, caching — the ORM layer on top of these database concepts.
- [Web & REST Q&A](./web-interview-prep.md) — HTTP request handling that often triggers the database queries covered here.
- [Spring Framework Q&A](./spring-framework-interview-prep.md) — IoC and proxy mechanics behind `@Transactional`.
