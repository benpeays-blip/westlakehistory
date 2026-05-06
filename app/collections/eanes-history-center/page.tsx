import Link from "next/link";
import { notFound } from "next/navigation";
import {
  loadOne,
  loadType,
  resolveRefs,
  getReferencingItems,
  type LoadedItem,
} from "@/lib/content";
import { SourcesConnectionsSidebar } from "@/app/components/SourcesConnectionsSidebar";
import { WanderTheArchive } from "@/app/components/WanderTheArchive";
import { Citation } from "@/app/components/Citation";
import { renderMarkdown } from "@/lib/markdown";
import type { ContentType } from "@/lib/schemas";

export const metadata = {
  title:
    "Eanes History Center · Westbank CLD — Westlake History",
  description:
    "The official archive home for the Eanes History Center collection — letters, oral histories, photographs, illustrations, and books, contributed by Westbank Community Library District.",
};

const SIDEBAR_GROUPS: { key: string; label: string; type: ContentType }[] = [
  { key: "stories", label: "Stories", type: "stories" },
  { key: "people", label: "People", type: "people" },
  { key: "places", label: "Places", type: "places" },
  { key: "documents", label: "Documents", type: "documents" },
  { key: "audio", label: "Audio", type: "audio" },
  { key: "maps", label: "Maps", type: "maps" },
  { key: "eras", label: "Eras", type: "eras" },
  { key: "collections", label: "Collections", type: "collections" },
];

const VISUAL_KINDS = new Set(["Photograph", "Photo", "Illustration", "Map"]);

const KIND_ORDER = [
  "Photograph",
  "Illustration",
  "Oral History",
  "Interview",
  "Interview Notes",
  "Letter",
  "Essay",
  "Manuscript",
  "Newspaper",
  "Family Record",
  "Book",
  "Document",
];

export default async function EhcPage() {
  const collectionItem = await loadOne("collections", "eanes-history-center");
  if (!collectionItem) notFound();

  // Pull every document that lists this collection in its `collections` array.
  // Same source of truth as /documents — the collection page is a filtered
  // view, not a separate dataset.
  const allDocs = await loadType("documents");
  const items = allDocs.filter((d) =>
    ((d.frontmatter as { collections?: string[] }).collections ?? []).includes(
      "eanes-history-center",
    ),
  );

  const fm = collectionItem.frontmatter as Record<string, unknown>;

  // Sidebar — same logic as the generic EntityDetail template.
  const outbound = await Promise.all(
    SIDEBAR_GROUPS.map(async (g) => ({
      label: g.label,
      items: await resolveRefs(g.type, fm[g.key] as string[] | undefined),
    })),
  );
  const referencing = await getReferencingItems(
    collectionItem.type,
    collectionItem.slug,
  );
  const groups = outbound.map((g) => {
    const targetType = SIDEBAR_GROUPS.find((s) => s.label === g.label)!.type;
    const reverseHits = referencing
      .filter((r) => r.type === targetType)
      .filter((r) => !g.items.some((existing) => existing.slug === r.slug));
    return { label: g.label, items: [...g.items, ...reverseHits] };
  });

  // Group items by kind for the gallery sections
  const byKind: Record<string, LoadedItem[]> = {};
  for (const item of items) {
    const t = (item.frontmatter as { documentType?: string }).documentType ?? "Document";
    (byKind[t] ??= []).push(item);
  }
  const orderedKinds = [
    ...KIND_ORDER.filter((k) => byKind[k]?.length),
    ...Object.keys(byKind).filter((k) => !KIND_ORDER.includes(k)).sort(),
  ];

  return (
    <article className="mx-auto max-w-[1320px] px-6 py-10 md:px-10 md:py-14">
      <Link
        href="/collections"
        className="meta-line border-b border-transparent pb-px text-ink-mute transition-colors hover:border-oak hover:text-oak"
      >
        ← Back to collections
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div>
          <header className="border-b border-rule pb-8">
            <p className="label-archival">Partner Collection</p>
            <h1 className="mt-3 font-display text-[30px] leading-[1.1] tracking-[-0.005em] text-ink md:text-[40px]">
              {String(fm.title)}
            </h1>
            <p className="meta-line mt-3">
              {String(fm.curator ?? "")}
              {fm.dateRange ? ` · ${String(fm.dateRange)}` : ""} ·{" "}
              {items.length} items in the archive
            </p>
            {typeof fm.summary === "string" ? (
              <p className="mt-5 max-w-[680px] text-[18px] leading-[1.55] text-ink">
                {fm.summary}
              </p>
            ) : null}
          </header>

          <PartnerNotice />

          {collectionItem.body.trim() ? (
            <div className="mt-10">
              {renderMarkdown(collectionItem.body)}
            </div>
          ) : null}

          <div className="mt-12">
            <h2 className="font-display text-[22px] leading-tight text-ink">
              Items in the collection
            </h2>
            <p className="mt-2 max-w-[680px] text-[14.5px] leading-snug text-ink-mute">
              Each item has its own page in this archive — every photograph
              also appears in the {" "}
              <Link
                href="/documents"
                className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
              >
                full Documents browse
              </Link>
              {" "} and on the place and person pages it&apos;s tagged to.
            </p>

            <div className="mt-8 space-y-12">
              {orderedKinds.map((kind) => (
                <KindSection key={kind} kind={kind} items={byKind[kind]} />
              ))}
            </div>
          </div>

          <Citation
            title={String(fm.title)}
            type="collections"
            slug="eanes-history-center"
            source={String(fm.curator ?? "")}
            rights="Reproduction permitted by the Westbank Community Library District as the official archive home for the EHC project."
            contributor={String(fm.curator ?? "")}
          />
        </div>

        <SourcesConnectionsSidebar groups={groups} />
      </div>

      <WanderTheArchive
        fromType="collections"
        fromSlug="eanes-history-center"
      />
    </article>
  );
}

function PartnerNotice() {
  return (
    <aside className="mt-8 border border-rule bg-limestone/40 p-5 md:p-6">
      <p className="label-archival mb-2 text-cedar">Official archive home</p>
      <p className="text-[14.5px] leading-relaxed text-ink">
        Westlake History is the official digital home for the Eanes
        History Center collection, with explicit permission from the
        Westbank Community Library District. Original digitization was
        produced by{" "}
        <a
          href="https://texashistory.unt.edu/explore/partners/EHC/"
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
        >
          The Portal to Texas History (UNT Libraries)
        </a>
        . High-resolution scans are mirrored to this site and each item
        carries its own citation and rights statement.
      </p>
    </aside>
  );
}

function KindSection({ kind, items }: { kind: string; items: LoadedItem[] }) {
  const isVisual = VISUAL_KINDS.has(kind);
  return (
    <section>
      <div className="flex items-baseline justify-between gap-6 border-b border-rule pb-3">
        <h3 className="font-display text-[18px] leading-tight text-ink">
          {pluralize(kind, items.length)}
        </h3>
        <p className="meta-line text-ink-mute">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>
      <ul
        className={
          isVisual
            ? "mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4"
            : "mt-6 grid gap-x-6 gap-y-7 md:grid-cols-2"
        }
      >
        {items.map((item) =>
          isVisual ? (
            <ImageItemCard key={item.slug} item={item} />
          ) : (
            <TextItemCard key={item.slug} item={item} />
          ),
        )}
      </ul>
    </section>
  );
}

function ImageItemCard({ item }: { item: LoadedItem }) {
  const f = item.frontmatter as {
    title: string;
    thumb?: string;
    image?: string;
    documentType?: string;
  };
  const src = f.thumb ?? f.image;
  return (
    <li>
      <Link
        href={`/documents/${item.slug}`}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-oak"
      >
        <div className="aspect-[3/4] overflow-hidden border border-rule bg-limestone">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={f.title}
              loading="lazy"
              className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        <p className="mt-3 font-display text-[14px] leading-[1.3] text-ink transition-colors group-hover:text-oak">
          {f.title}
        </p>
      </Link>
    </li>
  );
}

function TextItemCard({ item }: { item: LoadedItem }) {
  const f = item.frontmatter as {
    title: string;
    documentType?: string;
  };
  // Pull the first paragraph of the body as the summary.
  const firstPara = item.body.split(/\n{2,}/)[0]?.trim() ?? "";
  return (
    <li>
      <Link
        href={`/documents/${item.slug}`}
        className="group block border-b border-rule pb-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-oak"
      >
        <p className="label-archival text-cedar">{f.documentType}</p>
        <h4 className="mt-2 font-display text-[17px] leading-snug text-ink transition-colors group-hover:text-oak">
          {f.title}
        </h4>
        <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-ink-mute">
          {firstPara}
        </p>
        <p className="meta-line mt-3 text-[10.5px] text-cedar">
          View full record →
        </p>
      </Link>
    </li>
  );
}

function pluralize(kind: string, n: number): string {
  if (n === 1) return kind;
  // Simple English pluralization for the kinds we use. "Family Record" → "Family Records" etc.
  if (kind.endsWith("y") && !kind.endsWith("ay")) return kind.slice(0, -1) + "ies";
  if (kind.endsWith("s")) return kind;
  return kind + "s";
}
