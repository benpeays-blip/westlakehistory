import { buildSearchIndex } from "@/lib/search-index";
import { SearchClient } from "@/app/components/SearchClient";

export const revalidate = 3600;

export const metadata = {
  title: "Search — Westlake History",
  description:
    "Search across the Westlake, Texas archive — stories, people, places, documents, podcast episodes, and more.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q ?? "";
  const initialType = params.type ?? "";
  const docs = await buildSearchIndex();

  return (
    <section className="mx-auto max-w-[1080px] px-6 py-12 md:px-10 md:py-16">
      <header className="border-b border-rule pb-7">
        <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
          Search the archive
        </h1>
        <p className="mt-3 max-w-[640px] text-[16px] leading-snug text-ink-mute">
          Search across {docs.length} entries — stories, people, places,
          documents, eras, collections, and podcast episodes.
        </p>
      </header>

      <SearchClient
        docs={docs}
        initialQuery={initialQuery}
        initialType={initialType}
      />
    </section>
  );
}
