---
name: Workspace dependency materialization
description: A dependency can be present in a workspace manifest and lockfile while its local package link is missing.
---

If Vite or TypeScript reports a missing package that is already declared in the
workspace package manifest and lockfile, run a filtered online install for that
workspace before changing application code or dependency versions.

**Why:** The local pnpm store/node_modules can be incomplete even when lockfile
resolution is valid; offline installation may fail if the package tarball is
not cached.

**How to apply:** Verify the declaration and lockfile first, then use the
workspace filter with the normal pnpm install flow and restart the workflow
before re-running preview checks.