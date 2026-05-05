import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";

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
    placeType?: string;
    locationLabel?: string;
    historicalNames?: string[];
    yearBuilt?: number | string;
    yearDemolished?: number | string;
    status?: string;
  };

  const yearLine =
    f.yearBuilt || f.yearDemolished
      ? `${f.yearBuilt ?? "?"}${f.yearDemolished ? `–${f.yearDemolished}` : ""}`
      : null;
  const historicalNames = f.historicalNames?.length
    ? `Also known as: ${f.historicalNames.join(", ")}`
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
    />
  );
}
