import Link from "next/link";
import { Mark } from "./ui";

export function Masthead() {
  return (
    <header className="relative z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <Link href="/v3" className="flex items-center gap-2.5">
          <Mark />
          <span className="v3-display text-2xl tracking-tight">dwa</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
          <Link href="/v3/search" className="rounded-full px-3 py-2 hover:bg-(--pp-mint-2)">
            Search
          </Link>
          <Link href="/v3/search?garde=1" className="hidden rounded-full px-3 py-2 hover:bg-(--pp-mint-2) sm:inline">
            Open tonight
          </Link>
          <Link href="/dashboard" className="v3-press v3-sticker rounded-full bg-(--pp-ink) px-4 py-2 text-(--pp-mint)">
            I’m a pharmacist
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Colophon() {
  return (
    <footer className="mt-auto bg-(--pp-ink) text-(--pp-mint)">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-center gap-2">
          <span className="v3-display text-base">dwa</span> Stock posted by the pharmacists themselves. Demo data.
        </p>
        <p>
          Design v3 ·{" "}
          <Link href="/" className="underline underline-offset-4">
            see v2
          </Link>
        </p>
      </div>
    </footer>
  );
}
