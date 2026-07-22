# Berlin Coffee Directory

A directory of Berlin specialty coffee shops — browse by Kiez (neighborhood),
laptop-friendliness, Wi-Fi, opening hours, and vibe. Built as a portfolio
project with an autonomous agent pipeline: issues are executed by sandboxed
LLM workers, cross-model reviewed, and merged with zero hand edits.

**Status:** in development. Design spec:
[`docs/superpowers/specs/2026-07-22-berlin-coffee-directory-design.md`](docs/superpowers/specs/2026-07-22-berlin-coffee-directory-design.md)
· Implementation plan:
[`docs/superpowers/plans/2026-07-22-berlin-coffee-directory.md`](docs/superpowers/plans/2026-07-22-berlin-coffee-directory.md)

## Architecture

- **Next.js (App Router) + TypeScript**, statically generated content pages.
- **Domain logic as pure functions** in `src/lib/` — hours/open-now
  (Europe/Berlin), filtering, geo point-in-polygon, slugs, JSON-LD, the
  `/best/` page guardrail — all vitest-covered without network or DOM.
- **Data pipeline:** OpenStreetMap (Overpass) import → enrichment
  (neighborhood assignment from official Berlin Ortsteil boundaries, slugs,
  specialty heuristics) → committed `data/shops.json`. Supabase Postgres
  takes over as the source when credentials are configured.
- **Map:** MapLibre GL with OpenFreeMap tiles (no API key).

## SEO approach

Listing, neighborhood, and attribute (`/best/…`) pages are statically
generated with JSON-LD (`CafeOrCoffeeShop`, `ItemList`, `BreadcrumbList`),
a database-derived sitemap, and dynamic OG images. Programmatic combo pages
only exist with ≥5 qualifying listings and unique intro copy — no thin
content.

## Data licensing

Map and listing seed data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
(ODbL). Neighborhood boundaries from Berlin Open Data (LOR Ortsteile).
No Google Places data is stored. Photos carry per-image license and
attribution metadata.

## Development

```bash
npm ci
npm test        # vitest
npm run dev
npm run build   # static generation
```

## Operational TODO (host-side, tracked here)

- [ ] Real OSM import run (150–250 listings) after import/enrich scripts merge
- [ ] Neighborhood intros + editor notes (original copy)
- [ ] Supabase project + `supabase db push` + wire `loadFromSupabase()`
- [ ] Vercel deploy + DNS + Search Console + cookieless analytics
- [ ] Fill legal operator placeholders (`src/lib/legal.ts`)
