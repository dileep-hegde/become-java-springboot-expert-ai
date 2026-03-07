---
id: records-demo
title: "Records — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Records (Java 16+) in Java.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-07
---

# Records — Practical Demo

> Hands-on examples for [Records (Java 16+)](../records.md). See what the compiler generates, validate with compact constructors, use records as Map keys, and model polymorphic shapes with sealed interfaces.

:::info Prerequisites
Understand [Classes & Objects](../classes-and-objects.md) and [Encapsulation](../encapsulation.md) — records replace the boilerplate of immutable value classes.
:::

---

## Example 1: What the Compiler Generates for You

A before/after comparison showing the 30+ line handwritten class versus a one-line record.

```java title="RecordGenerated.java" showLineNumbers {4,26,27}
import java.util.Objects;

public class RecordGenerated {

    // BEFORE Java 16 — 30+ lines of boilerplate
    public static final class PointOld {
        private final int x;
        private final int y;

        public PointOld(int x, int y) { this.x = x; this.y = y; }

        public int x() { return x; }
        public int y() { return y; }

        @Override public boolean equals(Object o) {
            if (!(o instanceof PointOld p)) return false;
            return x == p.x && y == p.y;
        }
        @Override public int hashCode()     { return Objects.hash(x, y); }
        @Override public String toString()  { return "PointOld[x=" + x + ", y=" + y + "]"; }
    }

    // AFTER Java 16 — one line; compiler generates everything above
    record Point(int x, int y) {}

    public static void main(String[] args) {
        // Records behave identically to the hand-written class
        Point p1 = new Point(3, 4);
        Point p2 = new Point(3, 4);
        Point p3 = new Point(5, 6);

        System.out.println("p1            : " + p1);          // Point[x=3, y=4]
        System.out.println("p2            : " + p2);          // Point[x=3, y=4]
        System.out.println("p1.x()        : " + p1.x());      // 3  ← accessor, NOT getX()
        System.out.println("p1.equals(p2) : " + p1.equals(p2)); // true  — value equality
        System.out.println("p1.equals(p3) : " + p1.equals(p3)); // false
        System.out.println("p1 == p2      : " + (p1 == p2));    // false — different references

        // Records work as Map keys because hashCode/equals are correct by default
        java.util.Map<Point, String> labels = java.util.Map.of(
            new Point(0, 0), "origin",
            new Point(1, 0), "unit-x"
        );
        System.out.println("label at (0,0): " + labels.get(new Point(0, 0))); // origin
    }
}
```

**Expected Output:**
```
p1            : Point[x=3, y=4]
p2            : Point[x=3, y=4]
p1.x()        : 3
p1.equals(p2) : true
p1.equals(p3) : false
p1 == p2      : false
label at (0,0): origin
```

:::tip Key takeaway
Records use `x()` not `getX()` — a deliberate design choice. Because `equals` and `hashCode` are value-based by default, records are safe and natural to use as `Map` keys and `Set` elements without any extra work.
:::

---

## Example 2: Compact Constructors for Validation and Normalization

A `Range`, `Email`, and `Money` record showing validation and normalization in compact constructors.

```java title="CompactConstructors.java" showLineNumbers {7,8,16,17,25,26}
public class CompactConstructors {

    record Range(int min, int max) {
        // Compact constructor — no parameter list; compiler adds `this.min = min; this.max = max;` after
        Range {
            if (min > max)
                throw new IllegalArgumentException(
                    "min (" + min + ") must be <= max (" + max + ")");
        }
    }

    record Email(String address) {
        Email {
            if (address == null || !address.contains("@"))
                throw new IllegalArgumentException("Invalid email: " + address);
            address = address.strip().toLowerCase(); // ← normalize BEFORE auto-assignment
        }
    }

    record Money(double amount, String currency) {
        Money {
            if (amount < 0) throw new IllegalArgumentException("amount cannot be negative");
            currency = currency.toUpperCase(); // ← normalize currency code
        }

        // Custom instance method — records can have these
        Money add(Money other) {
            if (!currency.equals(other.currency)) throw new IllegalArgumentException("Currency mismatch");
            return new Money(amount + other.amount, currency); // ← new instance (immutable)
        }

        @Override public String toString() { return String.format("%.2f %s", amount, currency); }
    }

    public static void main(String[] args) {
        // Valid constructions
        System.out.println(new Range(1, 10));      // Range[min=1, max=10]
        System.out.println(new Email("  Alice@Example.COM  ")); // Email[address=alice@example.com]
        Money m1 = new Money(10.50, "usd");
        Money m2 = new Money(5.25, "USD");
        System.out.println(m1 + " + " + m2 + " = " + m1.add(m2));

        // Invalid constructions — compact constructor catches these
        try { new Range(10, 1); }
        catch (IllegalArgumentException e) { System.out.println("Caught: " + e.getMessage()); }

        try { new Email("not-an-email"); }
        catch (IllegalArgumentException e) { System.out.println("Caught: " + e.getMessage()); }

        try { new Money(-5, "EUR"); }
        catch (IllegalArgumentException e) { System.out.println("Caught: " + e.getMessage()); }
    }
}
```

**Expected Output:**
```
Range[min=1, max=10]
Email[address=alice@example.com]
10.50 USD + 5.25 USD = 15.75 USD
Caught: min (10) must be <= max (1)
Caught: Invalid email: not-an-email
Caught: amount cannot be negative
```

:::tip Key takeaway
The compact constructor body runs **before** the compiler's automatic `this.min = min` assignments. This means you can normalize values (like `address = address.lowercase()`) and the normalized value is what gets stored — not the raw input. Contrast this with full canonical constructors where you'd need to do it manually.
:::

---

## Example 3: Records as DTOs and with Pattern Matching

A full data pipeline: domain records, transformation to response records, and Java 21 record pattern destructuring.

```java title="RecordDtoPipeline.java" showLineNumbers {33,34,35}
import java.util.*;
import java.util.stream.*;

public class RecordDtoPipeline {

    // Domain records — represent stored data
    record UserId(long value) {}

    record User(UserId id, String name, String email, boolean active) {}

    // Response DTO — what the API returns (subset of User fields)
    record UserSummary(long id, String name, String email) {
        // Convenience factory from domain User
        static UserSummary from(User u) {
            return new UserSummary(u.id().value(), u.name(), u.email());
        }
    }

    // A sealed event type for user activity
    sealed interface UserEvent permits UserEvent.LoggedIn, UserEvent.ProfileUpdated, UserEvent.Deactivated {
        record LoggedIn(UserId userId, String ipAddress)     implements UserEvent {}
        record ProfileUpdated(UserId userId, String field)   implements UserEvent {}
        record Deactivated(UserId userId, String reason)     implements UserEvent {}
    }

    static String describeEvent(UserEvent event) {
        // Java 21 record pattern — destructures the record directly in the case
        return switch (event) {
            case UserEvent.LoggedIn(var uid, var ip)          -> "User " + uid.value() + " logged in from " + ip;
            case UserEvent.ProfileUpdated(var uid, var field) -> "User " + uid.value() + " updated " + field;
            case UserEvent.Deactivated(var uid, var reason)   -> "User " + uid.value() + " deactivated: " + reason;
        };
    }

    public static void main(String[] args) {
        // Build domain users
        List<User> users = List.of(
            new User(new UserId(1), "Alice", "alice@example.com", true),
            new User(new UserId(2), "Bob",   "bob@example.com",   false),
            new User(new UserId(3), "Carol", "carol@example.com", true)
        );

        // Filter + transform to DTOs using streams
        System.out.println("=== Active User Summaries ===");
        users.stream()
            .filter(User::active)
            .map(UserSummary::from)
            .forEach(System.out::println);

        // Process events with record pattern matching
        System.out.println("\n=== Event Log ===");
        List<UserEvent> events = List.of(
            new UserEvent.LoggedIn(new UserId(1), "192.168.1.10"),
            new UserEvent.ProfileUpdated(new UserId(1), "email"),
            new UserEvent.Deactivated(new UserId(2), "policy violation")
        );
        events.stream().map(RecordDtoPipeline::describeEvent).forEach(System.out::println);
    }
}
```

**Expected Output:**
```
=== Active User Summaries ===
UserSummary[id=1, name=Alice, email=alice@example.com]
UserSummary[id=3, name=Carol, email=carol@example.com]

=== Event Log ===
User 1 logged in from 192.168.1.10
User 1 updated email
User 2 deactivated: policy violation
```

:::tip Key takeaway
Records compose naturally — `UserId` is a tiny wrapper record used as a field inside `User`, which prevents accidentally passing a raw `long` in the wrong place (type safety). The sealed interface + record variants + `switch` pattern matching in `describeEvent` is exhaustive — add a new event type and the compiler will flag every unhandled `switch` immediately.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `contains(int value)` method to the `Range` record in Example 2 that returns `true` if `min <= value <= max`. Verify with a few test cases.
2. **Medium**: Create a `PageRequest` record with `page` (0-based) and `size` (1–100). Use a compact constructor to clamp `size` to the range [1, 100] rather than throwing — so `new PageRequest(0, 500)` becomes `PageRequest[page=0, size=100]`.
3. **Hard**: Extend Example 3's `UserEvent` sealed hierarchy with a new `PasswordChanged(UserId userId, String strength)` event. Update `describeEvent` to handle it. Verify the compiler flags the missing case before you fix it.

---

## Back to Topic

Return to the [Records (Java 16+)](../records.md) note for theory, interview questions, and further reading.
