---
id: spring-framework-interview-prep
title: Spring Framework Interview Questions
description: Consolidated interview Q&A for Spring Framework covering IoC container, dependency injection, bean lifecycle, bean scopes, AOP, and Spring Events — beginner through advanced.
sidebar_position: 11
tags:
  - interview-prep
  - spring-framework
  - intermediate
  - advanced
last_updated: 2026-03-08
---

# Spring Framework Interview Questions

> Consolidated Q&A for Spring Framework. Use for rapid revision before backend interviews.

## How to Use This Page

- Skim **Beginner** questions to confirm you have no gaps in the fundamentals
- **Intermediate** questions are the core target for 3–5 YOE Spring roles
- **Advanced** questions test senior depth — proxy internals, scope edge cases, transactional event patterns

---

## Beginner

### Q: What is the IoC container in Spring?

The IoC (Inversion of Control) container is the runtime component that reads bean definitions, instantiates all application objects, injects their dependencies, and manages their lifecycle. Instead of your code calling `new`, the container assembles the entire object graph and delivers the right instance to the right place at startup. `ApplicationContext` is the central interface representing the container.

### Q: What is Dependency Injection and why does Spring use it?

Dependency Injection means a class receives its collaborators from an external source rather than creating them itself. Spring uses it to decouple classes from concrete implementations, making them easier to test (swap in mocks), easier to reconfigure (swap implementations without touching source code), and easier to manage (the container owns object creation and destruction).

### Q: What are the three types of dependency injection in Spring?

Constructor injection (dependencies passed as constructor parameters — recommended), setter injection (`@Autowired` on a setter method — for optional dependencies), and field injection (`@Autowired` directly on a field — convenient but avoid in production). Constructor injection is the official Spring recommendation since Spring 5.

### Q: What is the default bean scope in Spring?

`singleton` — one instance per `ApplicationContext`. The container creates it at startup and returns the same reference to every injection point and `getBean()` call. All other scopes (`prototype`, `request`, `session`) must be declared explicitly.

### Q: What is the difference between `@Component`, `@Service`, `@Repository`, and `@Controller`?

All four are specialisations of `@Component` and have identical Spring behaviour: they mark a class for component scan and bean registration. The difference is semantic — `@Service` signals business logic, `@Repository` signals data access (and enables Spring's exception translation for database exceptions), `@Controller` signals an MVC controller. Use the specific annotation that matches the role of the class.

### Q: What does `@PostConstruct` do?

`@PostConstruct` marks a method to be called by the container after all dependencies are injected but before the bean is made available for use. It is the right place to open connections, warm a cache, or validate configuration — any setup that requires injected collaborators to already be present.

---

## Intermediate

### Q: What is the difference between `BeanFactory` and `ApplicationContext`?

`BeanFactory` is the basic container that instantiates beans lazily on first `getBean()` call. `ApplicationContext` extends it and adds eager singleton initialization at startup, event publishing (`ApplicationEventPublisher`), internationalization (`MessageSource`), and built-in AOP integration. In every production Spring application you use `ApplicationContext` — `BeanFactory` is only relevant in embedded or extremely resource-constrained environments.

### Q: Why is constructor injection preferred over field injection?

Constructor injection makes dependencies explicit in the class signature, allows fields to be `final` (making the bean immutable after construction), and enables testing without the Spring container — you simply call `new MyService(mockDep)`. Field injection requires Spring's reflective machinery to set private fields, hides dependencies from the caller, and prevents `final` fields. IDEs like IntelliJ flag `@Autowired` field injection with a warning for these reasons.

### Q: How does Spring resolve which bean to inject when multiple implementations of an interface exist?

Spring first matches by type. If multiple candidates match, it checks whether one is marked `@Primary` (the default). If not, it falls back to name-matching the field or parameter name against bean names. If `@Qualifier("beanName")` is present at the injection point, it uses that name directly. If no single candidate can be identified, startup fails with `NoUniqueBeanDefinitionException`.

### Q: What is the full lifecycle of a Spring singleton bean?

Constructor → property/field injection → Aware interface callbacks (e.g., `BeanNameAware`) → `BeanPostProcessor.postProcessBeforeInitialization` → `@PostConstruct` → `InitializingBean.afterPropertiesSet()` → `@Bean(initMethod)` → `BeanPostProcessor.postProcessAfterInitialization` → bean ready for use → (shutdown) `@PreDestroy` → `DisposableBean.destroy()` → `@Bean(destroyMethod)`.

### Q: What is the singleton-into-prototype injection problem, and how do you fix it?

A singleton is created once, so its constructor or injection point runs once. If a prototype-scoped bean is injected into a singleton, the same prototype instance is reused for the singleton's entire lifetime — defeating the purpose of prototype scope. Fix with `ObjectProvider<T>` (call `.getObject()` per use) or a scoped proxy (`@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)`).

### Q: What is the self-invocation trap in Spring AOP?

Spring AOP is proxy-based. When bean A's method internally calls `this.anotherMethod()`, the call bypasses the proxy and any AOP advice on `anotherMethod()` (e.g., `@Transactional`, `@Cacheable`, `@Async`) has no effect. The fix is to extract the callee into a separate Spring-managed bean so the call travels through a proxy.

### Q: What is the difference between `@EventListener` and `@TransactionalEventListener`?

`@EventListener` fires synchronously as soon as `publishEvent()` is called, regardless of transaction state. `@TransactionalEventListener` defers listener execution until the current transaction reaches a specified phase (default `AFTER_COMMIT`). Use `@TransactionalEventListener` for any side effect (email, Kafka publish, external API call) that must only happen when the database write is permanently committed — preventing the case where a notification is sent for a transaction that later rolls back.

---

## Advanced

### Q: How does Spring AOP decide whether to use a JDK dynamic proxy or CGLIB?

If `spring.aop.proxy-target-class=true` (the Spring Boot default), CGLIB is always used, generating a subclass of the target class. If `proxyTargetClass=false`, Spring uses a JDK dynamic proxy when the target implements at least one interface and falls back to CGLIB otherwise. JDK proxy requires interfaces; CGLIB works on any concrete class. Spring Boot's default of CGLIB eliminates the "must implement an interface" requirement.

```java
// Controlled explicitly on @EnableAspectJAutoProxy:
@EnableAspectJAutoProxy(proxyTargetClass = true)  // ← force CGLIB
public class AopConfig {}
```

### Q: How does `BeanPostProcessor` work, and how does Spring use it internally?

`BeanPostProcessor` is a container extension point whose `postProcessBeforeInitialization` and `postProcessAfterInitialization` methods are called for every bean after dependency injection. Spring uses it heavily: `AutowiredAnnotationBeanPostProcessor` drives `@Autowired`, `CommonAnnotationBeanPostProcessor` handles `@PostConstruct`/`@PreDestroy`, and AOP auto-proxy creators return a CGLIB proxy instead of the original bean from `postProcessAfterInitialization`. Any registered `BeanPostProcessor` can replace a bean with a proxy transparently — this is the entire basis of Spring AOP.

**Follow-up:** What happens if you return `null` from a `BeanPostProcessor`?
**A:** Returning `null` causes a `NullPointerException` or silent bean removal depending on Spring version. You must always return the `bean` argument (or a valid proxy of it) — never `null`.

### Q: What is a `BeanDefinition` and where is it used?

A `BeanDefinition` is the metadata record the container creates for each candidate bean before instantiation. It stores the class name, scope, constructor argument values, property values, lazy-init flag, and init/destroy method names. The container uses it as a recipe when `getBean()` is called. You can manipulate bean definitions programmatically with `BeanDefinitionRegistryPostProcessor` to dynamically register or modify beans at startup — before any instances are created.

### Q: Why doesn't `@PreDestroy` fire on prototype-scoped beans?

The container creates a prototype bean on demand and hands it to the requester but does not retain a reference afterward. Without a reference, it cannot invoke lifecycle callbacks at shutdown. The responsibility for cleanup shifts to the requesting code. If you need controlled destruction, call `ObjectProvider.destroy(instance)` or manage cleanup manually with a `try-with-resources`-style pattern.

### Q: A `@TransactionalEventListener` is not firing in a test. What are the likely causes?

1. The test method is annotated `@Transactional` — the default test behaviour is to roll back after each test, so `AFTER_COMMIT` never triggers. Add `@Commit` or use `@TestTransaction` with an explicit commit.
2. The event is published outside a transaction — by default `@TransactionalEventListener` is skipped if no active transaction exists. Set `fallbackExecution = true` on the annotation.
3. The listener is `@Async` — the test thread may finish before the async thread runs. Use `@DirtiesContext` or an `Awaitility` assertion to wait.

### Q: How would you guarantee at-least-once delivery of a side effect if the application crashes between commit and listener execution?

The Spring event system is in-process and in-memory — it provides no durability across JVM crashes. For at-least-once delivery, apply the **transactional outbox pattern**: write the event payload to an `outbox` table in the same transaction as the business data. A separate poller or CDC tool (Debezium) reads the outbox and publishes to a durable message broker (Kafka, RabbitMQ), which provides delivery guarantees independent of JVM lifecycle.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| `ApplicationContext` | The IoC container — creates, wires, and manages bean lifecycle |
| `BeanFactory` | Simplified container with lazy initialization — use `ApplicationContext` in production |
| Constructor injection | Recommended DI style — explicit, `final`-friendly, testable without Spring |
| `@Primary` | Marks one bean as the default when multiple implementations match a type |
| `@Qualifier` | Selects a specific bean by name at the injection point |
| `singleton` scope | One shared instance per `ApplicationContext` — must be thread-safe |
| `prototype` scope | New instance on each `getBean()` — container does not call `@PreDestroy` |
| `@RequestScope` / `@SessionScope` | Web scopes — injected into singletons via a CGLIB proxy |
| `@PostConstruct` | Runs after all dependencies injected — right place for setup work |
| `@PreDestroy` | Runs before container closes — right place for resource cleanup |
| `BeanPostProcessor` | Container extension point for wrapping beans (AOP proxy creation) |
| Self-invocation trap | `this.method()` bypasses the proxy — no AOP advice fires |
| `@EventListener` | Synchronous in-process event handler — fires immediately on `publishEvent()` |
| `@TransactionalEventListener` | Deferred listener — fires only after transaction commits |
| Scoped proxy | `proxyMode = TARGET_CLASS` — lets a singleton hold a reference to a shorter-scoped bean |

## Related Interview Prep

- [Java Design Patterns Q&A](./java-design-patterns-interview-prep.md) — Spring implements Proxy, Factory, Template Method, and Observer; pattern knowledge deepens AOP and IoC answers
- [Multithreading Interview Q&A](./multithreading-interview-prep.md) — singleton scope and thread safety are closely related; concurrency questions appear in Spring context too
