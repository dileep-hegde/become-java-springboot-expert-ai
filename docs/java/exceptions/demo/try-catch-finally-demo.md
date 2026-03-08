---
id: try-catch-finally-demo
title: "try / catch / finally — Practical Demo"
description: Hands-on examples for try/catch/finally, multi-catch, try-with-resources, suppressed exceptions, and finally pitfalls.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - beginner
  - demo
last_updated: 2026-03-08
---

# try / catch / finally — Practical Demo

> Hands-on examples for [try/catch/finally](../try-catch-finally.md). Each example focuses on one specific aspect of exception handling mechanics.

:::info Prerequisites
Make sure you understand the [Exception Hierarchy](../exception-hierarchy.md) — you need to know the difference between checked and unchecked exceptions before working with `try/catch`.
:::

---

## Example 1: Basic try/catch Flow

A method that reads a file — the simplest real-world use of `try/catch` with a checked exception.

```java title="BasicTryCatch.java" showLineNumbers {8,11}
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class BasicTryCatch {

    public static String readConfig(String fileName) {
        try {
            return Files.readString(Path.of(fileName));   // ← throws checked IOException
        } catch (IOException e) {
            System.err.println("Could not read config: " + e.getMessage());
            return "{}";                                  // ← fallback default
        }
    }

    public static void main(String[] args) {
        String config = readConfig("app.json");           // file does not exist
        System.out.println("Config content: " + config);
    }
}
```

**Expected Output:**
```
Could not read config: app.json (No such file or directory)
Config content: {}
```

:::tip Key takeaway
`catch` is only appropriate here because we have a sensible fallback (`"{}"`). If we had no fallback, we should let the exception propagate rather than returning bad data silently.
:::

---

## Example 2: finally Guarantee — Cleanup Always Runs

`finally` demonstrates that cleanup code always runs regardless of success or failure.

```java title="FinallyDemo.java" showLineNumbers {9,14,17,22}
public class FinallyDemo {

    static String openResource() {
        System.out.println("Resource opened");
        return "resource-handle";
    }

    static void useResource(String handle, boolean fail) {
        if (fail) {
            throw new RuntimeException("Processing failed!");  // ← exception in try
        }
        System.out.println("Resource used successfully");
    }

    static void closeResource(String handle) {
        System.out.println("Resource closed: " + handle);     // ← always runs
    }

    public static void main(String[] args) {
        for (boolean fail : new boolean[]{false, true}) {
            System.out.println("--- fail=" + fail + " ---");
            String handle = openResource();
            try {
                useResource(handle, fail);
                System.out.println("After use (only if no exception)");
            } catch (RuntimeException e) {
                System.out.println("Caught: " + e.getMessage());
            } finally {
                closeResource(handle);   // ← runs regardless of exception
            }
        }
    }
}
```

**Expected Output:**
```
--- fail=false ---
Resource opened
Resource used successfully
After use (only if no exception)
Resource closed: resource-handle
--- fail=true ---
Resource opened
Caught: Processing failed!
Resource closed: resource-handle
```

---

## Example 3: try-with-resources vs Manual finally

Side-by-side comparison of the old manual `finally` approach and the `try-with-resources` equivalent. The key difference is in suppressed exception handling.

```java title="TryWithResourcesDemo.java" showLineNumbers {9,22,28}
import java.io.*;

// A resource that can fail on close — to show the suppressed-exception difference
class FlakeyResource implements AutoCloseable {
    private final String name;
    private final boolean failOnClose;

    FlakeyResource(String name, boolean failOnClose) {
        this.name = name;
        System.out.println("Opening " + name);
    }

    public void doWork() {
        throw new IllegalStateException(name + ": work failed");
    }

    @Override
    public void close() throws IOException {
        System.out.println("Closing " + name);
        if (failOnClose) {
            throw new IOException(name + ": close also failed");   // ← close can fail too
        }
    }
}

public class TryWithResourcesDemo {

    // OLD WAY — manual finally; close exception SWALLOWS the work exception
    static void oldWay() {
        FlakeyResource r = new FlakeyResource("old", true);
        try {
            r.doWork();                     // throws IllegalStateException
        } finally {
            try {
                r.close();                  // also throws IOException
            } catch (IOException closeEx) {
                // If we are here because doWork() threw, the original exception is LOST
                throw new RuntimeException("Close failed", closeEx);  // ← original work exception lost!
            }
        }
    }

    // NEW WAY — try-with-resources; close exception is SUPPRESSED, not lost
    static void newWay() {
        try (FlakeyResource r = new FlakeyResource("new", true)) {
            r.doWork();                     // throws IllegalStateException (primary)
        } catch (IOException | IllegalStateException e) {
            System.out.println("Primary exception: " + e.getMessage());
            for (Throwable s : e.getSuppressed()) {         // ← retrieve the suppressed close exception
                System.out.println("Suppressed: " + s.getMessage());
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== try-with-resources ===");
        newWay();
        // oldWay() would lose the primary exception; uncomment to observe
    }
}
```

**Expected Output:**
```
=== try-with-resources ===
Opening new
Closing new
Primary exception: new: work failed
Suppressed: new: close also failed
```

:::warning Common Mistake
With the old manual `finally` pattern, if both `doWork()` and `close()` throw, the `finally`'s exception silently replaces the `try`'s exception. The primary failure is **permanently lost**. `try-with-resources` keeps the primary exception and attaches the `close()` exception as a suppressed exception — a much better outcome for debugging.
:::

---

## Example 4: Multi-Catch and Re-Throw

Demonstrates multi-catch syntax and the pattern of re-throwing with additional context.

```java title="MultiCatchDemo.java" showLineNumbers {14,18,22}
import java.io.IOException;
import java.sql.SQLException;

public class MultiCatchDemo {

    static void riskyOperation(int type) throws IOException, SQLException {
        switch (type) {
            case 1 -> throw new IOException("File missing");
            case 2 -> throw new SQLException("DB connection lost");
            default -> System.out.println("Operation succeeded");
        }
    }

    public static void main(String[] args) {
        for (int i = 0; i <= 2; i++) {
            try {
                riskyOperation(i);
            } catch (IOException | SQLException e) {     // ← multi-catch: same handler for both
                // e is implicitly final here — cannot be reassigned
                System.out.println("Infrastructure failure [" + e.getClass().getSimpleName() + "]: " + e.getMessage());
                // Wrap with context and rethrow as unchecked
                RuntimeException wrapped = new RuntimeException("Service unavailable, retry later", e);
                System.out.println("Would rethrow: " + wrapped.getMessage() + " (cause: " + wrapped.getCause().getClass().getSimpleName() + ")");
            }
        }
    }
}
```

**Expected Output:**
```
Operation succeeded
Infrastructure failure [IOException]: File missing
Would rethrow: Service unavailable, retry later (cause: IOException)
Infrastructure failure [SQLException]: DB connection lost
Would rethrow: Service unavailable, retry later (cause: SQLException)
```

---

## Example 5: The finally Return Pitfall

This example demonstrates the dangerous `return` in a `finally` block — a pattern that silently swallows exceptions.

```java title="FinallyReturnPitfall.java" showLineNumbers {6,9}
public class FinallyReturnPitfall {

    // DANGEROUS — never do this
    static int badMethod() {
        try {
            throw new RuntimeException("Something went wrong!");  // ← exception thrown
        } finally {
            return 42;   // ← return in finally SUPPRESSES the exception — it is silently discarded
        }
    }

    // SAFE — return in try is fine; finally still runs
    static int goodMethod() {
        try {
            return computeValue();
        } finally {
            System.out.println("Cleanup in finally (runs before caller gets the return value)");
        }
    }

    static int computeValue() { return 100; }

    public static void main(String[] args) {
        // The exception from badMethod() is silently swallowed
        int result = badMethod();
        System.out.println("badMethod returned: " + result + " (exception was silently lost!)");

        int result2 = goodMethod();
        System.out.println("goodMethod returned: " + result2);
    }
}
```

**Expected Output:**
```
badMethod returned: 42 (exception was silently lost!)
Cleanup in finally (runs before caller gets the return value)
goodMethod returned: 100
```

:::warning Common Mistake
A `return` statement in `finally` causes the method to return normally even if an exception was in flight. The exception is permanently discarded without any trace. Always keep `finally` blocks to cleanup-only code with no `return` statements.
:::

---

## Exercises

1. **Easy**: Write a method `safeParseInt(String s, int defaultValue)` using `try/catch` that returns the parsed integer or the default if parsing fails.
2. **Medium**: Implement a simple `FileLogger` class that implements `AutoCloseable`, opens a `FileWriter` in the constructor, writes log messages with a `log(String)` method, and closes the writer in `close()`. Use it in a `try-with-resources` block and verify the file exists afterward.
3. **Hard**: Write a method `withRetry(Supplier<T> action, int maxRetries)` that retries the action on `RuntimeException` up to `maxRetries` times. After exhausting retries, throw the last exception as-is with all previous exceptions added as suppressed using `addSuppressed()`.

---

## Back to Topic

Return to the [try/catch/finally](../try-catch-finally.md) note for theory, interview questions, and further reading.
