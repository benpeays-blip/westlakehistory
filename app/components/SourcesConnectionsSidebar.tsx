import Link from "next/link";
import type { LoadedItem } from "@/lib/content";

/**
 * The signature interaction of the site: a sticky right-rail sidebar that
 * surfaces every entity a story (or other entity) connects to, organized
 * by type. On mobile this collapses to a `<details>` drawer at the foot
 * of the page so a single template works for both viewports.
 */
export function SourcesConnectionsSidebar({
  groups,
  sourceNotes,
}: {
  groups: { label: string; items: LoadedItem[] }[];
  sourceNotes?: string[];
}) {
  const filled = groups.filter((g) => g.items.length > 0);
  const hasSources = !!sourceNotes?.length;
  if (!filled.length && !hasSources) return null;

  const inner = (
    <div className="space-y-7">
      {filled.map((g) => (
        <SidebarGroup key={g.label} label={g.label} items={g.items} />
      ))}
      {hasSources ? (
        <div>
          <h3 className="label-archival mb-3">Source Notes</h3>
          <ul className="space-y-2 text-[13.5px] leading-snug text-ink-mute">
            {sourceNotes!.map((s, i) => (
              <li key={i} className="border-l-2 border-rule pl-3">
                {s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside
        aria-label="Sources & Connections"
        className="hidden lg:sticky lg:top-8 lg:block lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto"
      >
        <div className="border border-rule bg-paper p-6">
          <h2 className="mb-5 font-display text-[18px] leading-tight text-ink">
            Sources &amp; Connections
          </h2>
          {inner}
        </div>
      </aside>

      {/* Mobile: collapsed drawer */}
      <details className="group lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between border border-rule bg-paper px-5 py-4 font-display text-[16px] text-ink list-none [&::-webkit-details-marker]:hidden">
          <span>Sources &amp; Connections</span>
          <span className="font-mono text-[12px] text-ink-mute group-open:rotate-90 transition-transform">
            ›
          </span>
        </summary>
        <div className="border border-t-0 border-rule bg-paper p-5">
          {inner}
        </div>
      </details>
    </>
  );
}

function SidebarGroup({
  label,
  items,
}: {
  label: string;
  items: LoadedItem[];
}) {
  return (
    <div>
      <h3 className="label-archival mb-3">{label}</h3>
      <ul className="divide-y divide-rule">
        {items.map((item) => (
          <li key={`${item.type}-${item.slug}`}>
            <Link
              href={`/${item.type}/${item.slug}`}
              className="group block py-3 first:pt-0"
            >
              <p className="font-display text-[15px] leading-snug text-ink transition-colors group-hover:text-oak">
                {(item.frontmatter as { title?: string }).title ?? item.slug}
              </p>
              <SubtitleFor item={item} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubtitleFor({ item }: { item: LoadedItem }) {
  const f = item.frontmatter as Record<string, unknown>;
  const bits: string[] = [];
  if (typeof f.birthDate === "number" || typeof f.birthDate === "string") {
    const death = f.deathDate ? `–${f.deathDate}` : "–";
    bits.push(`${f.birthDate}${death}`);
  } else if (typeof f.placeType === "string") {
    bits.push(String(f.placeType));
  } else if (typeof f.documentType === "string") {
    bits.push(String(f.documentType));
  } else if (typeof f.audioType === "string") {
    bits.push(String(f.audioType));
  } else if (typeof f.year === "number") {
    bits.push(String(f.year));
  } else if (typeof f.curator === "string") {
    bits.push(String(f.curator));
  }
  if (typeof f.locationLabel === "string") bits.push(String(f.locationLabel));

  if (!bits.length) return null;
  return (
    <p className="meta-line mt-1 text-[11.5px]">{bits.join(" · ")}</p>
  );
}
