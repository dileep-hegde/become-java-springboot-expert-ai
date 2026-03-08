---
id: projections-demo
title: "Spring Data Projections — Practical Demo"
description: Hands-on examples for closed interface projections, nested projections, DTO projections with records, and dynamic projections.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - spring-data
  - jpa
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Spring Data Projections — Practical Demo

> Hands-on examples for [Spring Data Projections](../projections.md). All examples use the `Product`/`Customer` domain to show how projections reduce over-fetching and prevent sensitive field leakage.

:::info Prerequisites
Ensure you understand [Spring Data Repositories](../spring-data-repositories.md) and [JPA Basics](../jpa-basics.md). See [Spring Data Projections](../projections.md) for the full theory.
:::

---

## Example 1: Closed Interface Projection

Load only `id`, `name`, and `price` — skip the heavy `description` and `thumbnail` columns entirely.

```java title="Product.java (entity)"
@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private BigDecimal price;
    private String description;      // ← large text column
    private byte[] thumbnailImage;   // ← binary column — expensive
}
```

```java title="ProductSummary.java (closed projection)" showLineNumbers {1,2,3}
public interface ProductSummary {    // ← interface — Spring generates a proxy implementing this
    Long getId();
    String getName();
    BigDecimal getPrice();
    // ← description and thumbnailImage are NOT declared here → NOT fetched from DB
}
```

```java title="ProductRepository.java"
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<ProductSummary> findAllProjectedBy();              // ← Spring infers projection from return type
    Optional<ProductSummary> findProjectedById(Long id);
}
```

**SQL generated (only declared columns):**
```sql
SELECT p.id, p.name, p.price FROM products p
-- thumbnail_image NOT loaded — saves IO on large binary columns
```

```java title="ProductController.java"
@GetMapping("/products")
public List<ProductSummary> listProducts() {
    return productRepo.findAllProjectedBy();  // ← safe: no thumbnailImage in response
}
```

:::tip Key takeaway
The interface getter names (`getId`, `getName`, `getPrice`) match entity field names exactly. Spring Data derives column selection from these names at startup time.
:::

---

## Example 2: Nested Projection for Associations

Include selected fields from a related entity in a single query — eliminates N+1.

```java title="OrderSummary.java" showLineNumbers {4,8}
public interface OrderSummary {
    Long getId();
    String getStatus();

    CustomerInfo getCustomer();   // ← nested projection — one level deep

    interface CustomerInfo {      // ← inner interface for Customer fields
        String getName();
        String getEmail();
        // ← customer.passwordHash is NOT included → not fetched → not exposed
    }
}
```

```java title="OrderRepository.java"
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<OrderSummary> findByStatus(String status);
}
```

**SQL generated (single JOIN — no N+1):**
```sql
SELECT o.id, o.status, c.name, c.email
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
WHERE o.status = ?
```

```java title="Demo"
List<OrderSummary> pending = orderRepo.findByStatus("PENDING");
pending.forEach(o ->
    System.out.println(o.getCustomer().getName() + " — " + o.getStatus())
);
// → "Alice — PENDING"
// → "Bob — PENDING"
// All loaded in ONE query. Customer password never exposed.
```

---

## Example 3: DTO Projection with Java Records

Use a `record` for an immutable, serialization-friendly DTO loaded via a JPQL constructor expression.

```java title="ProductPriceInfo.java (record DTO)"
public record ProductPriceInfo(Long id, String name, BigDecimal price) {}
//                              ↑ constructor parameter order must match SELECT order below
```

```java title="ProductRepository.java" showLineNumbers {3}
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT new com.example.dto.ProductPriceInfo(p.id, p.name, p.price) FROM Product p")
    List<ProductPriceInfo> findAllPriceInfo();

    @Query("SELECT new com.example.dto.ProductPriceInfo(p.id, p.name, p.price)" +
           " FROM Product p WHERE p.price < :maxPrice ORDER BY p.price ASC")
    List<ProductPriceInfo> findAffordable(@Param("maxPrice") BigDecimal maxPrice);
}
```

```java title="Demo"
List<ProductPriceInfo> affordable = productRepo.findAffordable(new BigDecimal("50.00"));
affordable.forEach(p ->
    System.out.printf("%-30s $%.2f%n", p.name(), p.price())
);
// → "USB Hub                        $19.99"
// → "Screen Cleaner                 $9.99"
```

**SQL generated:**
```sql
SELECT p.id, p.name, p.price FROM products p WHERE p.price < ? ORDER BY p.price ASC
-- No description or thumbnail loaded
```

:::tip Key takeaway
DTO projections with records are not managed by the Hibernate session — they are plain Java objects. No dirty checking, no session overhead, fully immutable.
:::

---

## Example 4: Dynamic Projections

One repository method returns different shapes depending on the caller.

```java title="ProductRepository.java (dynamic)" showLineNumbers {2}
public interface ProductRepository extends JpaRepository<Product, Long> {
    <T> List<T> findByCategory(String category, Class<T> type);  // ← generic
}
```

```java title="Demo"
// Consumer A — needs only summary
List<ProductSummary> summaries =
    productRepo.findByCategory("electronics", ProductSummary.class);

// Consumer B — needs full entity (e.g., for admin panel)
List<Product> full =
    productRepo.findByCategory("electronics", Product.class);

// Summary query → SELECT id, name, price WHERE category = ?
// Full query    → SELECT * WHERE category = ?
```

---

## Exercises

1. **Easy**: Add a `getCategory()` getter to `ProductSummary` and observe that the SQL now includes `category` in the `SELECT` clause.
2. **Medium**: Create a `CustomerListView` projection interface with `getId()`, `getName()`, and a nested `AddressView` projection for `getAddress()` that includes `getCity()` and `getCountry()`. Verify that `SELECT` contains only those columns.
3. **Hard**: Write a `@DataJpaTest` integration test that: (a) saves a `Product` with a large `description`, (b) calls `findAllProjectedBy()`, (c) asserts the result has the right `name` and `price`, and (d) uses a SQL logging interceptor to assert `description` does NOT appear in the generated `SELECT` statement.

---

## Back to Topic

Return to [Spring Data Projections](../projections.md) for theory, projection type comparison table, interview questions, and further reading.
