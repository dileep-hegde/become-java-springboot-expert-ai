---
id: scalability-patterns-demo
title: "Scalability Patterns — Practical Demo"
description: Scenario-based walkthrough of making a Spring Boot service horizontally scalable — stateless sessions with Redis, connection pool tuning, read replica routing, and async offloading.
sidebar_position: 7
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - advanced
  - demo
last_updated: 2026-03-08
---

# Scalability Patterns — Practical Demo

> Hands-on examples for [Scalability Patterns](../scalability-patterns.md). We'll take a session-storing, single-instance Spring Boot app and progressively make it horizontally scalable — zero code refactoring required for steps 1–3.

:::info Prerequisites
Review the [Scalability Patterns](../scalability-patterns.md) note — especially what makes a service stateless, what replication lag means, and when to use async processing.
:::

---

## Scenario: User Profile Service

A Spring Boot application serving user profile data. Currently deployed as a single instance with in-memory sessions. We need to support 10× current traffic by adding instances behind a load balancer.

---

## Example 1: Problem — In-Memory Session (Not Scalable)

```java title="Application.java (stateful — wrong)" showLineNumbers {5}
@SpringBootApplication
public class Application {
    // ❌ Default Spring Security session stored in JVM memory
    // ❌ Adding a second instance means session lives only on the first instance
    // ❌ Load balancer must use sticky sessions — defeats the purpose       // {5}
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Problem:** User logs in on Instance A. Next request routed to Instance B — no session found — forced to re-authenticate. Sticky sessions (IP hash) are the only workaround, but they negate horizontal scaling.

---

## Example 2: Fix — Redis Session Store (Stateless Service)

```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

```java title="Application.java (stateless — correct)" showLineNumbers {2}
@SpringBootApplication
@EnableRedisHttpSession  // {2} ← sessions stored in Redis, not JVM heap
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

```yaml title="application.yml" showLineNumbers
spring:
  data:
    redis:
      host: redis-cluster.internal
      port: 6379
  session:
    store-type: redis
    timeout: 30m           # ← session TTL in Redis
    redis:
      namespace: spring:session   # ← key prefix in Redis
      flush-mode: on-save         # ← write to Redis only when session is modified
```

```java title="SecurityConfig.java" showLineNumbers
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)              // ← one active session per user
                .expiredUrl("/session-expired")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(Customizer.withDefaults())
            .build();
    }
}
```

**Verification:** after adding `@EnableRedisHttpSession`:

```bash
# Start two instances on ports 8080 and 8081
# Login on 8080 → get session cookie
# Use the same session cookie on 8081 → should be authenticated (session in Redis)
curl -c /tmp/cookies.txt http://localhost:8080/login -d "username=alice&password=pass"
curl -b /tmp/cookies.txt http://localhost:8081/api/profile  # ← should return 200
```

:::tip Key takeaway
With `@EnableRedisHttpSession`, both instances share the same session store. You can now round-robin or randomly load-balance without sticky sessions.
:::

---

## Example 3: Connection Pool Tuning for Multi-Instance Deployments

With 5 instances each having `maximumPoolSize=10`, your database receives 50 connections. Scale to 20 instances → 200 connections. PostgreSQL default `max_connections=100` → connection refusal errors.

```yaml title="application.yml (HikariCP tuning)" showLineNumbers
spring:
  datasource:
    url: jdbc:postgresql://db.internal:5432/profiles
    hikari:
      maximum-pool-size: 5        # ← reduced from 10 to 5 per instance
      minimum-idle: 2             # ← keep 2 idle connections ready
      connection-timeout: 3000    # ← fail fast if no connection in 3s (don't queue infinitely)
      idle-timeout: 300000        # ← release idle connections after 5 min
      max-lifetime: 1800000       # ← replace connections after 30 min (before MySQL/PG timeout)
      pool-name: ProfilesHikariPool
      # With 20 instances × 5 connections = 100 connections (within PG default max_connections)
```

:::warning Calculation Rule
`max_connections in DB ≥ (number of instances) × maximumPoolSize + (monitoring, admin tools)`

Always leave headroom. A fully saturated connection pool causes cascading timeouts across the entire fleet.
:::

---

## Example 4: Read Replica Routing

Profile reads (80% of traffic) should go to the replica. Profile updates (20%) go to the primary.

```yaml title="application.yml" showLineNumbers
spring:
  datasource:
    primary:
      url: jdbc:postgresql://primary.db.internal:5432/profiles
      username: profiles_rw
      password: ${DB_PRIMARY_PASSWORD}
      hikari:
        maximum-pool-size: 5
    replica:
      url: jdbc:postgresql://replica.db.internal:5432/profiles
      username: profiles_ro          # ← read-only DB user
      password: ${DB_REPLICA_PASSWORD}
      hikari:
        maximum-pool-size: 10        # ← more connections for read-heavy replica
```

```java title="RoutingDataSource.java" showLineNumbers {5}
public class RoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        // Spring's @Transactional(readOnly = true) sets this flag
        return TransactionSynchronizationManager.isCurrentTransactionReadOnly() // {5}
            ? "replica"   // ← read transactions → replica
            : "primary";  // ← write transactions → primary
    }
}
```

```java title="DataSourceConfig.java" showLineNumbers
@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }

    @Bean
    @ConfigurationProperties("spring.datasource.replica")
    public DataSource replicaDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }

    @Bean
    @Primary
    public DataSource routingDataSource(
            @Qualifier("primaryDataSource") DataSource primary,
            @Qualifier("replicaDataSource") DataSource replica) {
        RoutingDataSource routing = new RoutingDataSource();
        routing.setTargetDataSources(Map.of("primary", primary, "replica", replica));
        routing.setDefaultTargetDataSource(primary);  // ← default to primary when no hint
        return routing;
    }
}
```

```java title="UserProfileService.java" showLineNumbers {3,11}
@Service
public class UserProfileService {

    @Transactional(readOnly = true)  // {3} ← routes to replica via RoutingDataSource
    public UserProfileResponse getProfile(Long userId) {
        return userRepository.findById(userId)
            .map(UserProfileResponse::from)
            .orElseThrow(() -> new ProfileNotFoundException(userId));
    }

    @Transactional                   // {11} ← routes to primary (read-write)
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ProfileNotFoundException(userId));
        user.update(req);
        return UserProfileResponse.from(userRepository.save(user));
    }
}
```

---

## Example 5: Async Processing — Offloading Profile Notifications

When a user updates their profile, sending a notification email doesn't need to block the HTTP response thread.

```java title="UserProfileService.java (with async offloading)" showLineNumbers {13,18}
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final KafkaTemplate<String, ProfileUpdatedEvent> kafkaTemplate;

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        user.update(req);
        User saved = userRepository.save(user);

        // Async: publish event for notification processing         // {13}
        // Does NOT block the HTTP response; Notification Service processes independently
        kafkaTemplate.send("profiles.updated",
            userId.toString(),
            new ProfileUpdatedEvent(UUID.randomUUID(), userId,      // {18}
                                    saved.getEmail(), saved.getName()));

        return UserProfileResponse.from(saved);  // ← returns immediately, email sent async
    }
}
```

```java title="ProfileNotificationConsumer.java" showLineNumbers
@Service
@RequiredArgsConstructor
public class ProfileNotificationConsumer {

    private final EmailSender emailSender;
    private final ProcessedEventRepository processedEvents;

    @KafkaListener(topics = "profiles.updated", groupId = "notification-service")
    public void onProfileUpdated(ProfileUpdatedEvent event) {
        if (processedEvents.existsById(event.eventId())) return; // ← idempotency guard

        emailSender.send(event.email(),
            "Profile Update Confirmation",
            "Hi " + event.name() + ", your profile was updated successfully.");

        processedEvents.save(new ProcessedEvent(event.eventId(), Instant.now()));
    }
}
```

**Scaling impact:** HTTP response time drops from `~150ms` (DB write + email SMTP) to `~20ms` (DB write + Kafka publish). Notification Service scales independently based on queue depth.

---

## Example 6: Measuring the Impact with Actuator Metrics

```yaml title="application.yml"
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    tags:
      application: ${spring.application.name}
```

Key metrics to watch when scaling:

```bash
# HikariCP connection pool usage
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
curl http://localhost:8080/actuator/metrics/hikaricp.connections.pending

# JVM memory (ensure heap isn't growing — stateless = no session accumulation)
curl http://localhost:8080/actuator/metrics/jvm.memory.used

# HTTP latency percentiles
curl "http://localhost:8080/actuator/metrics/http.server.requests?tag=uri:/api/profile"
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add `spring.session.redis.flush-mode: IMMEDIATE` and observe the difference in Redis key creation timing (check with `redis-cli MONITOR`).
2. **Medium**: Configure the `RoutingDataSource` to **always route to primary** for the first 500ms after a write (read-your-writes window). Use a `ThreadLocal<Instant>` to record the last write time per request thread, and check it in `determineCurrentLookupKey`.
3. **Hard**: Implement a **two-tier cache** for `getProfile`: first check Caffeine (L1, local, < 1ms), then check Redis (L2, distributed, ~1ms), then query the replica (L3, ~10ms). On an L2 hit, populate L1. Use Spring's `CompositeCacheManager` to chain Caffeine and Redis cache managers.

---

## Back to Topic

Return to the [Scalability Patterns](../scalability-patterns.md) note for theory, interview questions, and further reading.
