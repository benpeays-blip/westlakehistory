import { loadType } from "@/lib/content";
import { IndexList } from "@/app/components/IndexList";

export const metadata = {
  title: "Eras — Westlake History",
  description:
    "Time periods that frame the history of Westlake, Texas — from the founding-years land grants through the present.",
};

export default async function ErasIndex() {
  const items = await loadType("eras");
  // Sort eras chronologically by yearStart for a meaningful timeline read.
  const sorted = [...items].sort(
    (a, b) =>
      ((a.frontmatter as { yearStart?: number }).yearStart ?? 0) -
      ((b.frontmatter as { yearStart?: number }).yearStart ?? 0),
  );
  return (
    <IndexList
      type="eras"
      title="Eras"
      description="Time periods that frame the rest of the archive — every story, place, and person belongs to one or more. Browse the eras to read across them in chronological order."
      items={sorted}
    />
  );
}
