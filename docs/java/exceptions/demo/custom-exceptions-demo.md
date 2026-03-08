---
id: custom-exceptions-demo
title: "Custom Exceptions — Practical Demo"
description: Hands-on examples for building domain-specific exception hierarchies, adding typed fields, chaining exceptions, and integrating with Spring Boot's @ControllerAdvice.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Custom Exceptions — Practical Demo

> Hands-on examples for [Custom Exceptions](../custom-exceptions.md). Walk through building a real exception hierarchy from scratch.

:::info Prerequisites
Make sure you understand the [Exception Hierarchy](../exception-hierarchy.md) and [try/catch/finally](../try-catch-finally.md) before working through these demos.
:::

---

## Example 1: Minimal Custom Exception

The simplest useful custom exception — two constructors are the minimum.

```java title="ResourceNotFoundException.java" showLineNumbers {1,5,9}
public class ResourceNotFoundException extends RuntimeException {  // ← unchecked

    public ResourceNotFoundException(String message) {
        super(message);           // ← passes message up to Throwable
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);    // ← cause constructor: never omit this
    }
}
```

```java title="Example1Demo.java" showLineNumbers {7}
public class Example1Demo {

    static String findUser(long id) {
        if (id <= 0) {
            throw new ResourceNotFoundException("User not found with id=" + id);
        }
        return "User#" + id;
    }

    public static void main(String[] args) {
        try {
            System.out.println(findUser(42));     // ok
            System.out.println(findUser(-1));     // throws
        } catch (ResourceNotFoundException e) {
            System.out.println("Caught: " + e.getMessage());
            System.out.println("Is unchecked: " + (e instanceof RuntimeException));
        }
    }
}
```

**Expected Output:**
```
User#42
Caught: User not found with id=-1
Is unchecked: true
```

---

## Example 2: Typed Context Fields

Adding a typed field so callers can read the ID without parsing the message string.

```java title="UserNotFoundException.java" showLineNumbers {4,8,13}
public class UserNotFoundException extends RuntimeException {

    private final long userId;   // ← immutable, typed context field

    public UserNotFoundException(long userId) {
        super("User not found: " + userId);  // ← message for humans
        this.userId = userId;
    }

    public UserNotFoundException(long userId, Throwable cause) {
        super("User not found: " + userId, cause);
        this.userId = userId;
    }

    public long getUserId() { return userId; }   // ← accessor for code
}
```

```java title="Example2Demo.java" showLineNumbers {8,13}
public class Example2Demo {

    static String fetchUser(long id) {
        if (id == 99) throw new UserNotFoundException(id);
        return "User[" + id + "]";
    }

    public static void main(String[] args) {
        try {
            System.out.println(fetchUser(1));
            System.out.println(fetchUser(99));    // throws
        } catch (UserNotFoundException e) {
            // Typed access — no string parsing needed
            System.out.printf("No user found for id=%d%n", e.getUserId());
            System.out.println("Message: " + e.getMessage());
        }
    }
}
```

**Expected Output:**
```
User[1]
No user found for id=99
Message: User not found: 99
```

:::tip Key takeaway
Typed fields on exceptions let monitoring, logging, and error responses reference specific identifiers without parsing fragile message strings that might change.
:::

---

## Example 3: Full Exception Hierarchy

Building a two-level hierarchy for an order management domain.

```java title="AppException.java" showLineNumbers {1,9,15}
// Base exception — every domain exception extends this
public class AppException extends RuntimeException {

    private final int    httpStatus;
    private final String errorCode;

    public AppException(String message, int httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode  = errorCode;
    }

    public AppException(String message, Throwable cause, int httpStatus, String errorCode) {
        super(message, cause);   // ← always chain the cause
        this.httpStatus = httpStatus;
        this.errorCode  = errorCode;
    }

    public int    getHttpStatus() { return httpStatus; }
    public String getErrorCode()  { return errorCode; }
}
```

```java title="OrderNotFoundException.java"
public class OrderNotFoundException extends AppException {

    private final String orderId;

    public OrderNotFoundException(String orderId) {
        super("Order not found: " + orderId, 404, "ORDER_NOT_FOUND");
        this.orderId = orderId;
    }

    public String getOrderId() { return orderId; }
}
```

```java title="OrderAlreadyPaidException.java"
public class OrderAlreadyPaidException extends AppException {

    public OrderAlreadyPaidException(String orderId) {
        super("Order " + orderId + " has already been paid", 409, "ORDER_ALREADY_PAID");
    }
}
```

```java title="Example3Demo.java" showLineNumbers {12,16,20}
public class Example3Demo {

    enum OrderState { NEW, PAID, CANCELLED }

    static void payOrder(String orderId, OrderState state) {
        if (state == OrderState.PAID) {
            throw new OrderAlreadyPaidException(orderId);     // ← specific subtype
        }
    }

    static String getOrder(String orderId) {
        if (orderId.startsWith("MISSING")) {
            throw new OrderNotFoundException(orderId);        // ← specific subtype
        }
        return "Order[" + orderId + "]";
    }

    public static void main(String[] args) {
        // Catch specific subtype
        try {
            payOrder("ORD-001", OrderState.PAID);
        } catch (OrderAlreadyPaidException e) {
            System.out.printf("Specific catch — code=%s, status=%d%n",
                e.getErrorCode(), e.getHttpStatus());
        }

        // Catch base type — works for any AppException subtype
        try {
            getOrder("MISSING-999");
        } catch (AppException e) {
            System.out.printf("Base catch — [%s] %s (HTTP %d)%n",
                e.getErrorCode(), e.getMessage(), e.getHttpStatus());
        }
    }
}
```

**Expected Output:**
```
Specific catch — code=ORDER_ALREADY_PAID, status=409
Base catch — [ORDER_NOT_FOUND] Order not found: MISSING-999 (HTTP 404)
```

---

## Example 4: Exception Chaining — Wrapping Infrastructure Exceptions

Demonstrates the correct way to translate a low-level exception into a domain exception while preserving the original cause.

```java title="ExceptionChainingDemo.java" showLineNumbers {15,21}
import java.sql.SQLException;

public class ExceptionChainingDemo {

    // Simulates a repository layer — converts SQL exception to domain exception
    static String findOrderFromDb(String orderId) throws SQLException {
        if (orderId.isBlank()) {
            throw new SQLException("JDBC: query failed — orderId cannot be blank", "42000");
        }
        return "Order[" + orderId + "]";
    }

    // Service layer — translates infrastructure exceptions at the boundary
    static String getOrder(String orderId) {
        try {
            return findOrderFromDb(orderId);
        } catch (SQLException e) {
            // Wrap: add domain context, preserve original SQL cause
            throw new AppException(
                "Failed to load order: " + orderId,
                e,             // ← original SQLException preserved as cause
                500, "DB_ERROR"
            );
        }
    }

    public static void main(String[] args) {
        try {
            getOrder("");    // blank orderId — triggers SQL exception
        } catch (AppException e) {
            System.out.println("Domain exception:  " + e.getMessage());
            System.out.println("Root cause type:   " + e.getCause().getClass().getSimpleName());
            System.out.println("Root cause msg:    " + e.getCause().getMessage());
        }
    }
}
```

**Expected Output:**
```
Domain exception:  Failed to load order: 
Root cause type:   SQLException
Root cause msg:    JDBC: query failed — orderId cannot be blank
```

:::warning Common Mistake
The most common mistake with exception chaining is forgetting to pass the cause: `throw new AppException("message", 500, "ERR")` — this loses the `SQLException` stack trace entirely. Always use the constructor that accepts `Throwable cause`.
:::

---

## Example 5: Spring Boot @ControllerAdvice Integration (Conceptual)

This shows how the exception hierarchy maps to HTTP responses in a Spring Boot REST API.

```java title="GlobalExceptionHandler.java" showLineNumbers {6,14,20}
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles ALL AppException subtypes (OrderNotFoundException, etc.)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleApp(AppException ex) {
        return ResponseEntity
            .status(ex.getHttpStatus())             // ← typed field → HTTP status
            .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage()));
    }

    // More specific handler — Spring picks this over the base handler for OrderNotFoundException
    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleOrderNotFound(OrderNotFoundException ex) {
        // Could add special headers, metrics, etc. for 404s
        return ResponseEntity
            .notFound()
            .build();
    }
}

// Simple error response DTO
record ErrorResponse(String code, String message) {}
```

The controller itself stays clean — no `try/catch`:

```java title="OrderController.java" showLineNumbers {7}
@RestController
@RequestMapping("/orders")
public class OrderController {

    @GetMapping("/{id}")
    public OrderDto getOrder(@PathVariable String id) {
        return orderService.getOrder(id);   // ← throws OrderNotFoundException; handled by advice
    }
}
```

---

## Exercises

1. **Easy**: Create a `ValidationException extends AppException` with a `List<String> violations` field that stores fields that failed validation.
2. **Medium**: Write a `PaymentService` that throws `InsufficientFundsException` (includes `BigDecimal required` and `BigDecimal available` fields) and a `PaymentGatewayException` (wraps a `Throwable` cause from an HTTP client). Catch both in a demo `main` method.
3. **Hard**: Design a complete exception hierarchy for a library management system (books, members, loans). Include a base `LibraryException`, domain-specific subtypes for each entity, and a `GlobalExceptionHandler` that maps each to appropriate HTTP status codes.

---

## Back to Topic

Return to the [Custom Exceptions](../custom-exceptions.md) note for theory, interview questions, and further reading.
