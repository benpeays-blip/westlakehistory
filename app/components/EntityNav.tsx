import Link from "next/link";

interface EntityNavItem {
  label: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ITEMS: EntityNavItem[] = [
  {
    label: "Stories",
    href: "/stories",
    description: "Essays and narratives",
    icon: StoriesIcon,
  },
  {
    label: "People",
    href: "/people",
    description: "Biographies and family histories",
    icon: PeopleIcon,
  },
  {
    label: "Places",
    href: "/places",
    description: "Historic places and landmarks",
    icon: PlacesIcon,
  },
  {
    label: "Maps",
    href: "/maps",
    description: "Explore change over time",
    icon: MapsIcon,
  },
  {
    label: "Documents",
    href: "/documents",
    description: "Photos, letters, records",
    icon: DocumentsIcon,
  },
  {
    label: "Audio",
    href: "/audio",
    description: "Podcasts and oral histories",
    icon: AudioIcon,
  },
];

export function EntityNav() {
  return (
    <section aria-label="Browse the archive" className="border-b border-rule">
      <div className="mx-auto max-w-[1320px] px-6 py-10 md:px-10 md:py-12">
        <ul className="grid grid-cols-2 gap-px overflow-hidden bg-rule sm:grid-cols-3 lg:grid-cols-6">
          {ITEMS.map((item) => (
            <li key={item.href} className="bg-paper">
              <Link
                href={item.href}
                className="group flex h-full flex-col items-start gap-3 px-5 py-6 transition-colors hover:bg-limestone"
              >
                <item.icon className="h-6 w-6 text-oak transition-colors group-hover:text-oak-deep" />
                <span className="font-display text-[18px] leading-tight text-ink">
                  {item.label}
                </span>
                <span className="text-[13px] leading-snug text-ink-mute">
                  {item.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Icons (1.5px stroke, archival feel) ---------------------------- */

function IconBase({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

function StoriesIcon(props: { className?: string }) {
  return (
    <IconBase {...props}>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
      <path d="M5 17a3 3 0 0 1 3-3h11" />
      <path d="M9 8h7M9 12h5" />
    </IconBase>
  );
}

function PeopleIcon(props: { className?: string }) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-2.7 2.9-4.5 5.5-4.5s4.9 1.8 5.5 4.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14.5 14.5c2.4-.6 5.4.6 6 4.5" />
    </IconBase>
  );
}

function PlacesIcon(props: { className?: string }) {
  return (
    <IconBase {...props}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}

function MapsIcon(props: { className?: string }) {
  return (
    <IconBase {...props}>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </IconBase>
  );
}

function DocumentsIcon(props: { className?: string }) {
  return (
    <IconBase {...props}>
      <path d="M7 3h8l4 4v14H7Z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h4" />
    </IconBase>
  );
}

function AudioIcon(props: { className?: string }) {
  return (
    <IconBase {...props}>
      <path d="M5 14V10a7 7 0 1 1 14 0v4" />
      <rect x="3.5" y="13.5" width="4" height="6.5" rx="1" />
      <rect x="16.5" y="13.5" width="4" height="6.5" rx="1" />
    </IconBase>
  );
}
