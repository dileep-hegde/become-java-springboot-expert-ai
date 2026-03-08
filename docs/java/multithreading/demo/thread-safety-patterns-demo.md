---
id: thread-safety-patterns-demo
title: "Thread Safety Patterns — Practical Demo"
description: Hands-on walkthroughs of immutable objects, defensive copying, ThreadLocal usage (and cleanup), and safe publication.
sidebar_position: 7
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Thread Safety Patterns — Practical Demo

> Hands-on examples for [Thread Safety Patterns](../thread-safety-patterns.md). We show when shared state disappears entirely — and why that's better than any lock.

:::info Prerequisites
Understand [Synchronization](../synchronization.md) — these patterns eliminate the need for it, but the contrast only makes sense if you know what problem they're solving.
:::

---

## Example 1: Immutable `Money` Class

An immutable value type — no synchronization needed, ever.

```java title="ImmutableMoneyDemo.java" showLineNumbers {4,5,13,17}
import java.util.Objects;

public final class Money {                           // {4} ← final: no mutable subclass possible
    private final long cents;                        // {5} ← final: set once in constructor
    private final String currency;

    public Money(long cents, String currency) {
        this.cents = cents;
        this.currency = Objects.requireNonNull(currency);
    }

    // "Mutation" returns a NEW instance
    public Money add(Money other) {
        if (!this.currency.equals(other.currency))
            throw new IllegalArgumentException("Currency mismatch");
        return new Money(this.cents + other.cents, this.currency); // {13} ← new object, original unchanged
    }

    public long getCents()    { return cents; }
    public String getCurrency() { return currency; }

    @Override public String toString() { return cents / 100.0 + " " + currency; }

    public static void main(String[] args) throws InterruptedException {
        Money price = new Money(1999, "USD");  // ← $19.99

        // Share across 10 threads — zero synchronization needed
        Thread[] threads = new Thread[10];
        for (int i = 0; i < threads.length; i++) {
            Money tax = new Money(i * 10, "USD"); // each thread has its own tax
            threads[i] = new Thread(() -> {
                Money total = price.add(tax);     // {17} ← creates new Money; price unchanged
                System.out.println(Thread.currentThread().getName() + ": total = " + total);
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("Original price unchanged: " + price);
    }
}
```

**Expected Output (order varies):**
```
Thread-0: total = 19.99 USD
Thread-1: total = 20.09 USD
...
Original price unchanged: 19.99 USD
```

:::tip Key takeaway
`price` is shared across all 10 threads. Because it is immutable, no lock is required. Reads are inherently thread-safe. "Mutations" produce new objects.
:::

---

## Example 2: Defensive Copying — Preventing External Mutation

Without defensive copies, a caller can mutate what appears to be private state.

```java title="DefensiveCopyDemo.java" showLineNumbers {8,15,24}
import java.util.List;

public final class Route {
    private final List<String> stops;

    // WITHOUT defensive copy — UNSAFE
    public Route_Unsafe(List<String> stops) {
        this.stops = stops;  // {8} ← stores the caller's reference — they can mutate it!
    }

    // WITH defensive copy — SAFE
    public Route(List<String> stops) {
        this.stops = List.copyOf(stops); // {15} ← creates an unmodifiable snapshot
    }

    public List<String> getStops() {
        return stops; // ← safe: List.copyOf returns unmodifiable
    }

    public static void main(String[] args) {
        var mutableList = new java.util.ArrayList<>(List.of("A", "B", "C"));
        Route route = new Route(mutableList);

        mutableList.add("D"); // ← mutate the original AFTER construction
        System.out.println("Route stops: " + route.getStops()); // {24} ← prints [A, B, C], not [A, B, C, D]

        // Prove the returned list is unmodifiable
        try {
            route.getStops().add("E");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot mutate returned list: " + e.getClass().getSimpleName());
        }
    }
}
```

**Expected Output:**
```
Route stops: [A, B, C]
Cannot mutate returned list: UnsupportedOperationException
```

---

## Example 3: `ThreadLocal` — Per-Thread Date Formatter

`SimpleDateFormat` is not thread-safe. `ThreadLocal` gives each thread its own instance.

```java title="ThreadLocalDemo.java" showLineNumbers {7,13,22}
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.*;

public class ThreadLocalDemo {

    // Each thread gets its OWN SimpleDateFormat — no synchronization needed
    private static final ThreadLocal<SimpleDateFormat> formatter =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")); // {7}

    static String formatDate(Date date) {
        return formatter.get().format(date); // {13} ← reads THIS thread's instance
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService exec = Executors.newFixedThreadPool(5);

        for (int i = 0; i < 5; i++) {
            Date date = new Date(System.currentTimeMillis() + i * 1000L);
            exec.submit(() -> {
                System.out.println(Thread.currentThread().getName() +
                    " formatted: " + formatDate(date));
                formatter.remove(); // {22} ← CRITICAL: clean up to prevent leaks in thread pools
            });
        }

        exec.shutdown();
        exec.awaitTermination(3, TimeUnit.SECONDS);
    }
}
```

**Expected Output:**
```
pool-1-thread-1 formatted: 2026-03-08 12:00:00
pool-1-thread-2 formatted: 2026-03-08 12:00:01
...
```

:::warning Common Mistake
Forgetting `formatter.remove()` in a thread pool. The thread is reused after the task. The next task that calls `formatter.get()` on the same thread gets the previous task's `SimpleDateFormat` instance — which in this case is fine, but with `ThreadLocal<String>` holding a user ID or tenant context, it's a data-leakage bug.
:::

---

## Example 4: Request Context Holder (Spring Security–style)

A simplified version of how Spring Security's `SecurityContextHolder` works.

```java title="RequestContextHolderDemo.java" showLineNumbers {6,14,19,25}
import java.util.concurrent.*;

public class RequestContextHolderDemo {

    static final ThreadLocal<String> currentUser = new ThreadLocal<>(); // {6}

    // Simulates what a servlet filter does
    static void handleRequest(String user, Runnable handler) {
        currentUser.set(user);                     // ← bind user to this thread
        try {
            handler.run();
        } finally {
            currentUser.remove();                  // {14} ← always clear — thread goes back to pool
        }
    }

    static String getCurrentUser() {
        return currentUser.get();                  // ← read this thread's user — no param passing needed
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService exec = Executors.newFixedThreadPool(3);

        for (String user : List.of("alice", "bob", "carol", "dave", "eve")) {
            exec.submit(() ->
                handleRequest(user, () -> {        // {19} ← simulate request handling
                    System.out.println(Thread.currentThread().getName() +
                        " processing request for: " + getCurrentUser()); // {25}
                    // ... service layer calls getCurrentUser() without needing parameters
                })
            );
        }

        exec.shutdown();
        exec.awaitTermination(3, TimeUnit.SECONDS);
    }
}
```

**Expected Output (order varies):**
```
pool-1-thread-1 processing request for: alice
pool-1-thread-2 processing request for: bob
pool-1-thread-3 processing request for: carol
pool-1-thread-1 processing request for: dave
pool-1-thread-2 processing request for: eve
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a mutable `List<String> tags` field to `Money`. Try making it immutable-safe with a defensive copy in the constructor and an unmodifiable view in the getter.
2. **Medium**: Remove `formatter.remove()` from Example 3. In a fixed pool of 2 threads, run 10 tasks — alternate tasks modify the formatter's pattern via a `ThreadLocal<SimpleDateFormat>` subclass. Observe stale formatter behavior leaking across tasks.
3. **Hard**: Implement a `ScopedRequestContext` that propagates the current user to child threads spawned within the same request using `InheritableThreadLocal`. Demonstrate that threads spawned from the request handler inherit the user, while threads outside the request scope do not.
