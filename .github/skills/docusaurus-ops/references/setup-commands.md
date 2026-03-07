# Setup Commands Reference

All repo-specific npm/shell commands needed to run and maintain this Docusaurus site.

This reference is tailored to this repository (`become-java-springboot-expert-ai`) and its `package.json` scripts and dependencies.

---

## Quick reference — scripts in this repo

Check `package.json` for the canonical scripts. The main scripts available here are:

- `npm start` — run the dev server (Docusaurus) at http://localhost:3000
- `npm run build` — build the production site
- `npm run serve` — serve the built site locally
- `npm run clear` — clear Docusaurus caches (`.docusaurus/` and related caches)
- `npm run deploy` — deploy (project must be configured for deployment)
- `npm run swizzle` — swizzle Docusaurus components
- `npm run typecheck` — run TypeScript typecheck (`tsc`)

Example: start the dev server

```bash
npm start
```

---

## Install / verify environment

This repo uses Docusaurus v3 and expects Node >= 20 (see `engines.node` in `package.json`). Install dependencies with:

```bash
npm install
```

Verify required Docusaurus plugins present (this repo includes):

```bash
npm list @docusaurus/core @docusaurus/preset-classic @docusaurus/theme-mermaid @easyops-cn/docusaurus-search-local
```

If you need to add the search or mermaid plugin locally, run:

```bash
npm install @easyops-cn/docusaurus-search-local @docusaurus/theme-mermaid
```

---

## Dev workflow (common commands)

- Start dev server (live reload):

```bash
npm start
```

- Build production site:

```bash
npm run build
```

- Serve the produced build locally:

```bash
npm run serve
```

- Clear caches (use when builds are stale):

```bash
npm run clear
```

- Typecheck TypeScript sources:

```bash
npm run typecheck
```

---

## Diagnose build errors

Capture and search build output (PowerShell):

```powershell
npm run build 2>&1 | Select-String "Broken link|Error|duplicate"
```

Or on Bash/macOS/Linux:

```bash
npm run build 2>&1 | grep -Ei "broken|error|duplicate"
```

If build reports broken links, fix or add redirects in `docusaurus.config.ts` or the affected Markdown files.

---

## Deployment notes

This repo includes a `deploy` script but deployment requires Docusaurus deployment config (`organizationName`, `projectName`, and `deploymentBranch`) in `docusaurus.config.ts` if using GitHub Pages. Typical deploy command:

```bash
npm run deploy
```

If you use GitHub Actions or another CI, prefer running `npm run build` and publishing the `build/` output via your CI pipeline.

---

## Helpful commands & troubleshooting

- Show outdated packages:

```bash
npm outdated
```

- Update Docusaurus core/plugins (v3 patch updates):

```bash
npm install @docusaurus/core@latest @docusaurus/preset-classic@latest @docusaurus/theme-mermaid@latest
npm run build
```

- If styles or Mermaid diagrams appear stale, try clearing caches then restarting:

```bash
npm run clear
npm start
```

---

## Notes specific to this repo

- Node requirement: `node >= 20` (see `package.json`).
- The repo already includes `@easyops-cn/docusaurus-search-local` and `@docusaurus/theme-mermaid` in `dependencies`.
- Use `npm start` for local editing and `npm run build` to validate the site for publishing.

If you'd like, I can also update other `.github` docs or add a short checklist for releasing changes — tell me which you'd prefer next.
