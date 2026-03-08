---
id: connection-pooling-demo
title: "Connection Pooling & HikariCP — Practical Demo"
description: Hands-on Spring Boot HikariCP configuration examples, pool monitoring, leak detection, and Kubernetes multi-pod sizing.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - databases
  - hikaricp
  - performance
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Connection Pooling & HikariCP — Practical Demo

> Hands-on examples for [Connection Pooling & HikariCP](../connection-pooling.md). Shows configuration patterns from minimal to production-grade.

:::info Prerequisites
Understand [Transactions & ACID](../transactions-acid.md) — each transaction holds a pool connection for its duration. Long transactions directly reduce pool availability.
:::

---

## Example 1: Minimal Configuration (Spring Boot Default)

Spring Boot auto-configures HikariCP from `spring.datasource.*`. The simplest working config:

```yaml title="application.yml (minimal)"
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/myapp
    username: myuser
    password: ${DB_PASSWORD}          # ← NEVER hardcode; inject from environment
```

Spring Boot picks up `HikariDataSource` automatically. Default pool size: `maximum-pool-size = 10`.

---

## Example 2: Production-Grade HikariCP Configuration

```yaml title="application.yml (production)"
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:myapp}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver

    hikari:
      # -- Pool sizing (for 4 CPU core app server, 1 SSD) --
      maximum-pool-size: 10           # (4 cores × 2) + 1 = 9, round up to 10
      minimum-idle: 5                 # keep 5 warm connections at rest

      # -- Timeouts --
      connection-timeout: 30000       # 30s: max wait for a connection before exception
      idle-timeout: 600000            # 10min: idle connections evicted after this
      max-lifetime: 1800000           # 30min: recycle connections before DB/firewall kills them
      keepalive-time: 60000           # 60s: send keepalive on idle connections

      # -- Observability --
      pool-name: MyApp-DB-Pool        # visible in JMX and Micrometer metrics

      # -- Validation (PostgreSQL driver supports isValid(); no test query needed) --
      # connection-test-query: SELECT 1   ← only add for drivers without isValid() support
```

---

## Example 3: Programmatic Configuration with @ConfigurationProperties

For multi-tenant or dynamic datasource setups:

```java title="DataSourceConfig.java" showLineNumbers {6,13}
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")   // ← binds spring.datasource.hikari.*
    public HikariConfig primaryHikariConfig() {
        return new HikariConfig();
    }

    @Bean
    @Primary
    public DataSource primaryDataSource(HikariConfig config) {
        return new HikariDataSource(config);   // ← creates the pool with the bound config
    }
}
```

---

## Example 4: Multiple DataSources (Primary + Read Replica)

```yaml title="application.yml (multi-datasource)"
spring:
  datasource:
    primary:
      url: jdbc:postgresql://primary-db:5432/myapp
      username: ${DB_USER}
      password: ${DB_PASSWORD}
      hikari:
        maximum-pool-size: 10
        pool-name: Primary-Pool

    read-replica:
      url: jdbc:postgresql://replica-db:5432/myapp
      username: ${DB_USER_READONLY}
      password: ${DB_PASSWORD_READONLY}
      hikari:
        maximum-pool-size: 20         # readers can be more concurrent
        pool-name: ReadReplica-Pool
        read-only: true               # hints to driver; some optimize read-only connections
```

```java title="MultiDataSourceConfig.java" showLineNumbers {6,15}
@Configuration
public class MultiDataSourceConfig {

    @Primary
    @Bean("primaryDataSource")
    @ConfigurationProperties("spring.datasource.primary.hikari")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }

    @Bean("readReplicaDataSource")
    @ConfigurationProperties("spring.datasource.read-replica.hikari")
    public DataSource readReplicaDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }
}
```

---

## Example 5: Monitoring with Spring Boot Actuator + Micrometer

```yaml title="application.yml (monitoring)"
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
  metrics:
    tags:
      application: ${spring.application.name}
      environment: ${APP_ENV:dev}
```

**Query pool metrics from the `/actuator/metrics` endpoint:**
```
GET /actuator/metrics/hikaricp.connections.active
GET /actuator/metrics/hikaricp.connections.pending
GET /actuator/metrics/hikaricp.connections.timeout
GET /actuator/metrics/hikaricp.connections.acquire
```

```java title="PoolHealthIndicator.java" showLineNumbers {10-16}
@Component
@Slf4j
public class PoolHealthIndicator {

    private final DataSource dataSource;

    public PoolHealthIndicator(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Scheduled(fixedDelay = 30_000)   // ← log pool stats every 30s in dev
    public void logPoolStats() {
        if (dataSource instanceof HikariDataSource hikari) {
            HikariPoolMXBean pool = hikari.getHikariPoolMXBean();
            log.info("Pool [{}] — active={}, idle={}, pending={}, total={}",
                hikari.getPoolName(),
                pool.getActiveConnections(),
                pool.getIdleConnections(),
                pool.getThreadsAwaitingConnection(),   // ← non-zero = pool exhaustion
                pool.getTotalConnections()
            );
        }
    }
}
```

---

## Example 6: Connection Leak Detection

Enable `leakDetectionThreshold` to log stack traces for connections held too long:

```yaml title="application-dev.yml (leak detection)"
spring:
  datasource:
    hikari:
      leak-detection-threshold: 2000   # ← log connections held > 2 seconds (dev only!)
```

**What the log looks like:**
```
WARN  c.z.hikari.pool.ProxyLeakTask - Connection leak detection triggered for
      conn0: url=jdbc:postgresql://localhost:5432/myapp ...
      java.lang.Exception: Apparent connection leak detected
        at com.example.OrderRepository.findByUserId(OrderRepository.java:42)
        at com.example.OrderService.getOrders(OrderService.java:28)
```

The stack trace points directly to the code that borrowed the connection but didn't return it.

**Fixing a leak with try-with-resources:**

```java title="Safe connection usage" showLineNumbers {4-8}
// CORRECT: try-with-resources guarantees connection is returned
public List<Order> findByUserId(Long userId) {
    try (
        Connection conn = dataSource.getConnection();
        PreparedStatement ps = conn.prepareStatement(
            "SELECT id, status FROM orders WHERE user_id = ?");
    ) {
        ps.setLong(1, userId);
        try (ResultSet rs = ps.executeQuery()) {
            List<Order> results = new ArrayList<>();
            while (rs.next()) {
                results.add(new Order(rs.getLong("id"), rs.getString("status")));
            }
            return results;
        }
    } catch (SQLException e) {
        throw new DataAccessException("Failed to query orders", e) {};
    }
}
```

---

## Example 7: Kubernetes Multi-Pod Pool Sizing

When running multiple app instances, total connections must fit within the database's `max_connections`:

```yaml title="Sizing calculation"
# PostgreSQL default: max_connections = 100 (prod dbs often set 200-500)
# App instances: 5 Kubernetes pods
# HikariCP: maximum-pool-size = 10 per pod
# Total: 5 × 10 = 50 connections — fits within 100 ✅

# If you scale to 20 pods:
# 20 × 10 = 200 connections > 100 — pool exhaustion! ❌
# Solution: reduce pool size to 5, or deploy PgBouncer
```

```yaml title="ConfigMap with pool size from env var"
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_POOL_MAX_SIZE: "10"        # adjust per replica count
```

```yaml title="application.yml (env-driven pool size)"
spring:
  datasource:
    hikari:
      maximum-pool-size: ${DB_POOL_MAX_SIZE:10}   # ← overridable from ConfigMap
```

---

## Example 8: Anti-Pattern — Long Transaction Holding Connection

```java title="OrderService.java (WRONG)" showLineNumbers {3,6}
@Service
public class OrderService {

    @Transactional          // ← transaction (and pool connection!) held for entire method
    public void processOrder(Long orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus("PROCESSING");

        // ⚠️ External HTTP call INSIDE transaction — can take 2-10 seconds
        PaymentResult result = paymentGateway.charge(order.getAmount());

        order.setPaymentId(result.transactionId());
        order.setStatus("PAID");
    }  // ← connection returned here, after the entire HTTP call
}
```

```java title="OrderService.java (CORRECT)" showLineNumbers {4,9}
@Service
public class OrderService {

    // External call OUTSIDE transaction — no connection held during slow I/O
    public void processOrder(Long orderId) {
        // Step 1: Read order data (short transaction, returns connection immediately)
        Order order = loadOrder(orderId);

        // Step 2: External payment (no DB connection held here)
        PaymentResult result = paymentGateway.charge(order.getAmount());

        // Step 3: Persist payment result (short transaction)
        savePaymentResult(orderId, result);
    }

    @Transactional(readOnly = true)
    Order loadOrder(Long orderId) {
        return orderRepo.findById(orderId).orElseThrow();
    }

    @Transactional
    void savePaymentResult(Long orderId, PaymentResult result) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setPaymentId(result.transactionId());
        order.setStatus("PAID");
    }
}
```

---

## Summary

| Configuration Need | Property / Pattern |
|-------------------|-------------------|
| Basic pool size | `maximum-pool-size: 10` |
| Prevent stale connections | `max-lifetime: 1800000` + `keepalive-time: 60000` |
| Detect leaks (dev only) | `leak-detection-threshold: 2000` |
| Monitor pool health | Actuator + `hikaricp.connections.*` metrics |
| Multiple datasources | Separate `@Bean` + `@Primary` + `@ConfigurationProperties` |
| Multi-pod sizing | `total_connections = pool_size × pod_count ≤ max_connections` |

Return to the full note: [Connection Pooling & HikariCP](../connection-pooling.md)
