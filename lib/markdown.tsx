/**
 * Minimal markdown-to-JSX renderer for the archive's MDX bodies.
 *
 * Supports the markdown subset our content actually uses: paragraphs,
 * `##` and `###` headings, italic, bold, and `[text](url)` links. Inline
 * JSX in MDX is not rendered — when the archive needs richer embeds
 * (Audio components, Map embeds), we'll wire next-mdx-remote or @next/mdx.
 *
 * Keeps the build deterministic and avoids one corrupted-deps episode we
 * hit with next-mdx-remote@6 on Next 16 + Turbopack early on.
 */

import { Fragment, type ReactNode } from "react";

export interface RenderOptions {
  components?: {
    h2?: (props: { children: ReactNode }) => ReactNode;
    h3?: (props: { children: ReactNode }) => ReactNode;
    p?: (props: { children: ReactNode }) => ReactNode;
    a?: (props: { href: string; children: ReactNode }) => ReactNode;
    em?: (props: { children: ReactNode }) => ReactNode;
    strong?: (props: { children: ReactNode }) => ReactNode;
  };
}

export function renderMarkdown(source: string, opts: RenderOptions = {}): ReactNode {
  const C = {
    h2: opts.components?.h2 ?? defaultH2,
    h3: opts.components?.h3 ?? defaultH3,
    p: opts.components?.p ?? defaultP,
    a: opts.components?.a ?? defaultA,
    em: opts.components?.em ?? defaultEm,
    strong: opts.components?.strong ?? defaultStrong,
  };

  const blocks = source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("### ")) {
          return <C.h3 key={i}>{renderInline(block.slice(4), C)}</C.h3>;
        }
        if (block.startsWith("## ")) {
          return <C.h2 key={i}>{renderInline(block.slice(3), C)}</C.h2>;
        }
        // Treat the rest as a paragraph; collapse intra-block newlines.
        const flat = block.replace(/\n+/g, " ");
        return <C.p key={i}>{renderInline(flat, C)}</C.p>;
      })}
    </>
  );
}

type InlineComponents = Required<NonNullable<RenderOptions["components"]>>;

function renderInline(text: string, C: InlineComponents): ReactNode {
  // Tokenize on link / bold / italic boundaries while preserving order.
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;
  const push = (n: ReactNode) => out.push(<Fragment key={key++}>{n}</Fragment>);

  while (rest.length) {
    const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(rest);
    const bold = /\*\*([^*]+)\*\*/.exec(rest);
    const italic = /(?<!\*)\*([^*]+)\*(?!\*)/.exec(rest);

    const candidates: { idx: number; len: number; node: ReactNode }[] = [];
    if (link)
      candidates.push({
        idx: link.index,
        len: link[0].length,
        node: <C.a href={link[2]}>{link[1]}</C.a>,
      });
    if (bold)
      candidates.push({
        idx: bold.index,
        len: bold[0].length,
        node: <C.strong>{bold[1]}</C.strong>,
      });
    if (italic)
      candidates.push({
        idx: italic.index,
        len: italic[0].length,
        node: <C.em>{italic[1]}</C.em>,
      });

    if (!candidates.length) {
      push(rest);
      break;
    }
    candidates.sort((a, b) => a.idx - b.idx);
    const next = candidates[0];
    if (next.idx > 0) push(rest.slice(0, next.idx));
    push(next.node);
    rest = rest.slice(next.idx + next.len);
  }
  return out;
}

const defaultH2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-10 mb-4 font-display text-[24px] leading-tight text-ink">{children}</h2>
);
const defaultH3 = ({ children }: { children: ReactNode }) => (
  <h3 className="mt-8 mb-3 font-display text-[18px] leading-tight text-ink">{children}</h3>
);
const defaultP = ({ children }: { children: ReactNode }) => (
  <p className="mb-5 text-[17px] leading-[1.7] text-ink">{children}</p>
);
const defaultA = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
  >
    {children}
  </a>
);
const defaultEm = ({ children }: { children: ReactNode }) => <em>{children}</em>;
const defaultStrong = ({ children }: { children: ReactNode }) => <strong>{children}</strong>;
