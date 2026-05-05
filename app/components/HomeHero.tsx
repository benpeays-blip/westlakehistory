/**
 * Homepage hero — editorial typography on paper, no fake landscape
 * illustration. The masthead-scale "Westlake History" type carries the
 * page identity; an archive-search input sits below. When real archival
 * photographs are catalogued, a featured image can be swapped in via a
 * prop; until then, restraint reads as more museum-like than mock
 * imagery would.
 */

export function HomeHero() {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 pt-14 pb-12 md:px-10 md:pt-20 md:pb-16">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
          <div>
            <p className="label-archival mb-5 text-cedar">
              A digital archive of West Lake Hills, Texas
            </p>
            <h1
              className="font-display font-normal leading-[0.98] tracking-[-0.01em] text-ink"
              style={{ fontSize: "clamp(48px, 7.6vw, 104px)" }}
            >
              The stories of <em className="italic">Westlake</em>,
              <br />
              told by the people who built it.
            </h1>
            <p className="mt-7 max-w-[640px] text-[18px] leading-[1.55] text-ink-mute md:text-[19px]">
              People. Places. Events. Memories.
              <br className="hidden sm:block" />
              {" "}Preserved for generations.
            </p>

            <form
              role="search"
              action="/search"
              className="mt-9 flex max-w-[520px] items-stretch overflow-hidden rounded-sm border border-rule bg-paper shadow-sm"
            >
              <input
                type="search"
                name="q"
                placeholder="Search the archive…"
                aria-label="Search the archive"
                className="flex-1 bg-transparent px-4 py-3 text-[15px] text-ink placeholder:text-ink-mute focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex items-center justify-center bg-oak px-5 text-paper transition-colors hover:bg-oak-deep"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-[18px] w-[18px]"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </form>
          </div>

          <ColophonBlock />
        </div>
      </div>
    </section>
  );
}

/**
 * Small colophon-like block on the right of the hero on desktop. Reads
 * like a publication's standing head. Establishes the archive's
 * editorial identity without pretending to a photograph.
 */
function ColophonBlock() {
  return (
    <aside
      aria-label="Colophon"
      className="hidden border-l border-rule pl-10 lg:block"
    >
      <div className="flex flex-col items-end gap-6 text-right">
        <Decoration />
        <dl className="grid grid-cols-[auto_auto] gap-x-5 gap-y-2 text-[13px]">
          <dt className="label-archival text-ink-mute">Vol.</dt>
          <dd className="font-mono text-ink">I</dd>
          <dt className="label-archival text-ink-mute">No.</dt>
          <dd className="font-mono text-ink">1</dd>
          <dt className="label-archival text-ink-mute">Season</dt>
          <dd className="font-mono text-ink">Spring 2026</dd>
          <dt className="label-archival text-ink-mute">Coords.</dt>
          <dd className="font-mono text-ink">30°18′N · 97°48′W</dd>
          <dt className="label-archival text-ink-mute">Type</dt>
          <dd className="font-mono text-ink">Libre Baskerville</dd>
        </dl>
      </div>
    </aside>
  );
}

function Decoration() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="h-12 w-24 text-cedar"
      aria-hidden="true"
    >
      <line x1="0" y1="30" x2="40" y2="30" stroke="#3d3225" strokeWidth="0.8" />
      <circle cx="50" cy="30" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="50" cy="30" r="1" fill="currentColor" />
      <line x1="60" y1="30" x2="120" y2="30" stroke="#3d3225" strokeWidth="0.8" />
      {/* small ornament cluster */}
      <line x1="50" y1="14" x2="50" y2="20" stroke="#3d3225" strokeWidth="0.5" />
      <line x1="50" y1="40" x2="50" y2="46" stroke="#3d3225" strokeWidth="0.5" />
    </svg>
  );
}
