export function MapTeaser() {
  return (
    <section className="mx-auto my-16 max-w-[1280px] px-6 md:px-12">
      <div className="grid min-h-[480px] grid-cols-1 border border-hairline-strong bg-paper-deep md:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col justify-between p-10 md:p-14">
          <div>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-rust">
              Interactive cartography
            </p>
            <h3
              className="mb-6 font-display font-normal leading-[1.05] text-ink"
              style={{
                fontSize: "clamp(30px, 3.6vw, 44px)",
                fontVariationSettings: "'opsz' 96",
              }}
            >
              Walk the hills{" "}
              <em className="italic font-light">as Emmett knew them</em>
            </h3>
            <p className="text-[17px] leading-[1.6] text-ink-soft">
              Layered maps — 1840 land grants, the 1944 Westlake survey, and
              the town today. Drop into any pin to read the story of that
              corner of the hill.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-9 border-t border-hairline pt-7 font-mono text-[10.5px] uppercase tracking-[0.15em] text-ink-mute">
            <Stat label="Locations" value="—" />
            <Stat label="Land grants" value="—" />
            <Stat label="Eras" value="4" />
          </div>
        </div>
        <div className="relative overflow-hidden border-t border-hairline-strong bg-[#ddd1b3] md:border-l md:border-t-0">
          <MapPreviewSVG />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong
        className="block font-display font-normal text-[28px] tracking-[-0.01em] text-ink md:text-[32px]"
      >
        {value}
      </strong>
      <span>{label}</span>
    </div>
  );
}

function MapPreviewSVG() {
  return (
    <svg
      viewBox="0 0 600 480"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Stylized preview of an interactive map of West Lake Hills with sample pins for the Moose Head Lodge, Tom Miller Dam, and Davenport Ranch."
    >
      <rect width="600" height="480" fill="#ddd1b3" />
      <rect width="600" height="480" fill="#c4b596" opacity="0.3" />
      <path
        d="M0,180 Q80,170 160,195 Q240,220 320,210 Q400,200 480,225 Q540,240 600,235 L600,290 Q540,295 480,280 Q400,260 320,275 Q240,290 160,265 Q80,245 0,255 Z"
        fill="#a8b9a8"
        opacity="0.7"
      />
      <g stroke="#6b5d49" fill="none" opacity="0.4" strokeWidth="0.6">
        <path d="M120,80 Q200,60 280,90 Q360,120 440,100" />
        <path d="M100,100 Q190,75 280,110 Q370,140 460,120" />
        <path d="M80,125 Q180,95 280,135 Q380,170 480,150" />
        <path d="M140,340 Q220,320 300,345 Q380,370 460,355" />
        <path d="M120,365 Q210,340 300,370 Q390,395 480,380" />
      </g>
      <path
        d="M40,310 Q150,290 280,300 Q420,310 580,295"
        stroke="#9c4a2a"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M280,300 L290,440"
        stroke="#9c4a2a"
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M180,160 Q200,250 280,300"
        stroke="#9c4a2a"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      <g
        fontFamily="JetBrains Mono, monospace"
        fontSize="8"
        fill="#1c1611"
      >
        <g transform="translate(280 300)">
          <circle r="6" fill="#9c4a2a" />
          <circle r="2.5" fill="#f3ecdb" />
          <text x="10" y="3" letterSpacing="1">
            MOOSEHEAD LODGE / 1929
          </text>
        </g>
        <g transform="translate(380 230)">
          <circle r="5" fill="#6b7a5e" />
          <circle r="2" fill="#f3ecdb" />
          <text x="9" y="3" letterSpacing="1">
            TOM MILLER DAM / 1940
          </text>
        </g>
        <g transform="translate(160 360)">
          <circle r="5" fill="#6b7a5e" />
          <circle r="2" fill="#f3ecdb" />
          <text x="9" y="3" letterSpacing="1">
            DAVENPORT RANCH / 1840
          </text>
        </g>
        <g transform="translate(420 380)">
          <circle r="5" fill="#9c4a2a" />
          <circle r="2" fill="#f3ecdb" />
          <text x="9" y="3" letterSpacing="1">
            EMMETT SHELTON BR. / 1949
          </text>
        </g>
      </g>
      <g transform="translate(540 60)" fill="#6e3019" stroke="#6e3019">
        <circle r="18" fill="none" strokeWidth="0.5" />
        <polygon points="0,-15 3,0 0,15 -3,0" fill="#6e3019" />
        <polygon points="-15,0 0,3 15,0 0,-3" fill="#6e3019" opacity="0.5" />
        <text
          x="0"
          y="-22"
          fontFamily="Fraunces"
          fontSize="9"
          fontStyle="italic"
          textAnchor="middle"
        >
          N
        </text>
      </g>
    </svg>
  );
}
