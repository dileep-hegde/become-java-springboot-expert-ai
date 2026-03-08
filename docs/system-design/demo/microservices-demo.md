---
id: microservices-demo
title: "Microservices — Practical Demo"
description: Scenario-based walkthrough of building a two-service Order + Inventory microservices topology with service discovery, Kafka events, and Spring Boot 3.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Microservices — Practical Demo

> Hands-on examples for [Microservices](../microservices.md). We'll build a minimal e-commerce topology: **Order Service** and **Inventory Service** communicating synchronously (REST) and asynchronously (Kafka).

:::info Prerequisites
Familiarize yourself with the [Microservices](../microservices.md) concepts — especially database-per-service, service discovery, and the difference between synchronous and async communication.
:::

---

## Scenario: E-Commerce Order Placement

When a customer places an order:
1. **Order Service** receives the request, persists the order, and publishes an `OrderPlaced` event.
2. **Inventory Service** consumes the event and reserves stock.
3. If inventory reservation fails, a compensating `InventoryFailed` event triggers order cancellation.

---

## Example 1: Order Service — Minimal Spring Boot Setup

```java title="OrderServiceApplication.java" showLineNumbers {3,6}
@SpringBootApplication
@EnableFeignClients       // {3} ← enables Feign clients for sync service calls
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}                         // {6}
```

```java title="OrderController.java" showLineNumbers {10,14}
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(@RequestBody @Valid PlaceOrderRequest request) { // {10}
        return orderService.placeOrder(request);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public OrderResponse getOrder(@PathVariable Long id) {            // {14}
        return orderService.getOrder(id);
    }
}
```

```java title="PlaceOrderRequest.java" showLineNumbers
public record PlaceOrderRequest(
    @NotNull Long userId,
    @NotEmpty List<OrderItem> items,   // ← Bean Validation on the nested list
    @NotBlank String shippingAddress
) { }

public record OrderItem(
    @NotNull Long productId,
    @Positive int quantity
) { }
```

---

## Example 2: Order Service — Persisting and Publishing an Event

```java title="OrderService.java" showLineNumbers {8,12,16}
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate;

    public OrderResponse placeOrder(PlaceOrderRequest req) {
        Order order = orderRepository.save(Order.pending(req)); // {8} ← persist first

        kafkaTemplate.send(
            "orders.placed",                                    // {12} ← topic name
            order.getId().toString(),                           // ← partition key (order ID)
            new OrderPlacedEvent(
                UUID.randomUUID(),                              // {16} ← unique event ID for idempotency
                order.getId(),
                req.userId(),
                req.items()
            )
        );

        return OrderResponse.from(order);
    }
}
```

:::tip Key takeaway
**Persist before publishing.** If you publish first and then the DB write fails, the event is in Kafka but the order doesn't exist. Persisting first means Kafka gets the event only when the order is committed.
:::

```yaml title="application.yml (Order Service)" showLineNumbers
spring:
  application:
    name: order-service        # ← service name for Eureka registration

  datasource:
    url: jdbc:postgresql://localhost:5432/orders  # ← dedicated DB schema
    username: orders_user
    password: orders_pass

  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        spring.json.type.mapping: orderPlaced:com.example.order.events.OrderPlacedEvent

server:
  port: 8081  # ← each service runs on a different port locally

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

---

## Example 3: Inventory Service — Consuming the Event Idempotently

The Inventory Service listens on the `orders.placed` Kafka topic and reserves stock.

```java title="InventoryEventConsumer.java" showLineNumbers {7,13,20}
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final InventoryService inventoryService;
    private final ProcessedEventRepository processedEventRepository; // {7} ← idempotency store
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "orders.placed", groupId = "inventory-service")
    public void onOrderPlaced(OrderPlacedEvent event) {
        // Idempotency guard — skip already-processed events
        if (processedEventRepository.existsById(event.eventId())) { // {13}
            log.info("Duplicate event {}, skipping", event.eventId());
            return;
        }

        try {
            inventoryService.reserveStock(event.orderId(), event.items());
            processedEventRepository.save(new ProcessedEvent(event.eventId()));
            kafkaTemplate.send("inventory.reserved",               // {20} ← success event
                event.orderId().toString(),
                new InventoryReservedEvent(event.eventId(), event.orderId()));
        } catch (InsufficientStockException e) {
            log.warn("Insufficient stock for order {}", event.orderId());
            kafkaTemplate.send("inventory.failed",                 // ← failure event triggers compensation
                event.orderId().toString(),
                new InventoryFailedEvent(event.eventId(), event.orderId(), e.getMessage()));
        }
    }
}
```

**Expected behavior:**
- First delivery of `OrderPlacedEvent` → stock reserved → `InventoryReservedEvent` published.
- Duplicate delivery (Kafka redelivery) → guard fires → no double-reservation.
- Insufficient stock → `InventoryFailedEvent` published → Order Service cancels the order.

---

## Example 4: Order Service — Listening for Compensation

```java title="OrderCompensationConsumer.java" showLineNumbers {8,12}
@Service
@RequiredArgsConstructor
public class OrderCompensationConsumer {

    private final OrderRepository orderRepository;

    @KafkaListener(topics = "inventory.failed", groupId = "order-service-compensation")
    public void onInventoryFailed(InventoryFailedEvent event) {    // {8}
        orderRepository.findById(event.orderId()).ifPresent(order -> {
            order.cancel("INVENTORY_UNAVAILABLE");                 // {12} ← business status change
            orderRepository.save(order);
            log.info("Order {} cancelled: {}", event.orderId(), event.reason());
        });
    }
}
```

---

## Example 5: Synchronous Service Call with Circuit Breaker

When Order Service needs user details from User Service, it makes a synchronous REST call protected by a circuit breaker:

```java title="UserServiceClient.java" showLineNumbers {5,13}
@Service
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestClient restClient; // {5} ← Spring Boot 3.2+ RestClient

    @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
    @Retry(name = "userService")
    public UserDto getUser(Long userId) {
        return restClient.get()
            .uri("http://user-service/api/v1/users/{id}", userId)  // ← resolved by service discovery
            .retrieve()
            .onStatus(status -> status.is4xxClientError(),
                      (req, res) -> { throw new UserNotFoundException(userId); })
            .body(UserDto.class);                                   // {13} ← deserialize response DTO
    }

    public UserDto getUserFallback(Long userId, Exception ex) {
        log.warn("User service unavailable for user {}, using stub", userId);
        return UserDto.anonymous(userId); // ← graceful degradation
    }
}
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `GET /api/v1/orders/{id}/status` endpoint to Order Service that returns the current order status (`PENDING`, `CONFIRMED`, `CANCELLED`).
2. **Medium**: Add a `Notification Service` that listens for `inventory.reserved` events and sends a "Your order is confirmed" email. Ensure the consumer is idempotent.
3. **Hard**: Implement a **Saga timeout**: if an order remains in `PENDING` state for more than 5 minutes (no Kafka response from Inventory Service), a Spring `@Scheduled` job should fire, cancel the order, and publish a `SagaTimeoutEvent`.

---

## Back to Topic

Return to the [Microservices](../microservices.md) note for theory, interview questions, and further reading.
