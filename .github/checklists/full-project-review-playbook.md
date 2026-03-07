# Full Project Review Playbook

Use this file as the exact review workflow for auditing and improving the whole repository. The goal is not a shallow scan. Review every file, including `.github/**`, `docs/**`, config files, source files, assets, and generated output that is committed into the repo.

This playbook is written for a cheaper model. Follow the steps in order. Do not skip files. Do not jump to editing before the inventory and review are complete.

## Review Objective

The review must answer four questions:

1. Does the project structure follow the documented standards?
2. Do the docs, overviews, indexes, categories, and config files match the repo rules?
3. Do `.github` instructions, prompts, agents, and skills contain contradictions, gaps, or ambiguous guidance?
4. Do the defined domains, subdomains, topics, and subtopics match the intended scope of this Java/Spring Boot knowledge-base project?

## Non-Negotiable Rules

- Review every committed file at least once.
- Include hidden files and `.github/**`.
- Treat generated files separately from source-of-truth files, but still inspect them.
- Record findings before making edits.
- Fix source files first, then validate generated artifacts.
- Prefer root-cause fixes over cosmetic changes.
- Do not silently invent missing standards. If the repo guidance is unclear, record the ambiguity as a finding.

## What Counts As Source Of Truth

Review these first because they define project behavior:

- `.github/copilot-instructions.md`
- `.github/AGENTS.md`
- `.github/instructions/**`
- `.github/agents/**`
- `.github/prompts/**`
- `.github/skills/**`
- `docusaurus.config.ts`
- `sidebars.ts`
- `package.json`
- `tsconfig.json`
- `src/**`
- `docs/**`
- `static/**`
- `README.md`
- `GETTING_STARTED.md`
- `misc/**`

Treat these as generated or secondary:

- `build/**`

Generated files still need review for staleness, accidental commits, broken output, or mismatch with the source docs/config.

## Step 1: Build A Complete File Inventory

Run a full file list first. Use a command that includes hidden files.

```powershell
rg --files -uu > .github/checklists/_full-file-inventory.txt
```

If writing the inventory file is not allowed in the current task, at least capture the output in memory and do not skip any path.

Then classify every path into one of these buckets:

- `.github guidance`
- `project config`
- `docs content`
- `docs structure`
- `site source`
- `static assets`
- `misc project notes`
- `generated output`

Create a tracking table while reviewing.

```md
| File | Bucket | Reviewed? | Findings? | Action Needed? |
|------|--------|-----------|-----------|----------------|
```

## Step 2: Review The Guidance Stack First

Read all `.github` files before touching docs or config. The point is to understand the rules before judging the implementation.

Review in this order:

1. `.github/copilot-instructions.md`
2. `.github/AGENTS.md`
3. `.github/instructions/*.md`
4. `.github/agents/*.md`
5. `.github/prompts/*.md`
6. `.github/skills/**/SKILL.md`
7. `.github/skills/**/references/*.md`

For every `.github` file, check these questions:

- Is the file still needed?
- Is its scope clear?
- Does it conflict with another instruction file?
- Does it duplicate rules that are already defined elsewhere?
- Does it define terms without examples?
- Does it reference files, folders, commands, or workflows that do not exist?
- Does it assume a project state that the repo does not currently have?
- Would a cheaper model likely misread or over-apply this instruction?

Mark each issue using one of these labels:

- `contradiction`
- `duplication`
- `missing example`
- `missing workflow step`
- `stale reference`
- `scope ambiguity`
- `taxonomy gap`

## Step 3: Audit Project Configuration And Structural Files

Review:

- `package.json`
- `docusaurus.config.ts`
- `sidebars.ts`
- `tsconfig.json`
- all `_category_.json` files under `docs/**`

Check for:

- Docusaurus v3 consistency
- required plugins installed and configured
- Mermaid support enabled
- search plugin configured correctly
- sidebar auto-generation only, no hardcoded sidebar drift
- `_category_.json` `link.id` matches the `id` in the local `index.md`
- category positions are present and sensible
- naming consistency across domains and subdomains
- build settings that contradict documented standards

Also compare config files against `.github/instructions/docusaurus.instructions.md` and record every mismatch.

## Step 4: Review Docs Structure Before Docs Content

Inspect the `docs/` tree as a structure, not as prose, before reading each markdown file.

Check:

- every top-level domain folder exists as expected
- every Java subdomain exists under `docs/java/`
- every domain folder has `_category_.json`
- every domain folder has `index.md`
- overview pages exist under `docs/overviews/` for each domain that is supposed to have one
- interview prep pages exist under `docs/interview-prep/` if the guidance says they should exist
- no folders exist that are absent from the official taxonomy without explanation
- no official domains or subdomains are missing from the filesystem

Use this exact comparison baseline:

- project structure in `.github/copilot-instructions.md`
- rules in `.github/instructions/new-note.instructions.md`
- rules in `.github/instructions/overview-page.instructions.md`
- rules in `.github/instructions/interview-prep.instructions.md`
- taxonomy in `.github/skills/docusaurus-ops/references/domain-topics-reference.md`

## Step 5: Review Every Markdown File Under `docs/**`

Review every file, not only samples.

For each `index.md`, check:

- correct frontmatter exists
- `id` matches `_category_.json` `link.id`
- `title` and `description` are present
- required overview/index sections exist based on the file type
- links are valid and relative
- the page is not an empty placeholder unless the repo intentionally allows placeholders
- the page reflects the actual notes that exist in that domain

For each topic note, check:

- filename is kebab-case and matches `id`
- required frontmatter fields exist
- exactly one difficulty tag exists
- exactly one note-type tag exists
- sources are present
- required sections are present and in order
- `What Problem Does It Solve?` is substantive
- `How It Works` includes a Mermaid diagram where the note type requires one
- each diagram has a caption
- code blocks use language identifiers
- non-obvious code lines are annotated with `// <-`
- interview questions include Beginner, Intermediate, and Advanced
- related notes exist and point to real files
- foundational inline links are valid and not overused
- no TODOs, placeholders, or broken promises remain

For each overview page under `docs/overviews/**`, check:

- it exists for the corresponding domain
- it is a revision page, not a duplicate of the domain index
- it contains the required quick-reference structure
- it links only to real internal notes

For each interview-prep page under `docs/interview-prep/**`, check:

- it is per-domain if the instructions require per-domain pages
- question counts and difficulty levels are balanced
- answers are interview-friendly, not copied reference text

## Step 6: Review Non-Docs Project Files

Review these as part of the full project, not as optional extras:

- `README.md`
- `GETTING_STARTED.md`
- `misc/*.md`
- `src/**`
- `static/**`

Check:

- the public project description matches the actual repo scope
- setup instructions are complete and current
- homepage copy and navigation reflect the docs taxonomy
- custom styling supports Mermaid, hidden demo categories, and docs readability
- no misc file contains stale plans that now contradict the implemented structure

## Step 7: Review Generated Output

Inspect `build/**` last.

Check:

- whether committed build artifacts are intentional
- whether generated pages reflect the current docs structure
- whether stale output suggests the site was built before recent structural changes
- whether broken content appears in built HTML that should have been caught earlier

Do not manually patch generated files unless the repo explicitly treats them as source. Fix the upstream source file and rebuild instead.

## Step 8: Perform A Taxonomy Audit

This project depends on a clean domain model. Run a dedicated taxonomy review.

Build a table like this:

```md
| Domain/Subdomain | Declared In Instructions? | Exists In docs/? | Has _category_.json? | Has index.md? | Has overview page? | Has topic reference? | Findings |
|------------------|---------------------------|------------------|----------------------|---------------|--------------------|----------------------|----------|
```

Check all of these:

- top-level domains in `.github/copilot-instructions.md`
- Java subdomains in `.github/copilot-instructions.md`
- top-level domains in `.github/instructions/new-note.instructions.md`
- top-level and Java subdomains in `.github/instructions/docusaurus.instructions.md`
- topic coverage in `.github/skills/docusaurus-ops/references/domain-topics-reference.md`

Look specifically for:

- missing domains
- missing subdomains
- domains present in docs but absent from instructions
- domains present in instructions but absent from docs
- domains with no topic reference
- duplicated concepts split across multiple domains without clear boundaries
- advanced topics missing from domains that claim full coverage

## Step 9: Check Current Known Hotspots In This Repo

Verify these repo-specific hotspots first because they are already likely problem areas:

1. Many `docs/**/index.md` files are minimal stubs and do not yet satisfy the required domain-index structure.
2. `docs/overviews/index.md` exists, but domain-specific overview pages under `docs/overviews/` appear to be missing.
3. `docs/interview-prep/index.md` exists, but per-domain interview-prep pages may be missing even though the instructions imply they should exist.
4. `docs/java/modules/` exists in the filesystem and is listed in the instructions, but the topic reference file may not define a dedicated `modules` section.
5. `docs/java/java-cheatsheets/` exists in the filesystem and is listed in the instructions, but the topic reference file may not define a dedicated `java-cheatsheets` section.

Do not assume these are the only issues. They are only the first checks.

## Step 10: Write Findings Before Editing

Produce findings in three groups:

### A. Structural defects

Examples:

- missing files
- wrong folder placement
- bad `_category_.json` links
- absent overview pages

### B. Guidance defects

Examples:

- contradictory instructions
- unclear ownership between agents, prompts, and instructions
- missing examples that make rules hard to follow
- stale references to files or workflows

### C. Taxonomy defects

Examples:

- important topics missing from a domain
- overlap between domains with no separation rule
- missing subtopic progression from basics to advanced

Use this report format:

```md
## Finding N

- Severity: high | medium | low
- Type: structural | guidance | taxonomy | content | build
- File(s): path1, path2
- Problem: one clear sentence
- Why it matters: one or two clear sentences
- Recommended fix: exact change to make
```

## Step 11: Implement Fixes In A Safe Order

Apply changes in this order only:

1. Fix contradictory or stale `.github` guidance.
2. Fix config and `_category_.json` mismatches.
3. Fix domain indexes and overview pages.
4. Fix interview-prep structure.
5. Fix topic notes.
6. Update README, GETTING_STARTED, and misc docs.
7. Rebuild and validate generated output.

Reason: content should not be rewritten against bad rules.

## Step 12: Validation After Every Batch

After each batch of edits, run relevant validation:

```powershell
npm run build
npm run typecheck
```

Also re-check:

- broken links
- duplicate IDs
- missing category links
- docs pages that still look like placeholders
- instructions that still point to missing paths

## Final Deliverables

At the end of the review, produce these outputs:

1. A findings report with severity and exact file paths.
2. A change plan ordered by dependency.
3. The implemented fixes.
4. A short validation summary.
5. A list of deferred issues that need human judgement.

## Fast Pass Checklist

Use this checklist only after the full review steps above are complete.

- [ ] Full file inventory created and no file skipped
- [ ] All `.github` files reviewed
- [ ] All config files reviewed
- [ ] All `docs/**` files reviewed
- [ ] All `src/**`, `static/**`, `misc/**`, `README.md`, and `GETTING_STARTED.md` reviewed
- [ ] `build/**` reviewed as generated output
- [ ] Guidance contradictions recorded
- [ ] Structural defects recorded
- [ ] Taxonomy gaps recorded
- [ ] Fixes applied in dependency order
- [ ] Build and typecheck validation completed
- [ ] Remaining manual decisions documented

## Definition Of Done

The review is complete only when all of these are true:

- every committed file was accounted for
- every finding was either fixed or explicitly deferred
- the docs structure matches the written standards
- `.github` guidance is internally consistent enough for a cheaper model to follow
- the domain and topic taxonomy is coherent and complete enough to guide future note writing
- the project builds successfully after the changes