import Link from "next/link";
import { getEpisodes, formatDuration } from "@/lib/buzzsprout";
import { loadType } from "@/lib/content";

export const revalidate = 3600;

export const metadata = {
  title: "Audio — Westlake History",
  description:
    "Podcast episodes and oral histories — the recorded memory of Westlake, Texas.",
};

export default async function AudioIndex() {
  const [mdx, episodes] = await Promise.all([
    loadType("audio"),
    safeEpisodes(),
  ]);

  // Set of Buzzsprout GUIDs already curated as MDX archive entries — skip
  // those when rendering the raw feed list so we don't double-list them.
  const curatedGuids = new Set(
    mdx
      .map((m) => (m.frontmatter as { rssGuid?: string }).rssGuid)
      .filter((g): g is string => Boolean(g)),
  );
  const rawEpisodes = episodes.filter((e) => !curatedGuids.has(e.guid));

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <header className="border-b border-rule pb-7">
        <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
          Audio
        </h1>
        <p className="mt-3 max-w-[720px] text-[16px] leading-snug text-ink-mute">
          Podcast episodes and oral histories — the recorded memory of
          Westlake. Episodes that have been catalogued into the archive
          (with cross-references and source notes) appear above. Below is
          the raw feed of every episode currently published in the {" "}
          <em className="not-italic text-ink">Our Westlake</em> podcast.
        </p>
        <p className="meta-line mt-4">
          {mdx.length} catalogued · {rawEpisodes.length} raw ·{" "}
          {episodes.length} total
        </p>
      </header>

      {mdx.length ? (
        <section className="border-b border-rule pb-4">
          <h2 className="label-archival mt-8 mb-5 text-cedar">
            In the archive
          </h2>
          <ul className="divide-y divide-rule">
            {mdx.map((item) => {
              const f = item.frontmatter as {
                title: string;
                audioType?: string;
                interviewee?: string;
                date?: string;
                duration?: string;
                summary?: string;
              };
              return (
                <li key={item.slug}>
                  <Link
                    href={`/audio/${item.slug}`}
                    className="group block py-6 transition-colors hover:bg-limestone/40"
                  >
                    <p className="label-archival mb-2 text-cedar">
                      {f.audioType ?? "Audio"}
                    </p>
                    <h3 className="font-display text-[20px] leading-snug text-ink transition-colors group-hover:text-oak">
                      {f.title}
                    </h3>
                    {f.summary ? (
                      <p className="mt-2 max-w-[760px] text-[14.5px] leading-snug text-ink-mute">
                        {f.summary}
                      </p>
                    ) : null}
                    <p className="meta-line mt-3 text-[11.5px]">
                      {[f.interviewee, f.date, f.duration]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="label-archival mt-10 mb-5 text-ink-mute">
          Raw podcast feed
        </h2>
        {rawEpisodes.length === 0 ? (
          <p className="py-10 text-[16px] text-ink-mute">
            No raw episodes — every published episode has been catalogued
            into the archive. (Or the feed could not be fetched.)
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {rawEpisodes.map((ep) => (
              <li key={ep.guid} className="py-6">
                <p className="label-archival mb-2 text-ink-mute">
                  {ep.chapter != null
                    ? `Ch. ${ep.chapter}${ep.chapterTitle ? ` · ${ep.chapterTitle}` : ""}${
                        ep.episode != null ? ` · Episode ${ep.episode}` : ""
                      }`
                    : ep.episode != null
                      ? `Episode ${ep.episode}`
                      : "Audio"}
                </p>
                <h3 className="font-display text-[20px] leading-snug text-ink">
                  {ep.title}
                </h3>
                <p className="mt-2 max-w-[760px] text-[15px] leading-snug text-ink-mute">
                  {ep.description}
                </p>
                <p className="meta-line mt-3 text-[11.5px]">
                  {ep.storyteller} · {ep.publishedAtDisplay} ·{" "}
                  {formatDuration(ep.durationSec)}
                </p>
                <a
                  href={ep.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta-line mt-3 inline-block border-b border-cedar/50 pb-px text-cedar hover:border-cedar"
                >
                  Listen on Buzzsprout →
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

async function safeEpisodes(): Promise<Awaited<ReturnType<typeof getEpisodes>>> {
  try {
    return await getEpisodes();
  } catch {
    return [];
  }
}
