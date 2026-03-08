---
id: oauth2-oidc-demo
title: "OAuth2 and OIDC — Practical Demo"
description: Hands-on examples for OAuth2 and OpenID Connect in Spring Boot — social login, resource server with external auth server, client credentials for microservices, and accessing OIDC user info.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - spring-security
  - advanced
  - demo
last_updated: 2026-03-08
---

# OAuth2 and OIDC — Practical Demo

> Hands-on examples for [OAuth2 & OIDC](../oauth2-oidc.md). We cover three real-world scenarios: social login with Google, securing an API with an external Keycloak server, and service-to-service communication with Client Credentials.

:::info Prerequisites
Understand [OAuth2 & OIDC](../oauth2-oidc.md) concepts — grant types, roles, token types — before running these examples. The [JWT Demo](./jwt-demo.md) covers the token internals in detail.
:::

---

## Example 1: Social Login with Google (OIDC Authorization Code Flow)

The user clicks "Login with Google"; your app receives an ID Token with their identity.

**Step 1 — Add dependency**

```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

**Step 2 — Configure Google as OIDC provider**

```yaml title="application.yml"
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}         # ← from Google Cloud Console
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - openid    # ← triggers OIDC — issues an ID token
              - profile
              - email
            redirect-uri: "{baseUrl}/login/oauth2/code/google"  # ← Spring's default callback path
```

**Step 3 — Configure Security**

```java title="SecurityConfig.java" showLineNumbers {10}
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(Customizer.withDefaults());  // [10] enables the full OIDC login redirect flow
        return http.build();
    }
}
```

**What happens at runtime:**
1. `GET /profile` (unauthenticated) → Spring redirects to `https://accounts.google.com/...`
2. User logs in with Google and grants consent
3. Google redirects to `/login/oauth2/code/google?code=xyz`
4. Spring exchanges the code for tokens (ID token + access token)
5. User is authenticated; `OidcUser` is in `SecurityContextHolder`

---

## Example 2: Accessing OIDC User Info in a Controller

```java title="ProfileController.java" showLineNumbers {8,12}
@RestController
public class ProfileController {

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> profile(
            @AuthenticationPrincipal OidcUser oidcUser) {  // [8] Spring injects after OIDC login

        return ResponseEntity.ok(new UserProfileDto(
            oidcUser.getSubject(),     // [12] "sub" — stable unique ID from Google
            oidcUser.getFullName(),    // "name" claim
            oidcUser.getEmail(),       // "email" claim
            oidcUser.getPicture()      // "picture" claim — profile photo URL
        ));
    }
}
```

```java title="UserProfileDto.java"
public record UserProfileDto(String id, String name, String email, String picture) {}
```

---

## Example 3: Persist the OIDC User to Your Database

On first login, save the user. On subsequent logins, load their existing record:

```java title="OidcUserService.java" showLineNumbers {12}
@Service
public class OidcUserService extends DefaultOidcUserService {

    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);  // ← loads claims from OIDC provider

        // Upsert — create if new, return existing if returning user
        userRepository.findByExternalId(oidcUser.getSubject())  // [12] stable sub = stable DB record
            .orElseGet(() -> userRepository.save(new AppUser(
                oidcUser.getSubject(),
                oidcUser.getEmail(),
                oidcUser.getFullName()
            )));

        return oidcUser;  // ← return the OIDC user for Spring Security to store in SecurityContext
    }
}
```

```java title="SecurityConfig.java (wire the custom service)"
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http,
        OidcUserService oidcUserService) throws Exception {
    http
        .oauth2Login(oauth2 -> oauth2
            .userInfoEndpoint(userInfo -> userInfo
                .oidcUserService(oidcUserService)  // ← our custom service
            )
        );
    return http.build();
}
```

---

## Example 4: Spring Boot as a JWT Resource Server (Keycloak Auth Server)

Your API validates tokens issued by an external Keycloak authorization server.

**Step 1 — Dependency**
```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

**Step 2 — Config (pointing to Keycloak)**
```yaml title="application.yml"
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          # Keycloak's OpenID Connect discovery endpoint — Spring auto-fetches the JWKS URI from here
          issuer-uri: http://localhost:8180/realms/myrealm
```

**Step 3 — Security config + Keycloak role mapping**

Keycloak puts realm roles in `realm_access.roles` — a nested JSON object, not a flat `roles` claim.

```java title="SecurityConfig.java" showLineNumbers {18}
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
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(keycloakJwtConverter())  // [18] map Keycloak roles
                )
            );
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter keycloakJwtConverter() {
        Converter<Jwt, Collection<GrantedAuthority>> rolesConverter = jwt -> {
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess == null) return List.of();

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.getOrDefault("roles", List.of());
            return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
        };

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(rolesConverter);
        return converter;
    }
}
```

**Testing with curl + Keycloak token:**
```bash
# Get a token from Keycloak (Client Credentials for testing)
TOKEN=$(curl -s -X POST http://localhost:8180/realms/myrealm/protocol/openid-connect/token \
  -d "grant_type=client_credentials&client_id=test-client&client_secret=abc123" \
  | jq -r .access_token)

# Call the API with the Keycloak-issued JWT
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/orders
```

---

## Example 5: Client Credentials — Service-to-Service Calls

Microservice A calls Microservice B with a token obtained from the auth server directly (no user):

```yaml title="application.yml (Service A)"
spring:
  security:
    oauth2:
      client:
        registration:
          inventory-service:
            authorization-grant-type: client_credentials
            client-id: ${INVENTORY_CLIENT_ID}
            client-secret: ${INVENTORY_CLIENT_SECRET}
            scope: read:inventory
        provider:
          inventory-service:
            token-uri: http://localhost:8180/realms/myrealm/protocol/openid-connect/token
```

```java title="InventoryClient.java" showLineNumbers {9}
@Component
public class InventoryClient {

    private final WebClient webClient;

    public InventoryClient(OAuth2AuthorizedClientManager authorizedClientManager) {
        ServletOAuth2AuthorizedClientExchangeFilterFunction oauth2 =
            new ServletOAuth2AuthorizedClientExchangeFilterFunction(authorizedClientManager);
        oauth2.setDefaultClientRegistrationId("inventory-service");  // [9] auto-attaches token

        this.webClient = WebClient.builder()
                .baseUrl("http://inventory-service/api")
                .apply(oauth2.oauth2Configuration())
                .build();
    }

    public InventoryDto getInventory(Long productId) {
        return webClient.get()
                .uri("/inventory/{id}", productId)
                .retrieve()
                .bodyToMono(InventoryDto.class)
                .block();  // ← sync call; use .subscribe() in reactive context
    }
}
```

**What happens under the hood:**
1. First call: Spring fetches an access token using Client Credentials from the token URI.
2. Token is cached by `OAuth2AuthorizedClientManager` until it expires.
3. Every `WebClient` request automatically includes `Authorization: Bearer <cached_token>`.
4. On token expiry, Spring automatically fetches a new one.

:::tip Key takeaway
The OAuth2-aware `WebClient` completely removes the boilerplate of token management in service-to-service calls — you just call the API normally and the token is attached automatically.
:::
