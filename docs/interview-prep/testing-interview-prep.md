---
id: testing-interview-prep
title: Testing Interview Questions
description: Consolidated interview Q&A for Java Testing covering JUnit 5, Mockito, Spring Boot test slices, integration tests, Testcontainers, MockMvc, and WebTestClient.
sidebar_position: 19
tags:
  - interview-prep
  - java
  - spring-boot
  - testing
last_updated: 2026-03-08
---

# Testing Interview Questions

> Consolidated Q&A for Java and Spring Boot Testing. Use for rapid revision before backend interviews.

## How to Use This Page
- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles
- **Advanced** questions signal senior-level depth (5+ YOE)

---

## Beginner

### Q: What is JUnit 5 and what are its three main modules?

JUnit 5 is the standard Java testing framework. Its three modules are: **JUnit Platform** (test discovery and execution engine), **JUnit Jupiter** (the new programming model — `@Test`, lifecycle annotations, assertions), and **JUnit Vintage** (backward compatibility with JUnit 3/4 tests). In Spring Boot apps, `spring-boot-starter-test` pulls in the Jupiter module automatically.

---

### Q: What is the difference between `@BeforeAll` and `@BeforeEach`?

`@BeforeAll` runs once before the entire test class starts and must be `static` (unless `@TestInstance(PER_CLASS)` is used). `@BeforeEach` runs before every test method. Use `@BeforeEach` for resetting state between tests; `@BeforeAll` for expensive one-time setup like starting a server or loading a file.

---

### Q: What does `assertThrows` do?

`assertThrows(ExceptionType.class, () -> code())` executes the lambda and asserts that the specified exception type is thrown. It returns the exception, so you can also assert on its message:
```java
IllegalArgumentException ex = assertThrows(
    IllegalArgumentException.class, () -> service.validate(null));
assertEquals("null not allowed", ex.getMessage());
```

---

### Q: What is Mockito and what problem does it solve?

Mockito is a mocking framework that replaces real dependencies (repositories, email clients, payment gateways) with fake objects. This lets you test a class in isolation — without a running database, without sending real emails — in a fast, deterministic way. It provides mock creation, stubbing (`when(...).thenReturn(...)`), and interaction verification (`verify(...)`).

---

### Q: What is the difference between `@Mock` and `@InjectMocks`?

`@Mock` creates a fake implementation of a class or interface. `@InjectMocks` creates a real instance of the class under test and injects all available `@Mock` objects into it (via constructor, setter, or field injection). Together they replace the need to manually call `new ServiceUnderTest(mockA, mockB)`.

---

### Q: What is a Spring Boot test slice?

A test slice is an annotation that starts a partial Spring application context, loading only the beans relevant to one layer. For example, `@WebMvcTest` loads Spring MVC infrastructure (controller, filters, MockMvc) but not services or repositories. Slices run 5–10× faster than `@SpringBootTest` which loads the full context.

---

### Q: What does `@SpringBootTest` do?

`@SpringBootTest` loads the full Spring application context — all beans, all auto-configurations — just like production startup. With `webEnvironment = RANDOM_PORT` it also starts an embedded Tomcat server, enabling real HTTP testing via `TestRestTemplate` or `WebTestClient`.

---

### Q: What is Testcontainers?

Testcontainers is a Java library that spins up real Docker containers (PostgreSQL, Redis, Kafka, MySQL, etc.) during a test run and tears them down automatically. It solves the problem of H2 in-memory databases behaving differently from production databases — with Testcontainers, your tests run against the same database engine as production.

---

### Q: What is MockMvc?

MockMvc is a Spring testing tool that dispatches HTTP requests through the full Spring MVC pipeline (DispatcherServlet, filters, argument resolvers, message converters, exception handlers) without starting a real TCP server. It's provided automatically by `@WebMvcTest` and is faster than `TestRestTemplate` because there's no network layer.

---

## Intermediate

### Q: What is a `@ParameterizedTest` and when should you use it?

A parameterized test runs the same test method multiple times with different inputs from a source (`@ValueSource`, `@CsvSource`, `@MethodSource`, etc.). Use it instead of copy-pasted test methods that only differ in input values. Example:

```java
@ParameterizedTest
@CsvSource({"10.0, 110.0", "50.0, 150.0"})
void deposit_updatesBalance(double amount, double expected) {
    account.deposit(amount);
    assertEquals(expected, account.getBalance(), 0.01);
}
```

---

### Q: What is the difference between `@Mock` and `@MockBean`?

`@Mock` (Mockito) creates a mock without any Spring context — used with `@ExtendWith(MockitoExtension.class)` in pure unit tests. `@MockBean` (Spring) creates a Mockito mock AND registers it in the Spring application context as a bean, replacing any existing real bean of that type. Use `@MockBean` inside Spring slice or integration tests; use `@Mock` in plain unit tests.

---

### Q: When would you use `ArgumentCaptor`?

When the argument passed to a mock is built *inside* the method under test — you can't create the exact same instance in the test. `ArgumentCaptor` captures what was actually passed:

```java
@Captor ArgumentCaptor<Order> captor;

verify(orderRepository).save(captor.capture());
assertEquals(OrderStatus.PENDING, captor.getValue().getStatus());
```

---

### Q: What does `@WebMvcTest` load and what does it NOT load?

`@WebMvcTest` loads: `DispatcherServlet`, filter chain, `@Controller`, `@ControllerAdvice`, `@JsonComponent`, `MockMvc`, and security auto-configuration. It does NOT load: `@Service`, `@Repository`, `@Component` beans. Services and repositories must be declared as `@MockBean`.

---

### Q: What does `@DataJpaTest` provide?

`@DataJpaTest` loads JPA infrastructure, entity scanning, and repository beans. It replaces your real `DataSource` with an embedded H2 database and wraps each test in a transaction (rolled back after). It does NOT load `@Service` or `@Controller` beans. Use `TestEntityManager` to set up test data without calling the repository under test.

---

### Q: How do you test a secured Spring endpoint?

Use `@WebMvcTest` with `spring-security-test`:
- `@WithMockUser` injects a fake `Authentication` with a username and roles.
- Without `@WithMockUser`, requests return 401 (unauthenticated).
- `@WithMockUser(roles = "ADMIN")` tests role-based authorization (403 vs 200).

```java
@Test
@WithMockUser(roles = "ADMIN")
void adminEndpoint_returns200() throws Exception {
    mockMvc.perform(get("/admin/stats")).andExpect(status().isOk());
}
```

---

### Q: What is `@DynamicPropertySource` and why is it needed with Testcontainers?

`@DynamicPropertySource` lets you register dynamic property values into Spring's `Environment` at test context setup time, after the `Environment` is created but before beans are instantiated. It's used with Testcontainers because the database JDBC URL is not known until the container starts (it uses a random port):

```java
@DynamicPropertySource
static void configure(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
}
```

Spring Boot 3.1+ `@ServiceConnection` does this automatically.

---

### Q: What is `@ServiceConnection` in Spring Boot 3.1+?

`@ServiceConnection` is an annotation placed on a Testcontainers `@Container` field. Spring Boot reads the container's connection metadata (JDBC URL, username, password, bootstrap servers, etc.) and automatically registers the relevant `spring.datasource.*` or `spring.kafka.*` properties, eliminating the need for a manual `@DynamicPropertySource` method.

---

### Q: What is the difference between `MockMvc` and `WebTestClient`?

Both test Spring controllers at the HTTP level without a real server when used with `@WebMvcTest`. `MockMvc` uses a `perform(...).andExpect(...)` style; `WebTestClient` uses a fluent chainable API (`.get().uri(...).exchange().expectStatus()`). `WebTestClient` also works with Spring WebFlux reactive controllers; `MockMvc` only supports Spring MVC. Both are provided automatically by `@WebMvcTest`.

---

### Q: Why shouldn't you put `@Transactional` on `@SpringBootTest(RANDOM_PORT)` tests?

With `RANDOM_PORT`, HTTP requests run in the embedded server's thread — each request starts and commits its own transaction. The test method runs in a different thread. `@Transactional` on the test method only wraps the test thread, so it can't roll back the server thread's committed writes. Test isolation must be achieved with explicit deletes, `@BeforeEach` cleanup, or Testcontainers with a fresh database.

---

## Advanced

### Q: How does Spring Boot's context caching work in tests, and how can `@MockBean` break it?

Spring Boot caches the application context keyed by its configuration (bean definitions, property sources, active profiles). If two test classes share the same configuration, the second class reuses the cached context without restarting. `@MockBean` modifies the context configuration — each unique set of `@MockBean` declarations creates a separate cached context entry. If 10 test classes each mock a different bean, Spring creates 10 contexts. To prevent this: centralize `@MockBean` declarations in a shared abstract base class so all subclasses share one cached context.

---

### Q: Walk through the JUnit 5 extension model and how Mockito integrates with it.

JUnit 5 extensions implement fine-grained callback interfaces: `BeforeEachCallback`, `AfterEachCallback`, `ParameterResolver`, `TestInstancePostProcessor`, etc. Extensions are registered via `@ExtendWith`. Mockito's `MockitoExtension` implements `BeforeEachCallback` (calls `MockitoAnnotations.openMocks(testInstance)` to process `@Mock`, `@Spy`, `@Captor`), `AfterEachCallback` (validates strictness and resets mocks), and `ParameterResolver` (supports `@Mock` as parameter injection). This clean API replaced JUnit 4's limited `@Rule` mechanism.

---

### Q: How do you design a Testcontainers setup for a large test suite (100+ integration tests) to avoid slow startup?

1. **Shared static containers in a base class**: Declare `@Container static` fields in an abstract base. All test classes extending it share the same container instances.
2. **Context caching**: Ensure all test classes use the same `@MockBean` set (put them in the base class) so Spring reuses one context.
3. **`@ServiceConnection`**: Eliminates `@DynamicPropertySource` and avoids context-invalidating dynamic property differences.
4. **Singleton container pattern**: For rare cases, use Testcontainers' `withReuse(true)` method to keep containers alive across JVM runs (requires `.testcontainers.properties: testcontainers.reuse.enable=true`).

**Follow-up:** What is the Testcontainers singleton container pattern?
**A:** Call `.withReuse(true)` on the container and enable `testcontainers.reuse.enable=true` in `~/.testcontainers.properties`. Containers with the same configuration hash are reused across JVM runs, surviving test completion. This is useful for local development (reduces repeated pull + start time) but should not be used in CI (can create cross-test contamination if not cleaned up properly).

---

### Q: How would you test a Spring Kafka consumer without a real Kafka broker?

Option 1: **Testcontainers Kafka** (`confluentinc/cp-kafka`) — use `@ServiceConnection` with `KafkaContainer`. The real broker validates serialization, partitioning, and consumer group semantics.

Option 2: **EmbeddedKafka** (`@EmbeddedKafka`) — Spring Kafka provides an in-process Kafka broker (backed by Kafka's `EmbeddedKafkaRule`). Faster but less production-like.

Option 3: **`MockConsumer` / `MockProducer`** — Mockito-style unit tests that bypass Kafka entirely; don't test the actual listener configuration.

For integration accuracy Testcontainers is preferred; for unit-level speed EmbeddedKafka is the compromise.

---

### Q: What is `@TestInstance(PER_CLASS)` and when would you use it?

By default, JUnit 5 creates a new test class instance for every test method. `@TestInstance(PER_CLASS)` reuses one instance for the entire class. This allows:
- `@BeforeAll` / `@AfterAll` methods to be non-static
- Shared mutable state between tests (intentional)

Use it when setup is expensive and tests are guaranteed not to mutate shared state in conflicting ways, or in Kotlin where `companion object` lambdas for `@BeforeAll` are awkward.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| `@BeforeEach` | Runs before every test; used to reset state and create fresh objects |
| `@ParameterizedTest` | Runs the same test N times with different input values |
| `@Mock` | Creates a Mockito fake in a pure unit test (no Spring context) |
| `@MockBean` | Creates a Mockito fake AND registers it as a Spring bean |
| `@InjectMocks` | Creates the class under test and injects available mocks into it |
| `@WebMvcTest` | Web slice: loads MVC layer only; fastest for controller tests |
| `@DataJpaTest` | JPA slice: loads repositories + H2; rolls back each test |
| `@SpringBootTest` | Full context; use with `RANDOM_PORT` for true integration tests |
| `TestRestTemplate` | HTTP client for `@SpringBootTest`; no exception on 4xx/5xx |
| `MockMvc` | In-memory HTTP dispatch; full MVC pipeline, no server |
| `WebTestClient` | Fluent HTTP test client; works with MVC and WebFlux |
| Testcontainers | Real Docker containers (Postgres, Kafka, Redis) for integration tests |
| `@ServiceConnection` | Spring Boot 3.1+: auto-registers container connection properties |
| `@DynamicPropertySource` | Manually bridge Testcontainers runtime values → Spring properties |
| `ArgumentCaptor` | Captures argument passed to a mock for post-call assertions |

---

## Related Interview Prep

- [Spring Boot Interview Questions](./spring-boot-interview-prep.md) — test slices are part of Spring Boot auto-configuration
- [Spring Data Interview Questions](./spring-data-interview-prep.md) — `@DataJpaTest` tests JPA repositories; JPA knowledge is needed
- [Web Interview Questions](./web-interview-prep.md) — MockMvc tests Spring MVC controllers; REST/MVC knowledge is a prerequisite
