---
id: exception-best-practices-demo
title: "Exception Best Practices — Practical Demo"
description: Hands-on code contrasting good and bad exception handling patterns — swallowing, double-logging, flow control misuse, and InterruptedException restoration.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Exception Best Practices — Practical Demo

> Hands-on examples for [Exception Best Practices](../exception-best-practices.md). Each example shows a bad pattern and its corrected counterpart.

:::info Prerequisites
Familiarity with [Custom Exceptions](../custom-exceptions.md) and [try/catch/finally](../try-catch-finally.md) will make these examples easier to follow.
:::

---

## Example 1: Swallowing vs. Handling

The most dangerous anti-pattern — an empty `catch` block that hides the failure.

```java title="SwallowVsHandle.java" showLineNumbers {8,18}
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class SwallowVsHandle {

    // BAD — empty catch; failure is invisible
    static String readConfigBad(String path) {
        try {
            return Files.readString(Path.of(path));
        } catch (IOException e) {
            // nothing here — caller gets null, has no idea why
        }
        return null;   // ← caller may NPE later with no useful stack trace
    }

    // GOOD — handle gracefully with a logged fallback
    static String readConfigGood(String path) {
        try {
            return Files.readString(Path.of(path));
        } catch (IOException e) {
            System.err.println("WARN: Config not found at " + path + ", using defaults. Cause: " + e.getMessage());
            return "{}";   // ← clear fallback; logged so it's visible in ops
        }
    }

    public static void main(String[] args) {
        String bad  = readConfigBad("missing.json");
        System.out.println("Bad result (null = hidden failure): " + bad);

        String good = readConfigGood("missing.json");
        System.out.println("Good result (default + warning): " + good);
    }
}
```

**Expected Output:**
```
Bad result (null = hidden failure): null
WARN: Config not found at missing.json, using defaults. Cause: missing.json (No such file or directory)
Good result (default + warning): {}
```

:::tip Key takeaway
`null` is returned both when the file doesn't exist and when it exists but is empty. With exception swallowing, the caller has no way to distinguish these cases. Log the failure or propagate the exception — never silently return bad data.
:::

---

## Example 2: Double-Logging Anti-Pattern

A common pattern where every layer logs the same exception, creating duplicate log lines.

```java title="DoubleLoggingDemo.java" showLineNumbers {12,22}
public class DoubleLoggingDemo {

    static class Repository {
        String findById(String id) {
            if (id.startsWith("MISSING")) {
                throw new RuntimeException("DB: row not found for id=" + id);
            }
            return "record:" + id;
        }
    }

    // BAD — logs AND rethrows; the caller also logs
    static class ServiceBad {
        Repository repo = new Repository();

        String get(String id) {
            try {
                return repo.findById(id);
            } catch (RuntimeException e) {
                System.out.println("SERVICE LOG: " + e.getMessage());  // ← first log
                throw e;                                                // ← rethrow → caller logs again
            }
        }
    }

    // GOOD — just propagates; let the boundary handler log once
    static class ServiceGood {
        Repository repo = new Repository();

        String get(String id) {
            return repo.findById(id);   // ← propagates unchanged; no logging here
        }
    }

    // Boundary handler — logs once
    static void boundaryHandler(Runnable operation) {
        try {
            operation.run();
        } catch (RuntimeException e) {
            System.out.println("HANDLER LOG: " + e.getMessage());  // ← single log
        }
    }

    public static void main(String[] args) {
        System.out.println("=== BAD: double-logging ===");
        ServiceBad bad = new ServiceBad();
        boundaryHandler(() -> bad.get("MISSING-1"));
        // Produces two log lines for the same error

        System.out.println();
        System.out.println("=== GOOD: single log at boundary ===");
        ServiceGood good = new ServiceGood();
        boundaryHandler(() -> good.get("MISSING-2"));
        // Produces exactly one log line
    }
}
```

**Expected Output:**
```
=== BAD: double-logging ===
SERVICE LOG: DB: row not found for id=MISSING-1
HANDLER LOG: DB: row not found for id=MISSING-1

=== GOOD: single log at boundary ===
HANDLER LOG: DB: row not found for id=MISSING-2
```

---

## Example 3: Fail-Fast with Precondition Checks

`Objects.requireNonNull` and explicit `IllegalArgumentException` at method entry to detect bad input immediately.

```java title="FailFastDemo.java" showLineNumbers {9,10,16}
import java.util.List;
import java.util.Objects;

public class FailFastDemo {

    record OrderItem(String sku, int quantity) {}

    static double calculateTotal(List<OrderItem> items, double taxRate) {
        Objects.requireNonNull(items, "items must not be null");          // ← fails immediately, clear msg
        if (items.isEmpty()) {
            throw new IllegalArgumentException("items must not be empty"); // ← precise cause
        }
        if (taxRate < 0 || taxRate > 1) {
            throw new IllegalArgumentException("taxRate must be between 0 and 1, got: " + taxRate);
        }

        double subtotal = items.stream()
            .mapToDouble(i -> i.quantity() * 10.0)  // simplified price
            .sum();
        return subtotal * (1 + taxRate);
    }

    public static void main(String[] args) {
        // Normal case
        List<OrderItem> items = List.of(new OrderItem("SKU-1", 2), new OrderItem("SKU-2", 1));
        System.out.printf("Total: %.2f%n", calculateTotal(items, 0.1));

        // Fail-fast: null input
        try {
            calculateTotal(null, 0.1);
        } catch (NullPointerException e) {
            System.out.println("NPE at entry: " + e.getMessage());
        }

        // Fail-fast: invalid tax rate
        try {
            calculateTotal(items, 1.5);
        } catch (IllegalArgumentException e) {
            System.out.println("Bad arg at entry: " + e.getMessage());
        }
    }
}
```

**Expected Output:**
```
Total: 33.00
NPE at entry: items must not be null
Bad arg at entry: taxRate must be between 0 and 1, got: 1.5
```

---

## Example 4: Exception for Flow Control (Anti-Pattern)

Shows the performance cost of using exceptions for expected control flow, and the correct alternative.

```java title="FlowControlDemo.java" showLineNumbers {10,23}
public class FlowControlDemo {

    // BAD — uses exception for "no result" which is an ordinary case
    static Integer parseIntBad(String s) {
        try {
            return Integer.parseInt(s);         // throws NumberFormatException if not numeric
        } catch (NumberFormatException e) {
            return null;                         // ← exception was used as "if not a number"
        }
    }

    // GOOD — check before parse; no exception construction overhead
    static Integer parseIntGood(String s) {
        if (s == null || !s.matches("-?\\d+")) { // ← ordinary boolean check
            return null;
        }
        return Integer.parseInt(s);
    }

    public static void main(String[] args) {
        String[] inputs = {"123", "abc", "0", "99x"};
        long start;

        // Bad version — constructing NumberFormatException for each non-numeric string (expensive)
        start = System.nanoTime();
        for (int i = 0; i < 100_000; i++) {
            for (String s : inputs) parseIntBad(s);
        }
        System.out.printf("Bad (exception-based):  %,d ns%n", System.nanoTime() - start);

        // Good version — regex check avoids exception construction entirely
        start = System.nanoTime();
        for (int i = 0; i < 100_000; i++) {
            for (String s : inputs) parseIntGood(s);
        }
        System.out.printf("Good (check-based):     %,d ns%n", System.nanoTime() - start);
    }
}
```

**Expected Output (approximate — JIT warms up):**
```
Bad (exception-based):  450,000,000 ns
Good (check-based):     28,000,000 ns
```

:::warning Common Mistake
Exceptions are expensive because the JVM captures a full stack trace when the exception object is created — not when it is thrown. Even if you never throw it, `new NumberFormatException()` still has that overhead. Reserve exceptions for unexpected conditions.
:::

---

## Example 5: InterruptedException — The Correct Pattern

`InterruptedException` must never be swallowed. This demo shows the right pattern.

```java title="InterruptedDemo.java" showLineNumbers {11,23}
import java.util.concurrent.*;

public class InterruptedDemo {

    // BAD — swallows InterruptedException; thread pool shutdown will hang
    static Runnable badWorker = () -> {
        for (int i = 0; i < 5; i++) {
            try {
                Thread.sleep(500);
                System.out.println("BAD worker step " + i);
            } catch (InterruptedException e) {
                // swallowed! interrupt flag is cleared; thread keeps running
                System.out.println("BAD: interrupt swallowed at step " + i);
            }
        }
    };

    // GOOD — restores interrupt flag so the executor can detect shutdown
    static Runnable goodWorker = () -> {
        for (int i = 0; i < 5; i++) {
            try {
                Thread.sleep(500);
                System.out.println("GOOD worker step " + i);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();   // ← restore interrupt flag
                System.out.println("GOOD: interrupt restored, exiting at step " + i);
                return;   // ← exit the loop so the thread terminates
            }
        }
    };

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== GOOD worker — responds to shutdown ===");
        ExecutorService good = Executors.newSingleThreadExecutor();
        good.submit(goodWorker);
        Thread.sleep(1200);           // let it run a bit
        good.shutdownNow();           // interrupts the thread
        good.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("GOOD executor terminated: " + good.isTerminated());
    }
}
```

**Expected Output (timing may vary):**
```
=== GOOD worker — responds to shutdown ===
GOOD worker step 0
GOOD worker step 1
GOOD: interrupt restored, exiting at step 2
GOOD executor terminated: true
```

---

## Exercises

1. **Easy**: Take the `readConfigBad` method from Example 1 and rewrite it so it logs the exception at `WARN` level and returns a sensible default. Verify the output is the same as `readConfigGood`.
2. **Medium**: Write a `RetryableOperation` utility that runs a `Supplier<T>` up to N times, catching specific unchecked exceptions (passed as a `Class<? extends RuntimeException>` list). On failure, log each attempt; on exhaustion, rethrow the last exception.
3. **Hard**: Implement a thread-safe `TaskRunner` using `ExecutorService` with a fixed pool. Each task is a `Callable<String>`. Correctly handle `InterruptedException` in workers, log exceptions once in a `Future` completion handler, and demonstrate clean shutdown with `shutdownNow()` + `awaitTermination()`.

---

## Back to Topic

Return to the [Exception Best Practices](../exception-best-practices.md) note for theory, interview questions, and further reading.
