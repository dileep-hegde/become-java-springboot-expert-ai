---
id: transactions-acid-demo
title: "Transactions & ACID — Practical Demo"
description: Hands-on examples of Spring @Transactional — propagation, isolation levels, deadlock handling, and common pitfalls.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - spring-data
  - databases
  - transactions
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Transactions & ACID — Practical Demo

> Hands-on examples for [Transactions & ACID](../transactions-acid.md). Each example is a self-contained Spring Boot service snippet demonstrating one concept.

:::info Prerequisites
Understand the [@Transactional](../transactions-acid.md) concepts and Spring proxy mechanics before running these examples. The [SQL Fundamentals](../sql-fundamentals.md) note provides background on the underlying DML statements.
:::

---

## Project Setup

```xml title="pom.xml (relevant starters)"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

```yaml title="application.yml"
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo
    username: demo
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate          # use Flyway, not Hibernate, for schema changes
    show-sql: true                # log SQL in dev
    properties:
      hibernate:
        format_sql: true
```

---

## Example 1: Basic @Transactional — Bank Transfer

The classic atomicity example: debit one account, credit another.

```java title="TransferService.java" showLineNumbers {1,16,22}
@Service
public class TransferService {

    private final AccountRepository accountRepo;

    public TransferService(AccountRepository accountRepo) {
        this.accountRepo = accountRepo;
    }

    @Transactional              // ← Spring wraps this method in BEGIN/COMMIT
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        Account from = accountRepo.findById(fromId)
            .orElseThrow(() -> new EntityNotFoundException("Account not found: " + fromId));
        Account to   = accountRepo.findById(toId)
            .orElseThrow(() -> new EntityNotFoundException("Account not found: " + toId));

        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                "Account " + fromId + " has insufficient funds");  // ← triggers rollback
        }

        from.debit(amount);        // dirty-check: Hibernate detects change
        to.credit(amount);         // dirty-check: Hibernate detects change
        // Spring commits both updates atomically here
    }
}
```

```java title="TransferServiceTest.java" showLineNumbers {8-12}
@SpringBootTest
@Transactional                    // ← each test rolls back automatically
class TransferServiceTest {

    @Autowired TransferService transferService;
    @Autowired AccountRepository accountRepo;

    @Test
    void transferShouldDebitAndCreditAtomically() {
        // Arrange: accounts seeded by @Sql on the test class
        transferService.transfer(1L, 2L, new BigDecimal("100.00"));

        assertThat(accountRepo.findById(1L).get().getBalance())
            .isEqualByComparingTo("400.00");   // started at 500, debited 100
        assertThat(accountRepo.findById(2L).get().getBalance())
            .isEqualByComparingTo("600.00");   // started at 500, credited 100
    }

    @Test
    void transferShouldRollbackOnInsufficientFunds() {
        assertThatThrownBy(() -> transferService.transfer(1L, 2L, new BigDecimal("10000.00")))
            .isInstanceOf(InsufficientFundsException.class);

        // Both balances unchanged after rollback
        assertThat(accountRepo.findById(1L).get().getBalance())
            .isEqualByComparingTo("500.00");
    }
}
```

---

## Example 2: Isolation Level — REPEATABLE READ for Financial Calculations

When computing a user's net balance from two separate reads within one transaction, use `REPEATABLE READ` to prevent non-repeatable reads from a concurrent update.

```java title="BalanceService.java" showLineNumbers {3}
@Service
public class BalanceService {

    @Transactional(isolation = Isolation.REPEATABLE_READ)   // ← both reads see same snapshot
    public BigDecimal calculateNetBalance(Long userId) {
        // Read 1: total charged
        BigDecimal orders = orderRepo.sumByUserId(userId);

        // Simulate some processing time...

        // Read 2: total credits
        // Without REPEATABLE_READ, a concurrent UPDATE between these two reads
        // could give an inconsistent result
        BigDecimal credits = creditRepo.sumByUserId(userId);

        return orders.subtract(credits);
    }
}
```

---

## Example 3: Propagation.REQUIRES_NEW — Audit Log That Always Persists

An audit log entry must be saved even if the outer transaction is rolled back (e.g., for logging failed attempts).

```java title="AuditService.java" showLineNumbers {5}
@Service
public class AuditService {

    @Transactional(propagation = Propagation.REQUIRES_NEW)   // ← independent transaction
    public void log(String action, Long userId, String details) {
        AuditLog entry = new AuditLog(action, userId, details, Instant.now());
        auditLogRepo.save(entry);   // ← commits in its own transaction, regardless of outer tx
    }
}
```

```java title="OrderService.java" showLineNumbers {9,14}
@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final AuditService auditService;     // ← separate bean (important!)

    @Transactional
    public void placeOrder(OrderRequest request) {
        auditService.log("ORDER_ATTEMPT", request.userId(), request.toString()); // ← REQUIRES_NEW
        try {
            Order order = orderRepo.save(new Order(request));
            // ... other processing that might fail ...
        } catch (Exception e) {
            // This outer transaction rolls back, but the audit log was already committed
            throw e;
        }
    }
}
```

---

## Example 4: Common Pitfall — Self-Invocation Bypasses Proxy

```java title="OrderService.java" showLineNumbers {7,13}
@Service
public class OrderService {

    // WRONG: calling a @Transactional method from within the same class
    public void processAll(List<Long> orderIds) {
        for (Long id : orderIds) {
            this.processOne(id);   // ← bypasses Spring proxy — NO transaction applied!
        }
    }

    @Transactional
    public void processOne(Long orderId) {
        // This is NOT wrapped in a transaction when called via this.processOne(...)
        orderRepo.findById(orderId).ifPresent(order -> {
            order.setStatus("PROCESSING");
        });
    }
}
```

```java title="OrderService.java (Fixed)" showLineNumbers {6-7}
@Service
public class OrderService {

    private final OrderService self;  // ← inject the proxy of this bean

    public OrderService(OrderService self) { this.self = self; }

    public void processAll(List<Long> orderIds) {
        for (Long id : orderIds) {
            self.processOne(id);   // ← calls through the Spring proxy → transaction applied ✅
        }
    }

    @Transactional
    public void processOne(Long orderId) { ... }
}
```

:::tip Better fix: restructure into two beans
Injecting a bean into itself (`self`) is a code smell. Prefer extracting `processOne` into a separate `OrderProcessor` service bean. This makes the transaction boundary explicit and architecturally clean.
:::

---

## Example 5: Checked Exception — Rollback NOT Triggered by Default

```java title="ReportService.java" showLineNumbers {3,8,14}
@Service
public class ReportService {

    // WRONG: IOException is checked — Spring does NOT roll back for it by default
    @Transactional
    public void generateReport(Long orderId) throws IOException {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setReportStatus("GENERATING");        // write is committed even if below throws!
        writeReportToFile(order);                   // throws IOException
    }

    // CORRECT: explicitly declare rollbackFor
    @Transactional(rollbackFor = IOException.class)
    public void generateReportSafe(Long orderId) throws IOException {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setReportStatus("GENERATING");
        writeReportToFile(order);                   // if this throws, transaction rolls back ✅
    }

    private void writeReportToFile(Order order) throws IOException {
        // file I/O ...
    }
}
```

---

## Example 6: Deadlock Handling with Retry

```java title="InventoryService.java" showLineNumbers {5-6,18-22}
@Service
@Slf4j
public class InventoryService {

    @Transactional
    public void reserveItems(Long orderId, List<Long> productIds) {
        // IMPORTANT: always lock rows in consistent order to prevent deadlocks
        List<Long> sortedIds = productIds.stream().sorted().collect(Collectors.toList());

        for (Long productId : sortedIds) {
            Product product = productRepo.findByIdForUpdate(productId)  // SELECT FOR UPDATE
                .orElseThrow(() -> new EntityNotFoundException("Product " + productId));
            product.reserve(1);
        }
    }
}

// In the caller layer — catch and retry on deadlock
@Service
@Slf4j
public class OrderFulfillmentService {

    private final InventoryService inventoryService;

    public void fulfillWithRetry(Long orderId, List<Long> productIds) {
        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                inventoryService.reserveItems(orderId, productIds);
                return;
            } catch (DeadlockLoserDataAccessException e) {
                log.warn("Deadlock on attempt {} for order {}", attempt, orderId);
                if (attempt == maxAttempts) throw e;
                try {
                    Thread.sleep(50L * attempt);   // ← exponential-ish backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ie);
                }
            }
        }
    }
}
```

```java title="ProductRepository.java" showLineNumbers {4}
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)          // ← generates SELECT ... FOR UPDATE
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
```

---

## Example 7: Optimistic Locking with @Version

Detect concurrent modification without blocking reads:

```java title="Product.java" showLineNumbers {5}
@Entity
public class Product {
    @Id
    private Long id;

    @Version                        // ← Hibernate adds WHERE version = :old_version on UPDATE
    private Long version;

    private Integer stock;
    // ...
}
```

```java title="InventoryServiceOptimistic.java" showLineNumbers {8-12}
@Service
public class InventoryServiceOptimistic {

    @Transactional
    public void decrementStock(Long productId, int quantity) {
        Product product = productRepo.findById(productId).orElseThrow();
        product.setStock(product.getStock() - quantity);
        // Hibernate issues: UPDATE products SET stock=?, version=? WHERE id=? AND version=?
        // If another transaction modified it first, version won't match → OptimisticLockException
    }
}
```

```java title="OrderService.java (with retry)" showLineNumbers {6-11}
@Service
public class OrderService {

    @Retryable(
        retryFor = OptimisticLockingFailureException.class,
        maxAttempts = 3,
        backoff = @Backoff(delay = 50)
    )
    @Transactional
    public void placeOrder(OrderRequest request) {
        inventoryService.decrementStock(request.productId(), request.quantity());
        orderRepo.save(new Order(request));
    }
}
```

---

## Summary

| Scenario | What to Use |
|----------|-------------|
| Basic atomicity | `@Transactional` (default) |
| Two reads must be consistent | `@Transactional(isolation = REPEATABLE_READ)` |
| Audit log must persist on rollback | `@Transactional(propagation = REQUIRES_NEW)` in separate bean |
| Checked exception must roll back | `@Transactional(rollbackFor = IOException.class)` |
| Concurrent writes, low contention | `@Version` (optimistic locking) + retry |
| Concurrent writes, high contention | `@Lock(PESSIMISTIC_WRITE)` + consistent lock order |

Return to the full note: [Transactions & ACID](../transactions-acid.md)
