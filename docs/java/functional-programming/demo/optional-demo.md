---
id: optional-demo
title: "Optional Deep Dive — Practical Demo"
description: Hands-on examples for Optional creation, safe retrieval, chaining, and the anti-patterns to avoid.
sidebar_position: 7
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Optional Deep Dive — Practical Demo

> Hands-on examples for [Optional](../optional.md). Demonstrates safe value extraction, chaining with `map`/`flatMap`, and the most common anti-patterns.

:::info Prerequisites
Understand Java's [Functional Interfaces](../functional-interfaces.md) — `Optional.map` takes a `Function`, `Optional.filter` takes a `Predicate`, and `Optional.ifPresent` takes a `Consumer`.
:::

---

## Example 1: Creation and Safe Retrieval

All the ways to create an Optional and extract its value safely.

```java title="OptionalCreation.java" showLineNumbers {9,14,20,27,34}
import java.util.Optional;
import java.util.NoSuchElementException;

public class OptionalCreation {
    public static void main(String[] args) {

        // --- Creation ---
        Optional<String> present = Optional.of("Hello");     // ← must be non-null
        Optional<String> empty   = Optional.empty();
        Optional<String> maybe   = Optional.ofNullable(null); // ← null → empty

        // BAD: Optional.of(null) throws NullPointerException immediately
        // Optional<String> bad = Optional.of(null); // ← NPE

        // --- Safe retrieval ---

        // orElse — always evaluates the argument (even when present)
        System.out.println(present.orElse("default")); // Hello
        System.out.println(empty.orElse("default"));   // default

        // orElseGet — lazy: only evaluates Supplier when empty
        String lazy = empty.orElseGet(() -> {
            System.out.println("  Supplier called!");
            return "lazy default";
        });
        System.out.println(lazy); // lazy default

        // orElseThrow — throws custom exception when empty
        try {
            empty.orElseThrow(() -> new IllegalStateException("Value missing!"));
        } catch (IllegalStateException e) {
            System.out.println("Caught: " + e.getMessage()); // Caught: Value missing!
        }

        // ifPresent — only runs Consumer when a value is present
        present.ifPresent(v -> System.out.println("Present: " + v)); // Present: Hello
        empty.ifPresent(v -> System.out.println("Never printed"));   // no-op

        // ifPresentOrElse (Java 9+) — two-branch handling
        empty.ifPresentOrElse(
            v -> System.out.println("Value: " + v),
            () -> System.out.println("No value found") // ← empty branch
        );
    }
}
```

**Expected Output:**
```
Hello
default
  Supplier called!
lazy default
Caught: Value missing!
Present: Hello
No value found
```

:::tip Key takeaway
`orElse` vs `orElseGet` is a common performance trap. `orElse(expensiveCall())` ALWAYS calls `expensiveCall()`. Use `orElseGet(() -> expensiveCall())` whenever the default computation is non-trivial.
:::

---

## Example 2: Chaining with `map`, `flatMap`, and `filter`

Eliminating nested null checks with Optional chains.

```java title="OptionalChaining.java" showLineNumbers {11,20,29,38}
import java.util.Optional;

public class OptionalChaining {

    record Address(String city, String zip, boolean verified) {}
    record User(String name, Address address) {}

    // Simulated repository returning Optional
    static Optional<User> findUser(String email) {
        if ("alice@example.com".equals(email))
            return Optional.of(new User("Alice", new Address("Springfield", "12345", true)));
        if ("ghost@example.com".equals(email))
            return Optional.of(new User("Ghost", null)); // ← user exists but has no address
        return Optional.empty(); // ← user not found
    }

    public static void main(String[] args) {
        // OLD way — pyramid of null checks
        String oldCity = null;
        User user = findUser("alice@example.com").orElse(null);
        if (user != null) {
            Address addr = user.address();
            if (addr != null) {
                oldCity = addr.city();
            }
        }
        System.out.println("Old way city: " + (oldCity != null ? oldCity : "Unknown"));

        // OPTIONAL way — flat chain
        String city = findUser("alice@example.com")
            .map(User::address)          // Optional<Address> — if user found
            .map(Address::city)          // Optional<String>  — if address non-null
            .orElse("Unknown");
        System.out.println("Optional way city: " + city);

        // Ghost user has null address — Optional.ofNullable wraps null safely
        String ghostCity = findUser("ghost@example.com")
            .map(User::address)           // → Optional.ofNullable(null) = Optional.empty()
            .map(Address::city)
            .orElse("No city");
        System.out.println("Ghost city: " + ghostCity);

        // filter — keep only verified addresses
        boolean isVerified = findUser("alice@example.com")
            .map(User::address)
            .filter(Address::verified)    // ← Predicate: keep if verified
            .isPresent();
        System.out.println("Alice verified: " + isVerified);

        // flatMap — when a method itself returns Optional
        // (getPhoneNumber hypothetically returns Optional<String>)
        // Instead, demonstrate flatMap with an explicit Optional-returning method
        Optional<String> upperCity = findUser("alice@example.com")
            .flatMap(u -> Optional.ofNullable(u.address()))
            .map(Address::city)
            .map(String::toUpperCase);
        System.out.println("Upper city: " + upperCity.orElse("N/A"));
    }
}
```

**Expected Output:**
```
Old way city: Springfield
Optional way city: Springfield
Ghost city: No city
Alice verified: true
Upper city: SPRINGFIELD
```

---

## Example 3: Optional in a Spring-Style Service

A realistic pattern for service layer methods that return Optional.

```java title="UserService.java" showLineNumbers {13,22,31,40}
import java.util.*;
import java.util.stream.*;

public class UserService {

    record User(long id, String email, boolean active) {}

    // In-memory store (simulates JPA repository)
    private final Map<Long, User> store = Map.of(
        1L, new User(1L, "alice@example.com", true),
        2L, new User(2L, "bob@example.com",  false),
        3L, new User(3L, "carol@example.com", true)
    );

    // Repository layer — returns Optional
    public Optional<User> findById(long id) {
        return Optional.ofNullable(store.get(id)); // ← safe: ofNullable wraps null from map
    }

    // Service layer — uses Optional for domain logic
    public String getEmailOrDefault(long id) {
        return findById(id)
            .filter(User::active)           // ← only active users
            .map(User::email)               // ← extract email
            .orElse("no-reply@example.com");// ← fallback
    }

    // orElseThrow — service throws domain exception
    public User getOrThrow(long id) {
        return findById(id)
            .orElseThrow(() -> new NoSuchElementException("User not found: " + id));
    }

    public static void main(String[] args) {
        UserService svc = new UserService();

        System.out.println(svc.getEmailOrDefault(1L)); // alice@example.com (active)
        System.out.println(svc.getEmailOrDefault(2L)); // no-reply: bob is inactive
        System.out.println(svc.getEmailOrDefault(99L)); // no-reply: not found

        try {
            svc.getOrThrow(99L);
        } catch (NoSuchElementException e) {
            System.out.println("Exception: " + e.getMessage());
        }

        // Stream integration (Java 9+): flatMap Optional to filter missing users
        List<Long> ids = List.of(1L, 2L, 99L, 3L);
        List<String> activeEmails = ids.stream()
            .map(svc::findById)               // Stream<Optional<User>>
            .flatMap(Optional::stream)         // ← Java 9+: skip empty Optionals
            .filter(User::active)
            .map(User::email)
            .collect(Collectors.toList());
        System.out.println("Active emails: " + activeEmails);
    }
}
```

**Expected Output:**
```
alice@example.com
no-reply@example.com
no-reply@example.com
Exception: User not found: 99
Active emails: [alice@example.com, carol@example.com]
```

:::warning Common Mistake
Do NOT use `Optional` as a field type or method parameter. `Optional<Long> userId` as a record field or `void process(Optional<String> name)` as a parameter creates confusion (three states: null Optional, empty Optional, present Optional). Use `Optional` only as a return type to signal "this might not exist."
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Write a method `Optional<Integer> parseAge(String s)` that returns `Optional.empty()` if the string is null, blank, or not a valid integer, and `Optional.of(parseInt)` otherwise. Test with `"25"`, `"abc"`, and `null`.
2. **Medium**: Given `List<String> inputs` that may contain nulls, use `stream()`, `map(Optional::ofNullable)`, `flatMap(Optional::stream)`, and `collect` to get a list with all nulls removed — without any explicit null checks.
3. **Hard**: Implement a method `<T, R> Optional<R> safeApply(Optional<T> input, Function<T, R> f)` that returns `Optional.empty()` if input is empty or if `f.apply(t)` throws any exception, and wraps the result in `Optional` otherwise. Use this to safely parse arbitrary strings as `Integer`.

---

## Back to Topic

Return to the [Optional Deep Dive](../optional.md) note for theory, interview questions, and further reading.
