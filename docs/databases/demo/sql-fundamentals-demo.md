---
id: sql-fundamentals-demo
title: "SQL Fundamentals — Practical Demo"
description: Hands-on SQL examples covering JOINs, GROUP BY, window functions, and subqueries in a Spring Boot JDBC context.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - databases
  - sql
  - intermediate
  - demo
last_updated: 2026-03-08
---

# SQL Fundamentals — Practical Demo

> Hands-on examples for [SQL Fundamentals](../sql-fundamentals.md). Each example builds on the last. All SQL runs on **PostgreSQL 16** and is compatible with **H2 in-memory** mode for tests.

:::info Prerequisites
Before running these examples, make sure you understand [SQL Fundamentals](../sql-fundamentals.md) — especially the logical order of query processing and the difference between `WHERE` and `HAVING`.
:::

---

## Schema Setup

All examples use this sample schema. Run these migrations first (or use Flyway — see [Schema Migration](../schema-migration.md)):

```sql title="schema.sql"
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    price       NUMERIC(10,2) NOT NULL,
    category_id BIGINT        REFERENCES categories(id)
);

CREATE TABLE orders (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT        NOT NULL REFERENCES users(id),
    status       VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(12,2) NOT NULL,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT        NOT NULL REFERENCES orders(id),
    product_id BIGINT        NOT NULL REFERENCES products(id),
    quantity   INT           NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);
```

---

## Example 1: Inner Join — Orders with User Names

Retrieve all completed orders alongside the user's name and email.

```sql title="inner-join-orders.sql" showLineNumbers {4-5}
SELECT
    u.name          AS customer_name,
    u.email,
    o.id            AS order_id,
    o.total_amount,
    o.created_at
FROM orders o
INNER JOIN users u ON u.id = o.user_id   -- only rows that match in both tables
WHERE o.status = 'COMPLETED'
ORDER BY o.created_at DESC
LIMIT 20;
```

**What to observe:** Users who have no completed orders do not appear. Change `INNER JOIN` to `LEFT JOIN` and remove the `WHERE` clause to include users with zero completed orders (their `order_id` will be `NULL`).

---

## Example 2: LEFT JOIN — Users Without Orders

Find users who have **never placed an order**.

```sql title="users-without-orders.sql" showLineNumbers {5-6}
SELECT
    u.id,
    u.name,
    u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id   -- all users, even without orders
WHERE o.id IS NULL                        -- NULL means no matching order row exists
  AND u.active = TRUE;
```

**Why `WHERE o.id IS NULL`?** When a `LEFT JOIN` finds no match, all columns from the right table (`orders`) are `NULL`. Filtering `WHERE o.id IS NULL` selects exactly the "no match" rows — a clean pattern for finding missing relationships.

---

## Example 3: GROUP BY and HAVING — Power Users

Find users who spent more than $500 total on completed orders, showing their order count and total spend.

```sql title="power-users.sql" showLineNumbers {5,8}
SELECT
    u.name,
    COUNT(o.id)          AS order_count,
    SUM(o.total_amount)  AS total_spent,
    AVG(o.total_amount)  AS avg_order_value
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.status = 'COMPLETED'            -- filter rows BEFORE grouping
GROUP BY u.id, u.name
HAVING SUM(o.total_amount) > 500        -- filter groups AFTER aggregation
ORDER BY total_spent DESC;
```

**Key insight:** `WHERE o.status = 'COMPLETED'` runs first (filters rows), then `GROUP BY` groups the filtered rows, then `HAVING` filters the groups.

---

## Example 4: Subquery — Products Above Category Average Price

Find products priced above the average price in their category.

```sql title="above-average-price.sql" showLineNumbers {6-9}
SELECT
    p.name        AS product_name,
    p.price,
    c.name        AS category,
    cat_avg.avg_price
FROM products p
JOIN categories c ON c.id = p.category_id
JOIN (
    SELECT category_id, AVG(price) AS avg_price   -- derived table: avg per category
    FROM products
    GROUP BY category_id
) AS cat_avg ON cat_avg.category_id = p.category_id
WHERE p.price > cat_avg.avg_price
ORDER BY c.name, p.price DESC;
```

The derived table in the `JOIN` computes the average once per category, far more efficiently than a correlated subquery that recalculates for every product row.

---

## Example 5: Window Functions — Running Total and Rank

For each user, show their orders in date order with a running total and a rank by spend.

```sql title="window-functions.sql" showLineNumbers {4-11}
SELECT
    user_id,
    order_id,
    created_at,
    total_amount,
    -- running total within the user's orders
    SUM(total_amount) OVER (
        PARTITION BY user_id
        ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    )                          AS running_total,
    -- rank within the user's orders by amount (highest first)
    RANK() OVER (
        PARTITION BY user_id
        ORDER BY total_amount DESC
    )                          AS spend_rank
FROM orders
WHERE status = 'COMPLETED'
ORDER BY user_id, created_at;
```

Unlike `GROUP BY`, this returns **every row** — with the running total and rank computed alongside the raw data.

---

## Example 6: CTE — Monthly Revenue Report

Use a CTE to build a readable monthly revenue report.

```sql title="monthly-revenue.sql" showLineNumbers {1-8,24}
WITH monthly_orders AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*)                        AS order_count,
        SUM(total_amount)               AS revenue
    FROM orders
    WHERE status = 'COMPLETED'
    GROUP BY DATE_TRUNC('month', created_at)
),
month_over_month AS (
    SELECT
        month,
        order_count,
        revenue,
        LAG(revenue, 1) OVER (ORDER BY month) AS prev_revenue
    FROM monthly_orders
)
SELECT
    TO_CHAR(month, 'YYYY-MM')                          AS month,
    order_count,
    revenue,
    prev_revenue,
    ROUND(
        (revenue - prev_revenue) / NULLIF(prev_revenue, 0) * 100, 2
    )                                                  AS growth_pct   -- ← NULLIF avoids division by zero
FROM month_over_month
ORDER BY month;
```

---

## Example 7: Spring Boot — JdbcTemplate with Named Parameters

Execute the power-user query from Example 3 via Spring Boot's `NamedParameterJdbcTemplate`.

```java title="OrderAnalyticsRepository.java" showLineNumbers {15-16,28-34}
@Repository
public class OrderAnalyticsRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public OrderAnalyticsRepository(JdbcTemplate jdbc) {
        this.jdbc = new NamedParameterJdbcTemplate(jdbc);
    }

    public List<UserOrderSummary> findPowerUsers(BigDecimal minSpend) {
        String sql = """
            SELECT u.name, COUNT(o.id) AS order_count,
                   SUM(o.total_amount) AS total_spent
            FROM users u
            JOIN orders o ON o.user_id = u.id
            WHERE o.status = 'COMPLETED'
            GROUP BY u.id, u.name
            HAVING SUM(o.total_amount) > :minSpend
            ORDER BY total_spent DESC
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("minSpend", minSpend);    // ← named parameter, safe from SQL injection

        return jdbc.query(sql, params, (rs, rowNum) ->
            new UserOrderSummary(
                rs.getString("name"),
                rs.getInt("order_count"),
                rs.getBigDecimal("total_spent")
            )
        );
    }

    public record UserOrderSummary(String name, int orderCount, BigDecimal totalSpent) {}
}
```

---

## Example 8: Integration Test with H2

Test the repository with an H2 in-memory database using Spring Boot Test:

```java title="OrderAnalyticsRepositoryTest.java" showLineNumbers {1-5}
@SpringBootTest
@Sql("/db/migration/V1__create_users_table.sql")
@Sql("/db/migration/V2__create_orders_table.sql")
@Sql("/test-data/orders-test-data.sql")           // ← insert sample rows before each test
@Transactional
class OrderAnalyticsRepositoryTest {

    @Autowired
    private OrderAnalyticsRepository repo;

    @Test
    void shouldReturnUsersAboveSpendThreshold() {
        List<OrderAnalyticsRepository.UserOrderSummary> results =
            repo.findPowerUsers(new BigDecimal("100.00"));

        assertThat(results).isNotEmpty();
        assertThat(results).allMatch(u -> u.totalSpent().compareTo(new BigDecimal("100.00")) > 0);
    }
}
```

---

## Summary

| SQL Feature | Key Rule |
|-------------|----------|
| `WHERE` vs `HAVING` | `WHERE` filters rows before grouping; `HAVING` filters groups after |
| `LEFT JOIN` | All rows from the left, NULLs for unmatched right rows |
| Correlated subquery | Runs once per outer row — replace with JOIN for performance |
| Window function | Computes per-row result over a window without collapsing rows |
| CTE (`WITH`) | Named subquery for readability; reusable in the same statement |
| Parameterized queries | Always use `:namedParam` or `?` — never string-concatenate user input |

Return to the full note: [SQL Fundamentals](../sql-fundamentals.md)
