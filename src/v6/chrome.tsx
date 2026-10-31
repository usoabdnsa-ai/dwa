import Link from "next/link";
import { Mark } from "./ui";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--e-line) bg-(--e-bg)/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/v6" className="flex items-center gap-2.5">
          <Mark />
          <span className="v6-serif text-2xl">dwa</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/v6/search"
            className="rounded-full px-3.5 py-2 text-(--e-muted) hover:bg-white hover:text-(--e-ink)"
          >
            Find a medicine
          </Link>
          <Link
            href="/v6/search?garde=1"
            className="hidden rounded-full px-3.5 py-2 text-(--e-muted) hover:bg-white hover:text-(--e-ink) sm:inline"
          >
            On duty tonight
          </Link>
          <Link
            href="/dashboard"
            className="v6-btn ms-1 bg-(--e-green) px-4 py-2 text-white hover:bg-(--e-dark)"
          >
            For pharmacists
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-(--e-dark) text-(--e-sage-2)">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/v6" className="flex items-center gap-2.5 text-white">
            <Mark />
            <span className="v6-serif text-2xl">dwa</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm">
            Medicine stock counted by the pharmacists of Alger. Demonstration
            data. In an emergency, call the Protection Civile on 14.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Patients</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/v6/search" className="hover:text-white">
                Find a medicine
              </Link>
            </li>
            <li>
              <Link href="/v6/search?garde=1" className="hover:text-white">
                On duty tonight
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Other versions</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/" className="hover:text-white">
                Main site
              </Link>
            </li>
            <li>
              <Link href="/v5" className="hover:text-white">
                v5
              </Link>{" "}
              ·{" "}
              <Link href="/v4" className="hover:text-white">
                v4
              </Link>{" "}
              ·{" "}
              <Link href="/v3" className="hover:text-white">
                v3
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
