import Link from "next/link";

const NAV_ITEMS = [
  { label: "Stories", href: "/stories" },
  { label: "People", href: "/people" },
  { label: "Places", href: "/places" },
  { label: "Maps", href: "/maps" },
  { label: "Documents", href: "/documents" },
  { label: "Audio", href: "/audio" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-[1320px] items-center gap-10 px-6 py-5 md:px-10">
        <Link href="/" className="shrink-0" aria-label="Westlake History — home">
          <span className="block font-display text-[15px] font-bold leading-[1.05] tracking-[0.04em] text-ink">
            WESTLAKE
            <br />
            HISTORY
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 md:block">
          <ul className="flex items-center justify-center gap-7 lg:gap-9 text-[14px] tracking-[0.01em] text-ink">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="border-b border-transparent pb-0.5 transition-colors hover:border-oak hover:text-oak"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/search"
          aria-label="Search the archive"
          className="ml-auto rounded-full p-2 text-ink-mute transition-colors hover:bg-limestone hover:text-ink md:ml-0"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
        </Link>
      </div>

      <nav aria-label="Primary mobile" className="border-t border-rule md:hidden">
        <ul className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-6 py-3 text-[13px] text-ink">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-oak">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
