import type { ChapterSummary } from "@/lib/chapters";
import { SectionHead } from "./SectionHead";

export function Chapters({ chapters }: { chapters: ChapterSummary[] }) {
  return (
    <section className="pb-20 pt-2">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <SectionHead meta="As organized by Emmett Shelton, Sr.">
          Browse <em className="italic font-light">by chapter</em>
        </SectionHead>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2">
          {chapters.map((c, i) => (
            <a
              key={c.chapter}
              href={`/chapters/${c.chapter}`}
              className={
                "group grid items-baseline gap-6 border-b border-hairline py-7 transition-[padding] [grid-template-columns:60px_1fr_auto] " +
                (i % 2 === 0
                  ? "pr-8 hover:pl-3 "
                  : "pl-8 pr-0 hover:pl-11 md:border-l md:border-hairline ")
              }
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-rust">
                CH {String(c.chapter).padStart(2, "0")}
              </span>
              <h4
                className="font-display font-normal text-[22px] tracking-[-0.005em] text-ink"
                style={{ fontVariationSettings: "'opsz' 48" }}
              >
                {c.title}
              </h4>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                {c.episodeCount} {c.episodeCount === 1 ? "story" : "stories"}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
