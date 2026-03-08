---
id: proxy-pattern-demo
title: "Proxy Pattern — Practical Demo"
description: Hands-on examples showing manual proxies, JDK dynamic proxies, and how Spring AOP uses proxies for @Transactional and @Cacheable.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Proxy Pattern — Practical Demo

> Hands-on examples for [Proxy Pattern](../proxy-pattern.md). Covers manual, dynamic, and Spring proxy implementations.

:::info Prerequisites
Understand Java interfaces and reflection basics. For the Spring examples, familiarity with `@Transactional` and `@Cacheable` helps.
:::

---

## Example 1: Manual Logging Proxy

The simplest proxy — wraps a service interface to add logging without changing the real implementation.

```java title="UserService.java" showLineNumbers
// The interface — both real and proxy implement this
public interface UserService {
    User findById(long id);
    User save(User user);
}

// The real implementation — pure business logic, no cross-cutting concerns
@Repository
public class UserServiceImpl implements UserService {
    public User findById(long id) {
        System.out.println("[DB] Fetching user " + id);
        return new User(id, "Alice");
    }
    public User save(User user) {
        System.out.println("[DB] Saving user " + user.getId());
        return user;
    }
}
```

```java title="LoggingUserServiceProxy.java" showLineNumbers {5,12,15}
public class LoggingUserServiceProxy implements UserService { // highlight: same interface

    private final UserService delegate; // highlight: wraps the real implementation

    public LoggingUserServiceProxy(UserService delegate) {
        this.delegate = delegate;
    }

    @Override
    public User findById(long id) {
        System.out.println("[PROXY] findById(" + id + ") called");
        long start = System.nanoTime();
        User result = delegate.findById(id); // highlight: delegates to real implementation
        long elapsed = (System.nanoTime() - start) / 1_000_000;
        System.out.println("[PROXY] findById completed in " + elapsed + " ms");
        return result;
    }

    @Override
    public User save(User user) {
        System.out.println("[PROXY] save(userId=" + user.getId() + ") called");
        User saved = delegate.save(user);
        System.out.println("[PROXY] save completed");
        return saved;
    }
}
```

**Try it:**

```java title="Main.java"
UserService real  = new UserServiceImpl();
UserService proxy = new LoggingUserServiceProxy(real); // ← wrap in proxy

User user = proxy.findById(42);
// Output:
// [PROXY] findById(42) called
// [DB] Fetching user 42
// [PROXY] findById completed in 0 ms
```

---

## Example 2: Caching Proxy — Avoid Redundant Database Calls

```java title="CachingUserServiceProxy.java" showLineNumbers {5,12,14,19}
public class CachingUserServiceProxy implements UserService {

    private final UserService delegate;
    private final Map<Long, User> cache = new ConcurrentHashMap<>(); // highlight: in-memory cache

    public CachingUserServiceProxy(UserService delegate) {
        this.delegate = delegate;
    }

    @Override
    public User findById(long id) {
        // Cache-aside: return from cache if present
        return cache.computeIfAbsent(id, key -> { // highlight: compute only on cache miss
            System.out.println("[CACHE MISS] Loading user " + key + " from DB");
            return delegate.findById(key); // highlight: delegate on miss
        });
    }

    @Override
    public User save(User user) {
        User saved = delegate.save(user);
        cache.put(saved.getId(), saved); // highlight: keep cache consistent after write
        return saved;
    }
}
```

**Try it:**

```java title="Main.java"
UserService real    = new UserServiceImpl();
UserService caching = new CachingUserServiceProxy(real);

caching.findById(42); // → [CACHE MISS] Loading user 42 from DB
caching.findById(42); // → (no output — served from cache)
caching.findById(42); // → (no output — served from cache)

// Stack proxies! Caching + Logging together:
UserService both = new LoggingUserServiceProxy(new CachingUserServiceProxy(real));
both.findById(10);
// → [PROXY] findById(10) called
// → [CACHE MISS] Loading user 10 from DB
// → [PROXY] findById completed in 0 ms
```

---

## Example 3: JDK Dynamic Proxy — One Handler for Any Interface

```java title="TimingInvocationHandler.java" showLineNumbers {8,15}
import java.lang.reflect.*;

public class TimingInvocationHandler implements InvocationHandler {

    private final Object target; // highlight: the real object being proxied

    public TimingInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        long start = System.nanoTime();
        Object result = method.invoke(target, args); // highlight: delegate via reflection
        long ms = (System.nanoTime() - start) / 1_000_000;
        System.out.printf("[TIMING] %s.%s — %d ms%n",
            target.getClass().getSimpleName(), method.getName(), ms);
        return result;
    }
}
```

```java title="Main.java"
UserService real = new UserServiceImpl();

// Generate a proxy at runtime — no explicit class written
UserService proxy = (UserService) Proxy.newProxyInstance(
    UserService.class.getClassLoader(),
    new Class<?>[]{ UserService.class }, // ← interface(s) to implement
    new TimingInvocationHandler(real)    // ← your handler
);

proxy.findById(99);
// → [DB] Fetching user 99
// → [TIMING] UserServiceImpl.findById — 0 ms

// The same handler works for ANY interface!
OrderService orderProxy = (OrderService) Proxy.newProxyInstance(
    OrderService.class.getClassLoader(),
    new Class<?>[]{ OrderService.class },
    new TimingInvocationHandler(new OrderServiceImpl())
);
```

:::warning JDK Proxy limitation
`Proxy.newProxyInstance` only works with **interfaces**. If `UserServiceImpl` has no interface, you need CGLIB (which Spring uses automatically as a fallback).
:::

---

## Example 4: Protection Proxy — Authorization Check

```java title="SecureUserServiceProxy.java" showLineNumbers {12,18}
public class SecureUserServiceProxy implements UserService {

    private final UserService delegate;
    private final SecurityContext securityContext;

    public SecureUserServiceProxy(UserService delegate, SecurityContext ctx) {
        this.delegate = delegate;
        this.securityContext = ctx;
    }

    @Override
    public User findById(long id) {
        requireAuthenticated(); // highlight: pre-check before delegating
        return delegate.findById(id);
    }

    @Override
    public User save(User user) {
        requireRole("ADMIN"); // highlight: only admins can save
        return delegate.save(user);
    }

    private void requireAuthenticated() {
        if (!securityContext.isAuthenticated())
            throw new AccessDeniedException("Login required");
    }

    private void requireRole(String role) {
        if (!securityContext.hasRole(role))
            throw new AccessDeniedException("Role required: " + role);
    }
}
```

**Try it:**

```java title="Main.java"
SecurityContext ctx = new MockSecurityContext(authenticated = false);
UserService secured = new SecureUserServiceProxy(new UserServiceImpl(), ctx);

secured.findById(1); // → throws AccessDeniedException: Login required

ctx.setAuthenticated(true);
secured.findById(1); // → [DB] Fetching user 1 (allowed)

secured.save(new User(2, "Bob")); // → throws AccessDeniedException: Role required: ADMIN
```

---

## Example 5: Spring @Cacheable — Spring's Built-In Caching Proxy

In a Spring Boot app, you don't write a Caching Proxy by hand — `@Cacheable` is Spring's proxy-based caching mechanism:

```java title="ProductService.java"
@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) { this.repo = repo; }

    @Cacheable(value = "products", key = "#id")  // ← Spring wraps this bean in a Caching Proxy
    public Product findById(Long id) {
        System.out.println("Loading from DB: " + id); // ← only printed on cache miss
        return repo.findById(id).orElseThrow();
    }

    @CacheEvict(value = "products", key = "#product.id") // ← removes from cache on mutation
    public Product save(Product product) {
        return repo.save(product);
    }
}
```

```yaml title="application.yml"
spring:
  cache:
    type: caffeine    # or redis for distributed caching
  caffeine:
    spec: maximumSize=500,expireAfterWrite=10m
```

**How Spring wires the proxy:**

```
Controller → ProductService (CGLIB proxy)
                   ↓
        Spring CacheInterceptor (proxy advice)
                   ↓
       Checks Caffeine cache by key="#id"
         Cache hit  → return cached Product
         Cache miss → invoke real ProductService.findById → store in cache → return
```

:::tip Verify it's a proxy
Inject `ProductService` and print `productService.getClass().getName()`. You'll see something like `ProductService$$SpringCGLIB$$0` — the `$$SpringCGLIB$$` suffix confirms it's a CGLIB proxy.
:::

---

## Summary

| Proxy Type | How to create | When to use |
|---|---|---|
| Manual static proxy | Write a class implementing the interface | One-off, needs custom logic, testable |
| JDK dynamic proxy | `Proxy.newProxyInstance` + `InvocationHandler` | Generic cross-cutting concerns on interfaces |
| CGLIB proxy | Via Spring or CGLIB library | Class-based proxy (no interface) |
| Spring `@Cacheable` / `@Transactional` | Annotation on method | Most Spring Boot cross-cutting concerns |
