# Asset Tree Homes — React Site + CMS Admin

A React (Vite) site for Asset Tree Homes with a built-in admin panel (`/admin`)
for managing projects, pages, testimonials, news/events and job openings.

## Getting started

```bash
npm install
npm run dev
```

Open the printed localhost URL. The public site is at `/`, the admin panel at `/admin`.

**Default admin login:** `admin` / `ath-admin-2026` — change it under **Settings** after logging in.

## Two designs, on purpose

- **`/projects/ath-feathers`** — a standalone, pixel-faithful port of the real
  ATH Feathers ad-landing page (bronze/maroon brand, its own nav/footer, no
  site chrome). It has a real, live Sell.do CRM integration and Google Ads
  conversion tracking — see `src/lib/selldo.js` and `src/pages/site/feathers/`.
- **Everywhere else** — the real Asset Tree Homes corporate site (navy/gold
  brand, Poppins/Bebas Neue/Yellowtail type) ported from
  `asset-tree-homes-site/`, under `src/pages/site/ath2/`. Includes the Tinder-
  style swipeable project deck + desktop fanned carousel, the Maya voice-chat
  mascot, PWA install prompts, and a mobile bottom nav — all GSAP-animated.
- **`/projects/:slug`** (the other 10 projects) still uses an earlier, simpler
  generic template (`src/pages/site/ProjectDetail.jsx`, bronze-ish styling) —
  a per-project redesign matching the real site's own project-page layout
  (spec carousel, floor-plan modals, amenities marquee) is a deferred
  follow-up, not yet built.

## How content storage works

There is no backend server. All content (projects, pages, testimonials, news
& events, job openings) is seeded from `src/data/seedData.js` on first load,
then lives in this browser's `localStorage`. Edits made in `/admin` save
there and appear on the public site immediately, in that same browser.
Visitors on other devices/browsers still see the original seed data — content
does not sync between browsers because there is no shared database.

To ship a content change to everyone, edit `src/data/seedData.js` directly and
redeploy, or keep using `/admin` for content the admin only needs to see/manage
locally. If you edit `seedData.js`, existing visitors' `localStorage` won't
auto-refresh with the new seed — clear `localStorage` (keys prefixed
`ath_cms_`) to pick it up.

## Contact forms → CRM

Two separate integrations, intentionally not shared (mixing them would
misattribute leads in the CRM):

- **ATH Feathers page** — hardwired to the real, already-live Sell.do
  integration (`src/lib/selldo.js`), matching the original production page
  exactly, plus a Google Ads conversion pixel.
- **Every other form** (Contact page, generic project pages) — POSTs to a
  CRM endpoint you configure yourself, via `/admin/settings` (**CRM API
  Endpoint** / **CRM API Key** — takes effect immediately) or `.env`
  (`VITE_CRM_API_URL` / `VITE_CRM_API_KEY`, used as a fallback). Body shape:
  `{ name, phone, email, interest, message, source, submittedAt, utm }`. See
  `src/lib/crm.js`.

UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
`utm_content`, `gclid`, `fbclid`) are captured from the URL on first landing
and persisted for the session (`src/lib/utm.js`) — they flow into both CRM
paths above.

## Project structure

- `src/pages/site/ath2/*` — the real corporate site: layout, nav/footer, all
  content pages, listing pages (Apartments/Villas), the featured-projects
  carousel (`TinderDeck.jsx` + `ProjFan.jsx`), `MayaChat.jsx`, `BottomNav.jsx`,
  `InstallPrompt.jsx`
- `src/pages/site/feathers/*` — the standalone ATH Feathers landing page
- `src/pages/site/ProjectDetail.jsx` — generic (not-yet-redesigned) detail
  template for the other 10 projects
- `src/pages/admin/*` — admin screens (Login, Dashboard, Projects, Pages,
  Testimonials, News & Events, Careers, Settings)
- `src/context/DataContext.jsx` — the CRUD API + localStorage persistence for
  all collections
- `src/context/AuthContext.jsx` — client-side admin login gate (not a real
  security boundary — see comments in the file)
- `src/data/seedData.js` — initial content, including all 11 real projects
