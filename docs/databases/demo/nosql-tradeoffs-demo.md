---
id: nosql-tradeoffs-demo
title: "NoSQL Trade-offs — Practical Demo"
description: Hands-on Spring Boot examples for Redis caching, MongoDB document CRUD, and Spring Cache abstraction.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - spring-data
  - databases
  - nosql
  - redis
  - mongodb
  - intermediate
  - demo
last_updated: 2026-03-08
---

# NoSQL Trade-offs — Practical Demo

> Hands-on Spring Boot examples for [NoSQL Trade-offs](../nosql-tradeoffs.md). Covers Redis caching patterns and MongoDB CRUD with Spring Data.

:::info Prerequisites
Understand [SQL Fundamentals](../sql-fundamentals.md) and [Transactions & ACID](../transactions-acid.md) first — knowing what relational databases provide is essential to understanding what you're trading away with NoSQL.
:::

---

## Part A: Redis — Caching with Spring Data Redis

### Setup

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

```yaml title="application.yml"
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}    # blank for local dev
      timeout: 2000ms                 # ← connection timeout; fail fast if Redis is down
  cache:
    type: redis
    redis:
      time-to-live: 600000            # 10 minutes default TTL for all caches
```

---

### Example 1: @Cacheable — Simple Cache

```java title="ProductService.java" showLineNumbers {4,11}
@Service
public class ProductService {

    @Cacheable(value = "products", key = "#id")   // ← cache result by product ID
    public ProductDto getProduct(Long id) {
        log.info("Cache miss — fetching product {} from DB", id);
        return productRepository.findById(id)
            .map(ProductDto::from)
            .orElseThrow(() -> new EntityNotFoundException("Product " + id));
    }

    @CacheEvict(value = "products", key = "#dto.id")   // ← remove stale entry on update
    public ProductDto updateProduct(ProductDto dto) {
        Product saved = productRepository.save(ProductDto.toEntity(dto));
        return ProductDto.from(saved);
    }

    @CacheEvict(value = "products", allEntries = true)  // ← flush entire cache on bulk refresh
    public void refreshAll() { }
}
```

**Cache behavior:**
1. First call: cache miss → DB query → result stored in Redis with a 10-minute TTL
2. Subsequent calls (within 10 min): cache hit → Redis lookup, no DB query
3. After `updateProduct`: the entry is evicted, next read is a fresh DB hit

---

### Example 2: RedisTemplate — Manual Cache with Custom TTL

For fine-grained control over TTL and data structures:

```java title="SessionCacheService.java" showLineNumbers {8-10,17}
@Service
public class SessionCacheService {

    private final RedisTemplate<String, String> redisTemplate;

    public SessionCacheService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void storeSession(String sessionId, String userId) {
        String key = "session:" + sessionId;
        redisTemplate.opsForValue().set(
            key,
            userId,
            30, TimeUnit.MINUTES          // ← per-entry TTL
        );
    }

    public Optional<String> getUserIdFromSession(String sessionId) {
        String val = redisTemplate.opsForValue().get("session:" + sessionId);
        return Optional.ofNullable(val);
    }

    public void invalidateSession(String sessionId) {
        redisTemplate.delete("session:" + sessionId);
    }
}
```

---

### Example 3: Redis Sorted Set — Real-Time Leaderboard

```java title="LeaderboardService.java" showLineNumbers {9-12}
@Service
public class LeaderboardService {

    private static final String LEADERBOARD_KEY = "leaderboard:global";
    private final RedisTemplate<String, String> redisTemplate;

    // Update a user's score after completing an action
    public void addScore(String userId, double points) {
        redisTemplate.opsForZSet().incrementScore(
            LEADERBOARD_KEY, userId, points    // ← ZINCRBY: atomic, O(log N)
        );
    }

    // Get top 10 users with their scores (highest first)
    public List<Map.Entry<String, Double>> getTop10() {
        Set<ZSetOperations.TypedTuple<String>> topUsers =
            redisTemplate.opsForZSet().reverseRangeWithScores(
                LEADERBOARD_KEY, 0, 9          // ← ZREVRANGEBYSCORE with WITHSCORES
            );

        return topUsers.stream()
            .map(t -> Map.entry(t.getValue(), t.getScore()))
            .collect(Collectors.toList());
    }
}
```

---

### Example 4: Rate Limiting with Redis + Lua Script

```java title="RateLimiterService.java" showLineNumbers {10-20}
@Service
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    // Sliding-window rate limit: max N requests per window
    public boolean isAllowed(String clientId, int maxRequests, int windowSeconds) {
        String key = "rate:" + clientId;

        // Atomic Lua script: increment counter, set TTL on first request
        String script = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])   -- set TTL on first request
            end
            return current
            """;

        Long count = redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class),
            List.of(key),
            String.valueOf(windowSeconds)
        );

        return count != null && count <= maxRequests;
    }
}
```

---

## Part B: MongoDB — Document CRUD with Spring Data

### Setup

```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

```yaml title="application.yml"
spring:
  data:
    mongodb:
      uri: mongodb://${MONGO_HOST:localhost}:27017/${MONGO_DB:myapp}
```

---

### Example 5: MongoDB Document Entity — Product Catalog

```java title="Product.java" showLineNumbers {1,9,13}
@Document(collection = "products")   // ← maps to MongoDB collection
@CompoundIndex(def = "{'category': 1, 'price': -1}", name = "idx_cat_price")
public class Product {

    @Id
    private String id;              // ← MongoDB uses String ObjectId by default

    private String name;
    private String category;
    private BigDecimal price;

    private List<String> tags;      // ← arrays are first-class in MongoDB

    private Map<String, Object> specs;  // ← flexible schema: varies per product type

    @CreatedDate
    private Instant createdAt;
}
```

```java title="ProductRepository.java" showLineNumbers {4-8}
public interface ProductRepository extends MongoRepository<Product, String> {

    // Spring Data derives query from method name
    List<Product> findByCategoryAndPriceLessThan(String category, BigDecimal maxPrice);

    List<Product> findByTagsContaining(String tag);

    @Query("{ 'specs.color': ?0 }")                  // ← custom MongoDB query expression
    List<Product> findBySpecsColor(String color);
}
```

---

### Example 6: MongoDB Aggregation Pipeline

```java title="ProductAnalyticsService.java" showLineNumbers {8-20}
@Service
public class ProductAnalyticsService {

    private final MongoTemplate mongoTemplate;

    // Average price per category, sorted highest first
    public List<CategoryPriceSummary> avgPriceByCategory() {
        Aggregation agg = Aggregation.newAggregation(
            Aggregation.group("category")                   // $group by category
                .avg("price").as("avgPrice")
                .count().as("productCount"),
            Aggregation.sort(Sort.Direction.DESC, "avgPrice"),
            Aggregation.project("avgPrice", "productCount")
                .and("_id").as("category")
        );

        AggregationResults<CategoryPriceSummary> results =
            mongoTemplate.aggregate(agg, "products", CategoryPriceSummary.class);

        return results.getMappedResults();
    }

    public record CategoryPriceSummary(String category, BigDecimal avgPrice, int productCount) {}
}
```

---

### Example 7: MongoDB — Embedded vs Referenced Documents

```java title="Order.java (embedded line items)" showLineNumbers {9}
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String userId;          // ← reference to User (by ID, not embedded)

    private List<LineItem> items;   // ← embedded sub-documents (denormalized)

    private BigDecimal totalAmount;
    private String status;
    private Instant createdAt;

    // Embedded document — no separate collection needed
    public record LineItem(String productId, String name, int quantity, BigDecimal unitPrice) {}
}
```

**Design rule:** Embed data that is always read/written together with the parent (line items with their order). Reference data that is shared or accessed independently (user referenced by ID — user data shouldn't be duplicated in every order).

---

### Example 8: Integration Test with Flapdoodle (Embedded MongoDB)

```xml title="pom.xml (test scope)"
<dependency>
    <groupId>de.flapdoodle.embed</groupId>
    <artifactId>de.flapdoodle.embed.mongo.spring3x</artifactId>
    <scope>test</scope>
</dependency>
```

```java title="ProductRepositoryTest.java" showLineNumbers {3}
@DataMongoTest                    // ← loads only MongoDB layers, not full Spring context
class ProductRepositoryTest {

    @Autowired
    private ProductRepository repository;

    @Test
    void shouldFindByCategory() {
        repository.save(new Product(null, "Laptop Pro", "electronics",
            new BigDecimal("1299.99"), List.of("laptop", "ultrabook"), Map.of(), null));
        repository.save(new Product(null, "Phone X", "electronics",
            new BigDecimal("899.99"), List.of("phone"), Map.of(), null));

        List<Product> electronics = repository.findByCategoryAndPriceLessThan(
            "electronics", new BigDecimal("1000.00"));

        assertThat(electronics).hasSize(1);
        assertThat(electronics.get(0).getName()).isEqualTo("Phone X");
    }
}
```

---

## Summary

| Technology | Use For | Spring Boot Starter |
|------------|---------|---------------------|
| Redis `@Cacheable` | Transparent method-level caching | `spring-boot-starter-cache` + `spring-boot-starter-data-redis` |
| Redis `RedisTemplate` | Custom TTLs, data structures, Lua scripts | `spring-boot-starter-data-redis` |
| MongoDB `MongoRepository` | Document CRUD with derived queries | `spring-boot-starter-data-mongodb` |
| MongoDB `MongoTemplate` | Aggregation pipelines, complex queries | part of `spring-boot-starter-data-mongodb` |

Return to the full note: [NoSQL Trade-offs](../nosql-tradeoffs.md)
