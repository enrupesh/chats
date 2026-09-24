---
name: Mockup sandbox bootstrap
description: Setup constraint for newly created component preview artifacts.
---

A newly created mockup sandbox can have a complete package manifest but no installed dependencies, so its preview workflow may fail with a missing Vite binary until the artifact-local dependencies are installed.

**Why:** Artifact creation and workflow registration can complete before dependency materialization, producing a misleading workflow failure unrelated to the mockup code.

**How to apply:** If the mockup workflow reports a missing executable on first start, install dependencies inside the artifact directory, then restart the existing preview workflow before creating or presenting iframe previews.