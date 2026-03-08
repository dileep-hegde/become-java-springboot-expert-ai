---
id: testing-overview
title: Testing Overview
description: Quick-reference summary of Java testing concepts — JUnit 5, Mockito, Spring Boot test slices, integration tests, Testcontainers, MockMvc, and WebTestClient.
sidebar_position: 18
tags:
  - java
  - spring-boot
  - testing
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Testing Overview

> A Java backend engineer who cannot write good tests is considered junior regardless of experience. This overview covers the full testing pyramid for Spring Boot applications: fast unit tests with JUnit 5 and Mockito, focused layer tests with slices (`@WebMvcTest`, `@DataJpaTest`), and realistic integration tests using Testcontainers with real databases. Understanding this stack is a requirement for most mid-to-senior Java roles.

## Key Concepts at a Glance

- **JUnit 5 (Jupiter)**: The standard Java test framework — annotations (`@Test`, `@BeforeEach`), assertions (`assertEquals`, `assertThrows`), and parameterized tests.
- **AAA Pattern**: Arrange → Act → Assert — the universal structure of a good test method.
- **Mockito**: A mocking framework. Creates fake dependencies, stubs their behavior, and verifies interactions — zero real I/O during unit tests.
- **`@Mock`**: Creates a Mockito fake in a pure unit test (requires `@ExtendWith(MockitoExtension.class)`).
- **`@MockBean`**: Creates a Mockito fake AND registers it as a Spring bean — used inside `@WebMvcTest`, `@DataJpaTest`, or `@SpringBootTest`.
- **`@InjectMocks`**: Creates the class under test and injects all `@Mock` objects into it.
- **Test Slice**: A Spring Boot annotation that loads only the beans for one layer (`@WebMvcTest`, `@DataJpaTest`, `@JsonTest`). 5–10× faster than `@SpringBootTest`.
- **`@WebMvcTest`**: Web slice — loads MVC layer only. Controller tests with MockMvc, no service beans.
- **`@DataJpaTest`**: JPA slice — loads repositories + H2, auto-rolls back each test in a transaction.
- **`@SpringBootTest`**: Full context — loads every bean. Used for integration tests.
- **`TestRestTemplate`**: Pre-configured HTTP client for `@SpringBootTest(RANDOM_PORT)`. Returns `ResponseEntity` (no exceptions on 4xx/5xx).
- **MockMvc**: In-memory Spring MVC dispatcher — tests the full HTTP pipeline (routing, serialization, validation, security) without a server.
- **WebTestClient**: Fluent HTTP test client — works with both MVC (via MockMvc adapter) and WebFlux. Modern alternative to MockMvc.
- **Testcontainers**: Java library that starts real Docker containers (PostgreSQL, Kafka, Redis) during tests and removes them after.
- **`@ServiceConnection`**: Spring Boot 3.1+ annotation on a Testcontainers container field — automatically registers connection properties. Replaces `@DynamicPropertySource`.
- **`@DynamicPropertySource`**: Method-level annotation that bridges Testcontainers runtime values (JDBC URL, port) into Spring properties.
- **Testing Pyramid**: Many unit tests → fewer slice tests → few integration tests. Fast tests should be the majority.

## Quick-Reference Table

| Annotation / API | Purpose | Key Notes |
|---|---|---|
| `@Test` | Marks a method as a test | From JUnit Jupiter (`org.junit.jupiter.api`) |
| `@BeforeEach` | Runs before every test | Use for fresh object creation; replaces `@Before` from JUnit 4 |
| `@BeforeAll` | Runs once before the class | Must be `static` (unless `@TestInstance(PER_CLASS)`) |
| `@ParameterizedTest` | Runs test N times with inputs | Pair with `@ValueSource`, `@CsvSource`, `@MethodSource` |
| `@DisplayName` | Human-readable test name | Shows in reports; use for complex scenario names |
| `@Disabled` | Skips the test | Test still discovered and reported as skipped |
| `@ExtendWith(MockitoExtension.class)` | Activates `@Mock` / `@InjectMocks` | Required for Mockito annotations in unit tests |
| `when(...).thenReturn(...)` | Stubs a mock method | `thenThrow(...)` for exception stubs |
| `verify(mock, times(n))` | Asserts interaction count | `never()`, `atLeast(n)`, `atMost(n)` also available |
| `ArgumentCaptor<T>` | Captures argument passed to mock | Use `captor.capture()` in `verify`, then `captor.getValue()` |
| `@MockBean` | Spring-aware Mockito mock | Replaces real bean in Spring context |
| `@WebMvcTest(Ctrl.class)` | Web layer slice | Loads `MockMvc`; use `@MockBean` for services |
| `@DataJpaTest` | JPA repository slice | H2 auto-configured; wraps tests in rolled-back transactions |
| `@JsonTest` | Jackson ObjectMapper slice | Fastest — loads only `JacksonTester` |
| `@SpringBootTest(RANDOM_PORT)` | Full Spring Boot context | Real embedded server; use `TestRestTemplate` |
| `MockMvc.perform(...)` | Dispatches HTTP in-memory | `.andExpect(status().isOk())`, `.andExpect(jsonPath("$.field"))` |
| `WebTestClient.get().uri(...)` | Fluent HTTP client | `.exchange().expectStatus().isOk()` |
| `@WithMockUser` | Injects fake auth into test | From `spring-security-test`; use with `@WebMvcTest` |
| `@Testcontainers` | Activates container lifecycle | Use with `@Container` on static container fields |
| `@Container` | Declares a managed container | `static` = shared per class; instance = per test method |
| `@ServiceConnection` | Auto-registers container config | Spring Boot 3.1+; replaces `@DynamicPropertySource` |

## Learning Path

Suggested reading order for a returning Java developer:

1. [JUnit 5](../testing/junit5.md) — start here; lifecycle annotations, assertions, and parameterized tests underpin everything else
2. [Mockito](../testing/mockito.md) — mock dependencies so tests are fast and isolated; `@Mock`, `@InjectMocks`, `verify`
3. [Spring Boot Test Slices](../testing/spring-boot-test-slices.md) — `@WebMvcTest` and `@DataJpaTest` for fast layer-specific Spring tests
4. [MockMvc & WebTestClient](../testing/mockmvc-webtestclient.md) — HTTP-level controller testing without a real server
5. [Testcontainers](../testing/testcontainers.md) — real Docker databases for accurate integration tests
6. [Integration Tests](../testing/integration-tests.md) — `@SpringBootTest` full-stack tests that combine all of the above

## Top 5 Interview Questions

**Q1: What is the difference between `@Mock` and `@MockBean`?**
**A:** `@Mock` is a plain Mockito annotation used in pure unit tests with `@ExtendWith(MockitoExtension.class)` — it creates a fake object but does not involve Spring. `@MockBean` is a Spring Boot annotation used in slice or integration tests — it creates a Mockito mock AND registers it in the Spring application context, replacing any real bean of that type.

**Q2: What does `@WebMvcTest` load, and why is it faster than `@SpringBootTest`?**
**A:** `@WebMvcTest` loads only the web layer — `DispatcherServlet`, filter chain, the specified `@Controller`, and MockMvc. It does NOT load `@Service`, `@Repository`, or `@Component` beans. Because it skips the full bean scan and datasource initialization, startup is ~1–3 seconds vs 10–30 for `@SpringBootTest`.

**Q3: Why is Testcontainers preferred over H2 for integration tests?**
**A:** H2's SQL dialect differs from PostgreSQL and MySQL — constraints, JSON operations, and database-specific functions behave differently. Tests that pass with H2 can silently miss real bugs that appear in production. Testcontainers starts a real PostgreSQL (or other) Docker container, so your tests use the exact same database engine as production. If the test passes, the production query will too.

**Q4: How do you avoid Spring creating multiple application contexts in a test suite?**
**A:** Spring caches the application context by configuration. If all test classes share the same beans and `@MockBean` declarations, they reuse one cached context (one startup). The most common breaker is `@MockBean` — each unique combination of mocked beans creates a new context. Fix: put all shared `@MockBean` declarations in a common abstract base class that all integration test classes extend.

**Q5: What is `@ServiceConnection` and how does it simplify Testcontainers setup?**
**A:** Introduced in Spring Boot 3.1, `@ServiceConnection` placed on a `@Container` field tells Spring Boot to read the container's connection metadata (JDBC URL, port, username/password) and auto-register them as Spring properties. This replaces the manual `@DynamicPropertySource` static method — reducing setup from 4+ lines to a single annotation.

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [JUnit 5](../testing/junit5.md) | `@Test`, lifecycle annotations, assertions, parameterized tests, and extension model |
| [Mockito](../testing/mockito.md) | `@Mock`, `@InjectMocks`, `when(...).thenReturn(...)`, `verify`, `ArgumentCaptor`, spies |
| [Spring Boot Test Slices](../testing/spring-boot-test-slices.md) | `@WebMvcTest`, `@DataJpaTest`, `@JsonTest` — fast partial-context tests |
| [Integration Tests](../testing/integration-tests.md) | `@SpringBootTest` with `TestRestTemplate`; full-stack context tests |
| [Testcontainers](../testing/testcontainers.md) | Real PostgreSQL, Redis, Kafka in Docker containers during test runs |
| [MockMvc & WebTestClient](../testing/mockmvc-webtestclient.md) | HTTP-level controller testing without a running server |
