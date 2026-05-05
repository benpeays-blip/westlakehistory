import { loadType } from "@/lib/content";
import { IndexList } from "@/app/components/IndexList";

export const metadata = {
  title: "Collections — Westlake History",
  description:
    "Community-group collections that contribute to the Westlake, Texas archive.",
};

export default async function CollectionsIndex() {
  const items = await loadType("collections");
  return (
    <IndexList
      type="collections"
      title="Collections"
      description="Each collection is curated by a community group — a historical society, a school, a church, a family. The archive grows as new groups contribute."
      items={items}
    />
  );
}
