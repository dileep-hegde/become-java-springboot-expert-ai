---
id: spring-data-caching-demo
title: "Spring Data Caching — Practical Demo"
description: Hands-on examples for @Cacheable, @CacheEvict, @CachePut, Caffeine, and Redis cache configuration in a Spring Boot application.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - spring-data
  - spring-boot
  - intermediate
  - demo
  - caching
last_updated: 2026-03-08
---

# Spring Data Caching — Practical Demo

> Hands-on examples for [Spring Data Caching](../spring-data-caching.md). All examples use the `Product` domain to illustrate read caching, cache eviction on writes, and Redis configuration.

:::info Prerequisites
Ensure you understand [Spring Data Repositories](../spring-data-repositories.md) and basic Spring Boot auto-configuration. See [Spring Data Caching](../spring-data-caching.md) for the full theory.
:::

---

## Example 1: Basic `@Cacheable` with Caffeine

The simplest setup — in-memory cache with a TTL and size limit.

```xml title="pom.xml"
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

```yaml title="application.yml"
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=200,expireAfterWrite=5m   # ← max 200 entries, expire after 5 minutes
```

```java title="Application.java"
@SpringBootApplication
@EnableCaching    // ← activates the cache AOP proxy
public class Application { ... }
```

```java title="ProductService.java" showLineNumbers {3,4}
@Service
public class ProductService {

    @Cacheable(cacheNames = "products", key = "#id")   // ← cache by product ID
    public ProductDto getProduct(Long id) {
        log.info("Loading product {} from DB", id);    // ← printed ONLY on cache miss
        return productRepo.findById(id)
                          .map(ProductDto::from)
                          .orElseThrow();
    }
}
```

```java title="Demo"
productService.getProduct(1L);   // → DB hit: "Loading product 1 from DB"
productService.getProduct(1L);   // → Cache hit: no log line, no DB query
productService.getProduct(2L);   // → DB hit: "Loading product 2 from DB"
productService.getProduct(1L);   // → Cache hit: still no DB query
```

:::tip Key takeaway
The log line "Loading product from DB" only appears once per unique ID (until TTL expires). Subsequent calls return the cached `ProductDto` without touching the database.
:::

---

## Example 2: `@CacheEvict` on Updates and Deletes

When a product changes, remove the stale cache entry so the next read fetches fresh data.

```java title="ProductService.java (with eviction)" showLineNumbers {3,10}
@Service
@Transactional(readOnly = true)   // ← class default: all methods read-only
public class ProductService {

    @Cacheable(cacheNames = "products", key = "#id")
    public ProductDto getProduct(Long id) { /* ... */ }

    @Transactional                                            // ← writes need full TX
    @CacheEvict(cacheNames = "products", key = "#id")        // ← remove stale entry on update
    public ProductDto updateProduct(Long id, ProductRequest req) {
        Product product = productRepo.findById(id).orElseThrow();
        product.setName(req.name());
        product.setPrice(req.price());
        return ProductDto.from(productRepo.save(product));
    }

    @Transactional
    @CacheEvict(cacheNames = "products", key = "#id")        // ← remove on delete too
    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }
}
```

```java title="Demo"
productService.getProduct(1L);                   // → DB hit, cached
productService.getProduct(1L);                   // → Cache hit

productService.updateProduct(1L, new ProductRequest("Updated Name", ...));
//                                                → evicts key "1" from cache

productService.getProduct(1L);                   // → DB hit again (cache was evicted)
```

---

## Example 3: `@CachePut` on Create

Use `@CachePut` to populate the cache when a new product is created so the first subsequent read is also a cache hit.

```java title="ProductService.java (create with cache put)" showLineNumbers {4}
@Transactional
@CachePut(cacheNames = "products", key = "#result.id")   // ← #result = method return value
public ProductDto createProduct(ProductRequest req) {
    Product saved = productRepo.save(new Product(req.name(), req.price()));
    return ProductDto.from(saved);
    // ← method always runs AND result is stored in cache under the new ID
}
```

```java title="Demo"
ProductDto created = productService.createProduct(new ProductRequest("New Product", 29.99));
// → Saved to DB AND put in cache under key = created.getId()

ProductDto fetched = productService.getProduct(created.getId());
// → Cache hit: "Loading product from DB" NOT logged — already in cache
```

---

## Example 4: Redis Configuration with Per-Cache TTL

For a multi-instance deployment, switch from Caffeine to Redis and customize TTL per cache name.

```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

```yaml title="application.yml"
spring:
  data:
    redis:
      host: localhost
      port: 6379
  cache:
    type: redis
    redis:
      cache-null-values: false   # ← don't cache null (product not found)
```

```java title="CacheConfig.java" showLineNumbers {8,11,14}
@Configuration
public class CacheConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheCustomizer() {
        return builder -> builder
            .withCacheConfiguration("products",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(30))         // ← 30 min for individual products
                    .disableCachingNullValues())
            .withCacheConfiguration("productSearch",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(2)));        // ← 2 min for search results (changes often)
    }
}
```

```java title="ProductService.java (search with separate cache)"
@Cacheable(cacheNames = "productSearch", key = "#category + ':' + #page")
public Page<ProductDto> searchByCategory(String category, int page) { /* ... */ }

@Caching(evict = {
    @CacheEvict(cacheNames = "products", key = "#id"),
    @CacheEvict(cacheNames = "productSearch", allEntries = true)  // ← clear all search pages on update
})
@Transactional
public ProductDto updateProduct(Long id, ProductRequest req) { /* ... */ }
```

:::warning Common Mistake
Forgetting to evict the `productSearch` cache when individual products change — search results will show stale data even after `products` cache entries are evicted.
:::

---

## Exercises

1. **Easy**: Add `unless = "#result == null"` to `getProduct()` and verify with a test that calling `getProduct()` with a nonexistent ID doesn't cache the `null` result (i.e., the next call still hits the DB).
2. **Medium**: Override `getProduct(Long id)` to also accept a Pageable and cache search results with a composite `key = "#category + ':' + #pageable.pageNumber"`. Clear the search cache on any product update using `@CacheEvict(allEntries = true)`.
3. **Hard**: Write a Spring Boot integration test (`@SpringBootTest`) with an embedded Redis (`testcontainers` or `embedded-redis`) that: (a) verifies `getProduct()` hits the DB on first call, (b) verifies it returns cached on second call (use a `@SpyBean` on the repository), (c) verifies that `updateProduct()` causes the next `getProduct()` to hit the DB again.

---

## Back to Topic

Return to [Spring Data Caching](../spring-data-caching.md) for theory, cache annotation reference, backend comparison, interview questions, and further reading.
