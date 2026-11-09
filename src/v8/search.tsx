"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BellRing, Check, FileText, SearchX } from "lucide-react";
import { medicines, pharmacies } from "@/lib/data";
import { algiersMinutes, availabilityFor, equivalentsOf, fmtPrice, isOpen, searchMedicines } from "@/lib/finder";
import { addAlert, useAlerts, validPhone } from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import { MedicineSearch, Pill, ResultTile, Title, useCornerBlob } from "./ui";

type Sort = "best" | "near" | "open";

export function SearchView({ q }: { q: string }) {
  const m = useMemo(() => searchMedicines(q)[0], [q]);
  const [sort, setSort] = useState<Sort>("best");
  const now = useNow();
  const all = useMemo(() => (m ? availabilityFor(m.id) : []), [m]);
  const have = all.filter((a) => a.status !== "out");
  useCornerBlob(!q ? "pearl" : !m ? "none" : have.length ? "found" : "none");

  const list = useMemo(() => {
    if (sort === "near") return [...all].sort((a, b) => a.km - b.km);
    if (sort === "open" && now) return all.filter((a) => isOpen(a.pharmacy, algiersMinutes(now)));
    return all;
  }, [all, sort, now]);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-12">
      <div className="max-w-2xl">
        <MedicineSearch initial={q} size="md" autoFocus={!q} />
      </div>

      {!q ? (
        <section className="mt-16">
          <Title kicker="Search" sub="By brand or active ingredient. Pharmacies with stock come first, then the nearest.">
            Find a medicine
          </Title>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {medicines.map((x, i) => (
              <li key={x.id} className="in" style={{ animationDelay: `${i * 25}ms` }}>
                <Link href={`/v8/search?q=${encodeURIComponent(x.name)}`} className="card hover-rise flex items-center justify-between gap-4 p-5">
                  <span>
                    <span className="block font-semibold">
                      {x.name} <span className="font-normal text-(--l-muted)">{x.dosage}</span>
                    </span>
                    <span className="text-[13px] text-(--l-faint)">{x.dci}</span>
                  </span>
                  <span className="text-[14px] text-(--l-muted) nums">{fmtPrice(x.priceDzd)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : !m ? (
        <section className="card in mt-12 max-w-2xl p-8">
          <SearchX className="size-8 text-(--l-out)" aria-hidden />
          <h1 className="mt-4 text-[26px] font-semibold">Nothing called “{q}” in the catalogue</h1>
          <p className="mt-2 text-(--l-muted)">Check the spelling, or try the active ingredient printed on the box.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Paracetamol", "Amoxicillin", "Metformin", "Salbutamol"].map((s) => (
              <Link key={s} href={`/v8/search?q=${s}`} className="btn btn-soft btn-sm">
                {s}
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <aside className="card in p-6 lg:sticky lg:top-28">
            <p className="text-[13px] font-medium text-(--l-faint)">
              {have.length} of {pharmacies.length} pharmacies have it
            </p>
            <h1 className="display mt-2 text-[44px]">{m.name}</h1>
            <p className="text-[18px] text-(--l-muted)">{m.dosage}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Pill>{m.dci}</Pill>
              <Pill>{m.form}</Pill>
              <Pill tone={m.rx ? "low" : "in"}>
                {m.rx ? (
                  <>
                    <FileText className="size-3.5" aria-hidden /> Prescription
                  </>
                ) : (
                  "No prescription"
                )}
              </Pill>
            </div>
            <p className="display mt-6 text-[34px] nums">
              {fmtPrice(m.priceDzd)} <span className="text-[15px] font-normal tracking-normal text-(--l-faint)">a box</span>
            </p>
            {equivalentsOf(m).length > 0 && (
              <div className="mt-6 border-t border-(--l-line) pt-5">
                <p className="text-[13px] font-medium text-(--l-faint)">Same active ingredient</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {equivalentsOf(m).map((e) => (
                    <Link key={e.id} href={`/v8/search?q=${encodeURIComponent(e.name)}`} className="btn btn-soft btn-sm h-9">
                      {e.name} {e.dosage}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="min-w-0">
            <div role="tablist" aria-label="Sort" className="inline-flex rounded-full bg-white/80 p-1 shadow-[0_0_0_1px_var(--l-line)]">
              {(
                [
                  ["best", "Best match"],
                  ["near", "Nearest"],
                  ["open", "Open now"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} role="tab" aria-selected={sort === k} onClick={() => setSort(k)} className={`h-10 rounded-full px-4 text-[14px] font-medium transition-colors duration-200 ${sort === k ? "bg-(--l-ink) text-white" : "text-(--l-muted) hover:text-(--l-ink)"}`}>
                  {l}
                </button>
              ))}
            </div>
            {have.length === 0 && <NotifyMe medicineId={m.id} name={m.name} />}
            <ul key={sort} className="mt-6 grid gap-4 sm:grid-cols-2" aria-label={`Pharmacies for ${m.name}`}>
              {list.map((a, i) => (
                <ResultTile key={a.pharmacy.id} a={a} medicine={m} index={i} />
              ))}
            </ul>
            {list.length === 0 && <p className="card mt-6 p-8 text-center text-(--l-muted)">No pharmacy is open right now. Switch to “Best match”.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifyMe({ medicineId, name }: { medicineId: string; name: string }) {
  const done = useAlerts().some((a) => a.medicineId === medicineId);
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState(false);
  return (
    <section className="card card-solid in mt-6 p-6" aria-live="polite">
      {done ? (
        <p className="flex items-center gap-2 font-semibold text-(--l-in)">
          <Check className="size-5" aria-hidden /> We will text you when {name} is back. Manage it in My dwa.
        </p>
      ) : (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validPhone(phone)) return setErr(true);
            addAlert(medicineId, phone);
          }}
        >
          <label className="min-w-56 flex-1">
            <span className="flex items-center gap-2 font-semibold">
              <BellRing className="size-4 text-(--l-lilac)" aria-hidden /> No pharmacy has {name} today. Get a text when it is back.
            </span>
            <input value={phone} onChange={(e) => (setPhone(e.target.value), setErr(false))} inputMode="tel" placeholder="0550 12 34 56" aria-invalid={err} className="input mt-3" />
            {err && <span className="mt-1.5 block text-[13.5px] text-(--l-out)">Enter an Algerian mobile number, like 0550 12 34 56.</span>}
          </label>
          <button className="btn btn-ink">Alert me</button>
        </form>
      )}
    </section>
  );
}
