import Link from "next/link";
import { ArrowUpRight, Droplet, Flower2, HeartPulse, Pill, Soup, Syringe, Thermometer, Wind } from "lucide-react";

/** Browse by need: each card searches a typical medicine for that need. */
const CATEGORIES = [
  { title: "Pain & fever", example: "Doliprane", icon: Thermometer, tint: "bg-[#fdecec] text-[#b42318]" },
  { title: "Antibiotics", example: "Augmentin", icon: Pill, tint: "bg-green-soft text-green" },
  { title: "Asthma & breathing", example: "Ventoline", icon: Wind, tint: "bg-[#e3f1fa] text-[#1d5f8a]" },
  { title: "Diabetes", example: "Glucophage", icon: Droplet, tint: "bg-[#efeafb] text-[#5b3fa8]" },
  { title: "Insulin", example: "Lantus", icon: Syringe, tint: "bg-[#e3f1fa] text-[#1d5f8a]" },
  { title: "Heart & blood", example: "Kardegic", icon: HeartPulse, tint: "bg-[#fdecec] text-[#b42318]" },
  { title: "Stomach & digestion", example: "Smecta", icon: Soup, tint: "bg-amber-soft text-amber-ink" },
  { title: "Allergies", example: "Aerius", icon: Flower2, tint: "bg-green-soft text-green" },
];

export function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-green uppercase">Browse by need</p>
          <h2 className="mt-3 max-w-[18ch] font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
            What are you looking for today?
          </h2>
        </div>
        <Link href="/search" className="inline-flex items-center gap-1.5 font-medium text-green hover:text-green-700">
          See all medicines <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {CATEGORIES.map(({ title, example, icon: Icon, tint }) => (
          <li key={title} data-reveal>
            <Link
              href={`/search?q=${encodeURIComponent(example)}`}
              className="group surface flex h-full flex-col gap-6 rounded-card p-5 transition-transform duration-200 ease-[var(--ease-out-quint)] hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <span className={`grid size-12 place-items-center rounded-2xl ${tint}`}>
                  <Icon className="size-6" aria-hidden />
                </span>
                <ArrowUpRight className="size-5 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-green" aria-hidden />
              </div>
              <div>
                <p className="font-display text-lg font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">e.g. {example}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
