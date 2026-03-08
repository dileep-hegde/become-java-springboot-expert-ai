---
id: adapter-pattern-demo
title: "Adapter Pattern — Practical Demo"
description: Hands-on examples of the Adapter pattern — wrapping incompatible APIs, integrating third-party SDKs, and using Spring DI as an adapter.
sidebar_position: 8
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Adapter Pattern — Practical Demo

> Hands-on examples for [Adapter Pattern](../adapter-pattern.md). See how to wrap incompatible interfaces, integrate third-party SDKs, and use Spring DI to swap implementations.

:::info Prerequisites
Understanding of interfaces, composition, and basic Spring dependency injection covers everything in this guide.
:::

---

## Example 1: The Problem — Incompatible Interfaces

You have a `PaymentProcessor` interface your application depends on. A new payment SDK (`StripeClient`) has a completely different API:

```java title="The mismatch"
// What your system expects
public interface PaymentProcessor {
    boolean charge(String accountId, BigDecimal amount);
}

// What Stripe SDK provides — you cannot modify this class
public class StripeClient {
    public StripeResponse processPayment(PaymentRequest request) { ... }
}

public class PaymentRequest {
    private String customerId;
    private long   amountCents;    // Stripe uses cents, not BigDecimal dollars
    private String currency;
    // getters and setters
}
```

Calling `stripeClient.processPayment(...)` directly would scatter Stripe-specific code everywhere. An Adapter wraps it:

---

## Example 2: Object Adapter (Composition — Preferred)

```java title="StripePaymentAdapter.java" showLineNumbers {11,17}
public class StripePaymentAdapter implements PaymentProcessor { // ← implements the target interface

    private final StripeClient stripeClient; // ← wraps the adaptee via composition

    public StripePaymentAdapter(StripeClient stripeClient) {
        this.stripeClient = stripeClient;
    }

    @Override
    public boolean charge(String accountId, BigDecimal amount) {
        // ── translate the call ──────────────────────────────────────────────
        PaymentRequest req = new PaymentRequest();
        req.setCustomerId(accountId);
        req.setAmountCents(amount.multiply(BigDecimal.valueOf(100)).longValue()); // ← dollars → cents
        req.setCurrency("USD");

        StripeResponse resp = stripeClient.processPayment(req); // ← delegate to adaptee
        // ── translate the response ─────────────────────────────────────────
        return "succeeded".equals(resp.getStatus());
    }
}
```

```java title="OrderService.java — the client"
public class OrderService {

    private final PaymentProcessor payment; // ← depends on target interface, not Stripe

    public OrderService(PaymentProcessor payment) { this.payment = payment; }

    public void placeOrder(String customerId, BigDecimal total) {
        boolean charged = payment.charge(customerId, total);
        if (charged) {
            System.out.println("Order confirmed for customer " + customerId);
        } else {
            throw new PaymentFailedException("Charge declined");
        }
    }
}
```

```java title="Main.java"
StripeClient       stripe  = new StripeClient();
PaymentProcessor   adapter = new StripePaymentAdapter(stripe);
OrderService       orders  = new OrderService(adapter);

orders.placeOrder("cust_abc123", new BigDecimal("49.99"));
// Order confirmed for customer cust_abc123
```

Now switching to PayPal is just a new `PaypalPaymentAdapter` — `OrderService` never changes.

---

## Example 3: Legacy Service Adapter

Adapt an old legacy service that uses a different method signature into a modern interface:

```java title="LegacyUserService.java — the old system"
// Cannot modify — compiled library or remote service
public class LegacyUserService {
    public Map<String, Object> getUserByNumber(int userId) {
        return Map.of("user_id", userId, "user_name", "Alice", "user_email", "alice@example.com");
    }
}
```

```java title="UserRepository.java — modern interface"
public interface UserRepository {
    Optional<User> findById(long id);
}

public record User(long id, String name, String email) {}
```

```java title="LegacyUserAdapter.java"
public class LegacyUserAdapter implements UserRepository {

    private final LegacyUserService legacy;

    public LegacyUserAdapter(LegacyUserService legacy) { this.legacy = legacy; }

    @Override
    public Optional<User> findById(long id) {
        try {
            Map<String, Object> raw = legacy.getUserByNumber((int) id); // ← long → int translation
            User user = new User(
                ((Number) raw.get("user_id")).longValue(),  // ← Map → User record translation
                (String) raw.get("user_name"),
                (String) raw.get("user_email")
            );
            return Optional.of(user);
        } catch (Exception e) {
            return Optional.empty(); // ← normalize error handling
        }
    }
}
```

```java title="ProfileService.java — the client"
public class ProfileService {

    private final UserRepository users; // ← depends on modern interface

    public ProfileService(UserRepository users) { this.users = users; }

    public void showProfile(long userId) {
        users.findById(userId)
             .ifPresentOrElse(
                 u -> System.out.printf("Profile: %s (%s)%n", u.name(), u.email()),
                 ()  -> System.out.println("User not found")
             );
    }
}
```

```java title="Main.java"
LegacyUserService legacy  = new LegacyUserService();
UserRepository    adapter = new LegacyUserAdapter(legacy);
ProfileService    profile = new ProfileService(adapter);

profile.showProfile(42);
// Profile: Alice (alice@example.com)
```

---

## Example 4: Two-Way Adapter (Log Framework Bridge)

Sometimes you need to bridge two frameworks that both have fixed interfaces:

```java title="Two-way adapter — SLF4J ↔ java.util.logging"
// Your system uses SLF4J
public interface AppLogger {
    void info(String msg);
    void warn(String msg);
    void error(String msg, Throwable t);
}

// JUL (java.util.logging) — already exists, cannot change
// java.util.logging.Logger has: info(String), warning(String), severe(String)

public class JulLoggerAdapter implements AppLogger {

    private final java.util.logging.Logger jul;

    public JulLoggerAdapter(String name) {
        this.jul = java.util.logging.Logger.getLogger(name);
    }

    @Override
    public void info(String msg)               { jul.info(msg); }     // ← direct mapping

    @Override
    public void warn(String msg)               { jul.warning(msg); }  // ← name translation

    @Override
    public void error(String msg, Throwable t) {
        jul.log(java.util.logging.Level.SEVERE, msg, t); // ← signature translation
    }
}
```

```java title="Usage — caller uses AppLogger, JUL runs under the hood"
AppLogger log = new JulLoggerAdapter(MyService.class.getName());

log.info("Service started");    // → JUL info
log.warn("Config missing");     // → JUL warning
log.error("DB failed", ex);     // → JUL severe with stack trace
```

The real SLF4J library does exactly this — `slf4j-jdk14` is an `ILoggerFactory` adapter over JUL.

---

## Example 5: Spring Dependency Injection as Adapter

In Spring, declaring alternative beans and injecting via the interface is adapter pattern by convention:

```java title="StorageAdapter pattern in Spring"
// Your defined port (target) interface
public interface DocumentStorage {
    void save(String key, byte[] content);
    byte[] load(String key);
}

// Adapter for AWS S3
@Component
@Profile("production")
public class S3DocumentStorage implements DocumentStorage {

    private final AmazonS3 s3;
    @Value("${aws.s3.bucket}") private String bucket;

    public S3DocumentStorage(AmazonS3 s3) { this.s3 = s3; }

    @Override
    public void save(String key, byte[] content) {
        s3.putObject(bucket, key,
            new ByteArrayInputStream(content),
            new ObjectMetadata());
        System.out.println("S3 saved: " + key);
    }

    @Override
    public byte[] load(String key) {
        return s3.getObject(bucket, key)
                 .getObjectContent()
                 .readAllBytes();
    }
}

// Adapter for local file system — used in tests and local dev
@Component
@Profile({"local", "test"})
public class LocalDocumentStorage implements DocumentStorage {

    private final Map<String, byte[]> store = new ConcurrentHashMap<>();

    @Override
    public void save(String key, byte[] content) {
        store.put(key, content);
        System.out.println("Local saved: " + key);
    }

    @Override
    public byte[] load(String key) {
        return store.getOrDefault(key, new byte[0]);
    }
}
```

```java title="DocumentService.java — the client"
@Service
public class DocumentService {

    private final DocumentStorage storage; // ← Spring injects the right adapter per profile

    public DocumentService(DocumentStorage storage) { this.storage = storage; }

    public void upload(String name, byte[] data) {
        storage.save(name, data);
    }
}
```

```yaml title="Spring profiles"
# application-production.yml → S3DocumentStorage is active
# application-local.yml     → LocalDocumentStorage is active
```

Switching between S3 and local storage is a single profile change. `DocumentService` is unchanged.

---

## Summary

| Variant | Use When |
|---|---|
| Object Adapter (composition) | Third-party class you cannot extend; multiple adaptee instances; always prefer this |
| Class Adapter (inheritance) | Simple single adaptee you can subclass; only if composition is impractical |
| Two-way bridge adapter | Plugging two fixed frameworks together (log bridges, codec bridges) |
| Spring `@Profile` adapter | Same interface, different backing implementations per environment/profile |
