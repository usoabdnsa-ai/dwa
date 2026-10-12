"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, LogOut, Minus, Plus, Search, Trash2, TriangleAlert, Package, Undo2, X } from "lucide-react";
import { getPharmacy, medicines, stock as demoStock, type StockItem } from "@/lib/data";
import { LOW_THRESHOLD, fmtUpdated, statusOf } from "@/lib/finder";
import { useNow } from "@/lib/use-now";
import { LogoMark } from "../logo";
import { StatusBadge } from "../status";
import { AddMedicineDialog } from "./add-medicine-dialog";

const PHARMACY_ID = "kouba-garidi";
const EXPIRY_WINDOW_DAYS = 90;

type Filter = "all" | "attention" | "low" | "out" | "expiring";
type Line = StockItem & { touched?: number };

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function StockManager() {
  const pharmacy = getPharmacy(PHARMACY_ID)!;
  const now = useNow();
  const [lines, setLines] = useState<Line[]>(() => demoStock.filter((s) => s.pharmacyId === PHARMACY_ID).map((s) => ({ ...s })));
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [onDuty, setOnDuty] = useState(pharmacy.onDuty);
  const [removed, setRemoved] = useState<{ line: Line; index: number } | null>(null);

  const daysLeft = (iso: string) => (now ? Math.floor((Date.parse(iso) - now.getTime()) / 86_400_000) : Infinity);
  const isExpiring = (l: Line) => l.qty > 0 && daysLeft(l.expiry) <= EXPIRY_WINDOW_DAYS;

  const counts = {
    all: lines.length,
    low: lines.filter((l) => statusOf(l.qty) === "low").length,
    out: lines.filter((l) => l.qty === 0).length,
    expiring: lines.filter(isExpiring).length,
  };
  const attention = counts.low + counts.out + counts.expiring;

  const visible = useMemo(() => {
    const needle = q.toLowerCase();
    return lines
      .map((l) => ({ ...l, medicine: medicines.find((m) => m.id === l.medicineId)! }))
      .filter((l) => !needle || (l.medicine.name + l.medicine.dci).toLowerCase().includes(needle))
      .filter((l) => {
        const s = statusOf(l.qty);
        if (filter === "low") return s === "low";
        if (filter === "out") return s === "out";
        if (filter === "expiring") return isExpiring(l);
        if (filter === "attention") return s !== "in" || isExpiring(l);
        return true;
      })
      .sort((a, b) => a.medicine.name.localeCompare(b.medicine.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, q, filter, now]);

  const setQty = (id: string, qty: number) =>
    setLines((ls) => ls.map((l) => (l.medicineId === id ? { ...l, qty: Math.max(0, Math.min(999, qty)), updatedMinsAgo: 0, touched: Date.now() } : l)));

  const remove = (id: string) => {
    const index = lines.findIndex((l) => l.medicineId === id);
    setRemoved({ line: lines[index], index });
    setLines((ls) => ls.filter((l) => l.medicineId !== id));
  };

  const undo = () => {
    if (!removed) return;
    setLines((ls) => [...ls.slice(0, removed.index), removed.line, ...ls.slice(removed.index)]);
    setRemoved(null);
  };

  const carried = new Set(lines.map((l) => l.medicineId));

  return (
    <div className="flex min-h-dvh bg-paper">
      {/* Side rail */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface p-5 lg:flex">
        <Link href="/" className="flex items-center gap-2 text-green">
          <LogoMark />
          <span className="font-display text-xl font-bold text-ink">dwa</span>
          <span className="ml-1 rounded-md bg-paper-2 px-1.5 py-0.5 text-[11px] font-medium text-muted">Pharmacist</span>
        </Link>
        <div className="mt-8 rounded-xl bg-paper p-4">
          <p className="font-semibold">{pharmacy.name}</p>
          <p className="text-sm text-muted">{pharmacy.commune}</p>
        </div>
        <nav className="mt-6 space-y-1 text-sm">
          <span className="flex items-center gap-2.5 rounded-lg bg-green-soft px-3 py-2 font-medium text-green">
            <Package className="size-4" aria-hidden /> Stock
          </span>
          <Link href={`/pharmacy/${pharmacy.id}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted hover:bg-paper hover:text-ink">
            <ExternalLink className="size-4" aria-hidden /> Public page
          </Link>
        </nav>
        <Link href="/" className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-paper hover:text-ink">
          <LogOut className="size-4" aria-hidden /> Sign out
        </Link>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-wrap items-center gap-4">
          <div className="mr-auto">
            <p className="text-sm text-muted lg:hidden">{pharmacy.name}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Stock</h1>
          </div>
          <DutySwitch on={onDuty} onChange={setOnDuty} />
          <AddMedicineDialog
            options={medicines.filter((m) => !carried.has(m.id))}
            onAdd={(medicineId, qty, expiry) =>
              setLines((ls) => [...ls, { pharmacyId: PHARMACY_ID, medicineId, qty, expiry, updatedMinsAgo: 0, touched: Date.now() }])
            }
          />
        </header>

        {/* Tiles double as filters */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label="Lines carried" value={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
          <Tile label={`Low (≤ ${LOW_THRESHOLD})`} value={counts.low} tone="amber" active={filter === "low"} onClick={() => setFilter("low")} />
          <Tile label="Out of stock" value={counts.out} tone="danger" active={filter === "out"} onClick={() => setFilter("out")} />
          <Tile label={`Expire within ${EXPIRY_WINDOW_DAYS} days`} value={now ? counts.expiring : null} tone="amber" active={filter === "expiring"} onClick={() => setFilter("expiring")} />
        </div>

        {attention > 0 && filter === "all" && (
          <button
            type="button"
            onClick={() => setFilter("attention")}
            className="mt-4 flex w-full items-center gap-3 rounded-xl bg-amber-soft px-4 py-3 text-left text-sm text-amber-ink"
          >
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">
              <strong>{attention} lines</strong> need attention before patients start getting turned away.
            </span>
            <span className="font-medium underline underline-offset-4">Show them</span>
          </button>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex h-10 w-full items-center gap-2 rounded-xl bg-surface px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-green sm:w-72">
            <Search className="size-4 text-muted" aria-hidden />
            <span className="sr-only">Search stock</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your stock…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
          </label>
          {filter !== "all" && (
            <button type="button" onClick={() => setFilter("all")} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper">
              Showing: {filter === "attention" ? "needs attention" : filter}
              <X className="size-3" aria-hidden />
            </button>
          )}
        </div>

        <div className="surface mt-4 overflow-x-auto rounded-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Medicine</th>
                <th className="px-5 py-3 font-medium">Quantity</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Expiry</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {visible.map((l, i) => {
                const days = daysLeft(l.expiry);
                const expiring = isExpiring(l);
                return (
                  <tr key={l.medicineId} className="row-in" style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}>
                    <td className="px-5 py-3">
                      <p className="font-medium">
                        {l.medicine.name} <span className="font-mono text-xs text-muted">{l.medicine.dosage}</span>
                      </p>
                      <p className="text-xs text-muted">{l.medicine.dci}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="inline-flex items-center rounded-lg bg-surface ring-1 ring-line">
                        <button type="button" onClick={() => setQty(l.medicineId, l.qty - 1)} disabled={l.qty === 0} aria-label={`One less ${l.medicine.name}`} className="grid size-9 place-items-center rounded-l-lg text-muted hover:bg-paper hover:text-ink disabled:opacity-30">
                          <Minus className="size-3.5" />
                        </button>
                        <input
                          key={l.touched}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={l.qty}
                          onChange={(e) => setQty(l.medicineId, Number(e.target.value) || 0)}
                          aria-label={`${l.medicine.name} quantity`}
                          className={`qty-input h-9 w-12 bg-transparent text-center font-mono nums outline-none ${l.touched ? "qty-bump" : ""}`}
                        />
                        <button type="button" onClick={() => setQty(l.medicineId, l.qty + 1)} aria-label={`One more ${l.medicine.name}`} className="grid size-9 place-items-center rounded-r-lg text-muted hover:bg-paper hover:text-ink">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={statusOf(l.qty)} /></td>
                    <td className={`px-5 py-3 font-mono text-xs nums ${expiring ? "font-medium text-amber-ink" : "text-muted"}`}>
                      {dateFmt.format(new Date(l.expiry))}
                      {expiring && <span className="ml-1.5">· {days < 0 ? "expired" : `${days} d`}</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{fmtUpdated(l.updatedMinsAgo)}</td>
                    <td className="px-5 py-3 text-right">
                      <button type="button" onClick={() => remove(l.medicineId)} aria-label={`Stop listing ${l.medicine.name}`} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visible.length && (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold">{lines.length ? "Nothing here." : "You haven't listed any medicine yet."}</p>
              <p className="mt-1 text-sm text-muted">
                {filter !== "all" || q ? "No line matches this search or filter." : "Add your first line so patients can find it."}
              </p>
            </div>
          )}
        </div>
      </main>

      {removed && (
        <div role="status" className="toast-in fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-ink px-4 py-3 text-sm text-paper shadow-lg">
          <span>{medicines.find((m) => m.id === removed.line.medicineId)?.name} removed from your list</span>
          <button type="button" onClick={undo} className="inline-flex items-center gap-1.5 font-medium text-neon">
            <Undo2 className="size-4" aria-hidden /> Undo
          </button>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, tone, active, onClick }: { label: string; value: number | null; tone?: "amber" | "danger"; active: boolean; onClick: () => void }) {
  const color = !value ? "text-ink" : tone === "amber" ? "text-amber-ink" : tone === "danger" ? "text-danger" : "text-ink";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl bg-surface p-4 text-left ring-1 transition-shadow duration-150 ${active ? "ring-2 ring-ink" : "ring-line hover:ring-ink/30"}`}
    >
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-medium nums ${color}`}>{value ?? "–"}</p>
    </button>
  );
}

function DutySwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex h-10 items-center gap-3 rounded-full pr-4 pl-1.5 text-sm font-medium ring-1 transition-colors duration-200 ${on ? "bg-night text-neon ring-night" : "bg-surface text-ink ring-line"}`}
    >
      <span className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${on ? "bg-neon/25" : "bg-paper-2"}`}>
        <span className={`absolute top-1 left-1 size-5 rounded-full transition-transform duration-200 ease-[var(--ease-out-quint)] ${on ? "translate-x-5 bg-neon" : "bg-muted"}`} />
      </span>
      De garde tonight
    </button>
  );
}
