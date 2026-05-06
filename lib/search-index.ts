/**
 * Build-time generator for the static search index.
 *
 * Walks every content file plus the live Buzzsprout feed and emits a
 * compact JSON array. The /search page embeds this JSON into the page
 * payload and runs MiniSearch over it client-side. Index stays small
 * (bodies truncated, no images) so the JSON ships in well under 200KB
 * even with hundreds of episodes.
 */

import { CONTENT_TYPES, TYPE_LABEL, type ContentType } from "./schemas";
import { loadAllContent, type LoadedItem } from "./content";
import { getEpisodes } from "./buzzsprout";
import { loadEhcCollection, KIND_LABELS, type ItemKind } from "./ehc";

export interface SearchDoc {
  id: string;
  type: ContentType | "audio-podcast" | "ehc-item";
  typeLabel: string;
  title: string;
  href: string;
  summary: string;
  body: string;
  tags: string;
  subtitle: string;
  date: string;
}

const BODY_CHARS = 600;

export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = [];

  // Local MDX content
  const all = await loadAllContent();
  for (const type of CONTENT_TYPES) {
    for (const item of all[type]) {
      docs.push(toDoc(type, item));
    }
  }

  // EHC partner items — searchable; clicks go off-site to UNT
  try {
    const ehc = await loadEhcCollection();
    for (const item of ehc.items) {
      docs.push({
        id: `ehc-item/${item.ark}`,
        type: "ehc-item",
        typeLabel: `${KIND_LABELS[item.kind as ItemKind] ?? "Item"} (EHC)`,
        title: item.title,
        href: item.recordUrl,
        summary: item.summary,
        body: item.tags.join(" "),
        tags: item.tags.join(" "),
        subtitle: `Eanes History Center · UNT ${item.ark}`,
        date: "",
      });
    }
  } catch (err) {
    console.warn("[search] could not load EHC items for index:", err);
  }

  // Live podcast episodes — searchable by title and description
  try {
    const episodes = await getEpisodes();
    for (const ep of episodes) {
      docs.push({
        id: `audio-podcast/${ep.guid}`,
        type: "audio-podcast",
        typeLabel: "Podcast",
        title: ep.title,
        href: ep.audioUrl,
        summary: ep.description,
        body: ep.rawTitle,
        tags: ep.chapterTitle ?? "",
        subtitle: [
          ep.chapter != null ? `Ch. ${ep.chapter}` : null,
          ep.episode != null ? `Episode ${ep.episode}` : null,
          ep.publishedAtDisplay,
        ]
          .filter(Boolean)
          .join(" · "),
        date: ep.publishedAt,
      });
    }
  } catch (err) {
    console.warn("[search] could not fetch Buzzsprout for index:", err);
  }

  return docs;
}

function toDoc(type: ContentType, item: LoadedItem): SearchDoc {
  const f = item.frontmatter as Record<string, unknown>;
  return {
    id: `${type}/${item.slug}`,
    type,
    typeLabel: TYPE_LABEL[type],
    title: String(f.title ?? item.slug),
    href: `/${type}/${item.slug}`,
    summary: typeof f.summary === "string" ? f.summary : "",
    body: item.body.replace(/\s+/g, " ").trim().slice(0, BODY_CHARS),
    tags: tagString(f),
    subtitle: subtitleFor(type, f),
    date: dateFor(type, f),
  };
}

function tagString(f: Record<string, unknown>): string {
  const out: string[] = [];
  if (Array.isArray(f.tags))
    out.push(...f.tags.filter((t): t is string => typeof t === "string"));
  if (Array.isArray(f.era))
    out.push(...f.era.filter((t): t is string => typeof t === "string"));
  if (Array.isArray(f.roles))
    out.push(...f.roles.filter((t): t is string => typeof t === "string"));
  if (typeof f.placeType === "string") out.push(f.placeType);
  if (typeof f.documentType === "string") out.push(f.documentType);
  if (Array.isArray(f.historicalNames))
    out.push(...f.historicalNames.filter((t): t is string => typeof t === "string"));
  return out.join(" ");
}

function subtitleFor(type: ContentType, f: Record<string, unknown>): string {
  const bits: string[] = [];
  if (type === "people") {
    if (f.birthDate || f.deathDate)
      bits.push(`${f.birthDate ?? "?"}–${f.deathDate ?? "present"}`);
    if (Array.isArray(f.roles) && f.roles.length)
      bits.push((f.roles as string[]).slice(0, 2).join(", "));
  } else if (type === "places") {
    if (typeof f.placeType === "string") bits.push(f.placeType);
    if (typeof f.locationLabel === "string") bits.push(String(f.locationLabel));
  } else if (type === "documents") {
    if (typeof f.documentType === "string") bits.push(f.documentType);
    if (typeof f.date === "string") bits.push(String(f.date));
  } else if (type === "stories") {
    if (typeof f.date === "string") bits.push(String(f.date));
  } else if (type === "eras") {
    if (typeof f.yearStart === "number" && typeof f.yearEnd === "number")
      bits.push(`${f.yearStart}–${f.yearEnd}`);
  } else if (type === "collections") {
    if (typeof f.curator === "string") bits.push(String(f.curator));
  } else if (type === "audio") {
    if (typeof f.audioType === "string") bits.push(String(f.audioType));
    if (typeof f.date === "string") bits.push(String(f.date));
  }
  return bits.join(" · ");
}

function dateFor(type: ContentType, f: Record<string, unknown>): string {
  if (typeof f.date === "string") return String(f.date);
  if (typeof f.yearStart === "number") return String(f.yearStart);
  if (typeof f.birthDate === "number" || typeof f.birthDate === "string")
    return String(f.birthDate);
  return "";
}
