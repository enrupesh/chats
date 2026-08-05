---
name: Monorepo shared package build
description: Imported workspace setup detail for validating the client against the local shared package.
---

When validating this monorepo after a fresh dependency install, build the local shared workspace package before running the client typecheck or production build.

**Why:** The shared package publishes its entry point from generated `dist` files. A fresh checkout can have dependencies installed while those files are absent, which makes both Vite dependency scanning and TypeScript report misleading cascading client/server errors.

**How to apply:** Run the shared package build first, then run the client checks. Do not replace the workspace package with a registry dependency or restructure the monorepo.