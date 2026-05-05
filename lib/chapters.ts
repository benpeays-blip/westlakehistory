import type { Episode } from "./buzzsprout";

export interface ChapterSummary {
  chapter: number;
  title: string;
  episodeCount: number;
}

/**
 * Aggregate episodes by chapter, preserving Emmett's chapter numbering.
 * For each chapter we keep the longest variant of `chapterTitle` we see, since
 * Buzzsprout titles drift slightly across episodes ("Tx Politics" vs "TxPolitics").
 */
export function buildChapterIndex(episodes: Episode[]): ChapterSummary[] {
  const map = new Map<number, ChapterSummary>();
  for (const ep of episodes) {
    if (ep.chapter == null) continue;
    const cleaned = cleanChapterTitle(ep.chapterTitle);
    const existing = map.get(ep.chapter);
    if (!existing) {
      map.set(ep.chapter, {
        chapter: ep.chapter,
        title: cleaned ?? `Chapter ${ep.chapter}`,
        episodeCount: 1,
      });
    } else {
      existing.episodeCount += 1;
      if (cleaned && cleaned.length > existing.title.length) {
        existing.title = cleaned;
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.chapter - b.chapter);
}

/**
 * Buzzsprout chapter titles drift across episodes. Strip leading/trailing
 * separators ("Ch5 - Early South Austin" → "Early South Austin") and reject
 * fragments left bare after the dash. Returns null for unusable input.
 */
function cleanChapterTitle(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.replace(/^[\s\-–—:·]+|[\s\-–—:·]+$/g, "").trim();
  return trimmed || null;
}
