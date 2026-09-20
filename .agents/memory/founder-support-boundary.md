---
name: Founder and support account boundary
description: Keep founder identity separate from the official support account so founder chats retain normal privacy behavior.
---

Founder status must remain separate from the official support-account flag. Founder discovery priority, golden verification, and founder-access metadata must not grant the server-readable support channel behavior.

**Why:** The official support flag intentionally changes message handling and privacy notices because support messages may be readable by the team. Applying it to the founder would silently weaken normal founder conversations.

**How to apply:** Derive founder status from the reserved founder identity only where appropriate, keep `isOfficial` for the managed support account, and state future paid/share arrangements as separate agreements rather than guaranteed product entitlements.