---
id: locks-demo
title: "Locks — Practical Demo"
description: Hands-on walkthroughs of ReentrantLock, ReadWriteLock, tryLock with timeout, and Condition-based signaling.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Locks — Practical Demo

> Hands-on examples for [Locks](../locks.md). We progress from basic `ReentrantLock` usage to timed locking, `ReadWriteLock`, and multiple `Condition` objects.

:::info Prerequisites
Understand [Synchronization](../synchronization.md) first — `ReentrantLock` is an explicit alternative to `synchronized`, so the contrast is only useful if you know what `synchronized` does.
:::

---

## Example 1: `ReentrantLock` — Basic Usage

A thread-safe counter using an explicit lock with the mandatory `try/finally` pattern.

```java title="ReentrantLockDemo.java" showLineNumbers {7,10,14}
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.*;

public class ReentrantLockDemo {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock();           // {7} ← acquire the lock before entering critical section
        try {
            count++;           // ← no other thread can be here simultaneously
        } finally {
            lock.unlock();     // {10} ← ALWAYS in finally — releases lock even on exception
        }
    }

    public int getCount() {
        lock.lock();
        try { return count; }
        finally { lock.unlock(); }
    }

    public static void main(String[] args) throws InterruptedException {
        ReentrantLockDemo demo = new ReentrantLockDemo();
        ExecutorService executor = Executors.newFixedThreadPool(10);

        for (int i = 0; i < 10; i++) {
            executor.submit(() -> {
                for (int j = 0; j < 10_000; j++) demo.increment();
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("Final count: " + demo.getCount()); // {14} ← always 100000
    }
}
```

**Expected Output:**
```
Final count: 100000
```

:::warning Key takeaway
The `try/finally` pattern is mandatory. Skipping `unlock()` in a failure path leaves the lock held forever, deadlocking all threads that subsequently try to acquire it.
:::

---

## Example 2: `tryLock` with Timeout — Avoiding Deadlock

`tryLock(timeout)` lets a thread give up and do something else if the lock isn't available.

```java title="TryLockDemo.java" showLineNumbers {12,17,22}
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.*;

public class TryLockDemo {
    private static final ReentrantLock lockA = new ReentrantLock();
    private static final ReentrantLock lockB = new ReentrantLock();

    static void transferAtoB(String threadName) throws InterruptedException {
        while (true) {
            // Try to acquire lockA first
            if (lockA.tryLock(100, TimeUnit.MILLISECONDS)) {   // {12} ← timeout: 100ms
                try {
                    if (lockB.tryLock(100, TimeUnit.MILLISECONDS)) {  // {17}
                        try {
                            System.out.println(threadName + ": transferred A→B");
                            return; // ← success; exit
                        } finally {
                            lockB.unlock();
                        }
                    } else {
                        System.out.println(threadName + ": couldn't get B, retrying...");
                    }
                } finally {
                    lockA.unlock();                              // {22} ← release A even if B failed
                }
            } else {
                System.out.println(threadName + ": couldn't get A, retrying...");
            }
            Thread.sleep(50); // ← back off before retry
        }
    }

    static void transferBtoA(String threadName) throws InterruptedException {
        while (true) {
            if (lockB.tryLock(100, TimeUnit.MILLISECONDS)) {
                try {
                    if (lockA.tryLock(100, TimeUnit.MILLISECONDS)) {
                        try {
                            System.out.println(threadName + ": transferred B→A");
                            return;
                        } finally {
                            lockA.unlock();
                        }
                    }
                } finally {
                    lockB.unlock();
                }
            }
            Thread.sleep(50);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> { try { transferAtoB("T1"); } catch (InterruptedException e) {} });
        Thread t2 = new Thread(() -> { try { transferBtoA("T2"); } catch (InterruptedException e) {} });
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println("Both transfers complete — no deadlock!");
    }
}
```

**Expected Output (exact retry counts vary):**
```
T1: transferred A→B
T2: transferred B→A
Both transfers complete — no deadlock!
```

---

## Example 3: `ReadWriteLock` — Concurrent Reads, Exclusive Writes

A read-heavy cache where many readers run simultaneously but writers are exclusive.

```java title="ReadWriteLockDemo.java" showLineNumbers {8,18,27,30}
import java.util.concurrent.locks.*;
import java.util.*;
import java.util.concurrent.*;

public class ReadWriteLockDemo {
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock readLock  = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();
    private final Map<String, String> cache = new HashMap<>();

    public String get(String key) {
        readLock.lock();              // {8} ← shared: many threads can hold this simultaneously
        try {
            return cache.get(key);
        } finally { readLock.unlock(); }
    }

    public void put(String key, String value) {
        writeLock.lock();             // {18} ← exclusive: blocks all readers AND other writers
        try {
            System.out.println("Writing: " + key + "=" + value + " on " +
                Thread.currentThread().getName());
            Thread.sleep(200); // ← simulate slow write
            cache.put(key, value);
        } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        finally { writeLock.unlock(); }
    }

    public static void main(String[] args) throws InterruptedException {
        ReadWriteLockDemo demo = new ReadWriteLockDemo(); // {27}
        demo.put("host", "localhost"); // seed initial data

        ExecutorService executor = Executors.newFixedThreadPool(6);

        // 1 writer
        executor.submit(() -> demo.put("host", "prod-server"));

        // 5 concurrent readers  {30}
        for (int i = 0; i < 5; i++) {
            executor.submit(() ->
                System.out.println("Read: " + demo.get("host") + " on " +
                    Thread.currentThread().getName()));
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);
    }
}
```

**Expected Output (order may vary, but reads concur with each other):**
```
Writing: host=prod-server on pool-1-thread-1
Read: prod-server on pool-1-thread-2
Read: prod-server on pool-1-thread-3
Read: prod-server on pool-1-thread-4
...
```

---

## Example 4: `Condition` — Multiple Wait Sets per Lock

Two conditions on the same lock let you signal only the right type of waiting thread.

```java title="ConditionDemo.java" showLineNumbers {7,8,18,25}
import java.util.concurrent.locks.*;
import java.util.LinkedList;

public class ConditionDemo {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull  = lock.newCondition(); // {7} ← "has space" waiters
    private final Condition notEmpty = lock.newCondition(); // {8} ← "has data" waiters
    private final LinkedList<Integer> buffer = new LinkedList<>();
    private final int capacity = 3;

    public void put(int item) throws InterruptedException {
        lock.lock();
        try {
            while (buffer.size() == capacity) {
                System.out.println("Producer waiting (full)...");
                notFull.await();             // ← wait ONLY on "not full" condition
            }
            buffer.add(item);
            System.out.println("Produced: " + item);
            notEmpty.signal();               // {18} ← wake ONLY consumers, not other producers
        } finally { lock.unlock(); }
    }

    public int take() throws InterruptedException {
        lock.lock();
        try {
            while (buffer.isEmpty()) {
                System.out.println("Consumer waiting (empty)...");
                notEmpty.await();            // {25} ← wait ONLY on "not empty" condition
            }
            int item = buffer.poll();
            System.out.println("Consumed: " + item);
            notFull.signal();                // ← wake ONLY producers, not other consumers
            return item;
        } finally { lock.unlock(); }
    }

    public static void main(String[] args) throws InterruptedException {
        ConditionDemo demo = new ConditionDemo();
        Thread producer = new Thread(() -> {
            for (int i = 1; i <= 8; i++) {
                try { demo.put(i); Thread.sleep(100); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        });
        Thread consumer = new Thread(() -> {
            for (int i = 0; i < 8; i++) {
                try { demo.take(); Thread.sleep(300); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        });
        producer.start(); consumer.start();
        producer.join(); consumer.join();
    }
}
```

**Expected Output (sample):**
```
Produced: 1
Produced: 2
Produced: 3
Producer waiting (full)...
Consumed: 1
Produced: 4
...
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: In Example 1, remove the `try/finally` and throw an exception inside the increment. Observe the thread that gets the lock next and confirm the program hangs.
2. **Medium**: In Example 3, add a `getAll()` method that reads all entries. Benchmark it under 10 concurrent readers versus a version using a plain `ReentrantLock`. Compare throughput.
3. **Hard**: Add a `getOrCompute(key, supplier)` method to the `ReadWriteLockDemo` that reads with the read lock, and if absent, upgrades to write lock to compute and store the value. Handle the upgrade correctly (release read, acquire write, re-check for absence).
