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

| Note | Description |
|------|-------------|
| [IoC Container](./ioc-container.md) | `ApplicationContext` vs. `BeanFactory`; `@ComponentScan`; bean definition and registration. |
| [Dependency Injection](./dependency-injection.md) | Constructor vs. field vs. setter injection; `@Qualifier`, `@Primary`, `@Autowired`. |
| [Bean Lifecycle](./bean-lifecycle.md) | `@PostConstruct`, `@PreDestroy`, `InitializingBean`, `DisposableBean`, `BeanPostProcessor`. |
| [Bean Scopes](./bean-scopes.md) | `singleton`, `prototype`, web scopes (`request`, `session`), scoped proxies. |
| [Spring AOP](./spring-aop.md) | Aspects, pointcuts, advice types (`@Before`, `@Around`); JDK proxy vs. CGLIB; self-invocation trap. |
| [Spring Events](./spring-events.md) | `ApplicationEventPublisher`, `@EventListener`, `@TransactionalEventListener`, async events. |

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
