import { getEpisodes } from "@/lib/buzzsprout";
import { HomeHero } from "./components/HomeHero";
import { EntityNav } from "./components/EntityNav";
import { FeaturedThisMonth } from "./components/FeaturedThisMonth";

export const revalidate = 3600;

export default async function Home() {
  const episodes = await safeEpisodes();
  const heroEpisode = episodes[0] ?? null;

  return (
    <>
      <HomeHero />
      <EntityNav />
      <FeaturedThisMonth heroEpisode={heroEpisode} />
    </>
  );
}

async function safeEpisodes() {
  try {
    return await getEpisodes();
  } catch (err) {
    // Don't crash the homepage if Buzzsprout is briefly unavailable.
    console.error("[westlakehistory] Buzzsprout fetch failed:", err);
    return [];
  }
}
