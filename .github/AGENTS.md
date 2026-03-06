# Agents Registry

This registry lists the workspace agents, their purpose, and primary scopes to avoid overlapping edits.

- `note-writer` — Writes and edits content under `become-java-springboot-expert-ai/docs/**`. Should not modify `_category_.json` or `docusaurus.config.ts`.
- `docusaurus-maintainer` — Manages `docusaurus.config.ts`, `sidebars.ts`, `_category_.json`, and build-related tasks in `become-java-springboot-expert-ai/`.
- `content-verifier` — Read-only agent that verifies claims against authoritative sources. Does not edit files.

Usage guidance

- Apply changes to docs via `note-writer` and config/plugin changes via `docusaurus-maintainer` to prevent conflicts.
- For scaffold workflows, `docusaurus-maintainer` creates `_category_.json` and `index.md`, then `note-writer` fills note content.
- When running agents in CI, run `docusaurus-maintainer` tasks before `note-writer` tasks.
