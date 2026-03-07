---
id: classes-and-objects-demo
title: "Classes & Objects — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Classes & Objects in Java.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - beginner
  - demo
last_updated: 2026-03-07
---

# Classes & Objects — Practical Demo

> Hands-on examples for [Classes & Objects](../classes-and-objects.md). Start with simple class construction, build up to static factory methods and reference semantics.

:::info Prerequisites
Before running these examples, make sure you understand [Classes & Objects](../classes-and-objects.md) — particularly fields, constructors, and `this`.
:::

---

## Example 1: Creating and Comparing Objects

This example shows the class/object relationship and the critical difference between reference equality (`==`) and value equality (`equals`).

```java title="ObjectBasics.java" showLineNumbers {15,16,17}
public class ObjectBasics {

    // A minimal class — fields + constructor + accessor
    static class Point {
        private final int x;
        private final int y;

        Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        int x() { return x; }
        int y() { return y; }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof Point p)) return false;
            return x == p.x && y == p.y;            // ← value comparison
        }

        @Override public int hashCode() { return 31 * x + y; }

        @Override public String toString() { return "Point(" + x + ", " + y + ")"; }
    }

    public static void main(String[] args) {
        Point a = new Point(3, 4);
        Point b = new Point(3, 4);
        Point c = a;                                // ← c and a point to the SAME object

        System.out.println("a = " + a);            // Point(3, 4)
        System.out.println("b = " + b);            // Point(3, 4)

        System.out.println("a == b  : " + (a == b));          // false — different references
        System.out.println("a == c  : " + (a == c));          // true  — same reference
        System.out.println("a.equals(b): " + a.equals(b));    // true  — same values
    }
}
```

**Expected Output:**
```
a = Point(3, 4)
b = Point(3, 4)
a == b  : false
a == c  : true
a.equals(b): true
```

:::tip Key takeaway
`==` compares memory addresses (references), not content. Always use `equals()` to compare object values. If you don't override `equals()`, the default `Object.equals()` falls back to `==`.
:::

---

## Example 2: Static vs. Instance Members

This example demonstrates how static fields are shared across all instances while instance fields are independent — and where `static` methods fit in.

```java title="Counter.java" showLineNumbers {3,4,14,15}
public class Counter {

    private static int totalCreated = 0; // ← shared by every Counter object
    private final int id;                // ← unique per instance
    private int count = 0;

    public Counter() {
        totalCreated++;            // ← modifies the class-level count
        this.id = totalCreated;    // ← sets this instance's immutable id
    }

    public void increment() { count++; }
    public int getCount()   { return count; }
    public int getId()      { return id; }

    // Static method — no 'this'; cannot access instance fields
    public static int getTotalCreated() { return totalCreated; }

    public static void main(String[] args) {
        Counter c1 = new Counter();     // totalCreated = 1, c1.id = 1
        Counter c2 = new Counter();     // totalCreated = 2, c2.id = 2
        Counter c3 = new Counter();     // totalCreated = 3, c3.id = 3

        c1.increment();
        c1.increment();
        c2.increment();

        System.out.println("c1 (id=" + c1.getId() + ") count: " + c1.getCount()); // 2
        System.out.println("c2 (id=" + c2.getId() + ") count: " + c2.getCount()); // 1
        System.out.println("c3 (id=" + c3.getId() + ") count: " + c3.getCount()); // 0
        System.out.println("Total counters created: " + Counter.getTotalCreated()); // 3
    }
}
```

**Expected Output:**
```
c1 (id=1) count: 2
c2 (id=2) count: 1
c3 (id=3) count: 0
Total counters created: 3
```

:::tip Key takeaway
Instance fields (`count`, `id`) live with each object — each counter has its own. Static fields (`totalCreated`) live with the class — one copy, shared by all objects. Call static methods on the class name (`Counter.getTotalCreated()`), not an instance.
:::

---

## Example 3: Static Factory Method + Constructor Chaining

This production-style example shows constructor chaining with `this(...)` and a named static factory that validates before creating an object.

```java title="DatabaseConnection.java" showLineNumbers {14,22,23,24,30}
public class DatabaseConnection {

    private final String host;
    private final int    port;
    private final String database;
    private final int    timeoutMs;

    // Primary constructor — all four parameters, single place for assignment
    private DatabaseConnection(String host, int port, String database, int timeoutMs) {
        this.host      = host;
        this.port      = port;
        this.database  = database;
        this.timeoutMs = timeoutMs;
    }

    // Convenience constructor — applies a sensible default timeout
    private DatabaseConnection(String host, int port, String database) {
        this(host, port, database, 5000); // ← delegates to primary constructor
    }

    // Static factory — validates and then constructs
    public static DatabaseConnection of(String host, int port, String database) {
        if (host == null || host.isBlank()) throw new IllegalArgumentException("host required");
        if (port < 1 || port > 65535)       throw new IllegalArgumentException("invalid port: " + port);
        if (database == null || database.isBlank()) throw new IllegalArgumentException("database required");
        return new DatabaseConnection(host, port, database); // ← uses convenience constructor
    }

    // Factory overload with custom timeout
    public static DatabaseConnection of(String host, int port, String database, int timeoutMs) {
        if (timeoutMs <= 0) throw new IllegalArgumentException("timeoutMs must be positive");
        return new DatabaseConnection(host, port, database, timeoutMs);
    }

    @Override
    public String toString() {
        return host + ":" + port + "/" + database + " (timeout=" + timeoutMs + "ms)";
    }

    public static void main(String[] args) {
        DatabaseConnection conn1 = DatabaseConnection.of("localhost", 5432, "mydb");
        DatabaseConnection conn2 = DatabaseConnection.of("prod-db.example.com", 5432, "orders", 10_000);

        System.out.println(conn1);
        System.out.println(conn2);

        try {
            DatabaseConnection.of("", 5432, "mydb"); // ← invalid host
        } catch (IllegalArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

**Expected Output:**
```
localhost:5432/mydb (timeout=5000ms)
prod-db.example.com:5432/orders (timeout=10000ms)
Caught: host required
```

:::warning Common Mistake
Forgetting to use `this(...)` for constructor chaining and duplicating initialization logic across multiple constructors instead. When you change a field later you'll update some constructors but miss others — `this(...)` delegation ensures one source of truth.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `reset()` method to `Counter` that resets `count` to `0`. Verify that calling `c1.reset()` doesn't affect `c2`.
2. **Medium**: Extend `DatabaseConnection` with a `withTimeout(int ms)` method that returns a new `DatabaseConnection` with the updated timeout (immutable style).
3. **Hard**: Create an `Order` class with `id` (auto-incrementing static), `customerId`, `items` (`List<String>`), and a static factory that makes a defensive copy of the items list. Write a test that proves mutating the original list after creation doesn't affect the `Order`.

---

## Back to Topic

Return to the [Classes & Objects](../classes-and-objects.md) note for theory, interview questions, and further reading.
