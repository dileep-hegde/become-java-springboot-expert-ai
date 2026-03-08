---
id: spring-boot-testing-demo
title: "Spring Boot Testing — Practical Demo"
description: Hands-on examples for @SpringBootTest, @WebMvcTest, @DataJpaTest, @MockBean, and Testcontainers in a realistic order service project.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - spring-boot
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Spring Boot Testing — Practical Demo

> Hands-on examples for [Spring Boot Testing](../spring-boot-testing.md). A single `OrderService` domain runs through unit tests, slice tests, and full integration tests so you can compare the same scenario at each level.

:::info Prerequisites
Read the [Spring Boot Testing](../spring-boot-testing.md) note first — particularly the testing pyramid and the difference between `@WebMvcTest`, `@DataJpaTest`, and `@SpringBootTest`.
:::

---

## The Domain: Order Service

All examples are based on this domain:

```java title="Order.java"
@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productId;
    private int quantity;
    // constructors, getters, setters
}
```

```java title="OrderRepository.java"
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByProductId(String productId);
}
```

```java title="OrderService.java"
@Service
public class OrderService {
    private final OrderRepository repo;
    public OrderService(OrderRepository repo) { this.repo = repo; }

    public Order create(String productId, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
        return repo.save(new Order(null, productId, quantity));
    }

    public Order findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
    }
}
```

```java title="OrderController.java"
@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService service;
    public OrderController(OrderService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order create(@RequestBody @Valid OrderRequest request) {
        return service.create(request.productId(), request.quantity());
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable Long id) {
        return service.findById(id);
    }
}

record OrderRequest(@NotBlank String productId, @Min(1) int quantity) {}
```

---

## Example 1: Plain Unit Test (No Spring Context)

Test `OrderService` in isolation — no Spring, no DB, instant:

```java title="OrderServiceTest.java" showLineNumbers {1,4,8,14}
class OrderServiceTest {                                   // ← no @SpringBootTest; pure JUnit 5

    @Mock
    private OrderRepository repo;                         // ← Mockito mock; no DB connection

    @InjectMocks
    private OrderService service;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void create_withValidInput_savesAndReturns() {
        Order saved = new Order(1L, "prod-1", 3);
        when(repo.save(any())).thenReturn(saved);          // ← stub the mock

        Order result = service.create("prod-1", 3);

        assertThat(result.getId()).isEqualTo(1L);
        verify(repo, times(1)).save(any());                // ← verify interaction
    }

    @Test
    void create_withZeroQuantity_throwsException() {
        assertThatThrownBy(() -> service.create("prod-1", 0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("positive");
    }
}
```

**Expected Output:**

```
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
Time elapsed: 0.04 s
```

:::tip Key takeaway
This test runs in 40 ms because nothing Spring-related is loaded. Write as many business-logic unit tests as possible at this level.
:::

---

## Example 2: `@WebMvcTest` — Controller Layer Only

Test HTTP request/response behavior, request validation, and exception handling:

```java title="OrderControllerTest.java" showLineNumbers {1,2,7,10}
@WebMvcTest(OrderController.class)                        // ← loads ONLY MVC layer
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;                              // ← auto-configured; no HTTP port

    @MockBean
    private OrderService service;                         // ← service not loaded; must be mocked

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createOrder_withValidBody_returns201() throws Exception {
        Order created = new Order(1L, "prod-1", 3);
        when(service.create("prod-1", 3)).thenReturn(created);

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new OrderRequest("prod-1", 3))))
            .andExpect(status().isCreated())              // ← 201
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.productId").value("prod-1"));
    }

    @Test
    void createOrder_withBlankProductId_returns400() throws Exception {
        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":\"\",\"quantity\":1}"))
            .andExpect(status().isBadRequest());           // ← @NotBlank fails validation → 400
    }

    @Test
    void getOrder_notFound_returns404() throws Exception {
        when(service.findById(99L))
            .thenThrow(new EntityNotFoundException("Order not found: 99"));

        mockMvc.perform(get("/orders/99"))
            .andExpect(status().isNotFound());             // ← assumes a @ControllerAdvice maps to 404
    }
}
```

**Expected Output:**

```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
Time elapsed: 0.8 s      ← much faster than @SpringBootTest
```

---

## Example 3: `@DataJpaTest` — Repository Layer Only

Test custom query methods against an in-memory H2 database:

```java title="OrderRepositoryTest.java" showLineNumbers {1,4}
@DataJpaTest                                              // ← loads JPA + H2; no web, no service
class OrderRepositoryTest {

    @Autowired
    private OrderRepository repo;                         // ← real repository, real H2 DB

    @Test
    void findByProductId_returnsOnlyMatchingOrders() {
        repo.save(new Order(null, "prod-A", 2));          // ← persisted to H2
        repo.save(new Order(null, "prod-A", 5));
        repo.save(new Order(null, "prod-B", 1));

        List<Order> results = repo.findByProductId("prod-A");

        assertThat(results).hasSize(2);
        assertThat(results).allMatch(o -> "prod-A".equals(o.getProductId()));
    }

    @Test
    void save_generatesId() {
        Order saved = repo.save(new Order(null, "prod-X", 10));
        assertThat(saved.getId()).isNotNull();             // ← auto-generated by H2 sequence
    }
}
```

Each test runs inside a **transaction that is rolled back** automatically — no test data leaks between test methods.

:::warning Common Mistake
If your JPA query uses PostgreSQL-specific syntax (e.g., `jsonb_build_object`, window functions), it will fail against H2. Use `@AutoConfigureTestDatabase(replace = NONE)` with Testcontainers for database-dialect-specific queries.
:::

---

## Example 4: Full Integration Test with `@SpringBootTest`

Test the entire request pipeline — controller → service → repository — against an in-memory database:

```java title="OrderIntegrationTest.java" showLineNumbers {1,2,5,10}
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)  // ← real HTTP server
class OrderIntegrationTest {

    @Autowired
    private TestRestTemplate http;                        // ← full HTTP client; follows redirects

    @Autowired
    private OrderRepository repo;

    @BeforeEach
    void clean() { repo.deleteAll(); }                   // ← reset state between tests

    @Test
    void fullOrderFlow_createThenGet() {
        // Create
        OrderRequest request = new OrderRequest("prod-1", 3);
        ResponseEntity<Order> create = http.exchange(
            "/orders", HttpMethod.POST,
            new HttpEntity<>(request), Order.class);

        assertThat(create.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Long id = create.getBody().getId();
        assertThat(id).isNotNull();

        // Retrieve
        ResponseEntity<Order> get = http.getForEntity("/orders/" + id, Order.class);
        assertThat(get.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(get.getBody().getProductId()).isEqualTo("prod-1");
    }
}
```

**Expected Output:**

```
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
Time elapsed: 4.2 s      ← full context startup; worth it for true end-to-end coverage
```

---

## Example 5: `@DataJpaTest` with Testcontainers (Real PostgreSQL)

For queries using PostgreSQL-specific syntax, replace H2 with a real database:

```xml title="pom.xml — add to test dependencies"
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

```java title="OrderRepositoryPostgresTest.java" showLineNumbers {1,2,3,8,13}
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // ← keep real datasource
@Testcontainers
class OrderRepositoryPostgresTest {

    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine");  // ← Docker starts a real Postgres

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry reg) {
        reg.add("spring.datasource.url", postgres::getJdbcUrl);     // ← use container's URL
        reg.add("spring.datasource.username", postgres::getUsername);
        reg.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private OrderRepository repo;

    @Test
    void findByProductId_worksOnRealPostgres() {
        repo.save(new Order(null, "prod-pg", 7));
        assertThat(repo.findByProductId("prod-pg")).hasSize(1);
    }
}
```

The container image is pulled once per JVM; if multiple test classes use the same static container, Docker reuses it.

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `@WebMvcTest` for `OrderController.getById(Long id)`. Stub `service.findById()` to return a fixed `Order`. Assert the response JSON contains the correct `productId`.
2. **Medium**: Add a `findOrdersWithQuantityGreaterThan(int min)` method to `OrderRepository` using a JPQL `@Query`. Write a `@DataJpaTest` that inserts 3 orders with different quantities and verifies only the correct ones are returned.
3. **Hard**: Write a `@SpringBootTest` integration test that verifies context caching. Declare two test classes that use the exact same `@MockBean` set. Use `System.identityHashCode` on the injected `ApplicationContext` to confirm both test classes use the same cached context instance.

---

## Back to Topic

Return to the [Spring Boot Testing](../spring-boot-testing.md) note for theory, interview questions, and further reading.
