"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LocateFixed, Search, SearchX, Loader2 } from "lucide-react";
import { pharmacies, stock, type Medicine } from "@/lib/data";
import {
  DEFAULT_ORIGIN,
  algiersMinutes,
  availabilityFor,
  distanceKm,
  equivalentsOf,
  fmtPrice,
  isOpen,
  searchMedicines,
  statusOf,
  type Availability,
} from "@/lib/finder";
import { useNow } from "@/lib/use-now";
import { ResultRow } from "./result-row";
import type { MapPoint } from "./pharmacy-map";

const PharmacyMap = dynamic(() => import("./pharmacy-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-paper-2" />,
});

type Filters = { stocked: boolean; open: boolean; garde: boolean };

export function SearchView({ q, initial }: { q: string; initial: Filters }) {
  const router = useRouter();
  const now = useNow();
  const minutes = now ? algiersMinutes(now) : null;
  const [draft, setDraft] = useState(q);
  const [filters, setFilters] = useState(initial);
  const [origin, setOrigin] = useState<{ lat: number; lng: number; label: string }>(DEFAULT_ORIGIN);
  const [locating, setLocating] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const matches = useMemo(() => searchMedicines(q), [q]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const med: Medicine | undefined = matches.find((m) => m.id === pickedId) ?? matches[0];

  // Filters live in the URL so a result can be shared or reloaded as-is.
  const sync = (next: Filters, query = q) => {
    setFilters(next);
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (next.stocked) sp.set("stocked", "1");
    if (next.open) sp.set("open", "1");
    if (next.garde) sp.set("garde", "1");
    router.replace(`/search${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const rows: Availability[] = useMemo(() => {
    const base: Availability[] = med
      ? availabilityFor(med.id, origin)
      : pharmacies
          .map((p) => ({ pharmacy: p, item: undefined, status: "in" as const, km: distanceKm(origin, p) }))
          .sort((a, b) => a.km - b.km);
    return base.filter(
      (a) =>
        (!filters.stocked || !med || a.status !== "out") &&
        (!filters.garde || a.pharmacy.onDuty) &&
        (!filters.open || minutes === null || isOpen(a.pharmacy, minutes)),
    );
  }, [med, origin, filters, minutes]);

  const stockedCount = med ? availabilityFor(med.id).filter((a) => a.status !== "out").length : 0;

  const points: MapPoint[] = rows.map((a) => ({
    id: a.pharmacy.id,
    name: a.pharmacy.name,
    lat: a.pharmacy.lat,
    lng: a.pharmacy.lng,
    status: med ? a.status : "none",
    onDuty: a.pharmacy.onDuty,
  }));

  const locate = () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "your location" });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setPickedId(null);
          sync(filters, draft.trim());
        }}
        className="surface flex items-center gap-3 rounded-2xl p-1.5 pl-4 focus-within:ring-2 focus-within:ring-green"
      >
        <Search className="size-5 text-muted" aria-hidden />
        <label htmlFor="q" className="sr-only">Medicine name or active ingredient</label>
        <input
          id="q"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Medicine or active ingredient…"
          autoComplete="off"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
        />
        <button type="submit" className="h-11 rounded-xl bg-green px-5 font-medium text-white transition-colors duration-150 hover:bg-green-700">
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Toggle on={filters.stocked} disabled={!med} onClick={() => sync({ ...filters, stocked: !filters.stocked })}>In stock only</Toggle>
        <Toggle on={filters.open} onClick={() => sync({ ...filters, open: !filters.open })}>Open now</Toggle>
        <Toggle on={filters.garde} night onClick={() => sync({ ...filters, garde: !filters.garde })}>De garde tonight</Toggle>
        <button
          type="button"
          onClick={locate}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition-colors duration-150 hover:text-ink"
        >
          {locating ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LocateFixed className="size-4" aria-hidden />}
          Distances from {origin.label}
        </button>
      </div>

      {q && !med ? (
        <NoMatch q={q} />
      ) : (
        <>
          {med && (
            <header className="mt-10 flex flex-wrap items-end gap-x-6 gap-y-3">
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight">
                  {med.name} <span className="text-muted">{med.dosage}</span>
                </h1>
                <p className="mt-1 text-muted">
                  {med.dci} · {med.form} · {fmtPrice(med.priceDzd)}
                  {med.rx && <span className="ml-2 rounded-md bg-paper-2 px-1.5 py-0.5 text-xs font-medium text-ink">Prescription</span>}
                </p>
              </div>
              <p className="font-mono text-sm text-muted nums sm:ml-auto" aria-live="polite">
                <span className={stockedCount ? "text-green" : "text-danger"}>{stockedCount}</span> of {pharmacies.length} pharmacies have it
              </p>
              {matches.length > 1 && (
                <div className="flex w-full flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted">Also matching</span>
                  {matches.filter((m) => m.id !== med.id).slice(0, 5).map((m) => (
                    <button key={m.id} type="button" onClick={() => setPickedId(m.id)} className="rounded-full px-3 py-1 ring-1 ring-line hover:bg-surface">
                      {m.name} {m.dosage}
                    </button>
                  ))}
                </div>
              )}
            </header>
          )}
          {!q && (
            <h1 className="mt-10 font-display text-4xl font-semibold tracking-tight">
              {filters.garde ? "Pharmacies de garde tonight" : "All pharmacies"}
            </h1>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            <div>
              {med && stockedCount === 0 && <Equivalents med={med} />}
              {rows.length ? (
                <ul className="surface divide-y divide-line/70 rounded-card p-1.5">
                  {rows.map((a) => (
                    <ResultRow key={a.pharmacy.id} a={a} open={minutes === null ? null : isOpen(a.pharmacy, minutes)} highlighted={hovered === a.pharmacy.id} showStock={!!med} onHover={setHovered} />
                  ))}
                </ul>
              ) : (
                <div className="rounded-card border border-dashed border-line px-6 py-14 text-center">
                  <p className="font-semibold">No pharmacy fits all these filters.</p>
                  <button type="button" onClick={() => sync({ stocked: false, open: false, garde: false })} className="mt-3 text-sm font-medium text-green underline underline-offset-4">
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            <div className="order-first h-72 overflow-hidden rounded-card ring-1 ring-line lg:sticky lg:top-24 lg:order-none lg:h-[calc(100vh-8rem)]">
              <PharmacyMap points={points} origin={origin} highlighted={hovered} onSelect={(id) => router.push(`/pharmacy/${id}`)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Toggle({ on, night, disabled, onClick, children }: { on: boolean; night?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  const active = night ? "bg-night text-neon ring-night" : "bg-ink text-paper ring-ink";
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
        on ? active : "bg-surface text-ink ring-line hover:ring-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

function Equivalents({ med }: { med: Medicine }) {
  const alts = equivalentsOf(med)
    .map((m) => ({ m, count: stock.filter((s) => s.medicineId === m.id && statusOf(s.qty) !== "out").length }))
    .filter((x) => x.count > 0);
  return (
    <div className="mb-6 rounded-card bg-amber-soft p-5">
      <p className="font-semibold text-amber-ink">Nobody reports {med.name} in stock right now.</p>
      {alts.length ? (
        <>
          <p className="mt-1 text-sm text-ink">Same active ingredient ({med.dci}). Ask your doctor or pharmacist before switching:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {alts.map(({ m, count }) => (
              <Link key={m.id} href={`/search?q=${encodeURIComponent(m.name)}`} className="rounded-full bg-surface px-3 py-1.5 text-sm ring-1 ring-line hover:ring-ink/30">
                {m.name} {m.dosage} <span className="font-mono text-xs text-green">· {count} pharmacies</span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-1 text-sm text-ink">Call a pharmacy below: they can often order it within a day or two.</p>
      )}
    </div>
  );
}

function NoMatch({ q }: { q: string }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <SearchX className="size-10 text-muted" aria-hidden />
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">No medicine called “{q}”</h1>
      <p className="mt-2 max-w-[44ch] text-muted">Check the spelling on the box, or search the active ingredient instead (it’s printed under the name).</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
        {["Paracetamol", "Amoxicillin", "Doliprane", "Spasfon"].map((s) => (
          <Link key={s} href={`/search?q=${s}`} className="rounded-full px-3 py-1.5 ring-1 ring-line hover:bg-surface">
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}
