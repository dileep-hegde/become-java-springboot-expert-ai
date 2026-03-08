---
id: application-properties
title: Application Properties & Configuration
description: How Spring Boot externalizes configuration using application.properties/yml, profiles, @Value, and @ConfigurationProperties for structured, type-safe config binding.
sidebar_position: 3
tags:
  - spring-boot
  - intermediate
  - config
  - configuration
  - profiles
  - properties
last_updated: 2026-03-08
sources:
  - https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html
  - https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config
  - https://www.baeldung.com/spring-value-annotation
  - https://www.baeldung.com/configuration-properties-in-spring-boot
---

# Application Properties & Configuration

> Spring Boot reads configuration from many sources — files, environment variables, system properties, command-line args — and makes all of it available through a unified `Environment` abstraction, without any code change to switch between environments.

## What Problem Does It Solve?

Applications need different settings in different environments: a local database URL differs from the production one; a payments service has a different API key in staging. Before Spring Boot's externalized configuration model, teams either hard-coded values, maintained multiple build artifacts, or wrote custom `PropertyPlaceholderConfigurer` beans.

Spring Boot solves this with a **priority-ordered property source chain**: the same application binary runs in any environment by changing only the environment's configuration, not the code.

## How Property Sources Work

Spring Boot evaluates property sources in a strict priority order. A value from a higher-priority source *overrides* the same key from a lower-priority source:

```mermaid
flowchart TD
    A(["Command-line args<br>--server.port=9090"]) --> Z
    B(["OS env vars<br>SERVER_PORT=9090"]) --> Z
    C(["JVM system props<br>-Dserver.port=9090"]) --> Z
    D(["application-prod.properties"]) --> Z
    E(["application.properties"]) --> Z
    F(["@PropertySource annotations"]) --> Z
    Z(["Spring Environment"])

    classDef userClass fill:#f5a623,color:#fff,stroke:#c77d00
    classDef springClass fill:#6db33f,color:#fff,stroke:#4a7c2a
    class A,B,C userClass
    class D,E,F,Z springClass
```

*Priority flows top to bottom — command-line args win over everything; file-based config wins over code-level defaults.*

The full priority list (abbreviated — highest first):

1. Command-line arguments (`--key=value`)
2. `SPRING_APPLICATION_JSON` environment variable
3. OS environment variables
4. JVM system properties (`-Dkey=value`)
5. `application-{profile}.properties` inside the jar
6. `application.properties` / `application.yml` inside the jar
7. `@PropertySource` on `@Configuration` classes
8. Default property values (set programmatically)

## `application.properties` vs `application.yml`

Both formats are equivalent — Spring Boot supports either. YAML is preferred for hierarchical config because it avoids key repetition:

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=app
spring.datasource.password=secret
spring.datasource.hikari.maximum-pool-size=10
```

```yaml
# application.yml — same values, hierarchical format
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: app
    password: secret
    hikari:
      maximum-pool-size: 10
```

:::info
You can use both files simultaneously. Spring Boot merges them; if the same key appears in both, `application.properties` wins over `application.yml`.
:::

## Profiles

Profiles let you activate environment-specific configuration. A profile-specific file named `application-{profile}.properties` (or `.yml`) is loaded **in addition to** the base `application.properties` and its values override the base.

```yaml
# application.yml (base — always loaded)
server:
  port: 8080
spring:
  datasource:
    url: jdbc:h2:mem:testdb   # default in-memory DB for local dev

---
# application-prod.yml (loaded only when prod profile is active)
spring:
  datasource:
    url: jdbc:postgresql://prod-host:5432/proddb
    username: ${DB_USER}       # ← reads from env variable
    password: ${DB_PASS}
```

Activate a profile:

```bash
# Command-line
java -jar app.jar --spring.profiles.active=prod

# Environment variable
SPRING_PROFILES_ACTIVE=prod java -jar app.jar

# application.properties (for local dev default)
spring.profiles.active=dev
```

Spring Boot 2.4+ supports multi-document YAML files (using `---` separators) with `spring.config.activate.on-profile`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb

---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: jdbc:postgresql://prod-host/proddb
```

## Reading Properties: `@Value` vs `@ConfigurationProperties`

Spring Boot offers two ways to inject configuration into your beans.

### `@Value` — single-property injection

Use for one-off injections where you need a single value:

```java
@Component
public class PaymentService {

    @Value("${payment.api-key}")                  // ← injects the value of payment.api-key
    private String apiKey;

    @Value("${payment.timeout:5000}")             // ← injects with a default of 5000 if property is absent
    private int timeoutMs;
}
```

`@Value` supports SpEL expressions:

```java
@Value("#{${payment.timeout:5000} / 1000}")      // ← SpEL: convert ms to seconds
private int timeoutSeconds;
```

### `@ConfigurationProperties` — structured, type-safe binding

Use for a group of related properties. Spring Boot binds the entire namespace to a POJO:

```yaml
# application.yml
payment:
  api-key: sk_live_abc123
  timeout-ms: 5000
  max-retries: 3
  base-url: https://api.payments.example.com
```

```java
@ConfigurationProperties(prefix = "payment")     // ← binds everything under payment.*
@Component                                        // ← or use @EnableConfigurationProperties on a @Configuration
public class PaymentProperties {

    private String apiKey;                        // ← maps to payment.api-key (relaxed binding)
    private int timeoutMs;
    private int maxRetries;
    private String baseUrl;

    // standard getters and setters required for binding
}
```

```java
@Service
public class PaymentService {

    private final PaymentProperties props;

    public PaymentService(PaymentProperties props) {  // ← injected like any other bean
        this.props = props;
    }

    public void pay() {
        // use props.getApiKey(), props.getTimeoutMs(), etc.
    }
}
```

**Relaxed binding**: Spring Boot maps property names flexibly. `payment.api-key`, `payment.apiKey`, `PAYMENT_API_KEY`, and `payment.api_key` all bind to the same `apiKey` field.

### Comparison: `@Value` vs `@ConfigurationProperties`

| Feature | `@Value` | `@ConfigurationProperties` |
|---|---|---|
| Syntax | `@Value("${key}")` | `@ConfigurationProperties(prefix)` |
| Best for | Single values, SpEL expressions | Groups of related properties |
| Type safety | No (string injection) | Yes (bound to POJO fields) |
| Default values | `${key:default}` syntax | Java field initializer |
| Validation | No | Yes — add `@Validated` + JSR-303 |
| Refactoring | Fragile (string keys) | Safe (Java fields) |
| Metadata auto-complete | Limited | Full IDE support with annotation processor |

### Validation with `@ConfigurationProperties`

Add `@Validated` and standard Bean Validation constraints to fail fast on startup with bad config:

```java
@ConfigurationProperties(prefix = "payment")
@Component
@Validated                                        // ← enables JSR-303 validation on startup
public class PaymentProperties {

    @NotBlank                                     // ← app will refuse to start if blank
    private String apiKey;

    @Min(100) @Max(60000)
    private int timeoutMs = 5000;

    // getters and setters
}
```

If `payment.api-key` is missing or blank, startup fails with a clear error message — far better than a NullPointerException at runtime.

## Code Examples

### Encrypting sensitive properties

Never put plaintext passwords in `application.yml`. Reference environment variables instead:

```yaml
spring:
  datasource:
    password: ${DB_PASSWORD}    # ← resolved from OS env var at runtime
```

Or use Spring Cloud Config / Vault for centralized secrets management in production.

### Programmatic access to properties

Sometimes you need properties outside a Spring bean (e.g., in a utility class). Use `Environment`:

```java
@Component
public class ConfigPrinter {

    private final Environment env;

    public ConfigPrinter(Environment env) {
        this.env = env;
    }

    public void printPort() {
        String port = env.getProperty("server.port", "8080"); // ← second arg is default
        System.out.println("Running on: " + port);
    }
}
```

### Configuration metadata for IDE auto-complete

Add the annotation processor to generate `spring-configuration-metadata.json`, which gives IDEs full auto-complete for your custom properties:

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>   <!-- ← optional: only a compile-time tool, not runtime -->
</dependency>
```

## Best Practices

- **Prefer `@ConfigurationProperties` over `@Value`** for any group of related properties — it is type-safe, testable, and refactorable.
- **Provide sensible defaults** directly in the Java POJO field initializer or YAML base file; override only in environment-specific files.
- **Never commit secrets** — use `${ENV_VAR}` placeholders in YAML and inject real values from the environment or a secrets manager.
- **Validate config on startup** with `@Validated` — a clear startup error is better than a cryptic runtime failure.
- **Use profiles consistently** — `dev`, `test`, `prod` are conventional Spring profile names; stick to them.
- **Add the configuration processor** to your pom.xml as `<optional>true</optional>` to unlock IDE auto-complete without adding a runtime dependency.
- **Avoid `@PropertySource` for YAML** — `@PropertySource` does not natively support YAML files; use Spring Boot's built-in loading for `.yml`.

## Common Pitfalls

**`@Value` with no matching property and no default crashes on startup**
`@Value("${missing.key}")` throws `IllegalArgumentException` at context creation time. Always provide a default: `@Value("${missing.key:fallback}")` or use `@ConfigurationProperties` with a field default.

**Profile not activating because of whitespace**
`spring.profiles.active= prod` (leading space) silently creates a profile named `" prod"` — check for whitespace in property files.

**YAML parsing fails on unquoted special characters**
Values with colons, brackets, or percent signs break YAML syntax. Wrap them in quotes:
```yaml
server:
  error:
    path: "/error"       # ← quote values that start with special chars
```

**`@ConfigurationProperties` fields not binding**
Missing getters/setters is the most common cause. If using records or constructor binding, make sure to add `@ConstructorBinding` (Spring Boot 2) or that the class has exactly one constructor (Spring Boot 3 auto-detects it).

**Property overrides not working as expected**
Remember the priority order. An OS environment variable `SERVER_PORT=9000` overrides `server.port=8080` in `application.properties`. Log the conditions report or inject `Environment` and call `env.getProperty()` to see the resolved value.

:::warning
Never enable `spring.jpa.show-sql=true` or `debug=true` in production — both flood logs with sensitive query and configuration data that could be captured by log aggregation tools.
:::

## Interview Questions

### Beginner

**Q:** What is the difference between `application.properties` and `application.yml`?
**A:** They are two different formats for the same purpose — externalizing Spring Boot configuration. Both are loaded by default; properties is flat key-value pairs, YAML supports hierarchical nesting. YAML is generally preferred for readability when there are many nested keys. If both files exist, they are merged and properties-format values win on conflict.

**Q:** How do you activate a Spring profile?
**A:** Set `spring.profiles.active` — via command-line (`--spring.profiles.active=prod`), environment variable (`SPRING_PROFILES_ACTIVE=prod`), or as a property in `application.properties`. Profile-specific files like `application-prod.properties` are then loaded on top of the base config.

### Intermediate

**Q:** When would you use `@ConfigurationProperties` over `@Value`?
**A:** Use `@ConfigurationProperties` when you have a group of related properties that belong to a single concept (like `payment.*` settings). It gives you type safety, IDE auto-complete, startup validation via `@Validated`, and easy refactoring by renaming Java fields. Use `@Value` only for a single injected value or when you need a SpEL expression.

**Q:** How does relaxed binding work in `@ConfigurationProperties`?
**A:** Spring Boot normalizes property names before matching them to POJO fields. `payment.api-key`, `payment.apiKey`, `PAYMENT_API_KEY`, and `payment.api_key` all bind to the Java field `apiKey`. This lets you use OS-friendly env var syntax (all caps, underscores) while your Java code uses camelCase.

**Q:** How do you add startup validation for a missing required property?
**A:** Add `@Validated` to the `@ConfigurationProperties` class and annotate fields with Bean Validation constraints (`@NotBlank`, `@Min`, etc.). Spring Boot evaluates constraints at startup and throws a descriptive `BindException` if any constraint fails — far better than a NullPointerException in a live request.

### Advanced

**Q:** Explain the property source priority order and give an example of how it helps in CD pipelines.
**A:** Spring Boot evaluates sources in priority order: command-line args beat env vars, which beat system properties, which beat profile-specific files, which beat the base `application.properties`. In a CD pipeline, the base file ships in the jar with development defaults. The production server sets `SPRING_DATASOURCE_URL` and `SPRING_PROFILES_ACTIVE=prod` as environment variables. No code or file changes are needed — the env vars override the jar's defaults at runtime, satisfying the 12-Factor App principle of environment-based config.

**Q:** How does Spring Boot handle multi-document YAML with `spring.config.activate.on-profile`?
**A:** Spring Boot 2.4+ supports multiple documents in a single YAML file separated by `---`. Each document can have a `spring.config.activate.on-profile` key that restricts its loading to specific active profiles. This collapses what used to be separate `application-{profile}.yml` files into a single file, which is convenient for small projects but can become noisy for large configurations — separate files are recommended at scale.

## Further Reading

- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config) — official reference with the complete priority order and all supported source types
- [Common Application Properties](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html) — full list of all built-in Spring Boot properties and their defaults
- [Baeldung: @ConfigurationProperties Guide](https://www.baeldung.com/configuration-properties-in-spring-boot) — practical guide including constructor binding and metadata generation

## Related Notes

- [Auto-Configuration](./auto-configuration.md) — auto-configuration classes bind their defaults from `@ConfigurationProperties`; overriding a Spring Boot default is done by setting the corresponding property
- [Spring Boot Starters](./spring-boot-starters.md) — each starter enables auto-config that reads from a specific property namespace (e.g., `spring.datasource.*` for the data starter)
- [Spring Boot Testing](./spring-boot-testing.md) — `@TestPropertySource` and per-test YAML blocks let you override properties in integration tests without touching the main config files
