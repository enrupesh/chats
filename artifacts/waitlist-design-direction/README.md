# VeilChat founder waitlist — design direction

## The recommendation

Move the page from “soft SaaS landing page” to a **warm editorial private-club invite**.

The first screen should feel like a founder has found a quiet, unusually good service before everybody else: paper warmth, deep pine ink, a single copper price signal, and a product object that feels tactile rather than decorative. The memorable device is the **founder pass**: the right-hand form is treated like a dark, numbered membership card instead of another white form card.

### Layout paradigm

**Editorial split-screen with a private-club pass.**

- An asymmetrical 5/7 split on desktop: story and product object on the left, conversion pass on the right.
- A narrow “edition rail” under the hero turns product benefits into a scannable sequence rather than three equal feature cards.
- Video and social destinations become a quiet proof layer below the first decision, not competing hero content.
- On mobile, the pass follows the first product promise immediately. The art is cropped into a shallow, tactile banner so the form does not get buried.

### Mood and visual system

- **Display:** Fraunces, high-contrast editorial serif, used only for the promise and price.
- **Body:** Plus Jakarta Sans, warm and precise.
- **Metadata:** Space Mono, uppercase, wide tracking.
- **Paper:** `#F3EEE6` — warm mineral paper, not white.
- **Ink:** `#102B28` — private pine-black.
- **Moss:** `#668F78` — calm proof/status color.
- **Copper:** `#C86D3D` — one decisive commercial accent for `$1`.
- **Rose clay:** `#D8B6A5` — used as a quiet counterpoint in the atmospheric art.
- **Rule:** no gradients on type, no generic glass cards, no neon, no emoji. Depth comes from paper texture, hairlines, offset shadows, and one dark surface.

### Highest-impact changes

1. **Rewrite the opening promise.** Lead with ownership and identity (“Make your name look like yours.”), then make `$1/month` the visual payoff. This is more ownable and more shareable than stacking product features.
2. **Turn the form into the founder pass.** A dark, high-contrast surface makes the action unmistakable, places the founder perk beside the input, and gives the page a premium focal point.
3. **Make the asset the product object.** Keep `waitlist-offer-art.png`, but crop it inside a floating paper seal with two small product annotations. This gives the existing art a job in the narrative.
4. **Replace the feature grid with an edition rail.** Three unequal proof points—`your domain`, `quiet tools`, `signal, not noise`—scan faster and avoid the commodity SaaS-card pattern.
5. **Reduce decorative motion and make it intentional.** Use a single entrance sequence, a very slow art drift, and tactile hover/press feedback. The page should feel composed, not animated.
6. **Keep conversion friction honest.** Preserve the current API payload and optional website/LinkedIn fields. Make “No password. No payment details.” part of the pass instead of a footnote lost under the form.
7. **Give the thank-you state the same status as the invite.** The success state becomes a stamped founder pass with the existing `alreadyJoined` distinction; no new backend behavior is introduced.

## Integration

`WaitlistPage.redesign.tsx` is a drop-in direction for `apps/client/src/pages/WaitlistPage.tsx`.

- Keep the existing route and `useDocumentMeta` values.
- Keep the current `getApiBaseUrl()` POST to `/waitlist` and the exact three-field payload.
- Keep all current social destinations and the existing YouTube embed.
- Move `waitlist-page.css` to the client stylesheet or import it from the page.
- The artifact uses `../../apps/client/src/assets/waitlist-offer-art.png` so it can be reviewed from this directory. When replacing the real page, retain the original page-local import: `../assets/waitlist-offer-art.png`.

## Responsive behavior

- Below `860px`, the split becomes a single column with the form after the opening promise.
- Below `560px`, all metadata becomes compact, the product object becomes a 16:9 banner, and the pass loses its oversized radius so it remains comfortable on small screens.
- Form controls stay at least 48px tall and use visible `:focus-visible` rings.
- `prefers-reduced-motion` removes the ambient drift and entrance transforms without hiding content.
