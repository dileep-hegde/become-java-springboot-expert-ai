---
id: web-interview-prep
title: Web & REST Interview Questions
description: Consolidated interview Q&A for the Web & REST domain — HTTP fundamentals, REST design, Spring MVC, exception handling, WebFlux, and OpenAPI — beginner through advanced.
sidebar_position: 14
tags:
  - interview-prep
  - java
  - spring-web
  - spring-boot
  - http
  - rest
  - spring-mvc
  - webflux
last_updated: 2026-03-08
---

# Web & REST Interview Questions

> Consolidated Q&A for the Web & REST domain. Covers HTTP fundamentals, REST design, Spring MVC internals, exception handling, WebFlux, and OpenAPI documentation. Use for rapid revision before backend interviews.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles
- **Advanced** questions signal senior-level depth (5+ YOE)

---

## Beginner

### Q: What is HTTP and why is it stateless?

HTTP (HyperText Transfer Protocol) is the application-layer protocol used by clients and servers to exchange resources over a network. It is stateless because the server retains no memory of previous requests — every request must carry all information the server needs to process it (credentials, session token, body). Statelessness improves scalability because any server instance can handle any request without needing sticky sessions.

### Q: What are the most common HTTP status codes and what do they mean?

| Code | Name | Meaning |
|------|------|---------|
| 200 | OK | Successful request with a response body |
| 201 | Created | Resource created; `Location` header points to it |
| 204 | No Content | Success with no body (common for DELETE) |
| 400 | Bad Request | Client sent invalid input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but lacks permission |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | State conflict (duplicate, optimistic lock failure) |
| 500 | Internal Server Error | Unexpected server bug |

### Q: What is the difference between `PUT` and `PATCH`?

`PUT` replaces the entire resource — the client sends the complete new state. `PATCH` applies a partial update — only the fields to change are sent; unspecified fields are left as is. `PUT` is idempotent (calling it N times gives the same result as once); `PATCH` is not guaranteed to be idempotent.

### Q: What does `@RestController` do in Spring MVC?

`@RestController` is a composed annotation that combines `@Controller` (registers the class as a Spring MVC handler) and `@ResponseBody` (writes return values directly to the HTTP response body via a message converter). Every method in a `@RestController` writes its return value as the response body (typically JSON via Jackson) without needing a separate `@ResponseBody` on each method.

### Q: What is REST?

REST (Representational State Transfer) is an architectural style for distributed systems that uses HTTP features — methods, status codes, URLs, headers — to perform operations on resources. Resources are identified by URLs; the HTTP method expresses the intent (GET = read, POST = create, PUT/PATCH = update, DELETE = remove). REST is stateless, cacheable, and uses a uniform interface.

### Q: How do you read a path variable in Spring MVC?

Use `@PathVariable` on a method parameter:

```java
@GetMapping("/users/{id}")
public UserResponse get(@PathVariable Long id) { ... }
// GET /users/42 → id = 42
```

---

## Intermediate

### Q: What is the difference between `401 Unauthorized` and `403 Forbidden`?

`401 Unauthorized` means the client has not (or has incorrectly) authenticated — the server doesn't know who is making the request. The client should log in first. `403 Forbidden` means the client is authenticated but does not have permission to access this specific resource. Think: 401 = "who are you?"; 403 = "I know who you are, but no."

### Q: What does `DispatcherServlet` do?

`DispatcherServlet` is the front controller of Spring MVC. All HTTP requests enter through this single servlet. It asks `HandlerMapping` to find the controller method matching the URL and HTTP method, uses a `HandlerAdapter` to invoke it, then uses an `HttpMessageConverter` to serialize the return value to the response body. It also routes exceptions to `HandlerExceptionResolver` implementations.

### Q: How do you handle validation errors globally in Spring Boot?

Annotate the request DTO with Bean Validation constraints (`@NotBlank`, `@Positive`), add `@Valid` on the controller's `@RequestBody` parameter, and define a `@RestControllerAdvice` class with an `@ExceptionHandler(MethodArgumentNotValidException.class)` method that maps the field errors to a `ProblemDetail` (RFC 9457) response with status `400 Bad Request`.

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(FieldError::getField,
                                  fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid"));
    pd.setProperty("errors", errors);
    return ResponseEntity.badRequest().body(pd);
}

**Note:** Bean Validation is provided by the `spring-boot-starter-validation` dependency (Hibernate Validator). Add it to your project to enable `@Valid` and trigger `MethodArgumentNotValidException` for invalid `@RequestBody` parameters.
```

### Q: What is content negotiation in Spring MVC?

Content negotiation is the process by which the client and server agree on the response format. The client sends the `Accept` header listing acceptable MIME types (`application/json`, `application/xml`). Spring MVC's `ContentNegotiationManager` selects the best match and routes the response through the appropriate `HttpMessageConverter`. You opt in by specifying `produces` on `@RequestMapping`. Adding Jackson XML support to the classpath automatically enables XML negotiation.

### Q: What is `ProblemDetail` in Spring Boot 3?

`ProblemDetail` is Spring Framework 6's built-in implementation of RFC 9457 (Problem Details for HTTP APIs). It provides a standard JSON error shape with `type`, `title`, `status`, `detail`, and `instance` fields, plus arbitrary extension properties. Enable automatic use for Spring's own exceptions (404, 405, etc.) with `spring.mvc.problemdetails.enabled=true`. Use `ProblemDetail.forStatusAndDetail(status, message)` in `@ExceptionHandler` methods.

### Q: What is the Richardson Maturity Model?

It grades REST APIs into four levels: Level 0 uses HTTP as a tunnel for RPC (single endpoint, all verbs). Level 1 introduces resource URLs. Level 2 adds proper HTTP methods and status codes. Level 3 (HATEOAS) includes hypermedia links in responses so clients discover available actions from the response. Most production REST APIs target Level 2.

### Q: What is the difference between `Mono` and `Flux` in WebFlux?

`Mono<T>` represents an asynchronous stream of 0 or 1 value — like an async `Optional`. `Flux<T>` represents an asynchronous stream of 0 to N values — like an async `Stream`. Both are lazy; nothing executes until something subscribes. In a WebFlux `@RestController`, returning `Mono` or `Flux` causes the framework to subscribe and write the result to the HTTP response.

### Q: When would you choose Spring WebFlux over Spring MVC?

Choose WebFlux when: (1) the service makes many concurrent I/O calls (external APIs, database reads) that should not block threads; (2) you need to support thousands of long-lived connections (Server-Sent Events, WebSocket); (3) you are using reactive drivers (R2DBC, MongoDB reactive). Stick with Spring MVC when the service is primarily JPA/JDBC-driven, the team is unfamiliar with reactive patterns, or you need maximum debuggability.

---

## Advanced

### Q: How does Spring MVC select which `@ExceptionHandler` method to call for a given exception?

Spring selects the most specific handler. It considers both local `@ExceptionHandler` methods (inside the `@Controller`) and global ones (in `@ControllerAdvice`). A local handler takes priority over a global one for the same exception type. Among global handlers in the same advice class, the most specific exception type wins (e.g., `UserNotFoundException` over `RuntimeException`). Multiple `@ControllerAdvice` classes are ordered by `@Order` or `Ordered` interface — lower order values = higher priority.

**Follow-up:** What happens when no `@ExceptionHandler` matches?

**A:** Spring falls through to the default `HandlerExceptionResolver` chain. `DefaultHandlerExceptionResolver` handles Spring MVC's own exceptions (e.g., `HttpRequestMethodNotSupportedException` → 405). If nothing handles the exception, it propagates to the Servlet container, which renders its default error page (or Spring Boot's `BasicErrorController` at `/error`).

---

### Q: Explain backpressure in reactive programming. How does Project Reactor implement it?

Backpressure is the ability of a downstream subscriber to control the rate of data flow from an upstream publisher. Without it, a slow consumer can be overwhelmed by a fast producer, causing out-of-memory errors. Project Reactor implements the Reactive Streams specification: the `Subscriber` calls `Subscription.request(n)` to signal readiness for up to `n` items. The `Publisher` may emit no more than `n` until the next `request()` call. In HTTP, backpressure surfaces naturally in SSE and streaming endpoints — the server writes only as fast as the TCP window allows.

**Follow-up:** What happens if you call a blocking database method on a WebFlux event loop thread?

**A:** The event loop thread blocks, preventing it from handling other requests. This destroys concurrency — 200 concurrent requests waiting on a blocked thread behave exactly like a saturated Spring MVC thread pool. Fix: wrap blocking calls in `Mono.fromCallable(() -> blockingCall()).subscribeOn(Schedulers.boundedElastic())`.

---

### Q: How do you implement idempotency for a `POST` endpoint in a distributed system?

The client generates a UUID and sends it in an `Idempotency-Key` header. The server maintains a distributed cache (e.g., Redis) keyed by idempotency key. On first receipt, the server processes the request, stores the result, and returns it. On subsequent identical requests (retries), the server returns the cached result without reprocessing. The key expires after a window (24–48 hours). This prevents duplicate resource creation when clients retry after network failures, while remaining transparent to a single-request client.

---

### Q: How does HTTP/2 improve performance compared to HTTP/1.1?

HTTP/2 uses binary framing and **multiplexing** — multiple request/response exchanges share a single TCP connection concurrently, eliminating HTTP/1.1's head-of-line blocking (where a slow response delays subsequent requests on the connection). HTTP/2 also compresses headers with HPACK (eliminating repeated header transmission overhead) and optionally supports server push. For Spring Boot: `server.http2.enabled=true`. In practice, HTTP/2 also requires TLS in browser environments.

---

### Q: How would you design a versioning strategy for a public REST API that serves both mobile clients and web clients?

Use URI path versioning (`/v1/`, `/v2/`) as the default because it is immediately visible, easily routable by API gateways and load balancers, and requires no special client configuration. Establish a deprecation policy (e.g., a minimum 12-month support window after a new version ships). Use a `Deprecation` and `Sunset` response header on old endpoints to signal impending removal. Maintain separate Spring MVC controller classes per version to avoid cross-version coupling. Internal service-to-service APIs can use header versioning where cleaner URLs matter more.

**Follow-up:** How would you avoid duplicating the service layer across versions?

**A:** The service and repository layers should be version-agnostic. Only the DTOs and controller classes are versioned. When V2 adds a new field, create `UserV2DTO` mapping from the shared `User` entity. The `UserService.findById()` remains unchanged — controllers call it and map to their version-specific DTO.

---

### Q: How would you secure the Swagger UI and OpenAPI spec in a multi-environment deployment?

Disable both in production via `springdoc.swagger-ui.enabled=false` and `springdoc.api-docs.enabled=false` in `application-prod.yml`. For staging/dev environments, serve Swagger UI behind a Spring Security rule that requires a specific role:

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").hasRole("ADMIN")
    .anyRequest().authenticated());
```

Alternatively, host the spec as a static build artifact (via `springdoc-openapi-maven-plugin`) and serve it from an internal developer portal that is not exposed to the public internet. Never rely on obscurity alone — always enforce an access control mechanism.

---

## Quick-Reference Cheat Sheet

| Topic | Key Fact |
|-------|----------|
| Idempotent methods | GET, HEAD, PUT, DELETE, OPTIONS |
| Safe methods | GET, HEAD, OPTIONS |
| 401 vs 403 | 401 = not authenticated; 403 = not authorized |
| DispatcherServlet | Front controller; all requests enter here |
| `@RestControllerAdvice` | Global`@ExceptionHandler` + `@ResponseBody` |
| `ProblemDetail` | RFC 9457 standard error shape; Spring Boot 3+ |
| Mono vs Flux | 0-or-1 value vs 0-to-N stream |
| WebFlux thread model | Small event loop pool; never block the thread |
| Richardson Level 2 | Correct HTTP methods + status codes (industry standard) |
| OpenAPI in prod | Always disable `swagger-ui` and `api-docs` in production |

---

## Related Notes

- [HTTP Fundamentals](../web/http-fundamentals.md)
- [REST Design](../web/rest-design.md)
- [Spring MVC](../web/spring-mvc.md)
- [Exception Handling](../web/exception-handling.md)
- [WebFlux & Reactive](../web/webflux-reactive.md)
- [OpenAPI & Springdoc](../web/openapi-springdoc.md)
