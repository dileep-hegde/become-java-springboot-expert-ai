---
id: distributed-systems-demo
title: "Distributed Systems — Practical Demo"
description: Scenario-based walkthrough of implementing a choreography-based Saga for an e-commerce order flow with idempotent Kafka consumers in Spring Boot.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - advanced
  - demo
last_updated: 2026-03-08
---

# Distributed Systems — Practical Demo

> Hands-on examples for [Distributed Systems](../distributed-systems.md). We'll implement a **choreography-based Saga** for an order flow across Order, Inventory, and Payment services — with idempotent consumers and compensation logic.

:::info Prerequisites
Review the [Distributed Systems](../distributed-systems.md) note — especially the Saga pattern (choreography vs orchestration), eventual consistency, and idempotency before running these examples.
:::

---

## Scenario: E-Commerce Order Saga

**Business flow:**
1. Customer places order → **Order Service** creates PENDING order, publishes `OrderPlaced`
2. **Inventory Service** reserves stock, publishes `InventoryReserved` (or `InventoryFailed`)
3. **Payment Service** charges the customer, publishes `PaymentCompleted` (or `PaymentFailed`)
4. On success: Order becomes `CONFIRMED`
5. On any failure: compensation events cancel all prior steps

---

## Example 1: Shared Event Classes

```java title="OrderPlacedEvent.java" showLineNumbers
// ✅ Every event carries a unique eventId for idempotency deduplication
public record OrderPlacedEvent(
    UUID eventId,          // ← unique per event; used to prevent duplicate processing
    Long orderId,
    Long userId,
    List<OrderItem> items,
    BigDecimal total
) { }

public record InventoryReservedEvent(UUID eventId, Long orderId) { }
public record InventoryFailedEvent(UUID eventId, Long orderId, String reason) { }
public record PaymentCompletedEvent(UUID eventId, Long orderId, String transactionId) { }
public record PaymentFailedEvent(UUID eventId, Long orderId, String reason) { }
```

---

## Example 2: Order Service — Publishing the Saga-Start Event

```java title="OrderService.java" showLineNumbers {8,14,18}
@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderResponse placeOrder(PlaceOrderRequest req) {
        // Step 1: persist order in PENDING state                                    // {8}
        Order order = orderRepository.save(
            Order.builder()
                .userId(req.userId())
                .items(req.items())
                .total(req.total())
                .status(OrderStatus.PENDING)
                .build()
        );

        // Step 2: publish saga-start event AFTER commit                             // {14}
        // TransactionalEventListener would fire after the TX commits; here using
        // @Transactional on the method means Kafka send happens within the TX.
        kafkaTemplate.send("orders.placed",
            order.getId().toString(),   // ← partition key: ensures ordered delivery per order // {18}
            new OrderPlacedEvent(
                UUID.randomUUID(),      // ← new unique event ID
                order.getId(),
                req.userId(),
                req.items(),
                req.total()
            )
        );

        return OrderResponse.from(order);
    }

    // Called when saga succeeds
    public void confirmOrder(Long orderId) {
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        });
    }

    // Called by compensation — saga failure
    public void cancelOrder(Long orderId, String reason) {
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus(OrderStatus.CANCELLED);
            order.setCancellationReason(reason);
            orderRepository.save(order);
        });
    }
}
```

---

## Example 3: Inventory Service — Idempotent Consumer with Compensation

```java title="InventoryEventConsumer.java" showLineNumbers {11,21,28}
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final InventoryService inventoryService;
    private final ProcessedEventRepository processedEvents;  // ← idempotency store
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "orders.placed", groupId = "inventory-service")
    @Transactional  // ← process + mark as processed in one local transaction       // {11}
    public void onOrderPlaced(OrderPlacedEvent event) {
        // Idempotency guard
        if (processedEvents.existsById(event.eventId())) {
            log.info("Skipping duplicate event {}", event.eventId());
            return;
        }

        inventoryService.reserveStock(event.orderId(), event.items());               // {21}
        processedEvents.save(new ProcessedEvent(event.eventId(), Instant.now()));

        kafkaTemplate.send("inventory.reserved",
            event.orderId().toString(),
            new InventoryReservedEvent(UUID.randomUUID(), event.orderId())); // {28}
    }

    @KafkaListener(topics = "payment.failed", groupId = "inventory-service-compensation")
    @Transactional
    public void onPaymentFailed(PaymentFailedEvent event) {
        // Compensation: release reserved stock
        if (processedEvents.existsById(event.eventId())) return; // ← idempotency guard

        inventoryService.releaseReservation(event.orderId());
        processedEvents.save(new ProcessedEvent(event.eventId(), Instant.now()));
        log.info("Released inventory reservation for order {} (payment failed)", event.orderId());
    }
}
```

:::tip Key takeaway
**`@Transactional` + idempotency guard**: both the business operation (`reserveStock`) and the processed-event marker are in the same transaction. If the event is redelivered, the idempotency guard fires before any state change.
:::

---

## Example 4: Payment Service — Final Saga Step

```java title="PaymentEventConsumer.java" showLineNumbers {10,20,30}
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final PaymentService paymentService;
    private final ProcessedEventRepository processedEvents;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "inventory.reserved", groupId = "payment-service") // {10}
    @Transactional
    public void onInventoryReserved(InventoryReservedEvent event) {
        if (processedEvents.existsById(event.eventId())) return;

        try {
            String txId = paymentService.charge(event.orderId());                    // {20}
            processedEvents.save(new ProcessedEvent(event.eventId(), Instant.now()));
            kafkaTemplate.send("payment.completed",
                event.orderId().toString(),
                new PaymentCompletedEvent(UUID.randomUUID(), event.orderId(), txId));
        } catch (PaymentDeclinedException e) {
            processedEvents.save(new ProcessedEvent(event.eventId(), Instant.now()));
            kafkaTemplate.send("payment.failed",                                     // {30}
                event.orderId().toString(),
                new PaymentFailedEvent(UUID.randomUUID(), event.orderId(), e.getMessage()));
        }
    }
}
```

---

## Example 5: Order Service — Completing and Compensating the Saga

```java title="OrderSagaConsumer.java" showLineNumbers
@Service
@RequiredArgsConstructor
public class OrderSagaConsumer {

    private final OrderService orderService;
    private final ProcessedEventRepository processedEvents;

    // Happy path: payment succeeded → confirm order
    @KafkaListener(topics = "payment.completed", groupId = "order-service-saga")
    @Transactional
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        if (processedEvents.existsById(event.eventId())) return;
        orderService.confirmOrder(event.orderId());
        processedEvents.save(new ProcessedEvent(event.eventId(), Instant.now()));
        log.info("Order {} CONFIRMED (txId: {})", event.orderId(), event.transactionId());
    }

    // Compensation: inventory failed → cancel order
    @KafkaListener(topics = "inventory.failed", groupId = "order-service-saga")
    @Transactional
    public void onInventoryFailed(InventoryFailedEvent event) {
        if (processedEvents.existsById(event.eventId())) return;
        orderService.cancelOrder(event.orderId(), "INVENTORY_UNAVAILABLE: " + event.reason());
        processedEvents.save(new ProcessedEvent(event.eventId(), Instant.now()));
    }

    // Compensation: payment failed → cancel order
    @KafkaListener(topics = "payment.failed", groupId = "order-service-saga")
    @Transactional
    public void onPaymentFailed(PaymentFailedEvent event) {
        if (processedEvents.existsById(event.eventId())) return;
        orderService.cancelOrder(event.orderId(), "PAYMENT_FAILED: " + event.reason());
        processedEvents.save(new ProcessedEvent(event.eventId(), Instant.now()));
    }
}
```

**Saga state flow summary:**

```
OrderPlaced         → Order: PENDING
InventoryReserved   → (no order state change yet)
PaymentCompleted    → Order: CONFIRMED  ✅

OrderPlaced         → Order: PENDING
InventoryFailed     → Order: CANCELLED  (compensation)

OrderPlaced         → Order: PENDING
InventoryReserved   → (stock held)
PaymentFailed       → Inventory: released (compensation) + Order: CANCELLED
```

---

## Example 6: Saga Timeout — Handling No Response

```java title="SagaTimeoutJob.java" showLineNumbers {7,14}
@Component
@RequiredArgsConstructor
@Slf4j
public class SagaTimeoutJob {

    private final OrderRepository orderRepository;
    private final OrderService orderService;                                         // {7}

    // Every minute, check for orders stuck in PENDING for >15 minutes
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void timeoutStalePendingOrders() {
        Instant cutoff = Instant.now().minus(Duration.ofMinutes(15));
        List<Order> stalePending = orderRepository.findByStatusAndCreatedAtBefore( // {14}
            OrderStatus.PENDING, cutoff);

        stalePending.forEach(order -> {
            log.warn("Saga timeout for order {} (stuck PENDING > 15 min)", order.getId());
            orderService.cancelOrder(order.getId(), "SAGA_TIMEOUT");
            // Inventory/Payment services should also listen for a SagaTimedOutEvent
            // (not shown here) to release any partial reservations
        });
    }
}
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `@KafkaListener` on the `payment.completed` topic in a `NotificationService` that sends a "Your order is confirmed!" email. Ensure the consumer is idempotent.
2. **Medium**: Add a `ProcessedEvent` table with a `created_at` column. Create a `@Scheduled` cleanup job that deletes processed events older than 7 days, preventing unbounded table growth.
3. **Hard**: Replace the choreography saga with an **orchestration saga**: build an `OrderSagaOrchestrator` service that keeps a `SagaState` entity, commands each service step-by-step via direct REST calls (not events), and executes compensation in reverse order upon any step failure. Compare the observability of the orchestration approach vs choreography.

---

## Back to Topic

Return to the [Distributed Systems](../distributed-systems.md) note for theory, interview questions, and further reading.
