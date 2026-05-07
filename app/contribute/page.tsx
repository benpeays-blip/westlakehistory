import { ContributeForm } from "@/app/components/ContributeForm";

export const metadata = {
  title: "Contribute — Westlake History",
  description:
    "Share photographs, documents, memories, recordings, and videos with the Westlake, Texas community archive.",
};

const STEPS = [
  {
    n: "1",
    title: "Send it in",
    body: "Use the form below to tell us what you'd like to share. A photograph, a document, a memory, a recording — even a few sentences are a useful start.",
  },
  {
    n: "2",
    title: "We review",
    body: "An archive curator reviews every submission, asks any clarifying questions, and proposes how it might fit alongside the existing material.",
  },
  {
    n: "3",
    title: "You approve",
    body: "Nothing is published without your approval. You decide what is shared, how it is credited, and whether copies are kept.",
  },
  {
    n: "4",
    title: "It becomes part of the archive",
    body: "Once published, your contribution becomes part of the permanent, public archive — preserved, cross-linked to related people and places, and citable for the next hundred years.",
  },
];

export default function ContributePage() {
  return (
    <section className="mx-auto max-w-[860px] px-6 py-14 md:px-10 md:py-20">
      <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
        Contribute to Westlake History
      </h1>
      <p className="mt-5 max-w-[640px] text-[17px] leading-[1.6] text-ink">
        Our archive grows through the generosity of our community. If you
        have photographs, documents, memories, recordings, or videos from
        West Lake Hills, Rollingwood, the Eanes-area, or any of the
        families and institutions that built it, we want to bring them in.
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

      <ContributeForm />
    </section>
  );
}
