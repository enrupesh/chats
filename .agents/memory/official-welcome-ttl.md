---
name: Official Team welcome
description: The onboarding copy is a permanent local UI message in the Team chat, not a database-backed welcome message.
---

The official onboarding welcome is rendered as a permanent chat-style UI message inside the VeilChat Team conversation. It must not be created during account creation, login, or connection-list loading, and it must not occupy a messages-table row.

**Why:** The old server-created message could appear in the admin inbox without appearing reliably in the user's chat, and its 24-hour lifecycle created unnecessary per-account database rows.

**How to apply:** Keep the copy in the Team chat UI alongside the permanent support shortcuts. If legacy rows remain during rollout, filter and remove only rows from the official account whose plaintext begins with the retired welcome prefix; never affect ordinary Team messages.