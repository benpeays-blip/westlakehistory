import { getEpisodes } from "@/lib/buzzsprout";
import { buildChapterIndex } from "@/lib/chapters";
import { Hero } from "./components/Hero";
import { Voices } from "./components/Voices";
import { MapTeaser } from "./components/MapTeaser";
import { Chapters } from "./components/Chapters";
import { Archive } from "./components/Archive";

export const revalidate = 3600;

export default async function Home() {
  let episodes = await safeEpisodes();
  const chapters = buildChapterIndex(episodes)
    .sort((a, b) => b.episodeCount - a.episodeCount)
    .slice(0, 6)
    .sort((a, b) => a.chapter - b.chapter);

  const hero = episodes[0] ?? null;
  const voices = episodes.slice(1, 4);

  return (
    <>
      <Hero episode={hero} />
      <Voices episodes={voices} totalCount={episodes.length} />
      <MapTeaser />
      <Chapters chapters={chapters} />
      <Archive />
    </>
  );
}

async function safeEpisodes() {
  try {
    return await getEpisodes();
  } catch (err) {
    // Don't crash the homepage if Buzzsprout is briefly unavailable.
    // Falls through to empty render — the components show graceful fallbacks.
    console.error("[westlakehistory] Buzzsprout fetch failed:", err);
    return [];
  }
}
