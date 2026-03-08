---
id: java-design-patterns-overview
title: Java Design Patterns Overview
description: Quick-reference summary of all 15 GoF design patterns in Java — participants, intent, Java/Spring examples, and top interview questions.
sidebar_position: 10
tags:
  - java
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Java Design Patterns Overview

> The Gang of Four (GoF) defined 23 design patterns across three categories: **Creational** (how objects are created), **Structural** (how objects are composed), and **Behavioral** (how objects communicate). Java developers encounter a core subset of ~15 of these daily — in the JDK itself (`List.of()`, `InputStream`, `Comparator`), in Spring AOP proxies, in `JdbcTemplate`, and in `@EventListener`. This page gives you a scannable reference for all 15.

## Key Concepts at a Glance

### Creational Patterns

- **Singleton**: Ensures one instance per JVM. Use the Initialization-on-Demand Holder idiom or `enum`. Spring `@Component` beans are singletons by default.
- **Builder**: Separates the construction of a complex object from its representation. Use for objects with many optional fields (`UserProfile.builder()...build()`). Lombok `@Builder` generates the boilerplate.
- **Factory Method**: Defines an interface for creating an object but lets subclasses decide which class to instantiate. Static factory methods (`List.of()`, `Optional.of()`) are the most common Java idiom.
- **Abstract Factory**: Creates families of related objects without specifying concrete classes. Spring `@Profile` with different `@Configuration` classes is the idiomatic Java equivalent.
- **Prototype**: Creates new objects by copying an existing one. Prefer copy constructors over `Cloneable`. Spring `@Scope("prototype")` creates a new bean instance per injection point.

### Structural Patterns

- **Decorator**: Wraps an object to add behavior, implementing the same interface. Java I/O (`BufferedInputStream` wrapping `FileInputStream`) is the textbook example. Spring Security filter chain is a behavioral decorator chain.
- **Adapter**: Converts the interface of a class into another interface clients expect. Use composition (Object Adapter) over inheritance (Class Adapter). `InputStreamReader` adapts `InputStream` → `Reader`.
- **Facade**: Provides a simplified interface to a complex subsystem. `JdbcTemplate`, `RestTemplate`, and `RedisTemplate` are Facades over low-level connection/transaction boilerplate.
- **Composite**: Composes objects into tree structures representing part-whole hierarchies. Used for file systems, UI component trees, and Spring Security `CompositeAuthorizationManager`.
- **Proxy**: Provides a surrogate that controls access to another object. JDK dynamic proxy requires an interface; CGLIB proxies concrete classes. Spring AOP uses proxies for `@Transactional`, `@Cacheable`, and `@Async`.

### Behavioral Patterns

- **Strategy**: Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Replaces `if/else` chains. `Comparator` is the canonical JDK Strategy. Inject via Spring `@Qualifier` or a `Map<String, Strategy>` registry.
- **Observer**: When one object's state changes, all dependents are notified. Spring `ApplicationEventPublisher` + `@EventListener` is the idiomatic implementation. `@TransactionalEventListener(AFTER_COMMIT)` fires after the DB transaction commits.
- **Command**: Encapsulates a request as an object, enabling undo/redo, queuing, and logging. `Runnable`/`Callable` are built-in Command interfaces. Spring Batch `Step` is a Command.
- **Template Method**: Defines the skeleton of an algorithm in a base class, deferring some steps to subclasses. `JdbcTemplate.query()` uses this via callback (you supply the `RowMapper`; `JdbcTemplate` owns the connection lifecycle).
- **Chain of Responsibility**: Passes a request along a chain of handlers until one handles it. Spring Security's `FilterChainProxy` is the canonical Java example. Logger hierarchy in `java.util.logging` is another.
- **State**: Allows an object to alter its behavior when its internal state changes. Models FSMs (e.g., Order lifecycle: Pending → Paid → Shipped). Spring Statemachine provides a production-ready implementation.

---

## Quick-Reference Table

| Pattern | Category | Participants | Java / Spring Example |
|---------|----------|--------------|----------------------|
| Singleton | Creational | `Instance` | `enum` singleton; Spring scoped beans |
| Builder | Creational | `Product`, `Builder`, `Director` | Lombok `@Builder`; `StringBuilder` |
| Factory Method | Creational | `Creator`, `Product` | `List.of()`, `Optional.of()`, Spring `@Bean` |
| Abstract Factory | Creational | `AbstractFactory`, product families | Spring `@Profile` configuration classes |
| Prototype | Creational | `Prototype`, `Client` | Copy constructor; Spring `@Scope("prototype")` |
| Decorator | Structural | `Component`, `ConcreteDecorator` | `BufferedInputStream`; Spring Security filters |
| Adapter | Structural | `Target`, `Adaptee`, `Adapter` | `InputStreamReader`; Feign client wrappers |
| Facade | Structural | `Facade`, subsystem classes | `JdbcTemplate`, `RestTemplate` |
| Composite | Structural | `Component`, `Leaf`, `Composite` | File system; `CompositeAuthorizationManager` |
| Proxy | Structural | `Subject`, `RealSubject`, `Proxy` | `java.lang.reflect.Proxy`; Spring AOP |
| Strategy | Behavioral | `Context`, `Strategy` | `Comparator`; Spring `@Qualifier` strategies |
| Observer | Behavioral | `Subject`, `Observer` | `@EventListener`; `@TransactionalEventListener` |
| Command | Behavioral | `Command`, `Invoker`, `Receiver` | `Runnable`; Spring Batch `Step` |
| Template Method | Behavioral | `AbstractClass`, `ConcreteClass` | `JdbcTemplate.query(RowMapper)` |
| Chain of Responsibility | Behavioral | `Handler`, chain | Spring Security `FilterChainProxy` |
| State | Behavioral | `Context`, `State`, concrete states | Order FSM; Spring Statemachine |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Singleton Pattern](../java/java-design-patterns/singleton-pattern.md) — foundational creational pattern; understand thread-safety idioms before all others
2. [Builder Pattern](../java/java-design-patterns/builder-pattern.md) — used constantly in modern Java (Lombok, records, DTOs)
3. [Factory Method Pattern](../java/java-design-patterns/factory-method-pattern.md) — powers Spring `@Bean` and half the JDK API; understand static factory names
4. [Proxy Pattern](../java/java-design-patterns/proxy-pattern.md) — essential for understanding Spring AOP, `@Transactional`, and `@Cacheable`
5. [Decorator Pattern](../java/java-design-patterns/decorator-pattern.md) — once Proxy is clear, Decorator reinforces the wrapper idiom with a different intent
6. [Strategy Pattern](../java/java-design-patterns/strategy-pattern.md) — the most practically useful behavioral pattern; replaces conditionals in business logic
7. [Observer Pattern](../java/java-design-patterns/observer-pattern.md) — Spring Events system; crucial for decoupled async workflows
8. [Template Method Pattern](../java/java-design-patterns/template-method-pattern.md) — explains why `JdbcTemplate`, `RestTemplate`, and all Spring `*Template` classes are designed the way they are
9. [Adapter Pattern](../java/java-design-patterns/adapter-pattern.md) — integration patterns; wrapping third-party SDKs
10. [Chain of Responsibility Pattern](../java/java-design-patterns/chain-of-responsibility-pattern.md) — completes the picture of Spring Security's filter pipeline

---

## Top 5 Interview Questions

**Q1: What is the difference between Proxy and Decorator? They look structurally identical.**
**A:** Structurally they are identical — both wrap an object implementing the same interface. The difference is *intent*. A Decorator adds new behavior or enhances the object's capabilities (e.g., adding buffering to a stream). A Proxy controls *access* to the object — it can add authorization checks, lazy initialization, caching, or remote access without changing what the object *does*. In practice, Spring's AOP proxies often blur this line by both enhancing (caching) and controlling (security) access.

**Q2: Why does calling a `@Transactional` method from the same class not start a transaction?**
**A:** Spring implements `@Transactional` via a proxy — when an external caller calls `service.save()`, they call the proxy, which opens a transaction and then delegates to the real bean. However, when `save()` calls `this.internalMethod()`, `this` refers to the *real bean object*, not the proxy. The proxy is bypassed, so no transaction is started. The fix is to self-inject the bean (or restructure so the `@Transactional` method is called from outside the class).

**Q3: When would you choose Factory Method over Abstract Factory?**
**A:** Factory Method creates a *single* product and lets subclasses decide the concrete type — it is about one class hierarchy (`Notification → EmailNotification`). Abstract Factory creates *families* of related products — it is about coordinating multiple class hierarchies (e.g., a `ThemeFactory` that produces a matching `Button`, `TextField`, and `ScrollBar` all in the same style). If your problem is "which one implementation of this interface?", use Factory Method. If your problem is "which consistent set of related implementations?", use Abstract Factory.

**Q4: What is the Strategy pattern and how does Spring's dependency injection enable it?**
**A:** Strategy defines a family of interchangeable algorithms behind a common interface, selecting one at runtime without changing the client. In Spring, you implement each algorithm as a `@Component` and inject the desired one via `@Qualifier`, profiles, or a `Map<String, Strategy>` registry. The context class (e.g., `OrderService`) depends on the `ShippingCalculator` interface and never imports a concrete class — Spring's DI wires in whichever strategy the configuration dictates.

**Q5: What is the Template Method pattern and how does `JdbcTemplate` apply it without inheritance?**
**A:** Template Method defines the skeleton of an algorithm in a base class — some steps are fixed (common to all callers) and some are abstract (overridden by subclasses). `JdbcTemplate` applies the pattern via *callbacks* instead of inheritance: the fixed steps are: acquire connection → create `PreparedStatement` → bind parameters → execute → close everything (even on exception). The varying step — what to do with each row — is passed in as a `RowMapper` lambda. You provide the mapping logic; `JdbcTemplate` owns the lifecycle. This is the modern, functional style of Template Method — no subclassing required.

---

## All Notes in This Domain

| Note | Category | Description |
|------|----------|-------------|
| [Singleton Pattern](../java/java-design-patterns/singleton-pattern.md) | Creational | Thread-safe single-instance idioms: Holder, Enum, Spring `@Component`. |
| [Builder Pattern](../java/java-design-patterns/builder-pattern.md) | Creational | Fluent construction; Effective Java idiom; Lombok `@Builder`; Director. |
| [Factory Method Pattern](../java/java-design-patterns/factory-method-pattern.md) | Creational | Subclass-driven creation; static factories; Spring `@Bean` factory methods. |
| [Abstract Factory Pattern](../java/java-design-patterns/abstract-factory-pattern.md) | Creational | Families of related objects; Spring `@Profile` as factory family. |
| [Prototype Pattern](../java/java-design-patterns/prototype-pattern.md) | Creational | Clone via copy constructor; Spring prototype scope; registry pattern. |
| [Decorator Pattern](../java/java-design-patterns/decorator-pattern.md) | Structural | Wrap to add behavior; Java I/O; Spring Security filter chain. |
| [Adapter Pattern](../java/java-design-patterns/adapter-pattern.md) | Structural | Bridge incompatible interfaces; object vs class adapter; legacy integration. |
| [Facade Pattern](../java/java-design-patterns/facade-pattern.md) | Structural | Simplified subsystem interface; `JdbcTemplate`; `RestTemplate`. |
| [Composite Pattern](../java/java-design-patterns/composite-pattern.md) | Structural | Part-whole trees; file systems; recursive operations. |
| [Proxy Pattern](../java/java-design-patterns/proxy-pattern.md) | Structural | Control access; JDK dynamic proxy; CGLIB; Spring AOP. |
| [Strategy Pattern](../java/java-design-patterns/strategy-pattern.md) | Behavioral | Interchangeable algorithms; `Comparator`; Spring DI registry. |
| [Observer Pattern](../java/java-design-patterns/observer-pattern.md) | Behavioral | Notify on state change; Spring events; `@TransactionalEventListener`. |
| [Command Pattern](../java/java-design-patterns/command-pattern.md) | Behavioral | Request as object; undo/redo; `Runnable`; Spring Batch. |
| [Template Method Pattern](../java/java-design-patterns/template-method-pattern.md) | Behavioral | Algorithm skeleton; `JdbcTemplate` callback; Spring Security filters. |
| [Chain of Responsibility Pattern](../java/java-design-patterns/chain-of-responsibility-pattern.md) | Behavioral | Handler chain; Spring Security `FilterChainProxy`. |
| [State Pattern](../java/java-design-patterns/state-pattern.md) | Behavioral | FSM; Order lifecycle; Spring Statemachine. |
