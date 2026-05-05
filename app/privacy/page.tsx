export const metadata = {
  title: "Privacy — Westlake History",
  description:
    "How Westlake History handles reader privacy: no individual tracking, no third-party advertising, no data sale.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[760px] px-6 py-14 md:px-10 md:py-20">
      <h1 className="font-display text-[34px] leading-tight tracking-[-0.005em] text-ink md:text-[44px]">
        Privacy
      </h1>
      <p className="mt-4 text-[14px] text-ink-mute">Last reviewed: May 2026.</p>

      <p className="mt-8 text-[17px] leading-[1.7] text-ink">
        Westlake History is a community archive, not a marketing site. We
        treat reader privacy as a baseline obligation rather than a feature.
      </p>

      <h2 className="mt-12 font-display text-[24px] text-ink">
        What we don&apos;t collect
      </h2>
      <ul className="mt-4 space-y-3 text-[16px] leading-[1.7] text-ink">
        <li>
          We do not run Google Analytics, Meta Pixel, or any other
          individual-tracking analytics.
        </li>
        <li>
          We do not sell or share reader data with third parties.
        </li>
        <li>
          We do not run third-party advertising on the archive.
        </li>
        <li>
          We do not require an account, email address, or login to read
          anything.
        </li>
      </ul>

      <h2 className="mt-12 font-display text-[24px] text-ink">
        What we do collect
      </h2>
      <ul className="mt-4 space-y-3 text-[16px] leading-[1.7] text-ink">
        <li>
          <strong>Server logs.</strong> Vercel, our hosting provider, keeps
          standard request logs (IP address, user agent, requested URL) for
          a short period to help diagnose abuse and outages.
        </li>
        <li>
          <strong>Aggregate page views.</strong> If we add an analytics
          service, it will be a privacy-respecting one such as Plausible
          that does not set tracking cookies and does not create reader
          profiles.
        </li>
        <li>
          <strong>Contributions.</strong> When you contribute material
          through{" "}
          <a
            href="/contribute"
            className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
          >
            our contribute form
          </a>
          , we keep what you send (the photograph, the document, the email
          you sent it from) for the purposes of catalouguing the donation
          and contacting you about it. We do not share that information
          with any third party.
        </li>
      </ul>

      <h2 className="mt-12 font-display text-[24px] text-ink">
        Right to be forgotten
      </h2>
      <p className="mt-4 text-[16px] leading-[1.7] text-ink">
        If a name or photograph appears in the archive that you would like
        removed, contact us through the{" "}
        <a
          href="/about#contact"
          className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
        >
          contact link on the about page
        </a>
        . We will work with you in good faith to redact, anonymize, or
        remove the material as appropriate.
      </p>

      <h2 className="mt-12 font-display text-[24px] text-ink">
        Children
      </h2>
      <p className="mt-4 text-[16px] leading-[1.7] text-ink">
        The archive is open to readers of any age. We do not collect any
        personal information from readers, so we do not knowingly collect
        information from children. School research projects are welcome.
      </p>

      <h2 className="mt-12 font-display text-[24px] text-ink">
        Changes
      </h2>
      <p className="mt-4 text-[16px] leading-[1.7] text-ink">
        If this policy changes, the date at the top of the page is
        updated. The full revision history of this page is preserved in
        the archive&apos;s public GitHub repository.
      </p>
    </article>
  );
}
