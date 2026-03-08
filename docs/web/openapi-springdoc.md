---
id: openapi-springdoc
title: OpenAPI & Springdoc
description: Auto-generating interactive API documentation for Spring Boot REST APIs using springdoc-openapi — setup, @Operation/@Schema annotations, security schemes, and customisation.
sidebar_position: 7
tags:
  - java
  - spring-boot
  - spring-web
  - intermediate
  - tool
  - openapi
  - api-documentation
  - web
last_updated: 2026-03-08
sources:
  - https://springdoc.org/
  - https://spec.openapis.org/oas/v3.1.0
  - https://docs.spring.io/spring-boot/docs/current/reference/html/web.html
  - https://swagger.io/specification/
---

# OpenAPI & Springdoc

> Springdoc-openapi auto-generates OpenAPI 3 documentation from your Spring Boot code — producing a machine-readable spec and a live Swagger UI with zero manual maintenance.

## What Problem Does It Solve?

REST APIs without documentation force consumers to read source code, send test requests, or rely on out-of-date Word documents to understand what endpoints exist, what parameters they take, and what they return.

Traditional solutions require separate documentation files that drift from the implementation over time. Springdoc solves this by **generating the spec from the code itself**:

- It scans `@RestController`, `@RequestMapping`, `@RequestBody`, `@RequestParam`, and return types at startup
- Outputs a standards-compliant **OpenAPI 3 JSON/YAML spec** at `/v3/api-docs`
- Renders an interactive **Swagger UI** at `/swagger-ui.html`
- Stays in sync with the code — no separate maintenance

## What Is OpenAPI?

**OpenAPI Specification (OAS)** is a vendor-neutral, machine-readable description format for HTTP APIs. Version 3.x is the current standard (maintained by the OpenAPI Initiative). An OpenAPI document describes:

- Available endpoints and HTTP methods
- Input parameters and request body schemas
- Response schemas and status codes
- Authentication requirements

An OpenAPI spec is both human-readable (YAML/JSON) and machine-actionable — client SDKs, test suites, and API gateways consume it directly.

## Setup

### 1. Add dependency

```xml
<!-- pom.xml — Spring Boot 3.x -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

For WebFlux:
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

### 2. Start the server

Visit these URLs after startup:

| URL | Contents |
|-----|----------|
| `/v3/api-docs` | OpenAPI 3 spec as JSON |
| `/v3/api-docs.yaml` | OpenAPI 3 spec as YAML |
| `/swagger-ui.html` | Interactive Swagger UI |

No configuration required for a basic setup.

### 3. Global API metadata (optional but recommended)

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Product Catalogue API")
                .version("v1.0")
                .description("REST API for managing products and categories.")
                .contact(new Contact()
                    .name("Platform Team")
                    .email("platform@example.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0")))
            .addServersItem(new Server()
                .url("https://api.example.com")
                .description("Production"))
            .addServersItem(new Server()
                .url("http://localhost:8080")
                .description("Local development"));
    }
}
```

## Annotations

Springdoc reads standard Spring annotations automatically. Add OpenAPI annotations only to enrich the output.

### @Operation — document an endpoint

```java
@Operation(
    summary = "Get product by ID",
    description = "Returns a single product. Returns 404 if not found.",
    tags = { "Products" },                  // ← groups endpoint in Swagger UI
    responses = {
        @ApiResponse(responseCode = "200", description = "Product found",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    }
)
@GetMapping("/{id}")
public ProductResponse get(@PathVariable Long id) { ... }
```

### @Parameter — document a path/query parameter

```java
@GetMapping
public Page<ProductResponse> list(
    @Parameter(description = "Filter by category ID", example = "42")
    @RequestParam(required = false) Long categoryId,

    @Parameter(description = "Zero-based page index", example = "0")
    @RequestParam(defaultValue = "0") int page
) { ... }
```

### @Schema — document a DTO field

```java
public record CreateProductRequest(
    @Schema(description = "Product display name", example = "Laptop Pro 16",
            minLength = 2, maxLength = 100)
    @NotBlank String name,

    @Schema(description = "Price in USD, must be positive", example = "999.99")
    @NotNull @Positive BigDecimal price,

    @Schema(description = "ID of the parent category", example = "7")
    @NotNull Long categoryId
) {}
```

### @Tag — group endpoints

```java
@Tag(name = "Products", description = "Endpoints for product catalogue management")
@RestController
@RequestMapping("/api/v1/products")
public class ProductController { ... }
```

## Security Schemes

Document authentication so Swagger UI shows an "Authorize" button:

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI securedOpenAPI() {
        return new OpenAPI()
            .info(new Info().title("Secured API").version("v1"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",       // ← scheme name referenced below
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT token from /api/auth/login")))
            .addSecurityItem(new SecurityRequirement()
                .addList("bearerAuth"));                // ← apply globally
    }
}
```

To apply security only to specific endpoints:

```java
@Operation(security = @SecurityRequirement(name = "bearerAuth"))
@GetMapping("/admin/report")
public Report getAdminReport() { ... }
```

## Configuration Properties

```yaml
# application.yml
springdoc:
  api-docs:
    path: /v3/api-docs             # default; change if needed
    enabled: true
  swagger-ui:
    path: /swagger-ui.html         # default
    enabled: true
    operations-sorter: method      # sort endpoints by HTTP method
    tags-sorter: alpha             # sort tag groups alphabetically
    display-request-duration: true # show response time in UI
  packages-to-scan: com.example.api  # scan only specific packages
  paths-to-match: /api/**            # document only /api paths
```

Disable Swagger UI in production:

```yaml
# application-prod.yml
springdoc:
  swagger-ui:
    enabled: false
  api-docs:
    enabled: false                 # ← prevent spec exposure in prod
```

:::warning Disable in production
Exposing the Swagger UI and raw API spec in production leaks your API structure to attackers. Disable with `springdoc.swagger-ui.enabled=false` and `springdoc.api-docs.enabled=false` in the production profile.
:::

## What Springdoc Generates Automatically

Springdoc infers a lot without any extra annotations:

| Auto-detected | Source |
|---------------|--------|
| Endpoint paths | `@RequestMapping`, `@GetMapping`, etc. |
| HTTP methods | Mapping annotation type |
| Path variables | `@PathVariable` |
| Query parameters | `@RequestParam` |
| Request body | `@RequestBody` |
| Response type | Method return type |
| Field names + types | DTO fields |
| Validation constraints | `@NotNull`, `@Size`, `@Min` etc. → `required`, `minLength`, `minimum` in spec |

## Full Annotated Controller Example

```java
@Tag(name = "Products", description = "Product catalogue endpoints")
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(
        summary = "List products",
        description = "Returns a paginated list of products, optionally filtered by category."
    )
    @GetMapping
    public Page<ProductResponse> list(
            @Parameter(description = "Filter by category", example = "electronics")
            @RequestParam(required = false) String category,

            @Parameter(hidden = true)           // ← hide Pageable details from UI
            @PageableDefault(size = 20) Pageable pageable) {
        return productService.findAll(category, pageable);
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
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Product to create",
                required = true
            )
            @RequestBody @Valid CreateProductRequest req) {
        ProductResponse p = productService.create(req);
        return ResponseEntity.created(URI.create("/api/v1/products/" + p.id())).body(p);
    }
}
```

## Best Practices

- **Add `@Operation(summary=...)` to every endpoint** — the summary appears as the title in Swagger UI and is indexed by API tools
- **Use `@Schema(example=...)` on DTO fields** — example values make the Swagger UI immediately usable for testing
- **Disable Swagger UI and `/v3/api-docs` in production** — prevents attackers from mapping your API surface
- **Group related endpoints with `@Tag`** — one tag per domain group (e.g., `"Products"`, `"Orders"`)
- **Document all non-200 responses** — especially validation errors (400) and not-found (404)
- **Version your OpenAPI spec along with the API** — when you release `/v2`, update `OpenAPI.info.version` and regenerate the spec
- **Use `springdoc.packages-to-scan`** — prevents internal or actuator endpoints from appearing in the public spec

## Common Pitfalls

- **Not disabling in production** — the spec is a roadmap for probing the API; always disable it in prod profiles
- **Annotating Spring Data REST repositories** — Springdoc may pick up auto-generated endpoints you don't want documented; use `paths-to-match` to filter
- **`@RequestBody` annotation name conflict** — the Spring `@RequestBody` and the Springdoc `@io.swagger.v3.oas.annotations.parameters.RequestBody` share the same simple name; import the OpenAPI one explicitly or use the fully-qualified name
- **Record types with Java 17+** — Jackson and Springdoc handle records well, but some older versions had issues; always test schema output after upgrading
- **Forgetting `@Hidden` on internal endpoints** — add `@Hidden` (from `io.swagger.v3.oas.annotations`) to controller methods or entire controllers you do not want in the public spec

## Interview Questions

### Beginner

**Q:** What is the difference between Swagger and OpenAPI?

**A:** OpenAPI is the specification (the standard format for describing REST APIs), maintained by the OpenAPI Initiative. Swagger is a brand (originally the creator of the spec) and now refers to the tooling: Swagger UI (the interactive browser UI), Swagger Editor (for editing specs), and so on. When someone says "add Swagger", they usually mean "generate an OpenAPI spec and serve Swagger UI."

---

**Q:** How does Springdoc generate documentation without you writing a YAML file?

**A:** Springdoc scans the Spring application context at startup, finds all `@RestController` classes and their `@RequestMapping` annotations, inspects method parameters and return types, reads Bean Validation constraints, and constructs an OpenAPI 3 object model. The spec is serialized to JSON/YAML and served at `/v3/api-docs`. Additional enrichment comes from OpenAPI annotations (`@Operation`, `@Schema`, etc.) but these are optional.

### Intermediate

**Q:** How would you document JWT authentication in a Springdoc-generated spec?

**A:** Define a `SecurityScheme` bean in an `OpenAPI` bean: set `type=HTTP`, `scheme=bearer`, `bearerFormat=JWT`. Add the scheme to the components and add a global `SecurityRequirement` referencing its name. This causes Swagger UI to show an "Authorize" button where users can enter a token, and marks all documented endpoints as requiring bearer authentication.

---

**Q:** How do you prevent internal or actuator endpoints from appearing in the spec?

**A:** Use `springdoc.paths-to-match=/api/**` in `application.yml` to include only paths under `/api`. Alternatively, use `springdoc.packages-to-scan` to limit the scan to your controller packages. For individual endpoints that cannot be excluded by path, add `@Hidden` from the `io.swagger.v3.oas.annotations` package.

### Advanced

**Q:** How would you host the OpenAPI spec securely in a multi-environment deployment?

**A:** Disable the UI and spec in the production `application-prod.yml` (`springdoc.swagger-ui.enabled=false`, `springdoc.api-docs.enabled=false`). For internal environments (staging/dev), serve Swagger UI behind an auth wall — either Spring Security requiring a role, or behind an API gateway that requires a session. Alternatively, generate the spec as a build artifact (using `springdoc-openapi-maven-plugin`) and host it in a separate internal developer portal that is not exposed to the public internet.

## Further Reading

- [Springdoc OpenAPI Reference](https://springdoc.org/) — full documentation, FAQ, and migration guides
- [OpenAPI 3.1.0 Specification](https://spec.openapis.org/oas/v3.1.0) — the formal specification standard
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/) — how to configure and embed the UI

## Related Notes

- [Spring MVC](./spring-mvc.md) — the annotations that Springdoc reads to infer the spec
- [REST Design](./rest-design.md) — good REST design makes the generated spec cleaner and more usable
- [Exception Handling](./exception-handling.md) — document `ProblemDetail` error responses in `@ApiResponse` annotations
