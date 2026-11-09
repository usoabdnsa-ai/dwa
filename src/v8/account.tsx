"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, BellRing, Check, Copy, FileText, Gift, Lock, Package, Pill as PillIcon, Plus, RotateCw, Sparkles, Trash2, TrendingUp, X } from "lucide-react";
import { getMedicine, getPharmacy, medicines } from "@/lib/data";
import { UNITS_PER_BOX } from "@/lib/extras";
import { availabilityFor, fmtPrice } from "@/lib/finder";
import { addTreatment, countReferral, daysLeft, PRO_DZD, refillTreatment, REFILL_DAYS, removeAlert, removeTreatment, setPro, useAlerts, usePrescriptions, usePro, useReferralCount, useReservations, useTreatments, validPhone } from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import { setBlob, TINTS } from "./blob";
import { Mark } from "./chrome";
import { Pill, Title, useCornerBlob } from "./ui";

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });

/* ---------- My dwa ---------- */

const TABS = [
  { id: "reservations", label: "Reservations", Icon: Package },
  { id: "treatments", label: "Treatments", Icon: PillIcon },
  { id: "alerts", label: "Alerts", Icon: BellRing },
  { id: "prescriptions", label: "Prescriptions", Icon: FileText },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function MeView() {
  useCornerBlob("pearl");
  const [tab, setTab] = useState<Tab>("reservations");
  useEffect(() => {
    const h = location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL hash
    if (TABS.some((t) => t.id === h)) setTab(h as Tab);
  }, []);
  const n: Record<Tab, number> = {
    reservations: useReservations().filter((r) => ["requested", "confirmed", "ready"].includes(r.status)).length,
    treatments: useTreatments().length,
    alerts: useAlerts().length,
    prescriptions: usePrescriptions().filter((p) => p.status === "answered").length,
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pt-28 pb-12">
      <Title kicker="Stored in this browser for the demo" sub="Your reservations, the medicines you take every day, and answers from pharmacists.">
        My dwa
      </Title>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="My dwa" className="flex gap-1 overflow-x-auto rounded-full bg-white/80 p-1 shadow-[0_0_0_1px_var(--l-line)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => (setTab(t.id), history.replaceState(null, "", `#${t.id}`))}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors duration-200 ${tab === t.id ? "bg-(--l-ink) text-white" : "text-(--l-muted) hover:text-(--l-ink)"}`}
            >
              <t.Icon className="size-4" aria-hidden /> {t.label}
              {n[t.id] > 0 && <span className={`rounded-full px-1.5 text-[12px] nums ${tab === t.id ? "bg-white/20" : "bg-(--l-sunk)"}`}>{n[t.id]}</span>}
            </button>
          ))}
        </div>
        <Invite />
      </div>
      <section key={tab} className="in mt-6">
        {tab === "reservations" && <Reservations />}
        {tab === "treatments" && <Treatments />}
        {tab === "alerts" && <Alerts />}
        {tab === "prescriptions" && <Prescriptions />}
      </section>
    </div>
  );
}

function Empty({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="card p-12 text-center">
      <p className="display text-[30px]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-(--l-muted)">{text}</p>
      <Link href={href} className="btn btn-ink mt-6">
        {cta}
      </Link>
    </div>
  );
}

const R_TONE = { requested: "low", confirmed: "lilac", ready: "in", collected: "plain", declined: "out", cancelled: "plain" } as const;
const R_LABEL = { requested: "Waiting", confirmed: "Confirmed", ready: "Ready", collected: "Collected", declined: "Declined", cancelled: "Cancelled" } as const;

function Reservations() {
  const list = useReservations();
  if (!list.length) return <Empty title="Nothing reserved yet" text="Find a medicine, pick a pharmacy that has it, and set it aside for up to 4 hours." href="/v8/search" cta="Find a medicine" />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {list.map((r) => {
        const m = getMedicine(r.medicineId)!;
        return (
          <li key={r.code}>
            <Link href={`/v8/reservation/${r.code}`} className="card hover-rise block p-6">
              <div className="flex items-center justify-between">
                <span className="mono text-[15px] font-bold">{r.code}</span>
                <Pill tone={R_TONE[r.status]}>{R_LABEL[r.status]}</Pill>
              </div>
              <p className="mt-4 text-[18px] font-semibold">
                {r.qty} × {m.name} {m.dosage}
              </p>
              <p className="text-[13.5px] text-(--l-faint)">
                {getPharmacy(r.pharmacyId)?.name} · {when.format(r.createdAt)}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Treatments() {
  const list = useTreatments();
  const now = useNow();
  const [med, setMed] = useState(Object.keys(UNITS_PER_BOX)[0]);
  const [perDay, setPerDay] = useState(2);
  const [units, setUnits] = useState(30);
  return (
    <div className="space-y-4">
      {list.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((t) => {
            const m = getMedicine(t.medicineId)!;
            const box = UNITS_PER_BOX[t.medicineId];
            const left = now ? daysLeft(t, now.getTime()) : null;
            const due = left !== null && left <= REFILL_DAYS;
            const near = availabilityFor(t.medicineId).find((a) => a.status !== "out");
            return (
              <li key={t.id} className="card p-6">
                <div className="flex items-center gap-5">
                  <svg viewBox="0 0 64 64" className="size-20 shrink-0 -rotate-90" aria-hidden>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="var(--l-sunk)" strokeWidth="8" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke={due ? "var(--l-low)" : "var(--l-in)"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.min(1, (left ?? 0) / 30) * 163} 163`} />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {m.name} {m.dosage}
                    </p>
                    <p className="display text-[30px] nums">{left === null ? "…" : `${left} day${left === 1 ? "" : "s"}`}</p>
                    <p className="text-[13px] text-(--l-faint)">
                      left · {t.perDay} {box?.unit ?? "units"} a day
                    </p>
                  </div>
                  <button className="grid size-9 place-items-center self-start rounded-full text-(--l-faint) hover:bg-(--l-sunk) hover:text-(--l-out)" aria-label={`Stop tracking ${m.name}`} onClick={() => removeTreatment(t.id)}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button className="btn btn-soft btn-sm" onClick={() => refillTreatment(t.id, box?.units ?? 30)}>
                    <RotateCw className="size-4" aria-hidden /> Bought a box
                  </button>
                  {due && near && (
                    <Link href={`/v8/reserve?ph=${near.pharmacy.id}&med=${t.medicineId}`} className="btn btn-ink btn-sm">
                      Reserve at {near.pharmacy.name.replace("Pharmacie ", "")}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <form
        className="card grid gap-4 p-6 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          addTreatment(med, perDay, units);
        }}
      >
        <label>
          <span className="text-[14px] font-medium">A medicine you take every day</span>
          <select value={med} onChange={(e) => setMed(e.target.value)} className="input mt-1.5 h-12">
            {medicines
              .filter((m) => UNITS_PER_BOX[m.id])
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.dosage}
                </option>
              ))}
          </select>
        </label>
        <label>
          <span className="text-[14px] font-medium">Per day</span>
          <input type="number" min={0.5} step={0.5} value={perDay} onChange={(e) => setPerDay(Number(e.target.value) || 1)} className="input mt-1.5 h-12 nums" />
        </label>
        <label>
          <span className="text-[14px] font-medium">Left at home</span>
          <input type="number" min={0} value={units} onChange={(e) => setUnits(Number(e.target.value) || 0)} className="input mt-1.5 h-12 nums" />
        </label>
        <button className="btn btn-ink h-12">
          <Plus className="size-4" aria-hidden /> Track
        </button>
      </form>
      <p className="text-[13px] text-(--l-faint)">dwa reminds you {REFILL_DAYS} days before you run out, with the nearest pharmacy that has it.</p>
    </div>
  );
}

function Alerts() {
  const list = useAlerts();
  if (!list.length) return <Empty title="No stock alerts" text="When nobody has a medicine, leave your number and get a text when it is back." href="/v8/search" cta="Search a medicine" />;
  return (
    <ul className="space-y-3">
      {list.map((a) => {
        const m = getMedicine(a.medicineId)!;
        const back = availabilityFor(a.medicineId).find((x) => x.status !== "out");
        return (
          <li key={a.id} className="card flex flex-wrap items-center gap-4 p-5">
            <span className={`grid size-11 place-items-center rounded-2xl ${back ? "bg-(--l-in-soft) text-(--l-in)" : "bg-(--l-low-soft) text-(--l-low)"}`}>
              <BellRing className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{m.name}</span>
              <span className="text-[13px] text-(--l-faint) nums">Texts to {a.phone}</span>
            </span>
            {back ? (
              <Link href={`/v8/search?q=${encodeURIComponent(m.name)}`} className="btn btn-ink btn-sm">
                Back at {back.pharmacy.name.replace("Pharmacie ", "")}
              </Link>
            ) : (
              <Pill tone="low">Still waiting</Pill>
            )}
            <button className="grid size-9 place-items-center rounded-full text-(--l-faint) hover:bg-(--l-sunk) hover:text-(--l-out)" aria-label={`Remove alert for ${m.name}`} onClick={() => removeAlert(a.id)}>
              <Trash2 className="size-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Prescriptions() {
  const list = usePrescriptions();
  if (!list.length) return <Empty title="No prescriptions sent" text="Open a pharmacy page and send a photo of your prescription." href="/v8/tonight" cta="Choose a pharmacy" />;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {list.map((p) => (
        <li key={p.id} className="card flex gap-4 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
          <img src={p.image} alt="Prescription photo" width={96} height={96} className="size-24 shrink-0 rounded-[18px] object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{getPharmacy(p.pharmacyId)?.name}</p>
            <p className="text-[13px] text-(--l-faint)">{when.format(p.createdAt)}</p>
            {p.reply ? (
              <div className="mt-2 rounded-[16px] bg-(--l-in-soft) p-3 text-[14.5px]">
                <p>{p.reply.message}</p>
                <p className="mt-1 font-semibold text-(--l-in) nums">Total {fmtPrice(p.reply.total)}</p>
              </div>
            ) : (
              <p className="mt-2">
                <Pill tone="low">Waiting for the pharmacist</Pill>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Invite() {
  const n = useReferralCount();
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn btn-soft btn-sm ms-auto"
      onClick={() => {
        navigator.clipboard?.writeText(`${location.origin}/v8`);
        countReferral();
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Gift className="size-4 text-(--l-lilac)" aria-hidden />}
      {copied ? "Link copied" : n ? `Invite a friend · ${n} so far` : "Invite a friend"}
      {!copied && <Copy className="size-3.5 text-(--l-faint)" aria-hidden />}
    </button>
  );
}

/* ---------- sign in: blob on the left, form on the right ---------- */

export function LoginView() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "pharmacist">("patient");
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const narrow = innerWidth < 1024;
    setBlob({ morph: role === "patient" ? 1 : 2, merge: 1, tint: TINTS.pearl, x: narrow ? 0 : -(innerWidth / innerHeight) * 0.48, y: narrow ? 0.7 : 0, scale: narrow ? 0.4 : 1.05 });
  }, [role]);

  return (
    <div className="mx-auto grid min-h-[86svh] max-w-6xl items-center gap-10 px-6 pt-28 pb-12 lg:grid-cols-2">
      <div className="hidden lg:block" aria-hidden />
      <div className="card card-solid in mx-auto w-full max-w-md p-8 sm:p-10">
        <Mark className="size-10" />
        <h1 className="display mt-6 text-[40px]">Sign in</h1>
        <p className="text-(--l-muted)">Demo: any valid details work.</p>
        <div role="tablist" aria-label="Account type" className="mt-7 grid grid-cols-2 rounded-full bg-(--l-bg) p-1">
          {(["patient", "pharmacist"] as const).map((r) => (
            <button key={r} role="tab" aria-selected={role === r} onClick={() => (setRole(r), setErr(null))} className={`h-11 rounded-full text-[14px] font-medium transition-colors duration-200 ${role === r ? "bg-(--l-ink) text-white" : "text-(--l-muted)"}`}>
              {r === "patient" ? "Patient" : "Pharmacist"}
            </button>
          ))}
        </div>
        <form
          key={role}
          noValidate
          className="in mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            if (role === "patient") {
              if (!validPhone(String(d.get("phone")))) return setErr("Enter an Algerian mobile number, like 0550 12 34 56.");
              return router.push("/v8/me");
            }
            if (!/^\S+@\S+\.\S+$/.test(String(d.get("email")))) return setErr("Enter the email the pharmacy registered with.");
            if (String(d.get("password")).length < 6) return setErr("The password has at least 6 characters.");
            router.push("/v8/dashboard");
          }}
        >
          {role === "patient" ? (
            <label className="block">
              <span className="text-[14px] font-medium">Mobile number</span>
              <input name="phone" inputMode="tel" autoComplete="tel" placeholder="0550 12 34 56" className="input mt-1.5" />
              <span className="mt-1.5 block text-[13px] text-(--l-faint)">We text a 6-digit code. No password.</span>
            </label>
          ) : (
            <>
              <label className="block">
                <span className="text-[14px] font-medium">Email</span>
                <input name="email" type="email" autoComplete="email" placeholder="pharmacie@exemple.dz" className="input mt-1.5" />
              </label>
              <label className="block">
                <span className="text-[14px] font-medium">Password</span>
                <input name="password" type="password" autoComplete="current-password" className="input mt-1.5" />
              </label>
              <p className="flex gap-2 text-[13px] text-(--l-faint)">
                <BadgeCheck className="size-4 shrink-0 text-(--l-in)" aria-hidden /> New pharmacies are checked against their Ordre des pharmaciens number before going live.
              </p>
            </>
          )}
          {err && (
            <p role="alert" className="text-[14px] text-(--l-out)">
              {err}
            </p>
          )}
          <button className="btn btn-ink w-full">{role === "patient" ? "Send me a code" : "Sign in"}</button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Pro ---------- */

const ROWS: [string, boolean, boolean][] = [
  ["Listed in search with live stock", true, true],
  ["Reservations and prescription inbox", true, true],
  ["Barcode scanning", true, true],
  ["Missed demand near you", false, true],
  ["Verified badge", false, true],
  ["Weekly stock report", false, true],
];

export function ProView({ activated, cancelled }: { activated: boolean; cancelled: boolean }) {
  useCornerBlob("pearl");
  const pro = usePro();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (activated) setPro(true);
  }, [activated]);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-28 pb-12">
      <Title kicker="dwa Pro · for pharmacies" sub="Listing is free. Pro shows what people near you searched for while your shelf was empty.">
        Stock what Alger asks for
      </Title>
      {(activated || pro) && (
        <p className="pop mt-8 flex items-center gap-2 rounded-full bg-(--l-in-soft) px-5 py-3 font-semibold text-(--l-in)" role="status">
          <BadgeCheck className="size-5" aria-hidden /> Pro is active on Pharmacie Garidi.
          <Link href="/v8/dashboard?tab=demand" className="ms-auto underline underline-offset-4">
            See missed demand
          </Link>
        </p>
      )}
      {cancelled && !pro && <p className="mt-8 rounded-full bg-(--l-low-soft) px-5 py-3 text-(--l-low)">Payment cancelled. Nothing was charged.</p>}

      <div className="card card-solid in mt-10 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] items-end gap-4 border-b border-(--l-line) p-6 sm:p-8">
          <div className="rounded-[22px] bg-(--l-bg) p-5">
            <p className="flex items-center gap-2 text-[13px] text-(--l-muted)">
              <TrendingUp className="size-4 text-(--l-lilac)" aria-hidden /> Searched near Kouba, not on your shelf
            </p>
            {[
              ["Aerius 5 mg", 41],
              ["Smecta 3 g", 28],
              ["Clamoxyl syrup", 19],
            ].map(([nm, v]) => (
              <div key={nm} className="mt-2.5 flex items-center gap-3 text-[13.5px]">
                <span className="w-28 truncate">{nm}</span>
                <span className="h-2 flex-1 rounded-full bg-white">
                  <span className="block h-full rounded-full bg-(--l-lilac)" style={{ width: `${((v as number) / 41) * 100}%` }} />
                </span>
                <span className="w-6 text-end nums">{v}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-(--l-muted)">Free</p>
            <p className="display mt-1 text-[44px]">0 DA</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1.5 text-[14px] font-semibold text-(--l-lilac)">
              <Sparkles className="size-4" aria-hidden /> Pro
            </p>
            <p className="display mt-1 text-[44px] nums">{fmtPrice(PRO_DZD).replace(" DA", "")}</p>
            <p className="text-[13px] text-(--l-faint)">DA a month</p>
          </div>
        </div>
        <table className="w-full text-[15px]">
          <tbody>
            {ROWS.map(([f, free, p]) => (
              <tr key={f} className="border-b border-(--l-line) last:border-0">
                <th scope="row" className="px-6 py-4 text-start font-medium sm:px-8">
                  {f}
                </th>
                {[free, p].map((v, i) => (
                  <td key={i} className="w-[24%] text-center">
                    {v ? <Check className="mx-auto size-5 text-(--l-in)" aria-label="Included" /> : <X className="mx-auto size-5 text-(--l-faint)" aria-label="Not included" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 p-6 sm:p-8">
          <span />
          <Link href="/v8/dashboard" className="btn btn-soft btn-sm">
            Start free
          </Link>
          <button
            className="btn btn-ink btn-sm"
            disabled={busy || pro === true}
            onClick={async () => {
              setBusy(true);
              try {
                const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "pro", ref: "kouba-garidi", version: "v8" }) });
                const data = (await res.json()) as { url?: string };
                if (data.url) location.assign(data.url);
                else setBusy(false);
              } catch {
                setBusy(false);
              }
            }}
          >
            {pro ? "Active" : busy ? "Opening…" : (
              <>
                <Lock className="size-3.5" aria-hidden /> Go Pro
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
