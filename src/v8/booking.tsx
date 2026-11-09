"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Minus, PackageCheck, Phone, Plus, ShieldCheck, Star } from "lucide-react";
import { getMedicine, getPharmacy, stock } from "@/lib/data";
import { fmtPrice } from "@/lib/finder";
import { createReservation, DEPOSIT_DZD, HOLD_HOURS, HOLD_HOURS_WITH_DEPOSIT, updateReservation, useReservations, validPhone, type Reservation } from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import { setBlob, TINTS } from "./blob";
import { Pill, useCornerBlob } from "./ui";

/* ---------- reserve: a 3-step wizard ---------- */

export function ReserveView({ ph, med }: { ph: string; med: string }) {
  useCornerBlob("pearl");
  const router = useRouter();
  const p = getPharmacy(ph);
  const m = getMedicine(med);
  const available = stock.find((s) => s.pharmacyId === ph && s.medicineId === med)?.qty ?? 0;
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deposit, setDeposit] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!p || !m || available === 0)
    return (
      <div className="mx-auto max-w-xl px-6 pt-40 text-center">
        <h1 className="display text-6xl">Not available here</h1>
        <p className="mt-4 text-(--l-muted)">This pharmacy has none of it on the shelf right now.</p>
        <Link href={m ? `/v8/search?q=${encodeURIComponent(m.name)}` : "/v8/search"} className="btn btn-ink mt-8">
          See other pharmacies
        </Link>
      </div>
    );

  const max = Math.min(5, available);
  const total = m.priceDzd * qty;
  const steps = ["Boxes", "You", "Hold"];

  const next = async () => {
    setErr(null);
    if (step === 1) {
      if (name.trim().length < 2) return setErr("Enter your name as it is on your ID.");
      if (!validPhone(phone)) return setErr("Enter an Algerian mobile number, like 0550 12 34 56.");
    }
    if (step < 2) return setStep(step + 1);
    const r = createReservation({ pharmacyId: p.id, medicineId: m.id, qty, name, phone, withDeposit: deposit });
    if (!deposit) return router.push(`/v8/reservation/${r.code}`);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "deposit", ref: r.code, version: "v8" }) });
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error();
      location.assign(data.url);
    } catch {
      router.push(`/v8/reservation/${r.code}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pt-28 pb-12">
      <p className="text-[14px] text-(--l-muted)">
        Reserving at <span className="font-semibold text-(--l-ink)">{p.name}</span>
      </p>
      <h1 className="display mt-2 text-[clamp(2.6rem,6vw,4.4rem)]">
        {m.name} <span className="text-(--l-faint)">{m.dosage}</span>
      </h1>

      <ol className="mt-8 flex gap-2" aria-label="Steps">
        {steps.map((s, i) => (
          <li key={s} className="flex-1" aria-current={i === step ? "step" : undefined}>
            <span className="block h-1.5 overflow-hidden rounded-full bg-(--l-sunk)">
              <span className="block h-full origin-left rounded-full bg-(--l-ink) transition-transform duration-500" style={{ transform: `scaleX(${i <= step ? 1 : 0})`, transitionTimingFunction: "var(--l-ease)" }} />
            </span>
            <span className={`mt-2 block text-[13px] ${i <= step ? "font-semibold" : "text-(--l-faint)"}`}>
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      <form
        noValidate
        className="card card-solid mt-6 overflow-hidden p-7 sm:p-9"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <div key={step} className="in min-h-[220px]">
          {step === 0 && (
            <div className="flex flex-col items-center text-center">
              <p className="font-semibold">How many boxes?</p>
              <p className="text-[14px] text-(--l-faint) nums">
                {available} on the shelf · up to {max}
              </p>
              <div className="mt-6 flex items-center gap-6">
                <button type="button" className="grid size-14 place-items-center rounded-full bg-(--l-bg) hover:bg-(--l-sunk) disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="One box less">
                  <Minus className="size-5" />
                </button>
                <span className="display w-24 text-[96px] leading-none nums" aria-live="polite">
                  {qty}
                </span>
                <button type="button" className="grid size-14 place-items-center rounded-full bg-(--l-bg) hover:bg-(--l-sunk) disabled:opacity-30" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} aria-label="One box more">
                  <Plus className="size-5" />
                </button>
              </div>
              <p className="mt-6 text-[15px] text-(--l-muted) nums">{fmtPrice(total)} at the counter</p>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <label className="block">
                <span className="font-semibold">Your name</span>
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="input mt-2" />
              </label>
              <label className="block">
                <span className="font-semibold">Mobile number</span>
                <span className="block text-[13px] text-(--l-faint)">The pharmacy texts you when it is ready. Shared with this pharmacy only.</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="0550 12 34 56" className="input mt-2" />
              </label>
            </div>
          )}
          {step === 2 && (
            <fieldset>
              <legend className="font-semibold">How long should they hold it?</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { v: true, t: `${HOLD_HOURS_WITH_DEPOSIT} hours`, s: `${fmtPrice(DEPOSIT_DZD)} now by EDAHABIA or CIB, taken off the price` },
                  { v: false, t: `${HOLD_HOURS} hours`, s: "Free, nothing to pay now" },
                ].map((o) => (
                  <label key={String(o.v)} className={`flex cursor-pointer flex-col rounded-[22px] p-5 transition-shadow duration-200 ${deposit === o.v ? "bg-(--l-lilac-soft) shadow-[inset_0_0_0_2px_var(--l-lilac)]" : "bg-(--l-bg) shadow-[inset_0_0_0_1px_var(--l-line)]"}`}>
                    <input type="radio" name="deposit" checked={deposit === o.v} onChange={() => setDeposit(o.v)} className="sr-only" />
                    <span className="display text-[34px]">{o.t}</span>
                    <span className="mt-1 text-[14px] text-(--l-muted)">{o.s}</span>
                  </label>
                ))}
              </div>
              <dl className="mt-6 space-y-1.5 text-[15px] nums">
                <div className="flex justify-between">
                  <dt className="text-(--l-muted)">
                    {qty} × {m.name}
                  </dt>
                  <dd>{fmtPrice(total)}</dd>
                </div>
                {deposit && (
                  <div className="flex justify-between">
                    <dt className="text-(--l-muted)">Deposit now</dt>
                    <dd>− {fmtPrice(DEPOSIT_DZD)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-(--l-line) pt-2 text-[17px] font-semibold">
                  <dt>At the counter</dt>
                  <dd>{fmtPrice(total - (deposit ? DEPOSIT_DZD : 0))}</dd>
                </div>
              </dl>
            </fieldset>
          )}
        </div>
        {err && (
          <p role="alert" className="mt-4 text-[14px] text-(--l-out)">
            {err}
          </p>
        )}
        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <button type="button" className="btn btn-soft" onClick={() => (setStep(step - 1), setErr(null))}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </button>
          )}
          <button className="btn btn-ink ms-auto" disabled={busy}>
            {step < 2 ? (
              <>
                Continue <ArrowRight className="size-4" aria-hidden />
              </>
            ) : busy ? (
              "Opening payment…"
            ) : deposit ? (
              `Pay ${fmtPrice(DEPOSIT_DZD)} and reserve`
            ) : (
              "Reserve"
            )}
          </button>
        </div>
        {m.rx && <p className="mt-5 text-[13px] text-(--l-faint)">Bring your prescription when you collect.</p>}
      </form>
      <p className="mt-4 flex items-center gap-2 text-[13px] text-(--l-faint)">
        <ShieldCheck className="size-4" aria-hidden /> No account needed for the demo.
      </p>
    </div>
  );
}

/* ---------- reservation ticket ---------- */

const STAGES = ["requested", "confirmed", "ready"] as const;
const LABEL: Record<Reservation["status"], string> = { requested: "Waiting for the pharmacy", confirmed: "Confirmed, being prepared", ready: "Ready at the counter", collected: "Collected", declined: "Declined by the pharmacy", cancelled: "Cancelled" };
const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });

export function ReservationView({ code, paid }: { code: string; paid: string | null }) {
  const r = useReservations().find((x) => x.code === code);
  const now = useNow();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // The blob becomes the ticket.
    const narrow = innerWidth < 768;
    setBlob({ morph: 3, merge: 1, tint: r?.status === "ready" ? TINTS.found : TINTS.pearl, x: narrow ? 0 : (innerWidth / innerHeight) * 0.62, y: narrow ? 0.72 : 0.1, scale: narrow ? 0.4 : 0.8 });
  }, [r?.status]);
  useEffect(() => {
    if (r && paid === "1" && r.deposit !== "paid") updateReservation(r.code, { deposit: "paid" });
  }, [paid, r]);
  useEffect(() => {
    if (!r || r.pharmacyId === "kouba-garidi") return;
    const next = r.status === "requested" ? "confirmed" : r.status === "confirmed" ? "ready" : null;
    if (!next) return;
    const t = setTimeout(() => updateReservation(r.code, { status: next }), r.status === "requested" ? 4000 : 6000);
    return () => clearTimeout(t);
  }, [r]);

  if (!r)
    return (
      <div className="mx-auto max-w-xl px-6 pt-40 text-center">
        <h1 className="display text-6xl">Not found</h1>
        <p className="mt-4 text-(--l-muted)">In this demo, reservations live in this browser only.</p>
        <Link href="/v8/search" className="btn btn-ink mt-8">
          Search for a medicine
        </Link>
      </div>
    );

  const p = getPharmacy(r.pharmacyId)!;
  const m = getMedicine(r.medicineId)!;
  const stage = STAGES.indexOf(r.status as (typeof STAGES)[number]);
  const active = stage >= 0;
  const ring = active ? (stage + 1) / 3 : r.status === "collected" ? 1 : 0;
  const due = m.priceDzd * r.qty - (r.deposit === "paid" ? DEPOSIT_DZD : 0);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-12">
      <div className="max-w-xl">
        <section className="card card-solid pop overflow-hidden" aria-live="polite">
          <div className="flex items-center gap-5 p-7">
            <svg viewBox="0 0 64 64" className="size-20 shrink-0 -rotate-90" aria-hidden>
              <circle cx="32" cy="32" r="27" fill="none" stroke="var(--l-sunk)" strokeWidth="6" />
              <circle cx="32" cy="32" r="27" fill="none" stroke={r.status === "ready" || r.status === "collected" ? "var(--l-in)" : "var(--l-lilac)"} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${ring * 170} 170`} className="transition-[stroke-dasharray] duration-700" />
            </svg>
            <div>
              <p className={`font-semibold ${r.status === "ready" ? "text-(--l-in)" : ""}`}>{LABEL[r.status]}</p>
              <p className="text-[14px] text-(--l-muted)">
                {r.qty} × {m.name} {m.dosage} · {p.name}
              </p>
            </div>
          </div>
          {/* Ticket perforation */}
          <div className="relative h-0 border-t-2 border-dashed border-(--l-line-2)">
            <span className="absolute -start-4 -top-4 size-8 rounded-full bg-(--l-bg)" />
            <span className="absolute -end-4 -top-4 size-8 rounded-full bg-(--l-bg)" />
          </div>
          <div className="p-7 text-center">
            <p className="text-[13px] text-(--l-faint)">Show this code at the counter</p>
            <p className="mono mt-2 text-[clamp(2.4rem,9vw,3.8rem)] font-bold tracking-[0.08em]">{r.code}</p>
            <button
              className="btn btn-soft btn-sm mt-4"
              onClick={() => {
                navigator.clipboard?.writeText(r.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />} {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        </section>

        <dl className="card mt-4 divide-y divide-(--l-line) px-6 py-2 text-[15px]">
          {[
            ["Held until", `${clock.format(r.holdUntil)}${now && now.getTime() > r.holdUntil && active ? " (expired)" : ""}`],
            ["Deposit", r.deposit === "paid" ? `${fmtPrice(DEPOSIT_DZD)} paid` : r.deposit === "pending" ? (paid === "0" ? "Payment not completed" : "Payment pending") : "No deposit"],
            ["At the counter", fmtPrice(due)],
            ["Address", `${p.address}, ${p.commune}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-3">
              <dt className="text-(--l-muted)">{k}</dt>
              <dd className="text-end font-medium nums">{v}</dd>
            </div>
          ))}
        </dl>

        {r.status === "requested" && r.pharmacyId === "kouba-garidi" && (
          <p className="card mt-4 p-5 text-[15px]">
            Demo: play the pharmacist.{" "}
            <Link href="/v8/dashboard?tab=reservations" target="_blank" className="font-semibold text-(--l-lilac) underline underline-offset-4">
              Open the dashboard in a new tab
            </Link>{" "}
            and set it aside. This ticket updates by itself.
          </p>
        )}
        {r.status === "collected" && (
          <div className="card mt-4 flex flex-wrap items-center gap-3 p-5">
            <span className="font-semibold">Rate {p.name.replace("Pharmacie ", "")}</span>
            <span className="flex" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="radio" aria-checked={r.rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => updateReservation(r.code, { rating: n })} className="grid size-10 place-items-center rounded-full hover:bg-(--l-sunk)">
                  <Star className={`size-5 ${r.rating && n <= r.rating ? "fill-(--l-low) text-(--l-low)" : "text-(--l-faint)"}`} />
                </button>
              ))}
            </span>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="btn btn-soft">
            <Phone className="size-4" aria-hidden /> Call
          </a>
          {r.status === "ready" && (
            <button className="btn btn-ink" onClick={() => updateReservation(r.code, { status: "collected" })}>
              <PackageCheck className="size-4" aria-hidden /> I collected it
            </button>
          )}
          {active && (
            <button className="btn btn-soft text-(--l-out)" onClick={() => updateReservation(r.code, { status: "cancelled" })}>
              Cancel
            </button>
          )}
          {m.rx && <Pill tone="low">Bring your prescription</Pill>}
        </div>
      </div>
    </div>
  );
}
