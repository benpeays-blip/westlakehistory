/**
 * Build-time fetcher for the Our Westlake podcast RSS feed.
 *
 * Buzzsprout's `feeds.buzzsprout.com` URL 301s to `rss.buzzsprout.com`,
 * so we hit the canonical destination directly.
 *
 * The RSS schema is stable; we hand-parse with regex rather than pull in an
 * XML dependency. If Buzzsprout ever changes the format, replace this with
 * fast-xml-parser.
 */

const FEED_URL = "https://rss.buzzsprout.com/2079111.rss";

export interface Episode {
  guid: string;
  title: string;          // Cleaned title (without "Ch1...Ep105..." prefix)
  rawTitle: string;       // Original feed title
  chapter: number | null;
  chapterTitle: string | null;
  episode: number | null;
  description: string;    // Plain-text summary, first ~280 chars
  audioUrl: string;
  audioBytes: number;
  durationSec: number;
  publishedAt: string;    // ISO 8601
  publishedAtDisplay: string; // "Jan 1, 2026"
  storyteller: string;
}

export async function getEpisodes(): Promise<Episode[]> {
  const res = await fetch(FEED_URL, {
    next: { revalidate: 3600 }, // refresh hourly
  });
  if (!res.ok) {
    throw new Error(`Buzzsprout feed fetch failed: ${res.status}`);
  }
  const xml = await res.text();
  return parseFeed(xml);
}

function parseFeed(xml: string): Episode[] {
  const items: Episode[] = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  for (const block of itemBlocks) {
    const rawTitle = pickCdataOrText(block, "title");
    const description = stripHtml(pickCdataOrText(block, "description"));
    const audioMatch = block.match(
      /<enclosure\s+url="([^"]+)"\s+length="(\d+)"\s+type="[^"]+"\s*\/>/
    );
    const guid = pickText(block, "guid");
    const pubDate = pickText(block, "pubDate");
    const durationStr = pickText(block, "itunes:duration");
    const author = pickText(block, "itunes:author") || "Emmett Shelton, Sr.";
    const itunesEpisode = pickText(block, "itunes:episode");

    const titleMeta = parseTitleMeta(rawTitle);

    items.push({
      guid: guid || crypto.randomUUID(),
      rawTitle,
      title: titleMeta.title,
      chapter: titleMeta.chapter,
      chapterTitle: titleMeta.chapterTitle,
      episode: titleMeta.episode ?? toIntOrNull(itunesEpisode),
      description: truncate(description, 280),
      audioUrl: audioMatch?.[1] ?? "",
      audioBytes: audioMatch ? Number(audioMatch[2]) : 0,
      durationSec: toIntOrNull(durationStr) ?? 0,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : "",
      publishedAtDisplay: pubDate ? formatDate(pubDate) : "",
      storyteller: author,
    });
  }

  return items;
}

/**
 * "Ch1 Developing Westlake Ep105 Cedar Crest Night Club"
 *   → chapter 1, chapterTitle "Developing Westlake", episode 105,
 *     title "Cedar Crest Night Club"
 *
 * Some titles drop the chapter prefix; we degrade gracefully.
 */
function parseTitleMeta(raw: string): {
  chapter: number | null;
  chapterTitle: string | null;
  episode: number | null;
  title: string;
} {
  const m = raw.match(/^Ch\s*(\d+)\s+(.+?)\s+Ep\s*(\d+)\s+(.+)$/i);
  if (m) {
    return {
      chapter: Number(m[1]),
      chapterTitle: m[2].trim(),
      episode: Number(m[3]),
      title: m[4].trim(),
    };
  }
  const epOnly = raw.match(/^Ep\s*(\d+)\s+(.+)$/i);
  if (epOnly) {
    return {
      chapter: null,
      chapterTitle: null,
      episode: Number(epOnly[1]),
      title: epOnly[2].trim(),
    };
  }
  return { chapter: null, chapterTitle: null, episode: null, title: raw };
}

function pickCdataOrText(block: string, tag: string): string {
  const cdata = block.match(
    new RegExp(`<${escapeTag(tag)}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${escapeTag(tag)}>`)
  );
  if (cdata) return decodeEntities(cdata[1].trim());
  return pickText(block, tag);
}

function pickText(block: string, tag: string): string {
  const m = block.match(
    new RegExp(`<${escapeTag(tag)}[^>]*>([\\s\\S]*?)</${escapeTag(tag)}>`)
  );
  return m ? decodeEntities(m[1].trim()) : "";
}

function escapeTag(tag: string): string {
  return tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

function toIntOrNull(s: string): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatDate(rfc2822: string): string {
  const d = new Date(rfc2822);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDuration(sec: number): string {
  if (!sec) return "";
  const min = Math.round(sec / 60);
  return `${min} min`;
}
