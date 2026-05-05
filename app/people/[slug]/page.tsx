import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";

export async function generateStaticParams() {
  const items = await loadType("people");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("people", slug);
  if (!item) return {};
  const f = item.frontmatter as { title?: string; summary?: string };
  return {
    title: `${f.title ?? slug} — Westlake History`,
    description: f.summary,
  };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("people", slug);
  if (!item) notFound();

  const f = item.frontmatter as {
    birthDate?: number | string;
    deathDate?: number | string;
    roles?: string[];
  };

  const dates =
    f.birthDate || f.deathDate
      ? `${f.birthDate ?? "?"}–${f.deathDate ?? "present"}`
      : null;
  const roles = f.roles?.length ? f.roles.join(" · ") : null;

  return (
    <EntityDetail
      item={item}
      kindLabel="Person"
      backHref="/people"
      backLabel="Back to people"
      metaLines={[dates, roles]}
    />
  );
}
