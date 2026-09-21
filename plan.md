# VeilChat Discover People — phased implementation plan

## Goal

Turn Discover People into a useful, privacy-first way to find people with
shared interests and start meaningful conversations.

Core product promise:

> Find interesting people. Start meaningful conversations. Stay in control.

The work will be delivered phase by phase. Each phase should leave the app in
a usable state and should be verified before the next phase begins.

## Current foundation

The app already has:

- An opt-in `isDiscoverable` directory setting
- Search by username and display name
- Cursor pagination
- Public profile pages with display name, bio, and avatar
- Connection requests with pending/accepted states
- Block and report flows
- An existing request `note` field in the connection API

The first implementation should extend these flows instead of creating a
parallel social system.

## Product and privacy rules

These rules apply to every phase:

1. Discoverability stays **off by default** for every account.
2. Users may turn Discover People off at any time.
3. City and location are optional profile information, never inferred from
   precise GPS, IP, or device location for public display.
4. Store and display country/city only at the granularity the user chooses.
5. Users can clear interests, language, location, and “Open to chat”.
6. Blocked users and users who blocked the viewer never appear in results.
7. Search and filters must not reveal hidden or non-discoverable accounts.
8. “Open to chat” is a visible preference, not a guarantee of availability.
9. Do not publish “1M+ users” or similar social proof unless it is verified.
10. Existing encrypted chat and account privacy behavior must remain unchanged.

---

## Phase 0 — Product contract and technical baseline

### Scope

- Confirm the final interest taxonomy and labels.
- Define the public profile fields and their visibility.
- Decide which country and language lists will be supported initially.
- Capture the existing Discover, profile, request, block, and report behavior
  as the baseline.

### Deliverables

- Final list of supported interests, capped at five per user.
- Field visibility rules:
  - `interests`: public only when the user is discoverable
  - `openToChat`: public only when the user is discoverable
  - `language`: optional public field
  - `country`: optional public field
  - `city`: optional public field
- Agreed empty, loading, error, and no-results states.

### Exit criteria

- No ambiguity about which fields are public.
- No new field defaults to public accidentally.
- Existing Discover behavior is documented as the regression baseline.

---

## Phase 1 — Discover profile foundation

### Scope

Add profile data and editing controls without changing the browse experience
yet.

### Data model

Add optional user fields:

- `discoverInterests`
- `discoverCountry`
- `discoverCity`
- `discoverLanguage`
- `openToChat`

Use a bounded list for interests and validate values server-side. Add the
database changes through the project’s defensive schema bootstrap/migration
convention so existing deployments remain safe.

### API and shared contract

- Extend the shared public/discover user schemas.
- Extend `me.get` and `me.updateProfile` with the new fields.
- Add validation for:
  - Maximum five interests
  - Supported interest values
  - Reasonable length limits
  - Valid country and language values
  - Safe optional city text
- Return the saved values from the mutation so the settings UI updates
  immediately.

### UI

Add a “Discover profile” section in Settings:

- Interest chips with a five-interest limit
- “Open to chat” toggle
- Language selector
- Country selector
- Optional city field
- Short privacy explanation
- Save and clear behavior

Keep the existing master “Show me in Discover people” toggle prominent and
separate from the profile details.

### Exit criteria

- A user can edit and clear every field.
- Discover remains opt-in.
- Refreshing Settings shows the saved values.
- Existing profile name, bio, and avatar editing still works.

---

## Phase 2 — Discover browse experience and filters

### Scope

Make the directory useful for finding people, not just searching names.

### Server

Extend `discover.listUsers` with optional filters:

- Interest
- Country
- Language
- Open-to-chat only

Apply all filters server-side before pagination. Keep block filtering,
self-filtering, discoverability checks, and cursor pagination intact.

### Client

Update Discover People with:

- Search input
- Filter chips or a compact filter sheet
- Interest filter
- Country filter
- Language filter
- “Open to chat” filter
- Active-filter count
- Clear-all action
- Filter state reflected in the URL so links can be shared or refreshed

Update each result card to show:

- Avatar
- Display name and username
- Short bio
- Up to three interest tags
- Country/language when available
- “Open to chat” badge when enabled
- Founder/official badges where applicable

### Exit criteria

- Filters work together.
- Pagination remains correct after filtering.
- Empty states explain whether there are no users or no matching filters.
- Mobile layout remains easy to use with one hand.

---

## Phase 3 — Profile conversion and request message

### Scope

Make a profile visit lead naturally to a safe connection.

### Profile page

Show:

- Profile photo, name, username, and bio
- Interest tags
- Optional country, city, and language
- Open-to-chat status
- Mutual interests with the viewer
- Existing relationship state

Only show mutual interests after both profiles are available to the viewer.

### Connection request flow

Replace the one-click request action with a lightweight optional note sheet:

```text
Send a message with your request

Hi! I noticed we both like design and coding.
Would be nice to connect.
```

- Pre-fill a suggested message only if it can be generated from actual mutual
  interests.
- Let the user edit or remove the suggestion.
- Allow sending without a note.
- Keep the existing request, notification, block, and report behavior.

### Exit criteria

- A request can be sent with or without a note.
- The recipient sees the note in Incoming requests.
- Pending, accepted, rejected, blocked, and duplicate-request states work.
- No private profile fields leak through the request API.

---

## Phase 4 — Safety, trust, and quality

### Scope

Make discovery feel safe enough for real use.

### Deliverables

- Clear “You control what you share” copy in Settings and Discover.
- Block and report actions visible from profile cards/pages.
- Rate limits for directory search and connection requests.
- Abuse-resistant input validation and maximum lengths.
- Hide users immediately after a block without requiring a full reload.
- Optional “recently active” indicator only if it follows existing last-seen
  privacy settings.
- Accessibility review for filters, chips, dialogs, and badges.

### Exit criteria

- Turning off discoverability removes the account from new results.
- Blocking removes both users from each other’s results.
- Reports retain the existing moderation path.
- No exact location is exposed.
- Keyboard navigation and screen reader labels work.

---

## Phase 5 — Growth and recommendations

### Scope

Only after the searchable directory and safety controls work reliably.

### Candidate features

- “People with your interests”
- “New on VeilChat”
- “Open to chat now”
- Interest landing sections
- Suggested people after onboarding
- Shareable Discover links
- Invite friends after a successful connection

Recommendations must remain explainable. Every suggestion should say why it
appeared, such as:

> You both selected Startup and Design.

Do not introduce hidden ranking based on sensitive personal data.

### Exit criteria

- Users can understand why a profile was suggested.
- Recommendations respect discoverability and block settings.
- Growth prompts never interrupt the core chat experience.

---

## Phase 6 — Landing page and launch messaging

### Scope

Explain the new value on the public landing page after the product is
available.

### Messaging

Add a Discover section using truthful claims:

- Find people by shared interests
- Choose what appears on your profile
- Connect without sharing your phone number
- Turn Discover off whenever you want

Primary CTA:

> Find your people privately

Link the CTA to the authenticated Discover flow or onboarding entry point.

Do not use unverified user counts, testimonials, or “happy users” claims.

### Exit criteria

- Copy matches the actual product behavior.
- Mobile landing page remains fast and readable.
- Discover CTA does not promise features that are not shipped.

---

## Verification checklist for every phase

- Shared package build succeeds before client checks.
- Server typecheck and client typecheck succeed.
- Client production build succeeds.
- Database bootstrap/migration is safe on an existing database.
- Existing chat, connection, block, and report flows still work.
- Discover is tested at mobile and desktop widths.
- Loading, empty, error, and filtered-empty states are covered.
- No browser console errors are introduced.
- Privacy policy language is updated before public launch if new public profile
  data is introduced.

## Recommended execution order

1. Phase 0 — finalize fields and rules
2. Phase 1 — profile foundation
3. Phase 2 — browse and filters
4. Phase 3 — profile conversion and request notes
5. Phase 4 — safety and quality
6. Phase 5 — recommendations and growth
7. Phase 6 — landing-page launch messaging
