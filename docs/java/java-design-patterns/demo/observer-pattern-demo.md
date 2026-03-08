---
id: observer-pattern-demo
title: "Observer Pattern — Practical Demo"
description: Hands-on examples of manual Observer, Spring Application Events, @TransactionalEventListener, and @Async observers.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Observer Pattern — Practical Demo

> Hands-on examples for [Observer Pattern](../observer-pattern.md). From a manual implementation to Spring's production-ready event system.

:::info Prerequisites
Familiarity with Spring `@Service`, `@Component`, and `@Transactional`. For async examples, knowledge of `@EnableAsync` and thread pools helps.
:::

---

## Example 1: Manual Observer — No Framework

Build an event system from scratch to understand the core mechanics:

```java title="OrderEventListener.java"
@FunctionalInterface
public interface OrderEventListener {
    void onOrderPlaced(Order order);
}
```

```java title="OrderService.java" showLineNumbers {3,14,20}
public class OrderService {

    private final List<OrderEventListener> listeners = new ArrayList<>(); // highlight: observer registry

    // Subscribe
    public void addListener(OrderEventListener listener)    { listeners.add(listener); }
    // Unsubscribe — IMPORTANT to avoid memory leaks
    public void removeListener(OrderEventListener listener) { listeners.remove(listener); }

    public Order placeOrder(Cart cart) {
        // ... save to DB, compute total, etc.
        Order order = new Order(UUID.randomUUID().toString(), cart.total());
        System.out.println("Order saved: " + order.getId());

        notifyListeners(order); // highlight: broadcast to all registered observers
        return order;
    }

    private void notifyListeners(Order order) {
        listeners.forEach(l -> { // highlight: synchronous — each listener runs in sequence
            try {
                l.onOrderPlaced(order);
            } catch (Exception e) {
                System.err.println("Listener error: " + e.getMessage()); // ← don't let one bad listener break others
            }
        });
    }
}
```

```java title="Main.java"
OrderService svc = new OrderService();

// Add observers
svc.addListener(order -> System.out.println("Email sent for: "     + order.getId()));
svc.addListener(order -> System.out.println("Inventory updated for: " + order.getId()));
svc.addListener(order -> System.out.println("Analytics tracked for: " + order.getId()));

svc.placeOrder(cart);
// Output:
// Order saved: a3f9...
// Email sent for: a3f9...
// Inventory updated for: a3f9...
// Analytics tracked for: a3f9...
```

---

## Example 2: Spring Application Events — Production Approach

No explicit registration needed — Spring discovers `@EventListener` methods automatically:

```java title="OrderPlacedEvent.java"
// The event object — immutable record carrying event data
public record OrderPlacedEvent(Order order, Instant timestamp) {}
```

```java title="OrderService.java" showLineNumbers {7,18}
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final ApplicationEventPublisher publisher; // highlight: Spring's event bus

    @Transactional
    public Order placeOrder(Cart cart, Customer customer) {
        Order order = new Order(cart, customer);
        orderRepo.save(order);

        // Fire the event — Spring delivers it to all @EventListener methods
        publisher.publishEvent(new OrderPlacedEvent(order, Instant.now())); // highlight: decoupled notification
        return order;
    }
}
```

```java title="NotificationListeners.java" showLineNumbers {5,12,19}
@Component
public class EmailListener {
    @EventListener                    // highlight: auto-registered; no manual addListener()
    public void onOrderPlaced(OrderPlacedEvent event) {
        String orderId = event.order().getId().toString();
        System.out.println("Email confirmation sent for order: " + orderId);
    }
}

@Component
public class InventoryListener {
    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) { // highlight: same event, different handler
        event.order().getItems().forEach(item ->
            System.out.printf("Reserved %d × %s%n", item.qty(), item.productId()));
    }
}

@Component
public class AuditListener {
    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) {
        System.out.println("Audit: order created at " + event.timestamp());
    }
}
```

**Try it live — output of a single `placeOrder()` call:**

```
Saving order to DB...
Email confirmation sent for order: ord-001
Reserved 2 × PRODUCT-A
Reserved 1 × PRODUCT-B
Audit: order created at 2026-03-08T09:15:00Z
```

---

## Example 3: @Async Observer — Non-Blocking Side Effects

Slow observers (email delivery, analytics) should not block the main request thread:

```java title="Application.java — Enable Async"
@SpringBootApplication
@EnableAsync  // ← required to activate @Async processing
public class Application { public static void main(String[] args) { SpringApplication.run(...); } }
```

```java title="AsyncListeners.java" showLineNumbers {4,12}
@Component
public class SlowEmailListener {

    @EventListener
    @Async  // highlight: runs in a thread pool — doesn't block the publisher's thread
    public void handleOrderPlaced(OrderPlacedEvent event) throws InterruptedException {
        Thread.sleep(500); // ← simulate slow SMTP call
        System.out.println("[ASYNC] Email sent on thread: " + Thread.currentThread().getName());
    }
}

@Component
public class SlowAnalyticsListener {

    @EventListener
    @Async  // highlight: also async — runs concurrently with SlowEmailListener
    public void handleOrderPlaced(OrderPlacedEvent event) throws InterruptedException {
        Thread.sleep(300); // ← simulate slow API call
        System.out.println("[ASYNC] Analytics tracked on thread: " + Thread.currentThread().getName());
    }
}
```

**Observe the non-blocking behaviour:**

```java
// In a test or main:
System.out.println("Placing order...");
orderService.placeOrder(cart, customer);
System.out.println("Order placed — returning to caller immediately");

// Output ordering:
// Placing order...
// Order placed — returning to caller immediately    ← main thread returns first
// [ASYNC] Analytics tracked on thread: task-1     ← async listeners fire after
// [ASYNC] Email sent on thread: task-2
```

:::warning
With `@Async`, if the application shuts down before async listeners finish, the events are lost. For durability, use `@TransactionalEventListener` + a message broker.
:::

---

## Example 4: @TransactionalEventListener — Fire After Commit

Prevents side effects (email, warehouse dispatch) from running if the transaction rolls back:

```java title="WarehouseDispatchListener.java" showLineNumbers {5,6}
@Component
public class WarehouseDispatchListener {

    @TransactionalEventListener(
        phase = TransactionPhase.AFTER_COMMIT) // highlight: only fires if the save() transaction committed
    public void onOrderPlaced(OrderPlacedEvent event) {
        // Safe to dispatch: order is confirmed in DB
        System.out.println("Warehouse dispatching order: " + event.order().getId());
    }
}
```

**Without `@TransactionalEventListener` (the bug):**

```
1. Save order to DB   → succeeds
2. publishEvent()     → EmailListener fires immediately
3. Email "Order confirmed" sent ✅
4. Transaction rolls back (DB constraint violation) ❌
5. Order doesn't exist in DB — but email was already sent! 💥
```

**With `@TransactionalEventListener`:**

```
1. Save order to DB   → succeeds
2. publishEvent()     → event queued; listeners NOT yet called
3. Transaction commits ✅
4. WARehouse/email listeners fire — order is confirmed in DB ✅
```

Or if it fails:

```
1. Save order to DB   → succeeds
2. publishEvent()     → event queued
3. Transaction rolls back ❌
4. Queued event is discarded — listeners NEVER fire ✅ (no phantom emails)
```

---

## Example 5: Conditional Event Listening

Use `condition` SpEL expression to filter events at the listener level:

```java title="HighValueOrderListener.java"
@Component
public class HighValueOrderListener {

    @EventListener(condition = "#event.order.total > 1000") // ← SpEL condition
    public void handleHighValueOrder(OrderPlacedEvent event) {
        System.out.println("VIP alert: high-value order " +
            event.order().getId() + " = $" + event.order().getTotal());
    }
}
```

Only orders over $1000 trigger this listener — no `if` statement in the listener itself.

---

## Summary

| Approach | Pros | Use For |
|---|---|---|
| Manual Observer | No framework needed; full control | Pure Java, learning the pattern |
| `@EventListener` | Zero coupling; Spring-managed | Standard Spring Boot side effects |
| `@Async @EventListener` | Non-blocking | Slow I/O: email, SMS, analytics |
| `@TransactionalEventListener` | Safe from rollback phantom effects | Irreversible side effects: email, dispatch |
| `condition` SpEL | Filter events without if/else in body | High-volume event streams with conditional handlers |
