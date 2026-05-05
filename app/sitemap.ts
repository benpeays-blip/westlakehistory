import type { MetadataRoute } from "next";
import { loadAllContent } from "@/lib/content";
import { CONTENT_TYPES } from "@/lib/schemas";

const BASE = "https://westlakehistory.com";

/**
 * Build-time sitemap covering every static route plus every content
 * detail page. Search engines and the Internet Archive both consume
 * /sitemap.xml — important for an archive that wants to be discoverable
 * decades from now.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await loadAllContent();
  const entries: MetadataRoute.Sitemap = [];

  // Static routes
  const staticRoutes = [
    "",
    "/stories",
    "/people",
    "/places",
    "/maps",
    "/documents",
    "/audio",
    "/collections",
    "/meetings",
    "/search",
    "/about",
    "/contribute",
  ];
  for (const path of staticRoutes) {
    entries.push({
      url: `${BASE}${path}`,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.7,
    });
  }

  // Content detail routes
  for (const type of CONTENT_TYPES) {
    for (const item of all[type]) {
      entries.push({
        url: `${BASE}/${type}/${item.slug}`,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
