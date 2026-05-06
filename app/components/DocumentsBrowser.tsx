"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface BrowseDoc {
  slug: string;
  title: string;
  documentType: string;
  date: string;
  source: string;
  image: string;
  thumb: string;
  summary: string;
  collectionsCount: number;
  placeCount: number;
  peopleCount: number;
}

/**
 * Type-filtered browse for the full /documents catalogue.
 *
 * Strategic redundancy in action: a visitor who wants to see "the old
 * photos" filters by Photograph and gets every photo regardless of which
 * collection it belongs to. The same item is also linked from the place
 * page, the person page, and any story that references it. The
 * collection page is one of many filtered views over this same list.
 *
 * View toggle: visual grid (good for photos and illustrations) or
 * editorial list (good for letters, essays, oral histories).
 */
export function DocumentsBrowser({ docs }: { docs: BrowseDoc[] }) {
  const [type, setType] = useState<string>("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of docs) m.set(d.documentType, (m.get(d.documentType) ?? 0) + 1);
    return m;
  }, [docs]);

  // Sorted type filter chips — biggest groups first, with a friendly order
  // for visual kinds at the top.
  const VISUAL_PRIORITY = ["Photograph", "Photo", "Illustration", "Map"];
  const types = useMemo(() => {
    return Array.from(counts.keys()).sort((a, b) => {
      const av = VISUAL_PRIORITY.indexOf(a);
      const bv = VISUAL_PRIORITY.indexOf(b);
      if (av !== -1 && bv !== -1) return av - bv;
      if (av !== -1) return -1;
      if (bv !== -1) return 1;
      return (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
    });
  }, [counts]);

  const visible = useMemo(
    () => (type ? docs.filter((d) => d.documentType === type) : docs),
    [docs, type],
  );

  const isVisualType = type === "Photograph" || type === "Illustration" || type === "Photo";
  const effectiveView = type ? (isVisualType ? "grid" : view) : view;

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <header className="border-b border-rule pb-7">
        <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
          Documents
        </h1>
        <p className="mt-3 max-w-[680px] text-[16px] leading-snug text-ink-mute">
          Photographs, letters, illustrations, books, deeds, newspapers,
          and other primary materials from the archive — every item with
          its own source citation and rights statement. Browse all, or
          filter to a single kind.
        </p>
        <p className="meta-line mt-4">
          {docs.length} {docs.length === 1 ? "item" : "items"}
        </p>
      </header>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setType("")}
          className={
            "meta-line rounded-full border px-3.5 py-1.5 transition-colors " +
            (type === ""
              ? "border-oak bg-oak text-paper"
              : "border-rule bg-paper text-ink-mute hover:border-oak hover:text-oak")
          }
        >
          All <span className="ml-1.5 opacity-80">{docs.length}</span>
        </button>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={
              "meta-line rounded-full border px-3.5 py-1.5 transition-colors " +
              (type === t
                ? "border-oak bg-oak text-paper"
                : "border-rule bg-paper text-ink-mute hover:border-oak hover:text-oak")
            }
          >
            {t} <span className="ml-1.5 opacity-80">{counts.get(t)}</span>
          </button>
        ))}

        <span className="ml-auto inline-flex overflow-hidden rounded-full border border-rule">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={
                "meta-line px-3 py-1.5 transition-colors " +
                (effectiveView === v
                  ? "bg-ink text-paper"
                  : "bg-paper text-ink-mute hover:text-ink")
              }
            >
              {v === "grid" ? "Grid" : "List"}
            </button>
          ))}
        </span>
      </div>

      {effectiveView === "grid" ? (
        <ul className="mt-9 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((d) => (
            <GridCard key={d.slug} doc={d} />
          ))}
        </ul>
      ) : (
        <ul className="mt-6 divide-y divide-rule">
          {visible.map((d) => (
            <ListRow key={d.slug} doc={d} />
          ))}
        </ul>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 text-[16px] text-ink-mute">
          No items in this category yet.
        </p>
      ) : null}
    </section>
  );
}

function GridCard({ doc }: { doc: BrowseDoc }) {
  return (
    <li>
      <Link
        href={`/documents/${doc.slug}`}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-oak"
      >
        <div className="aspect-[3/4] overflow-hidden border border-rule bg-limestone">
          {doc.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.thumb}
              alt={doc.title}
              loading="lazy"
              className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
            />
          ) : (
            <div className="flex h-full items-end p-3">
              <span className="meta-line text-ink-mute">No image</span>
            </div>
          )}
        </div>
        <p className="label-archival mt-3 text-cedar">{doc.documentType}</p>
        <h3 className="mt-1 font-display text-[14.5px] leading-[1.3] text-ink transition-colors group-hover:text-oak">
          {doc.title}
        </h3>
        {doc.date ? (
          <p className="meta-line mt-1 text-[10.5px] text-ink-mute">{doc.date}</p>
        ) : null}
      </Link>
    </li>
  );
}

function ListRow({ doc }: { doc: BrowseDoc }) {
  return (
    <li>
      <Link
        href={`/documents/${doc.slug}`}
        className="group flex gap-5 py-5 transition-colors hover:bg-limestone/40"
      >
        <div className="hidden h-20 w-16 shrink-0 overflow-hidden border border-rule bg-limestone sm:block">
          {doc.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.thumb}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover grayscale group-hover:grayscale-0"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="label-archival text-cedar">{doc.documentType}</p>
          <h3 className="mt-1 font-display text-[18px] leading-snug text-ink transition-colors group-hover:text-oak">
            {doc.title}
          </h3>
          {doc.summary ? (
            <p className="mt-1 line-clamp-2 max-w-[820px] text-[14px] leading-snug text-ink-mute">
              {doc.summary}
            </p>
          ) : null}
          <p className="meta-line mt-2 text-[10.5px] text-ink-mute">
            {[doc.date, doc.source].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Link>
    </li>
  );
}
