---
description: "Review existing notes in a domain or specific files for content accuracy, structural compliance, completeness, valid cross-links, and outdated information. Use before publishing or after a Java/Spring Boot version update."
argument-hint: "Domain folder or file path(s) to review — e.g., 'docs/spring-boot/' or 'docs/java/multithreading/thread-lifecycle.md'"
tools: [read, search, edit, web]
---

Review notes for quality and compliance with project standards.

## Required Input

User specifies one of:
- A domain folder: `docs/spring-boot/`
- A specific file: `docs/java/multithreading/thread-lifecycle.md`
- Multiple files

## Review Checklist

For each note, run through this checklist:

### A. Frontmatter Completeness
- [ ] `id` present and matches filename (without `.md`)
- [ ] `title` present
- [ ] `description` present and is a complete sentence
- [ ] `sidebar_position` set; does not conflict with other files in same domain
- [ ] `tags` include exactly one difficulty tag and exactly one note-type tag
- [ ] `last_updated` present as `YYYY-MM-DD`
- [ ] `sources` has at least one URL

### B. Structure Compliance
- [ ] All mandatory sections present in correct order (as per `.github/instructions/new-note.instructions.md`)
- [ ] No placeholder or stub content ("TODO", "coming soon", empty sections)
- [ ] At least one Mermaid diagram for concept/architecture notes
- [ ] Diagram has a caption immediately after the closing fence

### C. Content Quality
- [ ] `## What Problem Does It Solve?` is substantive (2+ sentences, concrete pain point)
- [ ] Code examples annotated with `// ←` for non-obvious lines
- [ ] Deprecated APIs labeled with `**Legacy** (pre-Java 17 / pre-Spring Boot 3)`
- [ ] No invented/unverified API behavior

### D. Interview Questions
- [ ] Questions grouped under Beginner / Intermediate / Advanced subheadings
- [ ] All three difficulty groups present
- [ ] No trivial trivia questions
- [ ] Answers are complete (not single-word responses)

### E. Cross-Links
- [ ] At least 2–3 related notes linked
- [ ] `## Related Notes` present if cross-links add value
- [ ] All links use relative Docusaurus paths (no absolute URLs for internal pages)
- [ ] No broken link paths (file must exist at the linked location)

### F. Tags
- [ ] Exactly one difficulty tag: `beginner` | `intermediate` | `advanced`
- [ ] Exactly one note-type tag: `concept` | `tool` | `pattern` | `config`
- [ ] No unknown/invented one-off tags

## Output Format

For each issue found, report and fix:

```
[ERROR] docs/spring-boot/bean-scopes.md: Missing ## What Problem Does It Solve? section
[WARN]  docs/spring-boot/bean-scopes.md: No Mermaid diagram in ## How It Works
[FIXED] docs/spring-boot/bean-scopes.md: Added missing sidebar_position: 3
[MANUAL] docs/spring-boot/bean-scopes.md: Claim about @Scope("request") — verify against https://docs.spring.io
```

Severity levels:
- `[ERROR]` — structural or frontmatter violation; fix immediately
- `[WARN]` — quality issue; fix if quick; flag otherwise
- `[FIXED]` — issue found and corrected in-place
- `[MANUAL]` — requires human fact-checking before fixing

## Final Summary

After reviewing all specified files:

```
Reviewed: X files
Fixed:    Y issues automatically
Manual:   Z issues flagged for review
```

List all `[MANUAL]` items with the specific claim to check and the recommended source to verify against.
