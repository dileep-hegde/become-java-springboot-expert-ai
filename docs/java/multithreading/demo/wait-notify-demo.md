---
id: wait-notify-demo
title: "Wait / Notify — Practical Demo"
description: Hands-on walkthroughs of Object.wait(), notify(), notifyAll() with producer-consumer patterns and timed waits.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Wait / Notify — Practical Demo

> Hands-on examples for [Wait / Notify](../wait-notify.md). We build from a broken busy-wait up to a correct, production-style bounded buffer.

:::info Prerequisites
You must understand [Synchronization](../synchronization.md) — `wait()` and `notify()` require holding an intrinsic lock.
:::

---

## Example 1: Broken Busy-Wait (What NOT to Do)

This shows the problem was before `wait/notify` — busy-waiting burns CPU.

```java title="BusyWaitDemo.java" showLineNumbers {5,12}
import java.util.LinkedList;
import java.util.Queue;

public class BusyWaitDemo {
    static final Queue<Integer> queue = new LinkedList<>();

    public static void main(String[] args) throws InterruptedException {
        Thread consumer = new Thread(() -> {
            while (true) {
                // BAD: spinning wastes 100% of a CPU core while waiting
                while (queue.isEmpty()) { /* busy wait */ } // {5}
                System.out.println("Consumed: " + queue.poll());
            }
        }, "consumer");

        Thread producer = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                queue.add(i);
                System.out.println("Produced: " + i);
                try { Thread.sleep(200); } catch (InterruptedException e) { break; }
            }
        }, "producer");

        consumer.start();
        producer.start();
        producer.join();
        consumer.interrupt(); // ← stop the consumer
    }
}
```

**Expected Output:**
```
Produced: 1
Consumed: 1
Produced: 2
Consumed: 2
...
```

:::warning Key takeaway
It works, but the consumer's busy-wait loop runs continuously, consuming an entire CPU core doing nothing useful while waiting. `wait/notify` fixes this.
:::

---

## Example 2: Correct Producer-Consumer with `wait/notifyAll`

The canonical safe implementation with a `while` loop guard.

```java title="WaitNotifyProducerConsumer.java" showLineNumbers {14,16,24,27}
import java.util.LinkedList;
import java.util.Queue;

public class WaitNotifyProducerConsumer {
    private final Queue<Integer> queue = new LinkedList<>();
    private final int capacity = 3;

    public synchronized void produce(int item) throws InterruptedException {
        while (queue.size() == capacity) {   // {14} ← WHILE not IF — handles spurious wakeup
            System.out.println("Producer waiting — buffer full");
            wait();                           // ← releases lock; goes to WAITING state
        }
        queue.add(item);
        System.out.println("Produced: " + item + " | Buffer: " + queue);
        notifyAll();                          // {16} ← wake consumers (and possibly other producers)
    }

    public synchronized int consume() throws InterruptedException {
        while (queue.isEmpty()) {            // {24} ← WHILE — spurious wakeup safety
            System.out.println("Consumer waiting — buffer empty");
            wait();
        }
        int item = queue.poll();
        System.out.println("Consumed: " + item + " | Buffer: " + queue);
        notifyAll();                         // {27} ← wake producers waiting for space
        return item;
    }

    public static void main(String[] args) throws InterruptedException {
        WaitNotifyProducerConsumer buffer = new WaitNotifyProducerConsumer();

        Thread producer = new Thread(() -> {
            for (int i = 1; i <= 8; i++) {
                try { buffer.produce(i); Thread.sleep(100); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        }, "producer");

        Thread consumer = new Thread(() -> {
            for (int i = 0; i < 8; i++) {
                try { buffer.consume(); Thread.sleep(300); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        }, "consumer");

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
    }
}
```

**Expected Output (sample):**
```
Produced: 1 | Buffer: [1]
Produced: 2 | Buffer: [1, 2]
Produced: 3 | Buffer: [1, 2, 3]
Producer waiting — buffer full
Consumed: 1 | Buffer: [2, 3]
Produced: 4 | Buffer: [2, 3, 4]
...
```

---

## Example 3: Timed `wait` — Detect Stalls

Use the timeout variant to avoid waiting forever when a publisher might crash.

```java title="TimedWaitDemo.java" showLineNumbers {11,16,18}
public class TimedWaitDemo {
    private final Object lock = new Object();
    private volatile boolean messageReady = false;

    public void awaitMessage(long timeoutMs) throws InterruptedException {
        synchronized (lock) {
            long deadline = System.currentTimeMillis() + timeoutMs;
            while (!messageReady) {
                long remaining = deadline - System.currentTimeMillis();
                if (remaining <= 0) {
                    System.out.println("Timeout! No message received within " + timeoutMs + "ms");  // {11}
                    return;
                }
                lock.wait(remaining);  // {16} ← timed WAITING state; wakes on timeout or notify
            }
            System.out.println("Message received!");  // {18}
        }
    }

    public void publishMessage() {
        synchronized (lock) {
            messageReady = true;
            lock.notifyAll();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        TimedWaitDemo demo = new TimedWaitDemo();

        // Scenario A: publisher arrives in time
        Thread publisher = new Thread(() -> {
            try {
                Thread.sleep(500);  // ← publishes after 500ms
                demo.publishMessage();
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });
        publisher.start();
        demo.awaitMessage(2000); // ← waits up to 2000ms
        publisher.join();

        // Scenario B: publisher never comes (timeout)
        demo.messageReady = false;
        demo.awaitMessage(500); // ← times out after 500ms
    }
}
```

**Expected Output:**
```
Message received!
Timeout! No message received within 500ms
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: In Example 2, change `notifyAll()` to `notify()`. Run with multiple producers and consumers and observe scenarios where threads get stuck (missed signals).
2. **Medium**: Change the `while` loop in Example 2's `consume()` to an `if` statement. Simulate a spurious wakeup by adding a second `notifyAll()` call from a separate thread that doesn't add data. Observe the `NoSuchElementException` or null result from `queue.poll()`.
3. **Hard**: Rewrite Example 2's bounded buffer using `ReentrantLock` with two `Condition` objects — one for "not full" and one for "not empty". Verify fewer unnecessary wakeups compared to `notifyAll()`.
