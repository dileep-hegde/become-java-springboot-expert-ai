---
id: mysql-postgresql-h2-demo
title: "Demo: MySQL, PostgreSQL & H2 Guide"
description: Step-by-step runnable examples for MySQL vs PostgreSQL vs H2 — UUID primary keys, H2 compatibility mode, profile-based datasource switching, and Testcontainers.
sidebar_position: 1
tags:
  - demo
  - databases
  - mysql
  - postgresql
  - h2
  - spring-boot
last_updated: 2026-03-08
---

# Demo: MySQL, PostgreSQL & H2 Guide

> Hands-on examples for database selection, UUID key strategies, H2 development setup, compatibility mode, and switching to PostgreSQL in production.

---

## Prerequisites

Add these dependencies to `pom.xml`:

```xml
<!-- For H2 (dev/test) -->
<dependency>
  <groupId>com.h2database</groupId>
  <artifactId>h2</artifactId>
  <scope>runtime</scope>
</dependency>

<!-- For PostgreSQL (production) -->
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>

<!-- For MySQL (production alternative) -->
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>

<!-- JPA & Flyway -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
</dependency>

<!-- For PostgreSQL-specific Flyway (Boot 3.x) -->
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-database-postgresql</artifactId>
</dependency>

<!-- Testcontainers for CI -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-testcontainers</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>postgresql</artifactId>
  <scope>test</scope>
</dependency>
```

---

## Example 1 — H2 In-Memory with PostgreSQL Compatibility Mode

The simplest dev setup: H2 that understands PostgreSQL syntax.

```yaml
# src/main/resources/application-dev.yml
spring:
  datasource:
    url: jdbc:h2:mem:devdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=VALUE
    driver-class-name: org.h2.Driver
    username: sa
    password: ""
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    hibernate:
      ddl-auto: create-drop    # fresh schema every restart — safe in dev only
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: false             # disable Flyway in dev; let Hibernate manage DDL
```

Run with:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
# then open http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:devdb   user: sa   password: (blank)
```

---

## Example 2 — Profile-Based Datasource Switching (H2 ↔ PostgreSQL)

A complete project structure for switching databases via Spring profiles.

**`application.yml`** (profile-neutral, shared config):

```yaml
spring:
  jpa:
    open-in-view: false                     # ← always disable; prevents lazy-load surprises
    properties:
      hibernate:
        jdbc:
          batch_size: 50                    # batch inserts for performance
```

**`application-dev.yml`** (H2, no Flyway):

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:devdb;MODE=PostgreSQL;NON_KEYWORDS=VALUE;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password: ""
  h2:
    console:
      enabled: true
  jpa:
    hibernate:
      ddl-auto: create-drop
  flyway:
    enabled: false
```

**`application-prod.yml`** (PostgreSQL, Flyway manages schema):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:myapp}
    driver-class-name: org.postgresql.Driver
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 10
      connection-timeout: 30000
      max-lifetime: 1800000
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: validate                    # ← in production: only validate
  flyway:
    enabled: true
    locations: classpath:db/migration
```

Activate:

```bash
# Development
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run

# Production (typically set as environment variable in Dockerfile or K8s)
SPRING_PROFILES_ACTIVE=prod
```

---

## Example 3 — UUID Primary Key That Works on H2, PostgreSQL, and MySQL

```java
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)   // ← Hibernate 6 / Spring Boot 3
    @Column(columnDefinition = "UUID", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private java.math.BigDecimal price;

    // constructors, getters, setters ...
}
```

Flyway migration `V1__create_products.sql` (PostgreSQL syntax — works with H2 in PostgreSQL mode):

```sql
CREATE TABLE products (
    id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),  -- native PostgreSQL UUID generation
    name  TEXT        NOT NULL,
    price NUMERIC(12,2) NOT NULL
);
```

:::note H2 and gen_random_uuid()  
H2 in `MODE=PostgreSQL` supports `gen_random_uuid()` from H2 2.2+. For older H2 versions, use `RANDOM_UUID()` and keep a separate H2 migration script.  
:::

---

## Example 4 — MySQL UUID Strategy: BINARY(16) with Swap Flag

For projects targeting MySQL in production, use time-ordered UUIDs to prevent B-Tree fragmentation.

Flyway migration `V1__create_orders.sql` (MySQL):

```sql
-- MySQL pattern: BINARY(16) + UUID_TO_BIN with swap=1 (time-ordered)
CREATE TABLE orders (
    id         BINARY(16)     PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID(), 1)),
    user_id    BINARY(16)     NOT NULL,
    total      DECIMAL(12,2)  NOT NULL,
    created_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- Read back as string UUID
SELECT BIN_TO_UUID(id, 1) AS id, total FROM orders WHERE BIN_TO_UUID(user_id, 1) = ?;
```

JPA entity for MySQL:

```java
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @Column(columnDefinition = "BINARY(16)", updatable = false, nullable = false)
    private byte[] id;                               // ← raw bytes for MySQL BINARY(16)

    @Column(name = "user_id", columnDefinition = "BINARY(16)", nullable = false)
    private byte[] userId;

    // Helper to get UUID from bytes
    public UUID getIdAsUUID() {
        return java.nio.ByteBuffer.wrap(id)
            .order(java.nio.ByteOrder.BIG_ENDIAN)
            .getLong(0) != 0 ? UUID.nameUUIDFromBytes(id) : null;
    }
}
```

:::tip Simpler MySQL UUID approach  
For new MySQL projects consider using a `CHAR(36)` UUID column with a sequential BIGINT surrogate key for the clustered B-Tree primary key. This avoids the byte gymnastics while keeping the B-Tree healthy.  
:::

---

## Example 5 — Flyway Migrations for H2 and PostgreSQL Side by Side

When `MODE=PostgreSQL` isn't quite enough, Flyway supports vendor-specific migration locations.

```
src/main/resources/
  db/migration/
    V1__create_schema.sql       ← shared, database-agnostic
    V2__add_indexes.sql         ← shared
  db/migration/postgresql/
    V3__pg_specific.sql         ← PostgreSQL-only (e.g. CREATE INDEX CONCURRENTLY)
  db/migration/h2/
    V3__h2_specific.sql         ← H2 equivalent of V3 (different syntax)
```

```yaml
# In application-dev.yml (H2)
spring:
  flyway:
    locations: classpath:db/migration,classpath:db/migration/h2

# In application-prod.yml (PostgreSQL)
spring:
  flyway:
    locations: classpath:db/migration,classpath:db/migration/postgresql
```

This keeps the shared migrations in one place and only isolates truly vendor-specific SQL.

---

## Example 6 — `@DataJpaTest` with H2 (Fast Unit Tests)

```java
@DataJpaTest                              // ← auto-configures H2 in-memory + Hibernate
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void savesAndFindsProduct() {
        Product product = new Product();
        product.setName("Ergonomic Chair");
        product.setPrice(new BigDecimal("299.99"));

        Product saved = productRepository.save(product);

        assertThat(saved.getId()).isNotNull();          // UUID was generated
        assertThat(saved.getName()).isEqualTo("Ergonomic Chair");

        Optional<Product> found = productRepository.findById(saved.getId());
        assertThat(found).isPresent();
    }
}
```

This test runs in ~300 ms — no Docker, no external services.

---

## Example 7 — Testcontainers PostgreSQL for Integration Tests in CI

Replace H2 with a real PostgreSQL container when testing SQL that H2 can't handle.

```java
@SpringBootTest
@Testcontainers
class ProductRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);         // ← wire container URL
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
    }

    @Autowired
    private ProductRepository productRepository;

    @Test
    void runsMigrationsAndSavesProduct() {
        Product product = new Product();
        product.setName("Standing Desk");
        product.setPrice(new BigDecimal("599.00"));

        productRepository.save(product);

        assertThat(productRepository.count()).isEqualTo(1L);
    }
}
```

---

## Example 8 — H2 Console Security Configuration

The H2 console uses frames, which Spring Security blocks by default.

```java
@Configuration
@Profile("dev")                                        // ← only active in dev profile
public class DevSecurityConfig {

    @Bean
    public SecurityFilterChain devFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()   // ← allow console without auth
                .anyRequest().authenticated()
            )
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/h2-console/**"))       // ← H2 console POSTs without CSRF token
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin()));      // ← allow frames from same origin

        return http.build();
    }
}
```

:::warning Dev-only  
Never expose the H2 console in production. The `@Profile("dev")` annotation ensures this config is excluded from all non-dev builds. Additionally, exclude H2 driver from production classpath using Maven profiles if needed.  
:::

---

## Summary

| Scenario | Recommended Setup |
|----------|-------------------|
| Local development (fast) | H2 in-memory, `MODE=PostgreSQL`, `ddl-auto=create-drop` |
| Unit tests (`@DataJpaTest`) | H2 in-memory (auto-configured) |
| Integration tests (CI) | Testcontainers PostgreSQL/MySQL (real behavior) |
| Production (new project) | PostgreSQL with Flyway, `ddl-auto=validate` |
| Production (existing MySQL ecosystem) | MySQL 8+ InnoDB with `BINARY(16)` UUID keys |
| UUID primary keys | PostgreSQL `UUID` type; MySQL `BINARY(16)` + swap flag; H2 auto-compat |

Back to [MySQL, PostgreSQL & H2 Guide](../mysql-postgresql-h2.md).
