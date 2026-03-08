---
id: spring-boot-starters-demo
title: "Spring Boot Starters — Practical Demo"
description: Hands-on examples exploring what common starters wire up, how to inspect dependencies, and how to swap out components like the embedded server.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - spring-boot
  - beginner
  - demo
last_updated: 2026-03-08
---

# Spring Boot Starters — Practical Demo

> Hands-on examples for [Spring Boot Starters](../spring-boot-starters.md). Learn what starters bring in, how to inspect transitive dependencies, and how to customize the defaults they set up.

:::info Prerequisites
Read the [Spring Boot Starters](../spring-boot-starters.md) note first. Understanding that starters trigger auto-configuration via `@ConditionalOnClass` will make these examples make sense.
:::

---

## Example 1: A Minimal Web Application with `spring-boot-starter-web`

This pom.xml is all you need for a full HTTP server with a REST endpoint and JSON serialization:

```xml title="pom.xml" showLineNumbers {6,10}
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>                              <!-- ← controls all dependency versions -->
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>  <!-- ← Tomcat + MVC + Jackson -->
    </dependency>
</dependencies>
```

```java title="HelloController.java" showLineNumbers {1,4}
@RestController           // ← wired by spring-boot-starter-web's DispatcherServlet auto-config
public class HelloController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello from Spring Boot!");  // ← auto-serialized to JSON by Jackson
    }
}
```

**Run** and hit `http://localhost:8080/hello`.

**Expected Output:**

```json
{"message":"Hello from Spring Boot!"}
```

:::tip Key takeaway
One starter coordinate, zero XML, zero explicit bean declarations — a production-grade HTTP server with JSON support is ready.
:::

---

## Example 2: Inspecting the Dependency Tree

Understanding exactly what a starter pulls in prevents surprise classpath conflicts.

```bash title="Terminal"
# Print dependencies limited to spring-boot groupId artifacts
mvn dependency:tree -Dincludes=org.springframework.boot

# Or with Gradle
./gradlew dependencies --configuration runtimeClasspath
```

**Excerpt of `spring-boot-starter-web` tree:**

```
[INFO] com.example:order-service:jar:0.0.1-SNAPSHOT
[INFO] +- org.springframework.boot:spring-boot-starter-web:jar:3.2.0
[INFO] |  +- org.springframework.boot:spring-boot-starter:jar:3.2.0
[INFO] |  |  +- org.springframework.boot:spring-boot-starter-logging:jar:3.2.0
[INFO] |  |  \- org.springframework.boot:spring-boot-autoconfigure:jar:3.2.0
[INFO] |  +- org.springframework.boot:spring-boot-starter-json:jar:3.2.0
[INFO] |  |  \- com.fasterxml.jackson.core:jackson-databind:jar:2.16.0
[INFO] |  +- org.springframework.boot:spring-boot-starter-tomcat:jar:3.2.0
[INFO] |  |  \- org.apache.tomcat.embed:tomcat-embed-core:jar:10.1.16
[INFO] |  \- org.springframework:spring-webmvc:jar:6.1.1
```

:::tip Key takeaway
Run this every time you add a new starter to understand its transitive closure. It reveals what Jackson version you get, whether Hibernate Validator is included, and which logging framework was pulled in.
:::

---

## Example 3: Swapping the Embedded Server from Tomcat to Jetty

No code changes needed — purely declarative in `pom.xml`:

```xml title="pom.xml" showLineNumbers {5,6,7,8,9,15,16,17}
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-tomcat</artifactId>  <!-- ← remove Tomcat -->
            </exclusion>
        </exclusions>
    </dependency>

    <!-- Add Jetty instead -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jetty</artifactId>           <!-- ← Jetty takes its place -->
    </dependency>
</dependencies>
```

**Expected startup log change:**

Before (Tomcat): `Tomcat started on port 8080`
After (Jetty): `Jetty started on port 8080`

The `EmbeddedWebServerFactory` auto-configuration checks which server artifact is on the classpath at runtime — `@ConditionalOnClass` does the switching automatically.

---

## Example 4: What `spring-boot-starter-security` Does Out of the Box

```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

After adding this starter and restarting:

1. All endpoints require HTTP Basic authentication.
2. A random password is generated and printed to the console:

```
Using generated security password: 3a8b4d12-...
```

3. The username is `user` by default.

**Provide fixed credentials in `application.properties`:**

```properties title="application.properties"
spring.security.user.name=admin
spring.security.user.password=mysecret
spring.security.user.roles=ADMIN
```

**Then configure your own `SecurityFilterChain` to take full control:**

```java title="SecurityConfig.java" showLineNumbers {4,8,12}
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()    // ← allow without login
                .anyRequest().authenticated()                 // ← everything else requires auth
            )
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
```

:::warning Common Mistake
Adding `spring-boot-starter-security` without any configuration locks out all endpoints — including `/actuator/health`. Define a `SecurityFilterChain` before pushing to any shared environment.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Create a project with only `spring-boot-starter-web`. Run `mvn dependency:tree` and count how many artifacts are brought in transitively.
2. **Medium**: Swap Tomcat for Undertow (`spring-boot-starter-undertow`) instead of Jetty. Verify it starts and serves requests correctly.
3. **Hard**: Add `spring-boot-starter-security` to the web project. Write a `SecurityFilterChain` bean that permits GET requests to `/public/**` without authentication but requires `USER` role for all others. Write a `@WebMvcTest` that verifies a GET to `/public/hello` returns 200 and a GET to `/private/data` returns 401.

---

## Back to Topic

Return to the [Spring Boot Starters](../spring-boot-starters.md) note for theory, interview questions, and further reading.
