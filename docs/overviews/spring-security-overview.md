---
id: spring-security-overview
title: Spring Security Overview
description: Quick-reference summary of Spring Security's filter chain, authentication, authorization, JWT, OAuth2, CSRF, and CORS — key concepts, annotations, and interview questions at a glance.
sidebar_position: 13
tags:
  - spring-security
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Spring Security Overview

> Spring Security is the standard security framework for Spring applications. Every HTTP request passes through an ordered chain of filters that authenticate the caller, enforce access rules, and protect against CSRF/CORS attacks before the request reaches any controller. Understanding the filter chain architecture, JWT validation, and OAuth2 flows is essential for building production-grade APIs.

## Key Concepts at a Glance

- **Security Filter Chain**: An ordered list of servlet filters — configured as a `SecurityFilterChain` bean — that every request passes through before reaching the application.
- **`DelegatingFilterProxy`**: The single servlet filter registered in the container; it delegates to Spring's `FilterChainProxy`.
- **`FilterChainProxy`**: The Spring Security component that holds all `SecurityFilterChain` beans and routes each request to the first matching chain.
- **`SecurityContextHolder`**: `ThreadLocal`-backed store that holds the `SecurityContext` (which contains the logged-in user's `Authentication`) for the current request thread.
- **`Authentication`**: Holds the principal (user identity), credentials (erased after auth), and a `Collection<GrantedAuthority>`.
- **`UserDetailsService`**: Interface you implement to load a user record from your database by username.
- **`BCryptPasswordEncoder`**: The standard `PasswordEncoder` for Spring Boot apps — slow, salted hash that resists brute-force and rainbow-table attacks.
- **`AuthenticationManager`**: The entry point for authentication; delegates to one or more `AuthenticationProvider` implementations.
- **`DaoAuthenticationProvider`**: The default provider for username/password auth — calls `UserDetailsService` + `PasswordEncoder`.
- **`AuthorizationFilter`**: The final filter; evaluates the rules in `authorizeHttpRequests(...)`. First matching rule wins.
- **`@EnableMethodSecurity`**: Activates `@PreAuthorize`, `@PostAuthorize`, `@PreFilter`, `@PostFilter` for method-level access control.
- **`@PreAuthorize`**: SpEL expression evaluated before a method runs; throws `AccessDeniedException` if false.
- **Role vs Authority**: A role is an authority with the `ROLE_` prefix. `hasRole('ADMIN')` checks for `ROLE_ADMIN`; `hasAuthority('read:orders')` checks exact string.
- **JWT (JSON Web Token)**: Compact, self-contained token — three Base64URL parts (Header.Payload.Signature) — that carries user identity and claims; server validates signature without a DB lookup.
- **`JwtDecoder`**: Spring Security component that validates a JWT's signature, `exp`, `iss`, and `aud` claims on every request.
- **`JwtAuthenticationConverter`**: Maps JWT claims to Spring `GrantedAuthority` objects; customize when roles are in a non-standard claim.
- **OAuth2 Authorization Code Flow**: The user authenticates with an external authorization server; the backend exchanges an authorization code for tokens. The token never passes through the browser URL.
- **Client Credentials Flow**: Service-to-service auth — the service authenticates directly with the authorization server using `client_id` + `client_secret`.
- **OIDC (OpenID Connect)**: Extension of OAuth2 that adds an ID Token (a JWT with user identity claims: `sub`, `name`, `email`) for authenticating users via social login.
- **CSRF (Cross-Site Request Forgery)**: Attack where a malicious site tricks the browser into sending requests using session cookies. Mitigated by CSRF tokens. Disable for stateless JWT APIs.
- **CORS (Cross-Origin Resource Sharing)**: Browser policy blocking cross-origin requests. Configure via `http.cors()` so OPTIONS preflight is handled before authentication filters.

---

## Quick-Reference Table

| Annotation / API | Purpose | Key Note |
|---|---|---|
| `SecurityFilterChain` bean | Defines the security rules for a URL namespace | Declare multiple with `@Order` for different namespaces |
| `@EnableWebSecurity` | Enables Spring Security's web security support | Often used with `@Configuration` |
| `@EnableMethodSecurity` | Activates `@PreAuthorize` etc. | Replaces deprecated `@EnableGlobalMethodSecurity` |
| `http.authorizeHttpRequests(...)` | URL-based access rules — evaluated top to bottom | Put `anyRequest()` last |
| `http.csrf(AbstractHttpConfigurer::disable)` | Disables CSRF protection | Correct for stateless JWT REST APIs |
| `http.cors(cors -> cors.configurationSource(...))` | Configures CORS at the security layer | Must be here — not only in `WebMvcConfigurer` |
| `http.oauth2ResourceServer(o -> o.jwt(...))` | Enables JWT Bearer token validation | Auto-configures `BearerTokenAuthenticationFilter` |
| `http.oauth2Login(...)` | Social login (OIDC authorization code flow) | Principal is `OidcUser` after login |
| `SessionCreationPolicy.STATELESS` | Prevents session creation/use | Required for stateless JWT APIs |
| `@PreAuthorize("hasRole('X')")` | Gate method on role | Works on `public` methods only (proxy limitation) |
| `@PreAuthorize("#id == authentication.principal.id")` | Check method param against current user | Parameter binding via `#paramName` |
| `@PostAuthorize("returnObject.ownerId == ...")` | Check returned value after method runs | Costs a DB query even if check fails |
| `@AuthenticationPrincipal Jwt jwt` | Inject decoded JWT in controller | Works with resource server setup |
| `@AuthenticationPrincipal OidcUser user` | Inject OIDC user after social login | Use `.getSubject()`, `.getEmail()` |
| `@WithMockUser(roles = "ADMIN")` | Mock auth in Spring Security tests | No real auth required |
| `BCryptPasswordEncoder` | Hashes and verifies passwords | Use cost factor ≥ 10 |
| `CookieCsrfTokenRepository.withHttpOnlyFalse()` | CSRF token in readable cookie for SPAs | Allows JS to read and include token in header |
| `JwtGrantedAuthoritiesConverter` | Maps JWT claims to authorities | Set `authoritiesClaimName` for custom claim |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Security Filter Chain](../spring-security/security-filter-chain.md) — start here; the mental model of how filters compose explains all Spring Security behaviour.
2. [Authentication](../spring-security/authentication.md) — `UserDetailsService` + `BCryptPasswordEncoder` + `AuthenticationManager`; the foundation for all login flows.
3. [Authorization](../spring-security/authorization.md) — URL rules vs. `@PreAuthorize`; the role/authority distinction; SpEL expressions.
4. [CSRF & CORS](../spring-security/csrf-cors.md) — fix the most common 403/401 config errors; know when to disable CSRF.
5. [JWT](../spring-security/jwt.md) — token structure, signing algorithms, `NimbusJwtDecoder`, claims-to-authorities mapping.
6. [OAuth2 & OIDC](../spring-security/oauth2-oidc.md) — Authorization Code, Client Credentials, PKCE; configure Spring Boot as client and resource server.

---

## Notes in This Domain

| Note | Description |
|------|-------------|
| [Security Filter Chain](../spring-security/security-filter-chain.md) | `DelegatingFilterProxy`, `FilterChainProxy`, `SecurityContextHolder`, custom filter registration. |
| [Authentication](../spring-security/authentication.md) | `UserDetailsService`, `BCryptPasswordEncoder`, `AuthenticationManager`, custom login endpoint. |
| [Authorization](../spring-security/authorization.md) | URL rules, `@PreAuthorize`, SpEL expressions, `PermissionEvaluator`. |
| [JWT](../spring-security/jwt.md) | Token structure, symmetric vs. asymmetric signing, Spring resource server validation, refresh tokens. |
| [OAuth2 & OIDC](../spring-security/oauth2-oidc.md) | Authorization Code, Client Credentials, PKCE, social login, resource server. |
| [CSRF & CORS](../spring-security/csrf-cors.md) | CSRF token protection, when to disable, CORS preflight, `CorsConfigurationSource`. |

---

## Top 5 Interview Questions

**Q1:** What is the Spring Security filter chain and how does it work?
**A:** Spring Security registers a `FilterChainProxy` bean that holds all `SecurityFilterChain` beans. Every HTTP request is intercepted by `DelegatingFilterProxy` (a standard servlet filter), which delegates to `FilterChainProxy`. It routes the request to the first `SecurityFilterChain` whose `requestMatcher` matches, then executes each filter in order: load user (`SecurityContextHolderFilter`), validate token/credentials, check CSRF, enforce access rules (`AuthorizationFilter`). Only after all filters pass does the request reach the controller.

**Q2:** How do you implement stateless JWT authentication in Spring Boot?
**A:** Add `spring-boot-starter-oauth2-resource-server`. Configure `spring.security.oauth2.resourceserver.jwt.jwk-set-uri` (or `secret-key`). In your `SecurityFilterChain`: set `SessionCreationPolicy.STATELESS`, disable CSRF (`csrf.disable()`), add `.oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))`. Spring Security adds `BearerTokenAuthenticationFilter` automatically — it extracts `Authorization: Bearer <token>`, validates via `JwtDecoder`, converts claims to authorities, and stores `JwtAuthenticationToken` in `SecurityContextHolder`. Use `@AuthenticationPrincipal Jwt jwt` in controllers to access claims.

**Q3:** What is the difference between `hasRole('ADMIN')` and `hasAuthority('read:orders')`?
**A:** Both check the user's `GrantedAuthority` collection. `hasRole('ADMIN')` automatically prefixes the argument with `ROLE_` and checks for `ROLE_ADMIN`. `hasAuthority('read:orders')` checks for the exact string `read:orders` with no prefix. The convention: use `hasRole` for coarse-grained roles (stored with `ROLE_` prefix), use `hasAuthority` for fine-grained permissions (OAuth2 scopes, permission strings like `write:products`). Mixing them incorrectly is a common source of inexplicable `403` errors.

**Q4:** Why do preflight OPTIONS requests fail with `401` in Spring Security and how do you fix it?
**A:** The browser sends an OPTIONS preflight request without an `Authorization` header to ask permission. Spring Security's `BearerTokenAuthenticationFilter` runs first, finds no token, and returns `401` — the actual request is never attempted. Fix: configure CORS via `http.cors(cors -> cors.configurationSource(...))` — Spring Security processes CORS headers before authentication for OPTIONS requests. Alternatively, add `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` to your authorization rules.

**Q5:** What is the difference between the OAuth2 Authorization Code flow and the Client Credentials flow?
**A:** Authorization Code involves a human user: they log in to the authorization server, grant consent, and the client receives a token scoped to their permissions. It is used by web and mobile apps. Client Credentials has no user: the service authenticates directly with the auth server using its own `client_id` + `client_secret` and receives a token representing the service. It is used for machine-to-machine API calls. In Spring Boot, configure Client Credentials with `authorization-grant-type: client_credentials` and use an OAuth2-aware `WebClient` to auto-attach tokens.

---

## Further Reading

- [Spring Security Docs](https://docs.spring.io/spring-security/reference/) — the official reference documentation
- [Spring Security Interview Q&A](../interview-prep/spring-security-interview-prep.md) — full set of interview questions
