---
id: jwt-demo
title: "JWT Authentication — Practical Demo"
description: Hands-on examples for JWT authentication in Spring Boot — generating tokens, validating with Spring Security's resource server, custom claims, and refresh token pattern.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - spring-security
  - intermediate
  - demo
last_updated: 2026-03-08
---

# JWT Authentication — Practical Demo

> Hands-on examples for [JWT Authentication](../jwt.md). We build a complete stateless auth system: generate a signed token at login, validate it on every subsequent request, and extract typed claims.

:::info Prerequisites
Understand [JWT](../jwt.md) structure and the Spring Security resource server architecture before running these examples. The [Authentication Demo](./authentication-demo.md) covers the login endpoint this demo extends.
:::

---

## Example 1: Project Setup — Dependencies and Config

```xml title="pom.xml"
<dependencies>
    <!-- Spring Security + JWT resource server support -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>
    <!-- JJWT — for generating tokens at login (if not using an external auth server) -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

```yaml title="application.yml"
app:
  jwt:
    # Generate: openssl rand -base64 32
    secret: 7n6bIjy2KqRpXaZ8mLdFvEwQoGcTsHuN9kPeWb3YzAMfCxJl  # ← ≥32 bytes Base64-encoded
    expiry-seconds: 3600   # ← 1 hour access token

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          secret-key: ${app.jwt.secret}   # ← used by Spring Security to validate incoming tokens
```

---

## Example 2: `JwtService` — Generating Signed Tokens

```java title="JwtService.java" showLineNumbers {15,18,20,24}
@Component
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiry-seconds:3600}")
    private long expirySeconds;

    public String generateToken(UserDetails user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", extractRoles(user));       // ← custom claim: list of role strings
        claims.put("email", user.getUsername());        // ← custom claim: email

        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getUsername())                           // [15] "sub" = email/username
                .claims(claims)                                        // [18] add custom claims
                .issuedAt(Date.from(now))                              // [20] "iat"
                .expiration(Date.from(now.plusSeconds(expirySeconds))) // "exp"
                .signWith(getSigningKey())                             // [24] HMAC-SHA256
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenExpired(String token) {
        return parseClaims(token).getExpiration().before(Date.from(Instant.now()));
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] bytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(bytes);  // ← must be ≥ 32 bytes
    }

    private List<String> extractRoles(UserDetails user) {
        return user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }
}
```

---

## Example 3: `SecurityConfig` — Resource Server + Custom Claims Mapping

```java title="SecurityConfig.java" showLineNumbers {12,22}
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // [12] login/register are open
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())  // ← custom role mapping
                )
            );
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {  // [22]
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");  // ← read from "roles" claim
        grantedAuthoritiesConverter.setAuthorityPrefix("");            // ← roles already have "ROLE_" prefix

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return converter;
    }
}
```

---

## Example 4: Login Endpoint That Returns a JWT

```java title="AuthController.java" showLineNumbers {16,18}
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();  // [16] 401 on bad creds
        }

        UserDetails user = (UserDetails) authentication.getPrincipal();  // [18] get the loaded user
        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(new TokenResponse(token));
    }
}
```

**End-to-end curl test:**
```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass1!"}'
# → {"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}

# 2. Use the token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/me
# → {"email":"admin@example.com",...}

# 3. Wrong password → 401
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"wrongpassword"}'
# → 401 Unauthorized
```

---

## Example 5: Accessing JWT Claims in a Controller

```java title="ProfileController.java"
@RestController
@RequestMapping("/api")
public class ProfileController {

    // Option A — inject the raw Jwt object (when using resource server)
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            @AuthenticationPrincipal Jwt jwt) {

        Map<String, Object> profile = Map.of(
            "userId",  jwt.getSubject(),                         // ← "sub" claim
            "email",   jwt.getClaimAsString("email"),            // ← custom claim
            "roles",   jwt.getClaimAsStringList("roles"),        // ← custom list claim
            "expires", jwt.getExpiresAt()                        // ← "exp" as Instant
        );
        return ResponseEntity.ok(profile);
    }

    // Option B — let Spring extract authorities (use in @PreAuthorize)
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")  // ← works because JwtAuthenticationConverter set ROLE_ prefix
    public ResponseEntity<String> adminStats() {
        return ResponseEntity.ok("Admin dashboard data");
    }
}
```

---

## Example 6: Decode a JWT Payload Manually (No Signature Check)

Useful in tests or debug tools to inspect a token's claims without verifying the signature:

```java title="JwtDebugUtil.java"
public class JwtDebugUtil {

    /**
     * Decodes the payload of a JWT without verifying the signature.
     * DO NOT use this in production security code — only for debugging/logging.
     */
    public static Map<String, Object> decodePayload(String token) throws Exception {
        String[] parts = token.split("\\.");
        if (parts.length != 3) throw new IllegalArgumentException("Not a valid JWT format");

        String payloadJson = new String(
            Base64.getUrlDecoder().decode(parts[1]),  // ← the middle part
            StandardCharsets.UTF_8
        );

        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(payloadJson, new TypeReference<>() {});
    }
}

// Usage in a test:
Map<String, Object> claims = JwtDebugUtil.decodePayload(token);
System.out.println(claims);
// {sub=user@example.com, roles=[ROLE_USER], email=user@example.com, iat=1700000000, exp=1700003600}
```

:::warning
Use this utility only in tests and debugging. In production, always validate the signature via Spring Security's `JwtDecoder`. An unsigned or tampered token must never be trusted.
:::
