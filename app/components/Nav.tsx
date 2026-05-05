import Link from "next/link";

const items = [
  { label: "The Archive", href: "/archive" },
  { label: "Stories", href: "/stories" },
  { label: "Map", href: "/map" },
  { label: "People", href: "/people" },
  { label: "Places", href: "/places" },
  { label: "Podcast", href: "/podcast" },
  { label: "Meetings", href: "/meetings" },
  { label: "Contribute", href: "/contribute" },
];

export function Nav() {
  return (
    <nav
      aria-label="Primary"
      className="border-b border-hairline-strong"
    >
      <div className="mx-auto max-w-[1280px] px-2 md:px-12">
        <ul className="flex flex-wrap items-stretch justify-center">
          {items.map((item, i) => (
            <li
              key={item.href}
              className={
                "relative font-mono text-[11.5px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-rust" +
                (i < items.length - 1
                  ? " after:absolute after:right-0 after:top-[22px] after:bottom-[22px] after:w-px after:bg-hairline"
                  : "")
              }
            >
              <Link href={item.href} className="block px-3 py-4 md:px-6 md:py-[18px]">
                {item.label}
              </Link>
            </li>
          ))}
          <li className="relative font-mono text-[11.5px] uppercase tracking-[0.18em] text-ink-mute hover:text-rust">
            <button
              type="button"
              className="block px-3 py-4 md:px-6 md:py-[18px]"
              aria-label="Search the archive"
            >
              ⌕ Search
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
