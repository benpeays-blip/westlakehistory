import { loadAllContent, type LoadedItem } from "@/lib/content";
import { HomeHero } from "./components/HomeHero";
import { EntityNav } from "./components/EntityNav";
import { FeaturedThisMonth } from "./components/FeaturedThisMonth";

export const revalidate = 3600;

export default async function Home() {
  const all = await loadAllContent();

  // Pick representatives for the Featured grid: prefer items flagged
  // `featured: true`, fall back to the most recent of each type.
  const story = pickFeatured(all.stories);
  const audio = pickFeatured(all.audio);
  const place = pickFeatured(all.places);
  const document = pickFeatured(all.documents);
  const collection = pickFeatured(all.collections);

  return (
    <>
      <HomeHero />
      <EntityNav />
      <FeaturedThisMonth
        story={story}
        audio={audio}
        place={place}
        document={document}
        collection={collection}
      />
    </>
  );
}

function pickFeatured(items: LoadedItem[]): LoadedItem | null {
  if (!items.length) return null;
  const flagged = items.find(
    (i) => (i.frontmatter as { featured?: boolean }).featured === true,
  );
  if (flagged) return flagged;
  // Most recent by date when available, else alphabetical.
  return [...items].sort((a, b) => {
    const ad = (a.frontmatter as { date?: string }).date ?? "";
    const bd = (b.frontmatter as { date?: string }).date ?? "";
    return bd.localeCompare(ad);
  })[0];
}
