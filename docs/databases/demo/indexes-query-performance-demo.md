---
id: indexes-query-performance-demo
title: "Indexes & Query Performance — Practical Demo"
description: Hands-on examples covering index creation, composite indexes, covering indexes, and reading EXPLAIN plans in PostgreSQL.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - databases
  - sql
  - indexes
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Indexes & Query Performance — Practical Demo

> Hands-on examples for [Indexes & Query Performance](../indexes-query-performance.md). You'll see the before/after impact of indexes using `EXPLAIN ANALYZE`.

:::info Prerequisites
Understand [SQL Fundamentals](../sql-fundamentals.md) (specifically JOIN and WHERE clauses) before working through these examples, as index effectiveness depends on query structure.
:::

---

## Setup: Sample Table with 1 Million Rows

```sql title="setup.sql"
-- Create the orders table WITHOUT indexes first (to see the scan cost)
CREATE TABLE orders (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT        NOT NULL,
    status       VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(12,2) NOT NULL,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Populate with 1,000,000 rows using generate_series
INSERT INTO orders (user_id, status, total_amount, created_at)
SELECT
    (random() * 10000)::BIGINT + 1,                           -- user_id 1-10000
    (ARRAY['PENDING','COMPLETED','CANCELLED'])[floor(random()*3)+1],
    ROUND((random() * 500 + 10)::NUMERIC, 2),
    NOW() - (random() * INTERVAL '365 days')
FROM generate_series(1, 1000000);

ANALYZE orders;   -- update statistics so EXPLAIN uses accurate estimates
```

---

## Example 1: Full Table Scan (Before Index)

```sql title="explain-no-index.sql"
EXPLAIN ANALYZE
SELECT id, total_amount, status
FROM orders
WHERE user_id = 42;
```

**Expected output (approximately):**
```
Seq Scan on orders  (cost=0.00..26356.00 rows=100 width=24)
                    (actual time=0.432..185.342 rows=98 loops=1)
  Filter: (user_id = 42)
  Rows Removed by Filter: 999902
Planning Time: 0.2 ms
Execution Time: 185.5 ms
```

**Observation:** `Seq Scan` — the database read all 1 million rows, discarding 999,902 of them. Execution time: ~185 ms.

---

## Example 2: Add Index — Watch the Scan Change

```sql title="add-index.sql"
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Run the same query
EXPLAIN ANALYZE
SELECT id, total_amount, status
FROM orders
WHERE user_id = 42;
```

**Expected output (approximately):**
```
Index Scan using idx_orders_user_id on orders
  (cost=0.42..12.45 rows=98 width=24)
  (actual time=0.042..0.198 rows=98 loops=1)
  Index Cond: (user_id = 42)
Planning Time: 0.3 ms
Execution Time: 0.24 ms
```

**Observation:** `Index Scan` — only 98 rows fetched via the B-tree. Execution time dropped from **185 ms to 0.24 ms** — a ~750× speedup.

---

## Example 3: Composite Index — Left-Prefix Rule

```sql title="composite-index.sql"
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Query 1: uses full composite index (both columns in filter)
EXPLAIN ANALYZE
SELECT id, total_amount FROM orders
WHERE user_id = 42 AND status = 'COMPLETED';
-- Output: Index Scan using idx_orders_user_status ... ✅

-- Query 2: uses only the leftmost column
EXPLAIN ANALYZE
SELECT id, total_amount FROM orders
WHERE user_id = 42;
-- Output: Index Scan using idx_orders_user_status ... ✅ (uses prefix)

-- Query 3: skips the leftmost column — cannot use the composite index
EXPLAIN ANALYZE
SELECT id, total_amount FROM orders
WHERE status = 'COMPLETED';
-- Output: Seq Scan on orders ... ❌ (no usable index for status alone)
```

---

## Example 4: Covering Index — Index Only Scan

A covering index lets PostgreSQL avoid the heap entirely:

```sql title="covering-index.sql"
-- The query projects: status, total_amount WHERE user_id = ?
-- Include all three columns in the index
CREATE INDEX idx_orders_covering ON orders(user_id, status, total_amount);

EXPLAIN ANALYZE
SELECT status, total_amount
FROM orders
WHERE user_id = 42;
```

**Expected output:**
```
Index Only Scan using idx_orders_covering on orders
  (cost=0.42..8.15 rows=98 width=20)
  (actual time=0.031..0.085 rows=98 loops=1)
  Index Cond: (user_id = 42)
  Heap Fetches: 0     ← zero heap page reads!
```

**`Heap Fetches: 0`** — the entire query was served from the index. This is the fastest possible access pattern.

---

## Example 5: Function on Column Breaks Index

```sql title="function-breaks-index.sql"
-- With idx_orders_user_id in place:

-- WRONG: wrapping the column in a function prevents index use
EXPLAIN ANALYZE
SELECT id FROM orders WHERE user_id::TEXT = '42';
-- Output: Seq Scan ... ❌ (type cast bypasses index)

-- CORRECT: match the column's type
EXPLAIN ANALYZE
SELECT id FROM orders WHERE user_id = 42;
-- Output: Index Scan ... ✅
```

**Fix for case-insensitive email lookup — index the expression:**
```sql
-- Create a functional index
CREATE INDEX idx_orders_status_lower ON orders(LOWER(status));

-- Now this uses the index
SELECT * FROM orders WHERE LOWER(status) = 'completed';
```

---

## Example 6: Missing FK Index — A Common Oversight

```sql title="missing-fk-index.sql"
CREATE TABLE users (id BIGSERIAL PRIMARY KEY, name VARCHAR(255));

CREATE TABLE orders_v2 (
    id      BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id)  -- ← FK exists, index does NOT
);

-- This join is a full scan on orders_v2 (no index on user_id)
EXPLAIN ANALYZE
SELECT u.name, o.id
FROM users u
JOIN orders_v2 o ON o.user_id = u.id;
-- Nested Loop + Seq Scan on orders_v2 ❌

-- Fix: add the missing FK index
CREATE INDEX idx_orders_v2_user_id ON orders_v2(user_id);

-- Now the join uses an index
EXPLAIN ANALYZE
SELECT u.name, o.id
FROM users u
JOIN orders_v2 o ON o.user_id = u.id;
-- Index Scan using idx_orders_v2_user_id ✅
```

---

## Example 7: JPA Entity Index Declaration

Declare indexes in Spring Boot JPA entity so they're generated (or validated by Flyway in production):

```java title="Order.java" showLineNumbers {3-12}
@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(name = "idx_orders_user_id",
               columnList = "user_id"),
        @Index(name = "idx_orders_user_status",
               columnList = "user_id, status"),
        @Index(name = "idx_orders_covering",
               columnList = "user_id, status, total_amount")
    }
)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String status;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
```

:::warning Use Flyway for production index management
In production, set `spring.jpa.hibernate.ddl-auto=validate` and manage indexes through Flyway migrations. JPA `@Index` is primarily useful for local dev DB setup and test schema generation.
:::

---

## Example 8: Monitor with Spring Boot Actuator

Enable HikariCP and slow query metrics to find queries needing indexes in a live app:

```yaml title="application.yml"
# Enable Hibernate slow query log (logs queries over 100ms)
spring:
  jpa:
    properties:
      hibernate:
        generate_statistics: true
        session:
          events:
            log:
              LOG_QUERIES_SLOWER_THAN_MS: 100  # ← log any query > 100ms

logging:
  level:
    org.hibernate.stat: DEBUG
    org.hibernate.SQL: DEBUG
```

```java title="SlowQueryDetector.java" showLineNumbers {10-15}
// After detecting a slow query, use EXPLAIN ANALYZE programmatically
@Repository
public class DiagnosticsRepository {

    private final JdbcTemplate jdbc;

    public String explainAnalyze(String query) {
        List<String> plan = jdbc.query(
            "EXPLAIN ANALYZE " + query,       // ← only in dev/staging, never in prod with user input
            (rs, i) -> rs.getString(1)
        );
        return String.join("\n", plan);
    }
}
```

---

## Summary Table

| Scenario | Access Pattern | Speed |
|----------|---------------|-------|
| No index, `WHERE user_id = 42` | Seq Scan (1M rows) | ~185 ms |
| Single index on `user_id` | Index Scan (98 rows) | ~0.24 ms |
| Composite `(user_id, status)`, filter on both | Index Scan | ~0.15 ms |
| Covering index, `SELECT status, total_amount` | Index Only Scan | ~0.08 ms |
| Missing FK index on JOIN column | Nested Loop + Seq Scan | Slow |

Return to the full note: [Indexes & Query Performance](../indexes-query-performance.md)
