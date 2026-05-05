"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ERA_MARKS,
  LAYER_LABEL,
  LAYER_ORDER,
  MAP_BOUNDS,
  type MapLayer,
  type MapPin,
} from "@/lib/map-types";

/**
 * Stylized historical-archive map. Real (lat, lng) coordinates from
 * /content/places/*.mdx are projected onto an SVG canvas with a
 * surveyor's-paper aesthetic. The brief allows a structured visual
 * mockup at this stage; swapping in MapLibre + OpenFreeMap tiles is a
 * later task — the projection function and pin component already work
 * in real lat/lng so the swap is local.
 */
export function HistoricalMap({ pins }: { pins: MapPin[] }) {
  const [eraIndex, setEraIndex] = useState(ERA_MARKS.length - 1); // default: today
  const era = ERA_MARKS[eraIndex];
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(
    () => new Set(LAYER_ORDER),
  );
  const [selected, setSelected] = useState<MapPin | null>(null);

  const visible = useMemo(
    () =>
      pins.filter((p) => {
        if (!activeLayers.has(p.layer)) return false;
        if (p.yearBuilt != null && p.yearBuilt > era) return false;
        if (p.yearDemolished != null && p.yearDemolished < era) return false;
        return true;
      }),
    [pins, era, activeLayers],
  );

  const toggleLayer = (layer: MapLayer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  return (
    <div className="border border-rule bg-paper">
      <Timeline value={eraIndex} onChange={setEraIndex} era={era} />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <LayerPanel
          activeLayers={activeLayers}
          onToggle={toggleLayer}
          pins={pins}
          era={era}
        />
        <div className="relative aspect-[4/3] border-t border-rule bg-[#e8dfc8] lg:border-l lg:border-t-0">
          <MapCanvas
            pins={visible}
            selectedSlug={selected?.slug ?? null}
            onSelect={setSelected}
          />
          <ZoomControls />
          <CompassRose />
          <ScaleBar />
        </div>
      </div>

      {selected ? (
        <PinDrawer pin={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                   */
/* -------------------------------------------------------------------------- */

function Timeline({
  value,
  onChange,
  era,
}: {
  value: number;
  onChange: (i: number) => void;
  era: number;
}) {
  return (
    <div className="border-b border-rule px-6 py-5 md:px-8">
      <div className="flex items-baseline justify-between gap-6">
        <div>
          <p className="label-archival text-cedar">West Lake Area Over Time</p>
          <p className="mt-1 font-display text-[18px] text-ink">
            Showing pins through{" "}
            <span className="font-mono font-medium">{era}</span>
          </p>
        </div>
        <p className="meta-line text-ink-mute">
          Drag to scrub history
        </p>
      </div>

      <div className="relative mt-6 px-1">
        <div className="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-rule" />
        <input
          type="range"
          min={0}
          max={ERA_MARKS.length - 1}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 h-6 w-full cursor-pointer accent-oak"
          aria-label="Era timeline"
        />
        <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-mute">
          {ERA_MARKS.map((y, i) => (
            <button
              key={y}
              type="button"
              onClick={() => onChange(i)}
              className={
                "transition-colors hover:text-oak " +
                (i === value ? "text-oak" : "")
              }
            >
              {y === ERA_MARKS[ERA_MARKS.length - 1] ? "Today" : y}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Layer panel                                                                */
/* -------------------------------------------------------------------------- */

function LayerPanel({
  activeLayers,
  onToggle,
  pins,
  era,
}: {
  activeLayers: Set<MapLayer>;
  onToggle: (layer: MapLayer) => void;
  pins: MapPin[];
  era: number;
}) {
  return (
    <div className="border-b border-rule px-6 py-6 md:px-7 lg:border-b-0 lg:border-r lg:border-rule">
      <p className="label-archival mb-4 text-cedar">Layers</p>
      <ul className="space-y-3">
        {LAYER_ORDER.map((layer) => {
          const count = pins.filter(
            (p) =>
              p.layer === layer &&
              (p.yearBuilt == null || p.yearBuilt <= era) &&
              (p.yearDemolished == null || p.yearDemolished >= era),
          ).length;
          const active = activeLayers.has(layer);
          return (
            <li key={layer}>
              <label className="group flex cursor-pointer items-center justify-between gap-3 text-[14px] text-ink">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggle(layer)}
                    className="h-4 w-4 cursor-pointer accent-oak"
                  />
                  <span
                    className={
                      "transition-colors group-hover:text-oak " +
                      (active ? "" : "text-ink-mute")
                    }
                  >
                    {LAYER_LABEL[layer]}
                  </span>
                </span>
                {count > 0 ? (
                  <span className="meta-line text-[11px] text-ink-mute">
                    {count}
                  </span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>

      <p className="meta-line mt-7 text-[11px] leading-relaxed text-ink-mute">
        Click any pin to read its story. Real coordinates from the place
        records — the surveyor's-paper canvas is a placeholder while we
        wire georeferenced overlays.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Map canvas                                                                 */
/* -------------------------------------------------------------------------- */

const VIEWBOX_W = 1200;
const VIEWBOX_H = 900;

function project(lng: number, lat: number): { x: number; y: number } {
  const { sw, ne } = MAP_BOUNDS;
  const x = ((lng - sw.lng) / (ne.lng - sw.lng)) * VIEWBOX_W;
  const y = (1 - (lat - sw.lat) / (ne.lat - sw.lat)) * VIEWBOX_H;
  return { x, y };
}

function MapCanvas({
  pins,
  selectedSlug,
  onSelect,
}: {
  pins: MapPin[];
  selectedSlug: string | null;
  onSelect: (p: MapPin) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Stylized historical map of the West Lake area, with archival pins"
    >
      <defs>
        <pattern id="paper" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#e8dfc8" />
          <circle cx="1" cy="1" r="0.4" fill="#cabe9f" opacity="0.45" />
        </pattern>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 0 8 L 8 0" stroke="#a89578" strokeWidth="0.3" opacity="0.25" />
        </pattern>
      </defs>

      <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#paper)" />
      <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#hatch)" />

      {/* Lake Austin running roughly NE → SW across the lower half */}
      <path
        d="M0,720 Q200,690 400,705 Q600,720 800,700 Q980,680 1200,690 L1200,790 Q980,790 800,800 Q600,810 400,795 Q200,780 0,795 Z"
        fill="#a4b4a8"
        opacity="0.7"
      />
      <path
        d="M0,725 Q200,700 400,710 Q600,725 800,705 Q980,690 1200,700"
        stroke="#6b7a5e"
        strokeWidth="0.6"
        fill="none"
        opacity="0.7"
      />

      {/* Contour suggestions */}
      <g stroke="#8a7a62" fill="none" strokeWidth="0.4" opacity="0.45">
        <path d="M120,150 Q300,130 500,160 T900,150 T1200,170" />
        <path d="M100,200 Q280,170 480,200 T880,190 T1200,210" />
        <path d="M80,260 Q260,220 460,250 T860,240 T1200,260" />
        <path d="M120,520 Q300,500 500,510 T900,500 T1200,520" />
        <path d="M100,580 Q280,560 480,570 T880,560 T1200,580" />
      </g>

      {/* Bee Cave Road — main east-west route just above the river */}
      <path
        d="M30,600 Q260,580 480,590 Q700,600 920,585 Q1080,575 1180,595"
        stroke="#9c4a2a"
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      />
      <text x="80" y="595" fontFamily="Libre Baskerville, serif" fontSize="14" fontStyle="italic" fill="#6e3019">
        Bee Cave Road
      </text>

      {/* Camp Craft Road — vertical crossing */}
      <path
        d="M820,250 L820,790"
        stroke="#9c4a2a"
        strokeWidth="1.4"
        fill="none"
        opacity="0.55"
      />

      {/* Frame */}
      <rect
        x="6"
        y="6"
        width={VIEWBOX_W - 12}
        height={VIEWBOX_H - 12}
        fill="none"
        stroke="#6e3019"
        strokeWidth="1.5"
        opacity="0.35"
      />

      {/* Pins */}
      {pins.map((p) => {
        const { x, y } = project(p.lng, p.lat);
        const isActive = p.slug === selectedSlug;
        return (
          <g
            key={p.slug}
            transform={`translate(${x} ${y})`}
            className="cursor-pointer"
            onClick={() => onSelect(p)}
            role="button"
            tabIndex={0}
            aria-label={`${p.title} — ${p.placeType}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(p);
              }
            }}
          >
            <circle r="14" fill="#f8f5ee" opacity={isActive ? 0.9 : 0} />
            <circle
              r="9"
              fill={isActive ? "#9c4a2a" : "#2f4a3d"}
              stroke="#f8f5ee"
              strokeWidth="2"
            />
            <circle r="3" fill="#f8f5ee" />
            <text
              x="14"
              y="5"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="13"
              letterSpacing="0.5"
              fill="#1f2421"
              opacity="0.92"
            >
              {p.title.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pin drawer                                                                 */
/* -------------------------------------------------------------------------- */

function PinDrawer({ pin, onClose }: { pin: MapPin; onClose: () => void }) {
  const dates = [
    pin.yearBuilt ? `Built ${pin.yearBuilt}` : null,
    pin.yearDemolished ? `Demolished ${pin.yearDemolished}` : null,
  ].filter(Boolean);

  return (
    <div className="border-t border-rule bg-paper px-6 py-6 md:px-10 md:py-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="label-archival text-cedar">{pin.placeType}</p>
          <h3 className="mt-2 font-display text-[24px] leading-tight text-ink">
            {pin.title}
          </h3>
          {pin.historicalNames?.length ? (
            <p className="meta-line mt-2 text-ink-mute">
              Also known as: {pin.historicalNames.join(", ")}
            </p>
          ) : null}
          {dates.length ? (
            <p className="meta-line mt-1 text-ink-mute">{dates.join(" · ")}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close place details"
          className="meta-line rounded-full border border-rule px-3 py-1 text-ink-mute transition-colors hover:border-oak hover:text-oak"
        >
          Close ✕
        </button>
      </div>

      {pin.summary ? (
        <p className="mt-4 max-w-[760px] text-[15px] leading-snug text-ink">
          {pin.summary}
        </p>
      ) : null}

      <Link
        href={pin.href}
        className="mt-5 inline-block border-b border-cedar/50 pb-px text-[14px] text-ink hover:border-cedar hover:text-cedar"
      >
        Read the full place record →
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorations: zoom buttons, compass rose, scale bar — visual only           */
/* -------------------------------------------------------------------------- */

function ZoomControls() {
  return (
    <div className="absolute right-4 bottom-4 flex flex-col overflow-hidden rounded-sm border border-rule bg-paper text-ink shadow-sm">
      <button
        type="button"
        aria-label="Zoom in (placeholder)"
        className="h-9 w-9 transition-colors hover:bg-limestone"
      >
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out (placeholder)"
        className="h-9 w-9 border-t border-rule transition-colors hover:bg-limestone"
      >
        −
      </button>
    </div>
  );
}

function CompassRose() {
  return (
    <svg
      viewBox="0 0 60 60"
      className="absolute right-4 top-4 h-12 w-12 text-cedar"
      aria-hidden="true"
    >
      <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <polygon points="30,8 33,30 30,52 27,30" fill="currentColor" />
      <polygon points="8,30 30,33 52,30 30,27" fill="currentColor" opacity="0.5" />
      <text
        x="30"
        y="6"
        fontFamily="Libre Baskerville, serif"
        fontSize="9"
        fontStyle="italic"
        textAnchor="middle"
        fill="currentColor"
      >
        N
      </text>
    </svg>
  );
}

function ScaleBar() {
  return (
    <div className="absolute left-4 bottom-4 flex items-end gap-2 font-mono text-[11px] text-ink-mute">
      <div className="flex">
        <span className="block h-2 w-12 border border-rule-strong bg-paper" />
        <span className="block h-2 w-12 border border-l-0 border-rule-strong bg-ink" />
      </div>
      <span>1 mile</span>
    </div>
  );
}
