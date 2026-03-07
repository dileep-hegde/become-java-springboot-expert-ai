---
id: web-index
title: Web & REST
description: REST API design, HTTP protocol, Spring MVC, WebFlux, OpenAPI.
sidebar_position: 1
tags:
  - spring-web
  - overview
last_updated: 2026-03-07
---

# Web & REST

> Nearly every Java backend engineer builds HTTP APIs. This domain covers the full stack from HTTP protocol fundamentals through Spring MVC (the synchronous model) and WebFlux (the reactive model). REST design principles, proper status codes, content negotiation, and API documentation with OpenAPI are the practical skills interviewers probe here.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| HTTP Fundamentals | Methods, status codes, headers, content negotiation, HTTP/2 basics. |
| REST Design | Resources, representations, HATEOAS, versioning strategies, idempotency. |
| Spring MVC | `@RestController`, `@RequestMapping`, `@PathVariable`, `@RequestBody`, `ResponseEntity`. |
| Exception Handling | `@ExceptionHandler`, `@ControllerAdvice`, `ProblemDetail` (RFC 7807). |
| WebFlux & Reactive | `Mono`, `Flux`, functional endpoints, backpressure, when to choose reactive. |
| OpenAPI & Springdoc | Generating API documentation with `springdoc-openapi`; `@Operation`, `@Schema`. |

## Learning Path

1. **HTTP Fundamentals** — status codes (200/201/400/401/403/404/409/500) and idempotency are first-round interview questions.
2. **REST Design** — resource naming, HTTP verbs, and versioning strategies signal seniority.
3. **Spring MVC** — the `@RestController` model is the default for most Spring Boot APIs.
4. **Exception Handling** — `@ControllerAdvice` + RFC 7807 `ProblemDetail` is the current best practice.
5. **WebFlux** — study after MVC; reactive is adopted for high-throughput scenarios but adds complexity.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — `spring-boot-starter-web` bootstraps the Spring MVC stack.
- [Spring Security](../spring-security/index.md) — authentication and CORS configuration live at the web layer.
- [Testing](../testing/index.md) — `MockMvc` and `WebTestClient` are the tools for testing Spring MVC and WebFlux controllers.
