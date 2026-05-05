import { loadMapPins } from "@/lib/map-data";
import { HistoricalMap } from "@/app/components/HistoricalMap";

export const metadata = {
  title: "Maps — Westlake History",
  description:
    "Interactive map of West Lake Hills, Texas — historic ranches, roads, schools, and buildings, layered across the era when each appeared.",
};

export default async function MapsPage() {
  const pins = await loadMapPins();
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-10 md:px-10 md:py-14">
      <header className="border-b border-rule pb-8">
        <p className="label-archival">Cartography</p>
        <h1 className="mt-3 font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
          West Lake Area Over Time
        </h1>
        <p className="mt-4 max-w-[680px] text-[16px] leading-snug text-ink-mute">
          A timeline of places — ranches, roads, dams, schools, and
          buildings. Drag the timeline to scrub from the original land grants
          of the 1860s through the present, or filter by category to follow a
          single thread of the geography.
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
    </section>
  );
}
