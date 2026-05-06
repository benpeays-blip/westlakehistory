/**
 * Loader for the Eanes History Center / Westbank CLD partner collection.
 *
 * Westlake History is the official site for this collection under
 * explicit permission from the Westbank Community Library District.
 * Item scans are mirrored locally to /public/media/ehc/ via the
 * fetch-ehc-media script; the loader prefers a local image and falls
 * back to UNT's hosted scan when the local file isn't yet on disk.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_PATH = path.join(
  process.cwd(),
  "content",
  "partners",
  "ehc-items.json",
);
const LOCAL_THUMB_DIR = path.join(process.cwd(), "public", "media", "ehc", "thumb");
const LOCAL_IMAGE_DIR = path.join(process.cwd(), "public", "media", "ehc", "image");

const UNT_BASE = "https://texashistory.unt.edu/ark:/67531";

export interface EhcItem {
  ark: string;
  title: string;
  kind: ItemKind;
  summary: string;
  tags: string[];
  /** Full UNT record URL — where the original record + provenance live. */
  recordUrl: string;
  /** Image URL to display on the EHC page (local mirror when present, else UNT). */
  thumbUrl: string;
  /** Larger image for detail views (local mirror when present, else UNT). */
  imageUrl: string;
  /** Whether the scan is mirrored locally. */
  mirrored: boolean;
}

export type ItemKind =
  | "photograph"
  | "letter"
  | "interview"
  | "interview-notes"
  | "oral-history"
  | "essay"
  | "manuscript"
  | "illustration"
  | "newspaper"
  | "family-record";

export interface EhcCollection {
  attribution: string;
  partnerUrl: string;
  lastFetched: string;
  permission?: string;
  items: EhcItem[];
}

export async function loadEhcCollection(): Promise<EhcCollection> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const json = JSON.parse(raw) as {
    _attribution: string;
    _partnerUrl: string;
    _lastFetched: string;
    _permission?: string;
    items: Array<{
      ark: string;
      title: string;
      kind: ItemKind;
      summary: string;
      tags: string[];
    }>;
  };

  // Discover which scans are mirrored locally so the page can prefer them.
  const [thumbsLocal, imagesLocal] = await Promise.all([
    safeListJpgArks(LOCAL_THUMB_DIR),
    safeListJpgArks(LOCAL_IMAGE_DIR),
  ]);

  return {
    attribution: json._attribution,
    partnerUrl: json._partnerUrl,
    lastFetched: json._lastFetched,
    permission: json._permission,
    items: json.items.map((i) => {
      const mirrored = thumbsLocal.has(i.ark) || imagesLocal.has(i.ark);
      return {
        ...i,
        recordUrl: `${UNT_BASE}/${i.ark}/`,
        thumbUrl: thumbsLocal.has(i.ark)
          ? `/media/ehc/thumb/${i.ark}.jpg`
          : `${UNT_BASE}/${i.ark}/small/`,
        imageUrl: imagesLocal.has(i.ark)
          ? `/media/ehc/image/${i.ark}.jpg`
          : `${UNT_BASE}/${i.ark}/m1/`,
        mirrored,
      };
    }),
  };
}

async function safeListJpgArks(dir: string): Promise<Set<string>> {
  try {
    const names = await fs.readdir(dir);
    return new Set(
      names
        .filter((n) => n.endsWith(".jpg"))
        .map((n) => n.replace(/\.jpg$/, "")),
    );
  } catch {
    return new Set();
  }
}

/** Group items by kind for the gallery's category sections. */
export function groupByKind(items: EhcItem[]): Record<ItemKind, EhcItem[]> {
  const out = {} as Record<ItemKind, EhcItem[]>;
  for (const item of items) {
    (out[item.kind] ??= []).push(item);
  }
  return out;
}

export const KIND_LABELS: Record<ItemKind, string> = {
  photograph: "Photographs",
  letter: "Letters",
  interview: "Interviews",
  "interview-notes": "Interview Notes",
  "oral-history": "Oral Histories",
  essay: "Essays & Reports",
  manuscript: "Manuscripts",
  illustration: "Illustrations",
  newspaper: "Newspaper",
  "family-record": "Family Records",
};

export const KIND_ORDER: ItemKind[] = [
  "photograph",
  "illustration",
  "oral-history",
  "interview",
  "interview-notes",
  "letter",
  "essay",
  "manuscript",
  "newspaper",
  "family-record",
];
