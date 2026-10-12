import Link from "next/link";
import { Phone } from "lucide-react";
import { pharmacies } from "@/lib/data";
import { DEFAULT_ORIGIN, distanceKm, fmtKm } from "@/lib/finder";

/** Night band: tonight's pharmacies de garde, in the intro's palette. */
export function OnDuty() {
  const onDuty = pharmacies
    .filter((p) => p.onDuty)
    .map((p) => ({ p, km: distanceKm(DEFAULT_ORIGIN, p) }))
    .sort((a, b) => a.km - b.km);

  return (
    <section className="bg-night text-[#e6efe9]">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-28 sm:px-6 sm:py-36 lg:grid-cols-[1fr_1.2fr]">
        <div data-reveal>
          <p className="font-mono text-xs tracking-[0.18em] text-neon uppercase">Tonight · 20:00 to 08:00</p>
          <h2 className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            Fever at midnight? These are open.
          </h2>
          <p className="mt-4 max-w-[44ch] text-night-muted">
            The pharmacies de garde rota changes every night. Here it is, already in the results, with stock.
          </p>
          <Link
            href="/search?garde=1"
            className="mt-8 inline-flex items-center gap-2 border-b border-neon/60 pb-1 font-medium text-neon transition-colors duration-150 hover:border-neon"
          >
            Search only pharmacies de garde <span aria-hidden>→</span>
          </Link>
        </div>

        <ul data-reveal className="divide-y divide-white/10 border-y border-white/10">
          {onDuty.map(({ p, km }) => (
            <li key={p.id} className="flex items-center gap-4 py-5">
              <span className="relative flex size-2.5" aria-hidden>
                <span className="absolute inset-0 animate-ping rounded-full bg-neon/60 [animation-duration:2.4s]" />
                <span className="relative size-2.5 rounded-full bg-neon" />
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/pharmacy/${p.id}`} className="font-semibold hover:text-neon">
                  {p.name}
                </Link>
                <p className="text-sm text-night-muted">
                  {p.address}, {p.commune}
                </p>
              </div>
              <span className="hidden font-mono text-sm text-night-muted nums sm:block">{fmtKm(km)}</span>
              <a
                href={`tel:${p.phone.replace(/\s/g, "")}`}
                aria-label={`Call ${p.name}`}
                className="grid size-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/15 transition-colors duration-150 hover:bg-neon hover:text-night"
              >
                <Phone className="size-4" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
