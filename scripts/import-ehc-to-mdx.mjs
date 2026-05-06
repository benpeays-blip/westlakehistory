#!/usr/bin/env node

/**
 * One-shot import: turn /content/partners/ehc-items.json into 69 first-class
 * /content/documents/<ark>.mdx files so each EHC item participates in the
 * cross-reference graph (place pages, person pages, search) instead of
 * being buried inside the collection page.
 *
 * Cross-references are inferred from title + summary + tags by matching
 * against PLACE_PATTERNS and PERSON_PATTERNS below — refine these as the
 * archive grows.
 *
 * Idempotent: rewrites the MDX from the JSON each time (so editing tags
 * in JSON regenerates the cross-refs). If you've manually edited a
 * generated MDX file, that file is preserved unless you pass --force.
 *
 * Usage:
 *   pnpm import:ehc           # normal mode: skip if MDX already exists
 *   pnpm import:ehc --force   # overwrite even existing files
 */

import { readFile, writeFile, stat, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ITEMS_PATH = join(ROOT, "content", "partners", "ehc-items.json");
const DOCS_DIR = join(ROOT, "content", "documents");
const force = process.argv.includes("--force");

const KIND_TO_DOCTYPE = {
  photograph: "Photograph",
  illustration: "Illustration",
  letter: "Letter",
  interview: "Interview",
  "interview-notes": "Interview Notes",
  "oral-history": "Oral History",
  essay: "Essay",
  manuscript: "Manuscript",
  newspaper: "Newspaper",
  "family-record": "Family Record",
};

// Place + person inference patterns. Add more as content grows.
const PLACE_PATTERNS = [
  { rx: /\b(eanes rock schoolhouse|rock schoolhouse|eanes rock school)\b/i, slug: "eanes-rock-schoolhouse" },
  { rx: /\b(westlake high school|west lake high)\b/i, slug: "westlake-high-school" },
  { rx: /\b(eanes school|eanes elementary|eanes frame school)\b/i, slug: "eanes-school" },
  { rx: /\bbee cave (road|trail)\b/i, slug: "bee-cave-road" },
  { rx: /\blake austin\b/i, slug: "lake-austin" },
  { rx: /\btom miller dam\b/i, slug: "tom-miller-dam" },
  { rx: /\bdavenport (ranch|tract|family)\b/i, slug: "davenport-ranch" },
];

const PERSON_PATTERNS = [
  { rx: /\bcharles (randolph|r\.) eanes\b/i, slug: "charles-r-eanes" },
  { rx: /\brobert eanes\b/i, slug: "robert-eanes" },
  { rx: /\bemmett (robert )?shelton(,? sr\.?)?\b/i, slug: "emmett-shelton-sr" },
  { rx: /\bpolk shelton\b/i, slug: "polk-shelton" },
  { rx: /\b(james|buck) ('?buck'? )?davenport\b/i, slug: "james-buck-davenport" },
];

const STORY_PATTERNS = [
  { rx: /\bbee cave road\b.*\b(paving|paved)\b/i, slug: "the-night-bee-cave-road-was-paved" },
  { rx: /\bdavenport (ranch|family|tract)\b/i, slug: "the-davenport-ranch-and-the-birth-of-westlake" },
];

const ATTRIBUTION =
  "Eanes History Center, Westbank Community Library District. Digital reproduction originally produced by The Portal to Texas History (UNT Libraries).";
const RIGHTS =
  "Reproduction permitted by the Westbank Community Library District as the official archive home for the EHC project.";

const json = JSON.parse(await readFile(ITEMS_PATH, "utf8"));
await mkdir(DOCS_DIR, { recursive: true });

let created = 0;
let skipped = 0;
let updated = 0;

for (const item of json.items) {
  const slug = item.ark;
  const path = join(DOCS_DIR, `${slug}.mdx`);
  const exists = await fileExists(path);
  if (exists && !force) {
    skipped++;
    continue;
  }

  const haystack = [item.title, item.summary, ...(item.tags ?? [])].join(" ");
  const places = match(PLACE_PATTERNS, haystack);
  const people = match(PERSON_PATTERNS, haystack);
  const stories = match(STORY_PATTERNS, haystack);

  const documentType = KIND_TO_DOCTYPE[item.kind] ?? "Document";
  const cleanTitle = item.title;
  const safeTitle = needsQuote(cleanTitle) ? JSON.stringify(cleanTitle) : cleanTitle;

  const lines = [
    "---",
    `title: ${safeTitle}`,
    `slug: "${slug}"`,
    `type: "document"`,
    `documentType: "${documentType}"`,
    `source: "${ATTRIBUTION}"`,
    `creator: "Eanes History Center"`,
    `image: "/media/ehc/image/${slug}.jpg"`,
    `thumb: "/media/ehc/thumb/${slug}.jpg"`,
    `rights: ${needsQuote(RIGHTS) ? JSON.stringify(RIGHTS) : `"${RIGHTS}"`}`,
    `externalRecordUrl: "https://texashistory.unt.edu/ark:/67531/${slug}/"`,
  ];

  if (places.length) lines.push(yamlList("places", places));
  if (people.length) lines.push(yamlList("people", people));
  if (stories.length) lines.push(yamlList("stories", stories));

  lines.push(yamlList("collections", ["eanes-history-center"]));

  if (item.tags?.length) {
    // Tags aren't part of documentSchema, but we drop a comment for curators
    // who edit by hand later.
  }

  lines.push("---", "", item.summary || "", "");
  lines.push(
    `Original record: [${slug} on the Portal to Texas History](https://texashistory.unt.edu/ark:/67531/${slug}/).`,
  );

  await writeFile(path, lines.join("\n"));
  if (exists) updated++;
  else created++;
}

console.log(
  `\n  created=${created} updated=${updated} skipped=${skipped}\n  Run \`pnpm content:check\` to validate cross-references.`,
);

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

function match(patterns, text) {
  const hits = new Set();
  for (const p of patterns) {
    if (p.rx.test(text)) hits.add(p.slug);
  }
  return [...hits];
}

function yamlList(name, items) {
  return `${name}:\n${items.map((s) => `  - "${s}"`).join("\n")}`;
}

function needsQuote(s) {
  // YAML scalar safety — quote when there are colons, leading symbols, etc.
  return /[:'"#&*?\[\]\{\}]|^[-?@`!]|^\s|\s$/.test(s);
}
