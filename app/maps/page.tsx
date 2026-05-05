import Link from "next/link";
import { loadMapPins } from "@/lib/map-data";
import { loadType } from "@/lib/content";
import { HistoricalMap } from "@/app/components/HistoricalMap";

export const metadata = {
  title: "Maps — Westlake History",
  description:
    "Interactive map of West Lake Hills, Texas — historic ranches, roads, schools, and buildings, layered across the era when each appeared.",
};

export default async function MapsPage() {
  const [pins, mapDocs] = await Promise.all([
    loadMapPins(),
    loadType("maps"),
  ]);

  // Maps sorted oldest-first reads as a chronology along the catalogue.
  const sorted = [...mapDocs].sort(
    (a, b) =>
      ((a.frontmatter as { year?: number }).year ?? 0) -
      ((b.frontmatter as { year?: number }).year ?? 0),
  );

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-10 md:px-10 md:py-14">
      <header className="border-b border-rule pb-8">
        <p className="label-archival">Cartography</p>
        <h1 className="mt-3 font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
          West Lake Area Over Time
        </h1>
        <p className="mt-4 max-w-[680px] text-[16px] leading-snug text-ink-mute">
          A timeline of places — ranches, roads, dams, schools, and
          buildings. Drag the timeline to scrub from the original land
          grants of the 1860s through the present, or filter by category
          to follow a single thread of the geography.
        </p>
      </header>

      <div className="mt-10">
        <HistoricalMap pins={pins} />
      </div>

      <p className="meta-line mt-6 text-ink-mute">
        Coordinates come from the place records. The surveyor&apos;s-paper
        canvas is a styled placeholder — georeferenced historical map
        overlays (1944 Westlake survey, 1870 land-grant maps) will land in
        a later phase.
      </p>

      {sorted.length ? (
        <section className="mt-16 border-t border-rule pt-10">
          <h2 className="font-display text-[24px] leading-tight text-ink">
            Maps in the archive
          </h2>
          <p className="mt-2 max-w-[640px] text-[14.5px] leading-snug text-ink-mute">
            Catalogued surveys, land-grant maps, and plats. Each links to a
            full record with provenance and rights. Scans replace
            placeholders as documents are digitized.
          </p>
          <ul className="mt-7 grid gap-px overflow-hidden bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((m) => {
              const f = m.frontmatter as {
                title: string;
                year?: number;
                mapType?: string;
                summary?: string;
              };
              return (
                <li key={m.slug} className="bg-paper">
                  <Link
                    href={`/maps/${m.slug}`}
                    className="group flex h-full flex-col gap-2 px-5 py-6 transition-colors hover:bg-limestone/40"
                  >
                    <p className="label-archival text-cedar">
                      {[f.year, f.mapType].filter(Boolean).join(" · ")}
                    </p>
                    <p className="font-display text-[18px] leading-snug text-ink transition-colors group-hover:text-oak">
                      {f.title}
                    </p>
                    {f.summary ? (
                      <p className="line-clamp-3 text-[13.5px] leading-snug text-ink-mute">
                        {f.summary}
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
