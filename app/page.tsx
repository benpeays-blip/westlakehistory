import { loadAllContent, type LoadedItem } from "@/lib/content";
import { HomeHero } from "./components/HomeHero";
import { EntityNav } from "./components/EntityNav";
import { FeaturedThisMonth } from "./components/FeaturedThisMonth";
import { FromTheArchive } from "./components/FromTheArchive";

export const revalidate = 3600;

export default async function Home() {
  const all = await loadAllContent();

  // Pick representatives for the Featured grid: prefer items flagged
  // `featured: true`, fall back to the most recent of each type. The
  // document slot prefers items that actually have an image, so the
  // homepage card lands real photography when possible.
  const story = pickFeatured(all.stories);
  const audio = pickFeatured(all.audio);
  const place = pickFeatured(all.places);
  const document = pickFeaturedWithImage(all.documents);
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
      <FromTheArchive documents={all.documents} cap={12} />
    </>
  );
}

function pickFeatured(items: LoadedItem[]): LoadedItem | null {
  if (!items.length) return null;
  const flagged = items.find(
    (i) => (i.frontmatter as { featured?: boolean }).featured === true,
  );
  if (flagged) return flagged;
  return [...items].sort((a, b) => {
    const ad = (a.frontmatter as { date?: string }).date ?? "";
    const bd = (b.frontmatter as { date?: string }).date ?? "";
    return bd.localeCompare(ad);
  })[0];
}

function pickFeaturedWithImage(items: LoadedItem[]): LoadedItem | null {
  if (!items.length) return null;
  // Prefer flagged + has image, then any with image, then anything.
  const hasImage = (i: LoadedItem) => {
    const f = i.frontmatter as { image?: string; thumb?: string };
    return Boolean(f.image || f.thumb);
  };
  const flagged = items.find(
    (i) =>
      (i.frontmatter as { featured?: boolean }).featured === true && hasImage(i),
  );
  if (flagged) return flagged;
  const anyImage = items.find(hasImage);
  if (anyImage) return anyImage;
  return pickFeatured(items);
}
