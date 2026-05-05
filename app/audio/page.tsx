import Link from "next/link";
import { getEpisodes, formatDuration } from "@/lib/buzzsprout";

export const revalidate = 3600;

export const metadata = {
  title: "Audio — Westlake History",
  description:
    "Podcast episodes and oral histories — the recorded memory of Westlake, Texas.",
};

export default async function AudioIndex() {
  let episodes: Awaited<ReturnType<typeof getEpisodes>> = [];
  try {
    episodes = await getEpisodes();
  } catch {
    /* fall through to empty */
  }

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <header className="border-b border-rule pb-7">
        <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
          Audio
        </h1>
        <p className="mt-3 max-w-[680px] text-[16px] leading-snug text-ink-mute">
          Podcast episodes and oral histories — the recorded memory of
          Westlake. Synced transcripts and a custom oral-history player are
          coming in a later phase; this index lists every episode currently
          published in the {" "}
          <em className="not-italic text-ink">Our Westlake</em> podcast.
        </p>
        <p className="meta-line mt-4">
          {episodes.length} {episodes.length === 1 ? "episode" : "episodes"} ·
          source: Buzzsprout RSS
        </p>
      </header>

      {episodes.length === 0 ? (
        <p className="py-16 text-[16px] text-ink-mute">
          No audio is available right now. The podcast feed could not be
          fetched at build time.
        </p>
      ) : (
        <ul className="divide-y divide-rule">
          {episodes.map((ep) => (
            <li key={ep.guid} className="py-6">
              <p className="label-archival mb-2">
                {ep.chapter != null
                  ? `Ch. ${ep.chapter}${ep.chapterTitle ? ` · ${ep.chapterTitle}` : ""}${
                      ep.episode != null ? ` · Episode ${ep.episode}` : ""
                    }`
                  : ep.episode != null
                    ? `Episode ${ep.episode}`
                    : "Audio"}
              </p>
              <h2 className="font-display text-[20px] leading-snug text-ink">
                {ep.title}
              </h2>
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

      <p className="mt-12 border-t border-rule pt-6 text-[14px] text-ink-mute">
        See also the{" "}
        <Link
          href="/collections/westlake-historical-society"
          className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
        >
          Westlake Historical Society collection
        </Link>{" "}
        for context on these recordings.
      </p>
    </section>
  );
}
