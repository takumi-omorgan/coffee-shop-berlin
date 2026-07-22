#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import type { CoffeeShop } from "../src/lib/types";
import { assignNeighborhood } from "../src/lib/geo";
import { slugify, uniqueSlug } from "../src/lib/slug";

interface Args {
  inPath?: string;
  geoPath?: string;
  outPath?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--in") {
      args.inPath = argv[++i];
    } else if (a === "--geo") {
      args.geoPath = argv[++i];
    } else if (a === "--out") {
      args.outPath = argv[++i];
    }
  }
  return args;
}

function readJson(file: string): unknown {
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch (err) {
    throw new Error(
      `cannot read ${file}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `invalid JSON in ${file}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  if (!args.inPath) {
    process.stderr.write("error: --in <file> is required\n");
    process.exit(1);
  }
  if (!args.geoPath) {
    process.stderr.write("error: --geo <file> is required\n");
    process.exit(1);
  }
  if (!args.outPath) {
    process.stderr.write("error: --out <file> is required\n");
    process.exit(1);
  }

  const records = readJson(args.inPath);
  if (!Array.isArray(records)) {
    process.stderr.write(`error: --in must contain a JSON array\n`);
    process.exit(1);
  }
  const geojson = readJson(args.geoPath);

  const taken = new Set<string>();
  const kept: Partial<CoffeeShop>[] = [];
  let dropped = 0;

  for (const rec of records) {
    if (!rec || typeof rec !== "object") {
      dropped++;
      continue;
    }
    const r = rec as Partial<CoffeeShop>;
    if (!isNumber(r.latitude) || !isNumber(r.longitude)) {
      dropped++;
      continue;
    }
    const neighborhood = assignNeighborhood(r.latitude, r.longitude, geojson);
    if (neighborhood === null) {
      dropped++;
      continue;
    }
    const name = typeof r.name === "string" ? r.name : "";
    const base = slugify(name);
    const slug = uniqueSlug(base, taken);
    taken.add(slug);
    const enriched: Partial<CoffeeShop> = {
      ...r,
      neighborhood_slug: neighborhood,
      slug,
      id: `berlin-${slug}`,
    };
    kept.push(enriched);
  }

  writeFileSync(args.outPath, JSON.stringify(kept, null, 2));
  process.stdout.write(`ENRICHED=${kept.length} DROPPED=${dropped}\n`);
  process.exit(0);
}

try {
  main();
} catch (err) {
  process.stderr.write(`error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}
