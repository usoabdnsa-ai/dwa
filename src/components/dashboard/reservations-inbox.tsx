"use client";

import { BellRing, Check, PackageCheck, ShieldCheck, X } from "lucide-react";
import { getMedicine } from "@/lib/data";
import { updateReservation, useReservations, type Reservation } from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import type { MessageKey } from "@/lib/i18n";
import { useT } from "@/lib/locale";


const NEXT: Partial<Record<Reservation["status"], { to: Reservation["status"]; label: MessageKey }>> = {
  requested: { to: "confirmed", label: "inbox.confirm" },
  confirmed: { to: "ready", label: "inbox.markReady" },
  ready: { to: "collected", label: "inbox.collected" },
};

/*
 * Incoming "hold it for me" requests for this pharmacy, newest first. Updates
 * live when a patient reserves in another tab. Collecting a reservation takes
 * the boxes off the shelf count.
 */
export function ReservationsInbox({ pharmacyId, onCollected }: { pharmacyId: string; onCollected: (medicineId: string, qty: number) => void }) {
  const now = useNow();
  const { t, intl } = useT();
  const time = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });
  const mine = useReservations().filter((r) => r.pharmacyId === pharmacyId);
  const active = mine.filter((r) => r.status === "requested" || r.status === "confirmed" || r.status === "ready");
  const waiting = mine.filter((r) => r.status === "requested").length;

  return (
    <section id="reservations" className="surface mt-6 rounded-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <BellRing className="size-4 text-green" aria-hidden /> {t("dash.reservations")}
        </h2>
        {waiting > 0 && <span className="rounded-full bg-green px-2 py-0.5 font-mono text-xs font-medium text-white">{t("inbox.new", { n: waiting })}</span>}
        <span className="ms-auto text-xs text-muted">{t("inbox.note")}</span>
      </div>

      {active.length === 0 ? (
        <p className="mt-4 rounded-xl bg-paper px-4 py-6 text-center text-sm text-muted">
          {t("inbox.empty")}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line/70">
          {active.map((r) => {
            const m = getMedicine(r.medicineId)!;
            const next = NEXT[r.status];
            const late = now !== null && now.getTime() > r.holdUntil;
            return (
              <li key={r.code} className={`row-in flex flex-wrap items-center gap-x-4 gap-y-2 py-3 ${r.status === "requested" ? "toast-in" : ""}`}>
                <span dir="ltr" className="font-mono text-sm font-semibold text-green">{r.code}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    {r.qty} × {m.name} <span className="font-mono text-xs text-muted">{m.dosage}</span>
                  </span>
                  <span className="block text-xs text-muted">
                    {r.name} · <span dir="ltr" className="font-mono">{r.phone}</span> · {t("inbox.hold", { time: time.format(r.holdUntil) })}
                    {late && <span className="ms-1 font-medium text-danger">· {t("inbox.overdue")}</span>}
                  </span>
                </span>
                {r.deposit === "paid" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-soft px-2 py-0.5 text-xs font-medium text-green">
                    <ShieldCheck className="size-3.5" aria-hidden /> {t("inbox.depositPaid")}
                  </span>
                )}
                <span className="text-xs text-muted">{r.status === "requested" ? t("inbox.stNew") : r.status === "confirmed" ? t("inbox.stConfirmed") : t("inbox.stReady")}</span>
                <span className="flex items-center gap-1.5">
                  {next && (
                    <button
                      type="button"
                      onClick={() => {
                        updateReservation(r.code, { status: next.to });
                        if (next.to === "collected") onCollected(r.medicineId, r.qty);
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-green px-3 text-xs font-medium text-white hover:bg-green-700"
                    >
                      {next.to === "collected" ? <PackageCheck className="size-3.5" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
                      {t(next.label)}
                    </button>
                  )}
                  {r.status === "requested" && (
                    <button
                      type="button"
                      onClick={() => updateReservation(r.code, { status: "declined" })}
                      aria-label={t("inbox.decline", { code: r.code })}
                      className="grid size-8 place-items-center rounded-lg text-muted ring-1 ring-line hover:bg-danger-soft hover:text-danger"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
