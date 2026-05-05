import type { ReactNode } from "react";

export function SectionHead({
  children,
  meta,
}: {
  children: ReactNode;
  meta?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-hairline-strong pb-7 pt-12 md:pt-14">
      <h3
        className="font-display font-normal text-[28px] leading-tight tracking-[-0.01em] md:text-[38px]"
        style={{ fontVariationSettings: "'opsz' 72" }}
      >
        {children}
      </h3>
      {meta ? (
        <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mute md:block">
          {meta}
        </span>
      ) : null}
    </div>
  );
}
