import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";

export async function generateStaticParams() {
  const items = await loadType("maps");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("maps", slug);
  if (!item) return {};
  const f = item.frontmatter as { title?: string; summary?: string };
  return {
    title: `${f.title ?? slug} — Westlake History`,
    description: f.summary,
  };
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("maps", slug);
  if (!item) notFound();

  const f = item.frontmatter as {
    year?: number;
    mapType?: string;
    source?: string;
  };

  return (
    <EntityDetail
      item={item}
      kindLabel="Map"
      backHref="/maps"
      backLabel="Back to maps"
      metaLines={[
        f.year ? String(f.year) : null,
        f.mapType,
        f.source ? `Source: ${f.source}` : null,
      ]}
    />
  );
}
