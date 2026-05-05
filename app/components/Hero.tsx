import type { Episode } from "@/lib/buzzsprout";
import { formatDuration } from "@/lib/buzzsprout";

export function Hero({ episode }: { episode: Episode | null }) {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <HeroFrame />
          <div>
            <p className="mb-6 flex items-center gap-3.5 font-mono text-[11.5px] uppercase tracking-[0.25em] text-rust">
              <span>
                {episode?.chapter != null
                  ? `Ch. ${episode.chapter}`
                  : "Featured"}
                {episode?.chapterTitle ? ` · ${episode.chapterTitle}` : ""}
                {episode?.episode != null ? ` · Ep. ${episode.episode}` : ""}
              </span>
              <span className="block h-px flex-1 bg-hairline-strong" />
            </p>
            <h2
              className="mb-6 font-display font-normal text-ink"
              style={{
                fontSize: "clamp(34px, 4.6vw, 58px)",
                lineHeight: 1.04,
                letterSpacing: "-0.015em",
                fontVariationSettings: "'opsz' 96, 'SOFT' 50",
              }}
            >
              {episode?.title ?? "The night Bee Cave Road was paved"}
            </h2>
            <p
              className="mb-7 font-light text-[20px] leading-[1.5] text-ink-soft md:text-[21px]"
              style={{ fontVariationSettings: "'opsz' 36" }}
            >
              {episode?.description ??
                "Stories from the families and institutions that built Westlake — collected, preserved, and shared with the community."}
            </p>
            <div className="flex flex-wrap gap-7 border-t border-hairline pt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-mute">
              <span>
                Storyteller
                <strong className="mt-1 block font-medium tracking-[0.05em] text-ink">
                  {episode?.storyteller ?? "Emmett Shelton, Sr."}
                </strong>
              </span>
              <span>
                Published
                <strong className="mt-1 block font-medium tracking-[0.05em] text-ink">
                  {episode?.publishedAtDisplay ?? "—"}
                </strong>
              </span>
              <span>
                Duration
                <strong className="mt-1 block font-medium tracking-[0.05em] text-ink">
                  {episode ? `${formatDuration(episode.durationSec)} · audio` : "—"}
                </strong>
              </span>
            </div>
            <a
              href="/podcast"
              className="mt-7 inline-block border-b border-rust pb-0.5 font-display italic text-[18px] text-rust"
            >
              Read &amp; listen →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFrame() {
  return (
    <figure>
      <div
        className="relative aspect-[4/5] border border-hairline-strong bg-paper-deep p-3.5"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3.5 border border-hairline"
        />
        <div className="relative flex h-full w-full items-end justify-center overflow-hidden">
          <svg
            viewBox="0 0 400 500"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Illustrated silhouette of a hill country lodge at dusk, used as a placeholder until a period photograph is selected."
          >
            <defs>
              <radialGradient id="herosun" cx="0.7" cy="0.3" r="0.55">
                <stop offset="0%" stopColor="#d4a574" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#d4a574" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="herobg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a2419" />
                <stop offset="55%" stopColor="#3a3025" />
                <stop offset="100%" stopColor="#1a1410" />
              </linearGradient>
            </defs>
            <rect width="400" height="500" fill="url(#herobg)" />
            <rect width="400" height="500" fill="url(#herosun)" />
            <path
              d="M0,340 Q60,310 120,325 T240,315 T400,330 L400,500 L0,500 Z"
              fill="#3a3025"
              opacity="0.6"
            />
            <path
              d="M0,370 Q80,345 160,360 T320,355 T400,365 L400,500 L0,500 Z"
              fill="#2a2218"
              opacity="0.7"
            />
            <path
              d="M0,400 Q100,375 200,395 T400,400 L400,500 L0,500 Z"
              fill="#1a1410"
            />
            <g transform="translate(160 350)">
              <polygon points="0,30 40,5 80,30 80,70 0,70" fill="#0d0907" />
              <rect x="34" y="40" width="12" height="30" fill="#2a1f15" />
              <polygon points="-5,30 40,0 85,30 80,30 40,5 0,30" fill="#0a0705" />
              <rect x="60" y="10" width="8" height="20" fill="#0d0907" />
              <path
                d="M64,5 Q60,-5 64,-15 Q68,-25 64,-35"
                stroke="#5a4a38"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
            </g>
            <g transform="translate(70 340)">
              <rect x="-2" y="0" width="4" height="40" fill="#1a1208" />
              <ellipse cx="0" cy="-5" rx="22" ry="18" fill="#0f0a06" />
              <ellipse cx="-12" cy="0" rx="14" ry="11" fill="#0f0a06" />
              <ellipse cx="12" cy="0" rx="14" ry="11" fill="#0f0a06" />
            </g>
          </svg>
        </div>
      </div>
      <figcaption className="mt-4 flex justify-between border-t border-hairline pt-2.5 font-mono text-[10.5px] uppercase tracking-[0.15em] text-ink-mute">
        <span>Plate i</span>
        <span>Photograph forthcoming</span>
        <span>℅ Westlake Hist. Soc.</span>
      </figcaption>
    </figure>
  );
}
