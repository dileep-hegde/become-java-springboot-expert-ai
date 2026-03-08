---
id: authentication-demo
title: "Authentication — Practical Demo"
description: Hands-on code examples for Spring Security authentication — UserDetailsService, BCrypt, custom login endpoint, and accessing the current user.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - spring-security
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Authentication — Practical Demo

> Hands-on examples for [Authentication](../authentication.md). We build a complete username/password login flow: load user from DB, hash passwords, authenticate, and return a token.

:::info Prerequisites
Understand [Authentication](../authentication.md) concepts before running these examples — particularly `UserDetailsService`, `PasswordEncoder`, and how `AuthenticationManager` delegates to `DaoAuthenticationProvider`.
:::

---

## Example 1: `UserDetailsService` Backed by JPA

The minimal implementation to load a user from a database:

```java title="User.java (JPA entity)"
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;      // ← always store the bcrypt hash, never plaintext

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> roles = new HashSet<>();  // e.g., {"USER"}, {"ADMIN"}

    // getters / setters / constructors omitted for brevity
}
```

```java title="UserRepository.java"
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

```java title="AppUserDetailsService.java" showLineNumbers {11,16}
@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)  // [11] "username" = email here
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(username)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found: " + username)); // [16] safe: Spring converts this to BadCredentialsException (no username leak)

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())   // ← must already be bcrypt-hashed
                .roles(user.getRoles().toArray(new String[0]))
                .build();
    }
}
```

**Expected Output (dev log):**
```
TRACE o.s.s.a.dao.DaoAuthenticationProvider - Authenticated user
```

---

## Example 2: Password Hashing — Registration Endpoint

Never store plaintext passwords. Hash at registration time:

```java title="AuthController.java (registration)" showLineNumbers {13}
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        String hash = passwordEncoder.encode(request.password());  // [13] hash before saving
        User user = new User(request.email(), hash, Set.of("USER"));
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
```

```java title="SecurityConfig.java (PasswordEncoder bean)"
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();  // ← cost factor 10 by default
}
```

**Verify the hash manually (unit test):**

```java title="PasswordEncoderTest.java"
@Test
void bcryptHashIsVerifiable() {
    PasswordEncoder encoder = new BCryptPasswordEncoder();
    String raw = "myStrongPassword";

    String hash1 = encoder.encode(raw);
    String hash2 = encoder.encode(raw);   // different hash each time (random salt)

    assertThat(hash1).isNotEqualTo(hash2);                  // ← random salt makes them different
    assertThat(encoder.matches(raw, hash1)).isTrue();        // ← but both verify correctly
    assertThat(encoder.matches("wrong", hash1)).isFalse();
}
```

---

## Example 3: Custom Login Endpoint (Returns a JWT)

Using `AuthenticationManager` programmatically to authenticate and return a JWT:

```java title="AuthController.java (login)" showLineNumbers {14,18,24}
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(  // [14] wrap credentials in authentication token
                    request.email(),
                    request.password()
                )
            );

            UserDetails user = (UserDetails) authentication.getPrincipal();  // [18] get the loaded UserDetails
            String token = jwtService.generateToken(user);                   // generate JWT

            return ResponseEntity.ok(new TokenResponse(token));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)            // [24] convert to 401
                    .body(new TokenResponse(null));
        }
    }
}
```

```java title="LoginRequest.java"
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password
) {}
```

```java title="TokenResponse.java"
public record TokenResponse(String accessToken) {}
```

**Test with HTTPie or curl:**
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"StrongPass1!"}'

# Login → receive JWT
curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"StrongPass1!"}'
# Response: {"accessToken": "eyJ..."}

# Use the token
curl -H "Authorization: Bearer eyJ..." http://localhost:8080/api/me
```

---

## Example 4: Custom `UserDetails` with Domain ID

When you need to access the database user ID (not just the username) from a controller:

```java title="AppUserDetails.java" showLineNumbers {24}
public class AppUserDetails implements UserDetails {

    private final Long id;          // ← domain-specific field
    private final String email;
    private final String passwordHash;
    private final Collection<GrantedAuthority> authorities;

    public AppUserDetails(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.authorities = user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }  // ← custom accessor

    @Override public String getUsername()  { return email; }
    @Override public String getPassword()  { return passwordHash; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }  // [24] connect to DB flag in production
}
```

```java title="ProfileController.java"
@GetMapping("/api/me")
public ResponseEntity<UserProfileDto> me(
        @AuthenticationPrincipal AppUserDetails user) {  // ← Spring injects the principal
    return ResponseEntity.ok(userService.getProfile(user.getId())); // ← use the domain ID
}
```

---

## Example 5: Spring Security Test — Mock Authenticated User

Testing protected endpoints without a real login:

```java title="AuthControllerTest.java" showLineNumbers
@SpringBootTest
@AutoConfigureMockMvc
class ProfileControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")  // ← mock auth context
    void authenticatedUserCanAccessProfile() throws Exception {
        mockMvc.perform(get("/api/me"))
               .andExpect(status().isOk());
    }

    @Test
    void unauthenticatedUserGets401() throws Exception {
        mockMvc.perform(get("/api/me"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void userRoleCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
               .andExpect(status().isForbidden());  // ← 403
    }
}
```

:::tip Key takeaway
`@WithMockUser` injects a fake `Authentication` into `SecurityContextHolder` for the duration of the test. No database, no tokens needed.
:::
