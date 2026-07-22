# Berlin Coffee Directory Implementation Plan

> **For agentic workers:** This plan is the `/intake` source document for
> workflow-kit-v2. Task 0 (bootstrap) is executed inline by the orchestrating
> session; Tasks 1–11 become GitHub issues driven through `wk-lane`
> (`/work` → `/review` → `/ship`). Each issue's worker writes its own
> fine-grained plan.json; this document fixes the artifacts, interfaces, and
> acceptance criteria they must agree on.

**Goal:** Ship the MVP of a Berlin specialty-coffee directory per the approved
spec (`docs/superpowers/specs/2026-07-22-berlin-coffee-directory-design.md`):
static-generated Next.js site, ~150–250 OSM-seeded listings, Kiez browsing,
work-friendliness filters, map, and the SEO layer.

**Architecture:** Next.js App Router (TypeScript) with all content pages
statically generated. All domain logic lives in pure functions under
`src/lib/` (testable by sandboxed workers with vitest, no network, no DOM
needed for most). Pages are thin consumers. Data source is a committed
`data/shops.json` generated host-side by the OSM import + enrich scripts;
`src/lib/data.ts` switches to Supabase when env credentials exist (deferred —
Supabase project is created later, schema ships early as migration SQL).

**Tech Stack:** Next.js (App Router) + TypeScript, Tailwind CSS, vitest (+
jsdom/@testing-library/react only where a task needs component tests),
MapLibre GL + OpenFreeMap tiles, Supabase Postgres (deferred activation).

## Global Constraints

- Worker sandbox rule: **tests must never touch the network**. All external
  data (Overpass responses, geojson) is fixture files under `tests/fixtures/`.
- Verify gate per issue: `npm ci --offline` (first line, warm host cache) then
  `./node_modules/.bin/vitest run` exits 0. Page-producing issues add
  `npm run build` exits 0 (no Google Fonts / network at build — system font
  stack only).
- `npm test` = `vitest run` (full suite) — the host integration gate.
- No Google Places data anywhere. Photos only from the allowed sources
  (spec §3, compliance constraints); every photo record carries `license` +
  `attribution`.
- `/best/[attribute]/[neighborhood]` combo pages generate **only** with ≥5
  qualifying listings AND a unique intro (spec §4 thin-content guardrail).
- Timezone for all "open now" derivation: `Europe/Berlin`.
- English-only copy. OSM attribution "© OpenStreetMap contributors" in footer.
- Issue sizing: each issue must be completable by a Tier-1 worker in ≤2
  rounds; if a worker/round fails twice, step up model per roster, don't
  widen the issue.

---

### Task 0: Bootstrap scaffold (inline, this session — not a lane issue)

The loop needs a green baseline gate before any worker runs.

**Files (created):**
- Next.js scaffold: `package.json`, `next.config.ts`, `tsconfig.json`,
  `src/app/layout.tsx`, `src/app/page.tsx` (minimal landing page, real copy),
  Tailwind config per current create-next-app output
- `vitest.config.ts` — node environment default, `tests/**/*.test.ts?(x)`
- `tests/smoke.test.ts` — one passing assertion importing from `src/lib/`
- `src/lib/site.ts` — `export const SITE = { name, url, description }`
- `data/neighborhoods.geojson` — Berlin Ortsteil boundaries (fetched
  host-side from Berlin open data / OSM, ODbL attribution noted in README)
- `README.md` — case-study skeleton (architecture, data pipeline, SEO)
- `.env.example` — `NEXT_PUBLIC_SUPABASE_URL=`, `SUPABASE_ANON_KEY=`

**Steps:** scaffold with `create-next-app` (TS, App Router, Tailwind, ESLint,
`src/` dir, no import alias surprises — keep `@/*`); strip Google Fonts from
`layout.tsx` (system font stack); add vitest + scripts
(`"test": "vitest run"`); commit; push to `main` once takumi gh auth lands;
pre-warm `~/.npm` (`npm ci` once on host).

**Definition of done:** `npm test` and `npm run build` exit 0 on a fresh
clone with warm cache, offline. Repo pushed. Landing page renders.

---

### Task 1: Domain types, fixtures, and validation

**Files:**
- Create: `src/lib/types.ts`, `src/lib/validate.ts`,
  `tests/fixtures/shops.fixture.json` (12 plausible Berlin cafés, hand-made,
  spanning ≥4 neighborhoods, mixed nullable P2 fields),
  `tests/fixtures/neighborhoods.fixture.json` (4 entries)
- Create: `supabase/migrations/0001_init.sql`
- Test: `tests/lib/validate.test.ts`

**Interfaces (Produces — every later task imports these exact names):**
```ts
// src/lib/types.ts
export type ShopStatus = "active" | "temporarily_closed" | "closed";
export type VenueType = "cafe" | "roastery_cafe" | "bakery_cafe" | "multi_roaster";
export type PriceBand = "€" | "€€" | "€€€";
export type PowerOutlets = "none" | "few" | "some" | "many";
export type NoiseLevel = "quiet" | "moderate" | "lively";
export type LaptopFriendly = "yes" | "mixed" | "no";
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export interface HoursWindow { open: string; close: string } // "08:00", 24h, close may be "24:00"
export type WeekHours = Partial<Record<DayKey, HoursWindow[]>>;
export interface CoffeeShop {
  id: string; name: string; slug: string; status: ShopStatus;
  address_full: string; postal_code: string | null;
  neighborhood_slug: string; latitude: number; longitude: number;
  website_url: string | null; instagram_url: string | null;
  phone: string | null; google_maps_url: string | null;
  hours: WeekHours | null;
  specialty_coffee: boolean; venue_type: VenueType;
  coffee_methods: string[]; price_band: PriceBand | null;
  wifi_available: boolean | null; power_outlets: PowerOutlets | null;
  noise_level: NoiseLevel | null; laptop_friendly: LaptopFriendly | null;
  outdoor_seating: boolean | null; vibe_tags: string[];
  editor_note: string | null; primary_photo_url: string | null;
  last_verified_at: string | null; // ISO date
}
export interface Neighborhood { slug: string; name: string; intro: string }
export interface ShopPhoto {
  shop_id: string; url: string; caption: string | null;
  sort_order: number; license: string; attribution: string | null;
  source_url: string | null;
}
// src/lib/validate.ts
export function parseShop(raw: unknown): CoffeeShop;      // throws Error naming the bad field
export function parseShops(raw: unknown): CoffeeShop[];   // throws on first invalid entry with index
export function parseNeighborhoods(raw: unknown): Neighborhood[];
```
- Migration creates tables `coffee_shops`, `neighborhoods`,
  `coffee_shop_photos` mirroring the interfaces (JSONB `hours`, text[]
  for arrays, CHECK constraints for the enums).

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/lib/validate.test.ts` exits 0; suite covers: valid fixture parses, wrong enum value throws naming the field, missing required field throws, nullable P2 fields accept null.
- [ ] `node -e "const s=require('./tests/fixtures/shops.fixture.json'); if(s.length<12) process.exit(2)"` exits 0.
- [ ] `grep -c "CREATE TABLE" supabase/migrations/0001_init.sql` prints `3`.
- [ ] `npm test` exits 0.

### Task 2: Hours, open-now, and filtering logic

**Files:**
- Create: `src/lib/hours.ts`, `src/lib/filter.ts`
- Test: `tests/lib/hours.test.ts`, `tests/lib/filter.test.ts`

**Interfaces:**
- Consumes: `CoffeeShop`, `WeekHours`, `DayKey` from Task 1.
- Produces:
```ts
// src/lib/hours.ts
export function isOpenAt(hours: WeekHours | null, at: Date): boolean; // Europe/Berlin; null hours → false; handles windows past midnight (close < open rolls to next day) and "24:00"
export function sundayOpen(hours: WeekHours | null): boolean;
export function formatHours(hours: WeekHours | null): { day: DayKey; label: string }[]; // "08:00–18:00", "Closed"
// src/lib/filter.ts
export interface ShopFilters {
  neighborhood?: string; openAt?: Date; laptopFriendly?: boolean; // true → laptop_friendly === "yes"
  wifi?: boolean; outdoor?: boolean; vibe?: string; query?: string; // case-insensitive substring on name
}
export function filterShops(shops: CoffeeShop[], f: ShopFilters): CoffeeShop[]; // AND semantics; ignores non-"active" status shops
```

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/lib/hours.test.ts` exits 0; suite pins fixed `Date` values (UTC constructor) proving Europe/Berlin conversion across a DST boundary, an overnight window, and null hours.
- [ ] `./node_modules/.bin/vitest run tests/lib/filter.test.ts` exits 0; suite covers each filter key alone, AND-combination, and exclusion of `temporarily_closed`.
- [ ] `npm test` exits 0.

### Task 3: OSM Overpass import script

**Files:**
- Create: `scripts/import-osm.ts`, `src/lib/osm.ts`,
  `tests/fixtures/overpass-response.fixture.json` (~20 raw Overpass elements
  incl. duplicates, missing names, a bakery, node+way mix)
- Test: `tests/lib/osm.test.ts`

**Interfaces:**
- Consumes: `CoffeeShop`, `parseShops` (Task 1).
- Produces:
```ts
// src/lib/osm.ts
export const OVERPASS_QUERY: string; // amenity=cafe in Berlin admin area, out center tags
export function mapOsmElement(el: unknown): Partial<CoffeeShop> | null; // null when unusable (no name/coords); maps name, lat/lon (node or way center), address tags → address_full/postal_code, website, phone, opening_hours → hours via parseOpeningHours
export function parseOpeningHours(osmValue: string): WeekHours | null; // subset: "Mo-Fr 08:00-18:00; Sa 09:00-16:00" grammar; null on unparseable
export function dedupeShops(shops: Partial<CoffeeShop>[]): Partial<CoffeeShop>[]; // same normalized name within 150m collapses, keep richer record
```
- `scripts/import-osm.ts` CLI: `--in <file>` (raw Overpass JSON; **no fetch in
  tests**) or `--fetch` (host-only), `--out <file>`; prints
  `IMPORTED=<n> SKIPPED=<n>` on stdout.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/lib/osm.test.ts` exits 0; covers element mapping (node + way), opening_hours parsing incl. unparseable → null, dedupe distance rule.
- [ ] `npx tsx scripts/import-osm.ts --in tests/fixtures/overpass-response.fixture.json --out /tmp/wk-import-out.json` exits 0 and prints a line matching `^IMPORTED=[0-9]+ SKIPPED=[0-9]+$`.
- [ ] `npm test` exits 0.

### Task 4: Enrichment script — neighborhood assignment, slugs, specialty heuristic

**Files:**
- Create: `scripts/enrich.ts`, `src/lib/geo.ts`, `src/lib/slug.ts`
- Test: `tests/lib/geo.test.ts`, `tests/lib/slug.test.ts`
  (fixture: `tests/fixtures/neighborhoods-mini.geojson` — 3 simple polygons)

**Interfaces:**
- Consumes: `CoffeeShop` (Task 1); real `data/neighborhoods.geojson` (Task 0) at runtime, mini fixture in tests.
- Produces:
```ts
// src/lib/geo.ts
export function pointInPolygon(pt: [number, number], polygon: number[][][]): boolean; // GeoJSON Polygon coords, [lon,lat]
export function assignNeighborhood(lat: number, lon: number, geojson: unknown): string | null; // feature property `name` slugified; MultiPolygon supported
// src/lib/slug.ts
export function slugify(name: string): string; // lowercase, de-umlaut (ä→ae ö→oe ü→ue ß→ss), non-alnum → "-", trimmed
export function uniqueSlug(base: string, taken: Set<string>): string; // appends -2, -3…
```
- `scripts/enrich.ts` CLI: `--in <import-out> --geo <geojson> --out data/shops.json`;
  fills `slug`, `neighborhood_slug`, `id` (`berlin-<slug>`), drops rows
  `assignNeighborhood` can't place; prints `ENRICHED=<n> DROPPED=<n>`.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/lib/geo.test.ts tests/lib/slug.test.ts` exits 0; geo suite covers inside/outside/edge and MultiPolygon; slug suite covers umlauts, ß, collisions.
- [ ] `npx tsx scripts/enrich.ts --in tests/fixtures/import-out.fixture.json --geo tests/fixtures/neighborhoods-mini.geojson --out /tmp/wk-enrich-out.json` exits 0 and prints a line matching `^ENRICHED=[0-9]+ DROPPED=[0-9]+$` (worker creates `import-out.fixture.json` from Task 3's mapping of the overpass fixture).
- [ ] `npm test` exits 0.

### Task 5: Data access layer

**Files:**
- Create: `src/lib/data.ts`, `data/shops.json` (copy of
  `tests/fixtures/shops.fixture.json` as placeholder until the real import
  runs host-side), `data/neighborhoods.json` (from neighborhoods fixture,
  intros included)
- Test: `tests/lib/data.test.ts`

**Interfaces:**
- Consumes: types + parsers (Task 1).
- Produces:
```ts
// src/lib/data.ts  — the ONLY module pages import data from
export async function getShops(): Promise<CoffeeShop[]>;          // active + temporarily_closed
export async function getShopBySlug(slug: string): Promise<CoffeeShop | null>;
export async function getNeighborhoods(): Promise<Neighborhood[]>;
export async function getNeighborhood(slug: string): Promise<Neighborhood | null>;
export async function getShopsByNeighborhood(slug: string): Promise<CoffeeShop[]>;
```
- Reads committed JSON via `fs` (no fetch); validates through `parseShops` at
  load, caches in module scope. When `NEXT_PUBLIC_SUPABASE_URL` env is set a
  Supabase branch takes over — **stub it now**: an internal
  `loadFromSupabase()` that throws `new Error("supabase source not wired")`,
  selected only when env present, so wiring later is one function.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/lib/data.test.ts` exits 0; covers slug hit + miss, neighborhood grouping, invalid JSON rejected via parser, env-set path throwing the stub error (env stubbed per-test).
- [ ] `node -e "JSON.parse(require('fs').readFileSync('data/shops.json','utf8'))"` exits 0.
- [ ] `npm test` exits 0.

### Task 6: Listing detail + neighborhood pages

**Files:**
- Create: `src/app/cafes/[slug]/page.tsx`, `src/app/neighborhoods/[slug]/page.tsx`,
  `src/app/neighborhoods/page.tsx`, `src/components/ShopCard.tsx`,
  `src/components/HoursTable.tsx`, `src/components/AttributeBadges.tsx`
  (badges render "not yet verified" for null P2 fields — spec §3),
  `src/components/ShopImage.tsx` (renders `primary_photo_url`, or a styled
  non-photographic placeholder — initial + vibe-derived background — when
  null; never fake venue photos, spec §3 compliance)
- Test: `tests/components/shop-card.test.tsx` (jsdom + @testing-library/react
  added in this task's devDeps)

**Interfaces:**
- Consumes: `getShopBySlug`, `getShopsByNeighborhood`, `getNeighborhoods` (Task 5), `formatHours` (Task 2).
- Produces: `ShopCard({ shop }: { shop: CoffeeShop })` — reused by Tasks 7/9.
- Both dynamic routes implement `generateStaticParams` + `generateMetadata`
  (title/description from shop/neighborhood). Unknown slug → `notFound()`.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/components/shop-card.test.tsx` exits 0; covers name/neighborhood render, null-P2 "not yet verified" badge, editor note shown when present.
- [ ] `npm run build` exits 0 and its output lists `/cafes/[slug]` and `/neighborhoods/[slug]` as statically generated (SSG) routes.
- [ ] `npm test` exits 0.

### Task 7: Homepage + browse page with client-side filters

**Files:**
- Create: `src/app/browse/page.tsx` (server: loads shops → JSON payload),
  `src/components/BrowseClient.tsx` (`"use client"`: filter state → `filterShops`),
  `src/components/FilterBar.tsx`; Modify: `src/app/page.tsx` (search box →
  /browse, featured = latest `last_verified_at`, neighborhood link grid)
- Test: `tests/components/browse.test.tsx`

**Interfaces:**
- Consumes: `getShops`/`getNeighborhoods` (Task 5), `filterShops`/`ShopFilters` (Task 2), `ShopCard` (Task 6).
- Filter state lives in URL search params (`?neighborhood=&laptop=1&wifi=1&open=1&vibe=&q=`) so filtered views are shareable.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/components/browse.test.tsx` exits 0; covers: all shops render unfiltered, toggling laptop filter narrows list, query narrows list, empty-state message.
- [ ] `npm run build` exits 0.
- [ ] `npm test` exits 0.

### Task 8: Map page + listing mini-map

**Files:**
- Create: `src/app/map/page.tsx`, `src/components/MapView.tsx` (`"use client"`,
  MapLibre GL, OpenFreeMap style URL, pins + name/link popups, no clustering),
  `src/components/MiniMap.tsx` (single pin; embedded in cafe page — Modify
  `src/app/cafes/[slug]/page.tsx`)
- Test: `tests/lib/map-props.test.ts`

**Interfaces:**
- Consumes: `getShops` (Task 5).
- Produces: `shopsToPins(shops: CoffeeShop[]): { slug: string; name: string; lat: number; lon: number }[]` in `src/lib/map.ts` (pure, tested; excludes shops without coords).
- MapLibre loads client-side only (`dynamic` import, `ssr: false`); build must not need network.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/lib/map-props.test.ts` exits 0.
- [ ] `npm run build` exits 0 and output lists `/map`.
- [ ] `npm test` exits 0.

### Task 9: SEO layer — JSON-LD, sitemap, robots, /best pages

**Files:**
- Create: `src/lib/jsonld.ts`, `src/lib/best.ts`, `src/app/sitemap.ts`,
  `src/app/robots.ts`, `src/app/best/[attribute]/page.tsx`,
  `src/app/best/[attribute]/[neighborhood]/page.tsx`; Modify:
  `src/app/cafes/[slug]/page.tsx` (inject JSON-LD `<script>`),
  neighborhood + browse pages (ItemList/Breadcrumb)
- Test: `tests/lib/jsonld.test.ts`, `tests/lib/best.test.ts`

**Interfaces:**
- Consumes: types (Task 1), `getShops` (Task 5), `filterShops` (Task 2), `SITE` (Task 0).
- Produces:
```ts
// src/lib/jsonld.ts
export function cafeJsonLd(shop: CoffeeShop): Record<string, unknown>;      // @type CafeOrCoffeeShop, address, geo, openingHoursSpecification, priceRange
export function itemListJsonLd(shops: CoffeeShop[], pageUrl: string): Record<string, unknown>;
export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]): Record<string, unknown>;
// src/lib/best.ts
export interface BestAttribute { slug: string; title: string; intro: string; predicate(s: CoffeeShop): boolean }
export const BEST_ATTRIBUTES: BestAttribute[]; // laptop-friendly, wifi, outdoor-seating, quiet, filter-coffee (predicate: coffee_methods includes "filter" or "pour_over")
export function qualifyingAttributePages(shops: CoffeeShop[]): { attribute: BestAttribute; shops: CoffeeShop[] }[];               // ≥5 rule
export function qualifyingComboPages(shops: CoffeeShop[], hoods: Neighborhood[]): { attribute: BestAttribute; neighborhood: Neighborhood; shops: CoffeeShop[]; intro: string }[]; // ≥5 rule AND generated intro unique per combo (templated from both names + count — no two combos share a string)
```
- `generateStaticParams` for both /best routes derives **only** from the
  qualifying functions — a non-qualifying URL 404s.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/lib/jsonld.test.ts` exits 0; asserts exact `@type` values and that a null-hours shop omits `openingHoursSpecification`.
- [ ] `./node_modules/.bin/vitest run tests/lib/best.test.ts` exits 0; proves a 4-shop combo is excluded, a 5-shop combo included, and combo intros are pairwise distinct.
- [ ] `npm run build` exits 0; build output includes `/sitemap.xml` and `/robots.txt` routes.
- [ ] `npm test` exits 0.

### Task 10: Dynamic OG images

**Files:**
- Create: `src/app/cafes/[slug]/opengraph-image.tsx` (next/og `ImageResponse`:
  cafe name + neighborhood, brand colors, system fonts only — **no remote font
  fetch**), `src/app/opengraph-image.tsx` (site-wide default); Modify:
  metadata in cafe page to reference it (App Router does this by convention —
  verify only)
- Test: `tests/lib/og-text.test.ts`

**Interfaces:**
- Consumes: `getShopBySlug` (Task 5).
- Produces: `ogTitle(shop: CoffeeShop): string` in `src/lib/og.ts` (truncates >60 chars on a word boundary with ellipsis) — tested pure.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/lib/og-text.test.ts` exits 0.
- [ ] `npm run build` exits 0.
- [ ] `npm test` exits 0.

### Task 11: Legal pages, footer, attribution

**Files:**
- Create: `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`
  (German-law-shaped templates; operator name/address/email as
  `PLACEHOLDER_*` constants in `src/lib/legal.ts` the human fills — pages render
  them, and a visible "draft" banner shows while any placeholder remains),
  `src/components/Footer.tsx` (OSM attribution "© OpenStreetMap contributors"
  linking to openstreetmap.org/copyright, legal links); Modify:
  `src/app/layout.tsx` (mount footer)
- Test: `tests/components/footer.test.tsx`

**Interfaces:**
- Consumes: nothing beyond Task 0 layout.
- Produces: `hasLegalPlaceholders(): boolean` in `src/lib/legal.ts`.

**Acceptance criteria (check commands):**
- [ ] `./node_modules/.bin/vitest run tests/components/footer.test.tsx` exits 0; asserts the OSM attribution string and links to `/impressum` and `/datenschutz` render.
- [ ] `grep -q "OpenStreetMap contributors" src/components/Footer.tsx` exits 0.
- [ ] `npm run build` exits 0.
- [ ] `npm test` exits 0.

---

## Host/human tasks (not lane issues — tracked in README TODO)

1. **Real data run** (after Tasks 3–4 merge): host-side
   `npx tsx scripts/import-osm.ts --fetch --out /tmp/osm-raw.json` →
   `enrich.ts` → commit `data/shops.json` (target 150–250 rows), manual
   cleanup pass, write neighborhood intros in `data/neighborhoods.json`.
2. **Supabase activation** (deferred by decision 2026-07-22): create project,
   `supabase db push`, wire `loadFromSupabase()` (small lane issue when ready).
3. **Deploy**: Vercel project + Hostinger DNS → verify domain; then Search
   Console + sitemap submission; cookieless analytics.
4. **Legal**: fill `PLACEHOLDER_*` in `src/lib/legal.ts` (operator details).
5. **Content**: editor notes (2–3 sentences/cafe, ongoing), photos per
   compliance rules.

## Sequencing

Task 1 → Task 2 → Task 5 form the spine; 3 and 4 depend only on 1; 6–9 need 5;
10 needs 5; 11 anytime after 0. Lane runs one card at a time — submit in
order: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11. Real-data host run slots after 4;
deploy after 7 (site is already useful), rest merge in behind it.
