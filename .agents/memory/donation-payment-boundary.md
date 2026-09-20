---
name: Donation payment boundary
description: The donation flow records support intent and contact details until a payment provider is explicitly selected.
---

The public donation form must not collect card numbers, CVV, UPI PINs, passwords, or other payment credentials. It can collect donor identity, location, contact information, intended amount, preferred payment method, and a note for team follow-up.

**Why:** No payment provider has been selected, so inventing checkout behavior would risk collecting sensitive credentials without a real payment flow.

**How to apply:** When a provider is chosen, add its hosted or provider-controlled checkout through the monetization/integration flow and keep payment credentials out of VeilChat-owned form fields.