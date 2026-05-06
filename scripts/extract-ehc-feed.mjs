#!/usr/bin/env node

/**
 * One-off helper: parse an EHC Atom feed XML file and emit the
 * cleaned JSON payload for ehc-items.json. Used to extend the catalogue
 * as additional pages of the feed are pulled.
 *
 * Usage: node scripts/extract-ehc-feed.mjs <path-to-feed.xml>
 */

import { readFile } from "node:fs/promises";

const file = process.argv[2];
if (!file) {
  console.error("usage: extract-ehc-feed.mjs <path-to-feed.xml>");
  process.exit(1);
}
const xml = await readFile(file, "utf8");

const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
console.error(`Found ${entries.length} <entry> elements in ${file}`);

const out = entries.map((block) => {
  const title = pickText(block, "title");
  const link = block.match(/<link href="([^"]+)" rel="alternate"\/>/)?.[1] ?? "";
  const ark = link.match(/(metapth\d+)/)?.[1] ?? "";
  const summaryHtml = pickText(block, "summary");
  // Strip the leading <p><a href=...><img.../></a></p> from summary
  const summaryClean = summaryHtml
    .replace(/^<p><a [^>]+><img [^/]+\/><\/a><\/p>/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return { ark, title: title.replace(/^\[|\]$/g, ""), summary: summaryClean };
});

console.log(JSON.stringify(out, null, 2));

function pickText(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1] : "";
}
