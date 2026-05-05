import { loadType } from "@/lib/content";
import { IndexList } from "@/app/components/IndexList";

export const metadata = {
  title: "People — Westlake History",
  description:
    "Biographies and family histories from the Westlake, Texas archive.",
};

export default async function PeopleIndex() {
  const items = await loadType("people");
  return (
    <IndexList
      type="people"
      title="People"
      description="Biographies and family histories — the residents, ranchers, builders, teachers, and storytellers who made Westlake."
      items={items}
    />
  );
}
