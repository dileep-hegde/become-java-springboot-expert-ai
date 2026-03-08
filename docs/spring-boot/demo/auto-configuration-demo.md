---
id: auto-configuration-demo
title: "Auto-Configuration — Practical Demo"
description: Hands-on examples showing how Spring Boot auto-configuration works, how to observe it, override it, and write your own.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - spring-boot
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Auto-Configuration — Practical Demo

> Hands-on examples for [Auto-Configuration](../auto-configuration.md). Each example builds on the last — from observing built-in auto-config, to overriding it, to writing your own.

:::info Prerequisites
Read the [Auto-Configuration](../auto-configuration.md) note first — particularly the `@ConditionalOn*` conditions section — before working through these examples.
:::

---

## Example 1: Reading the Conditions Evaluation Report

The fastest way to understand what ran and what was skipped is to turn on the conditions report at startup.

**Step 1** — Add this to `src/main/resources/application.properties`:

```properties title="application.properties"
debug=true
```

**Step 2** — Run your Spring Boot app. The console output includes:

```
============================
CONDITIONS EVALUATION REPORT
============================

Positive matches:
-----------------
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType'
      - @ConditionalOnMissingBean (types: javax.sql.DataSource,...) did not find any beans

   JacksonAutoConfiguration matched:
      - @ConditionalOnClass found required class 'com.fasterxml.jackson.databind.ObjectMapper'

Negative matches:
-----------------
   MongoAutoConfiguration:
      - Did not match:
          - @ConditionalOnClass did not find required class 'com.mongodb.MongoClient' (OnClassCondition)
```

:::tip Key takeaway
Every line in **Negative matches** is an auto-configuration that Spring Boot considered but skipped. Each skip has a reason — this report is your first tool when a bean is unexpectedly missing.
:::

---

## Example 2: Disabling an Auto-Configuration

You have `spring-boot-starter-data-jpa` on the classpath but this particular service should not connect to a database.

**Option A — Via `application.properties` (preferred, no recompile):**

```properties title="application.properties"
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
  org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration
```

**Option B — Via annotation (if you control the main class):**

```java title="Application.java" showLineNumbers {2-5}
@SpringBootApplication(
    exclude = {                                                    // ← exclude by class reference
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
    }
)
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Expected Output** — The conditions report now shows both classes in **Exclusions**:

```
Exclusions:
-----------
   org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
   org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration
```

:::warning Common Mistake
Excluding `DataSourceAutoConfiguration` alone without excluding `HibernateJpaAutoConfiguration` still causes a startup failure — Hibernate tries to find a `DataSource` bean and fails. Always exclude the full dependency chain.
:::

---

## Example 3: Overriding an Auto-Configured Bean

The `JacksonAutoConfiguration` creates a default `ObjectMapper`. You need custom serialization (snake_case output). Define your own `@Bean` — `@ConditionalOnMissingBean` backs off automatically.

```java title="JacksonConfig.java" showLineNumbers {1,7-11}
@Configuration                                             // ← Spring picks this up on startup
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {                   // ← your custom ObjectMapper bean
        return JsonMapper.builder()
            .propertyNamingStrategy(
                PropertyNamingStrategies.SNAKE_CASE)       // ← output: user_name instead of userName
            .serializationInclusion(
                JsonInclude.Include.NON_NULL)              // ← skip null fields in output
            .build();
    }
}
```

**Verify** — Add this to a `@SpringBootTest` integration test:

```java title="JacksonConfigTest.java" showLineNumbers {5,10}
@SpringBootTest
class JacksonConfigTest {

    @Autowired
    private ObjectMapper objectMapper;                     // ← should be YOUR custom bean

    @Test
    void objectMapper_shouldUseSnakeCase() throws JsonProcessingException {
        record User(String firstName, String lastName) {}
        String json = objectMapper.writeValueAsString(new User("Alice", "Smith"));
        assertThat(json).contains("first_name");           // ← confirms your config is used
        assertThat(json).contains("last_name");
    }
}
```

**Expected Output:**

```json
{"first_name":"Alice","last_name":"Smith"}
```

:::tip Key takeaway
You never need to touch `JacksonAutoConfiguration`. Just define your `@Bean` and the `@ConditionalOnMissingBean` guard on the auto-config steps aside. This pattern works for any auto-configured bean.
:::

---

## Example 4: Writing a Minimal Custom Auto-Configuration

Imagine you maintain an internal `AuditClient` library. You want consuming Spring Boot apps to get a working `AuditClient` bean with zero configuration.

**Step 1 — The auto-configuration class:**

```java title="AuditClientAutoConfiguration.java" showLineNumbers {1,2,3,4}
@AutoConfiguration                                         // ← Spring Boot 3: marks this as auto-config
@ConditionalOnClass(AuditClient.class)                    // ← only if the library is on the classpath
@ConditionalOnMissingBean(AuditClient.class)              // ← back-off if user defined their own
@EnableConfigurationProperties(AuditClientProperties.class)
public class AuditClientAutoConfiguration {

    @Bean
    public AuditClient auditClient(AuditClientProperties props) {
        return new AuditClient(props.getEndpoint(), props.getApiKey());
    }
}
```

**Step 2 — The properties class:**

```java title="AuditClientProperties.java" showLineNumbers {1}
@ConfigurationProperties(prefix = "audit")               // ← binds audit.endpoint and audit.api-key
public class AuditClientProperties {

    private String endpoint = "https://audit.internal";  // ← sensible default
    private String apiKey;

    // getters and setters
}
```

**Step 3 — Register it** in `src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`:

```
com.example.audit.AuditClientAutoConfiguration
```

**Step 4 — Consuming app** needs only to set the API key:

```properties title="application.properties (in the consuming app)"
audit.api-key=abc-secret-123
# Override endpoint only if different from default:
# audit.endpoint=https://custom-audit.example.com
```

**Expected result in consuming app's conditions report:**

```
Positive matches:
-----------------
   AuditClientAutoConfiguration matched:
      - @ConditionalOnClass found required class 'com.example.audit.AuditClient'
      - @ConditionalOnMissingBean (types: com.example.audit.AuditClient,...) did not find any beans
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add `spring-boot-starter-web` to a project and search the conditions report for `DispatcherServletAutoConfiguration`. List all conditions it checked.
2. **Medium**: Create a `DataSource` `@Bean` in a `@Configuration` class and re-run the app. Confirm in the conditions report that `DataSourceAutoConfiguration` moved to **Negative matches** under `@ConditionalOnMissingBean`.
3. **Hard**: Write a custom auto-configuration for a `RateLimiter` bean (from the Resilience4j library). Guard it with `@ConditionalOnClass(RateLimiter.class)` and `@ConditionalOnProperty(name = "ratelimit.enabled", havingValue = "true")`. Register it and verify it activates only when both conditions are met.

---

## Back to Topic

Return to the [Auto-Configuration](../auto-configuration.md) note for theory, interview questions, and further reading.
