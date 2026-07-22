#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import { OVERPASS_QUERY, dedupeShops, mapOsmElement } from "../src/lib/osm";

interface OverpassResponse {
  elements?: unknown[];
}

function parseArgs(argv: string[]): {
  inPath?: string;
  outPath?: string;
  fetch: boolean;
} {
  const args = { fetch: false, inPath: undefined, outPath: undefined } as {
    inPath?: string;
    outPath?: string;
    fetch: boolean;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--in") {
      args.inPath = argv[++i];
    } else if (a === "--out") {
      args.outPath = argv[++i];
    } else if (a === "--fetch") {
      args.fetch = true;
    }
  }
  return args;
}

async function fetchOverpass(): Promise<OverpassResponse> {
  const url = "https://overpass-api.de/api/interpreter";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(OVERPASS_QUERY),
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  return (await res.json()) as OverpassResponse;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.fetch) {
    const data = await fetchOverpass();
    const elements = Array.isArray(data.elements) ? data.elements : [];
    const mapped = elements
      .map(mapOsmElement)
      .filter((x): x is NonNullable<typeof x> => x !== null);
    const deduped = dedupeShops(mapped);
    if (args.outPath) {
      writeFileSync(args.outPath, JSON.stringify(deduped, null, 2));
    }
    const skipped = elements.length - deduped.length;
    process.stdout.write(`IMPORTED=${deduped.length} SKIPPED=${skipped}\n`);
    process.exit(0);
  }

  if (!args.inPath) {
    process.stderr.write("error: --in <file> is required\n");
    process.exit(1);
  }
  if (!args.outPath) {
    process.stderr.write("error: --out <file> is required\n");
    process.exit(1);
  }

  const raw = readFileSync(args.inPath, "utf8");
  const parsed = JSON.parse(raw) as OverpassResponse;
  const elements = Array.isArray(parsed.elements) ? parsed.elements : [];

  const mapped = elements
    .map(mapOsmElement)
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const deduped = dedupeShops(mapped);

  writeFileSync(args.outPath, JSON.stringify(deduped, null, 2));
  const skipped = elements.length - deduped.length;
  process.stdout.write(`IMPORTED=${deduped.length} SKIPPED=${skipped}\n`);
  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`error: ${String(err instanceof Error ? err.message : err)}\n`);
  process.exit(1);
});
