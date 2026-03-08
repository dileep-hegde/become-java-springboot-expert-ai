---
id: reliability-patterns-demo
title: "Reliability Patterns — Practical Demo"
description: Scenario-based walkthrough of implementing Circuit Breaker, Retry, Bulkhead, and Timeout with Resilience4j in a Spring Boot 3 microservice.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Reliability Patterns — Practical Demo

> Hands-on examples for [Reliability Patterns](../reliability-patterns.md). We'll protect an `OrderService` from failures in a slow `InventoryService` using Resilience4j — step by step, from nothing to a fully layered resilience stack.

:::info Prerequisites
Review the [Reliability Patterns](../reliability-patterns.md) note first — particularly the Circuit Breaker state machine (Closed → Open → Half-Open) and why Retry + Circuit Breaker must be used together.
:::

---

## Scenario: Order Service Calling Inventory Service

`OrderService` must check if a product is in stock before confirming an order. The external `InventoryService` sometimes responds slowly or returns errors. We'll make this call resilient step by step.

---

## Example 1: The Problem — No Resilience

```java title="InventoryServiceClient.java (no resilience)" showLineNumbers {8}
@Service
@RequiredArgsConstructor
public class InventoryServiceClient {
    private final RestClient restClient;

    // ❌ If inventory service hangs, this thread blocks indefinitely
    // ❌ 100+ concurrent orders = 100+ blocked threads = thread pool exhausted
    public StockCheckResponse checkStock(Long productId, int quantity) { // {8}
        return restClient.get()
            .uri("http://inventory-service/api/v1/stock/{id}", productId)
            .retrieve()
            .body(StockCheckResponse.class);
    }
}
```

**What goes wrong:** With no timeout, a 30-second database slow query in Inventory Service holds 100 Order Service threads for 30 seconds. Thread pool exhausted → Order Service stops responding → upstream services see Order Service as failed → cascading failure.

---

## Example 2: Adding Timeout First (Foundational)

```xml title="pom.xml"
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
    <version>2.2.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

```yaml title="application.yml" showLineNumbers
resilience4j:
  timelimiter:
    instances:
      inventoryService:
        timeout-duration: 2s   # ← cancel if no response within 2 seconds
        cancel-running-future: true
```

```java title="InventoryServiceClient.java" showLineNumbers {3}
@TimeLimiter(name = "inventoryService", fallbackMethod = "checkStockFallback")
public CompletableFuture<StockCheckResponse> checkStock(Long productId, int quantity) { // {3}
    // ← TimeLimiter requires CompletableFuture or reactive return type
    return CompletableFuture.supplyAsync(() ->
        restClient.get()
            .uri("http://inventory-service/api/v1/stock/{id}", productId)
            .retrieve()
            .body(StockCheckResponse.class)
    );
}

// Fallback invoked when timeout fires
public CompletableFuture<StockCheckResponse> checkStockFallback(
        Long productId, int quantity, TimeoutException ex) {
    log.warn("Inventory check timed out for product {}", productId);
    return CompletableFuture.completedFuture(
        StockCheckResponse.assumeInStock(productId)); // ← optimistic fallback
}
```

---

## Example 3: Adding Circuit Breaker

```yaml title="application.yml" showLineNumbers
resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 10          # ← observe last 10 calls
        failure-rate-threshold: 50       # ← open circuit if 50%+ fail
        wait-duration-in-open-state: 30s # ← stay open 30 seconds
        permitted-number-of-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true
        record-exceptions:
          - java.io.IOException
          - java.util.concurrent.TimeoutException
        ignore-exceptions:
          - com.example.exceptions.ProductNotFoundException  # ← 404 is not a circuit failure
```

```java title="InventoryServiceClient.java" showLineNumbers {2,3}
// ✅ Order of annotation matters: TimeLimiter → CircuitBreaker → Retry (outer to inner)
@CircuitBreaker(name = "inventoryService", fallbackMethod = "checkStockFallback")
@TimeLimiter(name = "inventoryService")
public CompletableFuture<StockCheckResponse> checkStock(Long productId, int quantity) {
    return CompletableFuture.supplyAsync(() ->
        restClient.get()
            .uri("http://inventory-service/api/v1/stock/{id}", productId)
            .retrieve()
            .body(StockCheckResponse.class));
}

// Fallback covers both timeout and circuit-open scenarios
public CompletableFuture<StockCheckResponse> checkStockFallback(
        Long productId, int quantity, Exception ex) {
    log.warn("Inventory unavailable for product {}: {} [{}]",
             productId, ex.getClass().getSimpleName(), ex.getMessage());
    return CompletableFuture.completedFuture(
        StockCheckResponse.assumeInStock(productId));
}
```

**What changed:** After 5 of 10 calls fail, the circuit opens. For the next 30 seconds, `checkStock` immediately returns the fallback without even attempting the HTTP call. After 30s, 3 probe requests are let through — if they succeed, the circuit closes.

---

## Example 4: Adding Retry (for Transient Failures)

```yaml title="application.yml" showLineNumbers
resilience4j:
  retry:
    instances:
      inventoryService:
        max-attempts: 3          # ← try up to 3 times
        wait-duration: 300ms     # ← wait 300ms between attempts
        exponential-backoff-multiplier: 2   # ← 300ms → 600ms → 1200ms
        retry-exceptions:
          - java.io.IOException
          - java.net.ConnectException
        ignore-exceptions:
          - com.example.exceptions.ProductNotFoundException
          - com.example.exceptions.InvalidRequestException
```

```java title="InventoryServiceClient.java (full stack)" showLineNumbers {2,3,4}
// ✅ Complete resilience stack: TimeLimiter → CircuitBreaker → Retry → Bulkhead
@CircuitBreaker(name = "inventoryService", fallbackMethod = "checkStockFallback")
@Retry(name = "inventoryService")                 // {3} ← retries before circuit breaker counts the failure
@TimeLimiter(name = "inventoryService")           // {4} ← innermost: timeout applies to each attempt
public CompletableFuture<StockCheckResponse> checkStock(Long productId, int quantity) {
    return CompletableFuture.supplyAsync(() ->
        restClient.get()
            .uri("http://inventory-service/api/v1/stock/{id}", productId)
            .retrieve()
            .body(StockCheckResponse.class));
}
```

:::tip Key takeaway
Retry is **inside** (applied before) Circuit Breaker. This means all retry attempts for a single request either all succeed or the final failure counts as **one failure** toward the circuit breaker threshold — not N failures.
:::

---

## Example 5: Testing Circuit Breaker Behavior

```java title="InventoryCircuitBreakerTest.java" showLineNumbers {9,18,27}
@SpringBootTest
class InventoryCircuitBreakerTest {

    @Autowired InventoryServiceClient client;
    @Autowired CircuitBreakerRegistry circuitBreakerRegistry;

    @Test
    void circuitBreaker_shouldOpenAfterThresholdFailures() throws Exception {
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("inventoryService"); // {9}

        // Force circuit breaker to track failures (stub the HTTP call to fail)
        // Use WireMock in real tests; here we manually transition for demonstration
        for (int i = 0; i < 10; i++) {
            cb.onError(0, TimeUnit.NANOSECONDS, new IOException("Simulated failure"));
        }

        // After 10 failures (100% > 50% threshold), circuit should be OPEN
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);          // {18}

        // Next call should fast-fail with CallNotPermittedException
        assertThatThrownBy(() -> cb.executeSupplier(() -> "attempt"))
            .isInstanceOf(CallNotPermittedException.class);                       // {27}

        // Verify fallback was invoked (in a full integration test with WireMock)
    }

    @Test
    void circuitBreaker_shouldTransitionToHalfOpenAfterWaitDuration() {
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("inventoryService");
        cb.transitionToOpenState();   // ← programmatically open the circuit

        // Simulate wait duration elapsed
        cb.transitionToHalfOpenState();
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.HALF_OPEN);
    }
}
```

**Expected Output:**
```
Circuit state after 10 failures: OPEN
CallNotPermittedException thrown for next attempt (fast-fail confirmed)
```

---

## Example 6: Monitoring Circuit Breaker State via Actuator

```yaml title="application.yml"
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,circuitbreakers,circuitbreakerevents
  health:
    circuitbreakers:
      enabled: true
```

```bash
# Check circuit breaker state
curl http://localhost:8081/actuator/health
```

```json
{
  "status": "UP",
  "components": {
    "circuitBreakers": {
      "status": "UP",
      "details": {
        "inventoryService": {
          "status": "CIRCUIT_CLOSED",
          "details": {
            "failureRate": "10.0%",
            "slowCallRate": "0.0%",
            "bufferedCalls": 10,
            "failedCalls": 1,
            "state": "CLOSED"
          }
        }
      }
    }
  }
}
```

```bash
# Get last 10 circuit breaker events
curl http://localhost:8081/actuator/circuitbreakerevents/inventoryService
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `RateLimiter` to `InventoryServiceClient` that limits calls to 50 per second. Verify with an actuator endpoint.
2. **Medium**: Add a `Bulkhead` with `max-concurrent-calls: 5`. Write a test that fires 10 concurrent calls and verifies that 5 complete normally while 5 are rejected with `BulkheadFullException` (and the fallback returns `assumeInStock`).
3. **Hard**: Implement a scenario where the circuit breaker is open but you still want to check a **local cache** before returning the fallback. Modify `checkStockFallback` to first check Redis for a recently cached stock response; only return `assumeInStock` if the cache is empty too. This is called "stale data serving under degradation."

---

## Back to Topic

Return to the [Reliability Patterns](../reliability-patterns.md) note for theory, interview questions, and further reading.
