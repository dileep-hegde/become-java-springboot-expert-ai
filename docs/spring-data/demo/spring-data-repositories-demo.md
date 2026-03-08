---
id: spring-data-repositories-demo
title: "Spring Data Repositories — Practical Demo"
description: Hands-on examples for Spring Data JPA query methods, @Query JPQL/native SQL, @Modifying, pagination, and the Specification API.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - spring-data
  - jpa
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Spring Data Repositories — Practical Demo

> Hands-on examples for [Spring Data Repositories](../spring-data-repositories.md). All examples use the `Product`/`Order`/`Customer` domain.

:::info Prerequisites
Ensure you understand [JPA Basics](../jpa-basics.md) (entities and relationships) before working with repositories. See [Spring Data Repositories](../spring-data-repositories.md) for the full theory.
:::

---

## Example 1: Derived Query Methods

Spring Data generates SQL from the method name alone — no implementation needed.

```java title="ProductRepository.java" showLineNumbers {4,7,10,13}
public interface ProductRepository extends JpaRepository<Product, Long> {

    // SELECT * FROM products WHERE name = ?
    List<Product> findByName(String name);

    // SELECT * FROM products WHERE price < ? ORDER BY name ASC
    List<Product> findByPriceLessThanOrderByNameAsc(BigDecimal maxPrice);

    // SELECT COUNT(*) FROM products WHERE category = ?
    long countByCategory(String category);

    // SELECT 1 FROM products WHERE id = ? AND price > ?
    boolean existsByIdAndPriceGreaterThan(Long id, BigDecimal minPrice);

    // DELETE FROM products WHERE category = ? (wrapped in a @Modifying TX)
    @Transactional
    @Modifying
    void deleteByCategory(String category);
}
```

```java title="Demo"
// No implementation, no SQL writing, no boilerplate
List<Product> electronics = productRepo.findByName("Laptop");
long count = productRepo.countByCategory("electronics");
boolean expensive = productRepo.existsByIdAndPriceGreaterThan(1L, new BigDecimal("999.99"));
```

:::tip Key takeaway
Spring Data parses the method name token by token (subject `findBy`, predicate `Name`, conjunction `And`, etc.) and generates a JPQL query. You get type-safe queries without writing SQL.
:::

---

## Example 2: Custom JPQL and Native Queries

When derived names get too verbose, use `@Query` for explicit control.

```java title="OrderRepository.java" showLineNumbers {3,10,17}
public interface OrderRepository extends JpaRepository<Order, Long> {

    // JPQL query — joins customer inline
    @Query("SELECT o FROM Order o JOIN FETCH o.customer WHERE o.status = :status")
    List<Order> findByStatusWithCustomer(@Param("status") OrderStatus status);

    // Native SQL — use when JPQL can't express the query (window functions, JSONB, etc.)
    @Query(
        value = "SELECT * FROM orders WHERE EXTRACT(YEAR FROM created_at) = :year",
        nativeQuery = true
    )
    List<Order> findByYear(@Param("year") int year);

    // @Modifying for UPDATE/DELETE — must be inside a @Transactional context
    @Transactional
    @Modifying
    @Query("UPDATE Order o SET o.status = :newStatus WHERE o.status = :oldStatus")
    int bulkUpdateStatus(@Param("oldStatus") OrderStatus oldStatus,
                         @Param("newStatus") OrderStatus newStatus);
}
```

```java title="Demo"
List<Order> pending = orderRepo.findByStatusWithCustomer(OrderStatus.PENDING);

// Bulk update returns the count of affected rows
int updated = orderRepo.bulkUpdateStatus(OrderStatus.PENDING, OrderStatus.PROCESSING);
System.out.println("Updated: " + updated + " orders");
```

**Expected output:**
```
Updated: 42 orders
```

---

## Example 3: Pagination and Sorting

Any repository method can accept `Pageable` and return `Page<T>` for paginated results.

```java title="ProductRepository.java (pagination)" showLineNumbers {3,8}
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Paginated derived query
    Page<Product> findByCategory(String category, Pageable pageable);
}
```

```java title="ProductController.java" showLineNumbers {6,7,12}
@GetMapping("/products")
public Page<Product> listProducts(
    @RequestParam String category,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {

    Pageable pageable = PageRequest.of(page, size, Sort.by("price").ascending());
    return productRepo.findByCategory(category, pageable);
    // ↑ generates: SELECT * FROM products WHERE category = ? ORDER BY price ASC LIMIT 20 OFFSET 0
}
```

```java title="Response shape"
{
  "content": [ /* 20 products */ ],
  "pageable": { "pageNumber": 0, "pageSize": 20 },
  "totalPages": 5,
  "totalElements": 98,
  "last": false,
  "first": true
}
```

:::tip Key takeaway
`Page<T>` includes metadata (total pages, total elements, isLast) without a separate count query call from application code — Spring Data issues the `COUNT(*)` automatically.
:::

---

## Example 4: Specification API for Dynamic Filters

When filter criteria vary at runtime (search forms, filter panels), use `JpaSpecificationExecutor`.

```java title="ProductRepository.java (Specification)"
public interface ProductRepository
    extends JpaRepository<Product, Long>,
            JpaSpecificationExecutor<Product> {}  // ← add this interface
```

```java title="ProductSpecifications.java" showLineNumbers {4,10,16}
public class ProductSpecifications {

    public static Specification<Product> hasCategory(String category) {
        return (root, query, cb) -> category == null ? null
            : cb.equal(root.get("category"), category);   // ← null = no restriction (composable)
    }

    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            if (min == null) return cb.lessThanOrEqualTo(root.get("price"), max);
            if (max == null) return cb.greaterThanOrEqualTo(root.get("price"), min);
            return cb.between(root.get("price"), min, max);
        };
    }

    public static Specification<Product> nameContains(String keyword) {
        return (root, query, cb) -> keyword == null ? null
            : cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%");
    }
}
```

```java title="ProductService.java"
public Page<Product> search(String category, BigDecimal minPrice,
                            BigDecimal maxPrice, String keyword, Pageable pageable) {
    Specification<Product> spec = Specification
        .where(ProductSpecifications.hasCategory(category))
        .and(ProductSpecifications.priceBetween(minPrice, maxPrice))
        .and(ProductSpecifications.nameContains(keyword));   // ← build dynamically

    return productRepo.findAll(spec, pageable);
}
```

---

## Exercises

1. **Easy**: Add a `findByStatus` method to `OrderRepository` that returns `List<Order>` sorted by `createdAt` descending.
2. **Medium**: Write a `@Query` with `nativeQuery = true` that counts how many orders each customer has placed (`SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id`). Map it to an interface projection with `getCustomerId()` and `getOrderCount()`.
3. **Hard**: Extend `ProductSpecifications` to support filtering by whether a product is in stock (`stockQuantity > 0`) and add that filter to the `search()` service method. Write an integration test using `@DataJpaTest` asserting the specification returns only in-stock products.

---

## Back to Topic

Return to [Spring Data Repositories](../spring-data-repositories.md) for theory, trade-offs, interview questions, and further reading.
