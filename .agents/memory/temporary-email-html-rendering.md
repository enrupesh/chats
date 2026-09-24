---
name: Temporary email HTML rendering
description: Product and security boundary for displaying received email templates.
---

Received temporary emails should display their sanitized HTML version in a sandboxed iframe, with plain text only as the fallback. The app should not flatten HTML mail into the main dashboard DOM.

**Why:** Email templates commonly rely on inline styles, `<style>` blocks, links, tables, and buttons. Rendering the text part first or stripping those attributes makes legitimate mail look broken, while rendering untrusted HTML directly in the app risks UI and security problems.

**How to apply:** Preserve safe presentation markup and approved URL protocols server-side, block scripts/forms/active attributes, force links to open outside the sandbox, and keep the iframe sandboxed without script or same-origin permissions.