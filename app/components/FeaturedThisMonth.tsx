import Link from "next/link";
import type { Episode } from "@/lib/buzzsprout";

interface FeaturedItem {
  type: string;            // archival label, uppercased: STORY, PHOTO COLLECTION, etc.
  title: string;
  excerpt: string;
  href: string;
  badge?: string;          // optional date / count line below excerpt
  thumb: ThumbKind;
}

type ThumbKind = "story" | "photos" | "audio" | "map" | "document";

/**
 * Featured This Month — five archival items above the fold.
 * Item content is currently a curated mix: one real podcast episode (the
 * most-recent Buzzsprout entry) wired in dynamically, plus four
 * forward-looking placeholders that point at routes coming in Phase 2/3.
 * Once those collections exist as MDX, swap the placeholders for live data.
 */
export function FeaturedThisMonth({ heroEpisode }: { heroEpisode: Episode | null }) {
  const items: FeaturedItem[] = [
    {
      type: "STORY",
      title: "The Low Water Crossing at Bee Cave Road",
      excerpt: "Early travel routes in the Hill Country.",
      href: "/stories",
      thumb: "story",
    },
    {
      type: "PHOTO COLLECTION",
      title: "Westlake High School Through the Years",
      excerpt: "Photos from the 1950s to the 1990s.",
      href: "/collections",
      thumb: "photos",
    },
    {
      type: "ORAL HISTORY",
      title: heroEpisode?.title ?? "Growing Up in Westlake in the 1960s",
      excerpt: heroEpisode
        ? `${heroEpisode.storyteller} · ${heroEpisode.publishedAtDisplay}`
        : "Interview with Jane Hughes.",
      href: "/audio",
      thumb: "audio",
    },
    {
      type: "MAP COLLECTION",
      title: "Historic Maps of the West Lake Area",
      excerpt: "From the 1800s to the present.",
      href: "/maps",
      thumb: "map",
    },
    {
      type: "DOCUMENT",
      title: "Original Deed: The Davenport Tract",
      excerpt: "March 3, 1854.",
      href: "/documents",
      thumb: "document",
    },
  ];

  return (
    <section aria-labelledby="featured-heading" className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
        <div className="flex items-end justify-between gap-6 border-b border-rule pb-5">
          <h2
            id="featured-heading"
            className="font-display text-[26px] leading-tight md:text-[32px]"
          >
            Featured This Month
          </h2>
          <Link
            href="/stories"
            className="meta-line border-b border-transparent pb-px transition-colors hover:border-oak hover:text-oak"
          >
            View all stories →
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-oak"
              >
                <div className="aspect-[4/5] overflow-hidden border border-rule bg-limestone">
                  <ThumbArt kind={item.thumb} />
                </div>
                <p className="label-archival mt-4">{item.type}</p>
                <h3 className="mt-2 font-display text-[17px] leading-[1.25] text-ink transition-colors group-hover:text-oak">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.45] text-ink-mute">
                  {item.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Thumbnail art (placeholder until real images land) ------------ */

function ThumbArt({ kind }: { kind: ThumbKind }) {
  const common = "h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]";
  if (kind === "story") {
    return (
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className={common} aria-hidden="true">
        <rect width="200" height="250" fill="#d8d1c4" />
        <path d="M0,170 Q50,150 100,165 T200,160 L200,250 L0,250 Z" fill="#8a7a62" />
        <path d="M0,200 Q60,180 120,195 T200,195 L200,250 L0,250 Z" fill="#5d513e" />
        <path d="M40,210 L60,210 L70,225 L90,220 L110,230 L130,222 L160,228 L160,250 L40,250 Z" fill="#3a3225" />
        <circle cx="160" cy="60" r="20" fill="#cfbf9b" opacity="0.6" />
      </svg>
    );
  }
  if (kind === "photos") {
    return (
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className={common} aria-hidden="true">
        <rect width="200" height="250" fill="#bfb39a" />
        <rect x="35" y="50" width="130" height="100" fill="#e7e1d3" stroke="#8a7a62" strokeWidth="1" />
        <rect x="55" y="65" width="90" height="60" fill="#5d513e" />
        <circle cx="100" cy="95" r="22" fill="#bfb39a" />
        <text x="100" y="180" fontFamily="serif" fontStyle="italic" fontSize="14" textAnchor="middle" fill="#1f2421">
          Westlake High
        </text>
      </svg>
    );
  }
  if (kind === "audio") {
    return (
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className={common} aria-hidden="true">
        <rect width="200" height="250" fill="#3d524d" />
        <rect x="20" y="20" width="160" height="160" fill="#2a3530" />
        <circle cx="100" cy="100" r="55" fill="#cfbf9b" opacity="0.18" />
        <g transform="translate(100 100)">
          {Array.from({ length: 24 }).map((_, i) => {
            const h = 6 + (Math.sin(i * 0.7) * 24 + 24);
            return (
              <rect
                key={i}
                x={i * 4 - 50}
                y={-h / 2}
                width="2"
                height={h}
                fill="#e7e1d3"
                opacity="0.85"
              />
            );
          })}
        </g>
        <text x="100" y="220" fontFamily="monospace" fontSize="9" letterSpacing="2" textAnchor="middle" fill="#cfbf9b">
          ORAL HISTORY
        </text>
      </svg>
    );
  }
  if (kind === "map") {
    return (
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className={common} aria-hidden="true">
        <rect width="200" height="250" fill="#e7e1d3" />
        <g stroke="#8a7a62" fill="none" strokeWidth="0.5">
          <path d="M0,60 Q50,50 100,65 T200,70" />
          <path d="M0,90 Q60,75 120,90 T200,95" />
          <path d="M0,140 Q40,125 100,135 T200,140" />
          <path d="M0,180 Q70,165 140,175 T200,185" />
        </g>
        <path
          d="M0,110 Q40,105 80,118 Q120,130 160,120 Q200,112 200,118 L200,138 Q160,144 120,150 Q80,158 40,150 Q0,140 0,130 Z"
          fill="#a4b4a8"
          opacity="0.6"
        />
        <circle cx="55" cy="195" r="3" fill="#8a5f3d" />
        <circle cx="120" cy="210" r="3" fill="#8a5f3d" />
        <circle cx="160" cy="180" r="3" fill="#8a5f3d" />
        <text x="170" y="40" fontFamily="serif" fontStyle="italic" fontSize="11" fill="#1f2421">
          1944
        </text>
      </svg>
    );
  }
  // document
  return (
    <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className={common} aria-hidden="true">
      <rect width="200" height="250" fill="#cfbf9b" />
      <rect x="30" y="30" width="140" height="190" fill="#f4ecd5" stroke="#8a5f3d" strokeWidth="0.6" />
      <text x="100" y="64" fontFamily="serif" fontStyle="italic" fontSize="13" textAnchor="middle" fill="#1f2421">
        Travis County
      </text>
      <text x="100" y="82" fontFamily="serif" fontSize="10" textAnchor="middle" fill="#1f2421">
        Deed of Record
      </text>
      {[110, 122, 134, 146, 158, 170].map((y, i) => (
        <line
          key={y}
          x1="50"
          y1={y}
          x2={[160, 158, 130, 152, 142, 124][i]}
          y2={y}
          stroke="#1f2421"
          strokeWidth="0.4"
          opacity="0.7"
        />
      ))}
      <text x="155" y="200" fontFamily="serif" fontStyle="italic" fontSize="14" textAnchor="end" fill="#8a5f3d">
        Davenport
      </text>
    </svg>
  );
}
