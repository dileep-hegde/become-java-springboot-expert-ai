---
id: version-control-index
title: Version Control
description: Git internals, branching strategies, workflows, and collaboration best practices.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Version Control

> Git is the universal version control system for software development. Understanding Git beyond `add`, `commit`, and `push` — the object model, rebase vs. merge, branching strategies, and conflict resolution — makes you a faster, more confident collaborator and signals seniority in interviews and code reviews.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Git Object Model | Blobs, trees, commits, tags — how Git stores data as a content-addressable store. |
| Branching Strategies | Git Flow, GitHub Flow, trunk-based development — when each fits. |
| Rebase vs. Merge | Linear history vs. merge commits; interactive rebase for cleaning up commits. |
| Working with Remotes | `fetch`, `pull`, `push`, tracking branches, `upstream` conventions. |
| Conflict Resolution | Three-way merge, `git rerere`, merge tools. |
| Git Hooks & Workflows | Pre-commit hooks for linting; PR workflows; protected branches. |

## Learning Path

1. **Git Object Model** — understanding SHA-1 content addressing makes `reset`, `revert`, and `reflog` intuitive.
2. **Branching Strategies** — trunk-based development is the modern default for CI/CD-heavy teams.
3. **Rebase vs. Merge** — this is the most-debated Git question in team settings; know both and the trade-offs.
4. **Git Hooks** — pre-commit hooks enforce code quality without CI round-trips.

## Related Domains

- [DevOps](../devops/index.md) — branching strategies directly shape CI/CD pipeline design.
- [Build Tools](../build-tools/index.md) — Maven/Gradle version management pairs with semantic versioning in Git tags.
