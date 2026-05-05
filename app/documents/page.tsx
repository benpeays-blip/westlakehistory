import { loadType } from "@/lib/content";
import { IndexList } from "@/app/components/IndexList";

export const metadata = {
  title: "Documents — Westlake History",
  description:
    "Photographs, letters, deeds, maps, news clippings, and other primary documents from the Westlake, Texas archive.",
};

export default async function DocumentsIndex() {
  const items = await loadType("documents");
  return (
    <IndexList
      type="documents"
      title="Documents"
      description="Photographs, letters, deeds, news clippings, and other primary materials — each with its source citation and rights status."
      items={items}
    />
  );
}
