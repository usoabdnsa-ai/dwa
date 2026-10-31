"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { BellRing, Pill, Plus, RotateCcw, Trash2 } from "lucide-react";
import { getMedicine } from "@/lib/data";
import { UNITS_PER_BOX } from "@/lib/extras";
import { REFILL_DAYS, addTreatment, daysLeft, refillTreatment, removeTreatment, unitsLeft, useTreatments, type Treatment } from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import { useT } from "@/lib/locale";

const noop = () => () => {};


/*
 * Long-term treatments: the patient says what they take and how much is at
 * home; we count the days down and say when to refill, before the box is empty.
 */
export function Treatments() {
  const { t: tr } = useT();
  const treatments = useTreatments();
  const now = useNow();
  const [adding, setAdding] = useState(false);
  // Browser permission, read after hydration; the override reflects the answer to our own prompt.
  const permission = useSyncExternalStore(
    noop,
    () => (typeof Notification === "undefined" ? "unsupported" : Notification.permission),
    () => null,
  );
  const [answered, setAnswered] = useState<NotificationPermission | null>(null);
  const notifyState = answered ?? permission;

  // While the site is open, remind on this device once per day for treatments that are due.
  useEffect(() => {
    if (!now || notifyState !== "granted") return;
    const today = new Date().toDateString();
    for (const t of treatments) {
      const left = daysLeft(t, now.getTime());
      const key = `dwa-reminded-${t.id}`;
      if (left <= REFILL_DAYS && localStorage.getItem(key) !== today) {
        const m = getMedicine(t.medicineId)!;
        new Notification(tr("tr.notifTitle", { name: m.name }), { body: left <= 0 ? tr("tr.notifOut") : tr("tr.notifLeft", { n: left }), tag: t.id });
        localStorage.setItem(key, today);
      }
    }
  }, [now, notifyState, treatments, tr]);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
          <Pill className="size-5" aria-hidden /> {tr("tr.title")}
        </h2>
        {notifyState === "default" && (
          <button
            type="button"
            onClick={async () => setAnswered(await Notification.requestPermission())}
            className="ms-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-green ring-1 ring-line hover:bg-surface"
          >
            <BellRing className="size-4" aria-hidden /> {tr("tr.remind")}
          </button>
        )}
        {notifyState === "granted" && <span className="ms-auto text-xs text-green">{tr("tr.remindOn")}</span>}
      </div>
      <p className="mt-1 text-sm text-muted">{tr("tr.lede", { n: REFILL_DAYS })}</p>

      {treatments.length > 0 && (
        <ul className="surface mt-4 divide-y divide-line/70 rounded-card p-1.5">
          {treatments.map((t) => (
            <TreatmentRow key={t.id} t={t} now={now?.getTime() ?? null} />
          ))}
        </ul>
      )}

      {adding ? (
        <AddTreatment onDone={() => setAdding(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium ring-1 ring-line hover:bg-surface"
        >
          <Plus className="size-4" aria-hidden /> {tr("tr.add")}
        </button>
      )}
    </section>
  );
}

function TreatmentRow({ t, now }: { t: Treatment; now: number | null }) {
  const { t: tr, intl } = useT();
  const dateFmt = new Intl.DateTimeFormat(intl, { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Algiers" });
  const m = getMedicine(t.medicineId)!;
  const box = UNITS_PER_BOX[t.medicineId] ?? { units: 30, unit: "units" };
  const left = now === null ? null : daysLeft(t, now);
  const total = Math.max(1, Math.ceil(t.units / t.perDay));
  const due = left !== null && left <= REFILL_DAYS;
  const out = left !== null && left <= 0;
  const runOut = now === null ? null : now + (unitsLeft(t, now) / t.perDay) * 86_400_000;

  return (
    <li className="px-4 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="min-w-0 flex-1">
          <span className="block font-medium">
            {m.name} <span className="font-mono text-xs text-muted">{m.dosage}</span>
          </span>
          <span className="block text-xs text-muted">
            {tr("tr.perDay", { n: t.perDay })}
            {runOut !== null && <> · {tr("tr.runsOut", { date: dateFmt.format(runOut) })}</>}
          </span>
        </span>
        <span className={`font-mono text-sm font-medium nums ${out ? "text-danger" : due ? "text-amber-ink" : "text-green"}`}>
          {left === null ? "–" : out ? tr("tr.out") : left === 1 ? tr("tr.daysLeft1") : tr("tr.daysLeftN", { n: left })}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-2" aria-hidden>
        <div
          className={`h-full origin-left rounded-full transition-transform duration-500 ${out ? "bg-danger" : due ? "bg-amber" : "bg-green"}`}
          style={{ transform: `scaleX(${left === null ? 1 : Math.min(1, Math.max(0, left / total))})` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {due && (
          <Link href={`/search?q=${encodeURIComponent(m.name)}&stocked=1`} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-green px-3 text-xs font-medium text-white hover:bg-green-700">
            {tr("tr.refill")}
          </Link>
        )}
        <button
          type="button"
          onClick={() => refillTreatment(t.id, box.units)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium ring-1 ring-line hover:bg-paper"
        >
          <RotateCcw className="size-3.5" aria-hidden /> {tr("tr.bought")}
        </button>
        <button
          type="button"
          onClick={() => removeTreatment(t.id)}
          aria-label={tr("tr.stop", { name: m.name })}
          className="ms-auto grid size-8 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  );
}

function AddTreatment({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const ids = Object.keys(UNITS_PER_BOX);
  const [med, setMed] = useState(ids[0]);
  const box = UNITS_PER_BOX[med];

  return (
    <form
      noValidate
      className="surface mt-4 grid gap-4 rounded-card p-5 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const perDay = Number(d.get("perDay"));
        const boxes = Number(d.get("boxes"));
        if (!(perDay > 0)) return setError(t("tr.perDayError"));
        if (!(boxes > 0)) return setError(t("tr.boxesError"));
        addTreatment(med, perDay, boxes * box.units);
        onDone();
      }}
    >
      <label className="block">
        <span className="text-sm font-medium">{t("tr.medicine")}</span>
        <select value={med} onChange={(e) => setMed(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 ring-1 ring-line outline-none focus:ring-2 focus:ring-green">
          {ids.map((id) => {
            const m = getMedicine(id)!;
            return (
              <option key={id} value={id}>
                {m.name} {m.dosage}
              </option>
            );
          })}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium">{t("tr.perDayLabel")}</span>
        <input name="perDay" type="number" min={0.5} step={0.5} defaultValue={1} inputMode="decimal" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 font-mono ring-1 ring-line outline-none focus:ring-2 focus:ring-green" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">{t("tr.boxesHome")}</span>
        <input name="boxes" type="number" min={0.5} step={0.5} defaultValue={1} inputMode="decimal" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 font-mono ring-1 ring-line outline-none focus:ring-2 focus:ring-green" />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={onDone} className="h-11 rounded-xl px-3 text-sm font-medium text-muted hover:text-ink">
          {t("common.cancel")}
        </button>
        <button type="submit" className="h-11 rounded-xl bg-green px-4 text-sm font-medium text-white hover:bg-green-700">
          {t("tr.addButton")}
        </button>
      </div>
      <p className="text-xs text-muted sm:col-span-4">
        {t("tr.boxHolds", { name: getMedicine(med)!.name, n: box.units })}
      </p>
      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger sm:col-span-4">
          {error}
        </p>
      )}
    </form>
  );
}

/* Small banner shown on the search page when a tracked treatment is due. */
export function RefillBanner() {
  const { t } = useT();
  const treatments = useTreatments();
  const now = useNow();
  if (!now) return null;
  const due = treatments.filter((t) => daysLeft(t, now.getTime()) <= REFILL_DAYS);
  if (!due.length) return null;
  const names = due.map((t) => getMedicine(t.medicineId)!.name).join(", ");
  return (
    <Link href="/me#treatments" className="mb-6 flex items-center gap-3 rounded-card bg-amber-soft px-5 py-4 text-sm text-amber-ink hover:ring-1 hover:ring-amber">
      <BellRing className="size-5 shrink-0" aria-hidden />
      <span className="flex-1">
        <strong>{t("tr.banner")}</strong> {t("tr.bannerBody", { names })}
      </span>
      <span className="font-medium underline underline-offset-4">{t("tr.see")}</span>
    </Link>
  );
}
