import Link from "next/link";

export function Masthead() {
  return (
    <header className="border-b border-hairline-strong px-6 py-12 text-center md:px-12 md:pt-14 md:pb-10">
      <div className="mx-auto max-w-[1280px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-mute mb-4">
          A digital archive of the Hill Country
        </p>
        <Link href="/" className="inline-block">
          <h1
            className="font-display italic font-normal leading-[0.92] tracking-[-0.02em] text-ink"
            style={{
              fontSize: "clamp(56px, 10vw, 132px)",
              fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1",
            }}
          >
            <span className="bg-[linear-gradient(transparent_65%,rgba(156,74,42,0.12)_65%)] px-2">
              Westlake History
            </span>
          </h1>
        </Link>
        <p className="mx-auto mt-4 max-w-[680px] font-display italic font-light text-[18px] text-ink-soft md:text-[19px]">
          A community archive of the people, places, schools, churches, and
          institutions of Westlake, Texas — collected, preserved, and shared
          with the community for the next hundred years.
        </p>
        <svg
          aria-hidden="true"
          className="mx-auto mt-7 block h-2 w-20"
          viewBox="0 0 80 8"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="4" x2="32" y2="4" stroke="#3d3225" strokeWidth="0.6" />
          <circle cx="40" cy="4" r="2" fill="none" stroke="#9c4a2a" strokeWidth="0.8" />
          <circle cx="40" cy="4" r="0.8" fill="#9c4a2a" />
          <line x1="48" y1="4" x2="80" y2="4" stroke="#3d3225" strokeWidth="0.6" />
        </svg>
      </div>
    </header>
  );
}
