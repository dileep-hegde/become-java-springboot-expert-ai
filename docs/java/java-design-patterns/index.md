---
id: java-design-patterns-index
title: Design Patterns
description: Common GoF design patterns expressed with Java examples.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Design Patterns

> Design patterns are reusable solutions to recurring object-oriented design problems. The Gang of Four (GoF) patterns — creational, structural, and behavioral — appear everywhere in Java frameworks and are a staple of senior-level interviews. Spring itself is an application of Factory, Proxy, Template Method, and Observer patterns.

## What You'll Find Here

### Creational Patterns

| Note | Description |
|------|-------------|
| [Singleton](./singleton-pattern.md) | Guarantee one instance per JVM; thread-safe idioms; Enum singleton. |
| [Builder](./builder-pattern.md) | Fluent step-by-step construction of complex objects; Effective Java idiom; Lombok `@Builder`. |
| [Factory Method](./factory-method-pattern.md) | Let subclasses decide which class to instantiate; static factories; Spring `@Bean`. |
| [Abstract Factory](./abstract-factory-pattern.md) | Create families of related objects; Spring `@Profile` as Abstract Factory. |
| [Prototype](./prototype-pattern.md) | Clone existing objects; copy constructors vs `Cloneable`; Spring prototype scope. |

### Structural Patterns

| Note | Description |
|------|-------------|
| [Decorator](./decorator-pattern.md) | Wrap objects to add behaviour dynamically; Java I/O streams; Spring Security filters. |
| [Adapter](./adapter-pattern.md) | Bridge incompatible interfaces; object adapter vs class adapter; Spring legacy integration. |
| [Facade](./facade-pattern.md) | Simplified interface over a complex subsystem; `JdbcTemplate`; `RestTemplate`. |
| [Composite](./composite-pattern.md) | Part-whole tree hierarchy; file system; recursive operations. |
| [Proxy](./proxy-pattern.md) | Control access to an object; JDK dynamic proxy; CGLIB; Spring AOP. |

### Behavioral Patterns

| Note | Description |
|------|-------------|
| [Strategy](./strategy-pattern.md) | Interchangeable algorithms; replace `if/else` chains; Spring DI strategy registry. |
| [Observer](./observer-pattern.md) | Subject notifies observers on state change; Spring `@EventListener`; `@TransactionalEventListener`. |
| [Command](./command-pattern.md) | Encapsulate a request as an object; undo/redo; Spring Batch steps. |
| [Template Method](./template-method-pattern.md) | Algorithm skeleton; override steps in subclasses; `JdbcTemplate`; Spring Security filters. |
| [Chain of Responsibility](./chain-of-responsibility-pattern.md) | Pass request along a handler chain; Spring Security `FilterChainProxy`. |
| [State](./state-pattern.md) | Behaviour changes with internal state; FSM; Spring Statemachine. |

### Demos

| Demo | Covers |
|------|--------|
| [Singleton Demo](./demo/singleton-pattern-demo.md) | Eager, Holder, Enum, thread-safety test, Spring `@Component`. |
| [Proxy Demo](./demo/proxy-pattern-demo.md) | Manual logging/caching proxy, JDK dynamic proxy, Spring `@Cacheable`. |
| [Strategy Demo](./demo/strategy-pattern-demo.md) | Class-based, lambda, Spring `@Qualifier`, Strategy Registry. |
| [Observer Demo](./demo/observer-pattern-demo.md) | Manual, Spring events, `@Async`, `@TransactionalEventListener`, conditional SpEL. |
| [Builder Demo](./demo/builder-pattern-demo.md) | Effective Java Builder, Lombok `@Builder`, Director, Spring `@ConfigurationProperties`. |
| [Factory Method Demo](./demo/factory-method-pattern-demo.md) | Inheritance-based, static factory, lambda factory, Spring `@Bean`. |
| [Adapter Demo](./demo/adapter-pattern-demo.md) | Object adapter, legacy bridge, two-way adapter, Spring `@Profile`. |

## Learning Path

1. **Creational Patterns** — start with Singleton (thread-safe idioms), Builder (used everywhere with `@Builder`), and Factory.
2. **Structural Patterns** — Decorator (Java I/O streams) and Proxy (Spring AOP) are the most Java-relevant.
3. **Behavioral Patterns** — Strategy (replaces `if/else` chains), Observer (Spring events), and Template Method (Spring's `JdbcTemplate`) are must-knows.

## Related Domains

- [Object-Oriented Programming](../oops/index.md) — design patterns are OOP in action; solid OOP knowledge is a prerequisite.
- [Spring Framework](../../spring-framework/index.md) — Spring's internals implement Factory, Proxy, Template Method, and Observer.
- [System Design](../../system-design/index.md) — design patterns at the class level support the architectural patterns at the system level.
