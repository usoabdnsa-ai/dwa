import Link from "next/link";
import { Mark } from "./ui";

export function Masthead() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="v4-glass v4-glass-blur mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5">
        <Link href="/v4" className="flex items-center gap-2.5">
          <Mark />
          <span className="v4-display text-xl">dwa</span>
          <span className="hidden rounded-full border border-(--nn-magenta)/40 px-2 py-0.5 text-[11px] font-semibold text-(--nn-magenta) sm:inline">night</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link href="/v4/search" className="rounded-lg px-3 py-1.5 text-(--nn-muted) hover:bg-white/5 hover:text-(--nn-ink)">
            Search
          </Link>
          <Link href="/v4/search?garde=1" className="hidden rounded-lg px-3 py-1.5 text-(--nn-muted) hover:bg-white/5 hover:text-(--nn-ink) sm:inline">
            Open now
          </Link>
          <Link href="/dashboard" className="v4-press rounded-lg bg-(--nn-neon) px-3.5 py-1.5 font-semibold text-(--nn-bg) shadow-[0_0_20px_-4px_var(--nn-neon)]">
            Pharmacists
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Colophon() {
  return (
    <footer className="mt-auto border-t border-(--nn-line)">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-(--nn-muted) sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-(--nn-ink)">dwa</span> · stock posted by the pharmacists themselves. Demo data.
        </p>
        <p>
          Design v4 ·{" "}
          <Link href="/v3" className="underline underline-offset-4 hover:text-(--nn-ink)">
            v3
          </Link>{" "}
          ·{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-(--nn-ink)">
            v2
          </Link>
        </p>
      </div>
    </footer>
  );
}
