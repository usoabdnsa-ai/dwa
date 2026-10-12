import Link from "next/link";
import { Minus, Plus, TriangleAlert } from "lucide-react";

/*
 * The supply side (F4 · numbered steps): the data only exists if pharmacists
 * keep it current, so the pitch to them is "it takes one tap".
 */

const STEPS = [
  { n: "01", title: "Sign in with your pharmacy", body: "Accounts are checked against the pharmacy's licence before going live." },
  { n: "02", title: "Tap + or − as boxes leave the shelf", body: "No spreadsheet. The search updates the moment you do." },
  { n: "03", title: "Get warned before it runs out", body: "Low stock and close expiry dates rise to the top of your list." },
];

export function ForPharmacists() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-36">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <MiniDashboard />
          <div data-reveal>
            <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
              Pharmacists keep it true. It takes one tap.
            </h2>
            <ol className="mt-10 space-y-7">
              {STEPS.map((s) => (
                <li key={s.n} className="grid grid-cols-[3rem_1fr] gap-2">
                  <span className="font-mono text-sm text-amber-ink">{s.n}</span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="mt-1 text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/login" className="mt-10 inline-flex items-center gap-2 border-b border-ink pb-1 font-medium hover:border-green hover:text-green">
              Open the pharmacist space <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const ROWS = [
  { name: "Doliprane 1000 mg", qty: 42, tone: "text-ink" },
  { name: "Augmentin 1 g", qty: 4, tone: "text-amber-ink", warn: "Low" },
  { name: "Lantus 100 U/ml", qty: 9, tone: "text-ink", warn: "Expires Dec" },
  { name: "Spasfon 80 mg", qty: 0, tone: "text-danger", warn: "Out" },
];

function MiniDashboard() {
  return (
    <div data-reveal className="surface rounded-card p-5" aria-hidden="true">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Pharmacie Garidi · Stock</p>
        <span className="rounded-full bg-amber-soft px-2.5 py-1 text-xs font-medium text-amber-ink">3 need attention</span>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {ROWS.map((r) => (
          <li key={r.name} className="flex items-center gap-3 py-3">
            <span className="flex-1 text-sm">{r.name}</span>
            {r.warn && (
              <span className={`hidden items-center gap-1 text-xs sm:inline-flex ${r.tone}`}>
                <TriangleAlert className="size-3" />
                {r.warn}
              </span>
            )}
            <span className="flex items-center rounded-lg ring-1 ring-line">
              <span className="grid size-8 place-items-center text-muted"><Minus className="size-3.5" /></span>
              <span className={`w-8 text-center font-mono text-sm nums ${r.tone}`}>{r.qty}</span>
              <span className="grid size-8 place-items-center text-muted"><Plus className="size-3.5" /></span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
