---
id: exceptions-interview-prep
title: Exceptions Interview Questions
description: Consolidated interview Q&A for Java Exceptions — hierarchy, try/catch/finally, custom exceptions, and best practices from beginner through advanced.
sidebar_position: 7
tags:
  - interview-prep
  - java
  - exceptions
  - beginner
  - intermediate
  - advanced
last_updated: 2026-03-08
---

# Exceptions Interview Questions

> Consolidated Q&A for Java Exceptions. Use for rapid revision before backend interviews.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals before anything else
- **Intermediate** questions are the core revision target for most Java roles (3–5 YOE)
- **Advanced** questions signal senior-level depth and are tested at staff/tech-lead interviews

---

## Beginner

### Q: What is the root of Java's exception class hierarchy?

`java.lang.Throwable` is the root. It has two direct subclasses: `Error` and `Exception`. `Error` represents unrecoverable JVM-level problems (like `OutOfMemoryError`). `Exception` represents application-level failures. `RuntimeException` is a subclass of `Exception` and is the root of all unchecked exceptions.

### Q: What is the difference between checked and unchecked exceptions?

A **checked exception** is any `Exception` that is NOT a `RuntimeException`. The Java compiler forces every method that can throw a checked exception to either declare it with `throws` or catch it — preventing callers from accidentally ignoring it. An **unchecked exception** is `RuntimeException` or any of its subclasses (plus `Error`). The compiler does not require you to handle or declare them.

### Q: What is the difference between `Error` and `Exception`?

Both extend `Throwable`, but `Error` models unrecoverable JVM-level failures: `OutOfMemoryError`, `StackOverflowError`, `LinkageError`. Application code should never catch `Error`. `Exception` models application-level failures that can potentially be recovered from. Most of your business code will only ever throw and catch subtypes of `Exception`.

### Q: What does the `throws` keyword do in a method signature?

`throws` declares that a method can propagate a checked exception to its caller. It is part of the method's contract — the compiler forces callers to either catch the declared exception or re-declare it in their own `throws` clause. `throws` does *not* throw anything; it only declares intent. The `throw` keyword (no `s`) is the statement that actually throws an exception object at runtime.

### Q: What is `try-with-resources` and when should you use it?

`try-with-resources` is a form of the `try` statement (Java 7+) that accepts `AutoCloseable` resources in a header. The declared resources are automatically closed in reverse order when the `try` block exits — whether normally or due to an exception. Use it for any resource that implements `Closeable` or `AutoCloseable`: streams, readers, JDBC connections, and custom resource types.

### Q: Does `finally` always execute?

Almost always. `finally` runs whether the `try` block completes normally, throws an exception, or returns. The rare exceptions: `System.exit()` is called, the JVM crashes, or a daemon thread's JVM shuts down while the thread is in `finally`. One critical caveat: if the `finally` block itself executes a `return` statement or throws an exception, that will suppress any in-flight exception from the `try` block.

### Q: What is the difference between `throw` and `throws`?

`throw` is an executable statement that creates and throws an exception object: `throw new IllegalArgumentException("bad input")`. `throws` is a method signature declaration that informs the compiler and callers that the method may propagate a checked exception: `public void read() throws IOException`. One is runtime execution; the other is a compile-time contract.

### Q: What happens to an exception that is not caught?

It propagates up the call stack, frame by frame, until it is caught by a `catch` block or reaches the top of the thread's stack. If it reaches the top without being caught, the thread terminates and the JVM prints the exception's type, message, and stack trace to `stderr`. In a multi-threaded program, only the affected thread terminates; the JVM continues running.

---

## Intermediate

### Q: What is the order in which `catch` blocks should be arranged?

Most specific exception types must come before more general ones. A `catch (FileNotFoundException e)` must appear before `catch (IOException e)` because `FileNotFoundException` is a subtype of `IOException`. If a broader type appears first, it matches all subtypes and the more specific `catch` block becomes unreachable — the compiler flags this as an error for checked exceptions.

### Q: How does multi-catch syntax work in Java?

Multi-catch (Java 7+) lets a single `catch` block handle multiple exception types separated by `|`:

```java
try {
    service.call();
} catch (IOException | SQLException e) {  // ← one handler for both
    throw new RuntimeException("Infrastructure failure", e);
}
```

The catch variable (`e`) is implicitly `final` in a multi-catch block. The compiler types it as the *union* of the catch types, so if you rethrow it, the compiler is smart enough (Java 7+) to infer precise checked exception propagation.

### Q: What is the difference between `try-with-resources` and a manual `finally` block for closing resources?

The key difference is **suppressed exception handling**. With a manual `finally`, if both the `try` body and `close()` throw exceptions, the `finally`'s exception permanently replaces the original, losing the primary failure. With `try-with-resources`, if both throw, the `close()` exception is *suppressed* — attached to the primary exception and retrievable via `getSuppressed()`. The primary failure is never lost. Always prefer `try-with-resources` for `AutoCloseable` resources.

### Q: What is exception chaining and how do you implement it?

Exception chaining means preserving the original exception (the *cause*) when wrapping it in a higher-level exception. You implement it by passing the original exception to the new exception's constructor:

```java
} catch (SQLException e) {
    throw new DataAccessException("DB lookup failed", e);  // ← cause preserved
}
```

`getCause()` retrieves the original. Without chaining, the root cause is permanently lost, making production debugging extremely difficult.

### Q: Why should you not catch `Exception` broadly?

Catching `Exception` catches `RuntimeException` and all its subtypes — including `NullPointerException`, `ClassCastException`, and other programming bugs that should propagate and be fixed. Broad catches hide these bugs, making the system appear healthy while silently misbehaving. Catch the most specific type for which you have a genuine recovery strategy.

### Q: What does it mean to "convert at layer boundaries"?

In a layered architecture (Repository → Service → Controller), infrastructure exceptions (`SQLException`, Spring's `DataAccessException`) should be translated into domain exceptions once, at the boundary between the repository and service layers. The service layer should never see SQL exceptions — it should work only with domain types like `OrderNotFoundException`. This keeps each layer's concerns separate and prevents infrastructure details from leaking upward.

### Q: How does `@ControllerAdvice` in Spring work with custom exceptions?

`@RestControllerAdvice` (or `@ControllerAdvice`) is a global exception handler. You annotate a class with it and write `@ExceptionHandler(SomeException.class)` methods. Spring routes any unhandled exception of that type (or its subtypes) to the matching handler method. More specific handlers take precedence over more general ones. This centralizes error-response mapping in one place without any `try/catch` in controllers.

### Q: What happens if `close()` throws an exception in a `try-with-resources` block?

If the try body threw an exception first, the `close()` exception is *suppressed* — attached to the primary exception via `addSuppressed()`. The primary exception propagates normally. If the try body completed normally but `close()` throws, that exception propagates as the primary exception. You can retrieve suppressed exceptions with `e.getSuppressed()`.

---

## Advanced

### Q: What are the trade-offs of checked vs. unchecked exceptions in library design?

Checked exceptions guarantee at the type level that callers acknowledge failure modes — they can't be ignored silently. However, they pollute method signatures across layers (every `throws IOException` must be declared or caught at every level), encourage swallowing anti-patterns when callers don't know how to handle them, and make API evolution harder (adding a new recovery path requires changing all `throws` clauses). Unchecked exceptions are transparent to intermediate layers but can be accidentally missed. The modern consensus: use checked exceptions only at public library API boundaries where recovery is both possible and well-defined; use unchecked everywhere else in application code.

**Follow-up:** How did Spring Framework make this choice?  
**A:** Spring wraps all checked `SQLExceptions` from JDBC in `DataAccessException`, which is unchecked. All Spring data access exceptions extend `DataAccessException`. This way, service and controller code is never forced to declare or catch database exceptions — they propagate transparently to a central `@ControllerAdvice` handler.

### Q: How do you handle `InterruptedException` correctly, and why does it matter?

When `Thread.sleep()`, `Object.wait()`, `Condition.await()` etc. are interrupted, they throw `InterruptedException` *and clear the thread's interrupt flag*. If you swallow this exception (`catch (InterruptedException e) { /* ignore */ }`), the interrupt signal is permanently lost. This breaks `ExecutorService.shutdownNow()`, which sends interrupts to running threads to stop them — if threads swallow it, they never stop and the executor hangs.

The correct pattern:

```java
try {
    Thread.sleep(duration);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();   // ← restore the interrupt flag
    throw new RuntimeException("Interrupted", e);  // ← propagate appropriately
}
```

If your method is declared `throws InterruptedException`, just let it propagate and don't re-interrupt.

**Follow-up:** What is the difference between `interrupt()`, `interrupted()`, and `isInterrupted()`?  
**A:** `interrupt()` sets the thread's interrupt flag. `isInterrupted()` checks the flag without clearing it. `Thread.interrupted()` (static) checks the flag AND clears it. Blocking operations like `sleep()` respond to the flag by throwing `InterruptedException` and clearing the flag themselves. For polling loops, use `while (!Thread.currentThread().isInterrupted())` to check without clearing.

### Q: Can you create an exception without a stack trace, and why would you want to?

Yes — override `fillInStackTrace()` in a subclass to return `this` without actually filling the trace, or use the `(String, Throwable, boolean, boolean)` protected constructor of `Throwable` with `writableStackTrace=false`:

```java
public class FastException extends RuntimeException {
    public FastException(String msg) {
        super(msg, null, true, false); // ← suppression enabled, stack trace disabled
    }
}
```

This is useful for **exceptions used as flow control in performance-critical paths** (e.g., parser combinators, certain reactive frameworks). Stack trace capture is expensive; disabling it can cut exception-construction time by 10–50×. The downside is lost debuggability — only do this for well-understood, single-purpose exceptions, never for general error signalling.

### Q: How does exception handling interact with the Java type system for re-thrown exceptions?

In Java 7+, when you catch a union type in multi-catch (`catch (IOException | SQLException e)`) and rethrow `e`, the compiler performs a *precise rethrow* — it understands that `e` must be one of the two specific types, not the wider `Exception`. So a method that declares `throws IOException, SQLException` is valid, whereas without this improvement you'd have needed `throws Exception`.

Precise rethrow also applies to single-catch: if you catch `Exception e`, inspect it, and then `throw e`, and the inferred type based on the `try` block is narrower (only `IOException` can be thrown), the compiler allows the `throws IOException` declaration rather than requiring `throws Exception`.

### Q: How would you design an exception strategy for a multi-module microservice application?

A good strategy has three parts:
1. **Each bounded context (module) defines its own base exception** — `OrderException extends RuntimeException`, `PaymentException extends RuntimeException` — with typed fields for machine-readable diagnosis (error code, HTTP status).
2. **Translation at cross-service boundaries** — when calling another service via HTTP, translate HTTP 4xx/5xx responses into domain exceptions. Never let `HttpClientErrorException` or `WebClientResponseException` leak past the API client layer.
3. **Centralized handling per service** — each service has one `@ControllerAdvice` that maps domain exceptions to `ProblemDetail` (RFC 7807, Spring Boot 3+) HTTP responses. Exceptions propagate transparently inside the service; only at the HTTP boundary are they serialized into structured error responses.

## Further Reading

- [Exception Hierarchy](../java/exceptions/exception-hierarchy.md) — the `Throwable` tree in detail
- [try/catch/finally](../java/exceptions/try-catch-finally.md) — mechanics, multi-catch, try-with-resources, suppressed exceptions
- [Custom Exceptions](../java/exceptions/custom-exceptions.md) — building domain-specific exception types with typed fields and hierarchies
- [Exception Best Practices](../java/exceptions/exception-best-practices.md) — golden rules, anti-patterns, fail-fast, and `InterruptedException` handling
