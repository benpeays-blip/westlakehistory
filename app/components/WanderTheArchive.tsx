import Link from "next/link";
import { loadAllContent, type LoadedItem } from "@/lib/content";
import type { ContentType } from "@/lib/schemas";
import { TYPE_LABEL } from "@/lib/schemas";

interface WanderProps {
  /** The entity the reader is currently on. Used to seed deterministic shuffle
   * and to avoid suggesting the same item back to itself. */
  fromType: ContentType;
  fromSlug: string;
}

/**
 * "Continue through the archive" — three suggestions at the foot of every
 * entity page. Picks one Person, one Place, and one Document/Audio that
 * share at least one cross-reference with the current entity (a person it
 * mentions, a place it references). Falls back to recent items if no
 * graph-neighbors exist. Choice is deterministic per (type, slug) so the
 * suggestion is stable across revisits — no unsettling reshuffles.
 */
export async function WanderTheArchive({ fromType, fromSlug }: WanderProps) {
  const all = await loadAllContent();
  const current = all[fromType].find((i) => i.slug === fromSlug);
  if (!current) return null;
  const fm = current.frontmatter as Record<string, unknown>;

  const seed = `${fromType}/${fromSlug}`;

  const person = pickOne(
    relatedItems(all, "people", fm, current),
    seed + ":people",
    () => fallbackItems(all, "people", current),
  );
  const place = pickOne(
    relatedItems(all, "places", fm, current),
    seed + ":places",
    () => fallbackItems(all, "places", current),
  );
  // Prefer documents but fall back to audio if no documents are connected.
  const docOrAudio =
    pickOne(
      relatedItems(all, "documents", fm, current),
      seed + ":documents",
      () => [],
    ) ??
    pickOne(
      relatedItems(all, "audio", fm, current),
      seed + ":audio",
      () => [],
    ) ??
    pickOne(
      relatedItems(all, "stories", fm, current),
      seed + ":stories",
      () => fallbackItems(all, "stories", current),
    );

  const picks = [person, place, docOrAudio].filter(
    (x): x is LoadedItem => Boolean(x),
  );
  if (picks.length === 0) return null;

  return (
    <section className="mt-16 border-t border-rule pt-10">
      <h2 className="font-display text-[22px] leading-tight text-ink">
        Continue through the archive
      </h2>
      <p className="mt-2 max-w-[640px] text-[14.5px] leading-snug text-ink-mute">
        Three threads that connect to what you just read. Pull on any of them.
      </p>
      <ul className="mt-7 grid gap-px overflow-hidden bg-rule sm:grid-cols-3">
        {picks.map((item) => (
          <li key={`${item.type}-${item.slug}`} className="bg-paper">
            <Link
              href={`/${item.type}/${item.slug}`}
              className="group flex h-full flex-col gap-2 px-5 py-6 transition-colors hover:bg-limestone/50"
            >
              <span className="label-archival text-cedar">
                Follow {leadVerb(item.type)} {item.type === "people" ? "person" : item.type === "places" ? "place" : item.type === "documents" ? "document" : item.type === "audio" ? "recording" : "story"}
              </span>
              <span className="font-display text-[18px] leading-snug text-ink transition-colors group-hover:text-oak">
                {String((item.frontmatter as { title?: string }).title ?? item.slug)}
              </span>
              <span className="meta-line text-ink-mute">
                {TYPE_LABEL[item.type]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Items of `type` that are referenced from the current entity's frontmatter. */
function relatedItems(
  all: Awaited<ReturnType<typeof loadAllContent>>,
  type: ContentType,
  fm: Record<string, unknown>,
  current: LoadedItem,
): LoadedItem[] {
  const refs = fm[type];
  if (!Array.isArray(refs)) return [];
  const slugs = new Set(refs.filter((s): s is string => typeof s === "string"));
  return all[type].filter(
    (i) =>
      slugs.has(i.slug) &&
      !(i.type === current.type && i.slug === current.slug),
  );
}

function fallbackItems(
  all: Awaited<ReturnType<typeof loadAllContent>>,
  type: ContentType,
  current: LoadedItem,
): LoadedItem[] {
  return all[type].filter(
    (i) => !(i.type === current.type && i.slug === current.slug),
  );
}

/** Stable "random" pick: hash the seed and modulo the list length. */
function pickOne(
  items: LoadedItem[],
  seed: string,
  fallback: () => LoadedItem[],
): LoadedItem | null {
  const list = items.length ? items : fallback();
  if (list.length === 0) return null;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

function leadVerb(type: ContentType): string {
  switch (type) {
    case "people":
      return "a";
    case "places":
      return "a";
    case "documents":
      return "a";
    case "audio":
      return "a";
    case "stories":
      return "a";
    default:
      return "a";
  }
}
