---
id: version-control-overview
title: Version Control Overview
description: Quick-reference summary of Git internals, branching strategies, rebase vs. merge, remotes, conflict resolution, and hooks for Java backend engineers.
sidebar_position: 16
tags:
  - java
  - git
  - version-control
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Version Control Overview

> This domain covers Git from the object model up — understanding how Git actually stores data as immutable content-addressable objects, how branching strategies shape CI/CD pipelines, when to rebase vs. merge and why the choice matters, how remotes and remote-tracking branches work, how to resolve conflicts confidently, and how hooks enforce quality gates locally. These topics surface in senior backend interviews and team tech discussions constantly.

## Key Concepts at a Glance

- **Git object store**: a key-value store in `.git/objects/`; every file, directory, commit, and tag is stored as a zlib-compressed object keyed by its SHA-1 content hash.
- **Blob**: stores raw file bytes; keyed by content — two files with identical bytes share one blob.
- **Tree**: stores a directory listing; maps filenames to blob or sub-tree SHA-1s.
- **Commit**: stores a root tree pointer, zero or more parent commit SHA-1s, author/committer info, and message; immutable.
- **Tag (annotated)**: a full Git object with tagger name, date, and message; points to a commit; preferred for release markers.
- **Content-addressable**: the object's key (SHA-1) is derived from its content — changing any byte produces a different key; this makes history tamper-evident.
- **HEAD**: the symbolic ref in `.git/HEAD`; normally points to a branch name; in "detached HEAD" state it points directly to a commit SHA-1.
- **Remote**: a named alias for a URL (e.g., `origin`); stored in `.git/config`.
- **Remote-tracking branch**: a local read-only snapshot of a remote branch (e.g., `origin/main`); lives in `.git/refs/remotes/`; only updates on `git fetch`.
- **Upstream tracking**: a branch configured to know its remote counterpart so `git push/pull` can work without specifying the remote explicitly.
- **Fast-forward merge**: moves a branch pointer forward when no divergence exists; no merge commit created.
- **Merge commit**: a commit with two or more parents that ties diverged branches together; preserves full branch topology in history.
- **Rebase**: replays commits from one branch onto another, rewriting SHA-1s; produces linear history; never use on shared/public branches.
- **Interactive rebase (`-i`)**: lets you squash, fixup, reorder, or drop commits before a PR; essential for clean history.
- **Three-way merge**: uses base + ours + theirs to auto-resolve non-conflicting changes; conflicts only appear when both sides changed the same lines differently.
- **Conflict markers**: `<<<<<<<` / `=======` / `>>>>>>>` delimit the two conflicting versions in a file; `diff3` style adds the base version in the middle.
- **`git rerere`**: records conflict resolutions and automatically re-applies them on recurring conflicts — enable with `rerere.enabled=true`.
- **Git Flow**: two long-lived branches (`main`, `develop`) plus `feature/*`, `release/*`, `hotfix/*`; designed for scheduled versioned releases.
- **GitHub Flow**: one permanent branch (`main`), short-lived feature branches, PRs merged directly; designed for continuous delivery.
- **Trunk-based development (TBD)**: all developers integrate to a single `trunk`/`main` multiple times per day; requires feature flags and strong CI/CD.
- **Feature flag**: a runtime toggle that hides incomplete features in production; enables merging unfinished code to trunk without affecting users.
- **Git hook**: an executable script in `.git/hooks/` that Git runs at a specific lifecycle point; `pre-commit` and `commit-msg` are client-side; `pre-receive` is server-side.
- **`core.hooksPath`**: Git config key (since v2.9) that redirects hook resolution to a committed directory (e.g., `.githooks/`), enabling team-wide shared hooks.
- **Shallow clone (`--depth=N`)**: downloads only N commits; smaller and faster for CI pipelines; loses `bisect`, `blame`, and full `merge-base` capability.
- **`git reflog`**: records every HEAD movement; lets you recover "lost" commits after a `reset --hard` for up to 90 days by default.

---

## Quick-Reference Table

### Git Commands

| Command | Purpose | Key Note |
|---------|---------|---------|
| `git cat-file -p <sha1>` | Pretty-print any Git object | Use to explore blobs, trees, commits |
| `git log --oneline --graph --all` | Visual commit graph | Add `--decorate` for branch/tag labels |
| `git fetch --prune` | Download remote changes + clean stale tracking refs | Set `fetch.prune=true` globally |
| `git pull --rebase` | Fetch + rebase local commits on top | Avoids merge-commit clutter; set `pull.rebase=true` globally |
| `git push -u origin <branch>` | Push and set upstream tracking | Enables plain `git push`/`git pull` after |
| `git push --force-with-lease` | Force-push safely after rebase | Fails if remote has new commits since last fetch |
| `git rebase -i origin/main` | Interactive rebase before PR | squash/fixup WIP commits; reword messages |
| `git rebase --abort` | Cancel an in-progress rebase | Returns to pre-rebase state with no damage |
| `git merge --no-ff` | Merge with explicit merge commit | Preserves feature branch boundary in history |
| `git mergetool` | Launch visual three-pane conflict tool | Configure VS Code: `merge.tool=vscode` |
| `git rerere` | Reuse recorded conflict resolutions | Enable: `rerere.enabled=true` |
| `git reflog` | View all HEAD movements | Recover "lost" commits after reset |
| `git stash push -u -m "desc"` | Stash uncommitted work + untracked files | `git stash pop` to reapply |
| `git merge-base main feature/x` | Find common ancestor commit | Useful for understanding conflict context |
| `git remote add upstream <url>` | Add original repo in fork workflow | Convention: `origin` = your fork, `upstream` = original |

### Hook Quick Reference

| Hook | When it runs | Common use |
|------|-------------|-----------|
| `pre-commit` | Before commit object created | Lint, conflict-marker detection |
| `commit-msg` | After message written | Enforce Conventional Commits format |
| `pre-push` | Before push sent to remote | Block push to main; run tests |
| `post-merge` | After successful merge | Install dependencies if `package.json` changed |
| `pre-receive` | Server: before push accepted | Branch protection, commit policy (cannot bypass) |

### Branching Strategy Comparison

| Dimension | Git Flow | GitHub Flow | Trunk-Based Dev |
|-----------|----------|-------------|-----------------|
| Permanent branches | `main` + `develop` | `main` only | `trunk`/`main` only |
| Release mechanism | `release/*` branch | Tag on `main` | Continuous / feature flags |
| Deploy frequency | Scheduled (weekly/monthly) | Per PR merge | Multiple times / day |
| Best for | Versioned libraries, enterprise software | Web apps with CD | High-velocity SaaS |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Git Object Model](../version-control/git-object-model.md) — start here; understanding SHA-1 content addressing makes every other Git command intuitive.
2. [Working with Remotes](../version-control/working-with-remotes.md) — fetch vs. pull, upstream tracking, fork workflows — the daily collaboration model.
3. [Branching Strategies](../version-control/branching-strategies.md) — choose the model that matches your team's deploy frequency and CI/CD maturity.
4. [Rebase vs. Merge](../version-control/rebase-vs-merge.md) — the most-debated Git topic; know both options and the Golden Rule.
5. [Conflict Resolution](../version-control/conflict-resolution.md) — three-way merge, `rerere`, and tools to resolve conflicts efficiently.
6. [Git Hooks & Workflows](../version-control/git-hooks-workflows.md) — automate quality gates locally before code reaches CI.

---

## Top 5 Interview Questions

**Q1: What are Git's four object types and how do they relate to each other?**
**A:** Blob stores raw file bytes. Tree stores a directory listing mapping filenames to blobs and sub-trees. Commit stores a root tree pointer + parent commit SHA-1(s) + author/message. Tag is an annotated tag object pointing to a commit with tagger metadata. A commit points to a tree snapshot; that tree points to blobs and sub-trees. Commits chain via parent pointers to form the history graph.

**Q2: What is the difference between `git merge` and `git rebase`?**
**A:** Both integrate changes from one branch into another. `git merge` creates a merge commit with two parents, preserving the original branch topology. `git rebase` replays commits from the feature branch onto the target, rewriting their SHA-1s and producing a linear history. Code outcome is identical; only history structure differs. The Golden Rule: never rebase a branch other developers have pushed to.

**Q3: What is the difference between `git fetch` and `git pull`?**
**A:** `git fetch` downloads new objects and updates remote-tracking branches (e.g., `origin/main`) without touching your working tree or local branches. `git pull` is `git fetch + git merge` (or `git rebase` if `pull.rebase=true`). Prefer `git fetch` followed by `git rebase origin/main` for explicit, merge-free integration.

**Q4: When would you choose trunk-based development over Git Flow?**
**A:** Trunk-based development is better for teams that deploy continuously (multiple times per day), have comprehensive automated test coverage, and use feature flags for incomplete work. Git Flow suits teams with scheduled versioned releases — libraries, packaged software, enterprise products — or those maintaining multiple live versions simultaneously.

**Q5: What is a Git hook and how do you share it across a team?**
**A:** A Git hook is an executable script in `.git/hooks/` that runs at specific lifecycle points (pre-commit, commit-msg, pre-push, etc.). Returning a non-zero exit aborts the operation. `.git/` is never committed, so hooks must be shared via `git config core.hooksPath .githooks` (pointing to a committed directory) or the `pre-commit` framework (which installs from a `.pre-commit-config.yaml` committed to the repo).

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Git Object Model](../version-control/git-object-model.md) | Blobs, trees, commits, tags — how Git stores every snapshot as content-addressable objects. |
| [Branching Strategies](../version-control/branching-strategies.md) | Git Flow, GitHub Flow, and trunk-based development — choosing the model that fits your team. |
| [Rebase vs. Merge](../version-control/rebase-vs-merge.md) | When to use each, interactive rebase for clean PRs, and the Golden Rule you must never break. |
| [Working with Remotes](../version-control/working-with-remotes.md) | `fetch`, `pull`, `push`, upstream tracking, fork workflows, and diverged branch handling. |
| [Conflict Resolution](../version-control/conflict-resolution.md) | Three-way merge algorithm, conflict markers, `git rerere`, and merge tools. |
| [Git Hooks & Workflows](../version-control/git-hooks-workflows.md) | Client-side and server-side hooks, sharing hooks across a team, `pre-commit` framework. |
