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
    image?: string;
    externalRecordUrl?: string;
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
      extra={
        f.image ? (
          <DocumentImage
            src={f.image}
            externalUrl={f.externalRecordUrl}
            alt={(item.frontmatter as { title?: string }).title ?? slug}
          />
        ) : null
      }
    />
  );
}

function DocumentImage({
  src,
  externalUrl,
  alt,
}: {
  src: string;
  externalUrl?: string;
  alt: string;
}) {
  return (
    <figure className="mt-4 border border-rule bg-limestone/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="block max-h-[700px] w-full object-contain"
      />
      {externalUrl ? (
        <figcaption className="meta-line border-t border-rule px-4 py-3 text-ink-mute">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
          >
            View the original record on the Portal to Texas History →
          </a>
        </figcaption>
      ) : null}
    </figure>
  );
}
