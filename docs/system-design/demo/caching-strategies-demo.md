---
id: caching-strategies-demo
title: "Caching Strategies — Practical Demo"
description: Scenario-based walkthrough of implementing cache-aside with Redis in Spring Boot — including TTL configuration, cache eviction, and stampede prevention.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Caching Strategies — Practical Demo

> Hands-on examples for [Caching Strategies](../caching-strategies.md). We'll progressively add caching to a Product service — from zero cache to a multi-TTL Redis setup with stampede prevention.

:::info Prerequisites
Review the [Caching Strategies](../caching-strategies.md) note first — especially what a cache miss/hit means, what `@Cacheable` vs `@CachePut` vs `@CacheEvict` do, and why null caching is dangerous.
:::

---

## Scenario: Product Catalog Service

A product catalog API increasingly slow as traffic grows. Each `GET /products/{id}` hits the database, even though products are updated at most once a day. We'll add Redis caching layer by layer.

---

## Example 1: Baseline — No Caching (The Problem)

```java title="ProductService.java (no cache)" showLineNumbers {9}
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // ❌ Every request hits the database — expensive at scale
    public ProductResponse getProduct(Long id) {
        return productRepository.findById(id)                   // {9} ← DB query on every call
            .map(ProductResponse::from)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }
}
```

**Baseline numbers (simulated):**
- DB query: ~15ms per call
- Under 1,000 requests/second: 15,000 DB queries/second — database becomes the bottleneck

---

## Example 2: Adding `@Cacheable` — Cache-Aside Pattern

```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

```java title="Application.java" showLineNumbers {2}
@SpringBootApplication
@EnableCaching  // {2} ← activates Spring's cache AOP proxies
public class Application { ... }
```

```yaml title="application.yml" showLineNumbers
spring:
  data:
    redis:
      host: localhost
      port: 6379
  cache:
    type: redis
    redis:
      time-to-live: 600000   # ← 10-minute default TTL (milliseconds)
      cache-null-values: false # ← don't cache "product not found" results
```

```java title="ProductService.java (with cache)" showLineNumbers {5,12,19}
@Service
@RequiredArgsConstructor
public class ProductService {

    @Cacheable(value = "products", key = "#id") // {5} ← cache miss triggers DB query
    public ProductResponse getProduct(Long id) {
        log.debug("Cache miss for product {}, querying DB", id); // ← only logged on miss
        return productRepository.findById(id)
            .map(ProductResponse::from)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @CachePut(value = "products", key = "#result.id()") // {12} ← always update cache on save
    public ProductResponse updateProduct(Long id, UpdateProductRequest req) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
        product.update(req);
        return ProductResponse.from(productRepository.save(product));
    }

    @CacheEvict(value = "products", key = "#id")  // {19} ← remove entry when deleted
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
```

**Verify caching works in a test:**

```java title="ProductServiceCacheTest.java" showLineNumbers {10,14}
@SpringBootTest
@Import(TestRedisConfig.class)  // ← embedded Redis for tests
class ProductServiceCacheTest {

    @Autowired ProductService productService;
    @MockBean  ProductRepository productRepository;

    @Test
    void getProduct_shouldReturnCachedResultOnSecondCall() {
        when(productRepository.findById(42L)).thenReturn(Optional.of(testProduct())); // {10}

        productService.getProduct(42L); // ← first call: cache miss, hits mock
        productService.getProduct(42L); // ← second call: cache hit

        verify(productRepository, times(1)).findById(42L); // {14} ← DB called exactly ONCE
    }
}
```

**Expected Output:**
```
Cache miss for product 42, querying DB
(second call produces no log line — served from cache)
```

:::tip Key takeaway
`verify(times(1))` proves the database was only called once despite two `getProduct` calls. This is the core value of `@Cacheable`.
:::

---

## Example 3: Custom TTL per Cache

Different data has different staleness tolerance. Product details can be cached 10 minutes; pricing data should be fresher.

```java title="CacheConfig.java" showLineNumbers {8,12}
@Configuration
public class CacheConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        return builder -> builder
            .withCacheConfiguration("products",
                RedisCacheConfiguration.defaultCacheConfig()   // {8}
                    .entryTtl(Duration.ofMinutes(10)))          // ← 10 min for product details

            .withCacheConfiguration("product-prices",
                RedisCacheConfiguration.defaultCacheConfig()   // {12}
                    .entryTtl(Duration.ofSeconds(30)))          // ← 30 sec for pricing (changes frequently)

            .withCacheConfiguration("categories",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofHours(1)));            // ← 1 hour for categories (changes rarely)
    }
}
```

```java title="ProductService.java (with scoped TTLs)" showLineNumbers
@Cacheable(value = "products", key = "#id")
public ProductResponse getProduct(Long id) { ... }

@Cacheable(value = "product-prices", key = "#id")  // ← uses 30-second TTL from CacheConfig
public BigDecimal getPrice(Long id) { ... }

@Cacheable(value = "categories")
public List<CategoryResponse> listCategories() { ... }
```

---

## Example 4: Preventing Cache Stampede with TTL Jitter

When many product cache entries expire at the same time (e.g., after a service restart), all requests hit the database simultaneously.

```java title="CacheConfig.java (with jitter)" showLineNumbers {8,12}
@Configuration
public class CacheConfig {

    private final Random random = new Random();

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        // Add random jitter of 0-60 seconds to spread expiry times              // {8}
        long baseMinutes   = 10;
        long jitterSeconds = random.nextInt(60);  // ← random 0-59 seconds       // {12}
        Duration ttlWithJitter = Duration.ofMinutes(baseMinutes)
                                         .plus(Duration.ofSeconds(jitterSeconds));

        return builder -> builder
            .withCacheConfiguration("products",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(ttlWithJitter));  // ← each entry gets a slightly different TTL
    }
}
```

**Why this works:** Instead of all product cache entries expiring at `T+10:00`, they now expire at `T+10:00` through `T+10:59` — 60 seconds of spread, making simultaneous DB floods far less likely.

---

## Example 5: Cache Self-Invocation Pitfall and Fix

```java title="ProductService.java (broken — self-invocation)" showLineNumbers {10}
@Service
public class ProductService {

    // ❌ BROKEN: getCachedProduct calls getProduct via 'this' — bypasses the proxy
    public ProductResponse getCachedProduct(Long id) {
        // Optional transform logic...
        return this.getProduct(id);   // {10} ← 'this' bypasses the AOP proxy; cache is NOT checked
    }

    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProduct(Long id) {
        return productRepository.findById(id).map(ProductResponse::from).orElseThrow();
    }
}
```

```java title="ProductService.java (fixed — self-injection)" showLineNumbers {5,9}
@Service
public class ProductService {

    @Autowired
    private ProductService self;  // {5} ← inject proxy of self; Spring injects the AOP-wrapped version

    public ProductResponse getCachedProduct(Long id) {
        return self.getProduct(id); // {9} ← now goes through the proxy; cache IS checked
    }

    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProduct(Long id) { ... }
}
```

:::warning Common Mistake
`this.getProduct(id)` within the same class bypasses Spring's AOP proxy entirely — `@Cacheable` has no effect. Always go through the proxy (self-injection or restructuring) for cached calls invoked internally.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add `@CacheEvict(value = "categories", allEntries = true)` to a `createCategory` method. Write a test that verifies the categories cache is cleared after creation.
2. **Medium**: Implement a `bulkGetProducts(List<Long> ids)` method. Since `@Cacheable` doesn't work with collections natively, implement manual cache-aside: check Redis for each ID, collect misses, batch-query the DB for misses, populate Redis for each miss, and merge results.
3. **Hard**: Implement a distributed mutex lock for cache stampede prevention: use `RedisTemplate.opsForValue().setIfAbsent("lock:product:" + id, "1", Duration.ofSeconds(5))` to ensure only one thread recomputes the cache entry at a time. Other threads return a slightly stale cached value if the lock is held.

---

## Back to Topic

Return to the [Caching Strategies](../caching-strategies.md) note for theory, interview questions, and further reading.
