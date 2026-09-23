---
name: Temporary inbox latest-message policy
description: Retention rule for receive-only OTP inboxes.
---

Each active temporary inbox keeps only the newest successfully received email; a later email replaces older message rows, while duplicate webhook deliveries are idempotent.

**Why:** The product is for short-lived verification codes, so retaining a message history adds storage and privacy exposure without helping the primary use case.

**How to apply:** Insert the new message and remove prior messages for that inbox in one transaction after locking the inbox row. Keep the address and 24-hour inbox expiry unchanged.