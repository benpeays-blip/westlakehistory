#!/usr/bin/env node

/**
 * Fetches OCR text from The Portal to Texas History for an EHC item.
 *
 * Each ARK on UNT has a per-page OCR endpoint at:
 *   /ark:/67531/<ARK>/m1/<page>/ocr
 * which returns an HTML wrapper around the OCR'd text (inside the
 * `#ocr-text` div). We pull every page, extract the text, and emit a
 * single concatenated string.
 *
 * Usage:
 *   pnpm fetch-ehc-ocr metapth1065532
 *
 * Or programmatic:
 *   import { fetchOcrForArk } from "./scripts/fetch-ehc-ocr.mjs";
 *   const text = await fetchOcrForArk("metapth1065532");
 *
 * Permission: only run for items where we have explicit reproduction
 * permission. The EHC collection is covered by Westbank CLD's grant.
 */

const UNT_BASE = "https://texashistory.unt.edu/ark:/67531";
const UA =
  "WestlakeHistoryArchive/1.0 (+https://westlakehistory.com; mirroring under permission)";

export async function fetchOcrForArk(ark) {
  // First request page 1 to discover total page count from the title tag.
  const firstHtml = await fetchHtml(`${UNT_BASE}/${ark}/m1/1/ocr`);
  const totalPages = extractPageCount(firstHtml) ?? 1;
  const pages = [extractOcrText(firstHtml)];

  for (let p = 2; p <= totalPages; p++) {
    await sleep(800); // polite pacing — UNT's edge throttles aggressive bursts
    const html = await fetchHtml(`${UNT_BASE}/${ark}/m1/${p}/ocr`);
    pages.push(extractOcrText(html));
  }

  return {
    ark,
    pages,
    totalPages,
    /** Single concatenated string with explicit page breaks. */
    text: pages
      .map((t, i) => `--- Page ${i + 1} of ${totalPages} ---\n\n${t.trim()}`)
      .join("\n\n"),
  };
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractPageCount(html) {
  // <title>... - Page 1 of 4 - OCR Text ...</title>
  const m = html.match(/Page\s+\d+\s+of\s+(\d+)/);
  return m ? Number(m[1]) : null;
}

function extractOcrText(html) {
  // Pull out the #ocr-text div contents
  const m = html.match(
    /<div[^>]*id="ocr-text"[^>]*>([\s\S]*?)<\/div>\s*<\/main>|<div[^>]*id="ocr-text"[^>]*>([\s\S]*?)<\/main>/,
  );
  let inner = m ? m[1] ?? m[2] ?? "" : "";
  if (!inner) {
    // Fallback: just grab everything between the open div and the next div
    // tag at depth 0. Cheap and good enough for UNT's flat structure.
    const open = html.indexOf('id="ocr-text"');
    if (open !== -1) {
      const start = html.indexOf(">", open) + 1;
      const end = html.indexOf("</div>", start);
      if (end !== -1) inner = html.slice(start, end);
    }
  }
  return cleanOcrHtml(inner);
}

function cleanOcrHtml(html) {
  const decoded = decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n");

  // Strip the UNT page-navigation footer ("Upcoming Pages", "Search Inside",
  // "Tools / Downloads", etc.) that appears after the OCR proper.
  const footerIdx = decoded.search(
    /\b(Upcoming Pages|Show all pages|Search Inside|Tools \/ Downloads|Get a copy of this page)\b/,
  );
  let body = footerIdx > 0 ? decoded.slice(0, footerIdx) : decoded;

  // Drop OCR-noise lines. We score each line on the share of "real words"
  // (3+-letter clean alphabetical runs) — photo-region noise is almost
  // entirely punctuation and single-character tokens.
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return true; // preserve paragraph breaks
      if (l.length < 4) return false;
      if (/^[\W_\d]+$/.test(l)) return false; // pure punctuation/digits
      const realWords = (l.match(/\b[A-Za-z]{3,}\b/g) ?? []).length;
      const tokens = l.split(/\s+/).length;
      if (realWords < 2) return false;
      if (realWords / tokens < 0.4) return false;
      return true;
    });

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const ark = process.argv[2];
  if (!ark) {
    console.error("usage: fetch-ehc-ocr.mjs <ark>");
    process.exit(1);
  }
  const result = await fetchOcrForArk(ark);
  console.log(`# ${ark} — ${result.totalPages} pages\n`);
  console.log(result.text);
}
