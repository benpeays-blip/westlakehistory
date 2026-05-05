export const metadata = {
  title: "Maps — Westlake History",
  description:
    "Historical maps of the West Lake area, with timeline overlay and layer controls.",
};

export default function MapsIndex() {
  return (
    <ComingSoon
      title="Maps"
      lede="An interactive map of West Lake Hills with a time slider, era-filtered overlays, and pinned places — coming in a later phase of the archive."
      eta="Phase 4"
    />
  );
}

function ComingSoon({
  title,
  lede,
  eta,
}: {
  title: string;
  lede: string;
  eta: string;
}) {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-24">
      <p className="label-archival">{eta}</p>
      <h1 className="mt-3 font-display text-[34px] leading-tight text-ink md:text-[44px]">
        {title}
      </h1>
      <p className="mt-5 max-w-[640px] text-[17px] leading-snug text-ink-mute">
        {lede}
      </p>
    </section>
  );
}
