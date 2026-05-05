/**
 * Pure types + constants for the historical map. Safe to import from client
 * components — keeps the server-only loader in lib/map-data.ts out of the
 * client bundle.
 */

export interface MapPin {
  slug: string;
  title: string;
  href: string;
  summary: string;
  placeType: string;
  layer: MapLayer;
  lat: number;
  lng: number;
  yearBuilt?: number;
  yearDemolished?: number;
  historicalNames?: string[];
}

export type MapLayer =
  | "ranches-land-grants"
  | "roads-bridges"
  | "schools"
  | "buildings"
  | "city-limits"
  | "modern";

export const LAYER_ORDER: MapLayer[] = [
  "ranches-land-grants",
  "roads-bridges",
  "schools",
  "buildings",
  "city-limits",
  "modern",
];

export const LAYER_LABEL: Record<MapLayer, string> = {
  "ranches-land-grants": "Ranches & Land Grants",
  "roads-bridges": "Roads & Bridges",
  schools: "Schools",
  buildings: "Buildings",
  "city-limits": "City Limits",
  modern: "Aerial Imagery (Modern)",
};

export const ERA_MARKS = [1860, 1890, 1920, 1950, 1980, 2000, 2020] as const;
export type EraMark = (typeof ERA_MARKS)[number];

export const MAP_BOUNDS = {
  sw: { lat: 30.278, lng: -97.85 },
  ne: { lat: 30.305, lng: -97.78 },
};
