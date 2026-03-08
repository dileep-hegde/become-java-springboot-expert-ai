---
id: spring-framework-overview
title: Spring Framework Overview
description: Quick-reference summary of Spring Framework concepts — IoC container, dependency injection, bean lifecycle, scopes, AOP, and events — for rapid revision before interviews.
sidebar_position: 11
tags:
  - spring-framework
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Spring Framework Overview

> Spring Framework is the foundational layer beneath Spring Boot. It provides the IoC container that manages bean lifecycle, dependency injection that wires components together, AOP that handles cross-cutting concerns without modifying business logic, and an event system for decoupled in-process communication. Understanding Spring core makes Spring Boot's auto-configuration predictable and debuggable.

## Key Concepts at a Glance

- **IoC (Inversion of Control)**: the principle that object creation and wiring is delegated to a container rather than done by application code.
- **`ApplicationContext`**: the full-featured IoC container; creates all singleton beans eagerly at startup, publishes events, and supports AOP.
- **`BeanFactory`**: the base container with lazy initialization — not used directly in production apps; use `ApplicationContext`.
- **Bean definition**: the metadata record (class, scope, constructor args, init/destroy methods) that the container uses as a recipe before instantiation.
- **`@ComponentScan`**: directs the container to discover stereotype-annotated classes in the specified package tree.
- **Dependency Injection (DI)**: the mechanism by which the container satisfies a bean's declared dependencies — constructor, setter, or field injection.
- **Constructor injection**: recommended DI style; makes dependencies explicit, allows `final` fields, and enables unit testing without Spring.
- **`@Primary`**: marks one bean as the default when multiple candidates of the same type exist.
- **`@Qualifier`**: selects a specific bean by name at a single injection point.
- **`singleton` scope**: one shared instance per `ApplicationContext`; the default; must be thread-safe.
- **`prototype` scope**: new instance on each `getBean()` call; container does not call `@PreDestroy` on prototypes.
- **`@RequestScope` / `@SessionScope`**: web scopes; Spring injects a CGLIB proxy that routes each call to the real instance for the current HTTP request or session.
- **Scoped proxy** (`proxyMode = ScopedProxyMode.TARGET_CLASS`): allows a singleton to hold a stable reference to a shorter-lived bean; the proxy bridges the scope gap.
- **`@PostConstruct`**: method called after all dependencies are injected — the right place for setup work (open connections, warm caches).
- **`@PreDestroy`**: method called before the container closes — the right place for cleanup (close connections, flush writes).
- **`BeanPostProcessor`**: container extension point; `postProcessAfterInitialization` is where AOP auto-proxy creators replace beans with CGLIB proxies.
- **Aspect**: an `@Aspect`-annotated class that encapsulates a cross-cutting concern (logging, security, transactions).
- **Advice**: the code that runs at a matched join point — `@Before`, `@After`, `@AfterReturning`, `@AfterThrowing`, `@Around`.
- **Pointcut**: an AspectJ expression that matches method signatures; defines *where* advice applies.
- **`@Around` advice**: the most powerful advice — wraps the entire method execution; can prevent the call, modify args/return value, or handle exceptions.
- **Self-invocation trap**: `this.method()` inside a bean bypasses the proxy — no AOP advice fires; always call through a Spring-managed bean.
- **`@EventListener`**: marks a bean method as a synchronous in-process event handler; parameter type determines the event.
- **`@TransactionalEventListener`**: deferred listener that fires only after the enclosing transaction commits (or at another configured phase).
- **`ApplicationEventPublisher`**: injected interface for publishing events; every `ApplicationContext` implements it.

---

## Quick-Reference Table

| Annotation / API | Purpose | Key Notes |
|-----------------|---------|-----------|
| `@Component` / `@Service` / `@Repository` / `@Controller` | Register a class as a Spring bean | All are specialisations of `@Component`; semantic only |
| `@ComponentScan("com.example")` | Scan a package for stereotype annotations | Spring Boot auto-scans from the main class package |
| `@Bean` | Declare a bean via a factory method in a `@Configuration` class | For third-party classes you can't annotate |
| `@Autowired` | Trigger dependency injection on constructor / setter / field | Optional on single-constructor since Spring 4.3 |
| `@Primary` | Default bean when multiple candidates exist | Applied to the implementation, not the consumer |
| `@Qualifier("name")` | Select a specific bean at the injection point | String is the bean name; typos fail at startup |
| `@Scope("prototype")` | New instance on each request | Container does not manage destruction |
| `@RequestScope` | One instance per HTTP request | Backed by a scoped proxy when injected into singletons |
| `@SessionScope` | One instance per HTTP session | Bean must be `Serializable` if sessions are persisted |
| `@PostConstruct` | Init callback after all dependencies injected | Jakarta EE standard; preferred over `InitializingBean` |
| `@PreDestroy` | Destroy callback before container closes | Fires for singletons; never fires for prototypes |
| `@Bean(initMethod, destroyMethod)` | Lifecycle hooks for third-party beans | Auto-detects `close()` / `shutdown()` if unset in Spring Boot |
| `@Aspect` | Marks a class as an AOP aspect | Must also be a Spring bean (`@Component`) |
| `@Pointcut("expression")` | Named reusable pointcut | Composable: `serviceLayer() && !readOnly()` |
| `@Before("pointcut")` | Run advice before matched method | Cannot prevent method execution |
| `@Around("pointcut")` | Wrap matched method; call `proceed()` to delegate | Most powerful; mistake of omitting `proceed()` silences the method |
| `@AfterThrowing(throwing = "ex")` | Run advice when matched method throws | Bind the exception parameter by name |
| `@EventListener` | Handle published application events | Parameter type = event type; supports SpEL `condition` |
| `@TransactionalEventListener(phase = AFTER_COMMIT)` | Handle event after transaction commits | Set `fallbackExecution = true` for non-transactional contexts |
| `ApplicationEventPublisher.publishEvent(event)` | Publish an event to all listeners | Synchronous by default; combine with `@Async` for non-blocking |
| `ObjectProvider<T>` | Lazy-resolve or retrieve new prototype instances | Avoids singleton-into-prototype injection problem |

---

## Learning Path

Suggested reading order for a returning Spring developer:

1. [IoC Container](../spring-framework/ioc-container.md) — start here; the `ApplicationContext`, `@ComponentScan`, and `BeanDefinition` are the foundation everything else plugs into
2. [Dependency Injection](../spring-framework/dependency-injection.md) — the mechanism the container uses to wire beans; understand constructor vs. field injection and `@Primary`/`@Qualifier` before reading further
3. [Bean Lifecycle](../spring-framework/bean-lifecycle.md) — `@PostConstruct`, `@PreDestroy`, and `BeanPostProcessor` complete the picture of how a bean goes from definition to ready to destroyed
4. [Bean Scopes](../spring-framework/bean-scopes.md) — scope interacts with injection; the singleton-into-prototype problem and scoped proxies are commonly tested in interviews
5. [Spring AOP](../spring-framework/spring-aop.md) — once you understand proxies from bean scopes, AOP proxy mechanics and the self-invocation trap make sense
6. [Spring Events](../spring-framework/spring-events.md) — the event system is a natural complement to AOP for decoupled side effects; `@TransactionalEventListener` is heavily used in production

---

## Top 5 Interview Questions

**Q1:** What is the difference between `BeanFactory` and `ApplicationContext`?
**A:** `BeanFactory` is the basic container with lazy bean initialization. `ApplicationContext` extends it and adds eager singleton initialization at startup, event publishing, internationalization, and built-in AOP support. In all production Spring applications, `ApplicationContext` is used — `BeanFactory` is only relevant in resource-constrained embedded contexts.

**Q2:** Why is constructor injection recommended over field injection?
**A:** Constructor injection makes dependencies explicit in the class signature, allows fields to be `final` (immutable bean), and allows unit testing without the Spring container — just call `new MyService(mockDep)`. Field injection hides dependencies, prevents `final`, and requires Spring's reflection machinery to set private fields. IDEs flag field injection with warnings for these reasons.

**Q3:** What is the self-invocation problem in Spring AOP, and how do you fix it?
**A:** Spring AOP wraps beans in a proxy. A call from within the same bean (`this.annotatedMethod()`) bypasses the proxy, so `@Transactional`, `@Cacheable`, and `@Async` annotations on the called method have no effect. The fix is to extract the called method into a separate Spring-managed bean so the call travels through a proxy.

**Q4:** A singleton bean depends on a prototype-scoped bean. What goes wrong, and what are the fixes?
**A:** The singleton is created once, so the prototype is injected once and reused — it effectively becomes a singleton. Fix with `ObjectProvider<T>` (call `.getObject()` per use to get a fresh instance) or a scoped proxy (`@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)`).

**Q5:** What is `@TransactionalEventListener` and when would you use it instead of `@EventListener`?
**A:** `@TransactionalEventListener` defers listener execution until the current transaction commits (or another configured phase). Use it for any side effect — email, push notification, Kafka publish — that must only happen when the database write is permanently committed. `@EventListener` fires immediately and can send a notification for a transaction that later rolls back.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [IoC Container](../spring-framework/ioc-container.md) | `ApplicationContext` vs. `BeanFactory`; `@ComponentScan`; bean definition and registration. |
| [Dependency Injection](../spring-framework/dependency-injection.md) | Constructor vs. setter vs. field injection; `@Qualifier`, `@Primary`, `@Autowired`. |
| [Bean Lifecycle](../spring-framework/bean-lifecycle.md) | `@PostConstruct`, `@PreDestroy`, `InitializingBean`, `DisposableBean`, `BeanPostProcessor`. |
| [Bean Scopes](../spring-framework/bean-scopes.md) | `singleton`, `prototype`, `request`, `session`; scoped proxies; singleton-into-prototype problem. |
| [Spring AOP](../spring-framework/spring-aop.md) | Aspects, pointcuts, advice types; JDK proxy vs. CGLIB; self-invocation trap. |
| [Spring Events](../spring-framework/spring-events.md) | `ApplicationEventPublisher`, `@EventListener`, `@TransactionalEventListener`, async events. |
