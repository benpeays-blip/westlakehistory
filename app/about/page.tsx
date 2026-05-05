export const metadata = {
  title: "About — Westlake History",
  description:
    "Westlake History is a community-built archive for the people, places, and institutions of Westlake, Texas.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-[760px] px-6 py-14 md:px-10 md:py-20">
      <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
        About this archive
      </h1>

      <p className="mt-6 text-[17px] leading-[1.7] text-ink">
        Westlake History is a community-built archive for the families,
        schools, churches, ranches, sports teams, councils, and clubs that
        have made West Lake Hills, Texas. It is a companion to the {" "}
        <em className="not-italic">Our Westlake</em> podcast and to the
        long-running history-club work of the Westlake Historical Society.
      </p>

      <p className="mt-5 text-[17px] leading-[1.7] text-ink">
        This site is built to last. There is no database — every story,
        photograph, and citation is a markdown file in a public GitHub
        repository. If every host disappeared tomorrow, the archive would
        still be readable as plain text.
      </p>

      <h2 id="acknowledgments" className="mt-12 font-display text-[24px] text-ink">
        Acknowledgments
      </h2>
      <p className="mt-4 text-[16px] leading-[1.7] text-ink">
        Many of the stories surfaced here originate with Emmett Shelton, Sr.
        (1905–2000), whose recollections were recorded across the 1990s and
        published as the {" "}
        <em className="not-italic">Our Westlake</em> podcast by Cynthia
        Shelton. The archive is built on the work of many other contributors
        and historical-society members whose names will appear here as their
        materials are published.
      </p>

      <h2 id="sources" className="mt-12 font-display text-[24px] text-ink">
        Sources &amp; rights
      </h2>
      <p className="mt-4 text-[16px] leading-[1.7] text-ink">
        Every photograph, document, and quotation in this archive carries a
        source citation and a rights statement. We default to public domain
        and to permission-granted material; copyrighted work is linked to its
        rightful publisher rather than reproduced. If you believe an item is
        misattributed or improperly licensed, please get in touch — we will
        correct it.
      </p>

      <h2 id="contact" className="mt-12 font-display text-[24px] text-ink">
        Contact
      </h2>
      <p className="mt-4 text-[16px] leading-[1.7] text-ink">
        To contribute photographs, documents, or memories, or to report a
        correction, please use the {" "}
        <a
          href="/contribute"
          className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
        >
          contribute form
        </a>
        .
      </p>
    </article>
  );
}
