---
id: testcontainers-demo
title: "Testcontainers — Practical Demo"
description: Hands-on examples for running PostgreSQL, Redis, and Kafka in Docker containers during tests, with Spring Boot 3.1+ @ServiceConnection.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - testing
  - docker
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Testcontainers — Practical Demo

> Hands-on examples for [Testcontainers](../testcontainers.md). We progressively add real PostgreSQL, Redis, and Kafka containers to a Spring Boot test suite.

:::info Prerequisites
Docker must be running on your machine. Understand [Integration Tests](../integration-tests.md) before this demo.
:::

---

## Dependencies

```xml title="pom.xml" showLineNumbers
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
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>kafka</artifactId>
    <scope>test</scope>
</dependency>
<!-- Redis module (generic container is sufficient for basic Redis) -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <scope>test</scope>
</dependency>
```

---

## Example 1: PostgreSQL with `@ServiceConnection` (Spring Boot 3.1+)

The cleanest, most modern approach:

```java title="OrderPostgresTest.java" showLineNumbers {6,9,13}
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers                              // highlighted: activates container lifecycle
class OrderPostgresTest {

    @Container
    @ServiceConnection                       // highlighted: auto-registers JDBC URL in Spring props
    static PostgreSQLContainer<?> postgres = // highlighted: static = shared, not per-test
        new PostgreSQLContainer<>("postgres:16");

    @Autowired
    TestRestTemplate restTemplate;

    @Test
    void placeOrder_persistsToPostgres() {
        ResponseEntity<Order> response = restTemplate.postForEntity(
            "/orders", new OrderRequest("laptop", 999.0), Order.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().getId());
    }

    @Test
    void getOrder_returnsPersistedData() {
        // First create
        ResponseEntity<Order> created = restTemplate.postForEntity(
            "/orders", new OrderRequest("book", 15.0), Order.class);
        Long id = created.getBody().getId();

        // Then retrieve — data survives because we're NOT @Transactional here
        ResponseEntity<Order> fetched =
            restTemplate.getForEntity("/orders/" + id, Order.class);

        assertEquals("book", fetched.getBody().getItemName());
    }
}
```

**What to observe:**
- `@ServiceConnection` reads `PostgreSQLContainer`'s JDBC URL, username, and password and registers them as Spring `spring.datasource.*` properties — zero boilerplate.
- `static` container starts once before the first test and stops after the last — not per-method.
- Each test method's HTTP request commits its transaction independently (no rollback).

---

## Example 2: PostgreSQL the Pre-3.1 Way (`@DynamicPropertySource`)

For Spring Boot < 3.1, or to understand how `@ServiceConnection` works under the hood:

```java title="OrderPostgresLegacyTest.java" showLineNumbers {11,17}
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
class OrderPostgresLegacyTest {

    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("orders_test");

    @DynamicPropertySource                   // highlighted: bridge from container → Spring props
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",      postgres::getJdbcUrl);    // highlighted
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    // Tests are identical to Example 1
}
```

---

## Example 3: Redis Container for Cache Tests

```java title="OrderCacheTest.java" showLineNumbers {6,9}
@SpringBootTest
@Testcontainers
class OrderCacheTest {

    @Container
    @ServiceConnection                       // highlighted: works for Redis too
    static GenericContainer<?> redis =
        new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);         // highlighted: expose port for Spring to connect to

    @Autowired
    OrderService orderService;

    @Autowired
    CacheManager cacheManager;

    @Test
    void findOrder_cachesMissOnFirstCall() {
        // Populate DB
        Order order = orderRepository.save(new Order(null, "laptop", 999.0, OrderStatus.PENDING));

        // First call — cache miss, hits DB
        Order result1 = orderService.findOrder(order.getId());

        // Cache should now contain the result
        Cache.ValueWrapper cached = cacheManager.getCache("orders")
            .get(order.getId());
        assertNotNull(cached);
        assertEquals("laptop", ((Order) cached.get()).getItemName());
    }

    @Test
    void findOrder_returnsCachedValue_onSecondCall() {
        Order order = orderRepository.save(new Order(null, "phone", 499.0, OrderStatus.PENDING));
        orderService.findOrder(order.getId());  // first call — populates cache

        // Delete from DB — second call should still return cached value
        orderRepository.deleteById(order.getId());
        Order cached = orderService.findOrder(order.getId());

        assertEquals("phone", cached.getItemName()); // from cache, not DB
    }
}
```

---

## Example 4: Kafka Container for Event Tests

```java title="OrderEventTest.java" showLineNumbers {6,9,25}
@SpringBootTest
@Testcontainers
class OrderEventTest {

    @Container
    @ServiceConnection                       // highlighted: registers bootstrap servers
    static KafkaContainer kafka =
        new KafkaContainer(
            DockerImageName.parse("confluentinc/cp-kafka:7.6.1")); // highlighted: pin version

    @Autowired
    OrderEventPublisher eventPublisher;

    @Value("${app.kafka.topics.orders}")
    String ordersTopic;

    @Test
    void publishOrderCreated_messageReceivedByConsumer() throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        List<String> received = new ArrayList<>();

        // Set up a test consumer
        Consumer<String, String> consumer = createTestConsumer();
        consumer.subscribe(List.of(ordersTopic));

        // Publish the event
        Order order = new Order(1L, "laptop", 999.0, OrderStatus.PENDING);
        eventPublisher.publishOrderCreated(order);  // highlighted: the action under test

        // Poll in a background thread and count down when message arrives
        Executors.newSingleThreadExecutor().submit(() -> {
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(10));
            records.forEach(r -> received.add(r.value()));
            latch.countDown();
        });

        assertTrue(latch.await(15, TimeUnit.SECONDS));
        assertEquals(1, received.size());
        assertTrue(received.get(0).contains("laptop"));
    }
}
```

---

## Example 5: Shared Base Class for All Integration Tests

One place to define all containers; all test classes reuse the same started instances:

```java title="AbstractIntegrationTest.java" showLineNumbers
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
public abstract class AbstractIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16");

    @Container
    @ServiceConnection
    static GenericContainer<?> redis =
        new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    // All subclasses share these containers — started ONCE for the entire suite
}
```

```java title="OrderTest.java" showLineNumbers
class OrderTest extends AbstractIntegrationTest {

    @Autowired TestRestTemplate restTemplate;

    @Test
    void basicFlow() { /* uses postgres and redis from base class */ }
}
```

```java title="UserTest.java" showLineNumbers
class UserTest extends AbstractIntegrationTest {

    @Autowired TestRestTemplate restTemplate;

    @Test
    void userFlow() { /* same containers, same Spring context */ }
}
```

**Result:** PostgreSQL and Redis start once for the entire test run, not once per class.

---

## Container Startup Observation

Watch the Docker logs or your test output for these lines confirming containers started:

```
org.testcontainers.DockerClientFactory - Docker host: unix:///var/run/docker.sock
org.testcontainers.DockerClientFactory - Docker version: ...
🐳 [postgres:16] - Starting...
🐳 [postgres:16] - Container postgres:16 started in PT3.456S
```

First run: image pull + start (~15–30s). Subsequent runs: start only (~3–5s, image cached.

---

## What You've Practiced

| Concept | Example |
|---------|---------|
| PostgreSQL with `@ServiceConnection` | Example 1 |
| PostgreSQL with `@DynamicPropertySource` (pre-3.1) | Example 2 |
| Redis container for cache tests | Example 3 |
| Kafka container for event tests | Example 4 |
| Shared base class for suite-wide containers | Example 5 |

**Challenge:** Add a Flyway migration that creates the `orders` table. Write a Testcontainers test that verifies: (1) the migration runs on startup, (2) the table exists, and (3) a row can be inserted and retrieved.
