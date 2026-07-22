# Prioritized Data Model for a Coffee Shop Directory

This document outlines a practical, phased data model for a coffee shop directory, designed to support a strong MVP at launch and richer editorial and community features over time. The highest-priority fields focus on what users most often need to decide quickly: location, hours, coffee quality signals, work-friendliness, and atmosphere.[cite:32][cite:38][cite:42][cite:34]

## Priority Framework

A three-tier model keeps the schema manageable while supporting expansion. Existing coffee finders and work-from-cafe directories consistently emphasize hours, map/location, Wi‑Fi, outlets, noise, and coffee-specific attributes such as brew methods or specialty focus.[cite:32][cite:38][cite:42][cite:34]

| Tier | Purpose | Rule |
|---|---|---|
| P1 | Required for every listing at launch.[cite:30][cite:36] | A record should not publish without most of these fields. |
| P2 | Strong differentiators for search and filtering.[cite:38][cite:42][cite:34] | Add as soon as they can be verified reliably. |
| P3 | Enrichment, editorial depth, and community features.[cite:32][cite:16] | Useful for retention, not required for MVP. |

## P1 Fields

These fields should be treated as mandatory because they drive core discovery and can usually be sourced or verified consistently from business pages, map data, or direct observation. Commodity datasets and place APIs center on name, address, coordinates, contact details, and opening hours, while coffee-specific directories depend on basic coffee type and map discoverability to be useful.[cite:30][cite:36][cite:32]

| Field name | Type | Example | Why it is P1 |
|---|---|---|---|
| `id` | UUID / string | `berlin-bonanza-oderberger-001` | Stable internal key for URLs and joins. |
| `name` | string | `Bonanza Coffee Roasters` | Primary discovery field.[cite:30][cite:36] |
| `slug` | string | `bonanza-coffee-roasters-oderberger` | Clean SEO and routing. |
| `status` | enum | `active`, `temporarily_closed` | Prevents stale listings.[cite:36] |
| `address_full` | string | `Oderberger Str. 35, Berlin` | Essential for trust and navigation.[cite:30][cite:36] |
| `city` | string | `Berlin` | Location browse/filter.[cite:30] |
| `neighborhood` | string | `Prenzlauer Berg` | Very important for urban discovery. |
| `postal_code` | string | `10435` | Useful for local search and QA.[cite:30] |
| `country_code` | string | `DE` | Needed if the directory scales internationally. |
| `latitude` | decimal | `52.5412` | Map, distance, “near me.”[cite:30][cite:36] |
| `longitude` | decimal | `13.4021` | Map, distance, “near me.”[cite:30][cite:36] |
| `google_maps_url` | url | link | User escape hatch for navigation. |
| `website_url` | url | link | Verification and outbound traffic.[cite:30][cite:33] |
| `instagram_url` | url | link | Often the most current cafe signal. |
| `phone` | string | `+49…` | Helpful for confirmation.[cite:30][cite:33] |
| `hours_structured` | JSON | day-by-day opening hours | “Open now” is a top filter.[cite:30][cite:36][cite:32] |
| `is_open_now` | boolean, derived | `true` | Fast decision support.[cite:36] |
| `venue_type` | enum | `cafe`, `roastery_cafe`, `bakery_cafe` | Helps segment expectations.[cite:34] |
| `specialty_coffee` | boolean | `true` | Key differentiator from generic cafe listings.[cite:32][cite:34] |
| `coffee_methods` | string array | `["espresso","filter","pour_over"]` | High-value search/filter field.[cite:34] |
| `has_espresso` | boolean | `true` | Common expectation and useful filter.[cite:34] |
| `has_filter_coffee` | boolean | `true` | Important for enthusiasts.[cite:34] |
| `price_band` | enum | `€`, `€€`, `€€€` | Quick shortlist aid. |
| `primary_photo_url` | url | link | Photos heavily influence selection. |
| `gallery_count` | integer | `8` | Proxy for listing completeness. |
| `last_verified_at` | datetime | ISO timestamp | Critical for freshness and trust. |

## P2 Fields

These fields should power real differentiation because they answer the questions users cannot reliably get from Google Maps alone. Laptop-friendly cafe directories and cafe-work apps repeatedly emphasize Wi‑Fi, outlets, noise, seating, vibe, and work suitability, while coffee mappers also benefit from roaster and service-format detail.[cite:38][cite:42][cite:16][cite:34]

| Field name | Type | Example | Why it is P2 |
|---|---|---|---|
| `wifi_available` | boolean | `true` | Core work-use filter.[cite:38][cite:42][cite:34] |
| `wifi_quality` | enum | `poor`, `ok`, `good`, `fast` | More useful than yes/no.[cite:38] |
| `wifi_speed_mbps_down` | number | `92` | Premium field if measured.[cite:38] |
| `power_outlets` | enum | `none`, `few`, `some`, `many` | One of the most requested work filters.[cite:38][cite:42] |
| `noise_level` | enum | `quiet`, `moderate`, `lively` | Important for remote work and meetings.[cite:38] |
| `seating_comfort` | enum | `basic`, `comfortable`, `long_stay` | Helps work/study decisions.[cite:42] |
| `laptop_friendly` | enum | `yes`, `mixed`, `no` | Strong user intent signal.[cite:16][cite:42][cite:34] |
| `laptop_policy_notes` | text | `No laptops on weekends after 12` | Important nuance for urban cafes.[cite:34] |
| `stay_duration_friendly` | enum | `quick`, `medium`, `long` | Useful heuristic for workers. |
| `good_for_meetings` | boolean | `true` | Helps business/social use case. |
| `good_for_solo_work` | boolean | `true` | Helps remote-work use case. |
| `outdoor_seating` | boolean | `true` | Common decision factor.[cite:38] |
| `dog_friendly` | boolean | `true` | Lifestyle filter many users value.[cite:38] |
| `wheelchair_accessible` | boolean | `true` | Important practical/accessibility field.[cite:36] |
| `toilets_available` | boolean | `true` | Highly practical in city use. |
| `food_available` | enum | `pastries`, `light_food`, `full_menu` | Affects linger time and meeting viability. |
| `milk_options` | string array | `["oat","soy"]` | Important dietary and coffee detail. |
| `decaf_available` | boolean | `true` | Common filter need. |
| `beans_sold` | boolean | `true` | Good specialty signal.[cite:34] |
| `roasts_on_site` | boolean | `false` | Valuable enthusiast signal.[cite:34] |
| `featured_roaster` | string | `The Barn` | Useful coffee credibility marker. |
| `vibe_tags` | string array | `["cozy","minimalist","bright"]` | Strong browse/filter aid.[cite:42] |
| `service_style` | enum | `sit_down`, `counter`, `takeaway_focused` | Sets expectations quickly. |

## P3 Fields

These fields make the directory feel editorial, opinionated, and difficult to copy. Community-driven coffee projects and specialty directories benefit from user contributions, favorites, visit tracking, and richer stories, but those features generally work best after core listing quality is already strong.[cite:32][cite:16]

| Field name | Type | Example | Why it is P3 |
|---|---|---|---|
| `editor_note` | text | short original write-up | Makes the directory feel curated. |
| `signature_drinks` | string array | `["flat white","batch brew"]` | Useful, but harder to maintain. |
| `bean_origins` | string array | `["Ethiopia","Colombia"]` | Great for enthusiasts, volatile data. |
| `roast_style` | enum | `light`, `medium`, `omni` | High interest for specialists. |
| `music_level` | enum | `low`, `medium`, `high` | Nice nuance for vibe. |
| `interior_style_tags` | string array | `["industrial","wood","design-forward"]` | Good for visual browsing. |
| `crowd_profile` | string array | `["students","freelancers","tourists"]` | Helpful but subjective. |
| `best_times` | text / structured | `Quiet before 10:00` | Great utility if verified. |
| `queue_risk` | enum | `low`, `medium`, `high` | Very useful but hard to keep current. |
| `user_rating_overall` | number | `4.6` | Works once enough reviews exist. |
| `user_rating_coffee` | number | `4.8` | Better than overall for specialists. |
| `user_rating_workability` | number | `4.2` | Great for dual-purpose discovery. |
| `review_count` | integer | `47` | Trust signal. |
| `save_count` | integer | `112` | Popularity and editorial ranking input. |
| `visit_count` | integer | `350` | Useful if community features are added. |
| `source_urls` | url array | list | Audit trail for verification. |
| `data_confidence_score` | number | `0.91` | Helps moderation and freshness. |
| `claimed_by_owner` | boolean | `false` | Useful for future self-serve updates. |

## Suggested Entity Structure

Keeping all information in one flat table will become unwieldy once hours, photos, tags, and reviews expand. A directory like this generally works best with one main `coffee_shops` table plus supporting child tables for hours, photos, tags, and verification history.[cite:36][cite:30]

Recommended entities:

- `coffee_shops` — one row per venue, containing most P1 fields and key P2 fields.
- `coffee_shop_hours` — one row per venue per weekday or service window.
- `coffee_shop_photos` — gallery, source, caption, and sort order.
- `coffee_shop_tags` — normalized tag store for vibe, features, and methods.
- `coffee_shop_reviews` — optional later, with split rating dimensions such as overall, coffee, and workability.
- `coffee_shop_verifications` — when verified, by whom, using which source, and with what confidence.
- `coffee_shop_sources` — outbound URLs used to verify facts.
- `neighborhoods` — useful for Berlin browse pages and neighborhood landing pages.

## MVP Schema

A lean launch version should still support map search, neighborhood landing pages, filters, and differentiated coffee discovery from day one.[cite:32][cite:38][cite:34]

```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "status": "active | temporarily_closed | closed",
  "address_full": "string",
  "city": "string",
  "neighborhood": "string",
  "postal_code": "string",
  "country_code": "string",
  "latitude": "number",
  "longitude": "number",
  "website_url": "string",
  "instagram_url": "string",
  "phone": "string",
  "hours_structured": [],
  "specialty_coffee": "boolean",
  "venue_type": "cafe | roastery_cafe | bakery_cafe | multi_roaster",
  "coffee_methods": [],
  "price_band": "€ | €€ | €€€",
  "wifi_available": "boolean | null",
  "power_outlets": "none | few | some | many | null",
  "noise_level": "quiet | moderate | lively | null",
  "laptop_friendly": "yes | mixed | no | null",
  "vibe_tags": [],
  "featured_roaster": "string | null",
  "primary_photo_url": "string",
  "last_verified_at": "datetime"
}
```

## Berlin-Specific Additions

For Berlin, a few localized fields should be added early because neighborhood and working culture are especially important in a large urban market. A Berlin user will often choose between cafes by Kiez, laptop tolerance, weekend crowding, and whether the place is more third-wave coffee bar or all-day cafe, which aligns well with patterns seen in specialty coffee and laptop-friendly cafe products.[cite:16][cite:38][cite:42][cite:32]

Useful Berlin-first fields:

- `kiez` as either the same as or more granular than neighborhood.
- `public_transit_notes` for the nearest U-Bahn, S-Bahn, or tram.
- `cashless_only` and `cash_only`.
- `english_friendly` for tourists and expats.
- `sunday_open` as a derived boolean.
- `weekend_laptop_policy` because policy may differ from weekdays.
- `queue_risk_weekend` because brunch and tourist traffic can significantly change the experience.
