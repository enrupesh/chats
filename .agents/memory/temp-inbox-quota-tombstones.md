---
name: Temporary inbox quota tombstones
description: Privacy-preserving rule for enforcing temporary inbox issuance limits after users delete inbox rows.
---

Permanent address reservations may retain the address, issue time, and an HMAC of the Firebase UID, but never raw owner identity or message content.

**Why:** Counting only live inbox rows lets a user delete an inbox and immediately bypass the rolling two-per-24-hours limit; retaining a raw user identifier would outlive the product's privacy boundary.

**How to apply:** Use the HMAC quota hash and reservation timestamp for issuance checks. Cascade-delete inboxes and messages at expiry while leaving the reservation tombstone in place.