---
id: spring-boot-interview-prep
title: Spring Boot Interview Questions
description: Consolidated interview Q&A for Spring Boot covering auto-configuration, properties, starters, Actuator, and testing — beginner through advanced.
sidebar_position: 12
tags:
  - interview-prep
  - spring-boot
  - auto-configuration
  - testing
  - actuator
last_updated: 2026-03-08
---

# Spring Boot Interview Questions

> Consolidated Q&A for Spring Boot. Use for rapid revision before backend interviews. Topics cover auto-configuration, application properties, starters, Actuator, and testing.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles
- **Advanced** questions signal senior-level depth (5+ YOE)

---

## Beginner

### Q: What is Spring Boot and how does it differ from the Spring Framework?

Spring Boot is an opinionated extension of the Spring Framework that eliminates boilerplate configuration through auto-configuration. The Spring Framework provides the IoC container, AOP, and all the building blocks; Spring Boot adds `@ConditionalOn*`-driven auto-configuration, embedded servers, starters, and Actuator on top. You write the same Spring beans, but Boot wires them for you based on what is on the classpath.

### Q: What does `@SpringBootApplication` do?

It is a composed annotation that combines three annotations: `@SpringBootConfiguration` (marks the class as a config source), `@EnableAutoConfiguration` (triggers auto-configuration loading), and `@ComponentScan` (scans the current package and sub-packages for `@Component` beans). The main class annotated with it is the entry point that `SpringApplication.run()` uses to bootstrap the context.

### Q: What is a Spring Boot starter?

A starter is a Maven/Gradle module containing almost no Java code — it is a POM that pulls in a curated, version-compatible set of library dependencies under a single coordinate. Adding `spring-boot-starter-web` brings in Spring MVC, embedded Tomcat, Jackson, and validation. The resulting classpath additions satisfy `@ConditionalOnClass` conditions that trigger the matching auto-configurations.

### Q: What is `application.properties` and what can you configure in it?

`application.properties` (or `application.yml`) is the primary externalized configuration file. You can configure the server port, datasource URL, JPA settings, logging levels, custom application properties, and property values for any auto-configuration. It is read automatically by Spring Boot — no explicit `@PropertySource` needed. Profile-specific files (`application-prod.properties`) override the base file for specific environments.

### Q: What is the default port for a Spring Boot web application?

Port 8080. Change it with `server.port=9090` in `application.properties`, through the environment variable `SERVER_PORT=9090`, or via the command-line argument `--server.port=9090`.

### Q: What does the `/actuator/health` endpoint return?

An HTTP 200 response with a JSON body containing `{"status":"UP"}` when the application and all health contributors are healthy. When `management.endpoint.health.show-details` is set to `always` or `when-authorized`, it also includes per-component details: database connectivity, disk space, cache connections, and any custom `HealthIndicator` beans.

---

## Intermediate

### Q: How does auto-configuration work?

Spring Boot loads candidates from `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (Spring Boot 3) via `AutoConfigurationImportSelector`. Each candidate is a `@Configuration` class guarded by one or more `@ConditionalOn*` annotations. If all conditions on a class pass (class on classpath, bean not already defined, property has a specific value), that configuration class runs and registers its beans. Failing configurations are silently skipped. Running with `debug=true` prints the full conditions evaluation report.

### Q: What is the difference between `@ConditionalOnClass` and `@ConditionalOnMissingBean`?

`@ConditionalOnClass` checks the classpath — the configuration activates only if the specified class is present. It is evaluated at startup before any beans are instantiated. `@ConditionalOnMissingBean` checks the application context — the configuration activates only if no bean of the given type has been registered yet. Libraries use `@ConditionalOnMissingBean` as a back-off guard: if the user declares their own bean, the library's auto-configured default steps aside.

### Q: When should you use `@ConfigurationProperties` instead of `@Value`?

Use `@ConfigurationProperties` for any group of related settings under a common prefix (e.g., `payment.*`). It is type-safe, IDE auto-completable, testable, and can be validated with `@Validated` + JSR-303 constraints. Use `@Value` only for injecting a single value or when a SpEL expression is needed. Scattering `@Value("${some.key}")` across many classes creates brittle, hard-to-refactor code.

### Q: How do Spring Boot profiles work?

Setting `spring.profiles.active=prod` activates the `prod` profile. Spring Boot then loads `application-prod.properties` (or `.yml`) on top of the base `application.properties`, with profile-specific values overriding the base. Multiple profiles can be active simultaneously. The conventional profile names are `dev`, `test`, and `prod`. Profiles can also activate or deactivate `@Component`, `@Bean`, and `@Configuration` classes via `@Profile("prod")`.

### Q: What is the difference between `@WebMvcTest` and `@SpringBootTest`?

`@WebMvcTest` loads only the Spring MVC layer — controllers, filters, exception handlers, and `MockMvc`. Services and repositories are not loaded and must be mocked with `@MockBean`. It starts in milliseconds and is appropriate for testing HTTP request/response behavior. `@SpringBootTest` loads the full `ApplicationContext` with all auto-configurations. It is slower but necessary when multiple layers must interact or when testing the actual wiring of the application.

### Q: What is `@MockBean` and how does it differ from Mockito's `@Mock`?

`@MockBean` creates a Mockito mock and registers it as a bean in the Spring `ApplicationContext`, replacing any existing bean of that type. When a `@Service` injects a `Repository`, using `@MockBean` on the repository replaces the real one in the context so the controller test doesn't need a database. `@Mock` (plain Mockito) creates a mock but has no knowledge of the Spring context — beans receiving `@Mock`-annotated fields would not be injected automatically.

### Q: How do you expose additional Actuator endpoints?

By default only `health` is exposed over HTTP. Add others via:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,loggers
```

Use `include: "*"` to expose all endpoints, but restrict access with Spring Security in production. Sensitive endpoints like `env`, `beans`, and `heapdump` should require authentication.

### Q: How do you disable a specific auto-configuration?

Two options. Code: `@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})`. Property (preferred): `spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration`. The property approach avoids code changes and can be toggled per environment.

---

## Advanced

### Q: Explain the ApplicationContext caching strategy in Spring Boot tests and how it affects test suite performance.

Spring's `SmartContextLoader` caches `ApplicationContext` instances keyed by their configuration fingerprint: the set of `@Configuration` classes, `@TestPropertySource` values, active profiles, and `@MockBean` types. When two test classes share identical fingerprints, they reuse the same cached context — startup runs only once. Adding or removing one `@MockBean` creates a different fingerprint and a new context. In a large suite, proliferating `@MockBean` combinations can multiply context startups from 1 to 50+. Mitigation: centralize common mock sets in a base test class, so identical fingerprints are preserved.

### Q: How would you implement a custom auto-configuration for an internal library?

Create two modules: `mylib-autoconfigure` (contains the `@AutoConfiguration` class and `@ConfigurationProperties`) and `mylib-spring-boot-starter` (a POM-only module that depends on `mylib-autoconfigure` and `mylib` core). In the autoconfigure module, write a class annotated `@AutoConfiguration` with `@ConditionalOnClass(MyService.class)` and `@ConditionalOnMissingBean(MyService.class)`. Register it in `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`. Consumers add the starter coordinate; their classpath triggers the condition, and a default `MyService` bean is created unless they define their own.

**Follow-up:** What is the purpose of `@ConditionalOnMissingBean` in a library auto-configuration?
**A:** It is the back-off guard. If the consuming application defines its own `MyService` bean (in a `@Configuration` or as a `@Component`), `@ConditionalOnMissingBean` detects it and skips the library's default, avoiding a `NoUniqueBeanDefinitionException`. Without it, two beans of the same type would conflict at startup.

### Q: How does Actuator integrate with Micrometer for exporting metrics to Prometheus?

Actuator includes the Micrometer metrics facade. When `micrometer-registry-prometheus` is on the classpath, its auto-configuration (`PrometheusMetricsExportAutoConfiguration`) creates a `PrometheusMeterRegistry`. All registered meters (JVM, HTTP, HikariCP, custom) are backed by this registry, which formats them in OpenMetrics exposition format. Exposing the `prometheus` endpoint (`management.endpoints.web.exposure.include=prometheus`) makes the scrape endpoint available at `/actuator/prometheus`. Prometheus polls this URL on its configured interval and stores the time series.

### Q: How do `@DynamicPropertySource` and `@ServiceConnection` work with Testcontainers?

`@DynamicPropertySource` is a static method annotated to register properties after the container has started and its port is known. The callback receives a `DynamicPropertyRegistry` where you set properties like `spring.datasource.url` using the container's runtime `getJdbcUrl()`. Spring Boot injects these before bean creation, so `DataSourceAutoConfiguration` sees the real container URL. As of Spring Boot 3.1, `@ServiceConnection` on a `@Container` field does this automatically for supported container types (`PostgreSQLContainer`, `KafkaContainer`, etc.) — no `@DynamicPropertySource` boilerplate required.

### Q: Walk through the full Spring Boot startup sequence from `SpringApplication.run()` to the first HTTP request being served.

1. `SpringApplication` is created with the primary source class.
2. Listeners (`SpringApplicationRunListener`, `ApplicationEventMulticaster`) are initialized.
3. The `Environment` is prepared — all property sources are resolved and merged in priority order.
4. The `ApplicationContext` type is determined (servlet, reactive, or plain) and instantiated.
5. `BeanDefinitionLoader` scans `@ComponentScan` paths and registers bean definitions.
6. `AutoConfigurationImportSelector` loads candidates from `AutoConfiguration.imports` and evaluates `@Conditional` conditions — passing ones are imported as extra `@Configuration` classes.
7. The `BeanFactory` instantiates beans in dependency order.
8. `SmartLifecycle` beans are started — including the embedded Tomcat.
9. Tomcat initializes the `DispatcherServlet` and registers it with the servlet context.
10. `ApplicationReadyEvent` is published.
11. Tomcat begins accepting requests; the `DispatcherServlet` dispatches the first HTTP request to the matching `@Controller`.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| `@SpringBootApplication` | Composed annotation: `@EnableAutoConfiguration` + `@ComponentScan` + `@SpringBootConfiguration` |
| `@ConditionalOnClass` | Activates configuration if specified class is on the classpath |
| `@ConditionalOnMissingBean` | Activates configuration only if no bean of that type exists yet |
| `@ConfigurationProperties` | Binds a property namespace to a POJO with type safety and validation |
| `@Value` | Injects a single property value; supports SpEL; fragile for groups of props |
| Spring Profile | Named environment variant; loaded via `spring.profiles.active` |
| Spring Boot Starter | Dependency aggregator POM that triggers auto-configuration |
| `/actuator/health` | Aggregate health endpoint; UP/DOWN with optional component detail |
| Micrometer | Metrics facade; exports to Prometheus, Datadog, CloudWatch, etc. |
| `@SpringBootTest` | Loads full `ApplicationContext`; use for integration tests |
| `@WebMvcTest` | MVC-layer slice; fast controller tests with `MockMvc` |
| `@DataJpaTest` | JPA-layer slice; H2 in-memory by default; auto-rollback |
| `@MockBean` | Replaces a real Spring bean with a Mockito mock in the test context |

## Related Interview Prep

- [Spring Framework Interview Questions](./spring-framework-interview-prep.md) — Spring Boot runs on Spring Framework; IoC, DI, AOP, and bean lifecycle questions are there
- [Core Java Interview Questions](./core-java-interview-prep.md) — fundamentals that underpin Spring Boot internals
