---
id: security-filter-chain-demo
title: "Security Filter Chain — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Spring Security's filter chain configuration.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - spring-security
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Security Filter Chain — Practical Demo

> Hands-on examples for [Security Filter Chain](../security-filter-chain.md). We start with the minimal working config, then layer in custom filters and multiple chains.

:::info Prerequisites
Before running these examples, understand the [Security Filter Chain](../security-filter-chain.md) concepts — particularly how `FilterChainProxy` routes requests, and what each built-in filter does.
:::

---

## Example 1: Minimal Stateless REST API Config

The most common starting point: a stateless REST API that expects a JWT Bearer token.

```java title="SecurityConfig.java" showLineNumbers {8,12,15}
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)            // [8] No CSRF needed for stateless APIs
            .sessionManagement(s -> s
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // no HTTP sessions
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll() // [12] open endpoints
                .anyRequest().authenticated()                 // all others require auth
            )
            .oauth2ResourceServer(oauth2 -> oauth2           // [15] validates Bearer JWTs
                .jwt(Customizer.withDefaults()));
        return http.build();
    }
}
```

```yaml title="application.yml"
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          secret-key: my-super-secret-key-that-is-at-least-32-chars
```

**What to observe:**
- `GET /api/public/ping` → `200 OK` (no auth needed)
- `GET /api/orders` without `Authorization` header → `401 Unauthorized`
- `GET /api/orders` with valid `Authorization: Bearer <token>` → `200 OK`

:::tip Key takeaway
`SessionCreationPolicy.STATELESS` + `csrf.disable()` + `oauth2ResourceServer` is the standard three-part recipe for a stateless REST API.
:::

---

## Example 2: Inspecting Which Filters Run

Enable TRACE logging to see the full filter chain in action during development.

```yaml title="application.yml"
logging:
  level:
    org.springframework.security: TRACE
```

When you hit `GET /api/orders`, the log output looks like:

```
TRACE o.s.s.web.FilterChainProxy - Securing GET /api/orders
TRACE o.s.s.w.c.SecurityContextHolderFilter - Set SecurityContextHolder to empty SecurityContext
TRACE o.s.s.o.s.r.a.BearerTokenAuthenticationFilter - Found bearer token in Authorization header. Attempting authentication
TRACE o.s.s.a.ProviderManager - Authenticating request with JwtAuthenticationProvider
TRACE o.s.s.w.a.AuthorizationFilter - Authorizing GET /api/orders
TRACE o.s.s.w.a.AuthorizationFilter - Authorized GET /api/orders with authenticated
```

:::tip Key takeaway
TRACE logging shows you *exactly* which filters run and in what order. Always enable this before debugging a security `403` or `401` to understand the failure point.
:::

---

## Example 3: Multiple Security Filter Chains (URL Namespace Security)

Separate security policies for the API, actuator, and admin areas:

```java title="SecurityConfig.java" showLineNumbers {5,17,31}
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean @Order(1)                     // [5] Evaluated FIRST — most specific
    public SecurityFilterChain actuatorChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/actuator/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .anyRequest().hasRole("OPS")
            )
            .httpBasic(Customizer.withDefaults());  // ← HTTP Basic for ops tools
        return http.build();
    }

    @Bean @Order(2)                     // [17] Evaluated SECOND
    public SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/**")
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

    @Bean @Order(3)                     // [31] Catch-all — least specific
    public SecurityFilterChain defaultChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth.anyRequest().denyAll()); // ← deny unmatched paths
        return http.build();
    }
}
```

**Expected behavior:**
- `GET /actuator/health` → `200 OK` (no auth)
- `GET /actuator/metrics` → `401` unless `ROLE_OPS` HTTP Basic credential supplied
- `GET /api/auth/login` → `200 OK` (permit all)
- `GET /api/orders` + valid JWT → `200 OK`
- `GET /some-unknown-path` → `403 Forbidden` (denyAll)

---

## Example 4: Custom `OncePerRequestFilter` — API Key Validation

Add your own filter that validates a custom `X-API-Key` header before authentication:

```java title="ApiKeyFilter.java" showLineNumbers {12,16,20}
public class ApiKeyFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";
    private final Set<String> validKeys;

    public ApiKeyFilter(Set<String> validKeys) {
        this.validKeys = validKeys;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String key = request.getHeader(API_KEY_HEADER);  // [12] read custom header

        if (key == null || !validKeys.contains(key)) {   // [16] reject if invalid
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Invalid or missing API key\"}");
            return;                                       // [20] stop the chain — don't call filterChain.doFilter
        }

        filterChain.doFilter(request, response);          // ← valid key — continue chain
    }
}
```

```java title="SecurityConfig.java (snippet)"
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    ApiKeyFilter apiKeyFilter = new ApiKeyFilter(Set.of("key-abc-123", "key-xyz-789"));

    http
        .addFilterBefore(apiKeyFilter, UsernamePasswordAuthenticationFilter.class)
        // ← insert our filter BEFORE Spring's own auth filters
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // ← API key IS the auth

    return http.build();
}
```

**Testing:**
```bash
# Without API key → 401
curl http://localhost:8080/api/data

# With invalid key → 401
curl -H "X-API-Key: wrong-key" http://localhost:8080/api/data

# With valid key → 200
curl -H "X-API-Key: key-abc-123" http://localhost:8080/api/data
```

---

## Example 5: Accessing the Current User Anywhere in Code

```java title="CurrentUserUtil.java"
public class CurrentUserUtil {

    /** Use in any bean that needs the logged-in user's identity. */
    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user in current thread");
        }
        return auth.getName();
    }

    /** When using JWT resource server, the principal is a Jwt object. */
    public static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getSubject();  // ← "sub" claim
        }
        throw new IllegalStateException("Not a JWT authentication");
    }
}
```

:::tip Key takeaway
`SecurityContextHolder` holds the `Authentication` on the current thread. This works from any `@Service`, `@Repository`, or component — not only controllers.
:::
