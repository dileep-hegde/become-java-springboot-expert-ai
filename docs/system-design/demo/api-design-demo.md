---
id: api-design-demo
title: "API Design — Practical Demo"
description: Scenario-based walkthrough of designing a production-quality REST API with versioning, pagination, error handling, and rate-limiting headers in Spring Boot 3.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - intermediate
  - demo
last_updated: 2026-03-08
---

# API Design — Practical Demo

> Hands-on examples for [API Design](../api-design.md). We'll build a `Product` API end-to-end: resource modeling, versioned endpoints, paginated listing, and structured error responses.

:::info Prerequisites
Review the [API Design](../api-design.md) concepts first — particularly HTTP verb semantics, status code selection, and the DTO-vs-entity distinction.
:::

---

## Scenario: Product Catalog API

We're building a REST API for a product catalog. Requirements:
- CRUD operations on products
- Paginated product listing
- API versioning from day one
- Structured error responses (RFC 7807)
- Input validation with meaningful error messages

---

## Example 1: DTO Design — Separating API Contract from Entity

```java title="Product.java (Entity — never exposed)" showLineNumbers
@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;          // ← internal field, clients don't need this
    @ManyToOne private Category category;  // ← lazy-loaded; serializing would cause N+1
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // getters/setters omitted
}
```

```java title="ProductResponse.java (V1 DTO)" showLineNumbers {5,7}
// ✅ V1 response: exposes only what the client needs
public record ProductResponse(
    Long id,
    String name,
    BigDecimal price,                         // {5} ← price exposed; stockQuantity hidden
    String categoryName,                       // {7} ← flattened; no Category object graph
    String createdAt                           // ← ISO-8601 string, not LocalDateTime object
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
            p.getId(),
            p.getName(),
            p.getPrice(),
            p.getCategory().getName(),         // ← resolve lazy association here, not in serialization
            p.getCreatedAt().toString()
        );
    }
}
```

```java title="CreateProductRequest.java" showLineNumbers
public record CreateProductRequest(
    @NotBlank(message = "Product name is required")
    String name,

    @NotBlank(message = "Description is required")
    String description,

    @NotNull @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    BigDecimal price,

    @NotNull(message = "Category ID is required")
    Long categoryId
) { }
```

---

## Example 2: Versioned Controller with Pagination

```java title="ProductControllerV1.java" showLineNumbers {3,11,21}
@RestController
@RequestMapping("/api/v1/products")   // {3} ← version in URI path
@RequiredArgsConstructor
public class ProductControllerV1 {

    private final ProductService productService;

    // Paginated list
    @GetMapping
    public Page<ProductResponse> listProducts(              // {11}
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return productService.findAll(pageable);
    }

    // Single product
    @GetMapping("/{id}")
    public ProductResponse getProduct(@PathVariable Long id) { // {21}
        return productService.findById(id);
    }

    // Create
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody @Valid CreateProductRequest request,
            UriComponentsBuilder uriBuilder) {

        ProductResponse created = productService.create(request);
        URI location = uriBuilder.path("/api/v1/products/{id}")
                                 .buildAndExpand(created.id())
                                 .toUri();
        return ResponseEntity.created(location)   // ← sets Location header automatically
                             .body(created);
    }

    // Partial update
    @PatchMapping("/{id}")
    public ProductResponse updatePrice(
            @PathVariable Long id,
            @RequestBody @Valid UpdatePriceRequest request) {
        return productService.updatePrice(id, request.price());
    }

    // Delete
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)          // ← 204, no body
    public void deleteProduct(@PathVariable Long id) {
        productService.delete(id);
    }
}
```

**Sample `GET /api/v1/products?page=0&size=2` response:**
```json
{
  "content": [
    { "id": 1, "name": "Wireless Mouse", "price": 29.99, "categoryName": "Electronics", "createdAt": "2026-03-08T09:00:00" },
    { "id": 2, "name": "Mechanical Keyboard", "price": 89.99, "categoryName": "Electronics", "createdAt": "2026-03-07T14:00:00" }
  ],
  "totalElements": 152,
  "totalPages": 76,
  "number": 0,
  "size": 2,
  "first": true,
  "last": false
}
```

---

## Example 3: Structured Error Handling (RFC 7807)

```java title="GlobalExceptionHandler.java" showLineNumbers {7,15,25}
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Validation errors → 400 with field-level detail
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex,
                                          HttpServletRequest request) { // {7}
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, "Request validation failed");
        pd.setTitle("Validation Failed");
        pd.setProperty("violations",
            ex.getBindingResult().getFieldErrors().stream()
              .map(fe -> Map.of("field", fe.getField(),
                                "message", fe.getDefaultMessage()))
              .toList());                                           // {15}
        pd.setProperty("path", request.getRequestURI());
        return pd;
    }

    // Not found → 404
    @ExceptionHandler(ProductNotFoundException.class)
    public ProblemDetail handleNotFound(ProductNotFoundException ex) { // {25}
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Product Not Found");
        return pd;
    }

    // Catch-all → 500, never leaks stack trace
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        String correlationId = UUID.randomUUID().toString();
        log.error("Unexpected error [correlationId={}]", correlationId, ex);
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred. Reference: " + correlationId);
        pd.setTitle("Internal Server Error");
        return pd; // ← stack trace never reaches the client
    }
}
```

**Sample `POST /api/v1/products` with invalid body:**

Request body:
```json
{ "name": "", "price": -5.00 }
```

Response (`400 Bad Request`):
```json
{
  "type": "about:blank",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request validation failed",
  "path": "/api/v1/products",
  "violations": [
    { "field": "name", "message": "Product name is required" },
    { "field": "price", "message": "Price must be greater than 0" },
    { "field": "categoryId", "message": "Category ID is required" }
  ]
}
```

:::tip Key takeaway
Never return `200 OK` with an error body. The HTTP status code IS the error signal — monitoring, load balancers, and clients all rely on it. Use RFC 7807 `ProblemDetail` for consistent, parsed error responses.
:::

---

## Example 4: API Version Migration (V1 → V2)

Adding a breaking change (new required field) as V2 without removing V1:

```java title="ProductResponseV2.java" showLineNumbers {5}
// ✅ V2: adds description and availability status — breaking for V1 clients
public record ProductResponseV2(
    Long id,
    String name,
    String description,         // {5} ← new field in V2
    BigDecimal price,
    String categoryName,
    boolean inStock,            // ← replaces checking stockQuantity > 0
    String createdAt
) { ... }
```

```java title="ProductControllerV2.java" showLineNumbers
@RestController
@RequestMapping("/api/v2/products")  // ← separate path, V1 still works
@RequiredArgsConstructor
public class ProductControllerV2 {

    @GetMapping("/{id}")
    public ProductResponseV2 getProduct(@PathVariable Long id) {
        return productService.findByIdV2(id); // ← new service method for new projection
    }
    // ← other endpoints unchanged from V1 can share the service layer
}
```

**V1 response still works:**
```
GET /api/v1/products/42  → returns ProductResponse (no description, no inStock)
GET /api/v2/products/42  → returns ProductResponseV2 (description, inStock included)
```

---

## Example 5: OpenAPI Documentation with Springdoc

```xml title="pom.xml"
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.6.0</version>
</dependency>
```

```java title="ProductControllerV1.java (annotated)" showLineNumbers
@Tag(name = "Products", description = "Product catalog management API — V1")
@RestController
@RequestMapping("/api/v1/products")
public class ProductControllerV1 {

    @Operation(
        summary = "List products",
        description = "Returns a paginated list of active products."
    )
    @ApiResponse(responseCode = "200", description = "List returned successfully")
    @GetMapping
    public Page<ProductResponse> listProducts(...) { ... }

    @Operation(summary = "Create a product")
    @ApiResponse(responseCode = "201", description = "Product created",
        headers = @Header(name = "Location", description = "URL of the created product"))
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(...) { ... }
}
```

Swagger UI available at: `http://localhost:8080/swagger-ui.html`

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `GET /api/v1/products/search?name=keyboard` endpoint. Return `404` if no products match, `200` with a list if matches exist.
2. **Medium**: Implement cursor-based pagination on `GET /api/v1/products` — instead of `?page=0&size=20`, use `?cursor=<lastSeenId>&size=20`. Return the next cursor in the response body.
3. **Hard**: Implement an idempotent `POST /api/v1/products` endpoint: if a client sends the same `Idempotency-Key` header twice, the second request returns the stored response without creating a duplicate product. Use Redis with a 24-hour TTL for the idempotency store.

---

## Back to Topic

Return to the [API Design](../api-design.md) note for theory, interview questions, and further reading.
