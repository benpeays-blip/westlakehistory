import { loadType } from "@/lib/content";
import { IndexList } from "@/app/components/IndexList";

export const metadata = {
  title: "Places — Westlake History",
  description:
    "Historic places and landmarks of Westlake, Texas — ranches, roads, schools, churches, and buildings.",
};

export default async function PlacesIndex() {
  const items = await loadType("places");
  return (
    <IndexList
      type="places"
      title="Places"
      description="Historic places and landmarks — the ranches, roads, bridges, schools, and churches that shaped the geography of Westlake."
      items={items}
    />
  );
}
