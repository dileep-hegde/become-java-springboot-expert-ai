---
id: build-tools-index
title: Build Tools
description: Maven and Gradle — project structure, dependency management, lifecycle, plugins.
sidebar_position: 1
tags:
  - maven
  - gradle
  - overview
last_updated: 2026-03-07
---

# Build Tools

> Build tools automate compiling, testing, packaging, and deploying Java applications. Maven and Gradle are the two dominant choices in the Java ecosystem. Spring Boot defaults to Maven's plugin model; Gradle is increasingly preferred for large multi-module projects due to its incremental build performance and Kotlin-DSL.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Maven Basics | POM structure, lifecycle phases (`compile`, `test`, `package`, `install`, `deploy`). |
| Maven Dependency Management | Coordinates (groupId:artifactId:version), scopes, BOMs (`dependencyManagement`). |
| Maven Plugins | `spring-boot-maven-plugin`, Surefire (tests), Failsafe (integration tests). |
| Gradle Basics | `build.gradle.kts`, tasks, dependency configurations, Gradle wrapper. |
| Maven vs. Gradle | Build speed, configuration style, multi-module project support. |
| Spring Boot with Maven/Gradle | Executable JAR packaging; building Docker images with Buildpacks. |

## Learning Path

1. **Maven Basics** — POM structure and the `clean install` lifecycle are must-know fundamentals.
2. **Maven Dependency Management** — understand transitive dependencies and how BOMs (`spring-boot-dependencies`) pin versions.
3. **Gradle Basics** — Kotlin DSL is the current default for new Gradle projects; understand task dependency graphs.
4. **Spring Boot Plugins** — `spring-boot:build-image` and the repackage goal are the Spring-specific must-knows.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — Spring Boot starters and parent POM (`spring-boot-starter-parent`) are Maven-centric.
- [Docker](../docker/index.md) — `mvn spring-boot:build-image` produces Docker images without a Dockerfile.
- [DevOps](../devops/index.md) — CI/CD runs `mvn` or `gradle` commands in pipelines.
