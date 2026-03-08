---
id: integration-tests-demo
title: "Integration Tests — Practical Demo"
description: Hands-on walkthrough of @SpringBootTest with TestRestTemplate, @MockBean for external dependencies, and Testcontainers for real database integration.
sidebar_position: 4
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

# Integration Tests — Practical Demo

> Hands-on examples for [Integration Tests](../integration-tests.md). We build full-stack tests for the Order API using `@SpringBootTest` with `TestRestTemplate`.

:::info Prerequisites
Understand [Spring Boot Test Slices](../spring-boot-test-slices.md) first — integration tests are the next step up the testing pyramid.
:::

---

## Project Setup

Add this to `pom.xml` if not already using `spring-boot-starter-test`:

```xml title="pom.xml" showLineNumbers
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<!-- For PostgreSQL integration tests -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-testcontainers</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
```

---

## Example 1: Basic Full-Context Test

Start the full application and make real HTTP calls:

```java title="OrderIntegrationTest.java" showLineNumbers {3,10,17,24}
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT) // highlighted: real embedded server
class OrderIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;                           // highlighted: real HTTP client

    @Test
    void getOrder_returns404_forUnknownId() {
        ResponseEntity<String> response =
            restTemplate.getForEntity("/orders/9999", String.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode()); // highlighted
    }

    @Test
    void placeOrder_and_getOrder_roundTrip() {
        // Step 1: Create an order
        OrderRequest request = new OrderRequest("laptop", 999.0);
        ResponseEntity<Order> created =
            restTemplate.postForEntity("/orders", request, Order.class);

        assertEquals(HttpStatus.CREATED, created.getStatusCode());     // highlighted
        Long id = created.getBody().getId();
        assertNotNull(id);

        // Step 2: Retrieve the created order
        ResponseEntity<Order> fetched =
            restTemplate.getForEntity("/orders/" + id, Order.class);

        assertEquals(HttpStatus.OK, fetched.getStatusCode());
        assertEquals("laptop", fetched.getBody().getItemName());
    }
}
```

**What to observe:**
- `RANDOM_PORT` means no port conflicts when running multiple test suites in CI.
- `TestRestTemplate` does NOT throw exceptions on 4xx/5xx — it returns the `ResponseEntity` with the error status code.
- The test exercises the full stack: HTTP → Controller → Service → Repository → H2 in-memory DB.

---

## Example 2: Using `@MockBean` for External Dependencies

The payment gateway must not charge real cards during tests:

```java title="OrderPaymentIntegrationTest.java" showLineNumbers {10,15,24,30}
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class OrderPaymentIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;

    @MockBean                                              // highlighted: real context, fake gateway
    PaymentGateway paymentGateway;

    @BeforeEach
    void setUp() {
        when(paymentGateway.charge(any(), anyDouble()))   // highlighted: stub the payment
            .thenReturn(new PaymentResult("TXN-001", true));
    }

    @Test
    void placeOrder_chargesToPaymentGateway() {
        restTemplate.postForEntity(
            "/orders", new OrderRequest("phone", 499.0), Order.class);

        // Verify the payment gateway was called with the correct amount
        verify(paymentGateway).charge(any(), eq(499.0)); // highlighted
    }

    @Test
    void placeOrder_returns402_whenPaymentFails() {
        when(paymentGateway.charge(any(), anyDouble()))   // override for this test
            .thenReturn(new PaymentResult(null, false));

        ResponseEntity<String> response = restTemplate.postForEntity(
            "/orders", new OrderRequest("tablet", 350.0), String.class);

        assertEquals(HttpStatus.PAYMENT_REQUIRED, response.getStatusCode());
    }
}
```

:::warning Context caching with `@MockBean`
Every unique combination of `@MockBean` declarations creates a new Spring context. If `OrderIntegrationTest` doesn't use `@MockBean` and `OrderPaymentIntegrationTest` does, Spring starts two separate contexts. To avoid this, put `@MockBean` declarations in a shared base class.
:::

---

## Example 3: Shared Base Class Pattern

Avoid multiple context startups by sharing configuration:

```java title="AbstractIntegrationTest.java" showLineNumbers {5,13}
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
public abstract class AbstractIntegrationTest {

    @Container
    @ServiceConnection                     // highlighted: Spring Boot 3.1+ — no @DynamicPropertySource
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16");

    @MockBean
    PaymentGateway paymentGateway;         // consistent mock across all subclasses

    @MockBean
    EmailService emailService;             // consistent mock across all subclasses
}
```

```java title="OrderIntegrationTest.java" showLineNumbers {1}
class OrderIntegrationTest extends AbstractIntegrationTest {  // highlighted

    @Autowired
    TestRestTemplate restTemplate;

    @BeforeEach
    void setUpStubs() {
        when(paymentGateway.charge(any(), anyDouble()))
            .thenReturn(new PaymentResult("TXN-OK", true));
    }

    @Test
    void fullFlow_placeAndRetrieveOrder() {
        ResponseEntity<Order> response = restTemplate.postForEntity(
            "/orders", new OrderRequest("monitor", 299.0), Order.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }
}
```

**Result:** PostgreSQL starts once, Spring loads the context once, and all integration test classes that extend `AbstractIntegrationTest` share the same context.

---

## Example 4: Test Data Management

For tests that need specific data to exist before the query:

```java title="OrderQueryIntegrationTest.java" showLineNumbers {7,15}
class OrderQueryIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;

    @Autowired
    OrderRepository orderRepository;       // direct access for setup

    @BeforeEach
    void seedData() {
        orderRepository.deleteAll();       // clean state
        orderRepository.saveAll(List.of(  // highlighted: seed known data
            new Order(null, "laptop",  999.0, OrderStatus.PENDING),
            new Order(null, "phone",   499.0, OrderStatus.SHIPPED),
            new Order(null, "tablet",  349.0, OrderStatus.PENDING)
        ));
    }

    @Test
    void listOrders_returnsSeedData() {
        ResponseEntity<Order[]> response =
            restTemplate.getForEntity("/orders", Order[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(3, response.getBody().length);
    }

    @Test
    void filterByStatus_returnsPendingOnly() {
        ResponseEntity<Order[]> response =
            restTemplate.getForEntity("/orders?status=PENDING", Order[].class);

        assertEquals(2, response.getBody().length);
    }
}
```

---

## Example 5: Testing with Security

```java title="SecuredOrderIntegrationTest.java" showLineNumbers {14,20}
class SecuredOrderIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;

    @Test
    void getOrders_returns401_withoutCredentials() {
        ResponseEntity<String> response =
            restTemplate.getForEntity("/admin/orders", String.class);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode()); // highlighted
    }

    @Test
    void getOrders_returns200_withAdminCredentials() {
        ResponseEntity<String> response =
            restTemplate.withBasicAuth("admin", "admin-password") // highlighted
                .getForEntity("/admin/orders", String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
```

---

## When to Use Which Testing Approach

```
Unit Test (Mockito)
  → Fast, isolated, tests one class
  → Use for business logic, calculations, transformations

@WebMvcTest / @DataJpaTest (slices)
  → Partial context, tests one layer
  → Use for controller HTTP contract, repository queries

@SpringBootTest (integration)
  → Full context, tests the whole stack
  → Use for critical flows, security config, real DB behavior
```

---

## What You've Practiced

| Concept | Example |
|---------|---------|
| `@SpringBootTest(RANDOM_PORT)` + `TestRestTemplate` | Example 1 |
| `@MockBean` for external dependencies | Example 2 |
| Shared base class for context reuse | Example 3 |
| Test data seeding and cleanup | Example 4 |
| Security integration testing with credentials | Example 5 |

**Challenge:** Add a `GET /orders/pending/count` endpoint that returns the count of pending orders. Write an integration test that seeds 3 pending and 2 shipped orders, then asserts the endpoint returns `3`.
