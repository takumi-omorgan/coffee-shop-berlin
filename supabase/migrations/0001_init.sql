-- 0001_init.sql
-- Initial schema for the Berlin specialty-coffee directory.

CREATE TABLE coffee_shops (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  status              TEXT NOT NULL CHECK (status IN ('active', 'temporarily_closed', 'closed')),
  address_full        TEXT NOT NULL,
  postal_code         TEXT,
  neighborhood_slug   TEXT NOT NULL,
  latitude            DOUBLE PRECISION NOT NULL,
  longitude           DOUBLE PRECISION NOT NULL,
  website_url         TEXT,
  instagram_url       TEXT,
  phone               TEXT,
  google_maps_url     TEXT,
  hours               JSONB,
  specialty_coffee    BOOLEAN NOT NULL,
  venue_type          TEXT NOT NULL CHECK (venue_type IN ('cafe', 'roastery_cafe', 'bakery_cafe', 'multi_roaster')),
  coffee_methods      TEXT[] NOT NULL DEFAULT '{}',
  price_band          TEXT CHECK (price_band IN ('€', '€€', '€€€')),
  wifi_available      BOOLEAN,
  power_outlets       TEXT CHECK (power_outlets IN ('none', 'few', 'some', 'many')),
  noise_level         TEXT CHECK (noise_level IN ('quiet', 'moderate', 'lively')),
  laptop_friendly     TEXT CHECK (laptop_friendly IN ('yes', 'mixed', 'no')),
  outdoor_seating     BOOLEAN,
  vibe_tags           TEXT[] NOT NULL DEFAULT '{}',
  editor_note         TEXT,
  primary_photo_url   TEXT,
  last_verified_at    TEXT
);

CREATE TABLE neighborhoods (
  slug  TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  intro TEXT NOT NULL
);

CREATE TABLE coffee_shop_photos (
  shop_id     TEXT NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  caption     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  license     TEXT NOT NULL,
  attribution TEXT,
  source_url  TEXT,
  PRIMARY KEY (shop_id, url)
);
