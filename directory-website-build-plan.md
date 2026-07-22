# Manageable Build for a Directory Website

A manageable first build for a directory website is a small SEO-friendly application with five parts: public browse pages, structured listing data, lightweight admin/auth, basic search and filters, and a simple submission flow. Hostinger can be a suitable host for the web app, but PostgreSQL on Hostinger itself requires a VPS, while Node.js apps are supported on Business and Cloud hosting plans.[cite:17][cite:23][cite:24]

## Recommended approach

A pragmatic MVP uses Next.js or Astro for the frontend, Supabase for PostgreSQL, authentication, and storage, and Hostinger for hosting the app if desired.[cite:21][cite:23][cite:25] This keeps the architecture small enough to ship: browse pages, listing pages, an admin back office, and a moderation pipeline rather than a full marketplace from the start.[cite:1][cite:4][cite:6]

A sensible MVP feature set is:

- Homepage with search and featured listings.[cite:1][cite:9]
- Category pages and location pages for SEO landing pages.[cite:1][cite:11][cite:13]
- Listing detail pages with structured fields and outbound contact links.[cite:1][cite:6]
- Submission form with moderation queue.[cite:1][cite:4]
- Paid featured listings added later rather than at launch.[cite:1][cite:6]

## Free-first stack

| Layer | Suggested tool | Free angle | Notes |
|---|---|---|---|
| Frontend | Next.js or Astro | Free/open source [cite:21] | Next.js is the better fit when auth and admin dashboards are needed. |
| UI | Tailwind CSS + shadcn/ui | Free/open source [cite:21] | Fast for building a clean internal admin and public pages. |
| Database | Supabase Postgres | Free tier available [cite:25] | Easiest way to avoid managing PostgreSQL on a VPS. |
| Auth | Supabase Auth or Auth.js | Free/open source [cite:21][cite:25] | Magic-link login keeps the admin simple. |
| File storage | Supabase Storage | Free tier available [cite:25] | Suitable for listing logos and images. |
| Search | PostgreSQL full-text search first | Free [cite:1][cite:6] | Good enough for an MVP before adding a dedicated search engine. |
| CMS/admin | In-app admin over database tables, or Directus/Sanity later | Free tiers/open source [cite:21] | Keeping admin inside the app reduces moving parts. |
| Payments | Stripe | Usage-based rather than monthly [cite:1] | Best added after the browse and submission loop works. |
| Email | Resend, Brevo, or similar | Free starter tiers common | Use for confirmations, moderation notices, and login links. |
| Analytics | Umami or Plausible self-hosted | Open source | Lightweight and privacy-friendly. |

The main cost-saving decision is to avoid a dedicated search engine initially and use PostgreSQL full-text search with indexed filters on category, location, and tags.[cite:1][cite:6] That is usually sufficient until the listing count or search quality requirements justify adding Typesense, Meilisearch, or Algolia.[cite:1][cite:6]

## Hostinger options

Hostinger is suitable if the goal is to host the application and domain in one place, because it supports Node.js deployment on Business and Cloud hosting plans.[cite:17][cite:23] If PostgreSQL must run on Hostinger itself, Hostinger states that a VPS is required rather than standard Web or Cloud hosting.[cite:20][cite:24]

That creates two sensible deployment patterns:

- **Simplest managed option:** Hostinger Business or Cloud for the Node.js app, Supabase for PostgreSQL.[cite:23][cite:25]
- **More control, more ops:** Hostinger VPS for both the Node.js app and self-managed PostgreSQL.[cite:20][cite:24]

For manageability, the best default is Hostinger for the web app and Supabase for the database. That avoids operating PostgreSQL directly while keeping the stack conventional and scalable.[cite:23][cite:24][cite:25]

## Suggested schema

A good MVP schema is simple and explicit: `listings`, `categories`, `locations`, `tags`, `listing_tags`, `users`, `submissions`, and optionally `plans` or `featured_slots` when monetization is introduced.[cite:1][cite:4][cite:6] Slugs and normalized lookup tables should be added from the start because they make SEO routes, filtering, and internal linking much easier.[cite:1][cite:13]

Typical listing fields include:

- `id`, `slug`, `name`, `short_description`, `long_description`.[cite:1]
- `category_id`, `location_id`, `website_url`, `email`, `phone`.[cite:1][cite:4]
- `image_url`, `status`, `is_featured`, `created_at`, `updated_at`.[cite:1]
- Optional niche-specific structured attributes, ideally added sparingly.[cite:4][cite:6]

## Build sequence

A low-risk build sequence keeps the project small enough to finish:

1. Build the public pages: homepage, category page, location page, and listing page.[cite:1][cite:11]
2. Add the database schema and seed roughly 50 to 200 listings by hand or CSV import.[cite:1][cite:4]
3. Add keyword search plus category and city filters using PostgreSQL full-text search and SQL filters.[cite:1][cite:6]
4. Add admin authentication and a small internal dashboard.[cite:21][cite:23][cite:25]
5. Add a submission form with a `pending` moderation state.[cite:1][cite:4]
6. Add SEO basics: canonical URLs, sitemap generation, and schema markup for listing and archive pages.[cite:1][cite:13]
7. Add payments only once the browse and submission loop feels reliable.[cite:1][cite:6]

This sequence avoids early complexity around claims, reviews, messaging, or advanced ranking logic while still producing a usable directory.[cite:1][cite:6]

## Recommended default stack

For the easiest version that can still scale moderately, the strongest default stack is:

- Next.js hosted on Hostinger Node.js hosting.[cite:23]
- Supabase for PostgreSQL, Auth, and Storage.[cite:25]
- Tailwind CSS with a lightweight component layer.[cite:21]
- PostgreSQL full-text search first, without Algolia or Meilisearch at launch.[cite:1][cite:6]
- Stripe later for featured listings or paid submissions.[cite:1]

For the absolute cheapest version, Astro or a static Next.js export on Hostinger can work, with data managed in flat files or a very small CMS, but that only remains practical when submissions and filtering are minimal.[cite:22][cite:27]
