---
id: parallel-streams-demo
title: "Parallel Streams — Practical Demo"
description: Hands-on examples demonstrating when parallel streams help, when they hurt, and common correctness pitfalls.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - java
  - advanced
  - demo
last_updated: 2026-03-08
---

# Parallel Streams — Practical Demo

> Hands-on examples for [Parallel Streams](../parallel-streams.md). Covers correct usage, shared-state bugs, and custom ForkJoin pool isolation.

:::info Prerequisites
Understand sequential [Streams API](../streams-api.md) and [Collectors](../collectors.md) first — parallel streams introduce correctness risks that only make sense once you know the sequential model.
:::

---

## Example 1: Safe Parallel Aggregation vs. Sequential

Comparing sequential and parallel performance on a CPU-bound summation task.

```java title="ParallelVsSequential.java" showLineNumbers {11,17,23}
import java.util.stream.LongStream;

public class ParallelVsSequential {
    public static void main(String[] args) {
        final long N = 50_000_000L;

        // Sequential sum
        long start = System.currentTimeMillis();
        long seqSum = LongStream.rangeClosed(1, N)
            .sum();                        // ← runs on calling thread only
        long seqTime = System.currentTimeMillis() - start;
        System.out.println("Sequential sum: " + seqSum + " in " + seqTime + "ms");

        // Parallel sum — splits range across ForkJoin common pool threads
        start = System.currentTimeMillis();
        long parSum = LongStream.rangeClosed(1, N)
            .parallel()                    // ← switch to parallel
            .sum();
        long parTime = System.currentTimeMillis() - start;
        System.out.println("Parallel sum:   " + parSum + " in " + parTime + "ms");

        System.out.println("Speedup: " + String.format("%.1fx", (double) seqTime / parTime));
        System.out.println("Available cores: " + Runtime.getRuntime().availableProcessors());
    }
}
```

**Expected Output (on an 8-core machine — exact times vary):**
```
Sequential sum: 1250000025000000 in 47ms
Parallel sum:   1250000025000000 in 18ms
Speedup: 2.6x
Available cores: 8
```

:::tip Key takeaway
Results are identical — parallel streams don't change the computed value, only the speed. The speedup is less than 8x (the core count) because of splitting/merging overhead and memory bandwidth limits.
:::

---

## Example 2: Shared Mutable State — Bugs and Fixes

The most common parallel stream mistake: writing to a non-thread-safe structure inside `forEach`.

```java title="SharedStateDemo.java" showLineNumbers {10,17,26,32}
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class SharedStateDemo {
    public static void main(String[] args) throws InterruptedException {

        // BUG: ArrayList is NOT thread-safe — expect missing elements or exceptions
        List<Integer> unsafeList = new ArrayList<>();
        IntStream.range(0, 1000)
            .parallel()
            .forEach(unsafeList::add);      // ← data race: multiple threads add concurrently
        System.out.println("Unsafe list size (should be 1000): " + unsafeList.size());
        // Likely says < 1000 or throws ConcurrentModificationException

        // FIX 1: Use collect() — Collectors handle thread safety internally
        List<Integer> safeCollect = IntStream.range(0, 1000)
            .parallel()
            .boxed()
            .collect(Collectors.toList()); // ← internally thread-safe
        System.out.println("Safe collect size: " + safeCollect.size()); // Always 1000

        // FIX 2: Use a thread-safe collection (CopyOnWriteArrayList is correct but slow)
        List<Integer> safeCOW = new CopyOnWriteArrayList<>();
        IntStream.range(0, 1000)
            .parallel()
            .forEach(safeCOW::add);        // ← thread-safe but defeats parallelism benefit
        System.out.println("CopyOnWrite size: " + safeCOW.size()); // 1000

        // FIX 3: Use reduce/collect — no shared mutable state at all
        int sum = IntStream.range(0, 1000)
            .parallel()
            .sum();                         // ← purely functional: no state mutation
        System.out.println("Parallel sum: " + sum); // 499500
    }
}
```

**Expected Output:**
```
Unsafe list size (should be 1000): 847  (varies — could be any number < 1000)
Safe collect size: 1000
CopyOnWrite size: 1000
Parallel sum: 499500
```

:::warning Common Mistake
`ArrayList` is the wrong container for parallel `forEach` accumulation — it's not thread-safe. Always use `collect()` or thread-safe collections. When in doubt, prefer `collect()` — it's both correct and faster.
:::

---

## Example 3: ForkJoin Pool Isolation

Running a parallel stream on a custom pool to avoid monopolizing the JVM-wide common pool.

```java title="CustomPoolDemo.java" showLineNumbers {12,20,28,36}
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class CustomPoolDemo {

    // Simulate CPU-heavy work per element
    private static double heavyComputation(int n) {
        return Math.sqrt(Math.pow(n, 3) + Math.log(n + 1));
    }

    public static void main(String[] args) throws Exception {
        List<Integer> data = IntStream.range(1, 10001).boxed().collect(Collectors.toList());

        // Using the common pool (default) — competes with other parallel work in the app
        long start = System.currentTimeMillis();
        double commonResult = data.parallelStream()
            .mapToDouble(CustomPoolDemo::heavyComputation)
            .sum();
        System.out.printf("Common pool result: %.2f in %dms%n",
            commonResult, System.currentTimeMillis() - start);

        // Using a limited custom pool — isolates this work (e.g., background batch job)
        ForkJoinPool customPool = new ForkJoinPool(2); // ← only 2 threads
        try {
            start = System.currentTimeMillis();
            double customResult = customPool.submit(() ->
                data.parallelStream()
                    .mapToDouble(CustomPoolDemo::heavyComputation)
                    .sum()
            ).get(); // ← ForkJoinTask.get() — blocks calling thread until done
            System.out.printf("Custom pool (2 threads): %.2f in %dms%n",
                customResult, System.currentTimeMillis() - start);
        } finally {
            customPool.shutdown(); // ← always release custom pool resources
        }

        System.out.println("Common pool parallelism: " +
            ForkJoinPool.commonPool().getParallelism()); // e.g., 7 on 8-core machine
    }
}
```

**Expected Output (on an 8-core machine — times vary):**
```
Common pool result: 3334038.17 in 12ms
Custom pool (2 threads): 3334038.17 in 35ms
Common pool parallelism: 7
```

:::tip Key takeaway
The custom pool is slower (limited to 2 threads) but isolated — appropriate for background batch jobs that shouldn't compete with request-serving threads. In a Spring Boot application under load, always consider whether the common pool is the right place for heavy computation.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Verify that `list.parallelStream().map(n -> n * 2).collect(Collectors.toList())` always produces the same size list as the input, regardless of thread ordering.
2. **Medium**: Create a `List<Integer>` of 1 million random numbers. Measure the time to find the maximum value using `.stream()` vs `.parallelStream()`. Is parallel faster? Why or why not?
3. **Hard**: In a parallel stream, use `Collectors.groupingByConcurrent` (a concurrent version of `groupingBy`) instead of `groupingBy`. Research the difference between the two and document when `groupingByConcurrent` is preferable and when it's not suitable.

---

## Back to Topic

Return to the [Parallel Streams](../parallel-streams.md) note for theory, interview questions, and further reading.
