---
id: threads-and-lifecycle-demo
title: "Threads & Lifecycle — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Thread creation, lifecycle states, start/join/interrupt.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - beginner
  - demo
last_updated: 2026-03-08
---

# Threads & Lifecycle — Practical Demo

> Hands-on examples for [Threads & Lifecycle](../threads-and-lifecycle.md). Start simple, build up to real-world usage.

:::info Prerequisites
Before running these examples, make sure you understand [Threads & Lifecycle](../threads-and-lifecycle.md) concepts — particularly the six lifecycle states and the difference between `start()` and `run()`.
:::

---

## Example 1: Creating and Observing Thread States

This example shows how to create threads three ways and inspect their names and states.

```java title="ThreadCreationDemo.java" showLineNumbers {9,14,22}
public class ThreadCreationDemo {

    public static void main(String[] args) throws InterruptedException {

        // --- Way 1: Extend Thread ---
        Thread t1 = new Thread() {
            @Override
            public void run() {
                System.out.println("Thread name: " + Thread.currentThread().getName()); // {9}
            }
        };
        t1.setName("extend-thread"); // ← give meaningful name

        // --- Way 2: Runnable lambda ---
        Thread t2 = new Thread(                                                           // {14}
            () -> System.out.println("Thread name: " + Thread.currentThread().getName()),
            "runnable-thread" // ← name passed to constructor
        );

        System.out.println("t1 state before start: " + t1.getState()); // NEW

        t1.start(); // ← creates OS thread, calls run() on it
        t2.start();

        System.out.println("t1 state after start: " + t1.getState()); // RUNNABLE or TERMINATED

        t1.join(); // ← wait for t1 to finish
        t2.join();

        System.out.println("t1 state after join: " + t1.getState()); // TERMINATED
    }
}
```

**Expected Output:**
```
t1 state before start: NEW
Thread name: extend-thread
Thread name: runnable-thread
t1 state after start: RUNNABLE
t1 state after join: TERMINATED
```

:::tip Key takeaway
`getState()` lets you inspect a thread's lifecycle state at any point. A thread's state is `NEW` before `start()`, transitions to `RUNNABLE`, and eventually reaches `TERMINATED`.
:::

---

## Example 2: Demonstrating `join()` and Ordering

`join()` makes the current thread wait for another to finish — it establishes an ordering guarantee.

```java title="JoinDemo.java" showLineNumbers {12,15,20}
public class JoinDemo {

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            System.out.println("Worker: Starting heavy computation...");
            try {
                Thread.sleep(1500); // ← simulate 1.5-second task
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            System.out.println("Worker: Done.");
        }, "worker");

        worker.start();
        System.out.println("Main: Worker started, doing other work...");

        worker.join(); // ← main thread blocks here until worker completes   {15}

        // This line is GUARANTEED to print after "Worker: Done."
        System.out.println("Main: Worker finished — processing results.");    // {20}
    }
}
```

**Expected Output:**
```
Main: Worker started, doing other work...
Worker: Starting heavy computation...
Worker: Done.
Main: Worker finished — processing results.
```

:::tip Key takeaway
`join()` creates a happens-before relationship: all writes done by the worker thread are guaranteed to be visible in the main thread after `join()` returns.
:::

---

## Example 3: Cooperative Cancellation with `interrupt()`

The correct way to stop a long-running thread — never use `Thread.stop()`.

```java title="InterruptDemo.java" showLineNumbers {8,12,22}
public class InterruptDemo {

    static class Worker extends Thread {
        Worker() { super("interruptible-worker"); }

        @Override
        public void run() {
            System.out.println("Worker: starting...");
            while (!Thread.interrupted()) {            // {8} ← checks interrupted flag each iteration
                try {
                    doChunk();
                    Thread.sleep(200);                 // {12} ← sleep throws InterruptedException when interrupted
                } catch (InterruptedException e) {
                    System.out.println("Worker: interrupted during sleep, stopping.");
                    Thread.currentThread().interrupt(); // ← restore flag for callers
                    break;
                }
            }
            System.out.println("Worker: cleanly stopped.");
        }

        private void doChunk() {
            System.out.println("Worker: processing chunk...");
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Worker w = new Worker();
        w.start();

        Thread.sleep(700); // ← let worker run for ~700ms (3 chunks)
        w.interrupt();     // {22} ← signal the worker to stop
        w.join();
        System.out.println("Main: worker has stopped.");
    }
}
```

**Expected Output:**
```
Worker: starting...
Worker: processing chunk...
Worker: processing chunk...
Worker: processing chunk...
Worker: interrupted during sleep, stopping.
Worker: cleanly stopped.
Main: worker has stopped.
```

:::warning Common Mistake
A very common bug is catching `InterruptedException` and doing nothing: `catch (InterruptedException e) {}`. This swallows the signal. Always either re-interrupt the thread with `Thread.currentThread().interrupt()` or rethrow a wrapping exception.
:::

---

## Example 4: Daemon Threads

Daemon threads are killed when all non-daemon threads finish — they should not perform work that must complete.

```java title="DaemonDemo.java" showLineNumbers {7,12}
public class DaemonDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread heartbeat = new Thread(() -> {
            while (true) {
                System.out.println("Heartbeat: alive");
                try { Thread.sleep(300); }
                catch (InterruptedException e) { break; }
            }
        }, "heartbeat-daemon");

        heartbeat.setDaemon(true); // {7} ← must be set BEFORE start()
        heartbeat.start();         // {12}

        Thread.sleep(1000); // main thread runs for 1 second
        System.out.println("Main: exiting — daemon will be killed");
        // JVM exits here; heartbeat thread is killed mid-execution
    }
}
```

**Expected Output:**
```
Heartbeat: alive
Heartbeat: alive
Heartbeat: alive
Main: exiting — daemon will be killed
```

:::tip Key takeaway
Daemon threads are appropriate for background housekeeping tasks (cache eviction, heartbeats, monitoring). They must never write to a database or release resources — they may be killed at any moment.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Modify Example 1 to print the thread state at each of the six lifecycle stages. Use `Thread.sleep()` inside the thread's `run()` to keep it alive long enough to observe `TIMED_WAITING`.
2. **Medium**: Create a producer thread that generates numbers 1–20 with delays, and a consumer thread that prints them. Use `join()` on the producer from the consumer to wait for data.
3. **Hard**: Implement a task runner that runs 5 background threads and cancels all of them via interrupt if any one throws an exception. Use `UncaughtExceptionHandler` to detect failures.
