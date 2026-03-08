---
id: web-overview
title: Web & REST Overview
description: Quick-reference summary of HTTP fundamentals, REST design, Spring MVC, exception handling, WebFlux, and OpenAPI for Java backend engineers.
sidebar_position: 14
tags:
  - java
  - spring-web
  - spring-boot
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Web & REST Overview

> This domain covers the full HTTP API stack in Java backend engineering: the HTTP protocol, REST architectural style, Spring MVC's request lifecycle, centralised exception handling, the reactive WebFlux model, and API documentation with OpenAPI. These topics are tested in almost every Java backend interview — from basic status code knowledge through to reactive concurrency trade-offs.

## Key Concepts at a Glance

- **HTTP**: stateless request-response protocol; every request carries all context needed; server holds no session state
- **HTTP Method**: expresses intent — `GET`=read, `POST`=create, `PUT`=full replace, `PATCH`=partial update, `DELETE`=remove
- **Idempotency**: calling the same operation N times leaves the server in the same state as once; `GET`, `PUT`, `DELETE` are idempotent; `POST` is not
- **Safety**: an operation does not change server state; `GET`, `HEAD`, `OPTIONS` are safe
- **Status Code**: 3-digit number signalling the outcome: 2xx=success, 3xx=redirect, 4xx=client error, 5xx=server error
- **Content Negotiation**: client sends `Accept` header; server picks the best matching `Content-Type` and uses the appropriate `HttpMessageConverter`
- **ETag**: server-generated resource version tag used for conditional requests (`If-None-Match` → 304) and optimistic locking (`If-Match` → 412)
- **REST**: architectural style that maps operations to HTTP verbs and resources to URLs; stateless, cacheable, uniform interface
 - **Bean Validation (`@Valid`)**: triggers field-level validation for request DTOs; requires `spring-boot-starter-validation` (Hibernate Validator) on the classpath
- **Richardson Maturity Model**: grades APIs Level 0 (RPC) → Level 1 (resources) → Level 2 (verbs + status) → Level 3 (HATEOAS); most production APIs are Level 2
- **HATEOAS**: hypermedia links in responses allow clients to discover next actions without hard-coded URLs
- **URI Versioning**: embedding version in path (`/v1/`, `/v2/`) — the industry-standard strategy for public APIs
- **Idempotency Key**: client-generated UUID in a header; server caches result to de-duplicate retries on non-idempotent POST
- **DispatcherServlet**: Spring MVC's front controller; routes every request through `HandlerMapping` → `HandlerAdapter` → controller → `HttpMessageConverter`
- **`@RestController`**: `@Controller` + `@ResponseBody`; every method writes directly to the HTTP response body
- **`@ControllerAdvice`**: global exception handler; applies `@ExceptionHandler` methods across all controllers
- **`ProblemDetail`**: Spring Boot 3 / RFC 9457 standard JSON error structure (`type`, `title`, `status`, `detail`, `instance`)
- **`Mono<T>`**: Project Reactor type representing 0 or 1 async value; WebFlux analogue of `CompletableFuture<Optional<T>>`
- **`Flux<T>`**: Project Reactor type representing an async stream of 0 to N values
- **Backpressure**: subscriber controls the rate of data emission; prevents fast producer from overwhelming slow consumer
- **WebFlux**: Spring's non-blocking, event-loop-based web framework; handles high concurrency on few threads
- **Event Loop**: small fixed thread pool in Netty; never block these threads with synchronous I/O
- **OpenAPI**: vendor-neutral spec format for describing REST APIs; Springdoc generates it automatically from Spring annotations

---

## Quick-Reference Table

| API / Annotation | Purpose | Key Notes |
|------------------|---------|-----------|
| `@RestController` | Marks class as REST handler | `@Controller` + `@ResponseBody` combined |
| `@GetMapping` / `@PostMapping` | Map HTTP method to method | Shorthand for `@RequestMapping(method=GET/POST)` |
| `@PathVariable` | Bind URL segment | `GET /users/{id}` → `@PathVariable Long id` |
| `@RequestParam` | Bind query parameter | `?page=0&size=20`; use `defaultValue` for optionals |
| `@RequestBody` | Deserialize request body | Always pair with `@Valid` for validation |
| `@RequestHeader` | Bind a request header | `required = false` for optional headers |
| `ResponseEntity<T>` | Full response control | Status, headers, and body in one object |
| `@Valid` | Trigger Bean Validation | On `@RequestBody` or `@PathVariable`; throws `MethodArgumentNotValidException` |
| `@ExceptionHandler` | Handle specific exception | Method in `@ControllerAdvice` or `@Controller` |
| `@RestControllerAdvice` | Global exception handler | `@ControllerAdvice` + `@ResponseBody` |
| `ProblemDetail` | RFC 9457 error body | `ProblemDetail.forStatusAndDetail(status, msg)` |
| `HandlerInterceptor` | Pre/post request hook | Registered via `WebMvcConfigurer.addInterceptors()` |
| `Mono<T>` | 0-or-1 async value | Return from WebFlux controller methods |
| `Flux<T>` | 0-to-N async stream | Use `MediaType.TEXT_EVENT_STREAM_VALUE` for SSE |
| `Mono.zip(a, b)` | Parallel fetch | Both publishers start simultaneously |
| `WebClient` | Non-blocking HTTP client | Replaces `RestTemplate` in reactive code |
| `Schedulers.boundedElastic()` | Off-event-loop threads | Use with `Mono.fromCallable()` for blocking calls |
| `@Operation` | Document an endpoint | `summary`, `description`, `responses` fields |
| `@Schema` | Document a DTO field | `description`, `example`, `minLength`, etc. |
| `@Tag` | Group endpoints in UI | Apply to controller class |
| `springdoc.swagger-ui.enabled` | Toggle Swagger UI | Set `false` in production |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [HTTP Fundamentals](../web/http-fundamentals.md) — the protocol everything else builds on; status codes + idempotency are tested in round 1
2. [REST Design](../web/rest-design.md) — resource naming, versioning, and HATEOAS; signals seniority to interviewers
3. [Spring MVC](../web/spring-mvc.md) — DispatcherServlet lifecycle, parameter binding, and response building — core for every Spring Boot role
4. [Exception Handling](../web/exception-handling.md) — `@ControllerAdvice` and `ProblemDetail`; required for any production API
5. [WebFlux & Reactive](../web/webflux-reactive.md) — Mono/Flux, event loop, backpressure; study after MVC for senior roles
6. [OpenAPI & Springdoc](../web/openapi-springdoc.md) — zero-config doc generation; fast to learn, commonly asked in mid-level roles

---

## Top 5 Interview Questions

**Q1:** What is the difference between `401 Unauthorized` and `403 Forbidden`?

**A:** `401` means the client is not authenticated — the server doesn't know who they are and the client should log in. `403` means the client is authenticated but does not have permission to access this resource. Getting these wrong in an interview is a well-known red flag.

---

**Q2:** What does `DispatcherServlet` do in Spring MVC?

**A:** It is the front controller. All incoming HTTP requests enter through it. It asks `HandlerMapping` to find the matching controller method, uses a `HandlerAdapter` to invoke it, and then uses an `HttpMessageConverter` to write the return value to the HTTP response body. Exceptions are routed through `HandlerExceptionResolver` implementations.

---

**Q3:** When would you choose WebFlux over Spring MVC?

**A:** Choose WebFlux when the service makes many concurrent I/O calls (external APIs, streaming) and you need high concurrency on few threads. Stick with Spring MVC when the service is primarily JPA/JDBC-driven — most JDBC drivers are blocking and do not benefit from the reactive model — and when the team values conventional debugging.

---

**Q4:** What is `ProblemDetail` and why use it?

**A:** `ProblemDetail` is Spring Boot 3's built-in implementation of RFC 9457. It standardises error response bodies with `type`, `title`, `status`, `detail`, and `instance` fields — plus arbitrary extension properties. Using it means all errors across the API have a consistent, machine-readable shape that clients, API gateways, and monitoring tools can parse without custom error models.

---

**Q5:** What is idempotency and why does it matter for REST API design?

**A:** An idempotent operation produces the same result whether called once or many times. `GET`, `PUT`, and `DELETE` are idempotent by the HTTP spec. `POST` is not. Idempotency matters because networks fail and clients retry. If `PUT` and `DELETE` are idempotent, clients can safely retry without side effects. For `POST`, you need an explicit idempotency-key pattern to prevent duplicate resource creation.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [HTTP Fundamentals](../web/http-fundamentals.md) | Methods, status codes, headers, ETags, content negotiation, HTTP/2 |
| [REST Design](../web/rest-design.md) | Resource naming, HATEOAS, versioning, idempotency, Richardson model |
| [Spring MVC](../web/spring-mvc.md) | DispatcherServlet, `@RestController`, parameter binding, `ResponseEntity`, interceptors |
| [Exception Handling](../web/exception-handling.md) | `@ControllerAdvice`, `@ExceptionHandler`, `ProblemDetail` (RFC 9457) |
| [WebFlux & Reactive](../web/webflux-reactive.md) | `Mono`, `Flux`, functional endpoints, backpressure, `WebClient`, SSE |
| [OpenAPI & Springdoc](../web/openapi-springdoc.md) | Auto-generated spec, `@Operation`, `@Schema`, security schemes, prod config |
