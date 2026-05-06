/**
 * Loader for the Eanes History Center / Westbank CLD partner collection.
 *
 * Items live in /content/partners/ehc-items.json — descriptive metadata
 * only, with thumbnails and full-record links pointing back to The Portal
 * to Texas History (UNT Libraries) where the actual scans are hosted.
 * We do not re-host UNT's media; this catalog is a discovery layer.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_PATH = path.join(
  process.cwd(),
  "content",
  "partners",
  "ehc-items.json",
);

const UNT_BASE = "https://texashistory.unt.edu/ark:/67531";

export interface EhcItem {
  ark: string;
  title: string;
  kind: ItemKind;
  summary: string;
  tags: string[];
  /** Full UNT record URL — where the scan and provenance live. */
  recordUrl: string;
  /** UNT-hosted thumbnail URL. */
  thumbUrl: string;
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
  items: EhcItem[];
}

export async function loadEhcCollection(): Promise<EhcCollection> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const json = JSON.parse(raw) as {
    _attribution: string;
    _partnerUrl: string;
    _lastFetched: string;
    items: Array<{
      ark: string;
      title: string;
      kind: ItemKind;
      summary: string;
      tags: string[];
    }>;
  };
  return {
    attribution: json._attribution,
    partnerUrl: json._partnerUrl,
    lastFetched: json._lastFetched,
    items: json.items.map((i) => ({
      ...i,
      recordUrl: `${UNT_BASE}/${i.ark}/`,
      thumbUrl: `${UNT_BASE}/${i.ark}/small/`,
    })),
  };
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
