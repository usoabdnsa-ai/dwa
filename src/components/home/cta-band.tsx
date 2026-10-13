import Link from "next/link";
import { ArrowRight, Moon } from "lucide-react";

export function CtaBand() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div data-reveal className="cross-pattern relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-green px-6 py-16 text-white sm:px-14 sm:py-20">
        <div aria-hidden className="blob -top-24 -right-16 size-80 bg-neon/40" />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="max-w-[18ch] font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
              Find your medicine before you leave home.
            </h2>
            <p className="mt-4 max-w-[44ch] text-lg text-green-soft">Free, no account needed. Just type the name on your prescription.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <Link
              href="/search"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 font-semibold text-green transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
            >
              Search a medicine <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/search?garde=1"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 font-semibold text-white ring-1 ring-white/40 transition-colors duration-150 hover:bg-white/10"
            >
              <Moon className="size-4" aria-hidden /> On duty tonight
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
