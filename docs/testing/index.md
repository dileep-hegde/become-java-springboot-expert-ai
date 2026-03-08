---
id: testing-index
title: Testing
description: Unit testing, integration testing, Testcontainers, Mockito, JUnit 5.
sidebar_position: 1
tags:
  - java
  - spring-boot
  - overview
last_updated: 2026-03-08
---

# Testing

> A Java backend engineer who cannot write good tests is considered junior regardless of other skills. This domain covers the full testing pyramid: fast unit tests with JUnit 5 and Mockito, integration tests with Spring Boot test slices, and realistic end-to-end tests using Testcontainers to spin up real databases in CI.

## What You'll Find Here

| Topic | Description |
|-------|-------------|
| [JUnit 5](./junit5.md) | `@Test`, `@ParameterizedTest`, `@BeforeEach`, lifecycle, assertions, assumptions. |
| [Mockito](./mockito.md) | `@Mock`, `@InjectMocks`, `when(...).thenReturn(...)`, `verify`, `ArgumentCaptor`. |
| [Spring Boot Test Slices](./spring-boot-test-slices.md) | `@WebMvcTest`, `@DataJpaTest`, `@JsonTest` — fast partial-context tests. |
| [Integration Tests](./integration-tests.md) | `@SpringBootTest` with `TestRestTemplate`; full-context tests. |
| [Testcontainers](./testcontainers.md) | Running real PostgreSQL, MySQL, Redis, Kafka in Docker containers during tests. |
| [MockMvc & WebTestClient](./mockmvc-webtestclient.md) | HTTP-level controller testing without a running server. |

## Learning Path

1. **[JUnit 5](./junit5.md)** — the basics (`@Test`, `@BeforeEach`, `assertThrows`) are required before everything else.
2. **[Mockito](./mockito.md)** — `@Mock` stub setup and `verify` interaction testing are the day-to-day tools.
3. **[Spring Boot Test Slices](./spring-boot-test-slices.md)** — `@WebMvcTest` and `@DataJpaTest` for fast, focused Spring tests.
4. **[MockMvc & WebTestClient](./mockmvc-webtestclient.md)** — test Spring MVC controllers without a real server; use with `@WebMvcTest` for speed.
5. **[Testcontainers](./testcontainers.md)** — the current gold standard for integration tests; Docker-based environments that match production.
6. **[Integration Tests](./integration-tests.md)** — `@SpringBootTest` full-stack tests that tie all the above together.

## Quick Revision

- [Testing Overview](../overviews/testing-overview.md) — key concepts, quick-reference table, and top 5 interview questions on one page.
- [Testing Interview Questions](../interview-prep/testing-interview-prep.md) — 20 Q&A questions organized by Beginner / Intermediate / Advanced.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — Spring Boot test slices are the primary testing tool.
- [Databases](../databases/index.md) — Testcontainers integrates with all major databases for realistic integration tests.
- [Docker](../docker/index.md) — Testcontainers uses Docker under the hood.
