---
id: resume-interview-prep
title: Resume-Based Interview Questions
description: Interview Q&A mapped directly to resume experiences — legacy migration, security hardening, containerization, Apache POI, and behavioral STAR stories.
sidebar_position: 20
tags:
  - interview-prep
  - java
  - spring-boot
  - migration
  - docker
  - kubernetes
  - security
  - behavioral
last_updated: 2026-03-08
---

# Resume-Based Interview Questions

> Questions an interviewer is likely to ask based on specific bullet points and technologies on the resume — organized by topic and difficulty. Use this for targeted revision before interviews, especially for screening rounds where the interviewer has your resume in hand.

## How to Use This Page

- **Before a call**: read through the section matching the job description (migration, cloud, security, etc.)
- **Intermediate** questions are the ones you will almost certainly be asked — rehearse them out loud
- Behavioral questions follow the **STAR** pattern (Situation, Task, Action, Result)

---

## Spring Boot Migration (Struts → Spring Boot)

### Beginner

#### Q: What is Apache Struts? Why was it replaced?

Apache Struts is a Java MVC web framework popular in the 2000s. It uses XML-heavy configuration, an `ActionServlet` dispatcher, and `ActionForm` objects. It fell out of favour because the configuration overhead is high, testing is painful, and a historic remote-code-execution vulnerability (CVE-2017-5638) accelerated its retirement. Spring Boot replaced it because convention-over-configuration, auto-wiring, and embedded Tomcat dramatically reduce the boilerplate burden.

#### Q: What does a Spring Boot application need to start?

A class annotated with `@SpringBootApplication` and a `main` method that calls `SpringApplication.run(App.class, args)`. `@SpringBootApplication` combines `@SpringBootConfiguration`, `@EnableAutoConfiguration`, and `@ComponentScan`. Spring Boot then auto-configures everything it finds on the classpath — a `DataSource` from HikariCP if a database driver is present, `DispatcherServlet` if Spring MVC is present, and so on.

---

### Intermediate

#### Q: Walk me through the key steps of migrating an Apache Struts application to Spring Boot.

The migration involved five phases:

1. **Dependency replacement** — removed Struts, added `spring-boot-starter-web` and related starters in Maven/Gradle.
2. **Controller mapping** — replaced `Action` classes and `struts-config.xml` mapping with `@RestController` / `@Controller` classes and `@RequestMapping` annotations.
3. **Data layer modernisation** — replaced JDBC `PreparedStatement` code with Spring Data JPA repositories and `@Entity` mappings.
4. **Configuration migration** — moved XML-based bean definitions to `@Configuration` classes and `application.properties`.
5. **Testing** — wrote `@SpringBootTest` integration tests and `@WebMvcTest` slice tests to validate the migrated behaviour against the legacy behaviour.

The rule of thumb: convert one vertical slice (controller → service → repository) at a time and test before moving on.

#### Q: What is Spring Data JPA and how does it simplify database access?

Spring Data JPA is a layer on top of JPA (Java Persistence API) and Hibernate. It eliminates boilerplate by generating repository implementations at runtime. You define an interface that extends `JpaRepository<Entity, ID>`, declare query methods using keyword-based naming (`findByEmailAndStatus`), or annotate with `@Query` for custom JPQL. No `EntityManager` boilerplate, no `try-catch` around `commit()`/`rollback()`. Spring Boot auto-configures the `DataSource`, `EntityManagerFactory`, and transaction management from `application.properties`.

```java
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    List<LoanApplication> findByApplicantEmailOrderByCreatedAtDesc(String email); // ← generated at runtime
}
```

#### Q: How would you handle the migration of session-scoped data that Struts stores in `ActionForm`?

Struts `ActionForm` objects are HTTP-session-scoped form holders. In Spring MVC the equivalent is either:
- **`@ModelAttribute`** — binds request parameters to a POJO for a single request/form submission.
- **`@SessionAttributes`** — retains specific model attributes across requests within a session (wizard-style multi-step forms).
- **Spring Session** — for distributed session management when the migrated application runs in a container cluster (GCP/K8s).

Most data that lived in `ActionForm` ends up as a `@RequestBody` DTO on a REST endpoint once you modernise the frontend.

---

### Advanced

#### Q: What were the biggest technical risks when migrating a running production system from Struts to Spring Boot?

Three categories of risk stand out:

1. **Behaviour parity** — Struts has implicit type conversion, custom validators, and navigation rules encoded in XML. Reproducing the exact same validation and routing logic requires mapping every `global-forwards`, `action-mapping`, and validator rule to Spring equivalents. An automated test suite covering every form submission path is the primary safety net.
2. **DB transaction semantics** — moving from manual `Connection.commit()` to `@Transactional` can change rollback boundaries silently. Read everything about `@Transactional` propagation and isolation before switching.
3. **Session/state leakage** — if the legacy app relied on `ActionForm` objects being mutated across requests (stale model), your new stateless REST endpoints will behave differently. Auditing the session lifecycle before migration prevents subtle bugs.

**Follow-up:** How did you verify the migration produced the same output?  
**A:** Side-by-side integration tests comparing HTTP responses from the legacy app (deployed in parallel) against the new Spring Boot app for the same inputs. Feature flags in the API gateway allowed gradual traffic shifting (canary deployment) before fully cutting over.

---

## Containerisation, Docker & Kubernetes

### Beginner

#### Q: What is Docker and why do we containerise applications?

Docker packages an application with all its runtime dependencies (JRE, config files, libraries) into an image. That image runs identically on any host, eliminating the "works on my machine" problem. A container is a running instance of an image. The key benefit for a Java web app is repeatable deployments — the same image that passed QA is promoted directly to production without re-building.

#### Q: What is Kubernetes (K8s)?

Kubernetes is a container orchestration system. It manages clusters of container hosts and automates deployment, scaling, health monitoring, and rollback of containerised workloads. Core objects: `Deployment` (desired state of pods), `Service` (stable DNS + IP for pods), `ConfigMap`/`Secret` (externalised config), and `Ingress` (HTTP routing).

---

### Intermediate

#### Q: How does a typical Spring Boot Dockerfile look?

```dockerfile
FROM eclipse-temurin:17-jre-alpine          # ← slim base image with only the JRE
WORKDIR /app
COPY target/loan-app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]       # ← Spring Boot fat-jar entry point
```

For larger projects, a multi-stage build separates compilation from the runtime image, keeping the final image small.

#### Q: How did containerising the application reduce deployment time by 40%?

Before containerisation, deployment involved: SSH into the server → stop WebSphere → copy the new WAR (FTP or SCP, slow for fat WARs) → configure server variables → restart → wait for JVM warmup. Post-containerisation, a CI pipeline built an image, pushed it to a container registry (GCR on GCP), and Kubernetes executed a rolling update — replacing old pods with new ones with zero downtime. The reduction came from eliminating the manual steps and the WebSphere startup overhead (Spring Boot embedded Tomcat starts a fraction quicker).

#### Q: What is a Kubernetes rolling update and how does it maintain availability?

A rolling update replaces pods incrementally. With the default strategy, Kubernetes ensures at least `maxUnavailable` (default 25%) pods remain running and creates at most `maxSurge` (default 25%) extra pods. Traffic is only routed to pods that pass the readiness probe (e.g., `/actuator/health/readiness`). If the new pods fail their readiness check, the rollout pauses, preventing a bad deployment from taking the whole service down.

---

### Advanced

#### Q: What is the difference between a liveness probe and a readiness probe in Kubernetes?

Both are HTTP/TCP/exec checks Kubernetes runs against each pod. They serve different purposes:

| | Liveness Probe | Readiness Probe |
|---|---|---|
| **Question it answers** | Is the process still alive? | Is the pod ready to receive traffic? |
| **On failure** | Kubernetes kills and restarts the pod | Pod is removed from the Service's endpoint list |
| **Use case** | Detect deadlocks, hung JVMs | Warm-up, dependency wait (DB not yet ready) |

In Spring Boot: `/actuator/health/liveness` and `/actuator/health/readiness` are the standard endpoints (added in Boot 2.3).

**Follow-up:** What happens if you misconfigure the liveness probe to use a slow endpoint?  
**A:** Kubernetes restarts the pod prematurely under load, creating a restart loop that looks like an availability issue. Always point liveness at a lightweight endpoint that only checks process health (not downstream dependencies).

---

## Security Hardening (Veracode / SonarQube)

### Beginner

#### Q: What is static application security testing (SAST)?

SAST scans source code or bytecode without running the application, looking for patterns that match known vulnerability classes (SQL injection, XSS, insecure deserialization, weak cryptography). Tools like Veracode and SonarQube perform SAST. They integrate with CI pipelines and fail the build when findings exceed a configured severity threshold, enforcing a security quality gate before code reaches production.

#### Q: What is the difference between Veracode and SonarQube?

| | Veracode | SonarQube |
|---|---|---|
| **Primary focus** | Security vulnerabilities (OWASP Top 10, CWE) | Code quality + some security rules |
| **Scan type** | Binary / bytecode scan + developer sandbox | Source code analysis (rules engine) |
| **SAST** | Yes, deep binary analysis | Yes, lighter-weight rule matching |
| **Secrets detection** | Yes (in pipeline scanner) | Yes (basic) |
| **Typical use** | Client contractual audit, penetration gate | Day-to-day developer feedback |

---

### Intermediate

#### Q: What are common high-priority Veracode findings in a Java Spring Boot application?

The most common findings (CWE categories):

| Finding | CWE | Fix |
|---|---|---|
| SQL Injection | CWE-89 | Replace string-concatenated SQL with `PreparedStatement` or JPA named queries |
| Improper handling of sensitive data | CWE-312 | Mask PII in logs; use `@JsonProperty(access = WRITE_ONLY)` for passwords |
| Insecure deserialization | CWE-502 | Avoid `ObjectInputStream.readObject()` from untrusted sources; prefer JSON |
| Hardcoded credentials | CWE-798 | Externalise to environment variables or a secrets manager (Vault, AWS SM) |
| Path traversal | CWE-22 | Validate and sanitise user-supplied file paths; never concatenate them |
| Missing input validation | CWE-20 | Add `@Valid` + JSR-303 constraints on all `@RequestBody` and `@RequestParam` |

#### Q: How did you triage 150+ Veracode findings efficiently?

Triage follows severity and exploitability:

1. **Group by CWE** — all SQL injection findings share a root cause (string-concatenated queries), so one pattern fix resolves many at once.
2. **Filter by severity** — address Very High / High findings first (they block the security audit gate).
3. **Verify false positives** — Veracode flags some safe usages; annotate verified false positives with a suppression comment and documented rationale so they don't reappear.
4. **Fix systematically** — write a utility (e.g., a helper method for safe file path resolution) rather than patching each call site individually.
5. **Re-scan** — trigger a pipeline scan after each batch of fixes to confirm the finding count drops. Track progress in the team's JIRA board.

---

### Advanced

#### Q: What is the OWASP Top 10 and which categories did your Veracode fixes directly address?

The OWASP Top 10 (2021) is the industry-standard reference list of the most critical web application security risks. The categories most relevant to a Java enterprise application:

- **A01 Broken Access Control** — ensure users can't access records they don't own; checked via `@PreAuthorize` or row-level security.
- **A02 Cryptographic Failures** — avoid MD5/SHA1 for passwords; use BCrypt (Spring Security) or Argon2.
- **A03 Injection** — SQL injection, LDAP injection, command injection. Fixed by parameterised queries and `ProcessBuilder` with explicit argument arrays.
- **A05 Security Misconfiguration** — default passwords, verbose error pages, open actuator endpoints. Mitigated by Spring Security config locking down `/actuator/**`.
- **A08 Software and Data Integrity Failures** — deserialization issues. Addressed by replacing Java serialization with JSON (Jackson).

The 150+ Veracode findings primarily fell under A03 (injection in legacy JDBC code) and A08 (unsafe Java serialization in the legacy reporting module).

---

## Reporting with Apache POI (XLS → XLSX)

### Beginner

#### Q: What is Apache POI?

Apache POI is a Java library for reading and writing Microsoft Office files — primarily Excel (`HSSF` for legacy `.xls`, `XSSF` for `.xlsx`) and Word. It is the de-facto standard for report generation in Java enterprise applications that need spreadsheet output.

#### Q: Why was the XLS format a problem?

The legacy `.xls` format (BIFF8, `HSSFWorkbook`) uses a 16-bit row index, capping spreadsheets at **65,535 rows**. For large datasets — e.g., insurance claims exports with hundreds of thousands of records — the report silently truncated. The `.xlsx` format (OOXML, `XSSFWorkbook`) supports ~1,048,576 rows, eliminating the truncation entirely.

---

### Intermediate

#### Q: How did you migrate the reporting module from XLS to XLSX?

The migration was mostly a class-level swap with a few gotchas:

```java
// Before (legacy)
Workbook workbook = new HSSFWorkbook();           // ← .xls, 65,535 row limit
Sheet sheet = workbook.createSheet("Claims");

// After
Workbook workbook = new XSSFWorkbook();           // ← .xlsx, 1M+ rows
Sheet sheet = workbook.createSheet("Claims");

// For very large exports, use SXSSF (streaming) to avoid OOM
Workbook workbook = new SXSSFWorkbook(100);       // ← flushes to disk every 100 rows
```

The `Workbook`, `Sheet`, `Row`, and `Cell` interfaces are shared, so the transformation code (`row.createCell(...)`) required no changes beyond the constructor swap. The content-type header in the HTTP response also changed from `application/vnd.ms-excel` to `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` and the filename extension from `.xls` to `.xlsx`.

#### Q: What is `SXSSFWorkbook` and when should you use it?

`SXSSFWorkbook` ("Streaming XSSF") is a low-memory mode for `.xlsx` generation. It keeps only a configurable window of rows in memory (`windowSize` rows) and flushes earlier rows to a temporary file on disk. Use it whenever export size is unpredictable or could exceed JVM heap (typically more than ~50,000 rows with styled cells). The trade-off: you cannot go back and modify rows that have been flushed, so streaming works only for sequential write scenarios.

---

## Build Tools & CI/CD (Maven, Gradle, Jenkins)

### Beginner

#### Q: What is Maven? What does `pom.xml` define?

Maven is a build automation tool for Java projects. `pom.xml` (Project Object Model) declares:
- **Coordinates** (`groupId`, `artifactId`, `version`) — uniquely identify the artifact.
- **Dependencies** — JAR dependencies pulled from Maven Central or a corporate Nexus/Artifactory.
- **Build plugins** — `maven-compiler-plugin`, `spring-boot-maven-plugin`, Surefire for tests.
- **Properties** — Java version, encoding, dependency version variables.

Maven follows a fixed lifecycle: `validate → compile → test → package → verify → install → deploy`.

#### Q: What is the difference between Maven and Gradle?

| | Maven | Gradle |
|---|---|---|
| **Config format** | XML (`pom.xml`) | Groovy/Kotlin DSL (`build.gradle`) |
| **Build model** | Fixed lifecycle phases | Task graph (flexible) |
| **Incremental builds** | Limited (via extensions) | First-class support |
| **Speed** | Slower for large projects | Faster (build cache, daemon) |
| **Learning curve** | Lower (declarative) | Higher for advanced customisation |

Both are first-class citizens in Spring Boot — choose Gradle for large multi-module projects where build speed matters.

---

### Intermediate

#### Q: What is the difference between Jenkins and Hudson?

Hudson was the original CI/CD platform donated to the Eclipse Foundation. Oracle retained the Hudson name after a governance dispute; the community forked it as Jenkins. Jenkins became the dominant open-source CI server. Hudson is now largely unmaintained. In practice, Jenkins pipelines use either **Declarative** (`Jenkinsfile` with `pipeline { }` block) or **Scripted** (`node { }` block) syntax to define build, test, and deploy stages.

#### Q: How does Maven enforce reproducible builds with `<dependencyManagement>`?

`<dependencyManagement>` centralises version declarations (typically in a parent POM or a BOM). Child modules declare dependencies **without versions** — the version resolves from the parent's `<dependencyManagement>` block. This prevents version drift across modules and is how Spring Boot's parent POM pins the version of every starter dependency. Example:

```xml
<!-- parent pom.xml -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <version>42.7.3</version>       <!-- ← one source of truth -->
    </dependency>
  </dependencies>
</dependencyManagement>
```

---

## Behavioral / STAR Questions

### Adapting to an Unfamiliar Codebase Under Time Pressure

#### Q: Tell me about a time you had to understand and modify unfamiliar code under strict time constraints.

**Situation:** During a natural disaster, policyholders urgently needed instructions for filing emergency claims through the insurance portal. The information module that should have displayed these instructions was incomplete.

**Task:** I was asked to implement the critical information module in a Vue.js frontend codebase I had never worked in — on a tight deadline to meet the emergency.

**Action:** I started by tracing the existing module structure top-down in the Vue.js component tree (parent layout → route-matched page → child components) rather than reading files linearly. I identified the data flow (Vuex store → API call → component rendering), replicated the pattern from an adjacent module, and wrote the minimum code needed to fetch and render the emergency instructions from the backend API. I skipped non-critical styling refinements to meet the deadline.

**Result:** The module was delivered on time. Policyholders received the emergency filing information through the portal during the event. Post-incident, I cleaned up the remaining styling and wrote a brief knowledge-transfer note for the frontend team.

---

### Mitigating 150+ Security Findings

#### Q: Describe a situation where you meaningfully improved the security posture of a codebase.

**Situation:** The application was scheduled for a mandatory client security audit. A Veracode scan surfaced 150+ high-priority findings — primarily SQL injection patterns and unsafe serialization — that were blocking audit approval.

**Task:** Resolve enough findings to pass the audit gate within the sprint cycle.

**Action:** I grouped findings by CWE category and fixed the most prevalent patterns first (SQL injection in JDBC code). I replaced every string-concatenated SQL statement with parameterised `PreparedStatement` calls or named JPA query parameters. For deserialization findings, I replaced Java object serialization with JSON (Jackson) wherever the data crossed a trust boundary. I documented all suppressed false positives with a comment explaining the inspection rationale.

**Result:** The finding count dropped enough for the application to pass the security audit. The systematic grouping approach meant fixing the root cause once resolved 20–30 related findings simultaneously, making the effort manageable within a single sprint.

---

### Reducing Deployment Time

#### Q: Give an example of improving a slow or unreliable process.

**Situation:** Deploying the on-premise insurance claims application required manual steps: SSH access, WebSphere management console operations, FTP of WAR files, and coordination with infrastructure team. End-to-end deployment took several hours and was error-prone.

**Task:** As part of the Struts-to-Spring Boot migration initiative, we also had to containerise and move the application to GCP.

**Action:** I containerised the application using Docker (multi-stage Dockerfile), wrote Kubernetes deployment manifests with health probes and rolling update strategy, and configured a CI/CD pipeline (Jenkins) to build, test, push image to GCR, and trigger a `kubectl rollout` automatically on successful builds.

**Result:** Deployment time reduced by 40%. The process became repeatable, automated, and zero-touch — reducing human error and freeing the team from manual deployment coordination.

---

## General Technical Questions (Based on Resume Tech Stack)

### Beginner

#### Q: What is the difference between PostgreSQL and MS SQL Server?

Both are RDBMS but differ in licensing, ecosystem, and defaults:

| | PostgreSQL | MS SQL Server |
|---|---|---|
| **License** | Open source (PostgreSQL License) | Commercial (free Express edition) |
| **Platform** | Cross-platform | Windows-first (Linux supported since 2017) |
| **JSON support** | First-class (`jsonb` indexable column) | Moderate (`JSON` functions, no dedicated type) |
| **Stored procedure language** | PL/pgSQL (+others) | T-SQL |
| **Default isolation** | Read Committed | Read Committed |
| **Auto-vacuum** | Built-in MVCC, auto-vacuum | Relies on SQL Server Agent |

From a Spring Boot perspective, the `spring.datasource.url` and driver class are the only changes — the JPA abstraction stays the same.

#### Q: What is Hibernate? How does it relate to JPA?

JPA (Jakarta Persistence API) is a specification — an interface contract describing how Java objects should map to relational tables and how queries should be written (JPQL). Hibernate is the most popular JPA implementation — the actual engine. When you add `spring-boot-starter-data-jpa`, you get Hibernate as the provider automatically. You write code against JPA interfaces (`EntityManager`, `@Entity`, `@Query`) but Hibernate executes the SQL at runtime.

---

### Intermediate

#### Q: What is `@Transactional` and when is it needed?

`@Transactional` on a Spring-managed bean method wraps the method body in a database transaction. Spring's AOP proxy intercepts the call, begins a transaction before entry, and commits (or rolls back on unchecked exception) on exit. It is needed for:
- Any write operation that must be atomic (save + update must both succeed or both fail).
- Keeping an `EntityManager` session open across multiple lazy-loaded associations within a service method.
- Ensuring read operations see a consistent snapshot across multiple repository calls.

Common pitfalls: calling a `@Transactional` method from within the same bean bypasses the proxy (no transaction), and checked exceptions do not trigger rollback by default — use `rollbackFor = Exception.class` to change this.

#### Q: What is the N+1 query problem and how do you solve it with JPA?

The N+1 problem occurs when loading a parent entity fires one query, then fetching each child entity fires one additional query per parent — N parents = N+1 total queries. It happens with `FetchType.LAZY` on associations when you iterate over the collection outside of the original transaction.

Solutions:
- **`@EntityGraph`** — specify which associations to eagerly join-fetch for a specific query.
- **`JOIN FETCH` in JPQL** — `SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id`.
- **`@BatchSize`** — Hibernate batches child lookups into a single `IN (...)` query.
- **Projections (Spring Data)** — return a flat interface/DTO directly, bypassing the association entirely.

---

### Advanced

#### Q: How do you select between a Stored Procedure and JPA for database operations in a legacy integration?

Stored procedures are appropriate when:
- You are integrating with a legacy database owned by another team that exposes logic only via SPs.
- Complex set-based operations (multi-table aggregations) are faster set-based in SQL than loading objects into Java.
- The procedure already exists and re-engineering it carries business risk.

JPA/JPQL is preferable when:
- The team owns the schema and can evolve it independently.
- You need testability — mocking a `JpaRepository` is trivial; mocking a stored procedure call is not.
- The logic belongs in the application layer (business rules) rather than the database.

Spring Data JPA supports stored procedure calls via `@Procedure` on a repository method or `EntityManager.createStoredProcedureQuery()` for more control.

---

## Further Reading

- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/) — official source for Spring Boot auto-configuration, profiles, and testing
- [OWASP Top 10](https://owasp.org/Top10/) — authoritative categorisation of web security risks
- [Apache POI Documentation](https://poi.apache.org/components/spreadsheet/) — official guide for `XSSFWorkbook`, `SXSSFWorkbook`, and HSSF/XSSF differences
- [Docker Official Documentation](https://docs.docker.com/get-started/) — containers, images, multi-stage builds
- [Kubernetes Concepts](https://kubernetes.io/docs/concepts/) — pods, deployments, and probes

## Related Notes

- [Spring Boot Interview Questions](./spring-boot-interview-prep.md) — deep-dives on auto-configuration, profiles, and testing slices that back up many of the migration answers above
- [Databases Interview Questions](./databases-interview-prep.md) — SQL, transactions, and JPA questions that complement the PostgreSQL / MS SQL Server and N+1 answers here
- [Version Control Interview Questions](./version-control-interview-prep.md) — Git workflow questions for the SVN-to-Git transition implied by the resume's version control evolution
