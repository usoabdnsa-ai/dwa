"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgeCheck, BellRing, ExternalLink, LogOut, Minus, Plus, Search, Sparkles, Trash2, TriangleAlert, Package, Undo2, X } from "lucide-react";
import { getPharmacy, medicines, stock as demoStock, type StockItem } from "@/lib/data";
import { LOW_THRESHOLD, statusOf } from "@/lib/finder";
import { agoText } from "@/lib/i18n";
import { useT } from "@/lib/locale";
import { LanguageSwitcher } from "../language-switcher";
import { useNow } from "@/lib/use-now";
import { LogoMark } from "../logo";
import { StatusBadge } from "../status";
import { usePro, useReferralCount, useReservations } from "@/lib/reservations";
import { AddMedicineDialog } from "./add-medicine-dialog";
import { DemandPanel } from "./demand-panel";
import { PrescriptionsInbox } from "./prescriptions-inbox";
import { ReferDialog } from "./refer-dialog";
import { ScanDialog } from "./scan-dialog";
import { ReservationsInbox } from "./reservations-inbox";

const PHARMACY_ID = "kouba-garidi";
const EXPIRY_WINDOW_DAYS = 90;

type Filter = "all" | "attention" | "low" | "out" | "expiring";
type Line = StockItem & { touched?: number };


export function StockManager() {
  const { t, intl } = useT();
  const dateFmt = new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const pharmacy = getPharmacy(PHARMACY_ID)!;
  const now = useNow();
  const [lines, setLines] = useState<Line[]>(() => demoStock.filter((s) => s.pharmacyId === PHARMACY_ID).map((s) => ({ ...s })));
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [onDuty, setOnDuty] = useState(pharmacy.onDuty);
  const [removed, setRemoved] = useState<{ line: Line; index: number } | null>(null);
  const pro = usePro();
  const referrals = useReferralCount();
  const newReservations = useReservations().filter((r) => r.pharmacyId === PHARMACY_ID && r.status === "requested").length;

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
      <aside className="dusk-band sticky top-0 hidden h-dvh w-64 shrink-0 flex-col p-5 lg:flex">
        <Link href="/" className="flex items-center gap-2 text-dusk-mint">
          <LogoMark className="size-7 [--color-paper:var(--color-dusk)]" />
          <span className="font-display text-xl font-bold text-dusk-ink">dwa</span>
          <span className="ms-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-dusk-muted">{t("dash.pharmacist")}</span>
        </Link>
        <div className="night-card mt-8 rounded-xl p-4">
          <p className="flex items-center gap-1.5 font-semibold">
            {pharmacy.name}
            {pro && <BadgeCheck className="size-4 text-dusk-mint" aria-label={t("dash.verified")} />}
          </p>
          <p className="text-sm text-dusk-muted">{pharmacy.commune}</p>
        </div>
        <nav className="mt-6 space-y-1 text-sm">
          <span className="flex items-center gap-2.5 rounded-lg bg-dusk-mint/10 px-3 py-2 font-medium text-dusk-mint">
            <Package className="size-4" aria-hidden /> {t("dash.stock")}
          </span>
          <a href="#reservations" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-dusk-muted hover:bg-white/5 hover:text-dusk-ink">
            <BellRing className="size-4" aria-hidden /> {t("dash.reservations")}
            {newReservations > 0 && <span className="ms-auto rounded-full bg-dusk-mint px-1.5 font-mono text-[11px] font-semibold text-[#06241f]">{newReservations}</span>}
          </a>
          <Link href={`/pharmacy/${pharmacy.id}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-dusk-muted hover:bg-white/5 hover:text-dusk-ink">
            <ExternalLink className="size-4 rtl:-scale-x-100" aria-hidden /> {t("dash.publicPage")}
          </Link>
          <Link href="/pro" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-dusk-muted hover:bg-white/5 hover:text-dusk-ink">
            <Sparkles className="size-4" aria-hidden /> {t("dash.pro")}
            <span className="ms-auto text-[11px] font-medium text-dusk-mint">{pro ? t("dash.proActive") : t("dash.proUpgrade")}</span>
          </Link>
        </nav>
        <p className="mt-6 rounded-lg px-3 text-xs text-dusk-muted">
          {t("dash.referred", { n: referrals })}
        </p>
        <Link href="/" className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-dusk-muted hover:bg-white/5 hover:text-dusk-ink">
          <LogOut className="size-4 rtl:-scale-x-100" aria-hidden /> {t("dash.signOut")}
        </Link>
        <div className="mt-3">
          <LanguageSwitcher />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-wrap items-center gap-4">
          <div className="me-auto">
            <p className="text-sm text-muted lg:hidden">{pharmacy.name}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{t("dash.stock")}</h1>
          </div>
          <DutySwitch on={onDuty} onChange={setOnDuty} />
          <ScanDialog
            qtyOf={(id) => lines.find((l) => l.medicineId === id)?.qty}
            onChange={(id, delta) =>
              setLines((ls) =>
                ls.some((l) => l.medicineId === id)
                  ? ls.map((l) => (l.medicineId === id ? { ...l, qty: Math.max(0, l.qty + delta), updatedMinsAgo: 0, touched: Date.now() } : l))
                  : delta > 0
                    ? [...ls, { pharmacyId: PHARMACY_ID, medicineId: id, qty: delta, expiry: new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10), updatedMinsAgo: 0, touched: Date.now() }]
                    : ls,
              )
            }
          />
          <AddMedicineDialog
            options={medicines.filter((m) => !carried.has(m.id))}
            onAdd={(medicineId, qty, expiry) =>
              setLines((ls) => [...ls, { pharmacyId: PHARMACY_ID, medicineId, qty, expiry, updatedMinsAgo: 0, touched: Date.now() }])
            }
          />
        </header>

        <div className="grid gap-x-6 xl:grid-cols-2">
          <ReservationsInbox
            pharmacyId={PHARMACY_ID}
            onCollected={(id, n) =>
              setLines((ls) => ls.map((l) => (l.medicineId === id ? { ...l, qty: Math.max(0, l.qty - n), updatedMinsAgo: 0, touched: Date.now() } : l)))
            }
          />
          <DemandPanel lines={lines} />
        </div>
        <PrescriptionsInbox pharmacyId={PHARMACY_ID} />

        {/* Tiles double as filters */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label={t("dash.carried")} value={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
          <Tile label={t("dash.low", { n: LOW_THRESHOLD })} value={counts.low} tone="amber" active={filter === "low"} onClick={() => setFilter("low")} />
          <Tile label={t("dash.outTile")} value={counts.out} tone="danger" active={filter === "out"} onClick={() => setFilter("out")} />
          <Tile label={t("dash.expiring", { n: EXPIRY_WINDOW_DAYS })} value={now ? counts.expiring : null} tone="amber" active={filter === "expiring"} onClick={() => setFilter("expiring")} />
        </div>

        {attention > 0 && filter === "all" && (
          <button
            type="button"
            onClick={() => setFilter("attention")}
            className="mt-4 flex w-full items-center gap-3 rounded-xl bg-amber-soft px-4 py-3 text-start text-sm text-amber-ink"
          >
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">
              <strong>{t("dash.attention", { n: attention })}</strong> {t("dash.attentionBody")}
            </span>
            <span className="font-medium underline underline-offset-4">{t("dash.showThem")}</span>
          </button>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex h-10 w-full items-center gap-2 rounded-xl bg-surface px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-green sm:w-72">
            <Search className="size-4 text-muted" aria-hidden />
            <span className="sr-only">{t("dash.searchStock")}</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("dash.searchStock")} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
          </label>
          {filter !== "all" && (
            <button type="button" onClick={() => setFilter("all")} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper">
              {t("dash.showing", { filter: filter === "attention" ? t("dash.f.attention") : filter === "low" ? t("dash.f.low") : filter === "out" ? t("dash.f.out") : t("dash.f.expiring") })}
              <X className="size-3" aria-hidden />
            </button>
          )}
        </div>

        <div className="surface mt-4 overflow-x-auto rounded-card">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-3 text-start font-medium">{t("dash.colMedicine")}</th>
                <th className="px-5 py-3 text-start font-medium">{t("dash.colQty")}</th>
                <th className="px-5 py-3 text-start font-medium">{t("dash.colStatus")}</th>
                <th className="px-5 py-3 text-start font-medium">{t("dash.colExpiry")}</th>
                <th className="px-5 py-3 text-start font-medium">{t("dash.colUpdated")}</th>
                <th className="px-5 py-3"><span className="sr-only">{t("dash.actions")}</span></th>
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
                        <button type="button" onClick={() => setQty(l.medicineId, l.qty - 1)} disabled={l.qty === 0} aria-label={t("dash.oneLess", { name: l.medicine.name })} className="grid size-9 place-items-center rounded-l-lg text-muted hover:bg-paper hover:text-ink disabled:opacity-30">
                          <Minus className="size-3.5" />
                        </button>
                        <input
                          key={l.touched}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={l.qty}
                          onChange={(e) => setQty(l.medicineId, Number(e.target.value) || 0)}
                          aria-label={t("dash.qtyOf", { name: l.medicine.name })}
                          className={`qty-input h-9 w-12 bg-transparent text-center font-mono nums outline-none ${l.touched ? "qty-bump" : ""}`}
                        />
                        <button type="button" onClick={() => setQty(l.medicineId, l.qty + 1)} aria-label={t("dash.oneMore", { name: l.medicine.name })} className="grid size-9 place-items-center rounded-r-lg text-muted hover:bg-paper hover:text-ink">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={statusOf(l.qty)} /></td>
                    <td className={`px-5 py-3 font-mono text-xs nums ${expiring ? "font-medium text-amber-ink" : "text-muted"}`}>
                      {dateFmt.format(new Date(l.expiry))}
                      {expiring && <span className="ms-1.5">· {days < 0 ? t("dash.expired") : t("dash.days", { n: days })}</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{agoText(t, l.updatedMinsAgo)}</td>
                    <td className="px-5 py-3 text-end">
                      <span className="inline-flex items-center gap-1.5">
                      {l.qty <= LOW_THRESHOLD && <ReferDialog fromId={PHARMACY_ID} medicine={l.medicine} />}
                      <button type="button" onClick={() => remove(l.medicineId)} aria-label={t("dash.stopListing", { name: l.medicine.name })} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger">
                        <Trash2 className="size-4" />
                      </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visible.length && (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold">{lines.length ? t("dash.nothing") : t("dash.empty")}</p>
              <p className="mt-1 text-sm text-muted">
                {filter !== "all" || q ? t("dash.noMatch") : t("dash.addFirst")}
              </p>
            </div>
          )}
        </div>
      </main>

      {removed && (
        <div role="status" className="toast-in fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-ink px-4 py-3 text-sm text-paper shadow-lg">
          <span>{t("dash.removed", { name: medicines.find((m) => m.id === removed.line.medicineId)?.name ?? "" })}</span>
          <button type="button" onClick={undo} className="inline-flex items-center gap-1.5 font-medium text-neon">
            <Undo2 className="size-4" aria-hidden /> {t("dash.undo")}
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
      className={`rounded-xl bg-surface p-4 text-start ring-1 transition-shadow duration-150 ${active ? "ring-2 ring-ink" : "ring-line hover:ring-ink/30"}`}
    >
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-medium nums ${color}`}>{value ?? "–"}</p>
    </button>
  );
}

function DutySwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const { t } = useT();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex h-10 items-center gap-3 rounded-full pr-4 pl-1.5 text-sm font-medium ring-1 transition-colors duration-200 ${on ? "bg-night text-neon ring-night" : "bg-surface text-ink ring-line"}`}
    >
      <span className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${on ? "bg-neon/25" : "bg-paper-2"}`}>
        <span className={`absolute top-1 start-1 size-5 rounded-full transition-transform duration-200 ease-[var(--ease-out-quint)] ${on ? "translate-x-5 rtl:-translate-x-5 bg-neon" : "bg-muted"}`} />
      </span>
      {t("dash.duty")}
    </button>
  );
}
