"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, BellRing, Check, FileText, Lock, Minus, Moon, Package, Plus, ScanBarcode, Search, Trash2, TrendingUp, X } from "lucide-react";
import { getMedicine, getPharmacy, medicines, stock as demoStock, type StockItem } from "@/lib/data";
import { BARCODES } from "@/lib/extras";
import { fmtPrice, fmtUpdated, statusOf } from "@/lib/finder";
import { answerPrescription, updateReservation, useAlerts, usePrescriptions, usePro, useReservations, type Prescription } from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import { StockChip, Pill as Tag } from "./ui";
import { useCornerBlob } from "./ui";

const PHARMACY_ID = "kouba-garidi";
type Line = StockItem & { flash?: number };
type Filter = "all" | "attention" | "out" | "expiring";
const SECTIONS = [
  { id: "stock", label: "Stock", Icon: Package },
  { id: "reservations", label: "Reservations", Icon: BellRing },
  { id: "prescriptions", label: "Prescriptions", Icon: FileText },
  { id: "demand", label: "Missed demand", Icon: TrendingUp },
] as const;
type Section = (typeof SECTIONS)[number]["id"];

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });
const day = new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });

export function Dashboard() {
  const p = getPharmacy(PHARMACY_ID)!;
  const pro = usePro();
  const now = useNow();
  const [lines, setLines] = useState<Line[]>(() => demoStock.filter((s) => s.pharmacyId === PHARMACY_ID).map((s) => ({ ...s })));
  const [section, setSection] = useState<Section>("stock");
  const [onDuty, setOnDuty] = useState(p.onDuty);
  const reservations = useReservations().filter((r) => r.pharmacyId === PHARMACY_ID);
  const prescriptions = usePrescriptions().filter((x) => x.pharmacyId === PHARMACY_ID);
  const fresh = reservations.filter((r) => r.status === "requested").length;
  const toAnswer = prescriptions.filter((x) => x.status === "sent").length;

  useEffect(() => {
    const h = new URLSearchParams(location.search).get("tab") ?? location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL
    if (SECTIONS.some((s) => s.id === h)) setSection(h as Section);
  }, []);

  const daysLeft = (iso: string) => (now ? Math.floor((Date.parse(iso) - now.getTime()) / 86_400_000) : Infinity);
  const expiring = lines.filter((l) => l.qty > 0 && daysLeft(l.expiry) <= 90).length;
  const out = lines.filter((l) => l.qty === 0).length;
  const low = lines.filter((l) => statusOf(l.qty) === "low").length;

  const setQty = (id: string, qty: number) => setLines((ls) => ls.map((l) => (l.medicineId === id ? { ...l, qty: Math.max(0, Math.min(999, qty)), updatedMinsAgo: 0, flash: Date.now() } : l)));
  const badge: Partial<Record<Section, number>> = { reservations: fresh, prescriptions: toAnswer };

  useCornerBlob("pearl");
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-24 pb-12 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
      <aside className="card card-solid in min-w-0 p-4 lg:sticky lg:top-24">
        <div className="rounded-[20px] bg-(--l-bg) p-4">
          <p className="text-[13px] font-semibold text-(--l-lilac)">Pharmacist</p>
          <p className="mt-1 flex items-center gap-1.5 text-[18px] font-semibold">
            {p.name.replace("Pharmacie ", "")}
            {pro && <BadgeCheck className="size-5 text-(--l-in)" aria-label="Verified, dwa Pro" />}
          </p>
          <p className="text-[13px] text-(--l-faint)">
            {p.pharmacist} · {p.commune}
          </p>
        </div>
        <nav aria-label="Dashboard sections" className="mt-3 flex gap-1 overflow-x-auto lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              aria-current={section === s.id ? "page" : undefined}
              onClick={() => (setSection(s.id), history.replaceState(null, "", `?tab=${s.id}`))}
              className={`flex h-11 shrink-0 items-center gap-3 rounded-2xl px-4 text-start font-medium transition-colors duration-200 ${section === s.id ? "bg-(--l-ink) text-white" : "text-(--l-muted) hover:bg-(--l-bg) hover:text-(--l-ink)"}`}
            >
              <s.Icon className="size-4" aria-hidden /> {s.label}
              {!!badge[s.id] && <span className={`ms-auto grid size-5 place-items-center rounded-full text-[11px] font-bold nums ${section === s.id ? "bg-white text-(--l-ink)" : "bg-(--l-lilac) text-white"}`}>{badge[s.id]}</span>}
            </button>
          ))}
        </nav>
        <button role="switch" aria-checked={onDuty} onClick={() => setOnDuty((v) => !v)} className="mt-3 flex h-12 w-full items-center justify-between gap-3 rounded-2xl bg-(--l-bg) ps-4 pe-1.5 text-[14px] font-medium">
          <span className="flex items-center gap-2">
            <Moon className="size-4 text-(--l-lilac)" aria-hidden /> On duty tonight
          </span>
          <span className={`relative h-8 w-14 rounded-full transition-colors duration-200 ${onDuty ? "bg-(--l-lilac)" : "bg-(--l-line-2)"}`}>
            <span className={`absolute start-0 top-1 size-6 rounded-full bg-white shadow transition-transform duration-200 ${onDuty ? "translate-x-7" : "translate-x-1"}`} style={{ transitionTimingFunction: "var(--l-spring)" }} />
          </span>
        </button>
        <Link href={`/v8/pharmacy/${p.id}`} className="mt-3 flex h-11 items-center rounded-2xl px-4 text-[14px] text-(--l-muted) hover:bg-(--l-bg) hover:text-(--l-ink)">
          Your public page
        </Link>
      </aside>

      <div className="min-w-0">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ["References", lines.length, "on your shelf list", "ink"],
          ["Few left or out", low + out, `${out} out of stock`, low + out ? "low" : "ink"],
          ["Expiring in 90 days", expiring, "sell these first", expiring ? "out" : "ink"],
          ["New reservations", fresh, fresh ? "waiting for you" : "all answered", fresh ? "in" : "ink"],
        ].map(([l, v, s, c]) => (
          <div key={l as string} className="card in p-5">
            <p className="text-[13px] text-(--l-muted)">{l}</p>
            <p className="display mt-2 text-[52px] leading-none nums" style={{ color: `var(--l-${c})` }}>
              {v}
            </p>
            <p className="mt-1 text-[13px] text-(--l-faint)">{s}</p>
          </div>
        ))}
      </div>

      <div key={section} className="in mt-6">
        {section === "stock" && <Stock lines={lines} setLines={setLines} setQty={setQty} daysLeft={daysLeft} />}
        {section === "reservations" && <Inbox lines={lines} setQty={setQty} />}
        {section === "prescriptions" && <RxInbox list={prescriptions} />}
        {section === "demand" && <Demand lines={lines} />}
      </div>
      </div>
    </div>
  );
}

/* ---------- stock ---------- */

function Stock({ lines, setLines, setQty, daysLeft }: { lines: Line[]; setLines: React.Dispatch<React.SetStateAction<Line[]>>; setQty: (id: string, q: number) => void; daysLeft: (iso: string) => number }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [scan, setScan] = useState("");
  const [msg, setMsg] = useState<{ text: string; tone: "in" | "out" } | null>(null);
  const [removed, setRemoved] = useState<{ line: Line; index: number } | null>(null);
  const [adding, setAdding] = useState("");
  const scanRef = useRef<HTMLInputElement>(null);
  const carried = new Set(lines.map((l) => l.medicineId));

  const visible = useMemo(
    () =>
      lines
        .map((l) => ({ ...l, m: getMedicine(l.medicineId)! }))
        .filter((l) => !q || (l.m.name + l.m.dci).toLowerCase().includes(q.toLowerCase()))
        .filter((l) => (filter === "out" ? l.qty === 0 : filter === "attention" ? statusOf(l.qty) !== "in" : filter === "expiring" ? l.qty > 0 && daysLeft(l.expiry) <= 90 : true))
        .sort((a, b) => a.m.name.localeCompare(b.m.name)),
    [lines, q, filter, daysLeft],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <section className="card p-2" aria-label="Stock">
        <div className="flex flex-wrap items-center gap-2 p-3">
          {(
            [
              ["all", "All"],
              ["attention", "Needs attention"],
              ["out", "Out"],
              ["expiring", "Expiring"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)} className={`pill bg-white shadow-[0_0_0_1px_var(--l-line)] ${filter === k ? "bg-(--l-ink)! text-white! shadow-[inset_0_0_0_1px_var(--l-line-2)]" : ""}`}>
              {l}
            </button>
          ))}
          <label className="relative ms-auto w-full sm:w-56">
            <span className="sr-only">Filter stock</span>
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-(--l-faint)" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter" className="input h-10 ps-10 text-[15px]" />
          </label>
        </div>
        <ul>
          {visible.map((l) => {
            const d = daysLeft(l.expiry);
            return (
              <li key={`${l.medicineId}-${l.flash ?? 0}`} className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-3 hover:bg-white ${l.flash ? "flash" : ""}`}>
                <div className="min-w-44 flex-1">
                  <p className="font-semibold">
                    {l.m.name} <span className="font-normal text-(--l-muted)">{l.m.dosage}</span>
                  </p>
                  <p className="text-[12.5px] text-(--l-faint)">
                    updated {fmtUpdated(l.updatedMinsAgo)} · expires <span className={d <= 90 && l.qty > 0 ? "text-(--l-out)" : ""}>{day.format(Date.parse(l.expiry))}</span>
                  </p>
                </div>
                <StockChip status={statusOf(l.qty)} />
                <span className="flex items-center rounded-full bg-(--l-bg) p-1 shadow-[inset_0_0_0_1px_var(--l-line)]">
                  <button className="grid size-9 place-items-center rounded-full hover:bg-(--l-sunk) disabled:opacity-30" onClick={() => setQty(l.medicineId, l.qty - 1)} disabled={l.qty === 0} aria-label={`One less ${l.m.name}`}>
                    <Minus className="size-4" />
                  </button>
                  <input value={l.qty} onChange={(e) => setQty(l.medicineId, Number(e.target.value) || 0)} inputMode="numeric" aria-label={`Boxes of ${l.m.name}`} className="w-12 bg-transparent text-center font-semibold outline-none nums" />
                  <button className="grid size-9 place-items-center rounded-full hover:bg-(--l-sunk)" onClick={() => setQty(l.medicineId, l.qty + 1)} aria-label={`One more ${l.m.name}`}>
                    <Plus className="size-4" />
                  </button>
                </span>
                <button
                  className="grid size-9 place-items-center rounded-full text-(--l-faint) hover:bg-(--l-sunk) hover:text-(--l-out)"
                  aria-label={`Stop listing ${l.m.name}`}
                  onClick={() => {
                    const index = lines.findIndex((x) => x.medicineId === l.medicineId);
                    setRemoved({ line: lines[index], index });
                    setLines((ls) => ls.filter((x) => x.medicineId !== l.medicineId));
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
          {visible.length === 0 && <li className="px-4 py-10 text-center text-(--l-muted)">Nothing here. Try another filter.</li>}
        </ul>
        {removed && (
          <div className="pop m-2 flex items-center gap-3 rounded-2xl bg-(--l-sunk) px-4 py-3 text-[14px]" role="status">
            {getMedicine(removed.line.medicineId)?.name} removed from your list.
            <button
              className="ms-auto font-semibold text-(--l-lilac)"
              onClick={() => {
                setLines((ls) => [...ls.slice(0, removed.index), removed.line, ...ls.slice(removed.index)]);
                setRemoved(null);
              }}
            >
              Undo
            </button>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <form
          className="card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const id = BARCODES[scan.trim()];
            if (!id) return setMsg({ text: "Unknown barcode. Check the 13 digits.", tone: "out" });
            const m = getMedicine(id)!;
            if (carried.has(id)) {
              const cur = lines.find((l) => l.medicineId === id)!;
              setQty(id, cur.qty + 1);
            } else setLines((ls) => [...ls, { pharmacyId: PHARMACY_ID, medicineId: id, qty: 1, expiry: "2027-06-30", updatedMinsAgo: 0, flash: Date.now() }]);
            setMsg({ text: `+1 ${m.name} ${m.dosage}`, tone: "in" });
            setScan("");
            scanRef.current?.focus();
          }}
        >
          <p className="flex items-center gap-2 font-semibold">
            <ScanBarcode className="size-5 text-(--l-lilac)" aria-hidden /> Scan a box
          </p>
          <p className="mt-1 text-[13px] text-(--l-faint)">A USB scanner types the code and presses Enter. Try 6130001000078.</p>
          <input ref={scanRef} value={scan} onChange={(e) => (setScan(e.target.value), setMsg(null))} inputMode="numeric" aria-label="Barcode" placeholder="EAN-13" className="input mono mt-3 h-12 text-[15px]" />
          {msg && (
            <p className="mt-2 text-[14px] font-medium" style={{ color: `var(--l-${msg.tone})` }} role="status">
              {msg.text}
            </p>
          )}
          <button className="btn btn-soft btn-sm mt-3 w-full">Add one box</button>
        </form>
        <form
          className="card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!adding) return;
            setLines((ls) => [...ls, { pharmacyId: PHARMACY_ID, medicineId: adding, qty: 10, expiry: "2027-06-30", updatedMinsAgo: 0, flash: Date.now() }]);
            setAdding("");
          }}
        >
          <p className="font-semibold">Start listing a medicine</p>
          <select value={adding} onChange={(e) => setAdding(e.target.value)} aria-label="Medicine to add" className="input mt-3 h-12 text-[15px]">
            <option value="">Choose…</option>
            {medicines
              .filter((m) => !carried.has(m.id))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.dosage}
                </option>
              ))}
          </select>
          <button className="btn btn-soft btn-sm mt-3 w-full" disabled={!adding}>
            Add with 10 boxes
          </button>
        </form>
      </aside>
    </div>
  );
}

/* ---------- reservations ---------- */

function Inbox({ lines, setQty }: { lines: Line[]; setQty: (id: string, q: number) => void }) {
  const list = useReservations().filter((r) => r.pharmacyId === PHARMACY_ID && !["collected", "cancelled", "declined"].includes(r.status));
  const done = useReservations().filter((r) => r.pharmacyId === PHARMACY_ID && ["collected", "cancelled", "declined"].includes(r.status)).slice(0, 5);
  if (!list.length && !done.length)
    return (
      <div className="card p-10 text-center">
        <p className="text-[20px] font-semibold">No reservations yet</p>
        <p className="mx-auto mt-2 max-w-md text-(--l-muted)">Try it: open Ventoline in another tab, reserve it at Garidi, and watch it arrive here.</p>
        <Link href="/v8/search?q=Ventoline" target="_blank" className="btn btn-ink mt-6">
          Reserve as a patient
        </Link>
      </div>
    );
  return (
    <div className="space-y-3">
      {list.map((r) => {
        const m = getMedicine(r.medicineId)!;
        const shelf = lines.find((l) => l.medicineId === r.medicineId)?.qty ?? 0;
        return (
          <article key={r.code} className={`card flex flex-wrap items-center gap-4 p-5 ${r.status === "requested" ? "shadow-[0_0_0_1px_rgb(95_240_184/0.45)]" : ""}`}>
            <span className="mono font-bold text-(--l-lilac)">{r.code}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {r.qty} × {m.name} {m.dosage}
              </p>
              <p className="text-[13px] text-(--l-faint) nums">
                {r.name} · {r.phone} · {time.format(r.createdAt)} · {r.deposit === "paid" ? "deposit paid" : "no deposit"}
              </p>
            </div>
            {r.status === "requested" && (
              <>
                <button
                  className="btn btn-ink btn-sm"
                  disabled={shelf < r.qty}
                  onClick={() => {
                    updateReservation(r.code, { status: "confirmed" });
                    setQty(r.medicineId, shelf - r.qty);
                  }}
                >
                  <Check className="size-4" aria-hidden /> Set aside
                </button>
                <button className="btn btn-soft btn-sm" onClick={() => updateReservation(r.code, { status: "declined" })}>
                  <X className="size-4" aria-hidden /> Decline
                </button>
              </>
            )}
            {r.status === "confirmed" && (
              <button className="btn btn-ink btn-sm" onClick={() => updateReservation(r.code, { status: "ready" })}>
                Mark ready
              </button>
            )}
            {r.status === "ready" && (
              <button className="btn btn-soft btn-sm" onClick={() => updateReservation(r.code, { status: "collected" })}>
                Collected
              </button>
            )}
          </article>
        );
      })}
      {done.length > 0 && (
        <details className="card p-5">
          <summary className="cursor-pointer font-semibold">Recently closed ({done.length})</summary>
          <ul className="mt-3 space-y-2 text-[14px] text-(--l-muted)">
            {done.map((r) => (
              <li key={r.code} className="flex gap-3">
                <span className="mono">{r.code}</span> {getMedicine(r.medicineId)?.name} · {r.status}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/* ---------- prescriptions ---------- */

function RxInbox({ list }: { list: Prescription[] }) {
  if (!list.length)
    return (
      <div className="card p-10 text-center">
        <p className="text-[20px] font-semibold">No prescriptions yet</p>
        <p className="mx-auto mt-2 max-w-md text-(--l-muted)">Patients send photos from your pharmacy page. You answer with what you have and the total.</p>
        <Link href={`/v8/pharmacy/${PHARMACY_ID}`} target="_blank" className="btn btn-ink mt-6">
          Open your public page
        </Link>
      </div>
    );
  return (
    <ul className="space-y-3">
      {list.map((p) => (
        <RxItem key={p.id} p={p} />
      ))}
    </ul>
  );
}

function RxItem({ p }: { p: Prescription }) {
  const [msg, setMsg] = useState("");
  const [total, setTotal] = useState("");
  const [zoom, setZoom] = useState(false);
  return (
    <li className="card flex flex-wrap gap-5 p-5">
      <button onClick={() => setZoom((z) => !z)} aria-label={zoom ? "Shrink photo" : "Enlarge photo"} className={`shrink-0 overflow-hidden rounded-2xl transition-[width] duration-200 ${zoom ? "w-72" : "w-28"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
        <img src={p.image} alt="Prescription sent by a patient" className="h-full w-full object-cover" />
      </button>
      <div className="min-w-60 flex-1">
        <p className="text-[13px] text-(--l-faint) nums">
          {p.phone} · {time.format(p.createdAt)}
        </p>
        {p.note && <p className="mt-1">“{p.note}”</p>}
        {p.reply ? (
          <p className="mt-3 flex items-center gap-2 text-(--l-in)">
            <Check className="size-4" aria-hidden /> Answered: {p.reply.message} · {fmtPrice(p.reply.total)}
          </p>
        ) : (
          <form
            className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              if (msg.trim() && Number(total) > 0) answerPrescription(p.id, msg.trim(), Number(total));
            }}
          >
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="All 3 in stock, ready in 10 min" aria-label="Answer" className="input h-11 text-[15px]" />
            <input value={total} onChange={(e) => setTotal(e.target.value)} inputMode="numeric" placeholder="Total DA" aria-label="Total in dinars" className="input h-11 text-[15px] nums" />
            <button className="btn btn-ink btn-sm h-11">Send</button>
          </form>
        )}
      </div>
    </li>
  );
}

/* ---------- missed demand (Pro) ---------- */

function demoSearches(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 12 + (h % 48);
}

function Demand({ lines }: { lines: Line[] }) {
  const pro = usePro();
  const alerts = useAlerts();
  const shelf = new Map(lines.map((l) => [l.medicineId, l.qty]));
  const rows = medicines
    .filter((m) => (shelf.get(m.id) ?? 0) === 0)
    .map((m) => ({ m, n: demoSearches(m.id) + alerts.filter((a) => a.medicineId === m.id).length * 3 }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
  const max = Math.max(1, ...rows.map((r) => r.n));
  const total = rows.reduce((t, r) => t + r.n, 0);
  return (
    <section className="card relative overflow-hidden p-6">
      <h2 className="text-[20px] font-semibold">Searched near Kouba this week, not on your shelf</h2>
      <p className="mt-1 text-(--l-muted)">
        <span className="font-semibold text-(--l-low) nums">{total}</span> searches went to other pharmacies.
      </p>
      <ul className={`mt-6 space-y-3 ${pro ? "" : "blur-sm select-none"}`} aria-hidden={!pro}>
        {rows.map(({ m, n }) => (
          <li key={m.id} className="grid grid-cols-[160px_minmax(0,1fr)_48px] items-center gap-4">
            <span className="truncate">
              {m.name} {m.dosage}
            </span>
            <span className="h-2.5 rounded-full bg-(--l-sunk)">
              <span className="block h-full rounded-full bg-(--l-low)" style={{ width: `${(n / max) * 100}%` }} />
            </span>
            <span className="text-end nums">{n}</span>
          </li>
        ))}
      </ul>
      {!pro && (
        <div className="absolute inset-0 grid place-items-center bg-white/40">
          <div className="text-center">
            <Lock className="mx-auto size-7 text-(--l-lilac)" aria-hidden />
            <p className="mt-3 font-semibold">Missed demand is part of dwa Pro</p>
            <Link href="/v8/pro" className="btn btn-ink btn-sm mt-4">
              See Pro
            </Link>
          </div>
        </div>
      )}
      {pro && (
        <p className="mt-6 text-[13px] text-(--l-faint)">
          Demo figures. <Tag tone="in">Pro active</Tag>
        </p>
      )}
    </section>
  );
}
