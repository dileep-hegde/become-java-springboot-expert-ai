# Getting Started Guide — Java Notes Copilot Workspace

This guide explains every customization file in `.github/` — what each one does, when to use it, and concrete example workflows.

---

## Overview: What's Available

```
.github/
├── copilot-instructions.md          ← always-on workspace rules
├── instructions/                    ← context-sensitive rules loaded automatically
│   ├── new-note.instructions.md
│   ├── overview-page.instructions.md
│   ├── interview-prep.instructions.md
│   ├── docusaurus.instructions.md
│   └── diagrams.instructions.md
├── prompts/                         ← slash commands for focused tasks
│   ├── new-note.prompt.md
│   ├── overview-page.prompt.md
│   ├── interview-prep.prompt.md
│   ├── docusaurus-new-domain.prompt.md
│   └── content-review.prompt.md
├── agents/                          ← specialized personas with restricted tool sets
│   ├── note-writer.agent.md
│   ├── content-verifier.agent.md
│   └── docusaurus-maintainer.agent.md
├── checklists/                      ← audit checklists and inventory files
└── skills/                          ← on-demand workflows with bundled references
    ├── note-scaffolder/
    │   ├── SKILL.md
    │   └── references/
    │       ├── note-template.md
    │       ├── demo-template.md
    │       └── frontmatter-guide.md
    └── docusaurus-ops/
        ├── SKILL.md
        └── references/
            ├── setup-commands.md
            ├── category-template.md
            ├── docusaurus-config.md
            └── domain-topics-reference.md
```

---

## Quick Decision Guide

**"I want to write a new note"** → Use the `note-writer` agent or `/new-note` prompt  
**"I want a quick-reference overview for a domain"** → Use the `/overview-page` prompt  
**"I want interview Q&A for a domain"** → Use the `/interview-prep` prompt  
**"I want to set up Docusaurus / add a new domain folder"** → Use `docusaurus-maintainer` agent or `/docusaurus-new-domain` prompt  
**"I want to check if my notes are accurate"** → Use the `content-verifier` agent  
**"I want to audit notes for missing sections or broken links"** → Use the `/content-review` prompt  
**"I'm just chatting and want rules applied automatically"** → Instructions load automatically, no action needed

---

## Part 1: Instructions — Always-On Rules

Instructions are loaded automatically based on which file you're working with. You don't invoke them — Copilot applies them silently.

### How They Load

| File | When it loads |
|------|--------------|
| `copilot-instructions.md` | Always — it's the workspace-level rulebook |
| `new-note.instructions.md` | When you ask to write or edit a note under `docs/` |
| `overview-page.instructions.md` | Automatically for any file in `docs/overviews/` |
| `interview-prep.instructions.md` | Automatically for any file in `docs/interview-prep/` |
| `docusaurus.instructions.md` | Automatically for `docusaurus.config.ts`, `sidebars.ts`, `_category_.json`, `package.json` |
| `diagrams.instructions.md` | When you ask to create a diagram in any note |

### Example: Rules Are Applied Without Lifting a Finger

You open `docs/spring-boot/bean-scopes.md` and ask:

> _"Add a Mermaid diagram showing how the different bean scopes work"_

Without any explicit mention, Copilot will:
- Use the correct color palette from `diagrams.instructions.md` (Spring green, JVM blue, etc.)
- Add a caption below the diagram explaining the key takeaway
- Keep the diagram embedded in `## How It Works` rather than at the end

---

## Part 2: Prompts — Focused Task Runners

Prompts appear as slash commands. Type `/` in the Copilot chat to see the list.

### `/new-note` — Write a Complete Topic Note

**Use when**: You want a full, publication-ready note on a new topic.

**How to invoke**:
```
/new-note Virtual Threads in java/multithreading
```
or just:
```
/new-note
```
and Copilot will ask which topic and domain.

**What it does**:
1. Reads the `docs/java/multithreading/` folder to find the next `sidebar_position`
2. Identifies 2–3 existing notes for cross-links
3. Researches the topic against official docs
4. Writes every mandatory section in the correct order
5. Creates the file at `docs/java/multithreading/virtual-threads.md`
6. Updates `docs/java/multithreading/index.md` learning path

**Example session**:
```
You: /new-note
Copilot: What topic and domain? 
You: Spring @Transactional annotation, in spring-data
Copilot: [creates docs/spring-data/transactional-annotation.md with full content]
```

---

### `/overview-page` — Generate a Domain Overview

**Use when**: A domain has notes but no overview, or notes have been added and the overview is stale.

**How to invoke**:
```
/overview-page spring-boot
```

**What it does**:
1. Reads every note in `docs/spring-boot/`
2. Collects all key concepts, APIs, and interview questions
3. Generates `docs/overviews/spring-boot-overview.md` — a 10-minute revision page
4. Updates `docs/spring-boot/index.md` if it exists

**When to run**: After adding 3+ notes to a domain, or before an interview.

---

### `/interview-prep` — Build a Consolidated Q&A Page

**Use when**: You want all interview questions for a domain in one place.

**How to invoke**:
```
/interview-prep java/multithreading
```

**What it does**:
1. Pulls every question from `docs/java/multithreading/` notes
2. Identifies gaps in coverage
3. Generates `docs/interview-prep/multithreading-interview-prep.md`
4. Questions grouped: Beginner / Intermediate / Advanced
5. Advanced questions include a follow-up

---

### `/docusaurus-new-domain` — Scaffold a New Domain

**Use when**: You want to start a completely new topic area.

**How to invoke**:
```
/docusaurus-new-domain
```

**What it does**:
1. Asks for: domain folder name, category label, sidebar position, and description
2. Creates `docs/<domain>/_category_.json`
3. Creates `docs/<domain>/index.md`
4. Creates `docs/overviews/<domain>-overview.md` (stub)

**Example**:
```
You: /docusaurus-new-domain
Copilot: Domain folder name?
You: spring-cloud
Copilot: Category label?
You: Spring Cloud
Copilot: [creates all 3 files at position 35]
```

---

### `/content-review` — Audit Notes for Quality

**Use when**: Before publishing, or when notes feel incomplete.

**How to invoke**:
```
/content-review docs/spring-boot/
```
or a single file:
```
/content-review docs/spring-boot/bean-scopes.md
```

**What it does**:
- Checks every note against the full compliance checklist
- Reports `[ERROR]`, `[WARN]`, `[FIXED]`, `[MANUAL]` per issue
- Auto-fixes structural issues; flags factual claims for manual verification
- Outputs a summary: `Reviewed: X | Fixed: Y | Manual: Z`

---

## Part 3: Agents — Specialized Personas

Agents are invoked from the **agent picker** (the model selector dropdown in Copilot Chat). Each has a restricted tool set and a defined role.

### `note-writer` — The Note Writing Persona

**Use when**: You want a multi-turn writing session focused entirely on creating notes — with the correct voice, structure, and sources enforced throughout the session.

**How to invoke**: Select `note-writer` from the agent picker, then type naturally:
```
Write a note on Spring Security's filter chain for the spring-security domain
```

**What makes it different from the default agent**:
- It enforces the "first principles → advanced" writing progression automatically
- It always researches before writing — no hallucinated API behavior
- It proactively asks about cross-links and adds `## Related Notes`
- It creates the file and updates `index.md` in one go
- After writing, it asks if you want a **demo page** created with step-by-step runnable examples
- After writing, it offers to regenerate the domain overview page to include the new note

**Example multi-turn session**:
```
You: [note-writer agent selected]
     Write a note on Java's CompletableFuture for the multithreading domain

Agent: [checks docs/java/multithreading/ for sidebar position]
        [researches on authoritative sources such as the Java Language Specification (https://docs.oracle.com/javase/specs/), Oracle Java SE docs (https://docs.oracle.com/en/java/), dev.java (OpenJDK/dev.java), Oracle Java API (https://docs.oracle.com/en/java/javase/25/docs/api/index.html), Oracle Java Tutorials (https://docs.oracle.com/javase/tutorial/), and baeldung]
       [writes full note with Mermaid diagram of async pipeline]
       [creates docs/java/multithreading/completable-future.md]
       
You: Now add a comparison table between CompletableFuture and Virtual Threads

Agent: [adds ## Comparison section and updates the file]
```

---

### `content-verifier` — The Fact-Checker

**Use when**: A note has been written (by you or AI) and you want to verify its claims before publishing.

**How to invoke**: Select `content-verifier` from the agent picker:
```
Verify docs/java/jvm-internals/garbage-collection.md
```

**What it does**:
- Reads the note
- Searches official docs for each factual claim
- Returns a structured report: ✅ Confirmed | ⚠️ Needs clarification | ❌ Incorrect | 🕐 Outdated | ❓ Unverified
- **Never edits** the file — it only reports

**Critical constraint**: This agent is read-only. If it finds errors, use the `note-writer` agent or default agent to fix them.

**Example output**:
```
✅ "G1GC became default in Java 9" — verified against dev.java
❌ "@Transactional rolls back on checked exceptions by default" — INCORRECT
   Correct: @Transactional only rolls back on unchecked exceptions (RuntimeException/Error) by default.
   Source: https://docs.spring.io/...
⚠️ "Spring uses CGLIB for all proxies" — partially correct
   Full picture: Spring uses JDK dynamic proxies for interface-based beans
                 and CGLIB for class-based. Source: https://docs.spring.io/...
```

---

### `docusaurus-maintainer` — The Project Plumber

**Use when**: You need to touch Docusaurus configuration, fix build errors, or scaffold domain structure — **not** note content.

**How to invoke**: Select `docusaurus-maintainer` from the agent picker:
```
The build is failing with broken link errors — fix them
```
or:
```
Set up the Docusaurus project from scratch
```
or:
```
Add sidebar position 19 for a new spring-data domain
```

**What it does**:
- Only touches config files, `_category_.json`, `sidebars.ts`, `docusaurus.config.ts`
- Runs `npm run build` to verify changes
- **Never touches** note content or frontmatter

---

## Part 4: Skills — On-Demand Workflows

Skills appear as slash commands alongside prompts. Type `/` to see them.

### `note-scaffolder` — Guided Note Creation

**Use when**: You want the step-by-step guided workflow rather than the quick `new-note` prompt — useful for complex topics that need careful planning before writing.

**How to invoke**:
```
/note-scaffolder
```

**What makes it different from `/new-note`**:
- Explicitly walks through 7 steps: gather inputs → check domain context → research → build → create file → create demo page (optional) → update index
- References the bundled `note-template.md` and `frontmatter-guide.md` for precise structure
- Best for topics you're unfamiliar with (more guided) vs. `/new-note` which moves faster

---

### `docusaurus-ops` — Docusaurus Project Operations

**Use when**: You need detailed control over Docusaurus setup, not just scaffolding.

**How to invoke**:
```
/docusaurus-ops setup project
```
```
/docusaurus-ops add domain messaging
```
```
/docusaurus-ops fix broken links
```
```
/docusaurus-ops enable search plugin
```

**What it does**: Loads the full `docusaurus-config.md`, `setup-commands.md`, `category-template.md`, and `domain-topics-reference.md` references, then executes the requested operation with complete accuracy.

---

## Part 5: Complete Workflow Scenarios

### Scenario A: First-Time Project Setup

Goal: Bootstrap Docusaurus, configure plugins, set up the first domain.

```
Step 1: [docusaurus-maintainer agent]
        "Set up the Docusaurus project from scratch with search and Mermaid"

Step 2: /docusaurus-new-domain
        "spring-boot, Spring Boot, position 18"

Step 3: /new-note
        "Spring Boot Auto-Configuration in spring-boot domain"

Step 4: npm start   ← verify in browser
```

---

### Scenario B: Writing a New Note from Scratch

Goal: Document a new topic properly.

```
Option 1 — Quick:
  /new-note
  → "Spring Security JWT in spring-security"
  → Note created with all sections, diagram, interview Q&A

Option 2 — Guided:
  /note-scaffolder
  → Walks you through each step with prompts
  → Better for complex topics like "JVM G1GC internals"

Option 3 — Long session:
  [note-writer agent]
  → Multi-turn: write → refine → add diagram → cross-link
  → Best for topics where you want to go deep collaboratively
```

---

### Scenario C: Preparing for an Interview on Spring Boot

Goal: Rapid revision across the `spring-boot` domain.

```
Step 1: /overview-page spring-boot
        → Creates/refreshes docs/overviews/spring-boot-overview.md
        → Key concepts, quick-reference table, top 5 questions

Step 2: /interview-prep spring-boot
        → Creates docs/interview-prep/spring-boot-interview-prep.md
        → Full Beginner/Intermediate/Advanced Q&A with follow-ups

Step 3: Read both docs in under 20 minutes
        → Overview page for scanning what you know
        → Interview prep page for verbal answer practice
```

---

### Scenario D: Quality Audit Before Publishing

Goal: Ensure all notes in a domain meet standards before sharing/hosting.

```
Step 1: /content-review docs/spring-data/
        → Gets a report: [ERROR], [WARN], [FIXED], [MANUAL] per note
        → Structural issues auto-fixed
        → Factual claims flagged for review

Step 2: [content-verifier agent]
        "Verify the MANUAL items from docs/spring-data/jpa-entities.md"
        → Checks flagged claims against docs.spring.io
        → Returns ✅/❌/⚠️ with source citations

Step 3: [note-writer agent or default agent]
        → Fix any ❌ Incorrect or ⚠️ Needs clarification items
```

---

### Scenario E: Growing an Existing Domain

Goal: Add a new note, then update all related artifacts.

```
Step 1: /new-note
        "CompletableFuture in multithreading"
        → Note created, docs/java/multithreading/index.md updated

Step 2: /overview-page multithreading
        → Overview regenerated with new note included
        → Learning path updated to include new note

Step 3: /interview-prep multithreading
        → New CompletableFuture questions added to the Q&A page
```

---

## Part 6: Independent Use (No Workflow Needed)

Some primitives are useful as standalone, without a full workflow:

| Task | What to use |
|------|-------------|
| "What tags should I use?" | Open `.github/skills/note-scaffolder/references/frontmatter-guide.md` directly |
| "What's the `_category_.json` format?" | Open `.github/skills/docusaurus-ops/references/category-template.md` |
| "What npm commands do I need?" | Open `.github/skills/docusaurus-ops/references/setup-commands.md` |
| "Show me a blank note template" | Open `.github/skills/note-scaffolder/references/note-template.md` |
| "Fix my `docusaurus.config.ts`" | [docusaurus-maintainer agent] or open `docusaurus-config.md` as reference |
| "What color should I use for a Spring component in a diagram?" | Instructions auto-apply; or read `diagrams.instructions.md` directly |
| "What sections must a note have?" | Read `new-note.instructions.md` |

---

## Part 7: File Reference Card

| File | Type | Trigger |
|------|------|---------|
| `copilot-instructions.md` | Workspace rules | Always on |
| `new-note.instructions.md` | Instruction | On-demand (task-based) |
| `overview-page.instructions.md` | Instruction | `docs/overviews/**` files |
| `interview-prep.instructions.md` | Instruction | `docs/interview-prep/**` files |
| `docusaurus.instructions.md` | Instruction | `docusaurus.config.ts`, `sidebars.ts`, `_category_.json`, `package.json` |
| `diagrams.instructions.md` | Instruction | On-demand (task-based) |
| `new-note.prompt.md` | Prompt | `/new-note` |
| `overview-page.prompt.md` | Prompt | `/overview-page` |
| `interview-prep.prompt.md` | Prompt | `/interview-prep` |
| `docusaurus-new-domain.prompt.md` | Prompt | `/docusaurus-new-domain` |
| `content-review.prompt.md` | Prompt | `/content-review` |
| `note-writer.agent.md` | Agent | Agent picker |
| `content-verifier.agent.md` | Agent | Agent picker |
| `docusaurus-maintainer.agent.md` | Agent | Agent picker |
| `note-scaffolder/SKILL.md` | Skill | `/note-scaffolder` |
| `docusaurus-ops/SKILL.md` | Skill | `/docusaurus-ops` |
