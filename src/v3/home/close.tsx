import Link from "next/link";
import { medicines } from "@/lib/data";
import { SearchBox } from "../search-box";

const CHIP = ["bg-(--pp-lemon)", "bg-(--pp-lilac)", "bg-(--pp-tang)", "bg-(--pp-mint)"];

/* Closing band: the search again, over two rows of every medicine we track. */
export function Close() {
  const rows = [medicines.slice(0, 7), medicines.slice(7)];
  return (
    <section className="overflow-hidden bg-(--pp-ink) py-24 text-(--pp-mint) sm:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-8">
        <h2 className="v3-display text-[clamp(2.2rem,6vw,4.6rem)]">What are you looking for?</h2>
        <div className="mt-10 text-left">
          <SearchBox tone="dark" />
        </div>
      </div>
      <div className="v3-marquee-wrap mt-16 space-y-4">
        {rows.map((row, r) => (
          <div key={r} className="flex w-max gap-4 v3-marquee" data-reverse={r === 1 || undefined}>
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex gap-4" aria-hidden={copy === 1}>
                {row.map((m, i) => (
                  <li key={m.id}>
                    <Link
                      href={`/v3/search?q=${encodeURIComponent(m.name)}`}
                      tabIndex={copy === 1 ? -1 : undefined}
                      className={`v3-press block rounded-full border-2 border-(--pp-mint) px-6 py-3 text-lg font-bold whitespace-nowrap text-(--pp-ink) shadow-[0_4px_0_0_var(--pp-mint)] ${CHIP[(i + r) % CHIP.length]}`}
                    >
                      {m.name} <span className="font-medium">{m.dosage}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
