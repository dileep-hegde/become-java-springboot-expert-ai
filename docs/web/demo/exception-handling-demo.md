---
id: exception-handling-demo
title: "Exception Handling — Practical Demo"
description: Hands-on Spring Boot demo of @ControllerAdvice, ProblemDetail error responses, validation error shaping, and the catch-all exception handler pattern.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - spring-web
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Exception Handling — Practical Demo

> Hands-on examples for [Exception Handling](../exception-handling.md). We build a complete `@RestControllerAdvice`, a domain exception hierarchy, and test each error scenario.

:::info Prerequisites
Understand [Exception Handling in Spring MVC](../exception-handling.md) and have `spring-boot-starter-web` and the `spring-boot-starter-validation` dependency available.
:::

---

## Example 1: Domain Exception Hierarchy

A base exception that carries an HTTP status, and specific subtypes for common cases.

```java title="AppException.java" showLineNumbers {4,5}
public class AppException extends RuntimeException {

    private final HttpStatus status;                         // ← carries HTTP status

    protected AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() { return status; }
}
```

```java title="ResourceNotFoundException.java" showLineNumbers {3}
public class ResourceNotFoundException extends AppException {
    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " with id " + id + " was not found.", HttpStatus.NOT_FOUND); // ← 404
    }
}
```

```java title="ConflictException.java" showLineNumbers {2}
public class ConflictException extends AppException {
    public ConflictException(String message) { super(message, HttpStatus.CONFLICT); } // ← 409
}
```

Service throwing domain exceptions:

```java title="NoteService.java" showLineNumbers {10,15}
@Service
@RequiredArgsConstructor
public class NoteService {

    private final Map<Long, String> notes = new ConcurrentHashMap<>();
    private final AtomicLong idGen = new AtomicLong(1);

    public String findById(Long id) {
        String note = notes.get(id);
        if (note == null) throw new ResourceNotFoundException("Note", id); // ← 404
        return note;
    }

    public Long create(String text) {
        if (notes.values().contains(text)) throw new ConflictException("Duplicate note text."); // ← 409
        Long id = idGen.getAndIncrement();
        notes.put(id, text);
        return id;
    }
}
```

---

## Example 2: Complete @RestControllerAdvice

```java title="GlobalExceptionHandler.java" showLineNumbers {11,22,36,50}
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Handles all domain exceptions (404, 409, etc.)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ProblemDetail> handleAppException(
            AppException ex, HttpServletRequest request) {

        ProblemDetail pd = ProblemDetail
                .forStatusAndDetail(ex.getStatus(), ex.getMessage());
        pd.setInstance(URI.create(request.getRequestURI()));
        return ResponseEntity.status(ex.getStatus()).body(pd);
    }

    // Handles Bean Validation failures on @RequestBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(
            MethodArgumentNotValidException ex) {

        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Validation Failed");
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                    FieldError::getField,
                    fe -> fe.getDefaultMessage() != null
                            ? fe.getDefaultMessage() : "invalid"
                ));
        pd.setProperty("errors", fieldErrors);     // ← field-by-field error extension
        return ResponseEntity.badRequest().body(pd);
    }

    // Catch-all — hides internal details
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleAll(
            Exception ex, HttpServletRequest request) {

        log.error("Unhandled error on {} {}",
                  request.getMethod(), request.getRequestURI(), ex);  // ← always log

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later."); // ← no leaking
        pd.setInstance(URI.create(request.getRequestURI()));
        return ResponseEntity.internalServerError().body(pd);
    }
}
```

---

## Example 3: Controller + Error Scenarios

```java title="NoteController.java" showLineNumbers {12,19}
@RestController
@RequestMapping("/demo/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        return Map.of("id", id, "text", noteService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody @Valid CreateNoteRequest req) {
        Long id = noteService.create(req.text());
        return ResponseEntity.created(URI.create("/demo/notes/" + id))
                .body(Map.of("id", id, "text", req.text()));
    }

    record CreateNoteRequest(
        @NotBlank @Size(min = 2, max = 200) String text
    ) {}
}
```

**curl scenarios and expected responses:**

```bash
# 1 — Create a note
curl -X POST /demo/notes -H "Content-Type: application/json" -d '{"text":"Buy milk"}'
# 201 Created
# {"id":1,"text":"Buy milk"}

# 2 — Get existing note
curl /demo/notes/1
# 200 OK
# {"id":1,"text":"Buy milk"}

# 3 — Not found → 404 ProblemDetail
curl /demo/notes/99
# 404 Not Found
# {"status":404,"detail":"Note with id 99 was not found.","instance":"/demo/notes/99"}

# 4 — Duplicate note → 409 ProblemDetail
curl -X POST /demo/notes -H "Content-Type: application/json" -d '{"text":"Buy milk"}'
# 409 Conflict
# {"status":409,"detail":"Duplicate note text.","instance":"/demo/notes"}

# 5 — Validation failure → 400 ProblemDetail with field errors
curl -X POST /demo/notes -H "Content-Type: application/json" -d '{"text":""}'
# 400 Bad Request
# {"status":400,"title":"Validation Failed","errors":{"text":"must not be blank"}}
```

:::tip Key takeaway
Every error scenario produces a consistent `ProblemDetail` shape. Clients can parse errors generically without special-casing each exception type.
:::

---

## Exercises

1. **Easy**: Add a `@Size(max=200)` constraint to `CreateNoteRequest.text` and verify the 400 response includes a `text` field error.
2. **Medium**: Create a `RateLimitExceededException` that extends `AppException` with `HttpStatus.TOO_MANY_REQUESTS` (429). Throw it from a service and verify the handler returns a `429 ProblemDetail`.
3. **Hard**: Add a `timestamp` extension field to every `ProblemDetail` response using an `@ExceptionHandler` interceptor approach — without duplicating the code in each handler method.

---

## Back to Topic

Return to [Exception Handling](../exception-handling.md) for `@ControllerAdvice` internals, RFC 9457, and interview questions.
