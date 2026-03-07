---
id: spring-framework-index
title: Spring Framework
description: Core Spring concepts — IoC container, dependency injection, bean lifecycle, AOP, events.
sidebar_position: 1
tags:
  - spring-framework
  - overview
last_updated: 2026-03-07
---

# Spring Framework

> Spring Framework is the foundational layer beneath Spring Boot. It provides the IoC (Inversion of Control) container that manages bean lifecycle, dependency injection that wires components together, and AOP (Aspect-Oriented Programming) that handles cross-cutting concerns. Understanding Spring core makes Spring Boot's auto-configuration predictable and debuggable.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| IoC Container | `ApplicationContext` vs. `BeanFactory`; `@ComponentScan`; bean definition and registration. |
| Dependency Injection | Constructor vs. field vs. setter injection; `@Qualifier`, `@Primary`, `@Autowired`. |
| Bean Lifecycle | `@PostConstruct`, `@PreDestroy`, `InitializingBean`, `DisposableBean`. |
| Bean Scopes | `singleton`, `prototype`, web scopes (`request`, `session`), scoped proxies. |
| Spring AOP | Aspects, pointcuts, advice types (`@Before`, `@Around`); JDK proxy vs. CGLIB. |
| Spring Events | `ApplicationEventPublisher`, `@EventListener`, async events with `@Async`. |

## Learning Path

1. **IoC Container** — the `ApplicationContext` is the core of everything in Spring; understand it before the rest.
2. **Dependency Injection** — constructor injection is the modern best practice; understand why field injection hurts testability.
3. **Bean Lifecycle** — `@PostConstruct`/`@PreDestroy` hooks appear in nearly every Spring service.
4. **Bean Scopes** — the singleton scope interacts with concurrency; scoped proxies solve the singleton-into-prototype injection problem.
5. **Spring AOP** — understand the proxy model to avoid the self-invocation trap (the same one that breaks `@Transactional`).

## Related Domains

- [Spring Boot](../spring-boot/index.md) — Spring Boot auto-configures the Spring Framework container.
- [Java Annotations](../java/annotations/index.md) — Spring's programming model is annotation-driven.
- [Java Design Patterns](../java/java-design-patterns/index.md) — Spring implements Factory, Proxy, Template Method, and Observer internally.
