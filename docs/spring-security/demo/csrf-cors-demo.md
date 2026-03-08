---
id: csrf-cors-demo
title: "CSRF and CORS — Practical Demo"
description: Hands-on examples for CSRF protection and CORS configuration in Spring Boot — Cookie-based CSRF for SPAs, production CORS setup, fixing the preflight 401 problem, and testing with MockMvc.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - spring-security
  - intermediate
  - demo
last_updated: 2026-03-08
---

# CSRF and CORS — Practical Demo

> Hands-on examples for [CSRF & CORS](../csrf-cors.md). We cover the two most common security configuration mistakes in REST APIs — disabling CSRF incorrectly and getting CORS wrong — with clear, working code for each scenario.

:::info Prerequisites
Understand the problem each mechanism solves before copying these configs — see [CSRF & CORS](../csrf-cors.md). The [Security Filter Chain Demo](./security-filter-chain-demo.md) explains where CSRF and CORS filters sit in the chain.
:::

---

## Example 1: CSRF for a Session-Based SPA (CookieCsrfTokenRepository)

If your frontend is a SPA using session cookies (not JWTs), enable CSRF with the cookie-based repository so JavaScript can read the token:

```java title="SecurityConfig.java" showLineNumbers {10,16}
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(
                    CookieCsrfTokenRepository.withHttpOnlyFalse()  // [10] allows JS to read XSRF-TOKEN cookie
                )
                .csrfTokenRequestHandler(new XorCsrfTokenRequestAttributeHandler())  // Spring Boot 3 required
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

**Frontend JavaScript reads the CSRF cookie and sends it as a header:**

```javascript title="api.js"
function getCsrfToken() {
    // Read the XSRF-TOKEN cookie set by Spring
    return document.cookie.split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
}

// POST request with CSRF header
async function createOrder(orderData) {
    const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',              // ← sends the session cookie
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),  // ← Spring reads this header
        },
        body: JSON.stringify(orderData),
    });
    return response.json();
}
```

:::warning Spring Boot 3 change
Spring Boot 3 requires the `XorCsrfTokenRequestAttributeHandler` (or `CsrfTokenRequestAttributeHandler`) alongside `CookieCsrfTokenRepository`. Omitting it causes the CSRF token to not be included in the cookie on the first request.
:::

---

## Example 2: Disable CSRF for Stateless JWT APIs

When using JWTs in the `Authorization` header (not cookies), CSRF attacks are impossible — disable CSRF entirely:

```java title="SecurityConfig.java (stateless REST API)"
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)  // ← safe: no cookies = no CSRF risk

        // MUST also be stateless — if sessions are enabled, CSRF should NOT be disabled
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        )
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

    return http.build();
}
```

:::danger CSRF disable — right and wrong reason
- ✅ Disable because you're using JWT in `Authorization` header (stateless)
- ❌ Disable because "it's annoying" while still using session cookies — this creates a real attack surface
:::

---

## Example 3: Production CORS Configuration (CorsConfigurationSource Bean)

The production-safe way to configure CORS through the security layer — not `WebMvcConfigurer`:

```java title="SecurityConfig.java" showLineNumbers {28,33}
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // ← wire bean here
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ← Explicit allowed origins — never use "*" with allowCredentials(true)
        config.setAllowedOrigins(List.of(
            "https://myapp.com",
            "https://www.myapp.com"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")); // [28] include OPTIONS for preflight
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setExposedHeaders(List.of("X-Total-Count"));  // headers the browser JS can read
        config.setAllowCredentials(true);    // ← allows cookies/auth headers cross-origin
        config.setMaxAge(3600L);             // [33] preflight cache duration (seconds) — reduces OPTIONS calls

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);  // ← apply to all paths
        return source;
    }
}
```

**Why `http.cors()` and not `WebMvcConfigurer`?**

`WebMvcConfigurer.addCorsMappings()` works at the Spring MVC dispatcher level. Spring Security's filter chain runs *before* the dispatcher — on a preflight OPTIONS request, Spring Security processes it first. If CORS headers are not injected by the security layer, the browser may see an auth error (401) and block the actual request. Using `http.cors()` ensures headers are added at the filter level, before any auth checks.

---

## Example 4: Fixing the Preflight 401 Problem

**The Symptom:** Your SPA works for GET but all non-GET calls fail with CORS error in the browser console. In the network tab you see an OPTIONS request returning 401.

**Why it happens:**

```
Browser: OPTIONS /api/orders        (preflight — no auth header)
Spring Security: 401 Unauthorized   (no token = block)
Browser: CORS error on POST /api/orders  (never actually sent)
```

**The Fix — permit OPTIONS at security layer:**

```java title="SecurityConfig.java"
http
    .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // [1] CORS headers added first
    .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // [2] let preflight pass without auth
        // OR: .requestMatchers(new AntPathRequestMatcher("/**", "OPTIONS")).permitAll()
        .anyRequest().authenticated()
    );
```

:::info Why cors() alone isn't always enough
When you call `http.cors()`, Spring adds a `CorsFilter` early in the chain that injects headers and short-circuits OPTIONS requests before authorization. This should handle most cases. The explicit `.permitAll()` for OPTIONS is a belt-and-suspenders approach that helps when the `CorsFilter` order is changed or when using custom filter chains.
:::

---

## Example 5: Testing CORS and CSRF with MockMvc

```java title="SecurityConfigTest.java" showLineNumbers
@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    // ── CORS Tests ──────────────────────────────────────────────────────────────

    @Test
    void preflight_shouldReturn200_withCorsHeaders() throws Exception {
        mockMvc.perform(options("/api/orders")
                .header("Origin", "https://myapp.com")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Authorization"))
            .andExpect(status().isOk())  // ← must be 200, not 401
            .andExpect(header().string("Access-Control-Allow-Origin", "https://myapp.com"))
            .andExpect(header().string("Access-Control-Allow-Methods", containsString("POST")));
    }

    @Test
    void unknownOrigin_shouldNotReceiveCorsHeaders() throws Exception {
        mockMvc.perform(get("/api/orders")
                .header("Origin", "https://evil.com")
                .header("Authorization", "Bearer " + validToken()))
            .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));  // ← rejected
    }

    // ── CSRF Tests ──────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "user")
    void postWithoutCsrfToken_shouldReturn403_forSessionBasedApp() throws Exception {
        // This test would apply to a session-based app with CSRF enabled
        // For stateless JWT APIs, CSRF is disabled — POST without a CSRF token should be allowed
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"item\":\"book\"}"))
            // For stateless JWT API (csrf disabled): expect 200
            // For session app (csrf enabled): expect 403 without CSRF token
            .andExpect(status().isForbidden());  // ← adjust based on your app type
    }

    @Test
    @WithMockUser(username = "user")
    void postWithCsrfToken_shouldSucceed_forSessionBasedApp() throws Exception {
        mockMvc.perform(post("/api/orders")
                .with(csrf())  // ← MockMvc csrf() injects a valid CSRF token automatically
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"item\":\"book\"}"))
            .andExpect(status().isOk());
    }

    private String validToken() {
        // generate a test JWT; use TestcontainerId or a fixed test token
        return "test-token";
    }
}
```

---

## Example 6: Complete Stateless REST API Security Config

The full, production-ready security configuration combining all the pieces:

```java title="SecurityConfig.java (complete)"
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // enables @PreAuthorize on service methods
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── CORS first — injects headers before auth checks ──────────────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── CSRF — disabled because we use JWT in Authorization header ───
            .csrf(AbstractHttpConfigurer::disable)

            // ── Session — stateless; never create HTTP sessions ──────────────
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── URL authorization rules ───────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // preflight
                .requestMatchers("/api/auth/**").permitAll()            // login endpoints
                .requestMatchers("/actuator/health").permitAll()        // health check
                .anyRequest().authenticated()
            )

            // ── JWT resource server ───────────────────────────────────────────
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "https://myapp.com",
            "http://localhost:3000"  // local development
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");  // custom roles claim name
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return converter;
    }
}
```

:::tip Quick decision guide
| Scenario | CSRF | CORS |
|---|---|---|
| REST API with JWT in header | Disable | Configure via `http.cors()` |
| Server-rendered MVC + Thymeleaf | Keep enabled | Usually not needed |
| SPA with session cookies | Cookie CSRF repo | Configure via `http.cors()` |
| Public read-only API | Disable | Wide-open or `*` |
:::
