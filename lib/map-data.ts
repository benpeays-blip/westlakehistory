/**
 * Build-time loader that turns place MDX into the serializable shape the
 * /maps page client component needs. Server-only — this file uses `fs` via
 * the content loader, so client components must import types from
 * lib/map-types.ts instead.
 */

import "server-only";
import { loadType } from "./content";
import type { MapLayer, MapPin } from "./map-types";

export async function loadMapPins(): Promise<MapPin[]> {
  const items = await loadType("places");
  const pins: MapPin[] = [];

  for (const item of items) {
    const f = item.frontmatter as {
      title?: string;
      summary?: string;
      placeType?: string;
      coordinates?: { lat: number; lng: number };
      yearBuilt?: number | string;
      yearDemolished?: number | string;
      historicalNames?: string[];
    };
    if (!f.coordinates) continue;
    pins.push({
      slug: item.slug,
      title: f.title ?? item.slug,
      href: `/places/${item.slug}`,
      summary: f.summary ?? "",
      placeType: f.placeType ?? "Place",
      layer: layerForType(f.placeType),
      lat: f.coordinates.lat,
      lng: f.coordinates.lng,
      yearBuilt: toYear(f.yearBuilt),
      yearDemolished: toYear(f.yearDemolished),
      historicalNames: f.historicalNames,
    });
  }
  return pins;
}

function layerForType(t: string | undefined): MapLayer {
  switch ((t ?? "").toLowerCase()) {
    case "ranch":
    case "land grant":
    case "land_grant":
      return "ranches-land-grants";
    case "road":
    case "bridge":
    case "trail":
    case "dam":
      return "roads-bridges";
    case "school":
    case "schoolhouse":
      return "schools";
    case "lodge":
    case "building":
    case "house":
    case "church":
    case "civic":
    case "store":
      return "buildings";
    default:
      return "buildings";
  }
}

function toYear(v: number | string | undefined): number | undefined {
  if (v == null) return undefined;
  const n = typeof v === "number" ? v : parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}
