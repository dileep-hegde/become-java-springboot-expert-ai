---
id: immutable-collections-demo
title: "Immutable Collections — Practical Demo"
description: Hands-on examples comparing List.of, Collections.unmodifiableList, and Arrays.asList — and showing defensive copying at API boundaries.
sidebar_position: 8
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Immutable Collections — Practical Demo

> Hands-on examples for [Immutable Collections](../immutable-collections.md). Explore the differences between the three "read-only" list approaches and learn defensive copying patterns for safe API design.

:::info Prerequisites
Read the [Immutable Collections](../immutable-collections.md) note first — especially the difference between `List.of` (truly immutable) vs `Collections.unmodifiableList` (wrapper only) and the null policy.
:::

---

## Example 1: Comparing the Three "Read-Only" Approaches

Three common ways to get a "read-only" list behave very differently when you try to mutate them.

```java title="ReadOnlyComparison.java" showLineNumbers {7,13,20,28}
import java.util.*;

public class ReadOnlyComparison {
    public static void main(String[] args) {
        // ── 1. Arrays.asList — fixed-size, but set() is allowed ────────
        List<String> asList = Arrays.asList("a", "b", "c");
        asList.set(0, "X");             // ← allowed: set() works on Arrays.asList
        System.out.println("After set: " + asList);    // [X, b, c]
        try {
            asList.add("d");            // ← throws UnsupportedOperationException
        } catch (UnsupportedOperationException e) {
            System.out.println("Arrays.asList add: " + e.getClass().getSimpleName());
        }

        // ── 2. Collections.unmodifiableList — view, not truly immutable ─
        List<String> mutable = new ArrayList<>(List.of("a", "b", "c"));
        List<String> unmod = Collections.unmodifiableList(mutable);
        mutable.add("d");               // ← original still mutable
        System.out.println("Unmod view after original.add: " + unmod); // sees the change!
        try {
            unmod.add("x");             // ← writing through the view throws
        } catch (UnsupportedOperationException e) {
            System.out.println("unmodifiableList add: " + e.getClass().getSimpleName());
        }

        // ── 3. List.of — truly immutable ────────────────────────────────
        List<String> immutable = List.of("a", "b", "c");
        try {
            immutable.set(0, "X");      // ← even set() throws
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of set: " + e.getClass().getSimpleName());
        }
        try {
            immutable.add("d");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of add: " + e.getClass().getSimpleName());
        }
        System.out.println("List.of unchanged: " + immutable);
    }
}
```

**Expected Output:**
```
After set: [X, b, c]
Arrays.asList add: UnsupportedOperationException
Unmod view after original.add: [a, b, c, d]
unmodifiableList add: UnsupportedOperationException
List.of set: UnsupportedOperationException
List.of add: UnsupportedOperationException
List.of unchanged: [a, b, c]
```

:::warning Common Mistake
`Collections.unmodifiableList` is only a **view** — anyone holding the original mutable reference can still modify what you think is immutable. Use `List.copyOf` or `List.of` for genuine immutability.
:::

---

## Example 2: Defensive Copying at API Boundaries

A service class that incorrectly stores a caller-supplied list vs. one that makes a defensive copy.

```java title="DefensiveCopy.java" showLineNumbers {5,6,12,13,28,29}
import java.util.*;

public class DefensiveCopy {

    // BAD: stores the caller's reference — caller can mutate the "internal" config
    static class BadConfig {
        private final List<String> allowedRoles;
        BadConfig(List<String> roles) {
            this.allowedRoles = roles;           // ← direct reference — not a copy
        }
        List<String> getRoles() { return allowedRoles; }
    }

    // GOOD: makes an immutable defensive copy
    static class GoodConfig {
        private final List<String> allowedRoles;
        GoodConfig(List<String> roles) {
            this.allowedRoles = List.copyOf(roles); // ← immutable copy — caller can't mutate
        }
        List<String> getRoles() { return allowedRoles; } // safe to return — immutable
    }

    public static void main(String[] args) {
        List<String> roles = new ArrayList<>(List.of("ADMIN", "USER"));

        // BAD scenario
        BadConfig bad = new BadConfig(roles);
        System.out.println("Before mutation: " + bad.getRoles());
        roles.add("HACKER");             // ← caller adds a role after construction!
        System.out.println("After mutation:  " + bad.getRoles()); // reflects the add!

        // GOOD scenario — reset roles
        roles = new ArrayList<>(List.of("ADMIN", "USER"));
        GoodConfig good = new GoodConfig(roles);
        System.out.println("\nBefore mutation: " + good.getRoles());
        roles.add("HACKER");             // ← caller tries the same trick
        System.out.println("After mutation:  " + good.getRoles()); // unchanged!
    }
}
```

**Expected Output:**
```
Before mutation: [ADMIN, USER]
After mutation:  [ADMIN, USER, HACKER]

Before mutation: [ADMIN, USER]
After mutation:  [ADMIN, USER]
```

:::tip Key takeaway
Any class that stores a collection passed in from outside should make a defensive `List.copyOf` / `Set.copyOf` / `Map.copyOf` to prevent the caller from mutating internal state after the fact. This is especially important for config objects and domain entities.
:::

---

## Example 3: Map.of and Map.ofEntries — Creation Patterns

`Map.of` handles up to 10 pairs; `Map.ofEntries` handles any number.

```java title="ImmutableMapDemo.java" showLineNumbers {5,12,22}
import java.util.*;

public class ImmutableMapDemo {
    public static void main(String[] args) {
        // Map.of — for ≤ 10 key-value pairs
        Map<String, String> httpStatus = Map.of(
            "200", "OK",
            "404", "Not Found",
            "500", "Internal Server Error"
        );
        System.out.println("Status 200: " + httpStatus.get("200"));

        // Map.ofEntries — for > 10 or when readability matters
        Map<String, Integer> dayOrder = Map.ofEntries(
            Map.entry("Monday",    1),
            Map.entry("Tuesday",   2),
            Map.entry("Wednesday", 3),
            Map.entry("Thursday",  4),
            Map.entry("Friday",    5),
            Map.entry("Saturday",  6),
            Map.entry("Sunday",    7)
        );
        System.out.println("Days in week: " + dayOrder.size());
        System.out.println("Friday is day: " + dayOrder.get("Friday"));

        // Null keys/values are rejected
        try {
            Map.of("key", null);                          // ← NullPointerException at construction
        } catch (NullPointerException e) {
            System.out.println("Map.of with null value: NullPointerException");
        }

        // Duplicate keys detected at construction time
        try {
            Map.of("a", 1, "a", 2);                      // ← IllegalArgumentException
        } catch (IllegalArgumentException e) {
            System.out.println("Map.of with duplicate key: IllegalArgumentException");
        }
    }
}
```

**Expected Output:**
```
Status 200: OK
Days in week: 7
Friday is day: 5
Map.of with null value: NullPointerException
Map.of with duplicate key: IllegalArgumentException
```

---

## Exercises

1. **Easy**: Create a `List.of` with 5 integers. Try to sort it with `Collections.sort`. Observe the exception and explain why — then fix it by wrapping in a `new ArrayList<>()`.
2. **Medium**: Write a `UserService.getPermissions(userId)` method that returns an immutable `Set<String>` — backed by an internal mutable `Map<Integer, Set<String>>`. Ensure that no caller can modify the internal set.
3. **Hard**: Benchmark memory allocation for `List.of("a","b","c")` vs `new ArrayList<>(Arrays.asList("a","b","c"))` using a loop of 1,000,000 iterations. Measure with `Runtime.totalMemory() - freeMemory()`. Discuss why `List.of` is more memory-efficient.

---

## Back to Topic

Return to the [Immutable Collections](../immutable-collections.md) note for theory, interview questions, and further reading.
