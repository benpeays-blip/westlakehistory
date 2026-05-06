import { loadType } from "@/lib/content";
import { DocumentsBrowser } from "@/app/components/DocumentsBrowser";

export const metadata = {
  title: "Documents — Westlake History",
  description:
    "Photographs, letters, illustrations, books, deeds, newspapers, and other primary materials from the Westlake archive — browseable by type or by what's connected to them.",
};

export default async function DocumentsIndex() {
  const items = await loadType("documents");
  // Hand the client a serializable shape so it can filter without re-loading.
  const docs = items.map((item) => {
    const f = item.frontmatter as {
      title: string;
      documentType: string;
      date?: string;
      source?: string;
      image?: string;
      thumb?: string;
      summary?: string;
      collections?: string[];
      people?: string[];
      places?: string[];
    };
    return {
      slug: item.slug,
      title: f.title,
      documentType: f.documentType,
      date: f.date ?? "",
      source: f.source ?? "",
      image: f.image ?? "",
      thumb: f.thumb ?? f.image ?? "",
      summary: f.summary ?? "",
      collectionsCount: (f.collections ?? []).length,
      placeCount: (f.places ?? []).length,
      peopleCount: (f.people ?? []).length,
    };
  });

  return <DocumentsBrowser docs={docs} />;
}
