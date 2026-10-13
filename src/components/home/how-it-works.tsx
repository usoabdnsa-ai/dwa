import { MapPin, PhoneCall, Search } from "lucide-react";

const STEPS = [
  { icon: Search, title: "Search your medicine", body: "By brand name or active ingredient. Typos are fine, and equivalents are suggested." },
  { icon: MapPin, title: "See who has it", body: "Pharmacies with stock come first, nearest on top, with opening hours and night duty." },
  { icon: PhoneCall, title: "Call, then go", body: "One tap to call and ask them to set a box aside, then walk straight there." },
];

export function HowItWorks() {
  return (
    <section className="cross-pattern-soft border-y border-line bg-paper-2/50">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-green uppercase">How it works</p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
            Three steps, about a minute.
          </h2>
        </div>

        <ol className="relative mt-16 grid gap-6 md:grid-cols-3">
          {/* Dashed line joining the three step icons on wide screens. */}
          <div aria-hidden className="absolute top-8 right-[16%] left-[16%] hidden border-t-2 border-dashed border-green/30 md:block" />
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} data-reveal className="relative flex flex-col items-center text-center">
              <span className="relative grid size-16 place-items-center rounded-2xl bg-green text-white shadow-[0_12px_28px_-10px_rgba(7,114,94,0.6)]">
                <Icon className="size-7" aria-hidden />
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-surface font-mono text-xs font-semibold text-green ring-2 ring-green">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-6 font-display text-xl font-bold">{title}</h3>
              <p className="mt-2 max-w-[32ch] text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
