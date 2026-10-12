import Link from "next/link";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-10 sm:px-6">
        <p className="max-w-3xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
          Your medicine is on a shelf somewhere in this city.{" "}
          <span className="text-green">Now you know which one.</span>
        </p>
        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="size-5 text-green" />
            <span>dwa · a software engineering project · stock shown is demo data</span>
          </div>
          <nav className="flex gap-5">
            <Link href="/search" className="hover:text-ink">Search</Link>
            <Link href="/search?garde=1" className="hover:text-ink">On duty tonight</Link>
            <Link href="/login" className="hover:text-ink">Pharmacist space</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
