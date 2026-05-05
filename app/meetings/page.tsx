export const metadata = {
  title: "Meetings — Westlake History",
  description: "History-club meeting minutes and recordings.",
};

export default function MeetingsIndex() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-24">
      <p className="label-archival">Phase 2</p>
      <h1 className="mt-3 font-display text-[34px] leading-tight text-ink md:text-[44px]">
        Meetings
      </h1>
      <p className="mt-5 max-w-[640px] text-[17px] leading-snug text-ink-mute">
        Minutes and recordings from the Westlake Historical Society's
        history-club meetings. The first batch will be added once the
        contributor flow is in place.
      </p>
    </section>
  );
}
