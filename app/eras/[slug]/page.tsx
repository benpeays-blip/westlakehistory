import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";

export async function generateStaticParams() {
  const items = await loadType("eras");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("eras", slug);
  if (!item) return {};
  const f = item.frontmatter as { title?: string; summary?: string };
  return {
    title: `${f.title ?? slug} — Westlake History`,
    description: f.summary,
  };
}

export default async function EraPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("eras", slug);
  if (!item) notFound();

  const f = item.frontmatter as { yearStart?: number; yearEnd?: number };
  const range =
    f.yearStart && f.yearEnd ? `${f.yearStart}–${f.yearEnd}` : null;

  return (
    <EntityDetail
      item={item}
      kindLabel="Era"
      backHref="/"
      backLabel="Back to home"
      metaLines={[range]}
    />
  );
}
