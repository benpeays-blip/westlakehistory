import Link from "next/link";
import type { LoadedItem } from "@/lib/content";
import type { ContentType } from "@/lib/schemas";

interface IndexListProps {
  type: ContentType;
  title: string;
  description: string;
  items: LoadedItem[];
  empty?: string;
}

/**
 * Shared archival index template used by /stories, /people, /places, etc.
 * Restrained list rather than a dense card grid — this is an archive index,
 * not a marketing page.
 */
export function IndexList({
  type,
  title,
  description,
  items,
  empty = "Nothing in this section yet — content is being added.",
}: IndexListProps) {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <header className="border-b border-rule pb-7">
        <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
          {title}
        </h1>
        <p className="mt-3 max-w-[640px] text-[16px] leading-snug text-ink-mute">
          {description}
        </p>
        <p className="meta-line mt-4">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="py-16 text-[16px] text-ink-mute">{empty}</p>
      ) : (
        <ul className="divide-y divide-rule">
          {items.map((item) => {
            const f = item.frontmatter as Record<string, unknown>;
            return (
              <li key={item.slug}>
                <Link
                  href={`/${type}/${item.slug}`}
                  className="group block py-7 transition-colors hover:bg-limestone/40"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8">
                    <div className="md:flex-1">
                      <h2 className="font-display text-[22px] leading-snug text-ink transition-colors group-hover:text-oak">
                        {String(f.title ?? item.slug)}
                      </h2>
                      <Subtitle frontmatter={f} type={type} />
                      {typeof f.summary === "string" ? (
                        <p className="mt-2 max-w-[680px] text-[15px] leading-snug text-ink-mute">
                          {f.summary}
                        </p>
                      ) : null}
                    </div>
                    <span className="meta-line whitespace-nowrap text-cedar">
                      View →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Subtitle({
  frontmatter: f,
  type,
}: {
  frontmatter: Record<string, unknown>;
  type: ContentType;
}) {
  const bits: string[] = [];
  if (type === "people") {
    if (f.birthDate || f.deathDate) {
      bits.push(`${f.birthDate ?? "?"}–${f.deathDate ?? "present"}`);
    }
    if (Array.isArray(f.roles) && f.roles.length) bits.push(f.roles.join(", "));
  } else if (type === "places") {
    if (typeof f.placeType === "string") bits.push(f.placeType);
    if (typeof f.locationLabel === "string") bits.push(f.locationLabel);
    if (typeof f.status === "string") bits.push(String(f.status));
  } else if (type === "documents") {
    if (typeof f.documentType === "string") bits.push(f.documentType);
    if (typeof f.date === "string") bits.push(f.date);
    if (typeof f.source === "string") bits.push(f.source);
  } else if (type === "stories") {
    if (typeof f.date === "string") bits.push(f.date);
    if (Array.isArray(f.tags)) bits.push(f.tags.slice(0, 3).join(" · "));
  } else if (type === "eras") {
    if (typeof f.yearStart === "number" && typeof f.yearEnd === "number")
      bits.push(`${f.yearStart}–${f.yearEnd}`);
  } else if (type === "collections") {
    if (typeof f.curator === "string") bits.push(f.curator);
    if (typeof f.dateRange === "string") bits.push(f.dateRange);
  }
  if (!bits.length) return null;
  return <p className="meta-line mt-1.5">{bits.join(" · ")}</p>;
}
