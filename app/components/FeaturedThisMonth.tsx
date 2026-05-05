import Link from "next/link";
import type { LoadedItem } from "@/lib/content";

interface FeaturedItem {
  type: string;
  title: string;
  excerpt: string;
  href: string;
  thumb: ThumbKind;
}

type ThumbKind = "story" | "audio" | "place" | "map" | "document" | "collection";

/**
 * Featured This Month — five real archive items, pulled from the live
 * MDX content graph. The page.tsx loader passes in:
 *   - the most-recent featured story (or most-recent story if none flagged)
 *   - the most-recent catalogued audio entry
 *   - a featured collection
 *   - a representative place
 *   - a representative document
 * Each card links to its detail page; archival labels are derived from
 * the entity's frontmatter (audioType, placeType, documentType).
 */
export function FeaturedThisMonth({
  story,
  audio,
  place,
  document,
  collection,
}: {
  story: LoadedItem | null;
  audio: LoadedItem | null;
  place: LoadedItem | null;
  document: LoadedItem | null;
  collection: LoadedItem | null;
}) {
  const items: FeaturedItem[] = [];

  if (story) {
    const f = story.frontmatter as { title: string; summary?: string };
    items.push({
      type: "STORY",
      title: f.title,
      excerpt: f.summary ?? "",
      href: `/stories/${story.slug}`,
      thumb: "story",
    });
  }

  if (audio) {
    const f = audio.frontmatter as {
      title: string;
      audioType?: string;
      interviewee?: string;
      duration?: string;
      summary?: string;
    };
    const label = (f.audioType ?? "Oral History").toUpperCase();
    items.push({
      type: label,
      title: f.title,
      excerpt:
        f.summary ?? `${f.interviewee ?? "Recording"} · ${f.duration ?? ""}`.trim(),
      href: `/audio/${audio.slug}`,
      thumb: "audio",
    });
  }

  if (place) {
    const f = place.frontmatter as {
      title: string;
      placeType?: string;
      summary?: string;
    };
    const label = (f.placeType ?? "Place").toUpperCase();
    items.push({
      type: label,
      title: f.title,
      excerpt: f.summary ?? "",
      href: `/places/${place.slug}`,
      thumb: "place",
    });
  }

  if (document) {
    const f = document.frontmatter as {
      title: string;
      documentType?: string;
      date?: string;
      summary?: string;
    };
    const label = (f.documentType ?? "Document").toUpperCase();
    items.push({
      type: label,
      title: f.title,
      excerpt: f.summary ?? f.date ?? "",
      href: `/documents/${document.slug}`,
      thumb: "document",
    });
  }

  if (collection) {
    const f = collection.frontmatter as {
      title: string;
      curator?: string;
      dateRange?: string;
      summary?: string;
    };
    items.push({
      type: "COLLECTION",
      title: f.title,
      excerpt:
        f.summary ?? [f.curator, f.dateRange].filter(Boolean).join(" · "),
      href: `/collections/${collection.slug}`,
      thumb: "collection",
    });
  }

  if (!items.length) return null;

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
                {item.excerpt ? (
                  <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.45] text-ink-mute">
                    {item.excerpt}
                  </p>
                ) : null}
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
  const common =
    "h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]";
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
  if (kind === "place") {
    return (
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className={common} aria-hidden="true">
        <rect width="200" height="250" fill="#bfb39a" />
        <path d="M0,170 L200,170 L200,250 L0,250 Z" fill="#5d513e" />
        <g transform="translate(70 130)" fill="#3a3225">
          <polygon points="0,30 30,10 60,30 60,70 0,70" />
          <rect x="22" y="42" width="16" height="28" fill="#1f2421" />
        </g>
        <text x="100" y="220" fontFamily="serif" fontStyle="italic" fontSize="13" textAnchor="middle" fill="#1f2421">
          Place
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
      </svg>
    );
  }
  if (kind === "collection") {
    return (
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className={common} aria-hidden="true">
        <rect width="200" height="250" fill="#cabe9f" />
        {[35, 75, 115, 155].map((y) => (
          <g key={y} transform={`translate(40 ${y})`}>
            <rect width="120" height="22" fill="#e8dfc8" stroke="#3a3225" strokeWidth="0.5" />
            <rect x="6" y="6" width="40" height="2" fill="#3a3225" />
            <rect x="6" y="11" width="60" height="2" fill="#3a3225" opacity="0.6" />
            <rect x="6" y="16" width="36" height="2" fill="#3a3225" opacity="0.4" />
          </g>
        ))}
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
