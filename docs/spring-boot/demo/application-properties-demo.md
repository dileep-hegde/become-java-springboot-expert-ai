---
id: application-properties-demo
title: "Application Properties — Practical Demo"
description: Hands-on examples for externalized configuration using profiles, @ConfigurationProperties, @Value, and startup validation in Spring Boot.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - spring-boot
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Application Properties — Practical Demo

> Hands-on examples for [Application Properties](../application-properties.md). Each example covers a realistic configuration pattern you will encounter in production Spring Boot projects.

:::info Prerequisites
Read the [Application Properties](../application-properties.md) note first — particularly the property source priority order and the `@ConfigurationProperties` vs `@Value` comparison.
:::

---

## Example 1: Profiles — Switching Config Between Environments

This example shows the multi-environment profile pattern: one base file, two profile overrides.

**Project layout:**

```
src/main/resources/
  application.yml          ← base (always loaded)
  application-dev.yml      ← dev overrides
  application-prod.yml     ← prod overrides
```

```yaml title="application.yml"
spring:
  application:
    name: order-service

server:
  port: 8080

app:
  datasource:
    url: jdbc:h2:mem:testdb          # ← default in-memory DB for local experiments
    pool-size: 5
```

```yaml title="application-dev.yml"
logging:
  level:
    com.example: DEBUG               # ← verbose logging only in dev
spring:
  datasource:
    show-sql: true
```

```yaml title="application-prod.yml"
server:
  port: 8443
spring:
  datasource:
    url: ${DB_URL}                   # ← injected from OS environment variable
    username: ${DB_USER}
    password: ${DB_PASS}
  jpa:
    show-sql: false                  # ← no SQL in prod logs
```

**Activate prod profile:**

```bash
# Run with prod profile active
java -jar order-service.jar --spring.profiles.active=prod
```

**Expected behavior**: `application-prod.yml` is loaded on top of `application.yml`. The `server.port` becomes 8443; datasource values come from env vars; `app.datasource.pool-size` (set only in base) stays 5.

:::tip Key takeaway
Profile files are additive overlays. Base values you don't override stay in effect. Only set values that differ per environment.
:::

---

## Example 2: `@ConfigurationProperties` with Nested Objects and Lists

A realistic payments configuration with nested objects and a list of allowed currencies:

```yaml title="application.yml"
payment:
  api-key: sk_test_abc123
  timeout-ms: 3000
  max-retries: 2
  base-url: https://api.stripe.com
  allowed-currencies:
    - USD
    - EUR
    - GBP
  retry:
    initial-delay-ms: 500
    multiplier: 2.0
```

```java title="PaymentProperties.java" showLineNumbers {1,2,18,19,20}
@ConfigurationProperties(prefix = "payment")             // ← binds everything under payment.*
@Component
@Validated                                               // ← enables JSR-303 validation at startup
public class PaymentProperties {

    @NotBlank                                            // ← startup fails if blank or missing
    private String apiKey;

    @Min(100) @Max(30000)
    private int timeoutMs = 3000;                        // ← field default as fallback

    private int maxRetries = 3;
    private String baseUrl;
    private List<String> allowedCurrencies = new ArrayList<>();
    private RetryConfig retry = new RetryConfig();       // ← nested object

    // --- nested class ---
    public static class RetryConfig {
        private int initialDelayMs = 500;
        private double multiplier = 2.0;
        // getters and setters
    }

    // getters and setters for all fields
}
```

```java title="PaymentService.java" showLineNumbers {5,10}
@Service
public class PaymentService {

    private final PaymentProperties config;              // ← injected like a normal bean

    public PaymentService(PaymentProperties config) {
        this.config = config;
    }

    public boolean isCurrencyAllowed(String currency) {
        return config.getAllowedCurrencies().contains(currency); // ← no hardcoded strings
    }
}
```

**Expected Output** — if `payment.api-key` is blank in any environment, startup fails with:

```
***************************
APPLICATION FAILED TO START
***************************
Description:
Binding to target org.springframework.validation.BeanPropertyBindingResult...
  Field error in object 'payment' on field 'apiKey': rejected value []; must not be blank
```

:::tip Key takeaway
`@Validated` on `@ConfigurationProperties` gives you self-documenting, fail-fast validation. The error message names the exact property and constraint — no more silent `null` values causing NPEs at runtime.
:::

---

## Example 3: `@Value` with Defaults and SpEL

For two one-off values in a utility bean:

```java title="FeatureFlags.java" showLineNumbers {5,9,14}
@Component
public class FeatureFlags {

    @Value("${feature.new-checkout:false}")              // ← default false if property is absent
    private boolean newCheckoutEnabled;

    @Value("${feature.max-items:100}")
    private int maxItemsPerOrder;

    @Value("#{${feature.max-items:100} * 2}")            // ← SpEL: double the max for admins
    private int adminMaxItemsPerOrder;

    public boolean isNewCheckoutEnabled() {
        return newCheckoutEnabled;
    }
}
```

```properties title="application-prod.properties"
feature.new-checkout=true
feature.max-items=50
```

**Expected behavior in prod**: `newCheckoutEnabled` = `true`, `maxItemsPerOrder` = `50`, `adminMaxItemsPerOrder` = `100` (SpEL evaluated at startup).

:::warning Common Mistake
`@Value("${missing.key}")` with no default (`:{value}`) throws `IllegalArgumentException` at context startup if the property is absent. Always add a default for optional properties.
:::

---

## Example 4: Overriding Config in Tests

Use `@TestPropertySource` to override specific values for one test class without affecting the main config:

```java title="PaymentServiceTest.java" showLineNumbers {2,3}
@SpringBootTest
@TestPropertySource(properties = {
    "payment.timeout-ms=100",            // ← fast timeout to avoid slow tests
    "payment.max-retries=1"
})
class PaymentServiceTest {

    @Autowired
    private PaymentProperties config;

    @Test
    void timeoutShouldBeOverriddenForTest() {
        assertThat(config.getTimeoutMs()).isEqualTo(100);  // ← confirm override applied
    }
}
```

**Alternative** — inline YAML block in the test annotation:

```java title="AnonymousConfigTest.java"
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:testdb")
class AnonymousConfigTest { ... }
```

:::tip Key takeaway
Never modify `application.properties` for tests. Use `@TestPropertySource` or the `properties =` attribute to keep test config isolated from production config.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a custom property `app.greeting=Hello` to `application.properties` and inject it with `@Value`. Add a dev profile file that overrides it to `Hello (DEV)`. Verify that activating the `dev` profile changes the injected value.
2. **Medium**: Create a `@ConfigurationProperties` class for a `notification.*` namespace with fields `provider` (String), `fromAddress` (String, `@Email` constraint), and `retryCount` (int, `@Min(0)`). Test that startup fails when `fromAddress` is missing.
3. **Hard**: Write a `@SpringBootTest` integration test that uses `@DynamicPropertySource` to override `spring.datasource.url` at runtime (simulating what Testcontainers does). Verify the injected `DataSource` URL matches what you set.

---

## Back to Topic

Return to the [Application Properties](../application-properties.md) note for theory, interview questions, and further reading.
