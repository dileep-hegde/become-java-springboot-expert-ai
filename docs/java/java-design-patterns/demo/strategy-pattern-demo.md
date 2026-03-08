---
id: strategy-pattern-demo
title: "Strategy Pattern — Practical Demo"
description: Hands-on examples of Strategy using classic classes, lambdas, Spring DI, and the strategy registry for runtime selection.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Strategy Pattern — Practical Demo

> Hands-on examples for [Strategy Pattern](../strategy-pattern.md). From basic class-based implementations to lambda shortcuts and Spring runtime strategy selection.

:::info Prerequisites
Familiarity with Java interfaces and lambdas. Spring examples require understanding of `@Component`, `@Qualifier`, and bean injection.
:::

---

## Example 1: The Problem — Conditional Mess

Without Strategy, adding shipping modes bloats a single method:

```java title="BadOrderService.java — DON'T DO THIS" showLineNumbers
public BigDecimal calculateShipping(Order order, String mode) {
    if ("flat".equals(mode)) {
        return new BigDecimal("5.99");
    } else if ("express".equals(mode)) {
        return new BigDecimal("19.99");
    } else if ("weight".equals(mode)) {
        return new BigDecimal("2.50").multiply(BigDecimal.valueOf(order.getWeightKg()));
    } else if ("free".equals(mode)) {
        return BigDecimal.ZERO;
    } else if ("promo".equals(mode)) {
        // another branch...
    }
    // Adding a 6th mode means modifying THIS method — violates Open/Closed
    throw new IllegalArgumentException("Unknown mode: " + mode);
}
```

Every new shipping mode requires editing and re-testing this method. Now with Strategy:

---

## Example 2: Strategy — Each Algorithm in Its Own Class

```java title="ShippingCalculator.java"
@FunctionalInterface  // ← one method = lambda-compatible
public interface ShippingCalculator {
    BigDecimal calculate(Order order);
}
```

```java title="ShippingStrategies.java" showLineNumbers {5,14,23}
public class FlatRateShipping implements ShippingCalculator {
    private static final BigDecimal RATE = new BigDecimal("5.99");
    public BigDecimal calculate(Order order) {
        return RATE; // highlight: fixed rate — no need for order details
    }
}

public class ExpressShipping implements ShippingCalculator {
    private static final BigDecimal RATE = new BigDecimal("19.99");
    public BigDecimal calculate(Order order) {
        return RATE; // highlight: fixed premium rate
    }
}

public class WeightBasedShipping implements ShippingCalculator {
    private static final BigDecimal RATE_PER_KG = new BigDecimal("2.50");
    public BigDecimal calculate(Order order) {
        return RATE_PER_KG.multiply(BigDecimal.valueOf(order.getWeightKg())); // highlight: scales with weight
    }
}

public class FreeShipping implements ShippingCalculator {
    public BigDecimal calculate(Order order) {
        return BigDecimal.ZERO; // highlight: completely different algorithm, totally isolated
    }
}
```

```java title="OrderService.java" showLineNumbers {3,14}
public class OrderService {

    private ShippingCalculator shippingCalculator; // highlight: holds the strategy

    public OrderService(ShippingCalculator shippingCalculator) {
        this.shippingCalculator = shippingCalculator;
    }

    // Allow runtime swap
    public void setShippingCalculator(ShippingCalculator calc) {
        this.shippingCalculator = calc;
    }

    public OrderTotal checkout(Order order) {
        BigDecimal shipping = shippingCalculator.calculate(order); // highlight: delegates — no if/else
        BigDecimal total    = order.getItemsTotal().add(shipping);
        return new OrderTotal(order.getItemsTotal(), shipping, total);
    }
}
```

**Try it:**

```java title="Main.java"
Order order = new Order(List.of(/* items */), 2.5); // 2.5 kg, items total = $45.00

OrderService svc = new OrderService(new FlatRateShipping());
System.out.println(svc.checkout(order)); // shipping = 5.99, total = 50.99

svc.setShippingCalculator(new WeightBasedShipping()); // ← runtime swap
System.out.println(svc.checkout(order)); // shipping = 6.25 (2.5 × 2.50), total = 51.25

svc.setShippingCalculator(new FreeShipping());
System.out.println(svc.checkout(order)); // shipping = 0.00, total = 45.00
```

---

## Example 3: Lambda Strategies — No Extra Class Needed

Because `ShippingCalculator` is a `@FunctionalInterface`, simple strategies can be inlined as lambdas:

```java title="Main.java" showLineNumbers
// Named lambda strategies
ShippingCalculator flatRate = order -> new BigDecimal("5.99");
ShippingCalculator freeOver100 = order ->
    order.getItemsTotal().compareTo(new BigDecimal("100")) >= 0
        ? BigDecimal.ZERO
        : new BigDecimal("5.99");

// Method reference as strategy
ShippingCalculator apiRate = ExternalShippingApi::calculateRealtime; // ← delegation to external

// Use them
OrderService svc = new OrderService(freeOver100);
Order bigOrder   = new Order(/* items total = $150 */, 1.0);
Order smallOrder = new Order(/* items total = $30 */,  1.0);

System.out.println(svc.checkout(bigOrder).getShipping());   // → 0.00  (free, over $100)
System.out.println(svc.checkout(smallOrder).getShipping()); // → 5.99  (charged)
```

---

## Example 4: Spring DI — Inject Strategy via @Qualifier

Register each strategy as a Spring bean and select at startup via configuration:

```java title="ShippingStrategyBeans.java"
@Configuration
public class ShippingConfig {

    @Value("${shipping.mode:flat}")   // ← read from application.properties
    private String mode;

    @Bean
    public ShippingCalculator shippingCalculator(
            FlatRateShipping flat,
            ExpressShipping express,
            WeightBasedShipping weight) {

        return switch (mode) {
            case "express" -> express;
            case "weight"  -> weight;
            default        -> flat;
        };
    }
}

@Component("flat")
class FlatRateShipping implements ShippingCalculator { /* ... */ }

@Component("express")
class ExpressShipping implements ShippingCalculator { /* ... */ }

@Component("weight")
class WeightBasedShipping implements ShippingCalculator { /* ... */ }
```

```yaml title="application.properties"
shipping.mode=weight
```

```java title="OrderService.java"
@Service
public class OrderService {
    private final ShippingCalculator calculator; // ← injected from ShippingConfig

    public OrderService(ShippingCalculator calculator) {
        this.calculator = calculator;
    }
    // ...
}
```

Changing `shipping.mode` in properties switches the algorithm with zero code changes.

---

## Example 5: Strategy Registry — Runtime Selection per Request

The most flexible Spring setup — select a strategy dynamically on each request:

```java title="OrderController.java" showLineNumbers {4,14}
@Service
public class OrderService {

    // Spring injects ALL ShippingCalculator beans as a Map: beanName → bean
    private final Map<String, ShippingCalculator> calculators;

    public OrderService(Map<String, ShippingCalculator> calculators) {
        this.calculators = calculators;
    }

    public OrderTotal checkout(Order order, String shippingMode) {
        ShippingCalculator calc = calculators.getOrDefault(
            shippingMode,
            calculators.get("flat")); // highlight: fallback to flat rate if mode unknown

        BigDecimal shipping = calc.calculate(order);
        return new OrderTotal(order.getItemsTotal(), shipping,
                              order.getItemsTotal().add(shipping));
    }
}

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired OrderService orderService;

    @PostMapping("/checkout")
    public OrderTotal checkout(@RequestBody OrderRequest req) {
        return orderService.checkout(req.getOrder(), req.getShippingMode()); // ← per-request
    }
}
```

**How it works:**

```
POST /orders/checkout
{ "shippingMode": "express", "order": {...} }
         ↓
OrderService.checkout(order, "express")
         ↓
calculators.get("express") → ExpressShipping bean
         ↓
ExpressShipping.calculate(order) → $19.99
```

Registering a new strategy? Just add a new `@Component("overnight")` and `calculators.get("overnight")` works immediately — zero changes to `OrderService`.

---

## Summary

| Approach | When to use |
|---|---|
| Separate class per strategy | Strategy has significant logic; needs to be independently testable |
| Lambda / method reference | One-liner strategy; no reuse needed |
| @Qualifier injection | Strategy fixed at startup from config |
| Strategy registry `Map<String, Strategy>` | Strategy selected per request at runtime |
