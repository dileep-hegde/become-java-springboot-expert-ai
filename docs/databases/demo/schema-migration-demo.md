---
id: schema-migration-demo
title: "Schema Migration — Practical Demo"
description: Step-by-step Flyway and Liquibase migration examples in Spring Boot — from first migration to rollback-safe production patterns.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - databases
  - flyway
  - liquibase
  - migrations
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Schema Migration — Practical Demo

> Step-by-step examples for [Schema Migration](../schema-migration.md). Part A covers Flyway (simpler, SQL-first). Part B covers Liquibase (structured changelogs, rollback support).

:::info Prerequisites
Understand [SQL Fundamentals](../sql-fundamentals.md) (DDL statements like `CREATE TABLE`, `ALTER TABLE`) and [Indexes & Query Performance](../indexes-query-performance.md) (why `CREATE INDEX` should be in migrations).
:::

---

## Part A: Flyway

### Setup

```xml title="pom.xml"
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<!-- PostgreSQL-specific Flyway support (required for Flyway 9+) -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

```yaml title="application.yml"
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/myapp
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  flyway:
    enabled: true
    locations: classpath:db/migration
    validate-on-migrate: true         # abort if a migration file was tampered with
    out-of-order: false               # reject out-of-sequence migrations in production
```

---

### Example 1: Initial Schema — V1 to V3

**File layout:**
```
src/main/resources/db/migration/
  V1__create_users_table.sql
  V2__create_orders_table.sql
  V3__add_indexes.sql
```

```sql title="V1__create_users_table.sql"
CREATE TABLE users (
    id         BIGSERIAL    PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    name       VARCHAR(255) NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email UNIQUE (email)
);
```

```sql title="V2__create_orders_table.sql"
CREATE TABLE orders (
    id           BIGSERIAL     PRIMARY KEY,
    user_id      BIGINT        NOT NULL,
    status       VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(12,2) NOT NULL,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

```sql title="V3__add_indexes.sql"
-- FK index (NOT created automatically by PostgreSQL!)
CREATE INDEX idx_orders_user_id     ON orders(user_id);
-- Status index for dashboard queries
CREATE INDEX idx_orders_status_date ON orders(status, created_at DESC);
```

**Verify migration history:**
```sql
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

---

### Example 2: Schema Evolution — Adding a Column Safely

```sql title="V4__add_user_phone.sql"
-- Safe: nullable column, no lock escalation
ALTER TABLE users ADD COLUMN phone VARCHAR(30);
```

```sql title="V5__add_user_preferred_currency.sql"
-- Safe: nullable with default, existing rows get NULL (not the default!)
-- To add NOT NULL with default, use expand-contract pattern (see Example 4)
ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(3);
```

---

### Example 3: Repeatable Migration — Recreate a View

Repeatable migrations (`R__` prefix) re-run whenever their content changes:

```sql title="R__create_order_summary_view.sql"
-- Repeatable: this view is recreated whenever this file changes
CREATE OR REPLACE VIEW order_summary AS
SELECT
    u.id         AS user_id,
    u.name       AS user_name,
    COUNT(o.id)  AS order_count,
    SUM(o.total_amount) AS lifetime_value
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;
```

---

### Example 4: Expand-Contract Pattern — Add NOT NULL Column to Large Table

Never do a one-step `ADD COLUMN phone VARCHAR(30) NOT NULL DEFAULT 'N/A'` on a table with millions of rows — it takes a long exclusive lock. Use three separate migrations:

```sql title="V6__add_phone_nullable.sql"
-- Step 1: Add nullable (no lock)
ALTER TABLE users ADD COLUMN phone VARCHAR(30);
```

```sql title="V7__backfill_phone.sql"
-- Step 2: Backfill existing rows in batches (keep transactions short)
DO $$
DECLARE
    batch_size INT := 1000;
    last_id    BIGINT := 0;
    max_id     BIGINT;
BEGIN
    SELECT MAX(id) INTO max_id FROM users;
    WHILE last_id < max_id LOOP
        UPDATE users
        SET phone = 'UNKNOWN'
        WHERE id > last_id
          AND id <= last_id + batch_size
          AND phone IS NULL;
        last_id := last_id + batch_size;
        PERFORM pg_sleep(0.01);  -- yield to other transactions between batches
    END LOOP;
END $$;
```

```sql title="V8__set_phone_not_null.sql"
-- Step 3: Enforce NOT NULL once all rows are filled (fast — no data scan)
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

---

### Example 5: Java Migration — Complex Data Transformation

Use a Java migration when the transformation requires application logic:

```java title="db/migration/V9__migrate_order_status_codes.java" showLineNumbers {5-20}
public class V9__migrate_order_status_codes extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Map<String, String> statusMap = Map.of(
            "0", "PENDING",
            "1", "COMPLETED",
            "2", "CANCELLED"
        );

        try (PreparedStatement update = context.getConnection().prepareStatement(
            "UPDATE orders SET status = ? WHERE status = ?")) {

            for (Map.Entry<String, String> entry : statusMap.entrySet()) {
                update.setString(1, entry.getValue());   // new code
                update.setString(2, entry.getKey());     // old code
                update.addBatch();
            }
            update.executeBatch();
        }
    }
}
```

---

### Example 6: Test with H2 In-Memory + Flyway

```yaml title="application-test.yml"
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
    driver-class-name: org.h2.Driver
  flyway:
    enabled: true
    locations: classpath:db/migration
  jpa:
    hibernate:
      ddl-auto: none              # let Flyway own the schema, not Hibernate
```

```java title="OrderRepositoryTest.java"
@SpringBootTest
@ActiveProfiles("test")
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void shouldPersistAndFindOrder() {
        // Flyway has already run V1–V9 migrations before this test
        Order saved = orderRepository.save(Order.builder()
            .userId(1L)
            .status("PENDING")
            .totalAmount(new BigDecimal("99.99"))
            .build());

        assertThat(orderRepository.findById(saved.getId())).isPresent();
    }
}
```

---

## Part B: Liquibase

### Setup

```xml title="pom.xml"
<dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
</dependency>
```

```yaml title="application.yml"
spring:
  liquibase:
    change-log: classpath:db/changelog/db.changelog-master.yaml
    enabled: true
```

---

### Example 7: Master Changelog

```yaml title="db/changelog/db.changelog-master.yaml"
databaseChangeLog:
  - include:
      file: db/changelog/changes/001-create-users.yaml
  - include:
      file: db/changelog/changes/002-create-orders.yaml
  - include:
      file: db/changelog/changes/003-add-indexes.yaml
  - include:
      file: db/changelog/changes/004-add-user-phone.yaml
```

---

### Example 8: Changeset with Rollback

```yaml title="db/changelog/changes/002-create-orders.yaml"
databaseChangeLog:
  - changeSet:
      id: 002-create-orders
      author: gajanan
      comment: Create orders table with FK to users
      changes:
        - createTable:
            tableName: orders
            columns:
              - column:
                  name: id
                  type: BIGINT
                  autoIncrement: true
                  constraints:
                    primaryKey: true
                    primaryKeyName: pk_orders
              - column:
                  name: user_id
                  type: BIGINT
                  constraints:
                    nullable: false
                    foreignKeyName: fk_orders_user
                    referencedTableName: users
                    referencedColumnNames: id
              - column:
                  name: status
                  type: VARCHAR(50)
                  defaultValue: PENDING
                  constraints:
                    nullable: false
              - column:
                  name: total_amount
                  type: DECIMAL(12, 2)
                  constraints:
                    nullable: false
              - column:
                  name: created_at
                  type: TIMESTAMP
                  defaultValueComputed: NOW()
                  constraints:
                    nullable: false
      rollback:                          # ← explicit rollback support
        - dropTable:
            tableName: orders
```

```yaml title="db/changelog/changes/004-add-user-phone.yaml"
databaseChangeLog:
  - changeSet:
      id: 004-add-user-phone
      author: gajanan
      changes:
        - addColumn:
            tableName: users
            columns:
              - column:
                  name: phone
                  type: VARCHAR(30)   # ← nullable: safe for existing rows
      rollback:
        - dropColumn:
            tableName: users
            columnName: phone
```

---

### Example 9: Liquibase Rollback — Undo Last N Changes

Liquibase CLI (or Maven plugin) supports rollback:

```bash
# Roll back the last 1 changeset
liquibase --url=jdbc:postgresql://localhost:5432/myapp \
          --username=$DB_USER \
          --password=$DB_PASSWORD \
          rollback-count 1

# Roll back to a specific tag
liquibase tag v1.2.0           # tag the current state first
liquibase rollback v1.2.0     # roll back to that tag
```

From Maven/Gradle:
```xml title="pom.xml (Liquibase Maven plugin excerpt)"
<plugin>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-maven-plugin</artifactId>
    <configuration>
        <changeLogFile>src/main/resources/db/changelog/db.changelog-master.yaml</changeLogFile>
        <url>jdbc:postgresql://localhost:5432/myapp</url>
        <username>${db.username}</username>
        <password>${db.password}</password>
    </configuration>
</plugin>
```

---

## Summary

| Task | Flyway | Liquibase |
|------|--------|-----------|
| Create a new migration | New `V{n}__{desc}.sql` file in `db/migration/` | New changeset in `db/changelog/changes/` YAML |
| Recreate views/procedures | `R__{desc}.sql` (repeatable) | New changeset, each re-run creates-or-replaces |
| Rollback | Manual `V{n}__{undo}.sql` | `rollback:` block in changeset |
| Complex data migration | `V{n}__{desc}.java extends BaseJavaMigration` | `<sql>` changetype or custom `Change` class |
| CI testing | `spring.flyway.enabled=true` + H2 `MODE=PostgreSQL` | `spring.liquibase.enabled=true` + H2 |

Return to the full note: [Schema Migration](../schema-migration.md)
