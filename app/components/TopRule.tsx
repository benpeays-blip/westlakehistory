export function TopRule() {
  return (
    <div className="border-y border-hairline-strong py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 md:px-12">
        <span>Vol. 1 · No. 1 · Spring 2026</span>
        <div className="hidden gap-6 md:flex">
          <span>30°18′N · 97°48′W</span>
          <span>West Lake Hills, Texas</span>
        </div>
        <span className="md:hidden">West Lake Hills, TX</span>
      </div>
    </div>
  );
}
