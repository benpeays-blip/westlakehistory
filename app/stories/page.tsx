import { loadType } from "@/lib/content";
import { IndexList } from "@/app/components/IndexList";

export const metadata = {
  title: "Stories — Westlake History",
  description:
    "Essays and narratives from the archive of Westlake, Texas — the people, places, and events that shaped the town.",
};

export default async function StoriesIndex() {
  const items = await loadType("stories");
  return (
    <>
      <IndexList
        type="stories"
        title="Stories"
        description="Essays and narratives drawn from the archive — people, places, events, and the connections between them."
        items={items}
      />
      <aside className="mx-auto max-w-[1320px] border-t border-rule px-6 py-8 md:px-10">
        <p className="meta-line text-ink-mute">
          New stories as they are catalogued —{" "}
          <a
            href="/feed.xml"
            className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
          >
            subscribe via RSS
          </a>
          .
        </p>
      </aside>
    </>
  );
}
