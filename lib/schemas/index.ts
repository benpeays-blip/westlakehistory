/**
 * Zod schemas for the 9 content types in /content/.
 *
 * Schemas validate frontmatter only — the MDX body is loaded separately and
 * compiled by next-mdx-remote at render time. The build fails if any
 * frontmatter doesn't match the schema (see lib/content.ts).
 *
 * Cross-references are slugs. After all content is loaded, lib/content.ts
 * runs a second pass to verify every referenced slug actually exists; missing
 * references log warnings and are dropped from the rendered links.
 *
 * Frontmatter shape mirrors the kickoff brief — entity links use plural slug
 * arrays (people, places, stories, documents, audio, maps, collections).
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

const slugList = z.array(slug).default([]);

const isoDateLike = z
  .string()
  .regex(
    /^\d{4}(-\d{2}(-\d{2})?)?$/,
    "must be YYYY, YYYY-MM, or YYYY-MM-DD",
  );

const yearLike = z.union([z.number().int(), z.string().regex(/^\d{4}$/)]);

const coordinates = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Shared cross-reference fields for entities that can cite/link other entities.
const linkFields = {
  stories: slugList,
  people: slugList,
  places: slugList,
  documents: slugList,
  audio: slugList,
  maps: slugList,
  eras: slugList,
  collections: slugList,
};

// --- Story -----------------------------------------------------------------

export const storySchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.literal("story").optional(),
  date: isoDateLike,
  era: z.array(z.string()).default([]),    // human era labels (e.g. "1860s-1900s")
  tags: z.array(z.string()).default([]),
  summary: z.string().min(1).max(360),
  heroImage: z.string().optional(),
  heroCaption: z.string().optional(),
  people: slugList,
  places: slugList,
  documents: slugList,
  audio: slugList,
  maps: slugList,
  collections: slugList,
  sourceNotes: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  byline: z.string().default("Westlake Historical Society"),
});
export type Story = z.infer<typeof storySchema>;

// --- Person ----------------------------------------------------------------

export const personSchema = z.object({
  title: z.string().min(1),                // person's display name
  slug,
  type: z.literal("person").optional(),
  birthDate: yearLike.optional(),
  deathDate: yearLike.optional(),
  summary: z.string().min(1).max(480),
  portrait: z.string().optional(),
  roles: z.array(z.string()).default([]),
  ...linkFields,
});
export type Person = z.infer<typeof personSchema>;

// --- Place -----------------------------------------------------------------

export const placeSchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.literal("place").optional(),
  placeType: z.string().min(1).describe("Ranch, Bridge, School, Church, Road, Subdivision..."),
  locationLabel: z.string().optional(),
  coordinates: coordinates.optional(),
  yearBuilt: yearLike.optional(),
  yearDemolished: yearLike.optional(),
  status: z.enum(["extant", "demolished", "renamed", "unknown"]).default("unknown"),
  historicalNames: z.array(z.string()).default([]),
  summary: z.string().min(1).max(480),
  ...linkFields,
});
export type Place = z.infer<typeof placeSchema>;

// --- Era -------------------------------------------------------------------

export const eraSchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.literal("era").optional(),
  yearStart: z.number().int(),
  yearEnd: z.number().int(),
  summary: z.string().min(1).max(480),
  ...linkFields,
}).refine((e) => e.yearEnd >= e.yearStart, {
  message: "yearEnd must be ≥ yearStart",
  path: ["yearEnd"],
});
export type Era = z.infer<typeof eraSchema>;

// --- Document --------------------------------------------------------------

export const documentSchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.literal("document").optional(),
  documentType: z.string().min(1).describe("Deed, Photo, Letter, Newspaper, Map, Ledger..."),
  date: isoDateLike.optional(),
  creator: z.string().optional(),
  source: z.string().min(1).describe("e.g. 'Deed Book 12, Page 45'"),
  image: z.string().optional(),
  transcription: z.string().optional().describe("path to transcription file"),
  rights: z.string().min(1),
  ...linkFields,
});
export type Document = z.infer<typeof documentSchema>;

// --- Audio -----------------------------------------------------------------

export const audioSchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.literal("audio").optional(),
  audioType: z.string().default("Oral History").describe("Oral History, Podcast, Interview..."),
  interviewee: z.string().optional(),
  interviewer: z.string().optional(),
  date: isoDateLike,
  duration: z.string().describe("MM:SS or HH:MM:SS"),
  audioFile: z.string().describe("path to MP3 or external URL"),
  portrait: z.string().optional(),
  transcript: z.string().optional().describe("path to transcript JSON"),
  rssGuid: z.string().optional(),
  summary: z.string().default(""),
  ...linkFields,
});
export type Audio = z.infer<typeof audioSchema>;

// --- Map -------------------------------------------------------------------

export const mapSchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.literal("map").optional(),
  year: z.number().int(),
  mapType: z.enum(["survey", "land_grant", "topo", "road", "modern", "plat"]),
  image: z.string().optional(),
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
  summary: z.string().min(1).max(480),
  ...linkFields,
});
export type CartoMap = z.infer<typeof mapSchema>;

// --- Meeting (history-club proceedings) ------------------------------------

export const meetingSchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.literal("meeting").optional(),
  date: isoDateLike,
  location: z.string().min(1),
  attendees: z.array(z.string()).default([]),
  presenters: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  summary: z.string().default(""),
  ...linkFields,
});
export type Meeting = z.infer<typeof meetingSchema>;

// --- Collection (community group / archive grouping) -----------------------

export const collectionSchema = z.object({
  title: z.string().min(1),
  slug,
  type: z.literal("collection").optional(),
  curator: z.string().min(1).describe("Owning group, e.g. 'Westlake Historical Society'"),
  contact: z.string().optional(),
  dateRange: z.string().optional().describe("e.g. '1860–present'"),
  summary: z.string().min(1).max(480),
  featured: z.boolean().default(false),
  ...linkFields,
});
export type Collection = z.infer<typeof collectionSchema>;

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
  collections: collectionSchema,
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
  "collections",
];

/** Singular human label for a given content type (e.g. "stories" → "Story"). */
export const TYPE_LABEL: Record<ContentType, string> = {
  stories: "Story",
  people: "Person",
  places: "Place",
  eras: "Era",
  documents: "Document",
  audio: "Audio",
  maps: "Map",
  meetings: "Meeting",
  collections: "Collection",
};
