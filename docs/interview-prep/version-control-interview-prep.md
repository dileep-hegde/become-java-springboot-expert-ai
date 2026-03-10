---
id: version-control-interview-prep
title: Version Control Interview Questions
description: Consolidated interview Q&A for Git and version control covering beginner through advanced topics — Git basics, three-area model, object model, branching, rebase, remotes, conflict resolution, and hooks.
sidebar_position: 17
tags:
  - interview-prep
  - java
  - git
  - version-control
last_updated: 2026-03-10
---

# Version Control Interview Questions

> Consolidated Q&A for Git and version control. Use for rapid revision before backend interviews.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles
- **Advanced** questions signal senior-level depth (5+ YOE)

---

## Beginner

### Q: What is Git and why do we use it?

Git is a distributed version control system — every developer has a complete local copy of the repository, including its full history. We use it to track changes to source code over time, collaborate with teammates through branching and merging, and recover any previous state of the codebase at any point.

### Q: What is the difference between `git add` and `git commit`?

`git add` stages changes — it moves file modifications from the working directory into the staging area (index) without creating a permanent record. `git commit` takes everything in the staging area and creates an immutable commit object with a SHA-1 hash, author, timestamp, and message. You need both: add selects what to include; commit records it permanently.

### Q: What does `git clone` do?

`git clone` downloads the entire object store of a remote repository into a new directory. It copies all commits, branches, and tags, creates a remote named `origin` pointing to the source URL, and creates a remote-tracking branch `origin/main` (or equivalent). The result is a fully functional local copy of the repository.

### Q: What is a branch in Git?

A branch is a lightweight, movable pointer to a commit. It is physically stored as a 41-byte file in `.git/refs/heads/<branch-name>` containing a commit SHA-1. Creating a branch is O(1) and costs nearly nothing. When you commit on a branch, the pointer advances to the new commit automatically.

### Q: What is HEAD?

HEAD is a symbolic reference stored in `.git/HEAD` that identifies which branch or commit you currently have checked out. Normally it contains `ref: refs/heads/main` (pointing to a branch). When you check out a specific commit SHA-1 instead of a branch, Git enters "detached HEAD" state — HEAD points directly to a commit without a branch tracking it.

### Q: What is the difference between `git fetch` and `git pull`?

`git fetch` downloads new objects and updates remote-tracking branches (e.g., `origin/main`) without changing your working tree or local branches. It is safe to run at any time. `git pull` is `git fetch` followed by `git merge` (or `git rebase` if configured with `pull.rebase=true`) — it fetches and immediately integrates the remote changes into your current branch.

### Q: What does a detached HEAD mean?

Detached HEAD means HEAD points directly to a commit SHA-1 instead of a branch name. Commits made in detached HEAD state are not tracked by any branch and will be garbage-collected if you switch away without creating a branch first. Fix it with `git checkout -b new-branch` to create a branch at the current commit.

### Q: What is `.gitignore`?

`.gitignore` is a text file at the root of a repository that lists patterns for files and directories Git should never track. Common examples: `target/` (Maven build output), `*.class` (compiled Java files), `.env` (environment secrets). Already-tracked files are not affected by adding them to `.gitignore` — they must be explicitly removed from tracking with `git rm --cached <file>`.

### Q: What are the three areas in Git and what moves data between them?

The three areas are: **working directory** (files on disk you are actively editing), **staging area / index** (`.git/index` — the exact snapshot that will become the next commit), and **local repository** (`.git/objects/` — all commit history). `git add` promotes changes from the working directory to the staging area. `git commit` creates a new commit from the staging area into the repository. `git restore <file>` moves from the repository back to the working directory, discarding changes. A fourth area, the **remote**, is connected via `git push` and `git fetch`.

### Q: What is the difference between `git diff` and `git diff --staged`?

`git diff` (no flags) shows unstaged changes — the difference between the working directory and the staging area (index). `git diff --staged` (also `--cached`) shows staged changes — the difference between the staging area and the last commit. This is exactly what `git commit` would record. Together they let you audit both "what I've changed but not yet staged" and "what I've staged and am about to commit."

### Q: How do you undo a `git add` before committing?

Use `git restore --staged <file>`. This moves the file from the staging area back to the working directory — the changes are preserved on disk, they're just no longer queued for the next commit. The older equivalent is `git reset HEAD <file>`, which still works but `git restore --staged` is the modern, semantically clearer form.

---

## Intermediate

### Q: What is Git's object model? What are the four object types?

Git is a content-addressable key-value store. Every piece of data is stored as an object in `.git/objects/`, identified by the SHA-1 hash of its content. There are four types:
- **Blob** — raw file content (no filename, no metadata)
- **Tree** — a directory listing mapping filenames to blobs or sub-trees
- **Commit** — a pointer to a root tree + parent commit SHA-1(s) + author/message
- **Tag** — an annotated tag pointing to a commit + tagger metadata

Because keys are derived from content, identical files share one blob. Commits are immutable — "rewriting" a commit means creating a new one with a new SHA-1.

### Q: What is the difference between `git merge` and `git rebase`?

Both integrate changes from one branch into another. `git merge` creates a **merge commit** with two parents, preserving the full branch topology. `git rebase` replays commits from the feature branch one-by-one on top of the target branch, producing a **linear history** without merge commits. The final code state is the same; only the history structure differs. Use merge when preserving feature boundaries in history matters (Git Flow); use rebase to keep a clean linear history (GitHub Flow, TBD).

### Q: What is the Golden Rule of rebasing?

Never rebase a branch that other developers have already based work on or pushed to. Rebase rewrites commit SHA-1s. If a teammate has `feature/x` checked out or has pushed to it, rebasing changes all the SHA-1s and their copy can no longer fast-forward to the new history — they get a divergence that requires a `git pull --force` or branch reset to fix.

### Q: What is `git rebase -i` and what can you do with it?

`git rebase -i` (interactive rebase) opens an editor showing the commits to be replayed. For each commit you can: `pick` (keep as-is), `reword` (edit the message), `squash`/`fixup` (combine with previous commit), `drop` (delete), or `edit` (amend during replay). It's used before opening a PR to clean up WIP commits, fix typo messages, and combine related changes into logical units for code review.

### Q: What is the difference between Git Flow, GitHub Flow, and trunk-based development?

**Git Flow** uses two long-lived branches (`main`, `develop`) plus `feature/*`, `release/*`, and `hotfix/*` branches — designed for versioned releases on a scheduled cadence. **GitHub Flow** uses one permanent branch (`main`) with short-lived feature branches merged via PRs — designed for continuous delivery. **Trunk-based development** goes further: all developers integrate into `trunk`/`main` multiple times per day, using feature flags for incomplete work. The right choice depends on deploy frequency and test coverage maturity.

### Q: What is a three-way merge and why does Git use it?

A three-way merge uses three commits: the common ancestor (base), the current branch (ours), and the incoming branch (theirs). By comparing both sides against the base, Git can determine which changes each side intentionally made. If only one side changed a line, Git takes that change automatically. Only when both sides changed the same line differently does Git produce a conflict. A two-way diff (just ours vs. theirs) cannot make this determination and would produce far more false conflicts.

### Q: What does `git push --force-with-lease` do compared to `git push --force`?

`git push --force` overwrites the remote branch unconditionally. If a teammate pushed new commits between your last fetch and your push, their commits are lost. `git push --force-with-lease` checks that the remote branch tip still matches what you last fetched — it fails if someone else has pushed in the meantime. This makes it safe to force-push after an interactive rebase without risking data loss.

### Q: What is `git rerere`?

`rerere` (reuse recorded resolution) records how you resolved a merge conflict. If the same conflict pattern reappears — for example, when rebasing a long-lived branch multiple times as `main` evolves — Git automatically applies the recorded resolution. Enable it globally with `git config --global rerere.enabled true`. It is especially valuable when managing release branches that are regularly merged from the main development line.

### Q: How do you keep a fork's `main` in sync with the upstream repository?

Add the original repository as a second remote: `git remote add upstream <url>`. Periodically run `git fetch upstream` to download new changes without touching local branches. Then `git rebase upstream/main` (or `git merge upstream/main`) on your local `main` to integrate the changes. Finally, push to your fork: `git push origin main`. The `upstream` naming convention is universal — CI scripts and team onboarding docs expect it.

### Q: What is a Git hook and how does it work?

A Git hook is an executable script in `.git/hooks/` that Git runs automatically at specific points in the workflow. Client-side hooks include `pre-commit` (runs before the commit object is created), `commit-msg` (validates the commit message), and `pre-push` (runs before data is sent to the remote). If the hook script exits with a non-zero code, Git aborts the operation. Exit 0 means the hook passed and Git continues.

### Q: What is `git stash` and when would you use it?

`git stash` saves uncommitted changes (both staged and unstaged) onto a stack and reverts the working tree to the last commit. It's used when you need to quickly switch branches to fix a bug without committing half-finished work. `git stash pop` reapplies the saved changes. `git stash list` shows all saved stashes. Use `git stash push -u -m "description"` to also stash untracked files and add a descriptive message.

### Q: What is the difference between `git reset --soft`, `--mixed`, and `--hard`?

All three move the current branch pointer backward to the specified commit. They differ in what happens to staged and working directory changes:
- `--soft`: moves HEAD only; the index (staged changes) and working directory are untouched — everything appears staged and ready to recommit.
- `--mixed` (default, no flag): moves HEAD and also clears the staging area; working directory changes are preserved but unstaged.
- `--hard`: moves HEAD, clears the index, AND discards all working directory changes — permanently destructive; run `git reflog` immediately if you did this unintentionally.

Use `--soft` to undo the last commit while keeping work staged (e.g., to rewrite the commit message or split into multiple commits). Use `--mixed` to squash several commits by resetting to an older point and re-committing. Never use `--hard` on shared branches — it discards uncommitted work with no recovery path except `git reflog`.

### Q: What is the difference between `git revert` and `git reset`?

`git revert <sha>` creates a **new commit** that applies the inverse of a specific commit's changes, leaving history intact. It is safe on shared/pushed branches because it only adds commits. `git reset` moves the branch pointer backward, rewriting or discarding history — only safe on local, un-pushed branches. When you need to undo a change that has already been pushed, always use `git revert`.

---

## Advanced

### Q: How does a rebase conflict differ from a merge conflict?

With `git merge`, all conflicts from both diverged branches are surfaced in one resolution step. With `git rebase`, conflicts are resolved commit-by-commit as each commit is replayed. If three commits all touch the same file, you might resolve conflicts three times. This is more granular (each resolution is in the context of one change) but can be repetitive. `git rerere` mitigates the repetition by recording resolutions and reapplying them. For very large divergences, `git merge` may actually be faster to resolve despite being less clean.

### Q: How does a merge commit look in the Git object model?

A merge commit is a commit object with **two or more parent SHA-1s** listed. The first parent is the branch you merged into (HEAD at merge time); the second is the tip of the merged branch. The commit points to a single merged tree representing the combined state. `git log --first-parent` follows only the first-parent chain, giving a linear view of the main branch's history and hiding feature branch noise — useful for understanding a project's release history.

### Q: What are server-side Git hooks and how do they differ from client-side hooks?

Client-side hooks (`pre-commit`, `commit-msg`, `pre-push`) run on the developer's machine and can be bypassed with `--no-verify`. Server-side hooks (`pre-receive`, `update`, `post-receive`) run on the Git hosting server before the push is accepted and cannot be bypassed. `pre-receive` receives the full batch of refs being pushed and can reject the push. This is where repository-level enforcement lives — commit message standards, branch protection, access control, and security scans.

**Follow-up:** How do you share client-side hooks across a team?
**A:** `.git/hooks/` is not versioned. Use `git config core.hooksPath .githooks` to point Git at a committed directory (`.githooks/`) instead. Alternatively, use the `pre-commit` framework which manages hook installation via a committed `.pre-commit-config.yaml` file. For Java projects, `git-build-hook-maven-plugin` can install hooks automatically during `mvn install`.

### Q: Explain the expand/contract (parallel change) pattern and how it relates to trunk-based development.

Expand/contract is a technique for making breaking changes safely on a shared trunk. The **expand** phase adds new behavior alongside the old — the new API or data format exists in production but no callers use it yet. During the **contract** phase, callers are migrated incrementally to the new behavior. Finally, the old code is deleted. At every intermediate state the system is deployable. This enables teams to ship breaking changes continuously without long-lived branches or coordinated cutover windows. It is a core pattern in trunk-based development to avoid feature branches for large refactors.

### Q: How would you recover a commit that was "lost" after `git reset --hard`?

Commits are not deleted by `git reset --hard` — they become unreferenced. Run `git reflog` to see a time-ordered log of all HEAD movements, including before the reset. Find the commit SHA-1 from before the reset and restore it: either `git checkout -b recovery <sha1>` to create a new branch at that commit, or `git reset --hard <sha1>` to move the current branch back to it. Unreferenced commits are only permanently deleted by `git gc --prune`, by default after 90 days.

### Q: How does shallow cloning work and what are its limitations?

A shallow clone (`git clone --depth=N`) downloads only the last N commits, creating a truncated object store. The tips of branches exist but their ancestry is artificially cut. Shallow clones are significantly smaller and faster — useful in CI pipelines that only need the latest code. Limitations: `git log` beyond depth N is not available; `git bisect`, `git blame`, and `git merge-base` may produce incorrect results or fail; push from a shallow clone requires `--force` or deepen first. Deepen with `git fetch --unshallow`.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| Blob | Immutable object storing raw file bytes, keyed by content hash |
| Tree | Object storing a directory listing (filename → blob/tree mappings) |
| Commit | Object storing a tree pointer + parent refs + author + message |
| HEAD | Symbolic ref pointing to the currently checked-out branch or commit |
| Remote-tracking branch | Local read-only snapshot of a remote branch (updates only on fetch) |
| `git fetch` | Downloads objects; updates remote-tracking refs; doesn't touch working tree |
| `git pull --rebase` | Fetch + replay local commits on top of fetched changes (linear history) |
| `git merge --no-ff` | Creates a merge commit even when fast-forward is possible |
| `git rebase -i` | Interactive rebase: squash, fixup, reorder, or drop commits |
| Three-way merge | Uses base + ours + theirs to auto-resolve non-conflicting changes |
| `git rerere` | Records conflict resolutions and auto-replays them on recurrence |
| `pre-commit` hook | Script that runs before a commit is created; exit non-0 aborts it |
| `--force-with-lease` | Safer force-push: fails if remote has new commits since last fetch |
| Trunk-based dev | All developers integrate to one branch multiple times/day via feature flags |
| Git Flow | Multi-branch release model for versioned, scheduled software releases |

## Related Interview Prep

- [Core Java Interview Questions](./core-java-interview-prep.md) — Java fundamentals often referenced alongside Git tooling conversations
- [DevOps Interview Questions](../devops/index.md) — CI/CD pipeline questions build directly on branching strategy knowledge
