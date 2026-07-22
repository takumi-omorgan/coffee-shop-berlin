# Berlin Coffee Shop Directory — Design Spec

**Date:** 2026-07-22
**Status:** Approved design, pre-implementation
**Source docs:** `directory-website-build-plan.md`, `coffee-shop-directory-data-model.md`

## 1. Purpose & Context

A directory website of Berlin specialty coffee shops, built as a **portfolio and learning project**. Priorities, in order: ship a live, real-quality product; learn the modern full-stack toolchain (Next.js App Router, Supabase, deployment); demonstrate solid SEO engineering. Revenue features (featured listings, payments) are explicitly out of scope until well after launch.

**Audience:** English-speaking coffee enthusiasts, remote workers, and visitors in Berlin. The site launches **English-only**; German (with hreflang) is a possible later addition.

**Differentiation vs. Google Maps:** verified work-friendliness data (Wi-Fi, outlets, laptop policy), editorial curation per cafe, and neighborhood-level (Kiez) browsing — the questions Maps can't answer reliably.

## 2. Architecture

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Static generation with ISR for all content pages |
| Hosting | Vercel free tier | Domain already purchased at Hostinger; DNS points to Vercel |
| Database | Supabase Postgres (free tier) | Auth + Storage from same project in later phases |
| UI | Tailwind CSS + shadcn/ui | |
| Map | MapLibre GL + free OSM-based tiles (e.g. OpenFreeMap) | No API key, no usage costs |
| Analytics | Cookieless (Vercel Analytics or Umami Cloud) | Avoids cookie-consent banner entirely |

**Rendering strategy:** listing, neighborhood, and attribute pages are statically generated and revalidated with ISR. Browse/map filtering happens client-side against a lightweight JSON payload of all cafes — at 150–300 listings this is simpler and faster than server-side search. Postgres full-text search is deferred until listing count or search needs justify it (~1,000+).

**MVP scope (phased full-stack):** public-facing site only. Data is managed via seed scripts and Supabase Studio. Admin dashboard, auth, and public submissions are post-launch phases. No user accounts, reviews, or payments in MVP.

## 3. Data Model (MVP cut)

Derived from the full three-tier model in `coffee-shop-directory-data-model.md`.

### Tables

- **`coffee_shops`** — all P1 fields (identity, location, contact, hours, coffee attributes, price band, status, `last_verified_at`) plus the highest-value P2 fields: `wifi_available`, `power_outlets`, `noise_level`, `laptop_friendly`, `outdoor_seating`, `vibe_tags`, and `editor_note`. P2 columns are nullable; UI shows "not yet verified" for nulls rather than guessing.
- **`neighborhoods`** — slug, name, short editorial intro (~100–150 words). These become SEO landing pages.
- **`coffee_shop_photos`** — url, caption, sort order, **`license`**, **`attribution`**, source url. Attribution is rendered under CC-licensed photos.

Hours are stored as JSONB (`hours_structured`) on `coffee_shops`; "open now" is derived client-side (Europe/Berlin timezone). Reviews, verifications, normalized tags, and hour child-tables stay in the data-model doc as phase-3+ additions — the schema is designed so they can be added without migration pain.

### Data sourcing pipeline

1. **Seed:** import Berlin cafes from OpenStreetMap via the Overpass API (name, coordinates, address, often hours/website). OSM's ODbL license permits storage and republication **with attribution** — "© OpenStreetMap contributors" goes in the site footer.
2. **Clean:** one-time script + manual pass — dedupe, fix names, assign neighborhood from coordinates, drop obvious non-specialty venues. Target **~150–250 launch listings** with P1 fields.
3. **Enrich:** ongoing loop — verify against each cafe's own website/Instagram, fill P2 fields in batches (one neighborhood at a time), stamping `last_verified_at` each pass.

### Compliance constraints (hard rules)

- **No Google Places data in the database.** Google's ToS prohibits caching/storing Places data. Linking out to Google Maps is fine; importing from it is not.
- **No photos from image search, Instagram, or Google Maps.** Allowed photo sources, in priority order: (1) own photos — taken during enrichment visits; (2) Wikimedia Commons / Flickr photos under CC BY or CC BY-SA, with the required attribution stored and displayed; (3) cafe-provided photos with permission; (4) styled generated placeholders (never presented as the actual venue). Launch is expected to be photo-light.

## 4. Pages & SEO

### URL architecture

| Route | Target intent | Example query |
|---|---|---|
| `/` | Brand + "specialty coffee berlin" | homepage with search, featured, neighborhood links |
| `/cafes/[slug]` | Cafe name queries | "bonanza coffee roasters berlin" |
| `/neighborhoods/[slug]` | Kiez browsing | "cafés in prenzlauer berg" |
| `/best/[attribute]` | Attribute intent | "laptop friendly cafés berlin" |
| `/best/[attribute]/[neighborhood]` | Programmatic combos | "laptop friendly cafés kreuzberg" |

**Thin-content guardrail:** a `/best/.../[neighborhood]` combo page is only generated when it has **≥5 qualifying listings and a unique intro paragraph**. No exceptions — near-duplicate programmatic pages are the main failure mode of directory SEO.

### Technical SEO

- JSON-LD: `CafeOrCoffeeShop` on listing pages (name, address, geo, opening hours, price range), `ItemList` on browse/attribute pages, `BreadcrumbList` site-wide.
- `sitemap.xml` and `robots.txt` generated from the database; canonical tags; per-page titles/descriptions via Next Metadata API.
- Dynamic Open Graph images per listing (generated card: cafe name + neighborhood).
- Core Web Vitals handled by the static-generation architecture + `next/image`.

### Content strategy

- `editor_note` (2–3 original sentences minimum per cafe) is the core unique content — the reason to rank ahead of aggregators.
- Neighborhood intros are original writing, not boilerplate.
- `last_verified_at` surfaced on pages ("verified January 2026") as both a user trust signal and a freshness signal.
- Google Search Console from launch day; sitemap submitted; new `/best/` pages written toward queries that actually show impressions.

## 5. Roadmap

- **Phase 0 — Setup:** repo, Next.js scaffold, Supabase project, Vercel deploy, Hostinger DNS → Vercel. Ship a minimal landing page to the real domain immediately so indexing starts early.
- **Phase 1 — Data:** schema migration, OSM import script, cleanup pass, seed 150–250 listings, CC photo sourcing + placeholder system.
- **Phase 2 — Public pages:** listing detail, neighborhood pages, homepage, browse page with client-side filters (open now, laptop-friendly, Wi-Fi, neighborhood, vibe).
- **Phase 3 — Map + SEO layer:** MapLibre map page (pins + popups; no clustering initially), mini-map on listing pages, JSON-LD, sitemap, dynamic OG images, `/best/` attribute pages.
- **Phase 4 — Launch:** Impressum + Datenschutzerklärung, Search Console, analytics, soft launch.
- **Phase 5 — Post-launch loop:** neighborhood-by-neighborhood enrichment sprints; admin dashboard + Supabase Auth (magic link); "report incorrect info" link per listing; then a public submission form with `pending` moderation state.
- **Parked (revisit with traffic):** reviews, favorites, newsletter, German localization, paid featured listings, dedicated search engine.

## 6. Legal & Operational Requirements

- **Impressum** (§5 DDG, formerly TMG) and **Datenschutzerklärung** (GDPR) are required for a German-operated public website. Both ship in Phase 4 before launch.
- Cookieless analytics only → no cookie-consent banner needed.
- OSM attribution in footer; per-photo CC attribution where applicable.
- README written as a case study (architecture decisions, data pipeline, SEO approach) — the repo itself is a portfolio artifact.

## 7. Success Criteria

- Live site on the custom domain with 150+ listings, all P1 fields populated.
- Every listing, neighborhood, and qualifying `/best/` page indexed by Google with valid structured data (checked via Search Console + Rich Results test).
- Lighthouse: 90+ performance and SEO scores on listing and browse pages.
- Filters and map work on mobile.
- Legal pages present at launch.
- The enrichment loop is operational: at least one neighborhood fully P2-verified post-launch.
