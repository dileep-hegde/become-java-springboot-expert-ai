# Setup Commands Reference

All npm/shell commands needed to bootstrap and maintain the Docusaurus project.

---

## Bootstrap a New Project

```bash
# Create new Docusaurus v3 project (classic preset, no TypeScript)
npx create-docusaurus@latest exp-java-ai classic

cd exp-java-ai

# Remove scaffolded demo content
Remove-Item -Recurse blog/            # PowerShell
Remove-Item -Recurse docs/tutorial*/  # PowerShell
# On Linux/Mac: rm -rf blog/ docs/tutorial*/
```

---

## Install Required Plugins

```bash
# Full-text search plugin
npm install @easyops-cn/docusaurus-search-local

# Mermaid diagram support (v3 built-in theme)
npm install @docusaurus/theme-mermaid

# Verify installation
npm list @docusaurus/core
```

---

## Dev Workflow

```bash
npm start                    # Start dev server at http://localhost:3000
npm run build                # Full production build (runs broken-link checks)
npm run serve                # Serve the built site locally (simulate production)
npm run clear                # Delete .docusaurus/ and node_modules/.cache
npm run clear ; npm start    # Fix stale styles or missing diagrams
```

---

## Diagnose Build Failures

```powershell
# PowerShell — capture build output and find broken links
npm run build 2>&1 | Select-String "Broken link"
npm run build 2>&1 | Select-String "Error"
npm run build 2>&1 | Select-String "duplicate"
```

```bash
# Bash — same
npm run build 2>&1 | grep -i "broken\|error\|duplicate"
```

---

## Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update Docusaurus to latest v3 patch
npm install @docusaurus/core@latest @docusaurus/preset-classic@latest @docusaurus/theme-mermaid@latest

# After major version updates, always run:
npm run build
```

---

## Deployment (GitHub Pages)

```bash
# Set environment variable (PowerShell)
$env:GIT_USER = "your-github-username"

# Deploy to GitHub Pages
npm run deploy
```

This requires `organizationName`, `projectName`, and `deploymentBranch` set in `docusaurus.config.ts`.

---

## File Structure After Bootstrap

```
exp-java-ai/
├── docs/                       # All markdown notes
│   ├── overviews/              # Quick-reference overview pages
│   ├── core-java/              # Domain folders...
│   └── ...
├── src/
│   └── css/
│       └── custom.css          # Custom styles
├── static/
│   └── img/                    # Images and SVGs
├── docusaurus.config.ts        # Main config
├── sidebars.ts                 # Sidebar (auto-generated)
└── package.json
```
