"use client";

import Link from "next/link";
import MiniSearch from "minisearch";
import { useEffect, useMemo, useState, useDeferredValue } from "react";
import type { SearchDoc } from "@/lib/search-index";

const FILTER_TYPES: { id: string; label: string }[] = [
  { id: "", label: "All" },
  { id: "stories", label: "Stories" },
  { id: "people", label: "People" },
  { id: "places", label: "Places" },
  { id: "documents", label: "Documents" },
  { id: "audio,audio-podcast", label: "Audio" },
  { id: "maps", label: "Maps" },
  { id: "collections", label: "Collections" },
];

export function SearchClient({
  docs,
  initialQuery,
  initialType,
}: {
  docs: SearchDoc[];
  initialQuery: string;
  initialType: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialType);
  const deferredQuery = useDeferredValue(query);

  // Sync URL so search results are shareable.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filter) params.set("type", filter);
    const next = `/search${params.size ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", next);
  }, [query, filter]);

  const mini = useMemo(() => {
    const m = new MiniSearch<SearchDoc>({
      idField: "id",
      fields: ["title", "summary", "body", "tags"],
      storeFields: [
        "id",
        "type",
        "typeLabel",
        "title",
        "summary",
        "subtitle",
        "href",
        "date",
      ],
      searchOptions: {
        boost: { title: 3, tags: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
    m.addAll(docs);
    return m;
  }, [docs]);

  const allowedTypes = useMemo(
    () => (filter ? new Set(filter.split(",")) : null),
    [filter],
  );

  const results = useMemo(() => {
    if (!deferredQuery.trim()) {
      const sorted = [...docs].sort((a, b) =>
        (b.date || "").localeCompare(a.date || ""),
      );
      return (allowedTypes
        ? sorted.filter((d) => allowedTypes.has(d.type))
        : sorted
      ).slice(0, 30);
    }
    const hits = mini.search(deferredQuery) as unknown as Array<
      SearchDoc & { score: number }
    >;
    return allowedTypes ? hits.filter((d) => allowedTypes.has(d.type)) : hits;
  }, [mini, deferredQuery, allowedTypes, docs]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of docs) m.set(d.type, (m.get(d.type) ?? 0) + 1);
    return m;
  }, [docs]);

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mt-8 flex items-stretch overflow-hidden rounded-sm border border-rule bg-paper"
      >
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the archive…"
          aria-label="Search the archive"
          autoFocus
          className="flex-1 bg-transparent px-4 py-3 text-[16px] text-ink placeholder:text-ink-mute focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="px-4 text-ink-mute transition-colors hover:text-ink"
          >
            ✕
          </button>
        ) : null}
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTER_TYPES.map((f) => {
          const isActive = f.id === filter;
          const count = filterCount(f.id, counts);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={
                "meta-line rounded-full border px-3.5 py-1.5 transition-colors " +
                (isActive
                  ? "border-oak bg-oak text-paper"
                  : "border-rule bg-paper text-ink-mute hover:border-oak hover:text-oak")
              }
            >
              {f.label}
              {count != null ? (
                <span className="ml-1.5 text-[10.5px] opacity-80">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="meta-line mt-6 text-ink-mute">
        {deferredQuery.trim()
          ? `${results.length} ${results.length === 1 ? "result" : "results"} for "${deferredQuery.trim()}"`
          : `Showing ${results.length} most recent`}
      </p>

      <ul className="mt-4 divide-y divide-rule">
        {results.length === 0 ? (
          <li className="py-12 text-[16px] text-ink-mute">
            No matches. Try a different word, or remove a filter.
          </li>
        ) : (
          results.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                target={r.type === "audio-podcast" ? "_blank" : undefined}
                rel={r.type === "audio-podcast" ? "noopener noreferrer" : undefined}
                className="group block py-6 transition-colors hover:bg-limestone/40"
              >
                <p className="label-archival text-cedar">{r.typeLabel}</p>
                <h3 className="mt-2 font-display text-[20px] leading-snug text-ink transition-colors group-hover:text-oak">
                  {r.title}
                </h3>
                {r.subtitle ? (
                  <p className="meta-line mt-1.5">{r.subtitle}</p>
                ) : null}
                {r.summary ? (
                  <p className="mt-2 max-w-[760px] text-[14.5px] leading-snug text-ink-mute">
                    {r.summary}
                  </p>
                ) : null}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function filterCount(filterId: string, counts: Map<string, number>): number | null {
  if (!filterId) {
    let total = 0;
    for (const c of counts.values()) total += c;
    return total;
  }
  return filterId.split(",").reduce((sum, id) => sum + (counts.get(id) ?? 0), 0);
}
