---
id: synchronization-demo
title: "Synchronization — Practical Demo"
description: Hands-on examples showing race conditions, synchronized fixes, volatile usage, and the happens-before relationship.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Synchronization — Practical Demo

> Hands-on examples for [Synchronization](../synchronization.md). We start by deliberately breaking things, then fix them.

:::info Prerequisites
Understand [Threads & Lifecycle](../threads-and-lifecycle.md) first — you need to know how to start threads before observing race conditions.
:::

---

## Example 1: Witnessing a Race Condition

Run this code and observe the unpredictable final count — the textbook race condition.

```java title="RaceConditionDemo.java" showLineNumbers {5,14,20}
import java.util.concurrent.CountDownLatch;

public class RaceConditionDemo {
    static int count = 0; // ← shared, unprotected mutable state   {5}

    public static void main(String[] args) throws InterruptedException {
        int threads = 10;
        int incrementsPerThread = 10_000;
        CountDownLatch latch = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            new Thread(() -> {
                for (int j = 0; j < incrementsPerThread; j++) {
                    count++; // {14} ← NOT atomic: read-increment-write, 3 steps
                }
                latch.countDown();
            }).start();
        }

        latch.await();
        System.out.println("Expected: " + (threads * incrementsPerThread)); // 100000
        System.out.println("Actual:   " + count); // ← almost always < 100000  {20}
    }
}
```

**Expected Output (sample — your numbers will differ):**
```
Expected: 100000
Actual:   87342
```

:::warning Key takeaway
The final count is almost certainly below 100,000 because `count++` is not atomic. Two threads can read the same value, both add 1, and both write the same incremented value — losing one increment.
:::

---

## Example 2: Fix with `synchronized`

The same counter, protected with `synchronized`.

```java title="SynchronizedCounterDemo.java" showLineNumbers {4,8,14}
import java.util.concurrent.CountDownLatch;

public class SynchronizedCounterDemo {
    static int count = 0;
    static final Object lock = new Object(); // ← dedicated lock object   {4}

    public static void main(String[] args) throws InterruptedException {
        int threads = 10, incrementsEach = 10_000;
        CountDownLatch latch = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            new Thread(() -> {
                for (int j = 0; j < incrementsEach; j++) {
                    synchronized (lock) { // {8} ← only one thread in this block at a time
                        count++;
                    }
                }
                latch.countDown();
            }).start();
        }

        latch.await();
        System.out.println("Count: " + count); // ← always 100000  {14}
    }
}
```

**Expected Output:**
```
Count: 100000
```

---

## Example 3: `volatile` for a Stop Flag

`volatile` is sufficient for simple visibility — perfect for a stop flag written by one thread and read by others.

```java title="VolatileStopFlagDemo.java" showLineNumbers {4,10,21}
public class VolatileStopFlagDemo {

    static volatile boolean running = true; // {4} ← volatile: writes visible across threads

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            int iterations = 0;
            while (running) {           // ← reads fresh value every iteration; no caching
                iterations++;
            }
            System.out.println("Worker stopped after " + iterations + " iterations."); // {10}
        }, "worker");

        worker.start();
        Thread.sleep(500);

        running = false;  // {21} ← write immediately visible to worker thread via volatile
        worker.join();
        System.out.println("Main: done.");
    }
}
```

**Expected Output:**
```
Worker stopped after <large number> iterations.
Main: done.
```

:::tip Key takeaway
`volatile` solves the visibility problem but NOT the atomicity problem. `running = false` is a simple write — `volatile` is sufficient. For `count++` (read-modify-write), you still need `synchronized` or `AtomicInteger`.
:::

---

## Example 4: Double-Checked Locking (Safe Pattern)

The correct, thread-safe lazy singleton using `volatile`.

```java title="SafeSingleton.java" showLineNumbers {4,10,11,14}
public class SafeSingleton {
    // volatile prevents reordering of constructor writes with instance assignment
    private static volatile SafeSingleton instance; // {4}

    private final String config;

    private SafeSingleton() {
        this.config = System.getProperty("app.config", "default");
        System.out.println("SafeSingleton created on: " + Thread.currentThread().getName());
    }

    public static SafeSingleton getInstance() {
        if (instance == null) {                    // ← first unsynchronized check
            synchronized (SafeSingleton.class) {   // {10} ← only synchronize if null
                if (instance == null) {            // {11} ← double-check inside lock
                    instance = new SafeSingleton(); // {14} ← volatile prevents partial publish
                }
            }
        }
        return instance;
    }

    public static void main(String[] args) throws InterruptedException {
        // Simulate 5 threads racing to get the singleton
        for (int i = 0; i < 5; i++) {
            new Thread(() -> {
                SafeSingleton s = SafeSingleton.getInstance();
                System.out.println(Thread.currentThread().getName() + " got: " + s);
            }, "thread-" + i).start();
        }
    }
}
```

**Expected Output:**
```
SafeSingleton created on: thread-0   (or whichever wins first)
thread-0 got: SafeSingleton@...
thread-1 got: SafeSingleton@...    (same reference)
thread-2 got: SafeSingleton@...    (same reference)
...
```

:::warning Common Mistake
Omitting `volatile` on `instance` is the classic double-checked locking bug. The JIT can reorder the constructor writes and the instance assignment, making another thread see a non-null but partially initialized object.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Remove `volatile` from Example 3's `running` flag. On most JVMs, the worker will loop forever because it caches the stale value. Verify the behavior.
2. **Medium**: Rewrite Example 2 using `synchronized` methods on the counter class instead of an external lock object. Verify the result is the same.
3. **Hard**: Implement a thread-safe `BankAccount` with `deposit(int)`, `withdraw(int)`, and `getBalance()` methods. Run 20 threads doing random deposits and withdrawals and verify the final balance matches the expected algebraic sum.
