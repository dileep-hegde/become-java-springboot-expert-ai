---
id: mockmvc-webtestclient-demo
title: "MockMvc & WebTestClient — Practical Demo"
description: Hands-on walkthrough of HTTP-level controller testing with MockMvc and WebTestClient — requests, assertions, security, and validation.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - spring-web
  - testing
  - intermediate
  - demo
last_updated: 2026-03-08
---

# MockMvc & WebTestClient — Practical Demo

> Hands-on examples for [MockMvc & WebTestClient](../mockmvc-webtestclient.md). We test the full HTTP contract of an Order API controller — mappings, serialization, validation, security, and error handling.

:::info Prerequisites
Understand [Spring Boot Test Slices](../spring-boot-test-slices.md) — all examples here use `@WebMvcTest`.
:::

---

## The Controller Under Test

```java title="OrderController.java" showLineNumbers
@RestController
@RequestMapping("/orders")
@PreAuthorize("isAuthenticated()")           // requires authentication
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findOrder(id));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listOrders(
            @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.findAll(status));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody OrderRequest request) {
        OrderResponse saved = orderService.placeOrder(request);
        URI location = URI.create("/orders/" + saved.getId());
        return ResponseEntity.created(location).body(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")        // requires ADMIN role
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Example 1: GET Request — Status and JSON Body

```java title="OrderControllerGetTest.java" showLineNumbers {4,15,25}
@WebMvcTest(OrderController.class)
class OrderControllerGetTest {

    @Autowired MockMvc mockMvc;
    @MockBean  OrderService orderService;

    @Test
    @WithMockUser                               // highlighted: any authenticated user
    void getOrder_returns200_withOrderJson() throws Exception {
        OrderResponse order = new OrderResponse(1L, "laptop", 999.0, "PENDING");
        when(orderService.findOrder(1L)).thenReturn(order);

        mockMvc.perform(get("/orders/1")
                .accept(MediaType.APPLICATION_JSON))
            .andDo(print())                     // highlighted: logs full req/response to console
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.itemName").value("laptop"))
            .andExpect(jsonPath("$.price").value(999.0))
            .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @WithMockUser
    void listOrders_returns200_withArray() throws Exception {
        List<OrderResponse> orders = List.of(
            new OrderResponse(1L, "laptop", 999.0, "PENDING"),
            new OrderResponse(2L, "phone", 499.0, "SHIPPED")
        );
        when(orderService.findAll(null)).thenReturn(orders);

        mockMvc.perform(get("/orders"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())          // highlighted: root is an array
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].itemName").value("laptop"))
            .andExpect(jsonPath("$[1].itemName").value("phone"));
    }
}
```

---

## Example 2: POST Request — Validation and 201 Response

```java title="OrderControllerPostTest.java" showLineNumbers {14,24,33}
@WebMvcTest(OrderController.class)
class OrderControllerPostTest {

    @Autowired MockMvc mockMvc;
    @MockBean  OrderService orderService;

    @Test
    @WithMockUser
    void placeOrder_returns201_withLocationHeader() throws Exception {
        OrderResponse saved = new OrderResponse(5L, "phone", 499.0, "PENDING");
        when(orderService.placeOrder(any())).thenReturn(saved);

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)  // highlighted: required for POST
                .content("""
                    {"itemName": "phone", "price": 499.0}
                    """))
            .andExpect(status().isCreated())              // highlighted: 201 Created
            .andExpect(header().string("Location", "/orders/5"))
            .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    @WithMockUser
    void placeOrder_returns400_whenItemNameBlank() throws Exception {
        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"itemName": "", "price": 10.0}
                    """))
            .andExpect(status().isBadRequest());          // highlighted: @valid fails with 400
    }

    @Test
    @WithMockUser
    void placeOrder_returns400_whenPriceNegative() throws Exception {
        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"itemName": "book", "price": -5.0}
                    """))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void placeOrder_returns415_whenNoContentType() throws Exception {
        // Forgetting contentType is a common mistake
        mockMvc.perform(post("/orders")
                .content("{\"itemName\": \"book\", \"price\": 10.0}"))
            .andExpect(status().isUnsupportedMediaType()); // highlighted: 415 without content-type
    }
}
```

---

## Example 3: Security Tests

```java title="OrderControllerSecurityTest.java" showLineNumbers {10,18,26}
@WebMvcTest(OrderController.class)
class OrderControllerSecurityTest {

    @Autowired MockMvc mockMvc;
    @MockBean  OrderService orderService;

    @Test
    void getOrder_returns401_withoutAuthentication() throws Exception {
        // No @WithMockUser — unauthenticated request
        mockMvc.perform(get("/orders/1"))
            .andExpect(status().isUnauthorized());         // highlighted: 401
    }

    @Test
    @WithMockUser(roles = "USER")
    void cancelOrder_returns403_forNonAdmin() throws Exception {
        mockMvc.perform(delete("/orders/1"))
            .andExpect(status().isForbidden());            // highlighted: 403 — needs ADMIN
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void cancelOrder_returns204_forAdmin() throws Exception {
        doNothing().when(orderService).cancelOrder(1L);

        mockMvc.perform(delete("/orders/1"))
            .andExpect(status().isNoContent());            // highlighted: 204 for delete
    }

    @Test
    @WithMockUser(username = "alice", roles = "USER")
    void getOrder_returns200_withUserAuthenticated() throws Exception {
        when(orderService.findOrder(2L))
            .thenReturn(new OrderResponse(2L, "tablet", 350.0, "PENDING"));

        mockMvc.perform(get("/orders/2"))
            .andExpect(status().isOk());
    }
}
```

---

## Example 4: Error Handling via `@ControllerAdvice`

```java title="OrderExceptionHandlerTest.java" showLineNumbers
@WebMvcTest(OrderController.class)
class OrderExceptionHandlerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  OrderService orderService;

    @Test
    @WithMockUser
    void getOrder_returns404_whenNotFound() throws Exception {
        when(orderService.findOrder(999L))
            .thenThrow(new OrderNotFoundException("Order 999 not found"));

        mockMvc.perform(get("/orders/999"))
            .andExpect(status().isNotFound())             // handled by @ControllerAdvice
            .andExpect(jsonPath("$.message").value("Order 999 not found"))
            .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @WithMockUser
    void placeOrder_returns409_onDuplicateOrder() throws Exception {
        when(orderService.placeOrder(any()))
            .thenThrow(new DuplicateOrderException("Duplicate"));

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"itemName\": \"laptop\", \"price\": 999.0}"))
            .andExpect(status().isConflict()); // @ControllerAdvice maps exception to 409
    }
}
```

---

## Example 5: The Same Tests with WebTestClient

`WebTestClient` provides a fluent API — same tests, different call style:

```java title="OrderControllerWebTestClientTest.java" showLineNumbers {5,18,28}
@WebMvcTest(OrderController.class)
class OrderControllerWebTestClientTest {

    @Autowired
    WebTestClient webTestClient;              // highlighted: auto-configured by @WebMvcTest

    @MockBean
    OrderService orderService;

    @Test
    @WithMockUser
    void getOrder_fluent() {
        when(orderService.findOrder(1L))
            .thenReturn(new OrderResponse(1L, "laptop", 999.0, "PENDING"));

        webTestClient.get()
            .uri("/orders/1")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()                       // highlighted: execute and get response
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.itemName").isEqualTo("laptop")
            .jsonPath("$.price").isEqualTo(999.0);
    }

    @Test
    @WithMockUser
    void listOrders_fluentArray() {
        when(orderService.findAll(null)).thenReturn(List.of(
            new OrderResponse(1L, "a", 10.0, "PENDING"),
            new OrderResponse(2L, "b", 20.0, "SHIPPED")
        ));

        webTestClient.get().uri("/orders")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(OrderResponse.class) // highlighted: typed list assertion
            .hasSize(2)
            .contains(new OrderResponse(1L, "a", 10.0, "PENDING"));
    }

    @Test
    void getOrder_unauthorised_withoutUser() {
        // No @WithMockUser → 401
        webTestClient.get().uri("/orders/1")
            .exchange()
            .expectStatus().isUnauthorized();  // highlighted: 401 without auth
    }
}
```

---

## Comparison: MockMvc vs WebTestClient

| Task | MockMvc | WebTestClient |
|------|---------|---------------|
| GET + assert field | `.andExpect(jsonPath("$.field").value("v"))` | `.expectBody().jsonPath("$.field").isEqualTo("v")` |
| Assert status | `.andExpect(status().isOk())` | `.expectStatus().isOk()` |
| Assert list size | `.andExpect(jsonPath("$", hasSize(2)))` | `.expectBodyList(T.class).hasSize(2)` |
| Log request/response | `.andDo(print())` | No direct equivalent (use logging) |
| Extract body | `.andReturn().getResponse().getContentAsString()` | `.returnResult().getResponseBody()` |

---

## What You've Practiced

| Concept | Example |
|---------|---------|
| GET with `jsonPath` assertions | Example 1 |
| POST with validation and 201 | Example 2 |
| Security: `@WithMockUser`, 401, 403 | Example 3 |
| `@ControllerAdvice` error handling | Example 4 |
| Same tests with `WebTestClient` | Example 5 |

**Challenge:** Add a `PATCH /orders/{id}/status` endpoint that updates order status. Write `@WebMvcTest` tests that verify: (1) valid status update returns 200, (2) invalid status string returns 400, (3) unauthenticated request returns 401, (4) non-existent order returns 404 via `@ControllerAdvice`.
