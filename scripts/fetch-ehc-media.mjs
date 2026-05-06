#!/usr/bin/env node

/**
 * Mirrors EHC item scans from The Portal to Texas History into
 * /public/media/ehc/ so the archive can serve them locally rather than
 * hot-linking. Run once to seed; safe to re-run (skips already-fetched).
 *
 * Usage:
 *   pnpm fetch-ehc-media                # all items
 *   pnpm fetch-ehc-media metapth1065496 # a single item by ARK
 *
 * Per item we fetch:
 *   /thumb/<ark>.jpg   - small thumbnail (UNT /small/)
 *   /image/<ark>.jpg   - mid-size display (UNT /m1/) when available;
 *                        falls back to /large/ then /small/
 *
 * Requires permission from the items' rights holder. The EHC collection
 * is mirrored under explicit permission from the Westbank Community
 * Library District; for any other partner, do not use this script
 * without parallel permission.
 */

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ITEMS_PATH = join(ROOT, "content", "partners", "ehc-items.json");
const MEDIA_ROOT = join(ROOT, "public", "media", "ehc");
const THUMB_DIR = join(MEDIA_ROOT, "thumb");
const IMAGE_DIR = join(MEDIA_ROOT, "image");

const UNT_BASE = "https://texashistory.unt.edu/ark:/67531";
const SIZES = ["m1", "large", "small"]; // tried in order for the display image
const onlyArk = process.argv[2];

const json = JSON.parse(await readFile(ITEMS_PATH, "utf8"));
const items = Array.isArray(json.items) ? json.items : [];

await mkdir(THUMB_DIR, { recursive: true });
await mkdir(IMAGE_DIR, { recursive: true });

let fetched = 0;
let skipped = 0;
let failed = 0;

for (const it of items) {
  if (onlyArk && it.ark !== onlyArk) continue;

  const thumbPath = join(THUMB_DIR, `${it.ark}.jpg`);
  const imagePath = join(IMAGE_DIR, `${it.ark}.jpg`);

  try {
    if (!(await exists(thumbPath))) {
      await download(`${UNT_BASE}/${it.ark}/small/`, thumbPath);
      console.log(`thumb ${it.ark}`);
    }
    if (!(await exists(imagePath))) {
      let ok = false;
      for (const size of SIZES) {
        try {
          await download(`${UNT_BASE}/${it.ark}/${size}/`, imagePath);
          console.log(`image ${it.ark} (${size})`);
          ok = true;
          break;
        } catch {
          // try the next size
        }
      }
      if (!ok) throw new Error("no size succeeded");
    } else {
      skipped++;
      continue;
    }
    fetched++;
    // Polite pacing — UNT is a public archive, not a CDN
    await sleep(250);
  } catch (err) {
    console.error(`FAIL  ${it.ark}: ${err.message}`);
    failed++;
  }
}

console.log(`\n  fetched=${fetched} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exit(1);

async function download(url, path) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "WestlakeHistoryArchive/1.0 (+https://westlakehistory.com; mirroring under permission)",
      Accept: "image/jpeg,image/*,*/*;q=0.5",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 256) throw new Error(`too small: ${buf.length}b`);
  await writeFile(path, buf);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
