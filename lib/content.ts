/**
 * Build-time content loader.
 *
 * Reads MDX files from `/content/<type>/<slug>.mdx`, splits frontmatter from
 * body with gray-matter, validates frontmatter against the per-type Zod
 * schema, and returns a typed result. Any validation failure throws — which
 * fails the production build, exactly as the brief requires.
 *
 * Cross-reference integrity (does the slug a Story points to actually exist?)
 * is validated separately in `validateCrossReferences()`. Missing references
 * log warnings; rendering code drops broken links rather than crashing.
 *
 * The loader caches its result per process to avoid re-parsing the same files
 * multiple times during a build.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  CONTENT_TYPES,
  SCHEMAS,
  type ContentType,
} from "./schemas";

export interface LoadedItem<F = unknown> {
  type: ContentType;
  slug: string;
  filePath: string;
  frontmatter: F;
  body: string; // raw MDX, compiled at render time
}

export type ContentIndex = {
  [K in ContentType]: LoadedItem[];
};

const CONTENT_ROOT = path.join(process.cwd(), "content");

let cache: ContentIndex | null = null;

export async function loadAllContent(): Promise<ContentIndex> {
  if (cache) return cache;

  const result = {} as ContentIndex;
  for (const type of CONTENT_TYPES) {
    result[type] = await loadType(type);
  }

  validateCrossReferences(result);

  cache = result;
  return result;
}

export async function loadType<T extends ContentType>(
  type: T,
): Promise<LoadedItem[]> {
  const dir = path.join(CONTENT_ROOT, type);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const files = entries.filter((e) => e.endsWith(".mdx"));
  const items: LoadedItem[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const slugFromFile = file.replace(/\.mdx$/, "");

    // Inject slug from filename if frontmatter omits it (matches behavior most
    // editors expect: "filename = slug").
    if (typeof data.slug !== "string") {
      data.slug = slugFromFile;
    } else if (data.slug !== slugFromFile) {
      throw new Error(
        `[content] ${filePath}: frontmatter slug "${data.slug}" does not match filename "${slugFromFile}". ` +
          `These must match so URLs are stable.`,
      );
    }

    const schema = SCHEMAS[type];
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const formatted = parsed.error.issues
        .map((i) => `  • ${i.path.join(".") || "<root>"}: ${i.message}`)
        .join("\n");
      throw new Error(
        `[content] Invalid frontmatter in ${filePath}:\n${formatted}`,
      );
    }

    items.push({
      type,
      slug: data.slug,
      filePath,
      frontmatter: parsed.data,
      body: content,
    });
  }

  // Stable sort by slug so build output is deterministic
  items.sort((a, b) => a.slug.localeCompare(b.slug));
  return items;
}

export async function loadOne<T extends ContentType>(
  type: T,
  slug: string,
): Promise<LoadedItem | null> {
  const all = await loadType(type);
  return all.find((i) => i.slug === slug) ?? null;
}

/**
 * After loading every content file, walk all cross-references and warn (not
 * throw) on dangling slugs. Renderers should treat missing references as
 * "drop the link" rather than 404, so the archive stays browsable while
 * curators are still adding content.
 *
 * The new frontmatter shape uses plural slug arrays (people, places, stories,
 * documents, audio, maps, collections) on every cross-referencing entity, so
 * the same six checks cover all entity types.
 */

// Maps a frontmatter array key → the content type it points at.
const REF_KEYS: Record<string, ContentType> = {
  people: "people",
  places: "places",
  stories: "stories",
  documents: "documents",
  audio: "audio",
  maps: "maps",
  eras: "eras",
  collections: "collections",
};

function validateCrossReferences(index: ContentIndex): void {
  const exists = (type: ContentType, slug: string) =>
    index[type].some((i) => i.slug === slug);

  const warn = (where: string, ref: string) => {
    // eslint-disable-next-line no-console
    console.warn(`[content] dangling reference in ${where}: "${ref}" not found`);
  };

  for (const type of CONTENT_TYPES) {
    for (const item of index[type]) {
      const fm = item.frontmatter as Record<string, unknown>;
      for (const [key, targetType] of Object.entries(REF_KEYS)) {
        const refs = fm[key];
        if (Array.isArray(refs)) {
          for (const ref of refs) {
            if (typeof ref === "string" && !exists(targetType, ref)) {
              warn(`${type}/${item.slug}.${key}`, ref);
            }
          }
        }
      }
    }
  }
}

// --- Reverse-lookup helpers used by detail pages ---------------------------

/**
 * Find every item across all content types that references `targetSlug`
 * via any of the cross-reference array keys. Used to populate Sources &
 * Connections sidebars (e.g. "stories that mention this person").
 */
export async function getReferencingItems(
  refKey: keyof typeof REF_KEYS,
  targetSlug: string,
): Promise<LoadedItem[]> {
  const all = await loadAllContent();
  const out: LoadedItem[] = [];
  for (const type of CONTENT_TYPES) {
    for (const item of all[type]) {
      const refs = (item.frontmatter as Record<string, unknown>)[refKey];
      if (Array.isArray(refs) && refs.includes(targetSlug)) {
        out.push(item);
      }
    }
  }
  return out;
}

/** Resolve an array of slugs to loaded items of a given type, dropping misses. */
export async function resolveRefs<T extends ContentType>(
  type: T,
  slugs: string[] | undefined,
): Promise<LoadedItem[]> {
  if (!slugs?.length) return [];
  const all = await loadType(type);
  const bySlug = new Map(all.map((i) => [i.slug, i]));
  return slugs.map((s) => bySlug.get(s)).filter((i): i is LoadedItem => Boolean(i));
}
