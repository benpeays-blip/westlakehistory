/**
 * Zod schemas for the 8 content types in /content/.
 *
 * Schemas validate frontmatter only — the MDX body is loaded separately and
 * compiled by next-mdx-remote at render time. The build fails if any
 * frontmatter doesn't match the schema (see lib/content.ts).
 *
 * Cross-references are slugs. After all content is loaded, lib/content.ts
 * runs a second pass to verify every referenced slug actually exists; missing
 * references log warnings and are dropped from the rendered links.
 */

import { z } from "zod";

// --- Common helpers --------------------------------------------------------

const slug = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9][a-z0-9-]*$/,
    "must be kebab-case (lowercase letters, digits, hyphens)",
  );

const isoDateLike = z
  .string()
  .regex(
    /^\d{4}(-\d{2}(-\d{2})?)?$/,
    "must be YYYY, YYYY-MM, or YYYY-MM-DD",
  );

const image = z.object({
  src: z.string().min(1),
  alt: z.string().min(1, "alt text is required for accessibility"),
  caption: z.string().optional(),
  credit: z.string().min(1, "image credit is required"),
  year: z.number().int().optional(),
});

const source = z.object({
  type: z.enum([
    "interview",
    "newspaper",
    "book",
    "letter",
    "deed",
    "photo",
    "podcast",
    "video",
    "meeting",
    "personal",
    "web",
    "other",
  ]),
  citation: z.string().min(1),
  url: z.url().optional(),
});

const rights = z.enum([
  "public_domain",
  "fair_use",
  "permission_granted",
  "research_only",
]);

// --- Story -----------------------------------------------------------------

export const storySchema = z.object({
  title: z.string().min(1),
  slug,
  chapter: z.number().int().optional(),       // Emmett's system; null for non-podcast
  chapterTitle: z.string().optional(),
  episode: z.number().int().optional(),
  collection: slug.optional(),                // Umbrella: school, church, EHG, etc.
  storyteller: slug,                          // Person slug
  recordedDate: isoDateLike.optional(),
  publishedDate: isoDateLike,
  era: slug,                                  // Era slug
  people: z.array(slug).default([]),          // Person slugs
  places: z.array(slug).default([]),          // Place slugs
  audio: slug.optional(),                     // Audio slug if there's a recording
  video: slug.optional(),                     // Video collection ref (Phase 3)
  hero: image.optional(),
  excerpt: z.string().min(1).max(360),
  sources: z.array(source).min(1, "every story needs at least one source"),
});
export type Story = z.infer<typeof storySchema>;

// --- Person ----------------------------------------------------------------

export const personSchema = z.object({
  name: z.string().min(1),
  slug,
  born: isoDateLike.optional(),
  died: isoDateLike.optional(),
  roles: z.array(z.string()).default([]),
  birthplace: z.string().optional(),
  portrait: image.optional(),
  relatedPeople: z.array(slug).default([]),
  relatedPlaces: z.array(slug).default([]),
  collection: slug.optional(),
  sources: z.array(source).default([]),
});
export type Person = z.infer<typeof personSchema>;

// --- Place -----------------------------------------------------------------

export const placeSchema = z.object({
  name: z.string().min(1),
  slug,
  historicalNames: z.array(z.string()).default([]),
  coordinates: z
    .tuple([
      z.number().min(-180).max(180), // lng
      z.number().min(-90).max(90),   // lat
    ])
    .describe("[longitude, latitude]"),
  yearBuilt: z.number().int().optional(),
  yearDemolished: z.number().int().optional(),
  status: z.enum(["extant", "demolished", "renamed", "unknown"]),
  era: slug,
  type: z.string().min(1).describe("ranch, lodge, bridge, road, school..."),
  photos: z.array(image).default([]),
  collection: slug.optional(),
  sources: z.array(source).default([]),
});
export type Place = z.infer<typeof placeSchema>;

// --- Era -------------------------------------------------------------------

export const eraSchema = z.object({
  name: z.string().min(1),
  slug,
  yearStart: z.number().int(),
  yearEnd: z.number().int(),
}).refine((e) => e.yearEnd >= e.yearStart, {
  message: "yearEnd must be ≥ yearStart",
  path: ["yearEnd"],
});
export type Era = z.infer<typeof eraSchema>;

// --- Document --------------------------------------------------------------

export const documentSchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.enum([
    "deed",
    "photo",
    "letter",
    "newspaper",
    "map",
    "ledger",
    "program",
    "yearbook",
    "ephemera",
    "other",
  ]),
  date: isoDateLike.optional(),
  source: z.string().min(1).describe("e.g. 'Shelton Family Collection'"),
  donor: z.string().optional(),
  scan: image,
  rights,
  relatedStories: z.array(slug).default([]),
  relatedPeople: z.array(slug).default([]),
  relatedPlaces: z.array(slug).default([]),
  collection: slug.optional(),
});
export type Document = z.infer<typeof documentSchema>;

// --- Audio -----------------------------------------------------------------

export const audioSchema = z.object({
  title: z.string().min(1),
  slug,
  source: z.enum(["podcast", "interview", "meeting"]),
  rssGuid: z.string().optional(),
  chapter: z.number().int().optional(),
  episode: z.number().int().optional(),
  duration: z.number().int().describe("seconds"),
  recordedDate: isoDateLike.optional(),
  publishedDate: isoDateLike,
  audioUrl: z.url(),
  summary: z.string().min(1).max(600),
  relatedStory: slug.optional(),
  relatedPeople: z.array(slug).default([]),
  relatedPlaces: z.array(slug).default([]),
  collection: slug.optional(),
});
export type Audio = z.infer<typeof audioSchema>;

// --- Map -------------------------------------------------------------------

export const mapSchema = z.object({
  title: z.string().min(1),
  slug,
  year: z.number().int(),
  type: z.enum(["survey", "land_grant", "topo", "road", "modern", "plat"]),
  scan: image,
  georeference: z
    .object({
      bounds: z.tuple([
        z.tuple([z.number(), z.number()]), // [swLng, swLat]
        z.tuple([z.number(), z.number()]), // [neLng, neLat]
      ]),
      rotation: z.number().optional(),
    })
    .optional(),
  source: z.string().min(1),
});
export type CartoMap = z.infer<typeof mapSchema>;

// --- Meeting ---------------------------------------------------------------

export const meetingSchema = z.object({
  title: z.string().min(1),
  slug,
  date: isoDateLike,
  location: z.string().min(1),
  attendees: z.array(z.string()).default([]),
  presenters: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  recording: slug.optional(),               // Audio slug
  collection: slug.optional(),
});
export type Meeting = z.infer<typeof meetingSchema>;

// --- Registry --------------------------------------------------------------

export const SCHEMAS = {
  stories: storySchema,
  people: personSchema,
  places: placeSchema,
  eras: eraSchema,
  documents: documentSchema,
  audio: audioSchema,
  maps: mapSchema,
  meetings: meetingSchema,
} as const;

export type ContentType = keyof typeof SCHEMAS;

export const CONTENT_TYPES: ContentType[] = [
  "stories",
  "people",
  "places",
  "eras",
  "documents",
  "audio",
  "maps",
  "meetings",
];
