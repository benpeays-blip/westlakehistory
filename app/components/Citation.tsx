/**
 * Preferred-citation block — shown at the foot of every entity detail
 * article. Makes the archive feel scholarly and permanent: every page
 * carries an unambiguous citation a researcher can drop into a footnote.
 */

import type { ContentType } from "@/lib/schemas";

interface CitationProps {
  title: string;
  type: ContentType;
  slug: string;
  /** Original publication / record date if known */
  date?: string;
  /** Source / collection citation, e.g. "Travis County Deed Book 12, p. 45" */
  source?: string;
  /** Rights statement, free text */
  rights?: string;
  /** Contributing or curating group / individual */
  contributor?: string;
}

export function Citation({
  title,
  type,
  slug,
  date,
  source,
  rights,
  contributor,
}: CitationProps) {
  const url = `https://westlakehistory.com/${type}/${slug}`;
  const owner = contributor ?? "Westlake Historical Society";
  const accessed = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <aside
      aria-label="Citation"
      className="mt-12 grid gap-x-10 gap-y-4 border-t border-rule pt-8 md:grid-cols-[180px_1fr]"
    >
      <h3 className="label-archival self-start">Preferred Citation</h3>
      <div>
        <p className="text-[14px] leading-relaxed text-ink">
          {owner}.{" "}
          <em className="not-italic font-medium">&ldquo;{title}.&rdquo;</em>{" "}
          <em className="italic">Westlake History</em>
          {date ? `, ${date}` : ""}.{" "}
          <span className="text-ink-mute">{url}</span>
          {" "}(accessed {accessed}).
        </p>

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 text-[12.5px] sm:grid-cols-[100px_1fr]">
          {source ? (
            <Row term="Source" value={source} />
          ) : null}
          {rights ? (
            <Row term="Rights" value={rights} />
          ) : null}
          <Row term="Last updated" value={accessed} />
        </dl>
      </div>
    </aside>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <>
      <dt className="label-archival pt-px text-ink-mute">{term}</dt>
      <dd className="text-ink">{value}</dd>
    </>
  );
}
