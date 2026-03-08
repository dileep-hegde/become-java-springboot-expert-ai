---
id: spring-boot-overview
title: Spring Boot Overview
description: Quick-reference summary of Spring Boot auto-configuration, properties, starters, Actuator, and testing — key concepts, annotations, and interview questions at a glance.
sidebar_position: 12
tags:
  - spring-boot
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Spring Boot Overview

> Spring Boot builds on the Spring Framework to provide an opinionated, production-ready application platform. It auto-configures beans from classpath detection, binds externalized configuration through a layered property source chain, ships production metrics and health checks via Actuator, and provides test slices for fast, focused testing. Understanding the internals — not just the annotations — is what makes you effective when things go wrong.

## Key Concepts at a Glance

- **Auto-Configuration**: Mechanism that reads `AutoConfiguration.imports`, evaluates `@ConditionalOn*` conditions, and wires default beans — only if you haven't already defined your own.
- **`@SpringBootApplication`**: Composed annotation combining `@EnableAutoConfiguration`, `@ComponentScan`, and `@SpringBootConfiguration`.
- **`@ConditionalOnClass`**: Activates a `@Configuration` only if a specific class is present on the classpath.
- **`@ConditionalOnMissingBean`**: Back-off guard — skips auto-config if the user has already defined a bean of the same type.
- **Starter**: A POM-only dependency bundle that brings compatible libraries onto the classpath, triggering auto-configuration conditions.
- **`@ConfigurationProperties`**: Binds a property namespace (`payment.*`) to a typed POJO with IDE auto-complete and startup validation.
- **`@Value`**: Single-property injection supporting `${placeholder}` and SpEL; best for one-off values.
- **Spring Profiles**: Named environments (`dev`, `prod`) that load extra property files and activate profile-specific beans.
- **Actuator**: Module that exposes management endpoints (`/actuator/health`, `/actuator/metrics`) for monitoring and operations.
- **Micrometer**: Metrics facade embedded in Actuator; ships to Prometheus, Datadog, CloudWatch, and others.
- **`@SpringBootTest`**: Loads the full `ApplicationContext`; slow but necessary for true integration tests.
- **`@WebMvcTest`**: Slice that loads only Spring MVC; fast controller tests via `MockMvc`; services must be `@MockBean`.
- **`@DataJpaTest`**: Slice that loads JPA + H2; auto-rollback after each test; repository tests without the web layer.
- **`@MockBean`**: Replaces a real Spring bean with a Mockito mock inside the Spring test context.

---

## Quick-Reference Table

| Annotation / API | Purpose | Key Notes |
|---|---|---|
| `@SpringBootApplication` | Entry point; enables auto-config, component scan, config | Combines 3 annotations |
| `@EnableAutoConfiguration` | Triggers loading of `AutoConfiguration.imports` | Used internally by `@SpringBootApplication` |
| `@ConditionalOnClass` | Gate config on classpath presence | Evaluated before any beans are created |
| `@ConditionalOnMissingBean` | Back-off if user-defined bean exists | Must specify type; order-sensitive |
| `@ConditionalOnProperty` | Gate config on property value | Supports `havingValue` and `matchIfMissing` |
| `@ConfigurationProperties` | Bind property namespace to POJO | Add `@Validated` for startup validation |
| `@Value("${key:default}")` | Inject single property or SpEL expression | Fragile; prefer `@ConfigurationProperties` for groups |
| `spring.profiles.active` | Activate named profiles | Set via env var `SPRING_PROFILES_ACTIVE=prod` |
| `spring.autoconfigure.exclude` | Disable a specific auto-config class | Preferred over `exclude =` code attribute |
| `management.endpoints.web.exposure.include` | Expose Actuator endpoints over HTTP | Default: only `health` |
| `management.server.port` | Run Actuator on separate port | Firewall this port from public in production |
| `management.endpoint.health.show-details` | Control health detail visibility | `when-authorized` in production |
| `@SpringBootTest(webEnvironment=RANDOM_PORT)` | Full integration test on real HTTP port | Use `TestRestTemplate` for HTTP calls |
| `@WebMvcTest(Controller.class)` | MVC slice; loads only the target controller | Fastest HTTP-layer test |
| `@DataJpaTest` | JPA + H2 slice; auto-rollback | Use `@AutoConfigureTestDatabase(replace=NONE)` for real DB |
| `@MockBean` | Replaces bean with Mockito mock in context | Unique mock sets create separate contexts |
| `@SpyBean` | Wraps real bean with Mockito spy | Use when real behavior needed + verification |
| `@TestPropertySource` | Override properties for a specific test class | Finer-grained than `@SpringBootTest(properties=)` |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Auto-Configuration](../spring-boot/auto-configuration.md) — start here; understanding `@ConditionalOnClass` and `@ConditionalOnMissingBean` demystifies 90% of Spring Boot.
2. [Application Properties](../spring-boot/application-properties.md) — learn the property source priority order, profiles, and why `@ConfigurationProperties` beats `@Value`.
3. [Spring Boot Starters](../spring-boot/spring-boot-starters.md) — understand what each common starter wires up and how to swap embedded servers.
4. [Actuator](../spring-boot/actuator.md) — add production visibility; write custom health indicators and export metrics with Micrometer.
5. [Spring Boot Testing](../spring-boot/spring-boot-testing.md) — master `@WebMvcTest`, `@DataJpaTest`, and context caching to build a fast, reliable test suite.

---

## Top 5 Interview Questions

**Q1:** How does Spring Boot auto-configuration work?
**A:** At startup, `AutoConfigurationImportSelector` reads all candidate `@AutoConfiguration` classes from `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`. Each class is guarded by `@ConditionalOn*` annotations — if all conditions pass, the class runs and registers its beans. Conditions that fail are skipped silently. Run with `debug=true` to see the full conditions evaluation report.

**Q2:** What is the difference between `@ConfigurationProperties` and `@Value`?
**A:** `@ConfigurationProperties` binds an entire property namespace to a typed POJO, giving you type safety, IDE auto-complete, and `@Validated` startup validation. `@Value` injects a single property value by string key, which is fragile and hard to refactor. Use `@ConfigurationProperties` for any related group of settings; reserve `@Value` for single values or SpEL expressions.

**Q3:** Why is only the `health` Actuator endpoint exposed by default?
**A:** Security by default — most endpoints expose sensitive data (bean graphs, environment properties with secrets, thread dumps). Spring Boot starts with the minimum safe configuration. You opt in to each additional endpoint via `management.endpoints.web.exposure.include`. In production, run Actuator on a separate management port and secure everything except `health` and `info` behind an `ADMIN` role.

**Q4:** What is the difference between `@WebMvcTest` and `@SpringBootTest`?
**A:** `@WebMvcTest` loads only the Spring MVC layer (controllers, filters, exception handlers) and is very fast. Services and repositories are not loaded — mock them with `@MockBean`. Use it for controller-layer tests. `@SpringBootTest` loads the full `ApplicationContext` with all auto-configurations. It is slower but necessary for integration tests where multiple layers must interact.

**Q5:** How does Spring Boot handle context caching in tests?
**A:** Spring caches the `ApplicationContext` by its configuration fingerprint (annotations, property sources, active profiles, and `@MockBean` types). Tests sharing the same fingerprint reuse the cached context — startup runs once. Adding a unique `@MockBean` creates a new fingerprint and a new context. Managing context reuse is the primary lever for reducing test suite startup time in large projects.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Auto-Configuration](../spring-boot/auto-configuration.md) | How `@ConditionalOn*` conditions wire beans from classpath detection |
| [Application Properties](../spring-boot/application-properties.md) | Property sources, profiles, `@ConfigurationProperties`, and `@Value` |
| [Spring Boot Starters](../spring-boot/spring-boot-starters.md) | Dependency bundles that trigger auto-configuration; common starters explained |
| [Actuator](../spring-boot/actuator.md) | Built-in management endpoints, health indicators, metrics, and Micrometer |
| [Spring Boot Testing](../spring-boot/spring-boot-testing.md) | Test slices, `@MockBean`, `@SpringBootTest`, and Testcontainers |
