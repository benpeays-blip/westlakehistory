#!/usr/bin/env node

/**
 * Pulls OCR text from UNT for every text-heavy EHC document and writes
 * the cleaned transcript into each document's MDX body, replacing the
 * one-line stub the import script created.
 *
 * Skips photographs and illustrations (their OCR is mostly noise from
 * back-of-print handwriting). Skips items where the body has been hand-
 * edited beyond the import-time stub (so curators don't lose work).
 *
 * Usage:
 *   pnpm import:ehc-ocr                   # all eligible items
 *   pnpm import:ehc-ocr metapth1065532    # one specific ARK
 *   pnpm import:ehc-ocr --force           # overwrite existing OCR bodies
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { fetchOcrForArk } from "./fetch-ehc-ocr.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ITEMS_PATH = join(ROOT, "content", "partners", "ehc-items.json");
const DOCS_DIR = join(ROOT, "content", "documents");

const args = process.argv.slice(2);
const force = args.includes("--force");
const targetArk = args.find((a) => a.startsWith("metapth"));

// Kinds where OCR is likely to produce useful prose. Photos + Illustrations
// often have only handwritten back-of-photo notes that OCR poorly.
const OCR_KINDS = new Set([
  "letter",
  "interview",
  "interview-notes",
  "oral-history",
  "essay",
  "manuscript",
  "newspaper",
  "family-record",
]);

// ARKs that are physically books — their navigation has 80–130 pages and
// the OCR fetcher needs to walk all of them. We cap at MAX_PAGES_FOR_BOOKS
// to keep the rendered MDX manageable; the full text always remains
// linkable on UNT.
const BOOK_ARKS = new Set([
  "metapth769391", // Eanes: Portrait of a Community
  "metapth769666", // Eanes: A History of the School and Community
  "metapth821227", // Texas Gulf Historical and Biographical Record
  "metapth821306", // Frontier Times Vol. 1 No. 3
  "metapth821421", // Echoes from the Past
]);
const MAX_PAGES_FOR_BOOKS = 80;

const STUB_PREFIX_RX = /^Original record:/m;

const json = JSON.parse(await readFile(ITEMS_PATH, "utf8"));

let processed = 0;
let skipped = 0;
let failed = 0;

for (const item of json.items) {
  if (targetArk && item.ark !== targetArk) continue;
  if (!OCR_KINDS.has(item.kind) && !targetArk) {
    skipped++;
    continue;
  }

  const mdxPath = join(DOCS_DIR, `${item.ark}.mdx`);
  let raw;
  try {
    raw = await readFile(mdxPath, "utf8");
  } catch {
    console.error(`MISS  ${item.ark} (no MDX)`);
    failed++;
    continue;
  }
  const { data, content: existingBody } = matter(raw);

  // Heuristic: detect "this body is the auto-generated stub" so we don't
  // overwrite curator edits. Stub pattern: short, contains the
  // "Original record: …" link, and not much else.
  const isStub =
    existingBody.split("\n").filter((l) => l.trim()).length <= 4 &&
    STUB_PREFIX_RX.test(existingBody);

  if (!isStub && !force) {
    console.log(`skip  ${item.ark} (body looks edited; use --force to overwrite)`);
    skipped++;
    continue;
  }

  // Retry up to 3 times with exponential backoff if UNT throttles us
  let result = null;
  let lastErr = null;
  const isBook = BOOK_ARKS.has(item.ark);
  const maxPages = isBook ? MAX_PAGES_FOR_BOOKS : Infinity;
  for (let attempt = 1; attempt <= 3 && !result; attempt++) {
    try {
      process.stdout.write(
        `ocr   ${item.ark}${isBook ? " (book)" : ""}${attempt > 1 ? ` (try ${attempt})` : ""}…`,
      );
      result = await fetchOcrForArk(item.ark, { maxPages });
    } catch (err) {
      lastErr = err;
      if (err.message.includes("404")) break; // not retryable
      const wait = attempt * 5000;
      console.log(` throttled; backing off ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  if (!result) {
    console.error(`FAIL  ${item.ark}: ${lastErr?.message ?? "unknown"}`);
    failed++;
    continue;
  }

  const meaningfulPages = result.pages.filter(
    (p) => p.replace(/\s+/g, " ").trim().length > 30,
  );
  if (!meaningfulPages.length) {
    console.log(" (no useful text)");
    skipped++;
    continue;
  }
  try {
    const body = formatBody(result, item);
    const next = matter.stringify(body, data);
    await writeFile(mdxPath, next);
    console.log(` ${result.totalPages} pages, ${meaningfulPages.length} kept`);
    processed++;
    // Polite pacing between items in addition to per-page pacing inside fetcher
    await new Promise((r) => setTimeout(r, 1500));
  } catch (err) {
    console.error(`\nFAIL  ${item.ark}: ${err.message}`);
    failed++;
  }
}

console.log(`\n  processed=${processed} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exit(1);

function formatBody(result, item) {
  const blocks = [];
  blocks.push(item.summary || "");
  const ocrNote =
    "_The following text was extracted via OCR from the digitized scan held by The Portal to Texas History (UNT Libraries). OCR can introduce errors, especially on handwritten material; the canonical record links to the original scan._";
  if (result.truncated) {
    blocks.push(
      `## Transcribed text (first ${result.totalPages} of ${result.detectedPages} pages)\n\n${ocrNote}`,
    );
  } else {
    blocks.push(`## Transcribed text\n\n${ocrNote}`);
  }
  for (let i = 0; i < result.pages.length; i++) {
    const text = result.pages[i].trim();
    if (!text || text.length < 30) continue;
    if (result.totalPages > 1) {
      blocks.push(
        `### Page ${i + 1}${result.detectedPages > 1 ? ` of ${result.detectedPages}` : ""}\n\n${text}`,
      );
    } else {
      blocks.push(text);
    }
  }
  if (result.truncated) {
    blocks.push(
      `_(${result.detectedPages - result.totalPages} additional pages omitted from this transcript — view the full text on the Portal to Texas History.)_`,
    );
  }
  blocks.push(
    `Original record: [${item.ark} on the Portal to Texas History](https://texashistory.unt.edu/ark:/67531/${item.ark}/).`,
  );
  return blocks.filter(Boolean).join("\n\n");
}
