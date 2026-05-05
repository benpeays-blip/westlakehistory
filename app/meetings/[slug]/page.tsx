import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";

export async function generateStaticParams() {
  const items = await loadType("meetings");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("meetings", slug);
  if (!item) return {};
  const f = item.frontmatter as { title?: string; summary?: string };
  return {
    title: `${f.title ?? slug} — Westlake History`,
    description: f.summary,
  };
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("meetings", slug);
  if (!item) notFound();

  const f = item.frontmatter as {
    date?: string;
    location?: string;
    attendees?: string[];
    presenters?: string[];
    topics?: string[];
  };

  return (
    <EntityDetail
      item={item}
      kindLabel="Meeting"
      backHref="/meetings"
      backLabel="Back to meetings"
      metaLines={[
        f.date,
        f.location,
        f.presenters?.length ? `Presenters: ${f.presenters.join(", ")}` : null,
        f.topics?.length ? `Topics: ${f.topics.join(", ")}` : null,
      ]}
    />
  );
}
