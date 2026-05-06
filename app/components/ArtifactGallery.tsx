import Link from "next/link";
import type { LoadedItem } from "@/lib/content";
import { getReferencingItems, resolveRefs } from "@/lib/content";

const VISUAL_KINDS = new Set([
  "Photograph",
  "Photo",
  "Illustration",
  "Map",
]);

/**
 * Inline gallery of artifacts (photographs + illustrations) connected to
 * an entity. Used on Place and Person detail pages so visitors *see* the
 * primary sources at a glance, not just navigate to them via the sidebar.
 *
 * Pulls from two sources:
 *   - Documents the entity directly references in its frontmatter
 *     (curator-curated order, shown first)
 *   - Documents that reference the entity (reverse lookup, deduped)
 */
export async function ArtifactGallery({
  entityType,
  entitySlug,
  /** Optional curator-listed document slugs to show first (in this order). */
  curated = [],
  /** Heading shown above the gallery. */
  heading = "Photographs",
  /** When >0 and there are more items than this, link out to a full view. */
  cap = 12,
  /** Used to construct "see all" link */
  seeAllHref,
}: {
  entityType: "places" | "people" | "stories" | "eras" | "collections";
  entitySlug: string;
  curated?: string[];
  heading?: string;
  cap?: number;
  seeAllHref?: string;
}) {
  // Reverse lookup: documents whose frontmatter array references this entity
  const referencing = await getReferencingItems(entityType, entitySlug);
  const docsReferencing = referencing.filter((r) => r.type === "documents");

  // Curator-listed documents (first, in order)
  const curatedDocs = await resolveRefs("documents", curated);

  // Combine, dedupe, keep only visual kinds, drop ones with no image
  const seen = new Set<string>();
  const all: LoadedItem[] = [];
  for (const item of [...curatedDocs, ...docsReferencing]) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    const f = item.frontmatter as { documentType?: string; thumb?: string; image?: string };
    if (!VISUAL_KINDS.has(f.documentType ?? "")) continue;
    if (!f.thumb && !f.image) continue;
    all.push(item);
  }

  if (all.length === 0) return null;

  const visible = all.slice(0, cap);
  const hidden = all.length - visible.length;

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-6 border-b border-rule pb-3">
        <h2 className="font-display text-[22px] leading-tight text-ink">
          {heading}
        </h2>
        <p className="meta-line text-ink-mute">
          {all.length} {all.length === 1 ? "item" : "items"}
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((item) => {
          const f = item.frontmatter as {
            title: string;
            documentType?: string;
            thumb?: string;
            image?: string;
            date?: string;
          };
          const src = f.thumb ?? f.image!;
          return (
            <li key={item.slug}>
              <Link
                href={`/documents/${item.slug}`}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-oak"
              >
                <div className="aspect-[3/4] overflow-hidden border border-rule bg-limestone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={f.title}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-2 line-clamp-2 font-display text-[13px] leading-tight text-ink transition-colors group-hover:text-oak">
                  {f.title}
                </p>
                {f.date ? (
                  <p className="meta-line mt-1 text-[10px] text-ink-mute">{f.date}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && seeAllHref ? (
        <p className="mt-6">
          <Link
            href={seeAllHref}
            className="meta-line border-b border-cedar/50 pb-px text-cedar hover:border-cedar"
          >
            View all {all.length} items →
          </Link>
        </p>
      ) : null}
    </section>
  );
}
