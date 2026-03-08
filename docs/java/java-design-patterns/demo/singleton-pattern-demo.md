---
id: singleton-pattern-demo
title: "Singleton Pattern — Practical Demo"
description: Hands-on step-by-step examples of all four Java Singleton idioms with thread-safety analysis.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Singleton Pattern — Practical Demo

> Hands-on examples for [Singleton Pattern](../singleton-pattern.md). Walk through each idiom from the simplest to the most robust.

:::info Prerequisites
Understand `static` fields and the Java class-loading lifecycle before proceeding. The Holder idiom's thread-safety depends entirely on JVM class initialization guarantees.
:::

---

## Example 1: Eager Initialization — Simplest Thread-Safe Singleton

This is the go-to when the singleton is always needed and construction is cheap.

```java title="AppConfig.java" showLineNumbers {5,8,12}
public final class AppConfig {

    // Initialized when the class is first loaded by the JVM
    // Thread-safe: class loading is atomic per JLS §12.4
    private static final AppConfig INSTANCE = new AppConfig(); // highlight: eager

    private final String appName;
    private final String version;

    private AppConfig() {  // highlight: private constructor prevents `new AppConfig()`
        this.appName = System.getenv().getOrDefault("APP_NAME", "MyApp");
        this.version = System.getenv().getOrDefault("APP_VERSION", "1.0.0");
    }

    public static AppConfig getInstance() {
        return INSTANCE; // highlight: no synchronization needed — instance already created
    }

    public String getAppName() { return appName; }
    public String getVersion() { return version; }

    @Override
    public String toString() {
        return appName + " v" + version;
    }
}
```

**Try it:**

```java title="Main.java"
AppConfig c1 = AppConfig.getInstance();
AppConfig c2 = AppConfig.getInstance();

System.out.println(c1 == c2);          // → true  (same instance)
System.out.println(c1.getAppName());   // → "MyApp" (or env var value)
```

---

## Example 2: Initialization-on-Demand Holder — Lazy + Thread-Safe

Use this when construction is **expensive** and you want to defer it until first use.

```java title="HeavyReportEngine.java" showLineNumbers {12,15,20}
public final class HeavyReportEngine {

    private final Map<String, Object> templateCache;

    private HeavyReportEngine() {
        System.out.println("Building report engine (slow)...");
        // Simulate expensive startup: parse templates, warm JIT, etc.
        this.templateCache = loadTemplates();
    }

    // ◀ Inner class is NOT loaded until getInstance() is first called
    private static final class Holder {
        // Class initialization is atomic per JLS — no synchronized needed
        static final HeavyReportEngine INSTANCE = new HeavyReportEngine(); // highlight: lazy
    }

    public static HeavyReportEngine getInstance() {
        return Holder.INSTANCE; // highlight: loads Holder class on first call only
    }

    public String render(String templateName, Map<String, Object> data) {
        Object template = templateCache.get(templateName);
        return "Rendered: " + templateName; // simplified
    }

    private Map<String, Object> loadTemplates() {
        // Pretend this reads config files
        return Map.of("invoice", "...", "receipt", "...");
    }
}
```

**Try it:**

```java title="Main.java"
System.out.println("Application started.");
// ← No "Building report engine..." yet — lazy!

HeavyReportEngine engine1 = HeavyReportEngine.getInstance();
// → "Building report engine (slow)..." printed HERE, on first call

HeavyReportEngine engine2 = HeavyReportEngine.getInstance();
// → No second build — already constructed

System.out.println(engine1 == engine2); // → true
```

---

## Example 3: Enum Singleton — Most Robust

The enum singleton is bullet-proof against reflection and serialization — Java's JVM enforces it at the language level.

```java title="DatabaseManager.java" showLineNumbers {1,5,9}
public enum DatabaseManager { // highlight: enum guarantees one instance per JVM
    INSTANCE;                 // highlight: the singleton value

    private final List<String> connectionPool = new ArrayList<>();
    private int poolSize = 10; // highlight: state lives here, not in multiple instances

    DatabaseManager() {
        // Constructor runs exactly once, no matter what
        System.out.println("Initializing connection pool...");
        for (int i = 0; i < poolSize; i++) {
            connectionPool.add("conn-" + i);
        }
    }

    public String acquireConnection() {
        if (connectionPool.isEmpty()) throw new RuntimeException("Pool exhausted");
        return connectionPool.remove(0);
    }

    public void releaseConnection(String conn) {
        connectionPool.add(conn);
    }

    public int availableConnections() {
        return connectionPool.size();
    }
}
```

**Try it:**

```java title="Main.java"
// Reflection attack — FAILS for enums
try {
    Constructor<DatabaseManager> c = DatabaseManager.class.getDeclaredConstructor();
    c.setAccessible(true);
    DatabaseManager hacked = c.newInstance(); // ← throws IllegalArgumentException
} catch (Exception e) {
    System.out.println("Reflection blocked: " + e.getMessage());
}

// Normal usage
String conn = DatabaseManager.INSTANCE.acquireConnection();
System.out.println("Got: " + conn);                          // → conn-0
System.out.println("Available: " + DatabaseManager.INSTANCE.availableConnections()); // → 9
DatabaseManager.INSTANCE.releaseConnection(conn);
System.out.println("Available: " + DatabaseManager.INSTANCE.availableConnections()); // → 10
```

---

## Example 4: Thread-Safety Comparison

Run this to visually observe that all three implementations produce **one** instance even with 50 parallel threads:

```java title="ThreadSafetyTest.java"
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ThreadSafetyTest {

    public static void main(String[] args) throws Exception {
        int threadCount = 50;
        ExecutorService exec = Executors.newFixedThreadPool(threadCount);
        Set<Integer> instanceIds = ConcurrentHashMap.newKeySet();

        // Hammer getInstance() from 50 threads simultaneously
        CountDownLatch latch = new CountDownLatch(threadCount);
        for (int i = 0; i < threadCount; i++) {
            exec.submit(() -> {
                instanceIds.add(System.identityHashCode(AppConfig.getInstance())); // ← collect identity hashes
                latch.countDown();
            });
        }

        latch.await();
        exec.shutdown();

        System.out.println("Unique instance count: " + instanceIds.size());
        // → Unique instance count: 1  (always — for all three idioms)
    }
}
```

---

## Example 5: Singleton in Spring Boot Context

In Spring Boot, you almost never write a Singleton manually — every `@Component` bean is singleton-scoped by default:

```java title="MetricsCollector.java"
@Component  // ← Spring manages this as a singleton — one instance per ApplicationContext
public class MetricsCollector {

    private final AtomicLong requestCount = new AtomicLong(0);

    public void recordRequest() {
        requestCount.incrementAndGet();
    }

    public long getRequestCount() {
        return requestCount.get();
    }
}

// The counter is shared across ALL injection points — same instance everywhere
@RestController
public class OrderController {
    @Autowired MetricsCollector metrics; // ← gets the same MetricsCollector as ApiController
    // ...
}

@RestController
public class ApiController {
    @Autowired MetricsCollector metrics; // ← same bean instance
    // ...
}
```

:::tip When to use manual Singleton vs Spring-managed
- **Spring bean** — when the class lives in a Spring context (service, repository, config). Spring handles lifecycle, injection, and thread management.
- **Manual Singleton** — for pure Java utility classes outside of Spring (e.g., a connection pool in a plain Java CLI app) or when you need Singleton guarantees before the IoC container starts.
:::

---

## Summary

| Idiom | Lazy? | Thread-Safe? | Reflection-Safe? | Use When |
|---|---|---|---|---|
| Eager | No | ✅ JVM | ❌ (with guard) | Simple, cheap construction |
| Holder idiom | ✅ | ✅ JVM | ❌ (with guard) | Lazy, no framework |
| Enum | Sort-of | ✅ JVM | ✅ Built-in | Most robust; no inheritance needed |
| Spring `@Component` | No | ✅ IoC | N/A | Spring apps (prefer this) |
