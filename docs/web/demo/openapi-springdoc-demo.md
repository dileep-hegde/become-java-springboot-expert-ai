---
id: openapi-springdoc-demo
title: "OpenAPI & Springdoc — Practical Demo"
description: Hands-on Springdoc setup, @Operation/@Schema annotations, JWT security scheme, and production-safe configuration for Spring Boot REST APIs.
sidebar_position: 6
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

# OpenAPI & Springdoc — Practical Demo

> Hands-on examples for [OpenAPI & Springdoc](../openapi-springdoc.md). We go from zero to a fully annotated, JWT-secured, production-safe API spec.

:::info Prerequisites
Add the `springdoc-openapi-starter-webmvc-ui` dependency. Spring Boot 3.x is required.

```xml title="pom.xml"
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```
:::

---

## Example 1: Zero-Configuration Auto-Generated Spec

No annotations required for a basic spec. Springdoc scans all `@RestController` classes.

```java title="ProductController.java" showLineNumbers
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return productService.findById(id).orElseThrow();
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody @Valid CreateProductRequest req) {
        ProductResponse p = productService.create(req);
        return ResponseEntity.created(URI.create("/api/v1/products/" + p.id())).body(p);
    }
}
```

After `./mvnw spring-boot:run`, visit:
- `http://localhost:8080/swagger-ui.html` — interactive UI
- `http://localhost:8080/v3/api-docs` — raw JSON spec

Springdoc infers paths (`/api/v1/products`, `/api/v1/products/{id}`), methods (`GET`, `POST`), parameter types (`Long id`, `CreateProductRequest`), and HTTP status codes from the return type.

:::tip Key takeaway
You get working documentation with zero annotations. Add `@Operation` and `@Schema` only where the auto-generated output needs enrichment.
:::

---

## Example 2: Global API Metadata + JWT Security

A complete `OpenApiConfig` bean with server URLs, contact info, and a bearer token security scheme.

```java title="OpenApiConfig.java" showLineNumbers {10,15,20,27,32}
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI applicationOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Product Catalogue API")
                .version("v1.0")
                .description("REST API for managing the product catalogue.")
                .contact(new Contact()
                    .name("Platform Team")
                    .email("platform@example.com")))
            .addServersItem(new Server()
                .url("https://api.example.com")
                .description("Production"))
            .addServersItem(new Server()
                .url("http://localhost:8080")
                .description("Local Development"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",          // ← name referenced below
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT from POST /api/auth/login")))
            .addSecurityItem(new SecurityRequirement()
                .addList("bearerAuth"));                   // ← apply globally
    }
}
```

Swagger UI now shows an **Authorize** button. Paste a JWT there and all subsequent requests include `Authorization: Bearer <token>`.

---

## Example 3: Fully Annotated Controller

Enriched with `@Tag`, `@Operation`, `@Parameter`, `@Schema`, and explicit `@ApiResponse` entries.

```java title="AnnotatedProductController.java" showLineNumbers {2,8,14,23,34}
@Tag(name = "Products", description = "Product catalogue management")
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class AnnotatedProductController {

    private final ProductService productService;

    @Operation(
        summary = "List products",
        description = "Returns a paginated list. Optionally filter by category."
    )
    @GetMapping
    public Page<ProductResponse> list(
            @Parameter(description = "Category slug to filter by", example = "electronics")
            @RequestParam(required = false) String category,

            @Parameter(hidden = true)           // ← hide Spring's Pageable internals from UI
            @PageableDefault(size = 20) Pageable pageable) {
        return productService.findAll(category, pageable);
    }

    @Operation(
        summary = "Get product by ID",
        responses = {
            @ApiResponse(responseCode = "200", description = "Found",
                content = @Content(schema = @Schema(implementation = ProductResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not found",
                content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
        }
    )
    @GetMapping("/{id}")
    public ProductResponse get(
            @Parameter(description = "Product numeric ID", example = "42")
            @PathVariable Long id) {
        return productService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    @Operation(
        summary = "Create product",
        responses = {
            @ApiResponse(responseCode = "201", description = "Created"),
            @ApiResponse(responseCode = "400", description = "Validation failed",
                content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
        }
    )
    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @RequestBody @Valid CreateProductRequest req) {
        ProductResponse p = productService.create(req);
        return ResponseEntity.created(URI.create("/api/v1/products/" + p.id())).body(p);
    }
}
```

DTO with `@Schema` enrichment:

```java title="CreateProductRequest.java"
public record CreateProductRequest(
    @Schema(description = "Product display name", example = "Laptop Pro 16",
            minLength = 2, maxLength = 100)
    @NotBlank String name,

    @Schema(description = "Price in USD", example = "999.99")
    @NotNull @Positive BigDecimal price,

    @Schema(description = "Parent category ID", example = "7")
    @NotNull Long categoryId
) {}
```

---

## Example 4: Profile-Based Disable in Production

Disable the spec and UI in production while keeping them in dev/staging.

```yaml title="application-prod.yml"
springdoc:
  swagger-ui:
    enabled: false       # ← no Swagger UI in production
  api-docs:
    enabled: false       # ← no /v3/api-docs in production
```

```yaml title="application-dev.yml"
springdoc:
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha
    display-request-duration: true
  api-docs:
    enabled: true
    path: /v3/api-docs
  packages-to-scan: com.example.api    # ← scan only API controllers
```

---

## Exercises

1. **Easy**: Add `@Operation(summary = "Delete product")` to a `DELETE /{id}` endpoint and verify it appears in Swagger UI.
2. **Medium**: Mark the entire `AdminController` with `@Hidden` so it does not appear in the public spec regardless of path.
3. **Hard**: Use `springdoc-openapi-maven-plugin` to generate the `openapi.json` spec as a build artifact so it can be committed to version control and imported into Postman automatically.

---

## Back to Topic

Return to [OpenAPI & Springdoc](../openapi-springdoc.md) for full annotation reference, security scheme details, and interview questions.
