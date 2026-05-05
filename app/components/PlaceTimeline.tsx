"use client";

import { useState } from "react";
import {
  MAP_BOUNDS,
  type MapPin,
} from "@/lib/map-types";

type Tab = "then" | "now" | "layered";

/**
 * Then / Now / Layered viewer for a single place.
 *
 * Three tabs:
 * - Then    historical photograph or illustration with archival caption
 * - Now     current state: status, mini-map locator
 * - Layered same mini-map with a toggleable historical-survey overlay
 *
 * Until real archival images land, the Then panel shows a stylized
 * placeholder keyed to placeType. The mini-map shares the same coordinate
 * projection as the main /maps page — when MapLibre lands there, this
 * component picks it up automatically.
 */
export function PlaceTimeline({ pin }: { pin: MapPin }) {
  const [tab, setTab] = useState<Tab>("then");
  const [overlay, setOverlay] = useState(true);

  return (
    <section className="mt-8 border border-rule bg-paper">
      <div role="tablist" aria-label="Place views" className="flex border-b border-rule">
        {(
          [
            ["then", "Then"],
            ["now", "Now"],
            ["layered", "Layered"],
          ] as const
        ).map(([id, label]) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(id)}
              className={
                "flex-1 px-5 py-4 text-[14px] font-medium transition-colors " +
                (isActive
                  ? "bg-paper text-oak border-b-2 border-oak"
                  : "bg-limestone/40 text-ink-mute hover:bg-limestone hover:text-ink")
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="p-6 md:p-8">
        {tab === "then" ? <ThenPanel pin={pin} /> : null}
        {tab === "now" ? <NowPanel pin={pin} /> : null}
        {tab === "layered" ? (
          <LayeredPanel pin={pin} overlay={overlay} setOverlay={setOverlay} />
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function ThenPanel({ pin }: { pin: MapPin }) {
  return (
    <figure className="border border-rule">
      <div className="aspect-[16/9] bg-limestone">
        <PlaceholderArt placeType={pin.placeType} />
      </div>
      <figcaption className="border-t border-rule px-5 py-4 text-[13px] leading-snug text-ink-mute">
        <span className="text-ink">{pin.title}</span>
        {pin.yearBuilt ? `, ca. ${pin.yearBuilt}` : ""}
        {pin.historicalNames?.length
          ? ` · also known as ${pin.historicalNames.join(", ")}`
          : ""}
        . <em className="italic">Photograph forthcoming — placeholder illustration based on the place type.</em>
      </figcaption>
    </figure>
  );
}

function NowPanel({ pin }: { pin: MapPin }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <MiniMap pin={pin} overlay={false} />
      <div>
        <p className="label-archival text-cedar">Present status</p>
        <p className="mt-3 font-display text-[20px] leading-tight text-ink">
          {pin.title}
        </p>
        <p className="meta-line mt-2 text-ink-mute">
          {pin.placeType}
          {pin.yearBuilt ? ` · built ${pin.yearBuilt}` : ""}
          {pin.yearDemolished ? ` · demolished ${pin.yearDemolished}` : ""}
        </p>
        <p className="mt-5 text-[15px] leading-snug text-ink">
          {pin.summary || "No present-day description has been written yet."}
        </p>
      </div>
    </div>
  );
}

function LayeredPanel({
  pin,
  overlay,
  setOverlay,
}: {
  pin: MapPin;
  overlay: boolean;
  setOverlay: (b: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[14px] text-ink-mute">
          Modern roads and the river, with a stylized layer suggesting where
          the 1944 Westlake survey would sit. A georeferenced overlay of the
          actual historical map will replace the layer when it&apos;s
          digitized.
        </p>
        <label className="flex shrink-0 items-center gap-2 font-mono text-[12px] text-ink-mute">
          <input
            type="checkbox"
            checked={overlay}
            onChange={(e) => setOverlay(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-oak"
          />
          <span>1944 overlay</span>
        </label>
      </div>
      <MiniMap pin={pin} overlay={overlay} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mini-map: shared coordinate projection, single tile placeholder.          */
/* -------------------------------------------------------------------------- */

const VB_W = 600;
const VB_H = 400;

function project(lng: number, lat: number) {
  const { sw, ne } = MAP_BOUNDS;
  return {
    x: ((lng - sw.lng) / (ne.lng - sw.lng)) * VB_W,
    y: (1 - (lat - sw.lat) / (ne.lat - sw.lat)) * VB_H,
  };
}

function MiniMap({ pin, overlay }: { pin: MapPin; overlay: boolean }) {
  const p = project(pin.lng, pin.lat);
  return (
    <div className="aspect-[3/2] border border-rule bg-[#e8dfc8]">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <pattern id="mm-paper" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#e8dfc8" />
            <circle cx="1" cy="1" r="0.4" fill="#cabe9f" opacity="0.45" />
          </pattern>
        </defs>
        <rect width={VB_W} height={VB_H} fill="url(#mm-paper)" />

        {/* River */}
        <path
          d="M0,310 Q120,290 240,300 Q360,310 480,295 Q540,288 600,295 L600,335 Q540,338 480,335 Q360,330 240,340 Q120,348 0,338 Z"
          fill="#a4b4a8"
          opacity="0.7"
        />
        {/* Roads */}
        <path
          d="M10,255 Q150,245 300,250 Q450,255 590,248"
          stroke="#9c4a2a"
          strokeWidth="1.6"
          fill="none"
          opacity="0.6"
        />
        <path d="M410,90 L410,360" stroke="#9c4a2a" strokeWidth="1.2" fill="none" opacity="0.45" />

        {/* 1944 overlay — schematic plat lines */}
        {overlay ? (
          <g stroke="#6e3019" strokeWidth="0.45" fill="none" opacity="0.55">
            <path d="M40,40 L560,40 L560,360 L40,360 Z" />
            <path d="M40,140 L560,140" />
            <path d="M40,240 L560,240" />
            <path d="M180,40 L180,360" />
            <path d="M320,40 L320,360" />
            <path d="M460,40 L460,360" />
            <text
              x="50"
              y="60"
              fontFamily="Libre Baskerville, serif"
              fontSize="11"
              fontStyle="italic"
              fill="#6e3019"
            >
              Survey of Westlake · 1944
            </text>
          </g>
        ) : null}

        {/* Pin */}
        <g transform={`translate(${p.x} ${p.y})`}>
          <circle r="14" fill="#f8f5ee" opacity="0.85" />
          <circle r="8" fill="#9c4a2a" stroke="#f8f5ee" strokeWidth="2" />
          <circle r="2.5" fill="#f8f5ee" />
        </g>

        <rect
          x="3"
          y="3"
          width={VB_W - 6}
          height={VB_H - 6}
          fill="none"
          stroke="#6e3019"
          strokeWidth="0.8"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Placeholder art keyed to placeType                                         */
/* -------------------------------------------------------------------------- */

function PlaceholderArt({ placeType }: { placeType: string }) {
  const t = placeType.toLowerCase();

  if (t === "ranch") {
    return (
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
        <rect width="1600" height="900" fill="#d8d1c4" />
        <path d="M0,640 Q260,600 520,615 T1040,610 T1600,625 L1600,900 L0,900 Z" fill="#8a7a62" opacity="0.7" />
        <path d="M0,720 Q300,680 600,695 T1200,690 T1600,710 L1600,900 L0,900 Z" fill="#5d513e" opacity="0.85" />
        <g transform="translate(600 600)" fill="#3a3225">
          <polygon points="0,80 140,20 280,80 280,180 0,180" />
          <rect x="120" y="110" width="40" height="70" fill="#1f2421" />
        </g>
        <g transform="translate(1180 580)" fill="#1f2421" opacity="0.85">
          <ellipse cx="0" cy="0" rx="50" ry="38" />
          <rect x="-2" y="0" width="4" height="80" />
        </g>
      </svg>
    );
  }

  if (t === "road" || t === "trail") {
    return (
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
        <rect width="1600" height="900" fill="#cabe9f" />
        <path d="M0,640 Q260,610 520,625 T1040,620 T1600,635 L1600,900 L0,900 Z" fill="#8a7a62" opacity="0.6" />
        <path
          d="M-100,500 C 200,500 400,650 700,650 S 1300,500 1700,500 L 1700,720 C 1300,720 900,720 700,720 S 200,720 -100,720 Z"
          fill="#3a3225"
          opacity="0.85"
        />
        <path
          d="M-100,610 C 200,610 400,650 700,650 S 1300,610 1700,610"
          stroke="#cabe9f"
          strokeWidth="6"
          strokeDasharray="40 40"
          fill="none"
          opacity="0.6"
        />
      </svg>
    );
  }

  if (t === "lodge" || t === "building" || t === "house") {
    return (
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
        <rect width="1600" height="900" fill="#d8d1c4" />
        <path d="M0,640 Q260,600 520,615 T1040,610 T1600,625 L1600,900 L0,900 Z" fill="#8a7a62" opacity="0.7" />
        <g transform="translate(560 380)" fill="#3a3225">
          <polygon points="0,180 240,80 480,180 480,420 0,420" />
          <rect x="200" y="280" width="80" height="140" fill="#1f2421" />
          <rect x="60" y="220" width="60" height="60" fill="#1f2421" opacity="0.7" />
          <rect x="360" y="220" width="60" height="60" fill="#1f2421" opacity="0.7" />
          <polygon points="-30,180 240,40 510,180 480,180 240,80 0,180" fill="#1f2421" />
          <rect x="380" y="60" width="32" height="120" fill="#1f2421" />
        </g>
      </svg>
    );
  }

  if (t === "school" || t === "schoolhouse") {
    return (
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
        <rect width="1600" height="900" fill="#d8d1c4" />
        <path d="M0,720 Q400,700 800,710 Q1200,720 1600,710 L1600,900 L0,900 Z" fill="#8a7a62" opacity="0.7" />
        <g transform="translate(540 360)" fill="#3a3225">
          <rect x="0" y="120" width="520" height="280" />
          <polygon points="-30,120 260,30 550,120" fill="#1f2421" />
          <rect x="60" y="180" width="80" height="120" fill="#cabe9f" />
          <rect x="220" y="180" width="80" height="120" fill="#cabe9f" />
          <rect x="380" y="180" width="80" height="120" fill="#cabe9f" />
          <rect x="240" y="80" width="40" height="60" fill="#1f2421" />
          <rect x="252" y="58" width="16" height="22" fill="#1f2421" />
        </g>
      </svg>
    );
  }

  if (t === "dam") {
    return (
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
        <rect width="1600" height="900" fill="#a4b4a8" />
        <rect y="0" width="1600" height="540" fill="#7a8d80" opacity="0.55" />
        <path
          d="M0,540 L600,540 L740,420 L860,420 L1000,540 L1600,540 L1600,900 L0,900 Z"
          fill="#3a3225"
        />
        <path d="M740,420 L740,540 M820,420 L820,540" stroke="#1f2421" strokeWidth="3" />
        <path d="M0,560 L600,560 L740,460 L860,460 L1000,560 L1600,560" stroke="#cabe9f" strokeWidth="2" fill="none" opacity="0.4" />
      </svg>
    );
  }

  // generic
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="1600" height="900" fill="#d8d1c4" />
      <path d="M0,640 Q260,600 520,615 T1040,610 T1600,625 L1600,900 L0,900 Z" fill="#8a7a62" opacity="0.7" />
      <path d="M0,720 Q300,680 600,695 T1200,690 T1600,710 L1600,900 L0,900 Z" fill="#5d513e" opacity="0.85" />
    </svg>
  );
}
