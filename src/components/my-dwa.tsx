"use client";

import Link from "next/link";
import { Bell, ChevronRight, Trash2 } from "lucide-react";
import { getMedicine, getPharmacy, stock } from "@/lib/data";
import { statusOf } from "@/lib/finder";
import { fmtPrice } from "@/lib/finder";
import { removeAlert, useAlerts, usePrescriptions, useReservations, type ReservationStatus } from "@/lib/reservations";
import type { MessageKey } from "@/lib/i18n";
import { useT } from "@/lib/locale";
import { Treatments } from "./treatments";

const STATUS_KEY: Record<ReservationStatus, MessageKey> = {
  requested: "rv.st.requested",
  confirmed: "rv.st.confirmed",
  ready: "rv.st.ready",
  collected: "rv.st.collected",
  declined: "rv.st.declined",
  cancelled: "rv.st.cancelled",
};

/* The patient's own space: reservations in progress and back-in-stock alerts. */
export function MyDwa() {
  const { t, intl } = useT();
  const when = new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });
  const reservations = useReservations();
  const alerts = useAlerts();
  const prescriptions = usePrescriptions();

  return (
    <>
      <section className="dusk-band">
        <div className="mx-auto max-w-4xl px-4 pt-28 pb-10 sm:px-6">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{t("my.title")}</h1>
          <p className="mt-2 text-dusk-muted">{t("my.lede")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 px-4 pt-8 pb-24 sm:px-6">
        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">{t("my.reservations")}</h2>
          {reservations.length === 0 ? (
            <div className="rounded-card border border-dashed border-line px-6 py-12 text-center">
              <p className="font-semibold">{t("my.none")}</p>
              <p className="mt-1 text-sm text-muted">{t("my.noneHelp")}</p>
              <Link href="/search" className="mt-4 inline-flex h-10 items-center rounded-xl bg-green px-4 text-sm font-medium text-white hover:bg-green-700">
                {t("rv.searchCta")}
              </Link>
            </div>
          ) : (
            <ul className="surface divide-y divide-line/70 rounded-card p-1.5">
              {reservations.map((r) => {
                const m = getMedicine(r.medicineId)!;
                const p = getPharmacy(r.pharmacyId)!;
                return (
                  <li key={r.code}>
                    <Link href={`/reservation/${r.code}`} className="group flex items-center gap-4 rounded-xl px-4 py-4 hover:bg-paper">
                      <span dir="ltr" className="font-mono text-sm font-semibold text-green">{r.code}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {r.qty} × {m.name} {m.dosage}
                        </span>
                        <span className="block truncate text-sm text-muted">
                          {p.name} · {when.format(r.createdAt)}
                        </span>
                      </span>
                      <span className="hidden text-sm text-muted sm:block">{t(STATUS_KEY[r.status])}</span>
                      <ChevronRight className="size-4 text-muted transition-transform duration-150 group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {prescriptions.length > 0 && (
          <section id="prescriptions" className="scroll-mt-28">
            <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">{t("my.rxSent")}</h2>
            <ul className="space-y-3">
              {prescriptions.map((rx) => {
                const ph = getPharmacy(rx.pharmacyId)!;
                return (
                  <li key={rx.id} className="surface flex gap-4 rounded-card p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                    <img src={rx.image} alt="Your prescription" className="size-20 shrink-0 rounded-lg object-cover ring-1 ring-line" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">{ph.name}</p>
                      <p className="text-xs text-muted">{when.format(rx.createdAt)}</p>
                      {rx.reply ? (
                        <p className="mt-2 rounded-lg bg-green-soft px-3 py-2 text-green">
                          {rx.reply.message} · <span className="font-mono">{fmtPrice(rx.reply.total)}</span>
                        </p>
                      ) : (
                        <p className="mt-2 text-muted">{t("my.rxWaiting")}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div id="treatments" className="scroll-mt-28">
          <Treatments />
        </div>

        <section>
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
            <Bell className="size-5" aria-hidden /> {t("my.alerts")}
          </h2>
          {alerts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t("my.alertsNone")}</p>
          ) : (
            <ul className="surface mt-4 divide-y divide-line/70 rounded-card p-1.5">
              {alerts.map((a) => {
                const m = getMedicine(a.medicineId)!;
                const back = stock.filter((s) => s.medicineId === a.medicineId && statusOf(s.qty) !== "out").length;
                return (
                  <li key={a.id} className="flex items-center gap-4 px-4 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {m.name} {m.dosage}
                      </span>
                      <span className="block font-mono text-xs text-muted">{t("my.textTo", { phone: a.phone })}</span>
                    </span>
                    <span className={`text-sm ${back ? "font-medium text-green" : "text-muted"}`}>{back ? t("my.haveIt", { n: back }) : t("my.stillOut")}</span>
                    <button type="button" onClick={() => removeAlert(a.id)} aria-label={t("my.stopAlert", { name: m.name })} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
