import type { Episode } from "@/lib/buzzsprout";
import { formatDuration } from "@/lib/buzzsprout";
import { SectionHead } from "./SectionHead";

export function Voices({
  episodes,
  totalCount,
}: {
  episodes: Episode[];
  totalCount: number;
}) {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <SectionHead meta={`Recordings · ${totalCount} episodes`}>
          <em className="italic font-light">Voices</em> from Westlake
        </SectionHead>

        <div className="grid border-b border-hairline md:grid-cols-3">
          {episodes.map((ep, i) => (
            <article
              key={ep.guid}
              className={
                "relative cursor-default px-0 py-8 md:py-9 " +
                (i < 2
                  ? "border-b border-hairline md:border-b-0 md:border-r md:border-hairline md:pr-7 "
                  : "") +
                (i > 0 ? "md:pl-7 " : "md:pr-7 ")
              }
            >
              <div className="mb-3.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-rust">
                {ep.chapter != null
                  ? `Ch. ${ep.chapter} · Episode ${ep.episode ?? "—"}`
                  : `Episode ${ep.episode ?? "—"}`}
              </div>
              <h4
                className="mb-4 font-display font-normal text-[22px] leading-[1.18] tracking-[-0.005em] text-ink"
                style={{ fontVariationSettings: "'opsz' 60" }}
              >
                {ep.title}
              </h4>
              <p className="mb-6 font-light text-[15.5px] leading-[1.55] text-ink-soft">
                {ep.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-soft px-3 py-1 text-[10px] tracking-[0.15em] text-ink">
                  <span
                    aria-hidden="true"
                    className="h-0 w-0 border-y-4 border-y-transparent border-l-[6px] border-l-ink"
                  />
                  Play
                </span>
                <span>{formatDuration(ep.durationSec)}</span>
                <span>{ep.publishedAtDisplay}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
