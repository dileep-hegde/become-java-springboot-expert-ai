---
id: transactions-demo
title: "Transactions — Practical Demo"
description: Hands-on examples for @Transactional propagation, readOnly optimization, rollbackFor, the self-invocation trap, and programmatic transactions.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - spring-data
  - spring-framework
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Transactions — Practical Demo

> Hands-on examples for [@Transactional and Spring transaction management](../transactions.md). All examples use the `Order`/`Payment`/`Audit` domain.

:::info Prerequisites
Ensure you understand [Spring Data Repositories](../spring-data-repositories.md) and basic Spring bean injection. See [Transactions](../transactions.md) for the full theory.
:::

---

## Example 1: Basic `@Transactional` with Rollback

Two database writes in one method — if the second one fails, both roll back.

```java title="OrderService.java" showLineNumbers {4,9,10}
@Service
public class OrderService {

    @Transactional    // ← both operations share one transaction
    public Order placeOrder(OrderRequest req) {
        // Step 1: create the order record
        Order order = orderRepo.save(new Order(req.customerId(), req.productId()));

        // Step 2: reserve inventory (throws if stock is insufficient)
        inventoryService.reserveStock(req.productId(), req.quantity()); // ← if this throws RuntimeException,
                                                                        //   the order INSERT above is rolled back
        return order;
    }
}
```

```java title="Demo — success path"
Order order = orderService.placeOrder(new OrderRequest(1L, 42L, 2));
// Result: order saved + inventory reserved, both committed
System.out.println(order.getId()); // → 1001
```

```java title="Demo — failure path"
// If inventoryService.reserveStock throws InsufficientStockException (extends RuntimeException):
try {
    orderService.placeOrder(new OrderRequest(1L, 99L, 1000)); // ← too many
} catch (InsufficientStockException e) {
    System.out.println("Order rolled back — DB is clean");
}
// Verify:
Optional<Order> ghost = orderRepo.findByProductIdAndCustomerId(99L, 1L);
System.out.println(ghost.isPresent()); // → false (rolled back)
```

:::tip Key takeaway
Spring's default rollback-on-`RuntimeException` means you rarely need `rollbackFor`. But if you throw a checked exception and need rollback, add `rollbackFor = YourCheckedException.class`.
:::

---

## Example 2: The Self-Invocation Trap

Calling a `@Transactional` method from within the same class bypasses the AOP proxy — the annotation is silently ignored.

```java title="OrderService.java — BROKEN" showLineNumbers {8,13}
@Service
public class OrderService {

    @Transactional
    public void processAll(List<Long> orderIds) {
        for (Long id : orderIds) {
            processSingle(id);   // ← WRONG: calls this.processSingle(), not the proxy
        }                        //   @Transactional(REQUIRES_NEW) on processSingle is ignored!
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processSingle(Long id) { /* ... */ }
}
```

```java title="OrderProcessor.java — FIXED" showLineNumbers {9}
@Service
public class OrderProcessor {      // ← extracted to a separate bean

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processSingle(Long id) { /* ... */ }
}

@Service
public class OrderService {

    private final OrderProcessor processor;   // ← inject the separate bean

    @Transactional
    public void processAll(List<Long> orderIds) {
        for (Long id : orderIds) {
            processor.processSingle(id);   // ← calls the proxy — REQUIRES_NEW is now respected
        }
    }
}
```

---

## Example 3: `readOnly = true` Performance Pattern

Use class-level `@Transactional(readOnly = true)` with method-level overrides for writes.

```java title="ProductService.java" showLineNumbers {3,8}
@Service
@Transactional(readOnly = true)             // ← default for all methods: read-only
public class ProductService {

    public List<Product> getAllProducts() { return productRepo.findAll(); }  // readOnly = true
    public Optional<Product> getProduct(Long id) { return productRepo.findById(id); } // readOnly = true

    @Transactional                          // ← overrides class default: write TX
    public Product createProduct(ProductRequest req) {
        return productRepo.save(new Product(req.name(), req.price()));
    }

    @Transactional                          // ← again, overrides to allow writes
    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }
}
```

**Verify with a quick log check:** add `logging.level.org.hibernate.engine.transaction=TRACE` — you'll observe that read methods skip the dirty-check flush log line.

---

## Example 4: `REQUIRES_NEW` for Independent Audit Logging

An audit entry must commit even if the outer business transaction rolls back.

```java title="AuditService.java" showLineNumbers {3}
@Service
public class AuditService {

    @Transactional(propagation = Propagation.REQUIRES_NEW)   // ← always its own TX
    public void logEvent(String event, String details) {
        auditRepo.save(new AuditEntry(event, details, LocalDateTime.now()));
        // ← committed immediately, independent of any outer transaction
    }
}
```

```java title="OrderService.java" showLineNumbers {5,7}
@Service
public class OrderService {

    @Transactional
    public Order placeOrder(OrderRequest req) {
        Order order = orderRepo.save(new Order(...));
        auditService.logEvent("ORDER_PLACED", "orderId=" + order.getId()); // ← own TX, commits now
        if (forceFailure) throw new RuntimeException("forced!");
        return order;
    }
}
```

**Result when `forceFailure = true`:**
- `orders` table: no row (outer TX rolled back)
- `audit_entries` table: row exists (inner `REQUIRES_NEW` TX already committed)

:::warning Common Mistake
Using `REQUIRES_NEW` inside the same class (self-invocation) — the separate transaction is silently ignored. Always call `REQUIRES_NEW` methods through a different bean (injected proxy).
:::

---

## Exercises

1. **Easy**: Add `rollbackFor = IOException.class` to `placeOrder` and verify that throwing an `IOException` now causes a rollback (hint: catch it in a test and assert the order isn't present in the DB).
2. **Medium**: Replace the `processAll` self-invocation broken pattern with the self-injection fix (`@Autowired private OrderService self;`) and verify `REQUIRES_NEW` is respected.
3. **Hard**: Implement a batch processor that processes 100 orders using `TransactionTemplate`, each order in its own transaction, continues on failure, and records which IDs failed without interrupting the rest of the batch.

---

## Back to Topic

Return to [Transactions](../transactions.md) for theory, propagation tables, isolation levels, interview questions, and further reading.
