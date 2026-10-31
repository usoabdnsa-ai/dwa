"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Clock, Loader2, MapPin, Phone, ShieldCheck, Star, Store, X } from "lucide-react";
import { getMedicine, getPharmacy } from "@/lib/data";
import { fmtPrice } from "@/lib/finder";
import { DEPOSIT_DZD, updateReservation, useReservations, type Reservation } from "@/lib/reservations";
import type { MessageKey } from "@/lib/i18n";
import { useT } from "@/lib/locale";
import { useNow } from "@/lib/use-now";
import { startCheckout } from "./reserve-dialog";

/** The pharmacy that has a dashboard in this demo; others answer on their own after a few seconds. */
const DEMO_DASHBOARD_PHARMACY = "kouba-garidi";


const STEPS: { key: Reservation["status"]; label: MessageKey }[] = [
  { key: "requested", label: "rv.step.sent" },
  { key: "confirmed", label: "rv.step.confirmed" },
  { key: "ready", label: "rv.step.ready" },
  { key: "collected", label: "rv.step.collected" },
];

const STATUS_KEY: Record<Reservation["status"], MessageKey> = {
  requested: "rv.st.requested",
  confirmed: "rv.st.confirmed",
  ready: "rv.st.ready",
  collected: "rv.st.collected",
  declined: "rv.st.declined",
  cancelled: "rv.st.cancelled",
};

export function ReservationView({ code, paid }: { code: string; paid: string | null }) {
  const { t, intl } = useT();
  const time = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });
  const reservations = useReservations();
  const now = useNow();
  const r = reservations.find((x) => x.code === code);
  const [paying, setPaying] = useState(false);

  // Returning from the payment page. In production the Chargily webhook confirms this server-side.
  useEffect(() => {
    if (!r) return;
    if (paid === "1" && r.deposit !== "paid") updateReservation(r.code, { deposit: "paid" });
  }, [paid, r]);

  // Demo: pharmacies without a dashboard here confirm, then prepare, on their own.
  useEffect(() => {
    if (!r || r.pharmacyId === DEMO_DASHBOARD_PHARMACY) return;
    if (r.status === "requested") {
      const t = setTimeout(() => updateReservation(r.code, { status: "confirmed" }), 4000);
      return () => clearTimeout(t);
    }
    if (r.status === "confirmed") {
      const t = setTimeout(() => updateReservation(r.code, { status: "ready" }), 6000);
      return () => clearTimeout(t);
    }
  }, [r]);

  if (!r) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t("rv.notFound")}</h1>
        <p className="mt-2 text-muted">{t("rv.notFoundHelp")}</p>
        <Link href="/search" className="mt-6 inline-flex h-10 items-center rounded-xl bg-green px-4 text-sm font-medium text-white hover:bg-green-700">
          {t("rv.searchCta")}
        </Link>
      </section>
    );
  }

  const p = getPharmacy(r.pharmacyId)!;
  const m = getMedicine(r.medicineId)!;
  const stepIndex = STEPS.findIndex((s) => s.key === r.status);
  const ended = r.status === "declined" || r.status === "cancelled";
  const expired = now !== null && now.getTime() > r.holdUntil && (r.status === "confirmed" || r.status === "ready");
  const total = m.priceDzd * r.qty - (r.deposit === "paid" ? DEPOSIT_DZD : 0);

  return (
    <>
      <section className="dusk-band">
        <div className="mx-auto max-w-4xl px-4 pt-28 pb-10 sm:px-6">
          <p className="text-sm text-dusk-muted">{t("rv.code")}</p>
          <p dir="ltr" className="mt-1 text-start font-mono text-5xl font-semibold tracking-wider text-dusk-mint sm:text-6xl">{r.code}</p>
          <p className="mt-3 text-dusk-muted">{t("rv.giveCode", { name: p.name })}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-6 px-4 pt-8 pb-24 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div className="surface rounded-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-xl font-semibold">{expired && !ended ? t("rv.expired") : t(STATUS_KEY[r.status])}</h1>
            {!ended && r.status !== "collected" && (
              <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
                <Clock className="size-3.5" aria-hidden /> {t("rv.heldUntil", { time: time.format(r.holdUntil) })}
              </span>
            )}
          </div>

          {/* Status timeline */}
          {!ended && (
            <ol className="mt-6 space-y-5">
              {STEPS.map((s, i) => {
                const done = i < stepIndex || (i === stepIndex && r.status === "collected");
                const current = i === stepIndex && r.status !== "collected";
                return (
                  <li key={s.key} className="flex items-center gap-3">
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full ring-1 transition-colors duration-300 ${
                        done ? "bg-green text-white ring-green" : current ? "bg-green-soft text-green ring-green" : "bg-paper text-muted ring-line"
                      }`}
                    >
                      {done ? <Check className="size-4" aria-hidden /> : current ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <span className="text-xs">{i + 1}</span>}
                    </span>
                    <span className={`text-sm ${done || current ? "font-medium text-ink" : "text-muted"}`}>{t(s.label)}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {r.status === "requested" && r.pharmacyId === DEMO_DASHBOARD_PHARMACY && (
            <p className="mt-6 rounded-xl bg-paper p-4 text-sm text-muted">
              {t("rv.demo")}{" "}
              <Link href="/dashboard" target="_blank" className="font-medium text-green underline underline-offset-4">
                {t("rv.demoLink")}
              </Link>{" "}
              {t("rv.demoAfter")}
            </p>
          )}

          {r.status === "collected" && (
            <div className="mt-6 rounded-xl bg-paper p-4">
              <p className="text-sm font-medium">{r.rating ? t("rv.rateThanks") : t("rv.rateQ", { name: p.name })}</p>
              <div className="mt-2 flex gap-1" role="radiogroup" aria-label={t("rv.rateLabel")}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={r.rating === n}
                    aria-label={t("rv.stars", { n })}
                    onClick={() => updateReservation(r.code, { rating: n })}
                    className="grid size-9 place-items-center rounded-lg transition-transform duration-150 hover:scale-110 active:scale-95"
                  >
                    <Star className={`size-6 ${r.rating && n <= r.rating ? "fill-amber text-amber" : "text-line"}`} aria-hidden />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!ended && r.status !== "collected" && (
            <button
              type="button"
              onClick={() => updateReservation(r.code, { status: "cancelled" })}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-danger"
            >
              <X className="size-4" aria-hidden /> {t("rv.cancel")}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="surface rounded-card p-5 text-sm">
            <p className="font-semibold">
              {r.qty} × {m.name} <span className="font-mono text-xs text-muted">{m.dosage}</span>
            </p>
            <dl className="mt-4 space-y-2.5">
              <Row icon={<Store className="size-4" />} label={p.name} />
              <Row icon={<MapPin className="size-4" />} label={`${p.address}, ${p.commune}`} />
              <Row
                icon={<Phone className="size-4" />}
                label={
                  <a href={`tel:${p.phone.replace(/\s/g, "")}`} dir="ltr" className="font-mono underline decoration-line underline-offset-4 hover:decoration-green">
                    {p.phone}
                  </a>
                }
              />
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-muted">{t("rv.toPay")}</span>
              <span className="font-mono text-lg font-medium nums">{fmtPrice(total)}</span>
            </div>
            {m.rx && <p className="mt-3 rounded-lg bg-amber-soft px-3 py-2 text-xs text-amber-ink">{t("rv.bringRx")}</p>}
          </div>

          <div className="surface rounded-card p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-green" aria-hidden /> {t("rv.deposit")}
            </p>
            {r.deposit === "paid" ? (
              <p className="mt-2 text-green">{t("rv.paid", { price: fmtPrice(DEPOSIT_DZD) })}</p>
            ) : ended || r.status === "collected" ? (
              <p className="mt-2 text-muted">{t("rv.noDeposit")}</p>
            ) : (
              <>
                <p className="mt-2 text-muted">
                  {paid === "0" ? `${t("rv.failed")} ` : ""}
                  {t("rv.depositHelp", { price: fmtPrice(DEPOSIT_DZD) })}
                </p>
                <button
                  type="button"
                  disabled={paying}
                  onClick={async () => {
                    setPaying(true);
                    updateReservation(r.code, { deposit: "pending" });
                    try {
                      await startCheckout("deposit", r.code);
                    } catch {
                      setPaying(false);
                    }
                  }}
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
                >
                  {paying && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  {t("rv.pay", { price: fmtPrice(DEPOSIT_DZD) })}
                </button>
              </>
            )}
          </div>

          <Link href="/me" className="block text-center text-sm font-medium text-green underline underline-offset-4">
            {t("rv.all")}
          </Link>
        </div>
      </div>
    </>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-muted">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-ink">{label}</span>
    </div>
  );
}
