---
id: spring-boot-test-slices-demo
title: "Spring Boot Test Slices — Practical Demo"
description: Hands-on walkthrough of @WebMvcTest, @DataJpaTest, and @JsonTest with realistic Order API examples.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - testing
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Spring Boot Test Slices — Practical Demo

> Hands-on examples for [Spring Boot Test Slices](../spring-boot-test-slices.md). We use an Order API (controller, JPA repository, JSON mapping) to demonstrate each slice.

:::info Prerequisites
Understand [JUnit 5](../junit5.md) and [Mockito](../mockito.md) before this demo — slices rely on both.
:::

---

## The Application Setup

We have a simple Order API with these components:

```java title="Order.java" showLineNumbers
@Entity
@Table(name = "orders")
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Item name is required")
    private String itemName;

    @Positive(message = "Price must be positive")
    private double price;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    // constructors, getters, setters ...
}
```

```java title="OrderController.java" showLineNumbers
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findOrder(id));
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody OrderRequest request) {
        Order saved = orderService.placeOrder(request);
        URI location = URI.create("/orders/" + saved.getId());
        return ResponseEntity.created(location).body(saved);
    }
}
```

---

## Example 1: `@WebMvcTest` — Controller Layer

Test HTTP mapping, request/response JSON, and validation — without a running server.

```java title="OrderControllerTest.java" showLineNumbers {4,11,20,34}
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(OrderController.class)          // highlighted: only OrderController context
class OrderControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean                               // highlighted: Spring-aware mock for the service
    OrderService orderService;

    @Test
    void getOrder_returns200_withOrderJson() throws Exception {
        Order order = new Order(1L, "laptop", 999.0, OrderStatus.PENDING);
        when(orderService.findOrder(1L)).thenReturn(order);

        mockMvc.perform(get("/orders/1")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())                         // highlighted: HTTP 200
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.itemName").value("laptop"))
            .andExpect(jsonPath("$.price").value(999.0));
    }

    @Test
    void placeOrder_returns400_onBlankItemName() throws Exception {
        // Validation: itemName is @NotBlank, should return 400
        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"itemName": "", "price": 10.0}
                    """))
            .andExpect(status().isBadRequest());                // highlighted: 400 with bad data
    }

    @Test
    void getOrder_returns404_whenNotFound() throws Exception {
        when(orderService.findOrder(99L))
            .thenThrow(new OrderNotFoundException("Order 99 not found"));

        mockMvc.perform(get("/orders/99"))
            .andExpect(status().isNotFound());                  // handled by @ControllerAdvice
    }
}
```

**What to observe:**
- The test starts in under 2 seconds — no service or repository beans exist.
- `@MockBean OrderService` replaces the real bean in the slim web context.
- Validation (`@NotBlank`) is checked by `@Valid` on the controller — this is part of the web layer and IS tested by `@WebMvcTest`.

---

## Example 2: `@DataJpaTest` — Repository Layer

Test custom queries against an in-memory H2 database.

```java title="OrderRepositoryTest.java" showLineNumbers {3,12,18,26}
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest                                // highlighted: JPA slice — H2 auto-configured
class OrderRepositoryTest {

    @Autowired
    TestEntityManager entityManager;        // JPA test helper for setting up data

    @Autowired
    OrderRepository orderRepository;        // the repository under test

    @Test
    void findByStatus_returnsPendingOrders() {
        // Arrange — use EntityManager to bypass the repository for setup
        entityManager.persistAndFlush(
            new Order(null, "item-A", 10.0, OrderStatus.PENDING));  // highlighted
        entityManager.persistAndFlush(
            new Order(null, "item-B", 20.0, OrderStatus.SHIPPED));

        // Act
        List<Order> result = orderRepository.findByStatus(OrderStatus.PENDING);

        // Assert
        assertEquals(1, result.size());
        assertEquals("item-A", result.get(0).getItemName());
    }

    @Test
    void save_assignsGeneratedId() {
        Order saved = orderRepository.save(
            new Order(null, "widget", 5.0, OrderStatus.PENDING));

        assertNotNull(saved.getId());       // ID was auto-generated by H2
        assertTrue(saved.getId() > 0);
    }

    @Test
    void findByPriceGreaterThan_returnsMatchingOrders() {
        entityManager.persistAndFlush(new Order(null, "cheap", 5.0, OrderStatus.PENDING));
        entityManager.persistAndFlush(new Order(null, "expensive", 500.0, OrderStatus.PENDING));

        List<Order> expensive = orderRepository.findByPriceGreaterThan(100.0);

        assertEquals(1, expensive.size());
        assertEquals("expensive", expensive.get(0).getItemName());
    }
}
```

**What to observe:**
- Each test runs in a transaction that is rolled back after — the next test starts with an empty database.
- `TestEntityManager.persistAndFlush` is better than calling `orderRepository.save()` for setup — keeps Arrange and Act separated.
- Custom query methods on `OrderRepository` (like `findByStatus`, `findByPriceGreaterThan`) are tested here.

---

## Example 3: `@JsonTest` — JSON Serialization Layer

Verify your `Order` JSON shape (field names, missing fields, custom serializers):

```java title="OrderJsonTest.java" showLineNumbers {3,9,17}
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

@JsonTest                                   // highlighted: loads only Jackson ObjectMapper
class OrderJsonTest {

    @Autowired
    JacksonTester<Order> json;              // highlighted: typed JSON helper

    @Test
    void serialize_includesAllFields() throws Exception {
        Order order = new Order(1L, "laptop", 999.0, OrderStatus.PENDING);

        assertThat(json.write(order))
            .hasJsonPath("$.id")
            .hasJsonPath("$.itemName")
            .hasJsonPath("$.price")
            .hasJsonPath("$.status");
    }

    @Test
    void serialize_statusIsString_notNumber() throws Exception {
        Order order = new Order(1L, "book", 15.0, OrderStatus.SHIPPED);

        assertThat(json.write(order))
            .extractingJsonPathStringValue("$.status") // highlighted
            .isEqualTo("SHIPPED");                     // SHIPPED, not 1 (ordinal)
    }

    @Test
    void deserialize_parsesJsonToOrder() throws Exception {
        String content = """
            {
              "id": 2,
              "itemName": "phone",
              "price": 299.0,
              "status": "PENDING"
            }
            """;

        Order order = json.parse(content).getObject();

        assertEquals(2L, order.getId());
        assertEquals("phone", order.getItemName());
        assertEquals(OrderStatus.PENDING, order.getStatus());
    }
}
```

**What to observe:**
- `@JsonTest` is the fastest slice — no Spring MVC, no JPA, just Jackson.
- `@Enumerated(EnumType.STRING)` is validated here — if you accidentally use `EnumType.ORDINAL`, the test catches it.
- `json.write(object)` serializes, `json.parse(string)` deserializes — both directions.

---

## Example 4: Combining `@DataJpaTest` with Testcontainers

When you need real PostgreSQL behavior (not H2):

```java title="OrderRepositoryPostgresTest.java" showLineNumbers {5,8,14}
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // highlighted
@Testcontainers
class OrderRepositoryPostgresTest {

    @Container
    @ServiceConnection                      // highlighted: no @DynamicPropertySource needed
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16");

    @Autowired
    TestEntityManager entityManager;

    @Autowired
    OrderRepository orderRepository;

    @Test
    void nativeQuery_worksWithPostgres() {
        // Test PostgreSQL-specific queries, JSON columns, etc.
        entityManager.persistAndFlush(
            new Order(null, "item", 25.0, OrderStatus.PENDING));

        long count = orderRepository.countByStatus(OrderStatus.PENDING);
        assertEquals(1L, count);
    }
}
```

---

## Startup Time Comparison

Run all three test classes and observe the startup time in your IDE:

| Test class | Context loaded | Typical startup |
|-----------|---------------|----------------|
| `OrderJsonTest` | Jackson only | ~0.5s |
| `OrderControllerTest` | Spring MVC (web slice) | ~1.5s |
| `OrderRepositoryTest` | JPA + H2 | ~2.5s |
| `@SpringBootTest` | Full context | ~8–15s |

This is the key benefit of slices — the same coverage per layer, at a fraction of the cost.

---

## What You've Practiced

| Slice | Layer tested | Example |
|-------|-------------|---------|
| `@WebMvcTest` | HTTP mapping, validation, security | Example 1 |
| `@DataJpaTest` | JPA repository queries | Example 2 |
| `@JsonTest` | JSON serialization/deserialization | Example 3 |
| `@DataJpaTest` + Testcontainers | Real DB queries | Example 4 |

**Challenge:** Add a `@GetMapping("/orders")` endpoint that returns all orders. Write a `@WebMvcTest` that stubs `orderService.findAll()` to return two orders and asserts the response array has size 2 using `jsonPath("$", hasSize(2))`.
