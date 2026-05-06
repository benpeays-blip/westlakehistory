import { notFound } from "next/navigation";
import { loadOne, loadType } from "@/lib/content";
import { EntityDetail } from "@/app/components/EntityDetail";
import { ArtifactGallery } from "@/app/components/ArtifactGallery";

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
    title?: string;
    birthDate?: number | string;
    deathDate?: number | string;
    roles?: string[];
    portrait?: string;
    portraitAlt?: string;
    portraitCredit?: string;
    portraitYear?: number;
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
      extra={
        <>
          {f.portrait ? (
            <Portrait
              src={f.portrait}
              alt={f.portraitAlt ?? `Portrait of ${f.title ?? slug}`}
              credit={f.portraitCredit}
              year={f.portraitYear}
            />
          ) : null}
          <ArtifactGallery
            entityType="people"
            entitySlug={slug}
            heading={`Documents featuring ${f.title ?? slug}`}
            cap={12}
          />
        </>
      }
    />
  );
}

function Portrait({
  src,
  alt,
  credit,
  year,
}: {
  src: string;
  alt: string;
  credit?: string;
  year?: number;
}) {
  return (
    <figure className="mt-4 flex flex-col gap-4 border border-rule bg-limestone/40 sm:flex-row sm:items-start sm:gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="block max-h-[420px] w-full object-cover sm:max-w-[300px]"
      />
      <figcaption className="px-5 py-5 text-[13.5px] leading-relaxed text-ink-mute sm:px-0 sm:py-6 sm:pr-6">
        <p className="label-archival mb-2 text-cedar">Portrait</p>
        <p className="text-ink">
          {alt}
          {year ? `, ${year}` : ""}.
        </p>
        {credit ? (
          <p className="meta-line mt-3 text-[11px] text-ink-mute">{credit}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}
