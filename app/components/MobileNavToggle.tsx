"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NavItem {
  label: string;
  href: string;
}

/**
 * Mobile nav drawer. Hamburger button shows below the lg breakpoint
 * (matching SiteHeader's primary-nav visibility). Pressing the button
 * opens a full-screen panel with all nav items and a search shortcut;
 * ESC and clicks outside close it. Body scroll is locked while open.
 *
 * Self-contained client component so the rest of the header stays
 * server-rendered.
 */
export function MobileNavToggle({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="-mr-1 rounded-full p-2 text-ink-mute transition-colors hover:bg-limestone hover:text-ink lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
          className="h-[18px] w-[18px]"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 flex flex-col bg-paper"
        >
          <div className="flex items-center justify-between border-b border-rule px-6 py-5">
            <span className="font-display text-[15px] font-bold leading-[1.05] tracking-[0.04em] text-ink">
              WESTLAKE
              <br />
              HISTORY
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="rounded-full p-2 text-ink-mute transition-colors hover:bg-limestone hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
                className="h-[20px] w-[20px]"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav aria-label="Primary mobile" className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-rule py-4 font-display text-[22px] leading-tight text-ink transition-colors hover:text-oak"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-rule pt-6">
              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className="meta-line block text-cedar"
              >
                ⌕ Search the archive →
              </Link>
              <Link
                href="/contribute"
                onClick={() => setOpen(false)}
                className="meta-line mt-3 block text-ink-mute hover:text-oak"
              >
                Contribute materials →
              </Link>
            </div>
          </nav>

          <p className="border-t border-rule px-6 py-4 font-mono text-[10.5px] tracking-[0.1em] text-ink-mute">
            30°18′N · 97°48′W · West Lake Hills, Texas
          </p>
        </div>
      ) : null}
    </>
  );
}
