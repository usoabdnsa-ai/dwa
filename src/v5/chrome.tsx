import Link from "next/link";
import { Mark } from "./ui";

export function Masthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--ln-line) bg-(--ln-bg)/92">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/v5" className="flex items-center gap-2.5">
          <Mark />
          <span className="text-[15px] font-semibold tracking-tight">dwa</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/v5/search" className="rounded-md px-3 py-1.5 text-(--ln-muted) transition-colors hover:text-(--ln-ink)">
            Search
          </Link>
          <Link href="/v5/search?garde=1" className="hidden rounded-md px-3 py-1.5 text-(--ln-muted) transition-colors hover:text-(--ln-ink) sm:inline">
            De garde
          </Link>
          <Link href="/dashboard" className="v5-press ml-1 rounded-md bg-(--ln-ink) px-3 py-1.5 font-medium text-(--ln-bg) hover:bg-white">
            For pharmacists
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Colophon() {
  return (
    <footer className="mt-auto border-t border-(--ln-line)">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-(--ln-muted) sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2">
          <Mark className="size-5" /> Stock posted by the pharmacists themselves. Demo data.
        </p>
        <p>
          Design v5 ·{" "}
          <Link href="/v4" className="hover:text-(--ln-ink)">
            v4
          </Link>{" "}
          ·{" "}
          <Link href="/v3" className="hover:text-(--ln-ink)">
            v3
          </Link>{" "}
          ·{" "}
          <Link href="/" className="hover:text-(--ln-ink)">
            v2
          </Link>
        </p>
      </div>
    </footer>
  );
}
