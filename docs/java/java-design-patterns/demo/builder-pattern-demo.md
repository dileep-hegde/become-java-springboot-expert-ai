---
id: builder-pattern-demo
title: "Builder Pattern — Practical Demo"
description: Hands-on examples of the Builder pattern — from the classic Effective Java idiom to Lombok @Builder to a step-by-step Director.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Builder Pattern — Practical Demo

> Hands-on examples for [Builder Pattern](../builder-pattern.md). Run each snippet and observe how fluent construction makes invalid states impossible.

:::info Prerequisites
Familiarity with Java inner classes and `final` fields is enough to follow all examples. Lombok examples need the `lombok` dependency on the classpath.
:::

---

## Example 1: The Problem — Too Many Constructor Parameters

Without a Builder, constructors become unmaintainable as options grow:

```java title="UserProfile.java — telescoping constructors (the problem)"
public class UserProfile {
    public UserProfile(String first, String last, String email) { ... }
    public UserProfile(String first, String last, String email, String phone) { ... }
    public UserProfile(String first, String last, String email, String phone, int age) { ... }
    // ... keep adding overloads forever, or use nulls
}

// At the call site — which null means what?
UserProfile u = new UserProfile("Alice", "Smith", "a@b.com", null, 30); // ← brittle
```

The Builder removes all of this:

```java
UserProfile u = UserProfile.builder()
    .firstName("Alice")
    .lastName("Smith")
    .email("a@b.com")
    .age(30)
    // phone not set — just omit it, no null needed
    .build();
```

---

## Example 2: Effective Java Builder (Classic — No Libraries)

```java title="UserProfile.java" showLineNumbers {7,30,40}
public final class UserProfile {

    // Immutable fields — all final
    private final String firstName;   // required
    private final String lastName;    // required
    private final String email;       // required
    private final String phone;       // optional
    private final int    age;         // optional

    // Private constructor — only Builder can call it
    private UserProfile(Builder b) {
        this.firstName = b.firstName;
        this.lastName  = b.lastName;
        this.email     = b.email;
        this.phone     = b.phone;
        this.age       = b.age;
    }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        // Required fields
        private String firstName;
        private String lastName;
        private String email;
        // Optional fields with defaults
        private String phone = "";
        private int    age   = 0;

        public Builder firstName(String v) { this.firstName = v; return this; } // ← returns Builder for chaining
        public Builder lastName(String v)  { this.lastName  = v; return this; }
        public Builder email(String v)     { this.email     = v; return this; }
        public Builder phone(String v)     { this.phone     = v; return this; }
        public Builder age(int v)          { this.age       = v; return this; }

        public UserProfile build() {
            // Validate required fields before constructing
            if (firstName == null || lastName == null || email == null)
                throw new IllegalStateException("firstName, lastName, email are required");
            return new UserProfile(this);
        }
    }

    @Override
    public String toString() {
        return "UserProfile{name=%s %s, email=%s, phone=%s, age=%d}"
            .formatted(firstName, lastName, email, phone, age);
    }
}
```

```java title="Main.java — usage"
UserProfile full = UserProfile.builder()
    .firstName("Alice")
    .lastName("Smith")
    .email("alice@example.com")
    .phone("+1-555-0100")
    .age(32)
    .build();

System.out.println(full);
// UserProfile{name=Alice Smith, email=alice@example.com, phone=+1-555-0100, age=32}

UserProfile minimal = UserProfile.builder()
    .firstName("Bob")
    .lastName("Jones")
    .email("bob@example.com")
    .build(); // phone and age use defaults

System.out.println(minimal);
// UserProfile{name=Bob Jones, email=bob@example.com, phone=, age=0}

// Validation test
try {
    UserProfile.builder().firstName("Carol").build(); // missing lastName and email
} catch (IllegalStateException e) {
    System.out.println("Caught: " + e.getMessage());
    // Caught: firstName, lastName, email are required
}
```

---

## Example 3: Lombok `@Builder` + Immutable Class

Lombok generates the Builder boilerplate at compile time. For a plain POJO (not JPA entity), use `@Value` + `@Builder`:

```java title="OrderRequest.java" showLineNumbers {1,2}
@Value           // ← Lombok: all fields final, no setters, constructor, equals, hashCode, toString
@Builder         // ← Lombok: generates inner Builder class
public class OrderRequest {

    String productId;
    int    quantity;
    String shippingAddress;

    @Builder.Default
    String currency = "USD";      // ← explicit default; without @Builder.Default, Lombok uses null/0

    @Builder.Default
    boolean giftWrap = false;
}
```

```java title="Usage"
OrderRequest req = OrderRequest.builder()
    .productId("PROD-42")
    .quantity(3)
    .shippingAddress("1 Infinite Loop, Cupertino")
    .giftWrap(true)
    .build();

System.out.println(req);
// OrderRequest(productId=PROD-42, quantity=3, shippingAddress=1 Infinite Loop, Cupertino,
//              currency=USD, giftWrap=true)

// Fields are final — the following won't compile:
// req.setQuantity(5); // No setters exist
```

:::warning JPA Entity + @Builder
For a JPA entity, skip `@Value` (JPA needs a no-arg constructor and mutable state). Use `@Builder @NoArgsConstructor @AllArgsConstructor` together:

```java
@Entity
@Builder
@NoArgsConstructor          // ← required by JPA
@AllArgsConstructor         // ← required by @Builder
public class ProductEntity { ... }
```
:::

---

## Example 4: Director + Builder — Step-by-Step Construction

The GoF Director encapsulates build *sequences*, so callers get named presets without knowing the steps:

```java title="EmailBuilder.java + EmailDirector.java" showLineNumbers
// Product
public record Email(String to, String from, String subject, String body, boolean htmlEnabled) {}

// Builder interface
public interface EmailBuilder {
    EmailBuilder to(String address);
    EmailBuilder from(String address);
    EmailBuilder subject(String text);
    EmailBuilder body(String text);
    EmailBuilder htmlEnabled(boolean flag);
    Email build();
}

// Concrete Builder
public class DefaultEmailBuilder implements EmailBuilder {
    private String to, from, subject, body;
    private boolean htmlEnabled;

    public EmailBuilder to(String v)            { this.to = v;           return this; }
    public EmailBuilder from(String v)          { this.from = v;         return this; }
    public EmailBuilder subject(String v)       { this.subject = v;      return this; }
    public EmailBuilder body(String v)          { this.body = v;         return this; }
    public EmailBuilder htmlEnabled(boolean v)  { this.htmlEnabled = v;  return this; }
    public Email build() { return new Email(to, from, subject, body, htmlEnabled); }
}

// Director — defines reusable construction recipes
public class EmailDirector {

    public Email buildPasswordResetEmail(EmailBuilder b, String userEmail, String resetLink) {
        return b
            .to(userEmail)
            .from("no-reply@example.com")
            .subject("Password Reset Request")
            .body("<p>Click <a href='" + resetLink + "'>here</a> to reset.</p>")
            .htmlEnabled(true)
            .build();
    }

    public Email buildWelcomeEmail(EmailBuilder b, String userEmail, String name) {
        return b
            .to(userEmail)
            .from("welcome@example.com")
            .subject("Welcome to AppName, " + name + "!")
            .body("Hi " + name + ",\n\nThanks for joining.")
            .htmlEnabled(false)
            .build();
    }
}
```

```java title="Usage"
EmailDirector director = new EmailDirector();

Email reset = director.buildPasswordResetEmail(
    new DefaultEmailBuilder(), "alice@example.com", "https://app.com/reset/token123"
);

Email welcome = director.buildWelcomeEmail(
    new DefaultEmailBuilder(), "bob@example.com", "Bob"
);

System.out.println(reset.subject());   // Password Reset Request
System.out.println(welcome.htmlEnabled()); // false
```

The Director ensures consistency — every password reset email always has the same `from` address and HTML flag.

---

## Example 5: Spring `@ConfigurationProperties` as Builder

Spring Boot's `@ConfigurationProperties` with a nested builder-style config shows the pattern in a real-world context:

```java title="AppProperties.java"
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Cache cache;
    private final Email email;

    public AppProperties(Cache cache, Email email) {
        this.cache = cache;
        this.email = email;
    }

    public record Cache(int ttlSeconds, int maxSize) {}
    public record Email(String host, int port, String from) {}

    // Getters
    public Cache getCache() { return cache; }
    public Email getEmail() { return email; }
}
```

```yaml title="application.yml"
app:
  cache:
    ttl-seconds: 300
    max-size: 1000
  email:
    host: smtp.sendgrid.net
    port: 587
    from: no-reply@example.com
```

```java title="Usage in a Service"
@Service
public class NotificationService {

    private final AppProperties props;

    public NotificationService(AppProperties props) { this.props = props; }

    public void send(String to, String body) {
        System.out.printf("Sending email from %s via %s:%d%n",
            props.getEmail().from(),
            props.getEmail().host(),
            props.getEmail().port());
    }
}
```

Spring acts as the Director here: it reads `application.yml`, constructs the property objects, and injects fully configured beans into your services.

---

## Summary

| Style | When to Use |
|---|---|
| Effective Java Builder | No Lombok; immutable object; validation in `build()` |
| `@Value @Builder` (Lombok) | Simple POJO; DTOs, request/response objects |
| `@Builder @NoArgsConstructor` (Lombok) | JPA entities that also need builder API |
| Director + Builder | Several preset configurations share the same construction steps |
| Spring `@ConfigurationProperties` | External YAML/properties → strongly-typed config beans |
