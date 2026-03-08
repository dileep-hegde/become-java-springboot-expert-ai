---
id: java-design-patterns-interview-prep
title: Java Design Patterns Interview Questions
description: Consolidated interview Q&A for GoF design patterns in Java — creational, structural, and behavioral — covering beginner through advanced topics.
sidebar_position: 10
tags:
  - interview-prep
  - java
  - design-patterns
  - beginner
  - intermediate
  - advanced
last_updated: 2026-03-08
---

# Java Design Patterns Interview Questions

> Consolidated Q&A for GoF design patterns in Java. Use for rapid revision before backend interviews, covering all 15 patterns across Creational, Structural, and Behavioral categories.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles (3–5 YOE)
- **Advanced** questions signal senior-level depth (5+ YOE) and are typical at staff/tech-lead level

---

## Beginner

### Q: What is a design pattern? Why do we use them?

A design pattern is a reusable solution to a recurring object-oriented design problem. Patterns are not libraries or copy-paste code — they are templates describing how to structure classes and their relationships. We use them to communicate intent clearly (saying "use a Strategy here" conveys the entire structure), avoid reinventing solutions, and produce code that is easier to extend without modifying existing classes.

---

### Q: What are the three GoF pattern categories?

**Creational** patterns deal with object creation — they abstract the instantiation process so the system doesn't depend on how objects are created (Singleton, Builder, Factory Method, Abstract Factory, Prototype). **Structural** patterns deal with object composition — how classes and objects are assembled into larger structures (Decorator, Adapter, Facade, Composite, Proxy). **Behavioral** patterns deal with communication between objects — who is responsible for what and how responsibilities flow (Strategy, Observer, Command, Template Method, Chain of Responsibility, State).

---

### Q: What is the Singleton pattern and when should you use it?

Singleton ensures a class has exactly one instance and provides global access to it. Use it for stateless utility services, connection pools, configuration registries, and thread-pool executors — anything that must exist exactly once per application. In Spring, every `@Component` bean is a singleton by default; you rarely need to hand-code a Singleton. When you do, prefer the **Initialization-on-Demand Holder** idiom or an `enum` — both are thread-safe and concise.

---

### Q: What is the Builder pattern and when should you use it?

Builder separates the construction of a complex object from its representation by providing a step-by-step fluent interface. Use it when a class has more than 4–5 parameters (especially optional ones), when you want immutable objects, or when the same construction steps can produce different representations. The Effective Java Builder (static inner `Builder` class with a private constructor on the product) is the canonical Java idiom. Lombok `@Builder` generates this boilerplate automatically.

---

### Q: What is the difference between Factory Method and Abstract Factory?

**Factory Method** creates a **single product** — a base class defines the creation method and subclasses override it to return a specific concrete type. **Abstract Factory** creates **families of related products** — an interface declares factory methods for each product type in the family, and concrete factories implement all methods consistently. Use Factory Method when you have one product hierarchy; use Abstract Factory when multiple related products must be used together (e.g., UI widgets: `Button`, `TextField`, `Dialog` all in the same theme).

---

### Q: What is the Decorator pattern? Give a Java example.

Decorator dynamically adds behavior to an object by wrapping it in another object that implements the same interface. The wrapper delegates to the wrapped object and adds pre/post logic. The canonical Java example is the `java.io` package — `FileInputStream` reads bytes, `BufferedInputStream` wraps it to add buffering, and `GZIPInputStream` wraps that to add decompression. You can nest decorators arbitrarily without changing the decorated class.

---

### Q: What is the Adapter pattern?

Adapter makes two incompatible interfaces work together. An Adapter class implements the target interface expected by the client, internally holds an instance of the adaptee (the incompatible class), and translates calls between the two. `java.io.InputStreamReader` is a classic example — it adapts `InputStream` (byte-oriented) to `Reader` (character-oriented). Object Adapter (via composition) is preferred over Class Adapter (via inheritance) for flexibility.

---

### Q: What is the Strategy pattern?

Strategy defines a family of interchangeable algorithms behind a common interface. The context class depends on the interface (not a concrete class), and the algorithm is injected or set at runtime. This replaces `if/else` or `switch` chains that select behavior based on type. `java.util.Comparator` is the most common JDK example — you pass any comparison strategy to `List.sort()` without modifying the `List`.

---

## Intermediate

### Q: What is the Proxy pattern and what are its sub-types?

Proxy provides a surrogate object that controls access to another object. Both the proxy and the real object implement the same interface, so callers are unaware they are talking to a proxy. Sub-types: **Virtual Proxy** — defers expensive creation (Hibernate lazy loading); **Protection Proxy** — adds authorization checks before delegating; **Caching Proxy** — caches results of expensive calls; **Remote Proxy** — represents an object on another machine (RMI stubs, Feign clients).

---

### Q: How does Spring use the Proxy pattern for `@Transactional`?

When a bean method is annotated `@Transactional`, Spring wraps the bean in a proxy at application startup — either a JDK dynamic proxy (if the bean implements an interface) or a CGLIB subclass proxy. When an external caller invokes the method, the proxy intercepts the call, begins a transaction via `PlatformTransactionManager`, then invokes the real method. After the method returns (or throws), the proxy commits or rolls back the transaction. The real bean class never contains transaction management code.

---

### Q: Why does `this.method()` bypass Spring's `@Transactional`/`@Cacheable` proxies?

Spring proxies intercept calls that arrive *through the proxy reference* (i.e., the bean reference injected into other components). When `serviceA.methodA()` internally calls `this.methodB()`, `this` refers to the real bean object — not the proxy wrapping it. The proxy is never involved, so any advice (`@Transactional`, `@Cacheable`) on `methodB` is not triggered. Solutions: refactor `methodB` into a separate bean, or self-inject the proxy reference using `@Autowired` on a field of the same type.

---

### Q: What is the Observer pattern? How does Spring implement it?

Observer defines a one-to-many dependency: when a Subject changes state, all registered Observers are notified automatically. Spring's implementation uses `ApplicationEventPublisher` to publish events and `@EventListener` methods to consume them — publishers and listeners are fully decoupled; neither imports the other. For async handling, add `@Async` to the listener. For side effects that must only fire after a DB commit (e.g., sending an email), use `@TransactionalEventListener(phase = AFTER_COMMIT)`.

---

### Q: What is the Template Method pattern? How does `JdbcTemplate` apply it?

Template Method defines the skeleton of an algorithm in a base class, with fixed steps that never change and abstract steps that subclasses override. `JdbcTemplate` applies the pattern via callbacks rather than inheritance: it owns the fixed steps (acquire connection, create `PreparedStatement`, bind parameters, execute, close resources). The varying step — what to do with each result row — is your `RowMapper` lambda. This is the functional variant of Template Method: no subclassing, just pass the varying logic in as a function.

---

### Q: What is the Chain of Responsibility pattern? How does Spring Security use it?

Chain of Responsibility passes a request along a chain of handlers. Each handler decides whether to process the request, partially handle it, or pass it to the next handler. Spring Security's `FilterChainProxy` is a textbook example — HTTP requests pass through an ordered chain of `SecurityFilter` implementations (CSRF, session management, authentication, authorization). Each filter can short-circuit the chain (e.g., return 401) or call `chain.doFilter()` to continue. Filters are configured as an ordered list and can be added/removed without changing each other.

---

### Q: What is the Command pattern? Where does it appear in Java?

Command encapsulates a request as an object — it has a known interface (`execute()`) that hides who handles the request and how. This enables queuing, logging, and undo/redo. In Java: `java.lang.Runnable` and `java.util.concurrent.Callable` are built-in Command interfaces — they encapsulate tasks submitted to thread pools or schedulers. Spring Batch models pipeline steps as `Step` objects (Commands) that can be composed, retried, and audited. For undo/redo, maintain a stack of executed commands and call `undo()` on the head.

---

### Q: When would you choose Composite over individual object handling?

Use Composite when you have a part-whole hierarchy and want clients to treat individual objects and compositions uniformly. The key signal is *recursive structure* — a folder contains files and other folders; a UI group contains widgets and other groups; an authorization rule contains individual rules and rule groups. With Composite, a single `execute()` or `calculate()` call on the root traverses the entire tree recursively without the client knowing whether it is dealing with a leaf or a composite node.

---

### Q: What is the Facade pattern? How does it differ from Adapter?

Facade provides a simplified, higher-level interface to a complex subsystem — it hides internal complexity from the client. Adapter converts one existing interface into another that clients already expect — it solves an incompatibility problem. A key distinction: you design a Facade for a subsystem you own; you write an Adapter for a third-party or legacy interface you cannot change. `JdbcTemplate` is a Facade over raw JDBC boilerplate. `InputStreamReader` is an Adapter bridging `InputStream` and `Reader`.

---

## Advanced

### Q: Compare JDK dynamic proxy and CGLIB proxy. When does Spring use each?

**JDK dynamic proxy** requires the target bean to implement at least one interface. It creates a proxy that implements the same interfaces, intercepting calls via `InvocationHandler`. **CGLIB** generates a subclass of the target class at runtime — it works on any class, even without interfaces, but the class and proxied methods must not be `final`. Spring defaults to CGLIB for `@Service`/`@Repository` beans (changed in Spring Boot 2.x from JDK proxy default), because concrete classes without interfaces are common in practice. Force JDK proxy with `@EnableAspectJAutoProxy(proxyTargetClass = false)` when you always program to interfaces.

**Follow-up:** What happens if a Spring-managed class is declared `final`?
**A:** CGLIB cannot subclass a `final` class, so any aspect (`@Transactional`, `@Cacheable`, `@Async`, custom AOP) silently fails to apply at bean creation time, or Spring throws an error depending on configuration. Never declare Spring-managed service/repository classes `final` unless you explicitly want to prevent proxying.

---

### Q: How would you implement a thread-safe Singleton without `synchronized` on `getInstance()`?

Use the **Initialization-on-Demand Holder** idiom:

```java
public final class AppConfig {
    private AppConfig() {}

    private static final class Holder {
        static final AppConfig INSTANCE = new AppConfig(); // ← JVM class-loading guarantees this runs once
    }

    public static AppConfig getInstance() {
        return Holder.INSTANCE; // ← no synchronization needed; JVM ensures class init is thread-safe
    }
}
```

The JVM guarantees that a class is initialized exactly once, in a thread-safe way, the first time it is actively used. `Holder` is only loaded when `getInstance()` is first called — giving lazy initialization for free, with no synchronization overhead on subsequent calls. The alternative — `enum` — is equivalent and also handles serialization and reflection attacks.

---

### Q: How would you design a Strategy Registry to select a strategy dynamically at runtime?

Inject all `Strategy` beans into a `Map<String, Strategy>` via Spring's map-injection:

```java
@Service
public class PaymentService {

    private final Map<String, PaymentStrategy> strategies; // ← Spring injects: key = bean name

    public PaymentService(Map<String, PaymentStrategy> strategies) {
        this.strategies = strategies;
    }

    public void pay(String method, Order order) {
        PaymentStrategy strategy = strategies.get(method + "PaymentStrategy");
        if (strategy == null) throw new IllegalArgumentException("Unknown method: " + method);
        strategy.charge(order);
    }
}
```

Spring automatically populates the map with all beans implementing `PaymentStrategy`, keyed by bean name. Adding a new payment method requires only a new `@Component` class — no changes to `PaymentService`. This is Open/Closed Principle applied with Spring DI.

---

### Q: Explain the difference between State and Strategy. They look similar in code.

Structurally, State and Strategy are nearly identical — both use a context + interchangeable objects implementing a common interface. **Intent differs critically**: Strategy is selected *externally* by the client before or during use, and strategies are independent of each other. State is *internal* to the context — the context transitions itself from one state to another as events occur, and states often know about each other (a `PendingOrderState` knows it can transition to `PaidOrderState`). If the "algorithm" changes because *the caller chose a different one*, it is Strategy. If the "behavior" changes because *the object's internal lifecycle advanced*, it is State.

---

### Q: How would you implement full undo/redo using the Command pattern?

```java
public interface TextCommand {
    void execute();
    void undo();
}

public class TextEditor {
    private final Deque<TextCommand> history = new ArrayDeque<>();
    private final Deque<TextCommand> redoStack = new ArrayDeque<>();

    public void execute(TextCommand cmd) {
        cmd.execute();
        history.push(cmd);    // ← record for undo
        redoStack.clear();    // ← executing a new command invalidates the redo branch
    }

    public void undo() {
        if (!history.isEmpty()) {
            TextCommand cmd = history.pop();
            cmd.undo();
            redoStack.push(cmd); // ← save for potential redo
        }
    }

    public void redo() {
        if (!redoStack.isEmpty()) {
            TextCommand cmd = redoStack.pop();
            cmd.execute();
            history.push(cmd);
        }
    }
}
```

Each `TextCommand` stores the state needed to reverse itself (`InsertCommand` stores what was inserted and where; `DeleteCommand` stores what was deleted). The twin stacks give O(1) undo and redo. Clearing `redoStack` on `execute()` ensures you cannot redo after a new edit — matching the behavior of every text editor users expect.

---

### Q: Where do design patterns appear in the JDK itself? Give five examples.

| Pattern | JDK Example |
|---------|------------|
| Singleton | `Runtime.getRuntime()`, `System.console()` |
| Factory Method | `List.of()`, `Optional.of()`, `Path.of()`, `Collections.emptyList()` |
| Decorator | `BufferedInputStream(InputStream)`, `Collections.unmodifiableList()`, `Collections.synchronizedList()` |
| Adapter | `InputStreamReader(InputStream)`, `Arrays.asList(T[])` |
| Composite | `javax.swing.JComponent` tree |
| Proxy | `java.lang.reflect.Proxy` |
| Strategy | `Comparator<T>`, `ThreadFactory`, `ExecutorService` |
| Observer | `java.util.EventListener`, `PropertyChangeListener` |
| Command | `Runnable`, `Callable`, `Future` |
| Template Method | `AbstractList.get()`, `HttpServlet.service()` |
| Iterator | `Iterable<T>`, `Iterator<T>` |

---

## Quick Summary Table

| Pattern | Intent | Key Spring Idiom |
|---------|--------|-----------------|
| Singleton | One instance per JVM | `@Component` (default scope) |
| Builder | Step-by-step complex construction | Lombok `@Builder`, `@Value` |
| Factory Method | Decouple creation from use | `@Bean` method in `@Configuration` |
| Abstract Factory | Coordinated product families | `@Profile` + multiple `@Configuration` classes |
| Prototype | Clone an existing object | `@Scope("prototype")` |
| Decorator | Wrap to add behaviour | Spring Security filter chain |
| Adapter | Translate interfaces | `@Primary` / `@Qualifier` to swap impls |
| Facade | Simplify a subsystem | `JdbcTemplate`, `RestTemplate` |
| Composite | Part-whole hierarchy | `CompositeAuthorizationManager` |
| Proxy | Control access | `@Transactional`, `@Cacheable`, `@Async` |
| Strategy | Interchangeable algorithms | `Map<String, Strategy>` registry injection |
| Observer | Notify on state change | `@EventListener`, `ApplicationEventPublisher` |
| Command | Request as object | `@Async` tasks, Spring Batch `Step` |
| Template Method | Algorithm skeleton with hooks | `JdbcTemplate.query(RowMapper)` |
| Chain of Responsibility | Pass through handler chain | `SecurityFilterChain` |
| State | Behaviour tied to lifecycle | Spring Statemachine |

---

## Related Interview Prep

- [OOP Interview Questions](./oops-interview-prep.md) — design patterns are applied OOP; SOLID principles underpin every pattern
- [Spring Boot / Spring Framework Interview Questions](../spring-boot/index.md) — Spring's core is built on Factory, Proxy, Template Method, and Observer
- [Multithreading Interview Questions](./multithreading-interview-prep.md) — thread-safe Singleton, `@Async` Observer, and concurrent Command queues cross into concurrency
