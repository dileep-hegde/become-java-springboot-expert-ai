---
id: optional-demo
title: "Optional — Practical Demo"
description: Hands-on examples for Optional creation, chained transformations, orElseGet laziness, and common anti-patterns.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Optional — Practical Demo

> Hands-on examples for [Optional](../optional.md). Covers creation patterns, chained `map`/`flatMap` pipelines, `orElse` vs `orElseGet`, and the anti-patterns that make Optional worse than null.

:::info Prerequisites
Understand the [Optional](../optional.md) note — particularly the three creation methods and the rule: Optional as a *return type only*.
:::

---

## Example 1: The Three Creation Methods and Safe Access

Shows when to use `of`, `empty`, and `ofNullable` — and how to access the value safely.

```java title="OptionalCreationDemo.java" showLineNumbers {15,20,25}
import java.util.Optional;

public class OptionalCreationDemo {
    public static void main(String[] args) {
        // of() — use only when you know the value is non-null
        Optional<String> known = Optional.of("Alice");
        System.out.println("of:          " + known);          // Optional[Alice]

        // empty() — explicit empty container
        Optional<String> nothing = Optional.empty();
        System.out.println("empty:       " + nothing);        // Optional.empty

        // ofNullable() — safe factory for values that might be null
        String maybeName = System.getProperty("user.nickname"); // returns null if not set
        Optional<String> maybe = Optional.ofNullable(maybeName);
        System.out.println("ofNullable:  " + maybe);          // Optional.empty (property not set)

        // Safe access patterns
        System.out.println(known.orElse("Unknown"));           // Alice
        System.out.println(nothing.orElse("Unknown"));         // Unknown
        System.out.println(known.isPresent());                 // true
        System.out.println(nothing.isEmpty());                 // true (Java 11+)

        // orElseThrow — explicit failure on empty
        try {
            String s = nothing.orElseThrow(() -> new IllegalStateException("Name not found"));
        } catch (IllegalStateException e) {
            System.out.println("Exception: " + e.getMessage());
        }
    }
}
```

**Expected Output:**
```
of:          Optional[Alice]
empty:       Optional.empty
ofNullable:  Optional.empty
Alice
Unknown
true
true
Exception: Name not found
```

:::tip Key takeaway
Use `ofNullable` when you're calling an API that may return null. Use `of` only when you're wrapping a value you *know* is non-null (method result you control). Calling `Optional.of(null)` throws NPE immediately.
:::

---

## Example 2: Chained Transformations with `map` and `flatMap`

Eliminates nested null checks by composing transformations as a pipeline.

```java title="OptionalPipelineDemo.java" showLineNumbers {29}
import java.util.Optional;

public class OptionalPipelineDemo {

    record Address(String street, String city, String country) {}

    record User(String name, Address address) {}  // address may be null

    static Optional<User> findUser(boolean present) {
        if (!present) return Optional.empty();
        return Optional.of(new User("Alice", new Address("Baker St", "London", "UK")));
    }

    // If getAddress() returned Optional<Address> itself, flatMap would be used here
    static Optional<Address> getAddress(User user) {
        return Optional.ofNullable(user.address());
    }

    public static void main(String[] args) {
        // Without Optional — deep null checks
        User rawUser = null; // pretend this came from a DB call
        String cityOld = "Unknown";
        if (rawUser != null && rawUser.address() != null) {
            cityOld = rawUser.address().city();
        }
        System.out.println("Old null check: " + cityOld);

        // With Optional — pipeline
        String city = findUser(true)
            .flatMap(OptionalPipelineDemo::getAddress) // returns Optional<Address>
            .map(Address::city)                        // returns Optional<String>
            .orElse("Unknown");
        System.out.println("Found city:  " + city);

        String cityMissing = findUser(false)
            .flatMap(OptionalPipelineDemo::getAddress)
            .map(Address::city)
            .orElse("Unknown");
        System.out.println("Missing city: " + cityMissing);

        // filter — only accept cities in UK
        Optional<String> ukCity = findUser(true)
            .flatMap(OptionalPipelineDemo::getAddress)
            .filter(a -> "UK".equals(a.country()))
            .map(Address::city);
        System.out.println("UK city:     " + ukCity.orElse("Not UK"));
    }
}
```

**Expected Output:**
```
Old null check: Unknown
Found city:  London
Missing city: Unknown
UK city:     London
```

:::tip Key takeaway
Use `map` when the transformation returns a plain value. Use `flatMap` when it returns another `Optional` — otherwise you'd get `Optional<Optional<T>>`.
:::

---

## Example 3: `orElse` vs `orElseGet` — Lazy Evaluation Matters

Demonstrates that `orElse` eagerly evaluates its argument even when the Optional is non-empty.

```java title="OrElseDemo.java" showLineNumbers {12,16}
import java.util.Optional;

public class OrElseDemo {
    static int callCount = 0;

    static String expensiveDefault() {
        callCount++;
        System.out.println("  [expensiveDefault called] count=" + callCount);
        return "Default-" + callCount;
    }

    public static void main(String[] args) {
        Optional<String> present = Optional.of("RealValue");

        System.out.println("--- orElse (always evaluates) ---");
        callCount = 0;
        String r1 = present.orElse(expensiveDefault());  // called even though present!
        System.out.println("Result: " + r1);

        System.out.println("--- orElseGet (lazy) ---");
        callCount = 0;
        String r2 = present.orElseGet(OrElseDemo::expensiveDefault); // NOT called
        System.out.println("Result: " + r2);

        System.out.println("--- orElseGet on empty (calls supplier) ---");
        callCount = 0;
        String r3 = Optional.<String>empty().orElseGet(OrElseDemo::expensiveDefault);
        System.out.println("Result: " + r3);
    }
}
```

**Expected Output:**
```
--- orElse (always evaluates) ---
  [expensiveDefault called] count=1
Result: RealValue
--- orElseGet (lazy) ---
Result: RealValue
--- orElseGet on empty (calls supplier) ---
  [expensiveDefault called] count=1
Result: Default-1
```

:::warning Common Mistake
`orElse(buildExplicitObject())` runs `buildExplicitObject()` **always** — even on a hot path where the value is almost always present. If the default involves DB calls, logging, or object construction, use `orElseGet` to avoid unnecessary work.
:::

---

## Exercises

1. **Easy**: Write `Optional<String> parsePositive(String s)` that returns an `Optional` containing the integer string if it represents a positive number, `Optional.empty()` otherwise (no exceptions).
2. **Medium**: Refactor this code to use Optional:
   ```java
   Config cfg = loadConfig();
   String host = "localhost";
   if (cfg != null && cfg.getHost() != null && !cfg.getHost().isBlank()) {
       host = cfg.getHost();
   }
   ```
3. **Hard**: Use `Optional.stream()` (Java 9+) to process a `List<Optional<Integer>>` and collect only the non-empty values into a `List<Integer>`, then find the maximum. Write the one-liner Stream pipeline.
