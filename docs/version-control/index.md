---
id: version-control-index
title: Version Control
description: Git internals, branching strategies, workflows, and collaboration best practices.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-08
---

# Version Control

> Git is the universal version control system for software development. Understanding Git beyond `add`, `commit`, and `push` — the object model, rebase vs. merge, branching strategies, and conflict resolution — makes you a faster, more confident collaborator and signals seniority in interviews and code reviews.

## What You'll Find Here

| Topic | Description |
|-------|-------------|
| [Git Basics](./git-basics.md) | The three-area model, core commands, branching, `.gitignore`, and the daily workflow from init to push. |
| [Git Object Model](./git-object-model.md) | Blobs, trees, commits, tags — how Git stores data as a content-addressable store. |
| [Branching Strategies](./branching-strategies.md) | Git Flow, GitHub Flow, trunk-based development — when each fits. |
| [Rebase vs. Merge](./rebase-vs-merge.md) | Linear history vs. merge commits; interactive rebase for cleaning up commits. |
| [Working with Remotes](./working-with-remotes.md) | `fetch`, `pull`, `push`, tracking branches, `upstream` conventions. |
| [Conflict Resolution](./conflict-resolution.md) | Three-way merge, `git rerere`, merge tools. |
| [Git Hooks & Workflows](./git-hooks-workflows.md) | Pre-commit hooks for linting; PR workflows; protected branches. |

## Learning Path

1. **[Git Basics](./git-basics.md)** — start here if you're returning after a gap; the three-area model, core commands, and daily workflow.
2. **[Git Object Model](./git-object-model.md)** — understanding SHA-1 content addressing makes `reset`, `revert`, and `reflog` intuitive.
3. **[Branching Strategies](./branching-strategies.md)** — trunk-based development is the modern default for CI/CD-heavy teams.
4. **[Rebase vs. Merge](./rebase-vs-merge.md)** — this is the most-debated Git question in team settings; know both and the trade-offs.
5. **[Working with Remotes](./working-with-remotes.md)** — `fetch` vs. `pull`, upstream tracking, fork workflows.
6. **[Conflict Resolution](./conflict-resolution.md)** — three-way merge, `rerere`, and the right tools for complex conflicts.
7. **[Git Hooks & Workflows](./git-hooks-workflows.md)** — pre-commit hooks enforce code quality without CI round-trips.

## Related Domains

- [DevOps](../devops/index.md) — branching strategies directly shape CI/CD pipeline design.
- [Build Tools](../build-tools/index.md) — Maven/Gradle version management pairs with semantic versioning in Git tags.
