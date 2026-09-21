---
name: Vercel route-specific OG metadata
description: How this SPA serves distinct social metadata for a specific route on Vercel.
---

Vercel's SPA catch-all rewrite returns the root index HTML for every route, so crawlers never see React's client-side head updates. Route-specific share metadata requires a separate Vite HTML entry and an exact rewrite before the generic catch-all.

**Why:** Social crawlers generally do not execute the React app, and the root index metadata otherwise appears for every route.

**How to apply:** Keep the homepage entry unchanged, add the route HTML to Vite's multi-page inputs, and map only that exact route (including its trailing-slash form) to the generated HTML.