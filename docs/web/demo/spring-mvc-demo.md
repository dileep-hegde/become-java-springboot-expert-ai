---
id: spring-mvc-demo
title: "Spring MVC — Practical Demo"
description: Hands-on Spring MVC examples covering DispatcherServlet internals, parameter binding, validation, content negotiation, and interceptors.
sidebar_position: 3
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

# Spring MVC — Practical Demo

> Hands-on examples for [Spring MVC](../spring-mvc.md). We cover parameter binding variants, `ResponseEntity` patterns, Bean Validation, and a logging interceptor.

:::info Prerequisites
Understand [Spring MVC](../spring-mvc.md) and have a working Spring Boot 3 project with `spring-boot-starter-web` on the classpath.
:::

---

## Example 1: All Parameter Binding Types

A single controller demonstrating every common parameter binding annotation.

```java title="BindingDemoController.java" showLineNumbers {10,11,12,13,14}
@RestController
@RequestMapping("/demo/binding")
public class BindingDemoController {

    // GET /demo/binding/users/42?format=compact
    // Header: X-Locale: en-US
    // Body: (none)
    @GetMapping("/users/{id}")
    public Map<String, Object> binding(
            @PathVariable Long id,                                // ← from URL path
            @RequestParam(defaultValue = "full") String format,  // ← from query string
            @RequestHeader(value = "X-Locale",
                           defaultValue = "en") String locale,  // ← from request header
            HttpServletRequest request                            // ← full raw request
    ) {
        return Map.of(
            "id", id,
            "format", format,
            "locale", locale,
            "method", request.getMethod()
        );
    }

    // POST /demo/binding/orders
    // Body: { "item": "Laptop", "qty": 2 }
    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody @Valid OrderRequest body) {              // ← JSON body + validation
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("item", body.item(), "qty", body.qty(), "status", "created"));
    }

    record OrderRequest(
        @NotBlank String item,
        @Min(1) @Max(100) int qty
    ) {}
}
```

**curl examples:**

```bash
# Path variable + query param + header
curl -H "X-Locale: fr-FR" "/demo/binding/users/7?format=compact"
# {"id":7,"format":"compact","locale":"fr-FR","method":"GET"}

# JSON body with validation
curl -X POST /demo/binding/orders -H "Content-Type: application/json" \
     -d '{"item":"Laptop","qty":2}'
# {"item":"Laptop","qty":2,"status":"created"}

# Validation failure
curl -X POST /demo/binding/orders -H "Content-Type: application/json" \
     -d '{"item":"","qty":0}'
# → 400 Bad Request with field errors
```

:::tip Key takeaway
`@PathVariable` binds from the URL path, `@RequestParam` from query strings, `@RequestHeader` from headers, and `@RequestBody` from the request body. Each is independent.
:::

---

## Example 2: ResponseEntity Patterns

Four different patterns for building responses.

```java title="ResponsePatterns.java" showLineNumbers {12,22,30,40}
@RestController
@RequestMapping("/demo/responses")
public class ResponsePatterns {

    private final Map<Long, String> items =
        new ConcurrentHashMap<>(Map.of(1L, "Laptop", 2L, "Phone"));

    // Pattern 1: Simple return type (Spring infers 200 OK)
    @GetMapping("/simple/{id}")
    public String simple(@PathVariable Long id) {
        return items.getOrDefault(id, "unknown");               // ← 200 OK implicit
    }

    // Pattern 2: ResponseEntity for variable status
    @GetMapping("/entity/{id}")
    public ResponseEntity<String> entity(@PathVariable Long id) {
        if (!items.containsKey(id)) {
            return ResponseEntity.notFound().build();           // ← 404
        }
        return ResponseEntity.ok(items.get(id));                // ← 200
    }

    // Pattern 3: ResponseEntity with custom headers
    @GetMapping("/headers/{id}")
    public ResponseEntity<String> withHeaders(@PathVariable Long id) {
        return ResponseEntity.ok()
                .header("X-Item-Id", String.valueOf(id))        // ← custom header
                .header("Cache-Control", "max-age=60")          // ← cache hint
                .body(items.getOrDefault(id, "unknown"));
    }

    // Pattern 4: 201 Created + Location
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Map<String, String> body) {
        long newId = items.size() + 1L;
        items.put(newId, body.get("name"));
        URI location = URI.create("/demo/responses/entity/" + newId);
        return ResponseEntity.created(location)                 // ← 201 + Location header
                .body(Map.of("id", newId, "name", body.get("name")));
    }
}
```

---

## Example 3: Logging HandlerInterceptor

A global interceptor that logs every request's method, path, and response status.

```java title="RequestLoggingInterceptor.java" showLineNumbers {12,21}
@Component
@Slf4j
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final String START_TIME = "startTime";

    @Override
    public boolean preHandle(HttpServletRequest req,
                             HttpServletResponse res, Object handler) {
        req.setAttribute(START_TIME, System.currentTimeMillis()); // ← capture start time
        log.info("→ {} {}", req.getMethod(), req.getRequestURI());
        return true;            // ← true = continue processing; false = abort
    }

    @Override
    public void afterCompletion(HttpServletRequest req,
                                HttpServletResponse res,
                                Object handler, Exception ex) {
        long start  = (Long) req.getAttribute(START_TIME);
        long elapsed = System.currentTimeMillis() - start;
        log.info("← {} {} {}ms", res.getStatus(),
                 req.getRequestURI(), elapsed);                   // ← log status + duration
    }
}
```

```java title="WebMvcConfig.java" showLineNumbers {8}
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final RequestLoggingInterceptor loggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loggingInterceptor)
                .addPathPatterns("/api/**", "/demo/**")   // ← selective path patterns
                .excludePathPatterns("/actuator/**");     // ← exclude health checks
    }
}
```

**Console output:**
```
INFO  → GET /demo/binding/users/7
INFO  ← 200 /demo/binding/users/7 3ms
```

:::warning Common Mistake
Returning `false` from `preHandle` without writing a response causes the client to receive an empty `200` with no body. Always write an explicit error response before returning `false`.
:::

---

## Exercises

1. **Easy**: Add a `@RequestHeader("Authorization")` binding to the `binding()` method and log the first 10 characters of the token (not the full value).
2. **Medium**: Add a `@ModelAttribute`-based endpoint at `POST /demo/binding/form` that accepts `application/x-www-form-urlencoded` with `name` and `email` fields.
3. **Hard**: Extend `RequestLoggingInterceptor` to log the request body. You will need to wrap the `HttpServletRequest` in a `ContentCachingRequestWrapper` — implement this in a `Filter` so the body can be read after the controller consumes it.

---

## Back to Topic

Return to [Spring MVC](../spring-mvc.md) for full DispatcherServlet lifecycle, all parameter types, and interview questions.
