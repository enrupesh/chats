---
name: X preview cache invalidation
description: What to do when X keeps showing an older social card after route metadata is corrected.
---

For a route-specific X card, correct HTML metadata is necessary but not sufficient: X may retain a previously crawled page and image for the exact URL. Use no-store headers on the exact route and a versioned absolute image URL, then publish and create a fresh post so X can crawl the new card.

**Why:** A live Twitterbot request can return the correct route title and image while X's composer still renders the older homepage card from its own cache.

**How to apply:** Verify with a `Twitterbot` request, add exact-route cache headers and a new image URL when needed, publish the frontend, and distinguish fresh posts from already-stored previews.