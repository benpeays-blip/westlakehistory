export const metadata = {
  title: "Contribute — Westlake History",
  description:
    "Share photographs, documents, memories, and recordings with the Westlake, Texas community archive.",
};

const STEPS = [
  {
    n: "1",
    title: "Contact us",
    body: "Let us know what you would like to share — a photograph, a document, a memory, a recording. A short note is all we need to begin.",
  },
  {
    n: "2",
    title: "We review",
    body: "Our team will review the material with care, ask any clarifying questions, and propose how it might fit the archive.",
  },
  {
    n: "3",
    title: "You approve",
    body: "Nothing is published without your approval. You decide what is shared, how it is credited, and whether copies are kept.",
  },
  {
    n: "4",
    title: "It becomes part of the archive",
    body: "Once published, your contribution becomes part of the permanent, public archive — preserved for the next hundred years.",
  },
];

export default function ContributePage() {
  return (
    <section className="mx-auto max-w-[860px] px-6 py-14 md:px-10 md:py-20">
      <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
        Contribute to Westlake History
      </h1>
      <p className="mt-5 max-w-[640px] text-[17px] leading-[1.6] text-ink">
        Our archive grows through the generosity of our community. Share your
        photographs, documents, memories, and recordings.
      </p>

      <ol className="mt-12 space-y-10">
        {STEPS.map((s) => (
          <li key={s.n} className="grid gap-5 md:grid-cols-[80px_1fr] md:gap-8">
            <div className="font-display text-[34px] italic text-cedar">{s.n}</div>
            <div>
              <h2 className="font-display text-[20px] leading-tight text-ink">
                {s.title}
              </h2>
              <p className="mt-2 text-[16px] leading-[1.6] text-ink-mute">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-14 border-t border-rule pt-10">
        <a
          href="mailto:contribute@westlakehistory.com"
          className="inline-block bg-oak px-7 py-3 text-[15px] font-medium text-paper transition-colors hover:bg-oak-deep"
        >
          Get started
        </a>
        <p className="meta-line mt-5 text-ink-mute">
          A short, friendly email is the best way to begin. We respond
          personally — never with an automated reply.
        </p>
      </div>
    </section>
  );
}
