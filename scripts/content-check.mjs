#!/usr/bin/env node

/**
 * pnpm content:check — validate every MDX frontmatter against its schema
 * and warn on any cross-references that point at slugs that don't exist.
 *
 * Same checks the Next.js build runs at build time, available standalone
 * so curators (or anyone reviewing a contribution PR) can run validation
 * without spinning up the dev server.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT = join(ROOT, "content");

const TYPES = [
  "stories",
  "people",
  "places",
  "eras",
  "documents",
  "audio",
  "maps",
  "meetings",
  "collections",
];

const REF_KEYS = [
  "stories",
  "people",
  "places",
  "documents",
  "audio",
  "maps",
  "eras",
  "collections",
];

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

let errors = 0;
let warnings = 0;

const allBySlug = Object.fromEntries(TYPES.map((t) => [t, new Set()]));
const items = [];

for (const type of TYPES) {
  const dir = join(CONTENT, type);
  let names;
  try {
    names = await readdir(dir);
  } catch {
    continue;
  }
  for (const name of names) {
    if (!name.endsWith(".mdx")) continue;
    const slug = name.replace(/\.mdx$/, "");
    const path = join(dir, name);
    const raw = await readFile(path, "utf8");
    const { data } = matter(raw);
    items.push({ type, slug, path, data });
    allBySlug[type].add(slug);
    if (!SLUG_RE.test(slug)) {
      err(`${path}: filename slug "${slug}" must be kebab-case`);
    }
    if (typeof data.title !== "string" || !data.title.trim()) {
      err(`${path}: frontmatter must include a non-empty "title"`);
    }
    if (data.slug && data.slug !== slug) {
      err(`${path}: frontmatter slug "${data.slug}" does not match filename "${slug}"`);
    }
  }
}

for (const item of items) {
  for (const key of REF_KEYS) {
    const refs = item.data[key];
    if (!Array.isArray(refs)) continue;
    for (const ref of refs) {
      if (typeof ref !== "string") {
        err(`${item.path}: ${key}[] contains non-string`);
        continue;
      }
      if (!allBySlug[key].has(ref)) {
        warn(`${item.path}: ${key}[] references "${ref}" which does not exist in /content/${key}/`);
      }
    }
  }
}

const total = items.length;
const counts = TYPES.map(
  (t) => `${t}=${items.filter((i) => i.type === t).length}`,
).join(" ");

console.log(`\nChecked ${total} content files.\n  ${counts}`);
console.log(`  errors=${errors} warnings=${warnings}`);
if (errors > 0) process.exit(1);

function err(msg) {
  errors++;
  console.error(`  ERROR · ${msg}`);
}
function warn(msg) {
  warnings++;
  console.warn(`  WARN  · ${msg}`);
}
