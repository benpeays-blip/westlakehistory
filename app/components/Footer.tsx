import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-hairline-strong bg-paper-deep pb-12 pt-16">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <p
              className="mb-3 font-display italic text-[28px] text-ink"
              style={{ fontVariationSettings: "'opsz' 72" }}
            >
              Westlake History
            </p>
            <p className="max-w-[380px] text-[15px] leading-relaxed text-ink-soft">
              A community-driven archive for the people, places, schools,
              churches, and clubs of Westlake, Texas. Built to host the
              histories of every group that helped shape this town. Always
              free, always open, made for the next hundred years.
            </p>
          </div>
          <FooterColumn
            heading="Explore"
            items={[
              { label: "The Archive", href: "/archive" },
              { label: "Interactive Map", href: "/map" },
              { label: "Stories", href: "/stories" },
              { label: "People & Places", href: "/people" },
            ]}
          />
          <FooterColumn
            heading="Get Involved"
            items={[
              { label: "Contribute a story", href: "/contribute" },
              { label: "Donate a photograph", href: "/contribute" },
              { label: "History club meetings", href: "/meetings" },
              { label: "Our Westlake on Facebook", href: "https://www.facebook.com/OurWestlake/", external: true },
            ]}
          />
          <FooterColumn
            heading="About"
            items={[
              { label: "The project", href: "/about" },
              { label: "Acknowledgments", href: "/about#acknowledgments" },
              { label: "Sources & permissions", href: "/about#sources" },
              { label: "Contact", href: "/about#contact" },
            ]}
          />
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-hairline pt-7 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-mute md:flex-row md:justify-between md:gap-0">
          <span>© Westlake Historical Society · MMXXVI</span>
          <span>Companion to the Our Westlake podcast by Emmett Shelton, Sr.</span>
          <span>Set in Fraunces &amp; Newsreader</span>
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
      <h6 className="mb-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-ink-mute">
        {heading}
      </h6>
      <ul className="space-y-1.5 text-[15px] leading-relaxed text-ink-soft">
        {items.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
