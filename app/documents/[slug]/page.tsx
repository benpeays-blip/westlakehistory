import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";

export async function generateStaticParams() {
  const items = await loadType("documents");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("documents", slug);
  if (!item) return {};
  const f = item.frontmatter as { title?: string; summary?: string };
  return {
    title: `${f.title ?? slug} — Westlake History`,
    description: f.summary,
  };
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("documents", slug);
  if (!item) notFound();

  const f = item.frontmatter as {
    documentType?: string;
    date?: string;
    creator?: string;
    source?: string;
    rights?: string;
  };

  return (
    <EntityDetail
      item={item}
      kindLabel="Document"
      backHref="/documents"
      backLabel="Back to documents"
      metaLines={[
        f.documentType,
        f.date,
        f.creator,
        f.source,
        f.rights ? `Rights: ${f.rights}` : null,
      ]}
    />
  );
}
