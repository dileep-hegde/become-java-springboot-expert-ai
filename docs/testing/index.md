---
id: testing-index
title: Testing
description: Unit testing, integration testing, Testcontainers, Mockito, JUnit 5.
sidebar_position: 1
tags:
  - java
  - spring-boot
  - overview
last_updated: 2026-03-07
---

# Testing

> A Java backend engineer who cannot write good tests is considered junior regardless of other skills. This domain covers the full testing pyramid: fast unit tests with JUnit 5 and Mockito, integration tests with Spring Boot test slices, and realistic end-to-end tests using Testcontainers to spin up real databases in CI.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| JUnit 5 | `@Test`, `@ParameterizedTest`, `@BeforeEach`, lifecycle, assertions, assumptions. |
| Mockito | `@Mock`, `@InjectMocks`, `when(...).thenReturn(...)`, `verify`, `ArgumentCaptor`. |
| Spring Boot Test Slices | `@WebMvcTest`, `@DataJpaTest`, `@JsonTest` — fast partial-context tests. |
| Integration Tests | `@SpringBootTest` with `TestRestTemplate`; full-context tests. |
| Testcontainers | Running real PostgreSQL, MySQL, Redis, Kafka in Docker containers during tests. |
| MockMvc & WebTestClient | HTTP-level controller testing without a running server. |

## Learning Path

1. **JUnit 5** — the basics (`@Test`, `@BeforeEach`, `assertThrows`) are required before everything else.
2. **Mockito** — `@Mock` stub setup and `verify` interaction testing are the day-to-day tools.
3. **MockMvc** — test Spring MVC controllers without a real server; use with `@WebMvcTest` for speed.
4. **@DataJpaTest** — test repositories with an in-memory H2 database (or Testcontainers for realism).
5. **Testcontainers** — the current gold standard for integration tests; Docker-based environments that match production.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — Spring Boot test slices are the primary testing tool.
- [Databases](../databases/index.md) — Testcontainers integrates with all major databases for realistic integration tests.
- [Docker](../docker/index.md) — Testcontainers uses Docker under the hood.
