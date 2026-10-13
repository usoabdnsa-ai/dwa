import Link from "next/link";
import { LogoMark } from "@/components/logo";

/* The home page lives on the night map, so it gets its own floating nav and a one-line footer. */
export default function HomeLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-dusk text-dusk-ink">
      <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
        <nav className="night-card pointer-events-auto flex items-center gap-1 rounded-full p-1.5 pl-4 text-sm">
          <Link href="/" className="mr-2 flex items-center gap-2 text-dusk-mint" aria-label="Dwa, home">
            <LogoMark className="size-6 [--color-paper:var(--color-dusk-2)]" />
            <span className="font-display text-lg font-bold tracking-tight text-dusk-ink">dwa</span>
          </Link>
          <Link href="/search" className="hidden rounded-full px-3 py-2 text-dusk-muted hover:text-dusk-ink sm:block">
            Search
          </Link>
          <Link href="/search?garde=1" className="hidden rounded-full px-3 py-2 text-dusk-muted hover:text-dusk-ink sm:block">
            On duty tonight
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-dusk-mint px-4 py-2 font-semibold text-[#06241f] transition-colors duration-150 hover:bg-white"
          >
            For pharmacists
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-dusk-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="flex items-center gap-2">
            <LogoMark className="size-4 text-dusk-mint [--color-paper:var(--color-dusk)]" />
            dwa · a software engineering project · stock shown is demo data
          </p>
          <p>
            Map ©{" "}
            <a href="https://openfreemap.org" className="hover:text-dusk-ink">OpenFreeMap</a>,{" "}
            <a href="https://www.openmaptiles.org/" className="hover:text-dusk-ink">OpenMapTiles</a>, data ©{" "}
            <a href="https://www.openstreetmap.org/copyright" className="hover:text-dusk-ink">OpenStreetMap contributors</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
