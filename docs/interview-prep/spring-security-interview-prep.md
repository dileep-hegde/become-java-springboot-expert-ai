---
id: spring-security-interview-prep
title: Spring Security Interview Questions
description: Consolidated interview Q&A for Spring Security covering filter chain, authentication, authorization, JWT, OAuth2, CSRF, and CORS — beginner through advanced.
sidebar_position: 12
tags:
  - interview-prep
  - spring-security
  - intermediate
  - advanced
last_updated: 2026-03-08
---

# Spring Security Interview Questions

> Consolidated Q&A for Spring Security. Use for rapid revision before backend interviews. Topics: security filter chain, authentication, `UserDetailsService`, JWT, OAuth2/OIDC, CSRF, and CORS.

## How to Use This Page

- Skim **Beginner** questions to confirm you have no gaps in the fundamentals
- **Intermediate** questions are the core target for 3–5 YOE Spring roles
- **Advanced** questions test senior depth — filter ordering, token revocation, multi-tenant JWT, AOP + method security

---

## Beginner

### Q: What is Spring Security's security filter chain?

Spring Security registers a chain of servlet filters that every HTTP request passes through before reaching your controllers. Each filter handles one security concern: loading the current user (`SecurityContextHolderFilter`), validating credentials (`UsernamePasswordAuthenticationFilter`), protecting against CSRF (`CsrfFilter`), and enforcing access rules (`AuthorizationFilter`). You configure the chain by declaring a `SecurityFilterChain` bean in a `@Configuration` class.

### Q: What is `SecurityContextHolder`?

`SecurityContextHolder` is a `ThreadLocal`-backed store that holds the `SecurityContext` for the current request thread. The `SecurityContext` contains the `Authentication` object — the logged-in user's identity and their `GrantedAuthority` list. Any code in the same thread can call `SecurityContextHolder.getContext().getAuthentication()` to know who is making the request.

### Q: What is `UserDetailsService` and why do you implement it?

`UserDetailsService` is a Spring Security interface with one method: `loadUserByUsername(String username)`. You implement it to tell Spring Security how to load a user's credentials and roles from your database, LDAP, or any source. Spring Security calls this method automatically when authenticating a username/password submission, and uses the returned `UserDetails` to verify the password via `PasswordEncoder`.

### Q: Why should passwords never be stored in plaintext?

Plaintext password storage means a database breach immediately yields all user passwords. Instead, store a bcrypt hash. Bcrypt is a slow, salted hash function — it is computationally expensive to reverse, and the salt means identical passwords produce different hashes (defeating rainbow table attacks). Spring Security provides `BCryptPasswordEncoder` as the standard choice.

### Q: What is the difference between CSRF and CORS?

**CSRF** (Cross-Site Request Forgery) is an *attack*: a malicious website tricks an authenticated user's browser into sending requests to your server using their session cookie. Spring Security defends with CSRF tokens. **CORS** (Cross-Origin Resource Sharing) is a *browser policy* that blocks cross-origin requests by default — your server uses CORS headers to declare which foreign origins are allowed. CSRF blocks unwanted cross-origin requests; CORS enables wanted ones.

### Q: When is it safe to disable CSRF protection?

When your API is stateless and uses token-based authentication (e.g., JWT in `Authorization: Bearer` headers). The browser never sends Bearer tokens automatically, so a cross-origin form submission cannot forge a valid credentialed request. If your app uses session cookies for auth (browser form login), CSRF must remain enabled.

---

## Intermediate

### Q: What is the difference between `DelegatingFilterProxy` and `FilterChainProxy`?

`DelegatingFilterProxy` is a standard servlet filter registered in the Servlet container. Its only job is to bridge the servlet world to the Spring `ApplicationContext` — it looks up the `FilterChainProxy` bean and delegates to it. `FilterChainProxy` is the actual Spring Security component; it holds all `SecurityFilterChain` beans and routes each request to the first matching chain.

### Q: How does `AuthorizationFilter` decide whether to allow or deny a request?

`AuthorizationFilter` (the last filter in the chain) evaluates the rules declared in `authorizeHttpRequests(...)`. Rules are checked top-to-bottom; the first matching rule wins. The filter delegates to `AuthorizationManager`, which calls configured voters or evaluates SpEL expressions. If access is denied, it throws `AccessDeniedException`, which `ExceptionTranslationFilter` converts to a `403 Forbidden` response.

### Q: What does `@EnableMethodSecurity` do?

It registers an AOP advisor that intercepts calls to `@PreAuthorize`, `@PostAuthorize`, `@PreFilter`, and `@PostFilter` annotated methods. Before the method runs, Spring evaluates the SpEL expression in `@PreAuthorize`. If it evaluates to `false`, `AccessDeniedException` is thrown and the method never executes. In Spring Boot 3, `@EnableMethodSecurity` replaces the deprecated `@EnableGlobalMethodSecurity`.

### Q: What is the difference between `hasRole('ADMIN')` and `hasAuthority('ROLE_ADMIN')`?

They are equivalent. `hasRole('ADMIN')` automatically prefixes with `ROLE_` and checks for `ROLE_ADMIN` in the user's authorities. `hasAuthority('ROLE_ADMIN')` checks for the exact string without any prefix logic. The convention: use `hasRole` for roles (stored with `ROLE_` prefix), use `hasAuthority` for fine-grained permissions like `read:orders` that don't follow the role naming convention.

### Q: Why do preflight OPTIONS requests return `401` in Spring Security?

The browser sends a preflight OPTIONS request *without* an `Authorization` header to ask the server whether the actual request is allowed. Spring Security's authentication filter runs first and rejects the unauthenticated OPTIONS request with `401`. Fix: configure CORS via `http.cors(cors -> cors.configurationSource(...))` — Spring Security processes CORS headers before authentication for preflight requests, so OPTIONS is handled correctly. Alternatively, add `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` to your auth rules.

### Q: What are the three parts of a JWT?

Header (Base64URL-encoded JSON with the signing algorithm and token type `typ: "JWT"`), Payload (Base64URL-encoded JSON with claims — `sub`, `iss`, `exp`, custom fields), and Signature (cryptographic hash of header + payload using the signing key). The three parts are separated by dots. The signature lets the receiver verify neither part was tampered with.

### Q: How does Spring Security validate a JWT on each request?

`BearerTokenAuthenticationFilter` extracts the `Authorization: Bearer <token>` header. It passes the token to `JwtDecoder` (typically `NimbusJwtDecoder`), which verifies the signature against the configured key, checks the `exp` claim (and optionally `iss`, `aud`), and returns a `Jwt` object. `JwtAuthenticationConverter` maps the claims to a `JwtAuthenticationToken` with authorities and stores it in `SecurityContextHolder`.

### Q: What is the difference between Authorization Code and Client Credentials OAuth2 flows?

Authorization Code involves a *user*: the user authenticates with the authorization server, grants consent, and the client gets a token scoped to that user's permissions. It is used by web + mobile apps. Client Credentials has *no user*: the service authenticates with `client_id` + `client_secret` directly and gets a token representing the service identity. It is used for machine-to-machine API calls between microservices.

### Q: What is OpenID Connect (OIDC) and how does it extend OAuth2?

OAuth2 is an authorization framework — it says "this token grants access to these scopes" but says nothing about who the user is. OIDC adds an **ID Token** (a JWT with standard user claims: `sub`, `name`, `email`, `picture`) issued alongside the access token. OIDC answers "who is the logged-in user?". Requesting `scope=openid` triggers OIDC. The ID token is for the client app; the access token is for calling the resource server.

---

## Advanced

### Q: How do you support multiple `SecurityFilterChain` beans in one Spring Boot application?

`FilterChainProxy` holds a list of `SecurityFilterChain` beans ordered by `@Order`. For each request, it iterates the list and picks the first chain whose `requestMatcher` matches the request path. Unmatched chains are skipped. Example: `@Order(1)` chain matches `/actuator/**` with custom rules; `@Order(2)` chain matches `/api/**` with JWT auth. Requests to neither path fall through to a default deny-all chain or return `404`.

### Q: Why is `web.ignoring()` different from `.requestMatchers(...).permitAll()`?

`web.ignoring()` removes paths from `FilterChainProxy` entirely — requests to those paths bypass all Spring Security filters. No `SecurityContext` is populated, no logging, no CSRF, nothing. Use it only for purely static resources (`/static/**`). `.permitAll()` still runs all security filters but allows unauthenticated access through to the application. Paths with `permitAll()` still have a `SecurityContext` (anonymous authentication), whereas `web.ignoring()` paths have none at all.

### Q: How does Spring Security's method security interact with Spring's `@Transactional`?

Both use AOP proxies. By default, the security interceptor runs *before* `@Transactional` (security has lower order number = higher priority). The security check happens before any database work begins, which is correct — if authorization fails, no transaction is started. You can control the order via `@EnableMethodSecurity(order = ...)` and `@EnableTransactionManagement(order = ...)`. Note: self-invocation bypasses both proxies — if a method calls `this.securedMethod()` within the same class, neither `@PreAuthorize` nor `@Transactional` fires.

### Q: What is PKCE and why is it required for public OAuth2 clients?

PKCE (Proof Key for Code Exchange, RFC 7636) protects the Authorization Code flow for clients that cannot securely store a `client_secret` — browser SPAs and mobile apps. The client generates a random `code_verifier`, hashes it to a `code_challenge`, and sends the challenge in the authorization URL. When exchanging the code for a token, it sends the original `code_verifier`. The auth server verifies the hash matches. An intercepted authorization code is useless without the `code_verifier`. The Implicit flow (no PKCE, token in URL) is deprecated for exactly this reason.

### Q: How would you implement JWT revocation in a stateless architecture?

Stateless JWTs cannot be invalidated on the server without some server-side state. Options: (1) **Short expiry**: keep access tokens 15 minutes or less — stolen tokens expire quickly. (2) **Refresh token revocation**: store refresh tokens in a database; revoke them on logout. (3) **JWT denylist**: store revoked `jti` (JWT ID) claims in Redis with TTL equal to the token's remaining lifetime; check the denylist in a custom `JwtDecoder` or filter. (4) **Key rotation**: retire the signing key — all tokens using the old key become invalid, forcing re-authentication. Each approach has latency vs. strictness trade-offs.

### Q: How do you map Keycloak role claims to Spring Security `GrantedAuthority` objects?

Keycloak puts realm roles in `realm_access.roles` (a nested JSON object), not in the standard `scope` or `roles` claim. Implement a custom `JwtAuthenticationConverter`:

```java
@Bean
public JwtAuthenticationConverter jwtAuthenticationConverter() {
    Converter<Jwt, Collection<GrantedAuthority>> converter = jwt -> {
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        List<String> roles = (List<String>) realmAccess.getOrDefault("roles", List.of());
        return roles.stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
            .collect(Collectors.toList());
    };
    JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
    jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
    return jwtConverter;
}
```

Then wire it: `.oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(jwtAuthenticationConverter())))`.

---

## Quick Reference

| Concept | Key Class / Annotation | Note |
|---------|----------------------|------|
| Security entry point | `DelegatingFilterProxy` → `FilterChainProxy` | Servlet container → Spring |
| Current user | `SecurityContextHolder.getContext().getAuthentication()` | `ThreadLocal`-scoped |
| User loading | `UserDetailsService.loadUserByUsername()` | Implement for DB auth |
| Password hashing | `BCryptPasswordEncoder` | Default cost = 10 |
| Auth decision | `AuthenticationManager` → `DaoAuthenticationProvider` | Delegates to providers |
| Access control (URL) | `authorizeHttpRequests(...)` in `SecurityFilterChain` | First match wins |
| Access control (method) | `@PreAuthorize`, `@PostAuthorize` | Requires `@EnableMethodSecurity` |
| JWT validation | `NimbusJwtDecoder` + `BearerTokenAuthenticationFilter` | Auto via `oauth2ResourceServer` |
| OAuth2 social login | `oauth2Login()` + `spring-boot-starter-oauth2-client` | OIDC user in `OidcUser` |
| M2M auth | Client Credentials flow | No user; service authenticates |
| CSRF disable | `csrf(AbstractHttpConfigurer::disable)` | Correct for stateless JWT APIs |
| CORS config | `http.cors(cors -> cors.configurationSource(...))` | Must be at security layer |

## Further Reading

- [Security Filter Chain](../spring-security/security-filter-chain.md) — filter architecture in depth
- [Authentication](../spring-security/authentication.md) — `UserDetailsService`, `PasswordEncoder`, auth flow
- [Authorization](../spring-security/authorization.md) — `@PreAuthorize`, SpEL expressions, `PermissionEvaluator`
- [JWT](../spring-security/jwt.md) — token structure, signing, claims-to-authorities mapping
- [OAuth2 & OIDC](../spring-security/oauth2-oidc.md) — authorization flows, resource server, social login
- [CSRF & CORS](../spring-security/csrf-cors.md) — when to disable CSRF, CORS preflight configuration
