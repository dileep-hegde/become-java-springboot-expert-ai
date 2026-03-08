---
id: n-plus-one-problem-demo
title: "N+1 Query Problem — Practical Demo"
description: Hands-on examples demonstrating how N+1 queries occur and how to fix them with JOIN FETCH, @EntityGraph, and @BatchSize.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - spring-data
  - jpa
  - intermediate
  - demo
  - performance
last_updated: 2026-03-08
---

# N+1 Query Problem — Practical Demo

> Hands-on examples for [The N+1 Query Problem](../n-plus-one-problem.md). We use `Order`/`Customer`/`OrderItem` to show the problem and all practical fixes.

:::info Prerequisites
You should understand [JPA Basics](../jpa-basics.md) (LAZY/EAGER fetch types) and [Spring Data Repositories](../spring-data-repositories.md). See [The N+1 Query Problem](../n-plus-one-problem.md) for full theory.
:::

---

## Example 1: Reproduce the N+1 Problem

Enable SQL logging and observe individual queries being fired per customer access.

```yaml title="application.yml"
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

```java title="Order.java"
@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)    // ← LAZY: customer not loaded with order
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private OrderStatus status;
}
```

```java title="OrderService.java — N+1 in action" showLineNumbers {4,6}
@Transactional(readOnly = true)
public void printAllOrders() {
    List<Order> orders = orderRepo.findAll();   // ← Query 1: SELECT * FROM orders
    for (Order order : orders) {
        // Accessing customer triggers a separate SELECT for each order
        System.out.println(order.getCustomer().getName()); // ← Query 2…N+1: per order!
    }
}
```

**SQL log output (with 3 orders):**
```sql
select * from orders
select * from customers where id = 1
select * from customers where id = 2
select * from customers where id = 3
-- Total: 4 queries for 3 orders. With 1000 orders → 1001 queries.
```

:::warning Warning
You won't notice this in development with 5 rows. It destroys performance in production with thousands of records.
:::

---

## Example 2: Fix with `JOIN FETCH`

Replace `findAll()` with a custom query that joins the association eagerly.

```java title="OrderRepository.java" showLineNumbers {3}
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.customer")   // ← single JOIN query
    List<Order> findAllWithCustomers();
}
```

```java title="OrderService.java — fixed"
@Transactional(readOnly = true)
public void printAllOrders() {
    List<Order> orders = orderRepo.findAllWithCustomers();  // ← single query with JOIN
    for (Order order : orders) {
        System.out.println(order.getCustomer().getName());  // ← no extra SQL: already loaded
    }
}
```

**SQL log output:**
```sql
select o.*, c.*
from orders o
inner join customers c on o.customer_id = c.id
-- Total: 1 query, regardless of number of orders.
```

---

## Example 3: Fix with `@EntityGraph`

`@EntityGraph` is cleaner for derived query methods — no custom JPQL needed.

```java title="OrderRepository.java" showLineNumbers {3}
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"customer"})    // ← fetch customer alongside order
    List<Order> findByStatus(OrderStatus status);  // ← derived query + EntityGraph
}
```

```java title="Demo"
List<Order> pendingOrders = orderRepo.findByStatus(OrderStatus.PENDING);
// SQL: SELECT o.*, c.* FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.status = 'PENDING'
// customer is already populated — no N+1
pendingOrders.forEach(o -> System.out.println(o.getCustomer().getName()));
```

---

## Example 4: Fix Collection N+1 with `@BatchSize`

For `@OneToMany` (items in an order), use `@BatchSize` to batch the lazy collection loads.

```java title="Order.java (updated)" showLineNumbers {5}
@Entity
public class Order {
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    @BatchSize(size = 25)     // ← Hibernate will batch-load up to 25 collections per query
    private List<OrderItem> items = new ArrayList<>();
}
```

```java title="OrderService.java"
@Transactional(readOnly = true)
public void printOrderItems() {
    List<Order> orders = orderRepo.findAll();  // ← loads 100 orders: 1 query
    for (Order order : orders) {
        List<OrderItem> items = order.getItems();  // ← batched: Hibernate groups 25 orders at a time
        System.out.println("Order " + order.getId() + " has " + items.size() + " items");
    }
}
```

**SQL log output (100 orders):**
```sql
select * from orders                                          -- 1 query
select * from order_items where order_id in (1,2,...,25)     -- batch 1
select * from order_items where order_id in (26,27,...,50)   -- batch 2
select * from order_items where order_id in (51,52,...,75)   -- batch 3
select * from order_items where order_id in (76,77,...,100)  -- batch 4
-- Total: 5 queries instead of 101
```

:::tip Key takeaway
`@BatchSize` is a low-effort safety net — add `hibernate.default_batch_fetch_size=25` globally in `application.yml` and every `@OneToMany` and `@ManyToMany` benefits without any code annotation change.
:::

---

## Exercises

1. **Easy**: Enable SQL logging, create 5 `Order` records each with a different `Customer`, and call `findAll()` in a `@Transactional` method. Count how many SQL statements appear in the log. Then switch to `findAllWithCustomers()` and count again.
2. **Medium**: Add `@OneToMany private List<OrderItem> items` to `Order` (without `@BatchSize`). Load 10 orders and access `items` for each. Count queries. Then add `@BatchSize(size = 5)` and count again.
3. **Hard**: Write a `@DataJpaTest` integration test using Hypersistence Utils `SQLStatementCountValidator` that asserts `findAllWithCustomers()` issues exactly 1 SELECT statement.

---

## Back to Topic

Return to [The N+1 Query Problem](../n-plus-one-problem.md) for theory, fix comparison table, interview questions, and further reading.
