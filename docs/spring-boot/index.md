---
id: spring-boot-index
title: Spring Boot
description: Auto-configuration, starters, beans, DI, AOP, Actuator, and production-ready patterns.
sidebar_position: 1
tags:
  - spring-boot
  - overview
last_updated: 2026-03-07
---

# Spring Boot

> Spring Boot eliminates most Spring Framework boilerplate by providing sensible defaults through auto-configuration. It reads your classpath, detects what you have, and configures beans automatically via `@Conditional` rules. Understanding auto-configuration — not just using it — is what separates developers who can debug Spring Boot from those who can only use it.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Auto-Configuration | `@SpringBootApplication`, `@EnableAutoConfiguration`, `@ConditionalOn*` conditions. |
| Application Properties | `application.yml`, profiles, `@ConfigurationProperties`, `@Value`. |
| Spring Boot Starters | What's in a starter; common starters (`web`, `data-jpa`, `security`, `test`, `actuator`). |
| Actuator | Built-in endpoints (`/health`, `/metrics`); custom health indicators; securing endpoints. |
| Spring Boot Testing | `@SpringBootTest`, test slices (`@WebMvcTest`, `@DataJpaTest`), `@MockBean`. |

## Learning Path

1. **Auto-Configuration** — understanding `@ConditionalOnClass` and `@ConditionalOnMissingBean` demystifies 90% of Boot magic.
2. **Application Properties** — `@ConfigurationProperties` replaces scattered `@Value` for structured config; learn both.
3. **Starters** — know what `spring-boot-starter-web` wires up (Tomcat, Jackson, Spring MVC).
4. **Actuator** — essential for production; understand which endpoints to expose and how to secure them.
5. **Testing** — `@WebMvcTest` and `@DataJpaTest` slices are faster than `@SpringBootTest`; know when to use each.

## Related Domains

- [Spring Framework](../spring-framework/index.md) — Spring Boot runs on top of Spring Framework; understand the foundation first.
- [Web & REST](../web/index.md) — Spring MVC and WebFlux are the web layer wired by `spring-boot-starter-web`.
- [Testing](../testing/index.md) — Spring Boot testing slices and Testcontainers integration are covered there.
