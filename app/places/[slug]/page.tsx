import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";
import { PlaceTimeline } from "@/app/components/PlaceTimeline";
import type { MapPin } from "@/lib/map-types";

export async function generateStaticParams() {
  const items = await loadType("places");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("places", slug);
  if (!item) return {};
  const f = item.frontmatter as { title?: string; summary?: string };
  return {
    title: `${f.title ?? slug} — Westlake History`,
    description: f.summary,
  };
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("places", slug);
  if (!item) notFound();

  const f = item.frontmatter as {
    title?: string;
    placeType?: string;
    locationLabel?: string;
    historicalNames?: string[];
    yearBuilt?: number | string;
    yearDemolished?: number | string;
    status?: string;
    summary?: string;
    coordinates?: { lat: number; lng: number };
  };

  const yearLine =
    f.yearBuilt || f.yearDemolished
      ? `${f.yearBuilt ?? "?"}${f.yearDemolished ? `–${f.yearDemolished}` : ""}`
      : null;
  const historicalNames = f.historicalNames?.length
    ? `Also known as: ${f.historicalNames.join(", ")}`
    : null;

  // Build the MapPin shape the PlaceTimeline expects. The placeType-to-layer
  // mapping isn't needed here (the viewer ignores layer), so any value works.
  const pin: MapPin | null = f.coordinates
    ? {
        slug,
        title: f.title ?? slug,
        href: `/places/${slug}`,
        summary: f.summary ?? "",
        placeType: f.placeType ?? "Place",
        layer: "buildings",
        lat: f.coordinates.lat,
        lng: f.coordinates.lng,
        yearBuilt: toYear(f.yearBuilt),
        yearDemolished: toYear(f.yearDemolished),
        historicalNames: f.historicalNames,
      }
    : null;

  return (
    <EntityDetail
      item={item}
      kindLabel="Place"
      backHref="/places"
      backLabel="Back to places"
      metaLines={[
        f.placeType,
        f.locationLabel,
        yearLine,
        f.status,
        historicalNames,
      ]}
      extra={pin ? <PlaceTimeline pin={pin} /> : null}
    />
  );
}

function toYear(v: number | string | undefined): number | undefined {
  if (v == null) return undefined;
  const n = typeof v === "number" ? v : parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}
