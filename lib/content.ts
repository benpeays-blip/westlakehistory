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
 */
function validateCrossReferences(index: ContentIndex): void {
  const exists = (type: ContentType, slug: string) =>
    index[type].some((i) => i.slug === slug);

  const warn = (where: string, ref: string) => {
    // eslint-disable-next-line no-console
    console.warn(`[content] dangling reference in ${where}: "${ref}" not found`);
  };

  for (const story of index.stories) {
    const f = story.frontmatter as { storyteller?: string; era?: string; people?: string[]; places?: string[]; audio?: string };
    if (f.storyteller && !exists("people", f.storyteller))
      warn(`stories/${story.slug}.storyteller`, f.storyteller);
    if (f.era && !exists("eras", f.era))
      warn(`stories/${story.slug}.era`, f.era);
    for (const p of f.people ?? [])
      if (!exists("people", p)) warn(`stories/${story.slug}.people`, p);
    for (const p of f.places ?? [])
      if (!exists("places", p)) warn(`stories/${story.slug}.places`, p);
    if (f.audio && !exists("audio", f.audio))
      warn(`stories/${story.slug}.audio`, f.audio);
  }

  for (const place of index.places) {
    const f = place.frontmatter as { era?: string };
    if (f.era && !exists("eras", f.era))
      warn(`places/${place.slug}.era`, f.era);
  }

  for (const audio of index.audio) {
    const f = audio.frontmatter as { relatedStory?: string };
    if (f.relatedStory && !exists("stories", f.relatedStory))
      warn(`audio/${audio.slug}.relatedStory`, f.relatedStory);
  }
}

// --- Reverse-lookup helpers used by detail pages ---------------------------

export async function getStoriesMentioning(
  type: "people" | "places",
  slug: string,
): Promise<LoadedItem[]> {
  const { stories } = await loadAllContent();
  const key = type === "people" ? "people" : "places";
  return stories.filter((s) => {
    const refs = (s.frontmatter as Record<string, unknown>)[key];
    return Array.isArray(refs) && refs.includes(slug);
  });
}

export async function getStoriesInEra(eraSlug: string): Promise<LoadedItem[]> {
  const { stories } = await loadAllContent();
  return stories.filter((s) => (s.frontmatter as { era?: string }).era === eraSlug);
}

export async function getStoryByAudio(audioSlug: string): Promise<LoadedItem | null> {
  const { stories } = await loadAllContent();
  return stories.find((s) => (s.frontmatter as { audio?: string }).audio === audioSlug) ?? null;
}
