import Link from "next/link";
import { Logo } from "./logo";
import { CommandSearch } from "./command-search";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <div className="flex flex-1 justify-center">
          <div className="hidden w-full max-w-sm md:block">
            <CommandSearch />
          </div>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/search?garde=1" className="hidden rounded-full px-3 py-2 text-muted hover:text-ink sm:block">
            On duty tonight
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition-colors duration-150 hover:bg-green"
          >
            For pharmacists
          </Link>
        </nav>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <CommandSearch />
      </div>
    </header>
  );
}
