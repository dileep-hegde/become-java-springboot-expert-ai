---
id: exception-hierarchy-demo
title: "Exception Hierarchy — Practical Demo"
description: Hands-on code examples exploring the Throwable tree, checked vs. unchecked exceptions, and how to inspect exception types at runtime.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - beginner
  - demo
last_updated: 2026-03-08
---

# Exception Hierarchy — Practical Demo

> Hands-on examples for [Exception Hierarchy](../exception-hierarchy.md). Start with hierarchy inspection and build up to understanding checked vs. unchecked in practice.

:::info Prerequisites
Make sure you understand the [Exception Hierarchy](../exception-hierarchy.md) concepts — particularly the `Throwable` tree and what "checked" means before running these.
:::

---

## Example 1: Walking the Throwable Tree

This example prints the full class hierarchy of common exceptions so you can see the inheritance relationships visually at runtime.

```java title="HierarchyInspector.java" showLineNumbers {12,13,14}
import java.io.FileNotFoundException;
import java.io.IOException;

public class HierarchyInspector {

    public static void printHierarchy(Class<?> cls) {
        System.out.print(cls.getSimpleName());
        Class<?> parent = cls.getSuperclass();
        while (parent != null) {                            // walk up the tree
            System.out.print(" → " + parent.getSimpleName());
            parent = parent.getSuperclass();
        }
        System.out.println();
    }

    public static void main(String[] args) {
        printHierarchy(FileNotFoundException.class);       // ← a checked exception
        printHierarchy(NullPointerException.class);        // ← an unchecked exception
        printHierarchy(OutOfMemoryError.class);            // ← an Error
        printHierarchy(IllegalArgumentException.class);    // ← unchecked, programming error
    }
}
```

**Expected Output:**
```
FileNotFoundException → IOException → Exception → Throwable → Object
NullPointerException → RuntimeException → Exception → Throwable → Object
OutOfMemoryError → VirtualMachineError → Error → Throwable → Object
IllegalArgumentException → RuntimeException → Exception → Throwable → Object
```

:::tip Key takeaway
`Error` and `Exception` are siblings under `Throwable` — that's why `catch (Exception e)` will **not** catch `OutOfMemoryError`. The only way to catch both is `catch (Throwable t)`, which you should almost never do.
:::

---

## Example 2: Checked vs. Unchecked — Compiler Enforcement

This example demonstrates how the compiler enforces checked exception handling but leaves unchecked exceptions entirely to the developer.

```java title="CheckedVsUnchecked.java" showLineNumbers {9,15,22}
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class CheckedVsUnchecked {

    // Checked: compiler FORCES you to declare or catch IOException
    public static String readFile(String path) throws IOException {  // ← must declare
        return Files.readString(Path.of(path));
    }

    // Unchecked: no 'throws' needed; compiler does not enforce anything
    public static int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero");  // ← no 'throws' needed
        }
        return a / b;
    }

    public static void main(String[] args) {
        // Checked — must handle or declare
        try {
            String content = readFile("missing.txt");          // ← compile error without try/catch
        } catch (IOException e) {
            System.out.println("File error (expected): " + e.getClass().getSimpleName());
        }

        // Unchecked — can call without any try/catch
        System.out.println("10 / 2 = " + divide(10, 2));       // works fine

        // Unchecked — throws at runtime, program crashes if not caught
        try {
            System.out.println(divide(5, 0));
        } catch (ArithmeticException e) {
            System.out.println("Caught unchecked: " + e.getMessage());
        }
    }
}
```

**Expected Output:**
```
File error (expected): FileNotFoundException
10 / 2 = 5
Caught unchecked: Cannot divide by zero
```

---

## Example 3: `instanceof` Check and Catch Hierarchy

This example shows how a `catch (Exception e)` block catches all subtypes, and how to use `instanceof` to distinguish them. This is a common pattern in legacy code before per-type `catch` blocks or `ControllerAdvice` were standard.

```java title="CatchHierarchy.java" showLineNumbers {18,23,27}
import java.io.FileNotFoundException;
import java.io.IOException;

public class CatchHierarchy {

    public static void riskyOperation(int scenario) throws IOException {
        switch (scenario) {
            case 1 -> throw new FileNotFoundException("config.txt not found");
            case 2 -> throw new IOException("Disk I/O error");
            case 3 -> throw new RuntimeException("Unexpected bug");
        }
    }

    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            try {
                riskyOperation(i);
            } catch (FileNotFoundException e) {          // ← most specific: caught first
                System.out.println("Scenario " + i + ": File not found — apply defaults");
            } catch (IOException e) {                    // ← broader: catches the rest of IOException
                System.out.println("Scenario " + i + ": General I/O — retry later");
            } catch (RuntimeException e) {               // ← unchecked: not a subtype of IOException
                System.out.println("Scenario " + i + ": Bug — " + e.getMessage());
            }
        }

        // Runtime instanceof check
        Exception e = new FileNotFoundException("test");
        System.out.println("Is IOException?  " + (e instanceof IOException));     // true
        System.out.println("Is RuntimeException? " + (e instanceof RuntimeException)); // false
    }
}
```

**Expected Output:**
```
Scenario 1: File not found — apply defaults
Scenario 2: General I/O — retry later
Scenario 3: Bug — Unexpected bug
Is IOException?  true
Is RuntimeException? false
```

:::warning Common Mistake
If you put `catch (IOException e)` **before** `catch (FileNotFoundException e)`, the `FileNotFoundException` branch is unreachable. The compiler flags this as a compile error for checked exceptions. For unchecked exceptions, many IDEs warn about it but the compiler may not always error — be careful with ordering.
:::

---

## Example 4: Why Not to Catch `Error`

This example makes `StackOverflowError` happen deliberately to show you should never try to recover from it.

```java title="ErrorDemo.java" showLineNumbers {4,14}
public class ErrorDemo {

    // Infinite recursion → StackOverflowError
    static int infinite(int n) {
        return infinite(n + 1);    // ← never terminates
    }

    public static void main(String[] args) {
        // Don't try this in production — for educational purposes only
        try {
            infinite(0);
        } catch (StackOverflowError e) {
            // The stack is already corrupted here — any further method calls may also fail
            System.out.println("Caught StackOverflowError — but the JVM state is unreliable now");
        }

        // Catching Exception does NOT catch Error
        try {
            infinite(0);
        } catch (Exception e) {
            System.out.println("This line never prints — StackOverflowError is not an Exception");
        } catch (StackOverflowError e) {
            System.out.println("Only reachable by catching Error explicitly");
        }
    }
}
```

**Expected Output:**
```
Caught StackOverflowError — but the JVM state is unreliable now
Only reachable by catching Error explicitly
```

:::warning Common Mistake
A `catch (Exception e)` block does NOT catch `StackOverflowError`, `OutOfMemoryError`, or any other `Error`. `Error` is a sibling of `Exception` under `Throwable`, not a subtype. This surprises many developers who assume "catch Exception catches everything".
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Modify `HierarchyInspector` to also print whether each class is a checked exception (i.e., is a subtype of `Exception` but not `RuntimeException`).
2. **Medium**: Write a method that takes a `Throwable` and returns a `List<String>` of all class names in its hierarchy from the most-specific to `Object`.
3. **Hard**: Create three custom exception classes — a base `AppException extends RuntimeException`, a `NotFoundException extends AppException`, and a `ValidationException extends AppException`. Write a method that throws each based on an input flag, then write a single `catch (AppException e)` that uses `instanceof` pattern matching (Java 16+) to handle each case differently.

---

## Back to Topic

Return to the [Exception Hierarchy](../exception-hierarchy.md) note for theory, interview questions, and further reading.
