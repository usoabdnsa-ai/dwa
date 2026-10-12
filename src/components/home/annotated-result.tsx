import { getMedicine } from "@/lib/data";
import { availabilityFor, fmtPrice } from "@/lib/finder";
import { ResultRow } from "../result-row";

/*
 * Solution beat (F5 · annotated capture): a real result for the inhaler from
 * the route above, rendered with the same component the search page uses,
 * with numbered pins on the details that matter.
 */

const NOTES = [
  { n: 1, title: "Counted, not guessed", body: "Each line shows when the pharmacist last updated it." },
  { n: 2, title: "Stock first, then distance", body: "Pharmacies that have it come first, nearest on top." },
  { n: 3, title: "Night duty included", body: "Pharmacies de garde are flagged, so 2 a.m. works too." },
];

export function AnnotatedResult() {
  const med = getMedicine("ventoline-100")!;
  const rows = availabilityFor(med.id).slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-40">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div data-reveal>
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            Same inhaler, searched in four seconds.
          </h2>
          <ol className="mt-10 space-y-6">
            {NOTES.map((note) => (
              <li key={note.n} className="flex gap-4">
                <Pin n={note.n} />
                <div>
                  <p className="font-semibold">{note.title}</p>
                  <p className="mt-1 text-muted">{note.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure data-reveal className="relative">
          <div className="surface rounded-card p-2 sm:p-3 lg:rotate-[0.6deg]">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line px-4 pt-3 pb-4">
              <span className="font-display text-xl font-semibold">{med.name}</span>
              <span className="font-mono text-sm text-muted">{med.dosage} · {med.form}</span>
              <span className="ml-auto font-mono text-sm nums">{fmtPrice(med.priceDzd)}</span>
            </div>
            <ul className="pointer-events-none mt-1 divide-y divide-line/70" inert>
              {rows.map((a, i) => (
                <ResultRow
                  key={a.pharmacy.id}
                  a={a}
                  open={null}
                  marks={i === 0 ? { name: <Pin n={2} small />, stock: <Pin n={1} small />, open: <Pin n={3} small /> } : undefined}
                />
              ))}
            </ul>
          </div>
          <figcaption className="mt-4 text-sm text-muted">Demo stock. In the real app these numbers come from each pharmacy’s dashboard.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Pin({ n, small = false }: { n: number; small?: boolean }) {
  return (
    <span className={`${small ? "ml-1.5 inline-grid size-5 text-[10px] align-middle" : "grid size-7 text-xs"} shrink-0 place-items-center rounded-full bg-amber font-mono font-medium text-white`}>
      {n}
    </span>
  );
}
