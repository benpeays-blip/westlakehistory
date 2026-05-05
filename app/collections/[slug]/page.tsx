import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";

export async function generateStaticParams() {
  const items = await loadType("collections");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("collections", slug);
  if (!item) return {};
  const f = item.frontmatter as { title?: string; summary?: string };
  return {
    title: `${f.title ?? slug} — Westlake History`,
    description: f.summary,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("collections", slug);
  if (!item) notFound();

  const f = item.frontmatter as { curator?: string; dateRange?: string };

  return (
    <EntityDetail
      item={item}
      kindLabel="Collection"
      backHref="/collections"
      backLabel="Back to collections"
      metaLines={[f.curator, f.dateRange]}
    />
  );
}
