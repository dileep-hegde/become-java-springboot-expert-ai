---
id: mockito-demo
title: "Mockito — Practical Demo"
description: Hands-on code examples for creating mocks, stubbing behavior, verifying interactions, and capturing arguments with Mockito.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - testing
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Mockito — Practical Demo

> Hands-on examples for [Mockito](../mockito.md). We test an `OrderService` that depends on an `OrderRepository` and an `EmailService`.

:::info Prerequisites
You should understand [JUnit 5](../junit5.md) lifecycle annotations before working through this demo.
:::

---

## The System Under Test

```java title="OrderService.java" showLineNumbers
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    public Order placeOrder(OrderRequest request) {
        Order order = new Order(null, request.itemName(), request.price(), OrderStatus.PENDING);
        Order saved = orderRepository.save(order);
        emailService.sendConfirmation(saved);  // side effect — sends email
        return saved;
    }

    public Order findOrder(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException("Order not found: " + id));
    }

    public void cancelOrder(Long id) {
        Order order = findOrder(id);
        if (order.getStatus() == OrderStatus.SHIPPED) {
            throw new IllegalStateException("Cannot cancel a shipped order");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        // No email for cancellation
    }
}
```

---

## Example 1: Basic Stubbing with `when(...).thenReturn(...)`

```java title="OrderServiceTest.java" showLineNumbers {4,14,20}
@ExtendWith(MockitoExtension.class)          // highlighted: activates Mockito annotations
class OrderServiceTest {

    @Mock
    OrderRepository orderRepository;         // highlighted: fake repository — no real DB

    @Mock
    EmailService emailService;

    @InjectMocks
    OrderService orderService;               // highlighted: OrderService with mocks injected

    @Test
    void findOrder_returnsOrder_whenFound() {
        Order order = new Order(1L, "laptop", 999.0, OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Order result = orderService.findOrder(1L);

        assertEquals(1L, result.getId());
        assertEquals("laptop", result.getItemName());
    }

    @Test
    void findOrder_throws_whenNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(OrderNotFoundException.class,
            () -> orderService.findOrder(99L));
    }
}
```

---

## Example 2: Verifying Interactions

```java title="OrderServiceInteractionTest.java" showLineNumbers {10,17,27}
@ExtendWith(MockitoExtension.class)
class OrderServiceInteractionTest {

    @Mock OrderRepository orderRepository;
    @Mock EmailService emailService;
    @InjectMocks OrderService orderService;

    @Test
    void placeOrder_savesOrder_andSendsEmail() {
        OrderRequest request = new OrderRequest("phone", 499.0);
        Order saved = new Order(2L, "phone", 499.0, OrderStatus.PENDING);
        when(orderRepository.save(any(Order.class))).thenReturn(saved);

        orderService.placeOrder(request);

        // Verify repository was called once
        verify(orderRepository, times(1)).save(any(Order.class)); // highlighted

        // Verify email was sent once with the saved order
        verify(emailService, times(1)).sendConfirmation(saved);    // highlighted
    }

    @Test
    void cancelOrder_doesNot_sendEmail() {
        Order order = new Order(3L, "book", 20.0, OrderStatus.PENDING);
        when(orderRepository.findById(3L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenReturn(order);

        orderService.cancelOrder(3L);

        verify(emailService, never()).sendConfirmation(any());      // highlighted: never called
    }
}
```

**What to observe:**
- `verify(mock, times(n))` asserts the method was called exactly `n` times.
- `verify(mock, never())` asserts the method was never called — catches unintended side effects.
- `any(Order.class)` matches any `Order` argument — use when you can't predict the exact object.

---

## Example 3: `ArgumentCaptor` — Inspecting What Was Passed

When you need to assert on the *contents* of the argument passed to a mock:

```java title="OrderServiceCaptorTest.java" showLineNumbers {8,19,24}
@ExtendWith(MockitoExtension.class)
class OrderServiceCaptorTest {

    @Mock OrderRepository orderRepository;
    @Mock EmailService emailService;
    @InjectMocks OrderService orderService;

    @Captor
    ArgumentCaptor<Order> orderCaptor;      // highlighted: captures Order arguments

    @Test
    void placeOrder_savesOrderWithPendingStatus() {
        when(orderRepository.save(any())).thenAnswer(
            inv -> inv.getArgument(0));     // returns the argument passed to save()

        orderService.placeOrder(new OrderRequest("tablet", 350.0));

        verify(orderRepository).save(orderCaptor.capture());  // highlighted: capture
        Order capturedOrder = orderCaptor.getValue();

        assertEquals("tablet", capturedOrder.getItemName()); // highlighted: assert on captured
        assertEquals(OrderStatus.PENDING, capturedOrder.getStatus());
        assertNull(capturedOrder.getId()); // ID not yet assigned before save
    }
}
```

**Why this matters:** When `placeOrder` builds the `Order` internally, you can't create the exact same instance in advance. `ArgumentCaptor` lets you retrieve and inspect what was actually passed.

---

## Example 4: Throwing Exceptions from Mocks

```java title="ExceptionStubTest.java" showLineNumbers
    @Test
    void placeOrder_propagatesRepositoryException() {
        when(orderRepository.save(any()))
            .thenThrow(new DataAccessException("DB is down") {});  // stub to throw

        assertThrows(DataAccessException.class,
            () -> orderService.placeOrder(new OrderRequest("item", 10.0)));

        // Email should NOT be sent if save failed
        verify(emailService, never()).sendConfirmation(any());
    }

    @Test
    void cancelShippedOrder_throwsIllegalState() {
        Order shipped = new Order(5L, "glasses", 80.0, OrderStatus.SHIPPED);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(shipped));

        assertThrows(IllegalStateException.class,
            () -> orderService.cancelOrder(5L));

        // Verify save was never called for a shipped order
        verify(orderRepository, never()).save(any());
    }
```

---

## Example 5: Using `@Spy` for Partial Mocking

Rare but useful: spy on a real list to verify calls while still using real behavior.

```java title="SpyDemo.java" showLineNumbers {6,13,16}
@ExtendWith(MockitoExtension.class)
class SpyDemo {

    @Spy
    List<String> itemList = new ArrayList<>();  // highlighted: real ArrayList, wrapped by spy

    @Test
    void spy_tracksAddCalls() {
        itemList.add("apple");                  // real add() called
        itemList.add("banana");

        assertEquals(2, itemList.size());       // real size
        verify(itemList, times(2)).add(anyString()); // highlighted: interaction tracked
        verify(itemList, never()).clear();           // highlighted: clear was never called
    }

    @Test
    void spy_canOverrideOneMethod() {
        doReturn(99).when(itemList).size();     // highlighted: stub just size(); add() stays real
        itemList.add("cherry");

        assertEquals(1, itemList.size());       // wait — returns 99 from stub, not real 1
        // Actually returns 99 because size() is stubbed
        assertEquals(99, itemList.size());
    }
}
```

:::warning `doReturn` vs `when` with spies
For spies, always use `doReturn(value).when(spy).method()` — not `when(spy.method()).thenReturn(value)`. The latter calls the real method during setup.
:::

---

## What You've Practiced

| Concept | Example |
|---------|---------|
| `@Mock`, `@InjectMocks` setup | Examples 1–4 |
| `when(...).thenReturn(...)` stubbing | Examples 1, 2 |
| `verify(mock, times/never)` | Examples 2, 4 |
| `ArgumentCaptor` | Example 3 |
| `thenThrow` — stubbing exceptions | Example 4 |
| `@Spy` and `doReturn` | Example 5 |

**Challenge:** Add a `discountService.calculateDiscount(order)` call inside `placeOrder`. Write a test that verifies the discounted price is saved (not the original price) using `ArgumentCaptor`.
