"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Clock, CreditCard, MapPin, Moon, Search, Star } from "lucide-react";
import type { Medicine } from "@/lib/data";
import { extrasOf, waitNow } from "@/lib/extras";
import { algiersMinutes, fmtKm, fmtUpdated, hoursLabel, isOpen, searchMedicines, type Availability, type Status } from "@/lib/finder";
import { useNow } from "@/lib/use-now";
import { cornerBlob, setBlob, TINTS } from "./blob";

/** Inner pages park the blob in a corner as a quiet companion. */
export function useCornerBlob(tint: keyof typeof TINTS = "pearl") {
  useEffect(() => {
    cornerBlob();
    setBlob({ tint: TINTS[tint], merge: 1 });
    const on = () => cornerBlob();
    addEventListener("resize", on);
    return () => removeEventListener("resize", on);
  }, [tint]);
}

/* ---------- status ---------- */

export const STATUS: Record<Status, { label: string; fg: string; bg: string }> = {
  in: { label: "In stock", fg: "var(--l-in)", bg: "var(--l-in-soft)" },
  low: { label: "Few left", fg: "var(--l-low)", bg: "var(--l-low-soft)" },
  out: { label: "Out of stock", fg: "var(--l-out)", bg: "var(--l-out-soft)" },
};

export function StockChip({ status, qty }: { status: Status; qty?: number }) {
  const s = STATUS[status];
  return (
    <span className="pill font-semibold" style={{ color: s.fg, background: s.bg }}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status === "out" ? s.label : qty !== undefined ? `${qty} left` : s.label}
    </span>
  );
}

export function Pill({ children, tone = "plain", title }: { children: ReactNode; tone?: "plain" | "lilac" | "in" | "low" | "out"; title?: string }) {
  const style = tone === "plain" ? { color: "var(--l-muted)", background: "rgb(255 255 255 / 0.85)", boxShadow: "0 0 0 1px var(--l-line)" } : { color: `var(--l-${tone})`, background: `var(--l-${tone}-soft)` };
  return (
    <span className="pill" style={style} title={title}>
      {children}
    </span>
  );
}

export function OpenPill({ p }: { p: Availability["pharmacy"] }) {
  const now = useNow();
  if (!now) return <span className="inline-block h-[30px] w-24" />;
  if (p.onDuty)
    return (
      <Pill tone="lilac" title="Pharmacie de garde tonight">
        <Moon className="size-3.5" aria-hidden /> On duty tonight
      </Pill>
    );
  const open = isOpen(p, algiersMinutes(now));
  return <Pill tone={open ? "in" : "out"}>{open ? `Open · ${hoursLabel(p)}` : `Closed · ${hoursLabel(p)}`}</Pill>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-medium text-(--l-muted) shadow-[0_0_0_1px_var(--l-line)]">
      <span className="breathe size-1.5 rounded-full bg-(--l-in)" aria-hidden />
      {children}
    </p>
  );
}

/* ---------- search ---------- */

export function MedicineSearch({ initial = "", size = "lg", autoFocus }: { initial?: string; size?: "lg" | "md"; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const hits = q.trim() ? searchMedicines(q).slice(0, 6) : [];

  useEffect(() => {
    const off = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    addEventListener("pointerdown", off);
    return () => removeEventListener("pointerdown", off);
  }, []);

  const go = (m?: Medicine) => {
    setOpen(false);
    const target = m ? m.name : q.trim();
    if (target) router.push(`/v8/search?q=${encodeURIComponent(target)}`);
  };
  const lg = size === "lg";

  return (
    <div ref={box} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(open && hits[sel] ? hits[sel] : hits[0]);
        }}
        className={`card card-solid flex items-center gap-2 rounded-full! p-2 shadow-[0_0_0_1px_var(--l-line),var(--l-shadow-lg)]! ${lg ? "h-[70px]" : "h-[58px]"}`}
      >
        <Search className="ms-3 size-5 shrink-0 text-(--l-faint)" aria-hidden />
        <label htmlFor={id} className="sr-only">
          Medicine name or active ingredient
        </label>
        <input
          id={id}
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-controls={`${id}-list`}
          aria-activedescendant={open && hits[sel] ? `${id}-${sel}` : undefined}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setSel(0);
            setBlob({ energy: 1 });
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(hits.length - 1, s + 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(0, s - 1));
            }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Ventoline, Doliprane, insulin…"
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--l-faint) ${lg ? "text-[18px]" : "text-[16px]"}`}
        />
        <button className={`btn btn-ink ${lg ? "h-[54px] px-7" : "h-[42px] px-5"}`}>Search</button>
      </form>
      {open && hits.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="card card-solid pop absolute inset-x-0 top-full z-30 mt-2 overflow-hidden p-1.5 text-start">
          {hits.map((m, i) => (
            <li
              key={m.id}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === sel}
              onPointerMove={() => setSel(i)}
              onPointerDown={(e) => {
                e.preventDefault();
                go(m);
              }}
              className={`flex h-12 cursor-pointer items-center gap-3 rounded-[20px] px-4 ${i === sel ? "bg-(--l-sunk)" : ""}`}
            >
              <span className="font-semibold">{m.name}</span>
              <span className="text-(--l-muted)">{m.dosage}</span>
              <span className="ms-auto truncate text-[13px] text-(--l-faint)">{m.dci}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- result tile (grid) ---------- */

export function ResultTile({ a, medicine, index = 0 }: { a: Availability; medicine: Medicine; index?: number }) {
  const now = useNow();
  const p = a.pharmacy;
  const x = extrasOf(p.id);
  const qty = a.item?.qty ?? 0;
  const s = STATUS[a.status];
  return (
    <li className="in" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}>
      <article className={`card hover-rise flex h-full flex-col p-6 ${a.status === "out" ? "opacity-75" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[18px] leading-tight font-semibold">
              <Link href={`/v8/pharmacy/${p.id}`} className="after:absolute after:inset-0 after:rounded-[inherit]">
                {p.name.replace("Pharmacie ", "")}
              </Link>
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-(--l-muted)">
              <MapPin className="size-3.5" aria-hidden /> {p.commune} · <span className="nums">{fmtKm(a.km)}</span>
            </p>
          </div>
          <ArrowUpRight className="size-5 shrink-0 text-(--l-faint)" aria-hidden />
        </div>
        <div className="mt-6 flex items-end gap-3">
          <p className="display text-[64px] leading-[0.8] nums" style={{ color: s.fg }}>
            {qty}
          </p>
          <p className="pb-1 text-[14px] font-semibold" style={{ color: s.fg }}>
            {a.status === "out" ? "none on the shelf" : qty === 1 ? "box left" : "boxes left"}
          </p>
        </div>
        <p className="mt-2 text-[12.5px] text-(--l-faint)">{a.item ? `checked ${fmtUpdated(a.item.updatedMinsAgo)}` : "not carried here"}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          <OpenPill p={p} />
          {now && (
            <Pill>
              <Clock className="size-3.5" aria-hidden /> <span className="nums">~{waitNow(p.id, algiersMinutes(now))} min</span>
            </Pill>
          )}
          <Pill>
            <Star className="size-3.5" aria-hidden /> <span className="nums">{x.rating.toFixed(1)}</span>
          </Pill>
          {x.chifa && (
            <Pill>
              <CreditCard className="size-3.5" aria-hidden /> CHIFA
            </Pill>
          )}
        </div>
        {qty > 0 && (
          <Link href={`/v8/reserve?ph=${p.id}&med=${medicine.id}`} className="btn btn-ink relative z-10 mt-6 w-full">
            Reserve here
          </Link>
        )}
      </article>
    </li>
  );
}

export function Title({ kicker, children, sub }: { kicker?: ReactNode; children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="in">
      {kicker && <Kicker>{kicker}</Kicker>}
      <h1 className="display mt-5 text-[clamp(2.8rem,6.4vw,5.4rem)]">{children}</h1>
      {sub && <div className="mt-4 max-w-2xl text-[18px] leading-relaxed text-(--l-muted)">{sub}</div>}
    </header>
  );
}
