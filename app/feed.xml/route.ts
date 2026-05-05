/**
 * RSS 2.0 feed for the archive's stories.
 *
 * Lets researchers, the Internet Archive, and any reader who maintains an
 * RSS subscription stay in sync as new stories are catalogued. The feed
 * is regenerated at build time and revalidated hourly via ISR — no
 * runtime cost when no new content has landed.
 */

import { loadType } from "@/lib/content";

export const revalidate = 3600;

const SITE = "https://westlakehistory.com";

export async function GET() {
  const stories = await loadType("stories");

  // Newest first
  const sorted = [...stories].sort((a, b) =>
    ((b.frontmatter as { date?: string }).date ?? "").localeCompare(
      (a.frontmatter as { date?: string }).date ?? "",
    ),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Westlake History — Stories</title>
    <link>${SITE}/stories</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>A community archive of West Lake Hills, Texas. New stories as they are catalogued.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${sorted.map(itemXml).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function itemXml(s: { slug: string; frontmatter: unknown }): string {
  const f = s.frontmatter as {
    title: string;
    summary?: string;
    date?: string;
    byline?: string;
  };
  const link = `${SITE}/stories/${s.slug}`;
  const pub = f.date ? new Date(f.date).toUTCString() : new Date().toUTCString();
  return `    <item>
      <title>${esc(f.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pub}</pubDate>
      <author>${esc(f.byline ?? "Westlake Historical Society")}</author>
      <description>${esc(f.summary ?? "")}</description>
    </item>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
