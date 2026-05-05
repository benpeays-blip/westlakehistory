/**
 * Homepage hero — full-bleed archival image with editorial title overlay
 * and an archive-search input. The image is a placeholder gradient + SVG
 * landscape until real archival photography is uploaded; the markup keeps
 * its caption frame so swapping in a real photo is a one-prop change.
 */
export function HomeHero() {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 py-10 md:px-10 md:py-14">
        <div className="relative overflow-hidden border border-rule">
          <HeroImagePlaceholder />
          <div className="relative px-6 py-14 md:px-14 md:py-20 lg:py-28">
            <div className="max-w-[640px]">
              <h1
                className="font-display text-[40px] font-normal italic leading-[1.05] tracking-[-0.005em] text-paper md:text-[56px] lg:text-[64px]"
                style={{ textShadow: "0 1px 32px rgba(31,36,33,0.45)" }}
              >
                The stories of Westlake, Texas.
              </h1>
              <p className="mt-5 max-w-[520px] text-[16px] leading-[1.55] text-paper/95 md:text-[17px]">
                People. Places. Events. Memories.
                <br />
                Preserved for generations.
              </p>

              <form
                role="search"
                action="/search"
                className="mt-8 flex max-w-[520px] items-stretch overflow-hidden rounded-sm bg-paper shadow-[0_8px_24px_rgba(31,36,33,0.25)]"
              >
                <input
                  type="search"
                  name="q"
                  placeholder="Search the archive…"
                  aria-label="Search the archive"
                  className="flex-1 bg-transparent px-4 py-3 text-[15px] text-ink placeholder:text-ink-mute focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex items-center justify-center bg-oak px-5 text-paper transition-colors hover:bg-oak-deep"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-[18px] w-[18px]"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroImagePlaceholder() {
  return (
    <div
      className="absolute inset-0 -z-0"
      role="img"
      aria-label="Placeholder Hill Country landscape — to be replaced with a real archival photograph."
    >
      <svg
        viewBox="0 0 1600 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a4a44" />
            <stop offset="55%" stopColor="#2a3a34" />
            <stop offset="100%" stopColor="#1f2421" />
          </linearGradient>
          <linearGradient id="hero-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(31,36,33,0.85)" />
            <stop offset="55%" stopColor="rgba(31,36,33,0.45)" />
            <stop offset="100%" stopColor="rgba(31,36,33,0.15)" />
          </linearGradient>
        </defs>
        <rect width="1600" height="600" fill="url(#hero-sky)" />

        <g opacity="0.55">
          <path
            d="M0,360 Q220,310 440,335 T880,330 T1320,345 T1600,335 L1600,600 L0,600 Z"
            fill="#2a3530"
          />
          <path
            d="M0,400 Q260,360 520,380 T1040,375 T1600,395 L1600,600 L0,600 Z"
            fill="#1d2723"
          />
          <path
            d="M0,440 Q300,410 600,425 T1200,420 T1600,435 L1600,600 L0,600 Z"
            fill="#141b18"
          />
        </g>

        {/* River band */}
        <path
          d="M0,490 Q220,470 440,485 Q660,500 880,490 Q1100,480 1320,495 Q1460,505 1600,495 L1600,540 Q1460,548 1320,540 Q1100,530 880,540 Q660,548 440,540 Q220,532 0,545 Z"
          fill="#3d524d"
          opacity="0.7"
        />

        {/* Bridge silhouette */}
        <g transform="translate(640 470)" fill="#0e1413" opacity="0.85">
          <rect x="0" y="0" width="320" height="6" />
          <rect x="20" y="6" width="6" height="44" />
          <rect x="100" y="6" width="6" height="50" />
          <rect x="180" y="6" width="6" height="50" />
          <rect x="260" y="6" width="6" height="44" />
          <path d="M0,0 Q160,-22 320,0 L320,6 L0,6 Z" />
        </g>

        {/* Tree on the right */}
        <g transform="translate(1380 360)" fill="#0a1210" opacity="0.85">
          <rect x="-3" y="0" width="6" height="120" />
          <ellipse cx="0" cy="-10" rx="60" ry="48" />
          <ellipse cx="-32" cy="0" rx="42" ry="32" />
          <ellipse cx="32" cy="0" rx="42" ry="32" />
        </g>

        {/* Left fade for text legibility */}
        <rect width="1600" height="600" fill="url(#hero-fade)" />
      </svg>
    </div>
  );
}
