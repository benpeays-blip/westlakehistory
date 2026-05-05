import { SectionHead } from "./SectionHead";

interface Artifact {
  type: string;
  title: string;
  detail: string;
  art: "deed" | "audio" | "map" | "portrait";
}

const artifacts: Artifact[] = [
  {
    type: "Document",
    title: "Original land grant — Roy Ranch tract",
    detail: "3,000 acres · 1938",
    art: "deed",
  },
  {
    type: "Audio",
    title: "Capt. Frank Hamer interview",
    detail: "Restored · circa 1933",
    art: "audio",
  },
  {
    type: "Map",
    title: "Original survey of Westlake",
    detail: "Hand-drawn · 1944",
    art: "map",
  },
  {
    type: "Photograph",
    title: "Emmett Shelton, Sr.",
    detail: "Studio portrait · 1955",
    art: "portrait",
  },
];

export function Archive() {
  return (
    <section className="pb-20 pt-2">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <SectionHead meta="Recently catalogued">
          From <em className="italic font-light">the archive</em>
        </SectionHead>
        <div className="mt-9 grid grid-cols-2 gap-7 md:grid-cols-4">
          {artifacts.map((a) => (
            <article key={a.title} className="cursor-default">
              <div className="relative aspect-square border border-hairline-strong bg-paper-deep p-2">
                <div className="relative h-full w-full overflow-hidden bg-limestone">
                  <ArtSVG kind={a.art} />
                </div>
              </div>
              <div className="mt-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-rust">
                {a.type}
              </div>
              <h5
                className="mt-1 font-display font-normal text-[16.5px] leading-[1.25] text-ink"
                style={{ fontVariationSettings: "'opsz' 36" }}
              >
                {a.title}
              </h5>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-mute">
                {a.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArtSVG({ kind }: { kind: Artifact["art"] }) {
  if (kind === "deed") {
    return (
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        <rect width="200" height="200" fill="#c4b596" />
        <rect x="20" y="30" width="160" height="140" fill="#e8dfc8" stroke="#6e3019" strokeWidth="0.5" />
        <text x="100" y="55" fontFamily="Fraunces" fontSize="12" fontStyle="italic" textAnchor="middle" fill="#1c1611">Travis County</text>
        <text x="100" y="72" fontFamily="Fraunces" fontSize="9" textAnchor="middle" fill="#1c1611">Deed of Record</text>
        {[90, 100, 110, 120, 130].map((y, i) => (
          <line key={y} x1="40" y1={y} x2={i === 2 ? 140 : i === 4 ? 120 : 160} y2={y} stroke="#1c1611" strokeWidth="0.3" />
        ))}
        <text x="160" y="155" fontFamily="Fraunces" fontSize="14" fontStyle="italic" textAnchor="end" fill="#6e3019">Shelton</text>
      </svg>
    );
  }
  if (kind === "audio") {
    return (
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        <rect width="200" height="200" fill="#3a3025" />
        <ellipse cx="100" cy="100" rx="60" ry="40" fill="#5a4a38" />
        <ellipse cx="100" cy="100" rx="50" ry="32" fill="#1c1611" />
        <circle cx="100" cy="100" r="22" fill="#3a3025" />
        <circle cx="100" cy="100" r="14" fill="#0a0705" />
        <text x="100" y="180" fontFamily="JetBrains Mono" fontSize="7" letterSpacing="1" textAnchor="middle" fill="#a89578">RCA VICTOR · 1933</text>
      </svg>
    );
  }
  if (kind === "map") {
    return (
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        <rect width="200" height="200" fill="#a89578" />
        <rect x="15" y="15" width="170" height="170" fill="#c4b596" stroke="#1c1611" strokeWidth="0.5" />
        <g stroke="#3d3225" strokeWidth="0.5" fill="none">
          <path d="M30,80 Q80,60 130,85 T180,90" />
          <path d="M30,100 Q80,80 130,105 T180,110" />
          <path d="M30,130 L60,130 L60,160 L30,160 Z" fill="#9c4a2a" opacity="0.5" />
        </g>
        <text x="40" y="40" fontFamily="Fraunces" fontSize="9" fontStyle="italic" fill="#1c1611">Westlake Hills</text>
        <text x="40" y="52" fontFamily="JetBrains Mono" fontSize="6" letterSpacing="1" fill="#1c1611">SURVEYED · 1944</text>
        <circle cx="160" cy="170" r="4" fill="#9c4a2a" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <rect width="200" height="200" fill="#2a2218" />
      <rect x="20" y="20" width="160" height="160" fill="#5a4a38" />
      <rect x="35" y="35" width="130" height="130" fill="#a89578" />
      <circle cx="100" cy="85" r="20" fill="#3a3025" />
      <path d="M70,140 Q70,110 100,110 Q130,110 130,140 L130,165 L70,165 Z" fill="#3a3025" />
      <text x="100" y="180" fontFamily="Fraunces" fontSize="8" fontStyle="italic" textAnchor="middle" fill="#1c1611">E. Shelton</text>
    </svg>
  );
}
