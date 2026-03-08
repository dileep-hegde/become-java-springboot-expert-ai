---
id: virtual-threads-demo
title: "Virtual Threads — Practical Demo"
description: Hands-on walkthroughs of creating virtual threads, measuring scalability, detecting pinning, and using StructuredTaskScope.
sidebar_position: 8
pagination_next: null
pagination_prev: null
tags:
  - java
  - advanced
  - demo
last_updated: 2026-03-08
---

# Virtual Threads — Practical Demo

> Hands-on examples for [Virtual Threads (Java 21+)](../virtual-threads.md). Requires Java 21 or later.

:::info Prerequisites
Understand [Threads & Lifecycle](../threads-and-lifecycle.md) and [java.util.concurrent](../java-util-concurrent.md). The scalability comparison only makes sense if you know platform thread costs.
:::

---

## Example 1: Creating Virtual Threads — Three Ways

```java title="VirtualThreadCreationDemo.java" showLineNumbers {8,14,21}
import java.util.concurrent.*;

public class VirtualThreadCreationDemo {

    public static void main(String[] args) throws InterruptedException {

        // --- Way 1: Thread.ofVirtual() ---
        Thread vt1 = Thread.ofVirtual()
            .name("vt-worker-", 0)     // ← numbered names: vt-worker-0, vt-worker-1, ...
            .start(() -> System.out.println("Running in: " + Thread.currentThread())); // {8}
        vt1.join();

        // --- Way 2: Thread.startVirtualThread() shorthand ---
        Thread vt2 = Thread.startVirtualThread(                                         // {14}
            () -> System.out.println("Virtual? " + Thread.currentThread().isVirtual())
        );
        vt2.join();

        // --- Way 3: Executor (recommended) ---
        try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {      // {21}
            for (int i = 0; i < 5; i++) {
                int id = i;
                exec.submit(() -> System.out.println("Task-" + id + " on: " + Thread.currentThread()));
            }
        } // ← try-with-resources auto-shuts-down and joins all tasks
    }
}
```

**Expected Output:**
```
Running in: VirtualThread[#21,vt-worker-0]/runnable@...
Virtual? true
Task-0 on: VirtualThread[#26]/runnable@...
Task-1 on: VirtualThread[#27]/runnable@...
...
```

:::tip Key takeaway
Every virtual thread has a unique ID (e.g., `#26`) but runs on a carrier thread from the JVM's `ForkJoinPool`. `isVirtual()` returns `true`.
:::

---

## Example 2: Scalability Comparison — Platform vs Virtual Threads

10,000 concurrent tasks with blocking I/O. Platform threads exhaust resources; virtual threads handle it trivially.

```java title="ScalabilityDemo.java" showLineNumbers {14,26}
import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

public class ScalabilityDemo {

    // Simulates blocking I/O (like a DB call or HTTP request)
    static String simulateBlockingIO(int taskId) throws InterruptedException {
        Thread.sleep(100); // ← 100ms blocking operation
        return "result-" + taskId;
    }

    public static void main(String[] args) throws Exception {
        int tasks = 10_000;

        // --- Platform threads: will likely fail or be very slow ---
        long start1 = System.currentTimeMillis();
        try (ExecutorService fixed = Executors.newFixedThreadPool(200)) { // {14} ← 200 threads max
            List<Future<String>> futures = new ArrayList<>();
            for (int i = 0; i < tasks; i++) {
                int id = i;
                futures.add(fixed.submit(() -> simulateBlockingIO(id)));
            }
            for (Future<String> f : futures) f.get();
        }
        System.out.printf("Platform (200 threads): %d ms%n", System.currentTimeMillis() - start1);

        // --- Virtual threads: one per task, trivially cheap ---
        long start2 = System.currentTimeMillis();
        try (ExecutorService vExec = Executors.newVirtualThreadPerTaskExecutor()) { // {26}
            List<Future<String>> futures = new ArrayList<>();
            for (int i = 0; i < tasks; i++) {
                int id = i;
                futures.add(vExec.submit(() -> simulateBlockingIO(id)));
            }
            for (Future<String> f : futures) f.get();
        }
        System.out.printf("Virtual threads:       %d ms%n", System.currentTimeMillis() - start2);
    }
}
```

**Expected Output (sample on 8-core machine):**
```
Platform (200 threads): 5100 ms   ← 10000 tasks / 200 threads × 100ms each = ~5s
Virtual threads:          120 ms   ← all 10000 run concurrently; limited only by JVM scheduler
```

---

## Example 3: Detecting Pinning

Run with `-Djdk.tracePinnedThreads=full` to see pinning in the JVM output.

```java title="PinningDemo.java" showLineNumbers {11,22}
import java.util.concurrent.*;

public class PinningDemo {

    // --- PINS the carrier thread ---
    static synchronized void blocksWithSync() throws InterruptedException {
        Thread.sleep(100); // ← synchronized + blocking = PINNED        {11}
    }

    // --- DOES NOT pin ---
    private static final java.util.concurrent.locks.ReentrantLock LOCK =
        new java.util.concurrent.locks.ReentrantLock();

    static void blocksWithLock() throws InterruptedException {
        LOCK.lock();
        try {
            Thread.sleep(100); // ← ReentrantLock + blocking = NOT pinned {22}
        } finally {
            LOCK.unlock();
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("--- With synchronized (pinning) ---");
        try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = new java.util.ArrayList<Future<?>>();
            for (int i = 0; i < 200; i++) futures.add(exec.submit(PinningDemo::blocksWithSync));
            for (var f : futures) f.get();
        }

        System.out.println("--- With ReentrantLock (no pinning) ---");
        try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = new java.util.ArrayList<Future<?>>();
            for (int i = 0; i < 200; i++) futures.add(exec.submit(PinningDemo::blocksWithLock));
            for (var f : futures) f.get();
        }

        System.out.println("Both complete — run with -Djdk.tracePinnedThreads=full to see pinning output.");
    }
}
```

**Expected Console Output:**
```
--- With synchronized (pinning) ---
--- With ReentrantLock (no pinning) ---
Both complete — run with -Djdk.tracePinnedThreads=full to see pinning output.
```

**With `-Djdk.tracePinnedThreads=full` you also see lines like:**
```
Thread[#26,<virtual>,<carrier>]
    com.example.PinningDemo.blocksWithSync(PinningDemo.java:11) <== monitors:1
```

---

## Example 4: Structured Concurrency with `StructuredTaskScope`

Fetch user and orders in parallel; if either fails, the other is cancelled automatically.

```java title="StructuredConcurrencyDemo.java" showLineNumbers {13,15,19,24}
import java.util.concurrent.*;
import jdk.incubator.concurrent.StructuredTaskScope;  // preview in Java 21

public class StructuredConcurrencyDemo {

    record User(int id, String name) {}
    record Orders(int userId, java.util.List<String> items) {}
    record Page(User user, Orders orders) {}

    public static void main(String[] args) throws Exception {
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {

            StructuredTaskScope.Subtask<User> userTask =
                scope.fork(() -> fetchUser(1));          // {13} ← run in a new virtual thread
            StructuredTaskScope.Subtask<Orders> ordersTask =
                scope.fork(() -> fetchOrders(1));         // {15} ← also in a new virtual thread

            scope.join();           // ← wait for both
            scope.throwIfFailed();  // {19} ← if either threw, propagate the exception

            Page page = new Page(userTask.get(), ordersTask.get()); // {24}
            System.out.println("Page: " + page.user().name() + " has " +
                page.orders().items().size() + " orders");
        }
        // ← scope closes — all subtasks are done or cancelled before we reach here
    }

    static User fetchUser(int id) throws InterruptedException {
        Thread.sleep(300);
        return new User(id, "Alice");
    }

    static Orders fetchOrders(int userId) throws InterruptedException {
        Thread.sleep(200);
        return new Orders(userId, java.util.List.of("Laptop", "Mouse"));
    }
}
```

:::info
`StructuredTaskScope` requires `--enable-preview` and `--add-modules jdk.incubator.concurrent` in Java 21. It became a standard preview API in Java 21 (JEP 453).
:::

**Expected Output (both tasks run in parallel — finishes in ~300ms, not 500ms):**
```
Page: Alice has 2 orders
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Run Example 1 and print `Thread.currentThread().isDaemon()` inside the virtual thread task. Observe that virtual threads are daemon threads by default.
2. **Medium**: In Example 2, vary the fixed thread pool size (50, 200, 1000) and observe the time. Then run the same measurements with virtual threads. Plot or log the relationship to understand why "just add more threads" doesn't scale linearly with platform threads.
3. **Hard**: In Example 4, make `fetchOrders` throw a `RuntimeException("database unavailable")`. Observe how `scope.throwIfFailed()` propagates the exception and that `fetchUser` (which completed successfully) has its result automatically discarded. Implement a fallback `ShutdownOnSuccess` version that returns whichever task finishes first.
