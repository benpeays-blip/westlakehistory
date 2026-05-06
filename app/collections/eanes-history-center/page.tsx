import Link from "next/link";
import { notFound } from "next/navigation";
import { loadOne } from "@/lib/content";
import {
  loadEhcCollection,
  groupByKind,
  KIND_LABELS,
  KIND_ORDER,
  type EhcItem,
  type ItemKind,
} from "@/lib/ehc";
import { SourcesConnectionsSidebar } from "@/app/components/SourcesConnectionsSidebar";
import { WanderTheArchive } from "@/app/components/WanderTheArchive";
import { Citation } from "@/app/components/Citation";
import { renderMarkdown } from "@/lib/markdown";
import { resolveRefs, getReferencingItems } from "@/lib/content";
import type { ContentType } from "@/lib/schemas";

export const metadata = {
  title:
    "Eanes History Center · Westbank CLD — Westlake History",
  description:
    "A 69-item collection of letters, oral histories, photographs, and illustrations from the Eanes History Center, hosted at The Portal to Texas History (UNT Libraries). Catalogued for discovery; full scans on UNT.",
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

export default async function EhcPage() {
  const item = await loadOne("collections", "eanes-history-center");
  if (!item) notFound();

  const ehc = await loadEhcCollection();
  const byKind = groupByKind(ehc.items);

  const fm = item.frontmatter as Record<string, unknown>;

  // Sidebar — same logic as the generic EntityDetail template, inlined so we
  // can interleave our own custom gallery between header and citation.
  const outbound = await Promise.all(
    SIDEBAR_GROUPS.map(async (g) => ({
      label: g.label,
      items: await resolveRefs(g.type, fm[g.key] as string[] | undefined),
    })),
  );
  const referencing = await getReferencingItems(item.type, item.slug);
  const groups = outbound.map((g) => {
    const targetType = SIDEBAR_GROUPS.find((s) => s.label === g.label)!.type;
    const reverseHits = referencing
      .filter((r) => r.type === targetType)
      .filter(
        (r) => !g.items.some((existing) => existing.slug === r.slug),
      );
    return { label: g.label, items: [...g.items, ...reverseHits] };
  });

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
              {ehc.items.length} items catalogued
            </p>
            {typeof fm.summary === "string" ? (
              <p className="mt-5 max-w-[680px] text-[18px] leading-[1.55] text-ink">
                {fm.summary}
              </p>
            ) : null}
          </header>

          <PartnerNotice ehc={ehc} />

          {item.body.trim() ? (
            <div className="mt-10">
              {renderMarkdown(item.body)}
            </div>
          ) : null}

          <div className="mt-12">
            <h2 className="font-display text-[22px] leading-tight text-ink">
              Items in the collection
            </h2>
            <p className="mt-2 max-w-[680px] text-[14.5px] leading-snug text-ink-mute">
              Each card links to the full record on the Portal to Texas
              History, where the high-resolution scan and original
              provenance metadata live.
            </p>

            <div className="mt-8 space-y-12">
              {KIND_ORDER.map((kind) => {
                const group = byKind[kind];
                if (!group?.length) return null;
                return <KindSection key={kind} kind={kind} items={group} />;
              })}
            </div>
          </div>

          <Citation
            title={String(fm.title)}
            type="collections"
            slug="eanes-history-center"
            source={ehc.attribution}
            rights="Originals © Westbank Community Library District. Digital reproductions via The Portal to Texas History, UNT Libraries. Linked, not re-hosted."
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

function PartnerNotice({ ehc }: { ehc: { partnerUrl: string; lastFetched: string } }) {
  return (
    <aside className="mt-8 border border-rule bg-limestone/40 p-5 md:p-6">
      <p className="label-archival mb-2 text-cedar">Hosted partner</p>
      <p className="text-[14.5px] leading-relaxed text-ink">
        The original items are held by the Westbank Community Library
        District and digitized by{" "}
        <a
          href={ehc.partnerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
        >
          The Portal to Texas History (UNT Libraries)
        </a>
        . Item metadata is mirrored here for discovery and search; full
        scans live on the Portal. Catalogue last fetched {ehc.lastFetched}.
      </p>
    </aside>
  );
}

function KindSection({ kind, items }: { kind: ItemKind; items: EhcItem[] }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-6 border-b border-rule pb-3">
        <h3 className="font-display text-[18px] leading-tight text-ink">
          {KIND_LABELS[kind]}
        </h3>
        <p className="meta-line text-ink-mute">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>
      <ul
        className={
          kind === "photograph" || kind === "illustration"
            ? "mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4"
            : "mt-6 grid gap-x-6 gap-y-7 md:grid-cols-2"
        }
      >
        {items.map((item) =>
          kind === "photograph" || kind === "illustration" ? (
            <ImageItemCard key={item.ark} item={item} />
          ) : (
            <TextItemCard key={item.ark} item={item} />
          ),
        )}
      </ul>
    </section>
  );
}

function ImageItemCard({ item }: { item: EhcItem }) {
  return (
    <li>
      <a
        href={item.recordUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-oak"
      >
        <div className="aspect-[3/4] overflow-hidden border border-rule bg-limestone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
          />
        </div>
        <p className="mt-3 font-display text-[14px] leading-[1.3] text-ink transition-colors group-hover:text-oak">
          {item.title}
        </p>
        <p className="meta-line mt-1 text-[10.5px] text-ink-mute">
          UNT · {item.ark}
        </p>
      </a>
    </li>
  );
}

function TextItemCard({ item }: { item: EhcItem }) {
  return (
    <li>
      <a
        href={item.recordUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block border-b border-rule pb-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-oak"
      >
        <p className="label-archival text-cedar">{KIND_LABELS[item.kind]}</p>
        <h4 className="mt-2 font-display text-[17px] leading-snug text-ink transition-colors group-hover:text-oak">
          {item.title}
        </h4>
        <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-ink-mute">
          {item.summary}
        </p>
        <p className="meta-line mt-3 text-[10.5px]">
          UNT · {item.ark} ·{" "}
          <span className="text-cedar">View full record →</span>
        </p>
      </a>
    </li>
  );
}
