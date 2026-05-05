import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule bg-limestone">
      <div className="mx-auto max-w-[1320px] px-6 pb-12 pt-14 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-[18px] font-bold leading-[1.1] tracking-[0.04em] text-ink">
              WESTLAKE
              <br />
              HISTORY
            </p>
            <p className="mt-4 max-w-[380px] text-[14.5px] leading-[1.6] text-ink-mute">
              A community-built archive for the people, places, schools,
              churches, and clubs of Westlake, Texas. Always free, always
              open, made for the next hundred years.
            </p>
          </div>
          <FooterColumn
            heading="Browse"
            items={[
              { label: "Stories", href: "/stories" },
              { label: "People", href: "/people" },
              { label: "Places", href: "/places" },
              { label: "Maps", href: "/maps" },
              { label: "Documents", href: "/documents" },
              { label: "Audio", href: "/audio" },
            ]}
          />
          <FooterColumn
            heading="Participate"
            items={[
              { label: "Contribute materials", href: "/contribute" },
              { label: "History club meetings", href: "/meetings" },
              { label: "Collections", href: "/collections" },
              {
                label: "Our Westlake on Facebook",
                href: "https://www.facebook.com/OurWestlake/",
                external: true,
              },
            ]}
          />
          <FooterColumn
            heading="About"
            items={[
              { label: "The project", href: "/about" },
              { label: "Acknowledgments", href: "/about#acknowledgments" },
              { label: "Sources & rights", href: "/about#sources" },
              { label: "Privacy", href: "/privacy" },
              { label: "RSS feed", href: "/feed.xml" },
              { label: "Contact", href: "/about#contact" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-rule pt-6 font-mono text-[11px] tracking-[0.04em] text-ink-mute md:flex-row md:items-center md:justify-between md:gap-0">
          <span>© Westlake Historical Society · MMXXVI</span>
          <span>30°18′N · 97°48′W · West Lake Hills, Texas</span>
          <span>Set in Libre Baskerville &amp; Source Sans 3</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  items,
}: {
  heading: string;
  items: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h6 className="label-archival mb-4">{heading}</h6>
      <ul className="space-y-2 text-[14.5px] leading-relaxed text-ink">
        {items.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-transparent pb-px transition-colors hover:border-oak hover:text-oak"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="border-b border-transparent pb-px transition-colors hover:border-oak hover:text-oak"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
