import Link from "next/link";
import type { LoadedItem } from "@/lib/content";

const VISUAL_KINDS = new Set(["Photograph", "Photo", "Illustration"]);

/**
 * Live "From the archive" strip on the homepage.
 *
 * Pulls visual documents (photographs + illustrations) that have a real
 * thumbnail on disk, sorted by date when present, and renders the first N
 * as a horizontal-feeling grid. Replaces the old hand-picked Featured
 * placeholder thumbs with actual artifacts. Updates automatically as new
 * documents land — no manual curation required.
 */
export function FromTheArchive({
  documents,
  cap = 12,
}: {
  documents: LoadedItem[];
  cap?: number;
}) {
  const items = documents
    .filter((d) => {
      const f = d.frontmatter as { documentType?: string; thumb?: string; image?: string };
      return VISUAL_KINDS.has(f.documentType ?? "") && (f.thumb || f.image);
    })
    .sort((a, b) => {
      const ad = (a.frontmatter as { date?: string }).date ?? "";
      const bd = (b.frontmatter as { date?: string }).date ?? "";
      // Items with a date sort newest-first; those without fall to the end.
      if (ad && bd) return bd.localeCompare(ad);
      if (ad) return -1;
      if (bd) return 1;
      return 0;
    })
    .slice(0, cap);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="archive-heading" className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
        <div className="flex items-end justify-between gap-6 border-b border-rule pb-5">
          <div>
            <p className="label-archival text-cedar">Recently catalogued</p>
            <h2
              id="archive-heading"
              className="mt-2 font-display text-[26px] leading-tight md:text-[32px]"
            >
              From the archive
            </h2>
          </div>
          <Link
            href="/documents"
            className="meta-line border-b border-transparent pb-px transition-colors hover:border-oak hover:text-oak"
          >
            Browse all documents →
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => {
            const f = item.frontmatter as {
              title: string;
              documentType?: string;
              date?: string;
              thumb?: string;
              image?: string;
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
                  <p className="label-archival mt-3 text-cedar">
                    {f.documentType}
                  </p>
                  <p className="mt-1 line-clamp-2 font-display text-[13px] leading-[1.3] text-ink transition-colors group-hover:text-oak">
                    {f.title}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
