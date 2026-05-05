import Link from "next/link";
import type { LoadedItem } from "@/lib/content";
import { resolveRefs, getReferencingItems } from "@/lib/content";
import type { ContentType } from "@/lib/schemas";
import { TYPE_LABEL } from "@/lib/schemas";
import { SourcesConnectionsSidebar } from "./SourcesConnectionsSidebar";
import { renderMarkdown } from "@/lib/markdown";

interface EntityDetailProps {
  item: LoadedItem;
  /** Singular noun shown above the title, e.g. "Person", "Place" */
  kindLabel: string;
  /** Optional link/label for "← Back to …" */
  backHref: string;
  backLabel: string;
  /** Lines of compact metadata shown below the title (e.g. "1826–1902") */
  metaLines?: (string | null | undefined)[];
}

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

export async function EntityDetail({
  item,
  kindLabel,
  backHref,
  backLabel,
  metaLines,
}: EntityDetailProps) {
  const f = item.frontmatter as Record<string, unknown>;

  // Direct outbound links from this entity's frontmatter.
  const outbound = await Promise.all(
    SIDEBAR_GROUPS.map(async (g) => ({
      label: g.label,
      items: await resolveRefs(g.type, f[g.key] as string[] | undefined),
    })),
  );

  // Reverse: anything that references this entity by slug — surfaces, e.g.,
  // "stories that mention this person" or "audio recorded at this place."
  const referencing = await getReferencingItems(item.type, item.slug);
  const byType = new Map<ContentType, LoadedItem[]>();
  for (const i of referencing) {
    const list = byType.get(i.type) ?? [];
    list.push(i);
    byType.set(i.type, list);
  }

  // Merge: outbound wins (curator-specified order), reverse-lookup adds
  // anything not already in outbound for that group.
  const groups = outbound.map((g) => {
    const targetType = SIDEBAR_GROUPS.find((s) => s.label === g.label)!.type;
    const reverseHits = (byType.get(targetType) ?? []).filter(
      (r) => !g.items.some((existing) => existing.slug === r.slug),
    );
    return { label: g.label, items: [...g.items, ...reverseHits] };
  });

  const summary = typeof f.summary === "string" ? f.summary : "";
  const sourceNotes =
    Array.isArray(f.sourceNotes) && f.sourceNotes.every((s) => typeof s === "string")
      ? (f.sourceNotes as string[])
      : undefined;
  const filteredMeta = (metaLines ?? []).filter(Boolean) as string[];

  return (
    <article className="mx-auto max-w-[1320px] px-6 py-10 md:px-10 md:py-14">
      <Link
        href={backHref}
        className="meta-line border-b border-transparent pb-px text-ink-mute transition-colors hover:border-oak hover:text-oak"
      >
        ← {backLabel}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div>
          <header className="border-b border-rule pb-8">
            <p className="label-archival">{kindLabel}</p>
            <h1 className="mt-3 font-display text-[30px] leading-[1.1] tracking-[-0.005em] text-ink md:text-[40px]">
              {String(f.title ?? item.slug)}
            </h1>
            {filteredMeta.length ? (
              <p className="meta-line mt-3">{filteredMeta.join(" · ")}</p>
            ) : null}
            {summary ? (
              <p className="mt-5 max-w-[640px] text-[18px] leading-[1.55] text-ink">
                {summary}
              </p>
            ) : null}
          </header>

          {item.body.trim() ? (
            <div className="mt-10">
              {renderMarkdown(item.body, { components: mdxComponents })}
            </div>
          ) : null}
        </div>

        <SourcesConnectionsSidebar groups={groups} sourceNotes={sourceNotes} />
      </div>
    </article>
  );
}

const mdxComponents = {
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="mt-10 mb-4 font-display text-[22px] leading-tight text-ink">
      {children}
    </h2>
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

/** Helper used by detail pages to title-case a content type for breadcrumbs. */
export function backLabelFor(type: ContentType): string {
  return type === "stories"
    ? "Back to stories"
    : type === "people"
      ? "Back to people"
      : type === "places"
        ? "Back to places"
        : type === "documents"
          ? "Back to documents"
          : type === "eras"
            ? "Back to eras"
            : type === "audio"
              ? "Back to audio"
              : type === "maps"
                ? "Back to maps"
                : type === "meetings"
                  ? "Back to meetings"
                  : "Back to collections";
}

export { TYPE_LABEL };
