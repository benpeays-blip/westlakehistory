import Link from "next/link";
import { notFound } from "next/navigation";
import { loadOne, loadType, resolveRefs } from "@/lib/content";
import type { Story } from "@/lib/schemas";
import { SourcesConnectionsSidebar } from "@/app/components/SourcesConnectionsSidebar";
import { WanderTheArchive } from "@/app/components/WanderTheArchive";
import { Citation } from "@/app/components/Citation";
import { renderMarkdown } from "@/lib/markdown";

export async function generateStaticParams() {
  const stories = await loadType("stories");
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await loadOne("stories", slug);
  if (!story) return {};
  const f = story.frontmatter as Story;
  return {
    title: `${f.title} — Westlake History`,
    description: f.summary,
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await loadOne("stories", slug);
  if (!story) notFound();

  const f = story.frontmatter as Story;

  const [people, places, documents, audio, maps, collections] =
    await Promise.all([
      resolveRefs("people", f.people),
      resolveRefs("places", f.places),
      resolveRefs("documents", f.documents),
      resolveRefs("audio", f.audio),
      resolveRefs("maps", f.maps),
      resolveRefs("collections", f.collections),
    ]);

  const groups = [
    { label: "People", items: people },
    { label: "Places", items: places },
    { label: "Documents", items: documents },
    { label: "Audio", items: audio },
    { label: "Maps", items: maps },
    { label: "Collections", items: collections },
  ];

  return (
    <article className="mx-auto max-w-[1320px] px-6 py-10 md:px-10 md:py-14">
      <Link
        href="/stories"
        className="meta-line border-b border-transparent pb-px text-ink-mute transition-colors hover:border-oak hover:text-oak"
      >
        ← Back to stories
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div>
          <header className="border-b border-rule pb-8">
            <h1 className="font-display text-[32px] leading-[1.1] tracking-[-0.005em] text-ink md:text-[44px]">
              {f.title}
            </h1>
            <p className="mt-4 text-[16px] leading-snug text-ink-mute">
              By {f.byline} · {formatDate(f.date)}
            </p>
            {f.tags.length || f.era.length ? (
              <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
                {f.era.map((e) => (
                  <Tag key={`era-${e}`} variant="era">
                    {e}
                  </Tag>
                ))}
                {f.tags.map((t) => (
                  <Tag key={`tag-${t}`}>{t}</Tag>
                ))}
              </div>
            ) : null}
          </header>

          {f.heroImage ? (
            <figure className="mt-8 border border-rule">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.heroImage}
                alt={f.heroCaption ?? f.title}
                className="block h-auto w-full"
              />
              {f.heroCaption ? (
                <figcaption className="border-t border-rule px-4 py-3 text-[13px] leading-snug text-ink-mute">
                  {f.heroCaption}
                </figcaption>
              ) : null}
            </figure>
          ) : (
            <HeroPlaceholder caption={f.heroCaption} />
          )}

          <div className="mt-10">
            {renderMarkdown(story.body, { components: mdxComponents })}
          </div>

          <Citation
            title={f.title}
            type="stories"
            slug={slug}
            date={formatDate(f.date)}
            contributor={f.byline}
          />
        </div>

        <SourcesConnectionsSidebar
          groups={groups}
          sourceNotes={f.sourceNotes}
        />
      </div>

      <WanderTheArchive fromType="stories" fromSlug={slug} />
    </article>
  );
}

function HeroPlaceholder({ caption }: { caption?: string }) {
  return (
    <figure className="mt-8 border border-rule">
      <div className="aspect-[16/9] bg-limestone">
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-hidden="true"
        >
          <rect width="1600" height="900" fill="#d8d1c4" />
          <path
            d="M0,640 Q260,600 520,615 T1040,610 T1600,625 L1600,900 L0,900 Z"
            fill="#8a7a62"
            opacity="0.7"
          />
          <path
            d="M0,720 Q300,680 600,695 T1200,690 T1600,710 L1600,900 L0,900 Z"
            fill="#5d513e"
            opacity="0.85"
          />
          <g transform="translate(600 600)" fill="#3a3225">
            <polygon points="0,80 140,20 280,80 280,180 0,180" />
            <rect x="120" y="110" width="40" height="70" fill="#1f2421" />
          </g>
        </svg>
      </div>
      {caption ? (
        <figcaption className="border-t border-rule px-4 py-3 text-[13px] leading-snug text-ink-mute">
          {caption} <span className="italic">(Photograph forthcoming.)</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

function Tag({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "era";
}) {
  if (variant === "era") {
    return (
      <span className="meta-line border border-rule px-2.5 py-1 text-[11px] text-cedar">
        {children}
      </span>
    );
  }
  return (
    <span className="text-[13px] text-ink-mute">{children}</span>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const parts = iso.split("-").map(Number);
  if (parts.length === 1) return String(parts[0]);
  if (parts.length === 2) {
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, 1));
    return d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Minimal prose styling — restraint over decoration.
const mdxComponents = {
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="mt-10 mb-4 font-display text-[26px] leading-tight text-ink">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mt-8 mb-3 font-display text-[18px] leading-tight text-ink">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-5 text-[17px] leading-[1.7] text-ink">{children}</p>
  ),
  a: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
    >
      {children}
    </a>
  ),
};
