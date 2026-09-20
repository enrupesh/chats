---
name: Official welcome message lifecycle
description: Keep the server-readable onboarding welcome reliable across delivery paths while expiring it from server, admin, and client views.
---

The official onboarding welcome is a database-backed plaintext message, not a system-only UI mock. Every inbox/history response and local ingest path must preserve its plaintext body and expiry, and its server row must expire one day after account creation.

**Why:** A WebSocket-only or missing-plaintext implementation makes the welcome disappear when the first live event is missed; omitting the local expiry leaves a stale copy after the server has deleted it.

**How to apply:** Set the row expiry relative to account creation, include plaintext and `expiresAt` in all message response paths, mirror expiry into local chat storage, filter expired rows from admin views, and prevent backfill helpers from recreating an expired welcome.