---
id: java-util-concurrent-demo
title: "java.util.concurrent — Practical Demo"
description: Hands-on walkthroughs of ExecutorService, CompletableFuture pipelines, CountDownLatch, and Semaphore.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# java.util.concurrent — Practical Demo

> Hands-on examples for [java.util.concurrent](../java-util-concurrent.md). Build from a simple thread pool through to async CompletableFuture pipelines.

:::info Prerequisites
Understand [Threads & Lifecycle](../threads-and-lifecycle.md) — especially why thread creation is expensive — before seeing how ExecutorService solves it.
:::

---

## Example 1: Fixed Thread Pool with `ExecutorService`

Submit multiple tasks to a 3-thread pool and observe task-to-thread mapping.

```java title="ExecutorServiceDemo.java" showLineNumbers {5,7,16,20}
import java.util.concurrent.*;

public class ExecutorServiceDemo {

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        ExecutorService executor = Executors.newFixedThreadPool(3); // {5} ← pool of 3 reusable threads

        // Submit 6 tasks to a 3-thread pool — half must wait
        List<Future<String>> futures = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            int taskId = i;
            Future<String> f = executor.submit(() -> {             // {7} ← Callable returns a result
                Thread.sleep(500);
                return "Task-" + taskId + " done by " + Thread.currentThread().getName();
            });
            futures.add(f);
        }

        // Collect results
        for (Future<String> f : futures) {
            System.out.println(f.get()); // {16} ← blocks until that task finishes
        }

        executor.shutdown();                     // {20} ← graceful shutdown; waits for in-progress tasks
        executor.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("All tasks done.");
    }
}
```

**Expected Output (thread names will vary):**
```
Task-1 done by pool-1-thread-1
Task-2 done by pool-1-thread-2
Task-3 done by pool-1-thread-3
Task-4 done by pool-1-thread-1    (thread reused from pool)
Task-5 done by pool-1-thread-2
Task-6 done by pool-1-thread-3
All tasks done.
```

:::tip Key takeaway
Notice that Tasks 4–6 reuse the same thread names as Tasks 1–3. Thread pool threads are reused — no new OS threads are created for Tasks 4–6.
:::

---

## Example 2: `CompletableFuture` Pipeline

Chain async steps: fetch a user → enrich with orders → log the result.

```java title="CompletableFutureDemo.java" showLineNumbers {11,17,21,27}
import java.util.concurrent.*;

public class CompletableFutureDemo {

    record User(int id, String name) {}
    record Order(int userId, String product) {}
    record Summary(String userName, String product) {}

    static ExecutorService ioExecutor = Executors.newFixedThreadPool(4, r -> {
        Thread t = new Thread(r, "io-worker");
        t.setDaemon(true);
        return t;
    });

    public static void main(String[] args) throws Exception {
        CompletableFuture<Summary> pipeline =
            CompletableFuture.supplyAsync(() -> fetchUser(1), ioExecutor)    // {11} ← step 1: async fetch
                .thenApply(user -> {
                    System.out.println("Got user: " + user.name());
                    return user;
                })
                .thenCompose(user ->                                          // {17} ← step 2: chain another async
                    CompletableFuture.supplyAsync(() -> fetchOrder(user), ioExecutor)
                        .thenApply(order -> new Summary(user.name(), order.product()))
                )
                .exceptionally(ex -> {                                       // {21} ← handle any step's exception
                    System.err.println("Pipeline failed: " + ex.getMessage());
                    return new Summary("unknown", "no-order");
                });

        Summary result = pipeline.get(5, TimeUnit.SECONDS);                 // {27} ← wait max 5s
        System.out.println("Summary: " + result.userName() + " ordered " + result.product());
        ioExecutor.shutdown();
    }

    static User fetchUser(int id) {
        try { Thread.sleep(300); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        return new User(id, "Alice");
    }

    static Order fetchOrder(User user) {
        try { Thread.sleep(200); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        return new Order(user.id(), "Laptop");
    }
}
```

**Expected Output:**
```
Got user: Alice
Summary: Alice ordered Laptop
```

---

## Example 3: `CountDownLatch` — Parallel Initialization Gate

Wait for N services to start before opening the application.

```java title="CountDownLatchDemo.java" showLineNumbers {7,17,22}
import java.util.concurrent.*;

public class CountDownLatchDemo {

    public static void main(String[] args) throws InterruptedException {
        int serviceCount = 4;
        CountDownLatch ready = new CountDownLatch(serviceCount); // {7} ← count = 4
        ExecutorService executor = Executors.newFixedThreadPool(serviceCount);

        String[] services = {"DatabaseService", "CacheService", "MessageQueue", "ConfigService"};

        for (String service : services) {
            executor.submit(() -> {
                try {
                    Thread.sleep((long)(Math.random() * 1000)); // ← simulate init time
                    System.out.println(service + ": ready");
                    ready.countDown();                           // {17} ← decrement count
                } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            });
        }

        System.out.println("Main: waiting for all services...");
        ready.await();                                           // {22} ← blocks until count = 0
        System.out.println("Main: all services ready — opening for traffic!");
        executor.shutdown();
    }
}
```

**Expected Output (order of service lines varies):**
```
Main: waiting for all services...
CacheService: ready
ConfigService: ready
DatabaseService: ready
MessageQueue: ready
Main: all services ready — opening for traffic!
```

---

## Example 4: `Semaphore` — Rate Limiting

Limit concurrent access to a shared resource to 3 threads at a time.

```java title="SemaphoreDemo.java" showLineNumbers {7,14,18}
import java.util.concurrent.*;

public class SemaphoreDemo {

    public static void main(String[] args) throws InterruptedException {
        int maxConcurrent = 3;
        Semaphore semaphore = new Semaphore(maxConcurrent); // {7} ← 3 permits available
        ExecutorService executor = Executors.newFixedThreadPool(10);

        for (int i = 1; i <= 10; i++) {
            int id = i;
            executor.submit(() -> {
                try {
                    semaphore.acquire();                          // {14} ← blocks if 0 permits left
                    System.out.println("Thread-" + id + " accessing resource. Active: " +
                        (maxConcurrent - semaphore.availablePermits()));
                    Thread.sleep(500);                            // ← simulate work
                } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
                finally {
                    semaphore.release();                          // {18} ← ALWAYS release in finally
                    System.out.println("Thread-" + id + " released.");
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);
    }
}
```

**Expected Output (note max "Active: 3" at any time):**
```
Thread-1 accessing resource. Active: 1
Thread-2 accessing resource. Active: 2
Thread-3 accessing resource. Active: 3
Thread-1 released.
Thread-4 accessing resource. Active: 3
...
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: In Example 1, change `newFixedThreadPool(3)` to `newSingleThreadExecutor()` and observe that tasks run strictly one at a time in submission order.
2. **Medium**: Add a step to Example 2's `CompletableFuture` pipeline that simulates a network failure (`throw new RuntimeException("db down")`). Verify `exceptionally()` catches it and returns the fallback `Summary`.
3. **Hard**: Use `CompletableFuture.allOf()` to run 10 parallel I/O tasks simultaneously, collect all results from the returned `CompletableFuture<Void>` by calling `join()` on each individual future, and measure the total elapsed time. Compare it to running the same 10 tasks sequentially.
