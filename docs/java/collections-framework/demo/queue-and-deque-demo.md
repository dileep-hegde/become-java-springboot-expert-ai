---
id: queue-and-deque-demo
title: "Queue and Deque — Practical Demo"
description: Hands-on examples for ArrayDeque as stack/queue, PriorityQueue for task scheduling, and BlockingQueue for producer-consumer.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Queue and Deque — Practical Demo

> Hands-on examples for [Queue and Deque](../queue-and-deque.md). See `ArrayDeque` used as both a stack and a queue, `PriorityQueue` for ordered task processing, and `BlockingQueue` for a producer-consumer pipeline.

:::info Prerequisites
Read the [Queue and Deque](../queue-and-deque.md) note first — especially the `ArrayDeque` circular array and why `PriorityQueue` iteration is not in priority order.
:::

---

## Example 1: ArrayDeque as a Stack and Queue

`ArrayDeque` is the recommended implementation for both LIFO (stack) and FIFO (queue) use cases — faster than `LinkedList` and without the legacy overhead of `java.util.Stack`.

```java title="ArrayDequeDemo.java" showLineNumbers {8,9,16,17,24}
import java.util.*;

public class ArrayDequeDemo {
    public static void main(String[] args) {
        // ── STACK (LIFO) ──────────────────────────────
        Deque<String> stack = new ArrayDeque<>();
        stack.push("first");    // addFirst
        stack.push("second");   // addFirst
        stack.push("third");    // addFirst
        System.out.println("Stack peek: " + stack.peek());   // "third" — top of stack
        System.out.println("Stack pop:  " + stack.pop());    // "third" — removes top
        System.out.println("Stack pop:  " + stack.pop());    // "second"
        System.out.println("Remaining:  " + stack);          // [first]

        // ── QUEUE (FIFO) ──────────────────────────────
        Queue<String> queue = new ArrayDeque<>();
        queue.offer("task-1"); // addLast
        queue.offer("task-2"); // addLast
        queue.offer("task-3"); // addLast
        System.out.println("\nQueue peek: " + queue.peek());   // "task-1" — front
        System.out.println("Queue poll: " + queue.poll());    // "task-1" — removes front
        System.out.println("Queue poll: " + queue.poll());    // "task-2"
        System.out.println("Remaining:  " + queue);           // [task-3]
    }
}
```

**Expected Output:**
```
Stack peek: third
Stack pop:  third
Stack pop:  second
Remaining:  [first]

Queue peek: task-1
Queue poll: task-1
Queue poll: task-2
Remaining:  [task-3]
```

:::tip Key takeaway
Use `push`/`pop`/`peek` for LIFO (stack semantics) and `offer`/`poll`/`peek` for FIFO (queue semantics). Both use the same `ArrayDeque` — the semantics differ only in which end you operate on.
:::

---

## Example 2: PriorityQueue for Task Scheduling

`PriorityQueue` always returns the highest-priority element (minimum by default). This models an event scheduler or task processor that handles urgent tasks first.

```java title="PriorityQueueDemo.java" showLineNumbers {3,4,12,20,25}
import java.util.*;

public class PriorityQueueDemo {
    record Task(String name, int priority) {}   // lower priority number = more urgent

    public static void main(String[] args) {
        // Min-heap: lowest priority number processed first
        PriorityQueue<Task> scheduler = new PriorityQueue<>(
            Comparator.comparingInt(Task::priority)  // ← custom comparator
        );

        scheduler.offer(new Task("Send Email",    3));
        scheduler.offer(new Task("Fix P0 Bug",    1));  // ← most urgent
        scheduler.offer(new Task("Write Tests",   4));
        scheduler.offer(new Task("Deploy Fix",    2));

        System.out.println("Processing order:");
        while (!scheduler.isEmpty()) {
            Task t = scheduler.poll();                   // ← always returns min priority
            System.out.printf("  Priority %d: %s%n", t.priority(), t.name());
        }

        // Demonstration: DO NOT iterate PriorityQueue directly — order not guaranteed
        PriorityQueue<Integer> nums = new PriorityQueue<>(List.of(5, 1, 3, 2, 4));
        System.out.println("\nDirect iteration (NOT ordered): " + nums);
        System.out.println("poll() is ordered: " + nums.poll() + ", " + nums.poll());
    }
}
```

**Expected Output:**
```
Processing order:
  Priority 1: Fix P0 Bug
  Priority 2: Deploy Fix
  Priority 3: Send Email
  Priority 4: Write Tests

Direct iteration (NOT ordered): [1, 2, 3, 5, 4]
poll() is ordered: 1, 2
```

:::warning Common Mistake
`PriorityQueue` iteration (for-each) does NOT visit elements in priority order — the heap structure only guarantees the root (minimum) is accessible. Only `poll()` retrieves elements in order.
:::

---

## Example 3: BlockingQueue Producer-Consumer Pipeline

`ArrayBlockingQueue` coordinates a producer and consumer thread without manual `wait`/`notify` synchronization.

```java title="ProducerConsumer.java" showLineNumbers {7,14,21,28}
import java.util.concurrent.*;

public class ProducerConsumer {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(5); // ← bounded capacity

        // Producer — generates tasks
        Thread producer = Thread.ofPlatform().start(() -> {
            try {
                for (int i = 1; i <= 8; i++) {
                    String task = "task-" + i;
                    queue.put(task);             // ← blocks if queue is full (capacity=5)
                    System.out.println("[P] Queued: " + task + " | size=" + queue.size());
                    Thread.sleep(50);
                }
                queue.put("DONE");               // ← sentinel to signal consumer to stop
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });

        // Consumer — processes tasks
        Thread consumer = Thread.ofPlatform().start(() -> {
            try {
                while (true) {
                    String task = queue.take();  // ← blocks if queue is empty
                    if ("DONE".equals(task)) break;
                    System.out.println("[C] Processing: " + task);
                    Thread.sleep(150);           // ← consumer is slower than producer
                }
                System.out.println("[C] Done.");
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });

        producer.join();
        consumer.join();
    }
}
```

**Expected Output (order may vary slightly):**
```
[P] Queued: task-1 | size=1
[P] Queued: task-2 | size=2
[C] Processing: task-1
[P] Queued: task-3 | size=2
[P] Queued: task-4 | size=3
[P] Queued: task-5 | size=4
[C] Processing: task-2
[P] Queued: task-6 | size=4    ← producer blocks here while consumer catches up
...
[C] Done.
```

:::tip Key takeaway
`put()` blocks the producer when the queue is full; `take()` blocks the consumer when the queue is empty. The capacity of `ArrayBlockingQueue` acts as **backpressure** — naturally throttling the producer when the consumer can't keep up.
:::

---

## Exercises

1. **Easy**: Use `ArrayDeque` to implement `isPalindrome(String s)` — check if a string reads the same forwards and backwards using deque operations.
2. **Medium**: Implement a `TopK` class that uses a `PriorityQueue` to return the `k` largest integers from a stream of integers. Use a min-heap of size `k`.
3. **Hard**: Extend the producer-consumer example to use a `PriorityBlockingQueue` where tasks have priorities. The consumer should always process the highest-priority task first, even if a lower-priority task was enqueued earlier.

---

## Back to Topic

Return to the [Queue and Deque](../queue-and-deque.md) note for theory, interview questions, and further reading.
