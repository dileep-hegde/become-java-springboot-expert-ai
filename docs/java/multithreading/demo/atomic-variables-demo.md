---
id: atomic-variables-demo
title: "Atomic Variables — Practical Demo"
description: Hands-on walkthroughs of AtomicInteger, AtomicReference, LongAdder, and CAS-based patterns including the ABA problem.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Atomic Variables — Practical Demo

> Hands-on examples for [Atomic Variables](../atomic-variables.md). We show where lock-free atomics shine and where they fall short.

:::info Prerequisites
Understand [Synchronization](../synchronization.md) first — atomics are a lock-free alternative to `synchronized` for single-variable operations, but the problem they solve is the same.
:::

---

## Example 1: `AtomicInteger` vs `synchronized` Counter

Side-by-side comparison proving both are correct — then we measure.

```java title="AtomicVsSynchronizedDemo.java" showLineNumbers {8,17,24}
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicVsSynchronizedDemo {
    // --- Version A: AtomicInteger ---
    static AtomicInteger atomicCount = new AtomicInteger(0);

    // --- Version B: synchronized ---
    static int syncCount = 0;
    static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        int threads = 20, ops = 50_000;
        ExecutorService exec = Executors.newFixedThreadPool(threads);

        // Atomic version
        CountDownLatch latch1 = new CountDownLatch(threads);
        for (int i = 0; i < threads; i++) {
            exec.submit(() -> {
                for (int j = 0; j < ops; j++) atomicCount.incrementAndGet(); // {8}
                latch1.countDown();
            });
        }
        latch1.await();
        System.out.println("AtomicInteger  result: " + atomicCount.get());     // ← always 1,000,000

        // Synchronized version
        CountDownLatch latch2 = new CountDownLatch(threads);
        for (int i = 0; i < threads; i++) {
            exec.submit(() -> {
                for (int j = 0; j < ops; j++) { synchronized(lock) { syncCount++; } } // {17}
                latch2.countDown();
            });
        }
        latch2.await();
        System.out.println("synchronized   result: " + syncCount);             // ← always 1,000,000

        exec.shutdown(); // {24}
    }
}
```

**Expected Output:**
```
AtomicInteger  result: 1000000
synchronized   result: 1000000
```

:::tip Key takeaway
Both are correct. `AtomicInteger` is typically faster under low-to-moderate contention because it avoids OS-level lock acquisition. Under very high contention, `LongAdder` outperforms both.
:::

---

## Example 2: `compareAndSet` — One-Time Initialization Guard

`compareAndSet` is perfect for a one-time action: only the thread that wins the CAS runs the setup.

```java title="CASInitGuardDemo.java" showLineNumbers {7,12}
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.*;

public class CASInitGuardDemo {
    private static final AtomicBoolean initialized = new AtomicBoolean(false);

    static void initializeIfFirst(String threadName) {
        if (initialized.compareAndSet(false, true)) { // {7} ← ONLY the first thread returns true
            System.out.println(threadName + ": WON the CAS — performing one-time setup");
            performSetup();
        } else {
            System.out.println(threadName + ": lost the CAS — setup already done"); // {12}
        }
    }

    static void performSetup() {
        try { Thread.sleep(200); } catch (InterruptedException e) {}
        System.out.println("Setup complete.");
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService exec = Executors.newFixedThreadPool(5);
        for (int i = 1; i <= 5; i++) {
            String name = "thread-" + i;
            exec.submit(() -> initializeIfFirst(name));
        }
        exec.shutdown();
        exec.awaitTermination(3, TimeUnit.SECONDS);
    }
}
```

**Expected Output:**
```
thread-1: WON the CAS — performing one-time setup
thread-2: lost the CAS — setup already done
thread-3: lost the CAS — setup already done
thread-4: lost the CAS — setup already done
thread-5: lost the CAS — setup already done
Setup complete.
```

---

## Example 3: `LongAdder` vs `AtomicLong` Under Contention

`LongAdder` wins when many threads update a counter simultaneously; `AtomicLong` wins when exact real-time reads matter.

```java title="LongAdderDemo.java" showLineNumbers {10,22}
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class LongAdderDemo {

    public static void main(String[] args) throws InterruptedException {
        int threads = Runtime.getRuntime().availableProcessors() * 4;
        int ops = 100_000;
        ExecutorService exec = Executors.newFixedThreadPool(threads);

        // --- LongAdder ---
        LongAdder adder = new LongAdder();
        CountDownLatch l1 = new CountDownLatch(threads);
        long t1 = System.nanoTime();
        for (int i = 0; i < threads; i++) {
            exec.submit(() -> { for (int j = 0; j < ops; j++) adder.increment(); l1.countDown(); }); // {10}
        }
        l1.await();
        long adderTime = System.nanoTime() - t1;

        // --- AtomicLong ---
        AtomicLong atomic = new AtomicLong(0);
        CountDownLatch l2 = new CountDownLatch(threads);
        long t2 = System.nanoTime();
        for (int i = 0; i < threads; i++) {
            exec.submit(() -> { for (int j = 0; j < ops; j++) atomic.incrementAndGet(); l2.countDown(); }); // {22}
        }
        l2.await();
        long atomicTime = System.nanoTime() - t2;

        System.out.println("LongAdder  total: " + adder.sum()  + " time: " + adderTime / 1_000_000 + "ms");
        System.out.println("AtomicLong total: " + atomic.get() + " time: " + atomicTime / 1_000_000 + "ms");
        System.out.println("LongAdder speedup: " + String.format("%.1fx", (double) atomicTime / adderTime));
        exec.shutdown();
    }
}
```

**Expected Output (numbers vary by hardware):**
```
LongAdder  total: 3200000 time: 45ms
AtomicLong total: 3200000 time: 210ms
LongAdder speedup: 4.7x
```

---

## Example 4: Lock-Free Stack with `AtomicReference`

A non-blocking stack using `AtomicReference` — a classic lock-free data structure pattern.

```java title="LockFreeStackDemo.java" showLineNumbers {9,17,26}
import java.util.concurrent.atomic.AtomicReference;

public class LockFreeStackDemo {

    record Node<T>(T value, Node<T> next) {}

    static class LockFreeStack<T> {
        private final AtomicReference<Node<T>> top = new AtomicReference<>(null);

        public void push(T value) {
            while (true) {
                Node<T> currentTop = top.get();                       // ← read
                Node<T> newTop = new Node<>(value, currentTop);      // ← create new head
                if (top.compareAndSet(currentTop, newTop)) return;   // {9} ← CAS: retry if lost the race
            }
        }

        public T pop() {
            while (true) {
                Node<T> currentTop = top.get();                       // ← read
                if (currentTop == null) return null;
                Node<T> newTop = currentTop.next();
                if (top.compareAndSet(currentTop, newTop)) return currentTop.value(); // {17}
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        LockFreeStack<Integer> stack = new LockFreeStack<>();

        // Push from multiple threads concurrently
        Thread[] pushers = new Thread[5];
        for (int i = 0; i < 5; i++) {
            int val = i * 10;
            pushers[i] = new Thread(() -> { for (int j = 0; j < 1000; j++) stack.push(val + j); });
            pushers[i].start();
        }
        for (Thread t : pushers) t.join();

        // Pop all
        int count = 0;
        while (stack.pop() != null) count++;                          // {26}
        System.out.println("Popped " + count + " items (expected 5000)");
    }
}
```

**Expected Output:**
```
Popped 5000 items (expected 5000)
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Use `AtomicInteger.getAndUpdate(v -> v < 10 ? v + 1 : v)` to implement a capped counter that never exceeds 10. Verify with 20 concurrent threads each trying to increment 10 times.
2. **Medium**: Implement `AtomicReference`-based hot-swap configuration: one writer thread updates the config reference every second; 10 reader threads read the config in a loop. Verify readers never see a null or partially constructed config.
3. **Hard**: Modify Example 4's lock-free stack to use `AtomicStampedReference` to prevent the ABA problem. Simulate the ABA scenario by popping and re-pushing the same node value, and verify the ABA-proof version handles it correctly.
