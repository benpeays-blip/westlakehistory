import { loadType } from "@/lib/content";
import { IndexList } from "@/app/components/IndexList";

export const metadata = {
  title: "Meetings — Westlake History",
  description: "History-club meeting minutes and recordings.",
};

export default async function MeetingsIndex() {
  const items = await loadType("meetings");
  return (
    <IndexList
      type="meetings"
      title="Meetings"
      description="Minutes and recordings from the Westlake Historical Society and the Eanes History Group, plus the meetings of any other community group that contributes to the archive."
      items={items}
    />
  );
}
