---
id: actuator-demo
title: "Spring Boot Actuator — Practical Demo"
description: Hands-on examples for enabling and securing Actuator endpoints, writing custom health indicators, and exporting metrics with Micrometer/Prometheus.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - spring-boot
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Spring Boot Actuator — Practical Demo

> Hands-on examples for [Spring Boot Actuator](../actuator.md). From exposing the first endpoints to writing custom health indicators and exporting Prometheus metrics.

:::info Prerequisites
Read the [Actuator](../actuator.md) note first — particularly the "enabled vs exposed" distinction and the Micrometer integration section.
:::

---

## Example 1: Setting Up Actuator and Exploring Endpoints

**Step 1** — Add the starter:

```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**Step 2** — Expose the endpoints you need and run on a dedicated management port:

```yaml title="application.yml"
management:
  server:
    port: 8081                              # ← management on separate port; firewall from public
  endpoints:
    web:
      exposure:
        include: health,info,metrics,loggers,conditions
  endpoint:
    health:
      show-details: always                  # ← for local dev; use when-authorized in prod
```

**Step 3** — Start the app and explore:

```bash
# List all exposed endpoints
curl http://localhost:8081/actuator

# Full health with component details
curl http://localhost:8081/actuator/health

# List available metrics
curl http://localhost:8081/actuator/metrics

# Query a specific metric
curl "http://localhost:8081/actuator/metrics/jvm.memory.used?tag=area:heap"
```

**Expected `/actuator/health` response:**

```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP", "details": {"database": "H2", "validationQuery": "isValid()"}},
    "diskSpace": {"status": "UP", "details": {"total": 499963174912, "free": 123456789, "threshold": 10485760}},
    "ping": {"status": "UP"}
  }
}
```

:::tip Key takeaway
The hypermedia index at `/actuator` shows all exposed endpoints. Start there when debugging — if an endpoint isn't listed, it is either not enabled or not exposed.
:::

---

## Example 2: Writing a Custom Health Indicator

Your service depends on an external payment gateway. Add its health to the aggregate:

```java title="PaymentGatewayHealthIndicator.java" showLineNumbers {1,2,9,14,18}
@Component                                               // ← Spring auto-discovers HealthIndicator beans
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    private final PaymentGatewayClient client;

    public PaymentGatewayHealthIndicator(PaymentGatewayClient client) {
        this.client = client;
    }

    @Override
    public Health health() {
        try {
            boolean ok = client.ping();                  // ← call your real dependency check
            if (ok) {
                return Health.up()
                    .withDetail("host", "payments.example.com")
                    .withDetail("latencyMs", client.lastPingLatencyMs())
                    .build();                            // ← UP with monitoring details
            }
            return Health.down()
                .withDetail("reason", "ping returned false")
                .build();
        } catch (Exception ex) {
            return Health.down(ex).build();              // ← DOWN with exception details
        }
    }
}
```

**Expected health response with this indicator:**

```json
{
  "status": "UP",
  "components": {
    "paymentGateway": {
      "status": "UP",
      "details": {"host": "payments.example.com", "latencyMs": 42}
    },
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

If `client.ping()` throws, the response becomes `"status": "DOWN"` and the load balancer stops routing traffic to this instance.

---

## Example 3: Changing a Log Level at Runtime

Without restarting, switch a noisy package to DEBUG during a live incident:

```bash
# Check the current log level for the payment package
curl http://localhost:8081/actuator/loggers/com.example.payment

# Response:
# {"configuredLevel": null, "effectiveLevel": "INFO"}

# Change to DEBUG (POST with JSON body)
curl -X POST http://localhost:8081/actuator/loggers/com.example.payment \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel":"DEBUG"}'

# Verify:
curl http://localhost:8081/actuator/loggers/com.example.payment
# {"configuredLevel": "DEBUG", "effectiveLevel": "DEBUG"}

# Reset to original (set to null to inherit parent)
curl -X POST http://localhost:8081/actuator/loggers/com.example.payment \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel":null}'
```

:::warning Common Mistake
Log level changes via Actuator are **in-memory only**. A restart resets all levels to their configured values. Do not rely on this as a permanent fix — update the actual configuration file or logging config for persistent changes.
:::

---

## Example 4: Exporting Metrics to Prometheus

**Step 1** — Add the Prometheus Micrometer registry:

```xml title="pom.xml"
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>  <!-- ← no version: managed by Spring Boot BOM -->
</dependency>
```

**Step 2** — Expose the prometheus endpoint:

```yaml title="application.yml"
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
```

**Step 3** — Add custom business metrics in your service:

```java title="OrderService.java" showLineNumbers {5,6,10,16,20}
@Service
public class OrderService {

    private final Counter ordersPlaced;
    private final Timer orderProcessingTime;             // ← timer for latency

    public OrderService(MeterRegistry registry) {
        this.ordersPlaced = Counter.builder("orders.placed")
            .description("Total number of orders placed")
            .tag("region", "eu-west")                    // ← tags for dashboard filtering
            .register(registry);

        this.orderProcessingTime = Timer.builder("orders.processing.duration")
            .description("Order processing latency")
            .register(registry);
    }

    public Order placeOrder(OrderRequest request) {
        return orderProcessingTime.record(() -> {        // ← wrap the timed operation
            Order order = processOrder(request);
            ordersPlaced.increment();                    // ← record each order
            return order;
        });
    }
}
```

**Step 4** — Scrape the Prometheus endpoint:

```bash
curl http://localhost:8081/actuator/prometheus | grep orders
```

**Expected output (Prometheus exposition format):**

```
# HELP orders_placed_total Total number of orders placed
# TYPE orders_placed_total counter
orders_placed_total{region="eu-west"} 42.0

# HELP orders_processing_duration_seconds Order processing latency
# TYPE orders_processing_duration_seconds summary
orders_processing_duration_seconds_count 42.0
orders_processing_duration_seconds_sum 1.234567
```

Configure Prometheus to scrape `http://your-app:8081/actuator/prometheus` on a 15-second interval to collect these metrics automatically.

---

## Example 5: Securing Actuator with Spring Security

In production, only internal monitoring should reach the management endpoints:

```java title="ActuatorSecurityConfig.java" showLineNumbers {6,9,11,13}
@Configuration
public class ActuatorSecurityConfig {

    @Bean
    @Order(1)                                                        // ← higher priority than app security
    public SecurityFilterChain actuatorSecurity(HttpSecurity http) throws Exception {
        http
            .securityMatcher(EndpointRequest.toAnyEndpoint())       // ← targets ONLY /actuator/**
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(EndpointRequest.to("health", "info"))
                    .permitAll()                                     // ← health + info: allow unauthenticated
                .anyRequest()
                    .hasRole("ACTUATOR_ADMIN")                      // ← all other endpoints: admin only
            )
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
```

```yaml title="application-prod.yml"
management:
  server:
    port: 8081
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus   # ← explicit allowlist; nothing else
```

:::danger
Never expose `/actuator/env` without authentication in production. It lists all resolved properties including those loaded from environment variables — which may contain database passwords, API keys, and JWT secrets.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Start a Spring Boot app with Actuator. Use `curl http://localhost:8080/actuator/beans` (after exposing it) to find the bean name of the auto-configured `ObjectMapper`. Count how many beans are registered in a minimal web app.
2. **Medium**: Write a `HealthIndicator` that checks whether an external URL is reachable (e.g., using `RestTemplate` to GET `https://httpbin.org/status/200`). Returns `DOWN` if the call throws an exception or returns a non-2xx status.
3. **Hard**: Add `micrometer-registry-prometheus` and a `Timer` to a service method. Use `@SpringBootTest` + `TestRestTemplate` to call the endpoint 5 times, then assert via `GET /actuator/metrics/your.timer.name` that `count` equals 5.

---

## Back to Topic

Return to the [Actuator](../actuator.md) note for theory, interview questions, and further reading.
