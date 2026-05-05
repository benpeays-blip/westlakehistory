import Link from "next/link";

export const metadata = {
  title: "Not found — Westlake History",
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[760px] px-6 py-20 text-center md:px-10 md:py-28">
      <p className="label-archival text-cedar">Folio missing</p>
      <h1 className="mt-4 font-display text-[44px] leading-tight tracking-[-0.005em] text-ink md:text-[56px]">
        We couldn&apos;t find that page.
      </h1>
      <p className="mx-auto mt-6 max-w-[520px] text-[16px] leading-relaxed text-ink-mute">
        The link you followed may be from an early draft of the archive, or the
        item may have been re-catalogued. Try the search, or wander back into
        the collection from one of these starting points.
      </p>
      <ul className="mx-auto mt-10 grid max-w-[520px] gap-px overflow-hidden bg-rule sm:grid-cols-3">
        {(
          [
            ["/", "Home"],
            ["/stories", "Stories"],
            ["/places", "Places"],
            ["/people", "People"],
            ["/audio", "Audio"],
            ["/search", "Search"],
          ] as const
        ).map(([href, label]) => (
          <li key={href} className="bg-paper">
            <Link
              href={href}
              className="block px-5 py-5 font-display text-[18px] text-ink transition-colors hover:bg-limestone hover:text-oak"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
