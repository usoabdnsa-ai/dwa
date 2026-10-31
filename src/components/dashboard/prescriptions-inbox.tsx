"use client";

import { useState } from "react";
import { FileText, Send } from "lucide-react";
import { fmtPrice } from "@/lib/finder";
import { answerPrescription, usePrescriptions, type Prescription } from "@/lib/reservations";
import { useT } from "@/lib/locale";

/* Prescription photos sent to this pharmacy; the pharmacist answers with availability and a total. */
export function PrescriptionsInbox({ pharmacyId }: { pharmacyId: string }) {
  const { t } = useT();
  const mine = usePrescriptions().filter((p) => p.pharmacyId === pharmacyId);
  const waiting = mine.filter((p) => p.status === "sent").length;

  return (
    <section className="surface mt-6 rounded-card p-5">
      <div className="flex items-center gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <FileText className="size-4 text-green" aria-hidden /> {t("rxi.title")}
        </h2>
        {waiting > 0 && <span className="rounded-full bg-green px-2 py-0.5 font-mono text-xs font-medium text-white">{t("rxi.toAnswer", { n: waiting })}</span>}
      </div>
      {mine.length === 0 ? (
        <p className="mt-4 rounded-xl bg-paper px-4 py-6 text-center text-sm text-muted">{t("rxi.empty")}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {mine.map((p) => (
            <PrescriptionItem key={p.id} p={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

function PrescriptionItem({ p }: { p: Prescription }) {
  const { t, intl } = useT();
  const time = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });
  const [zoom, setZoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <li className="flex gap-4 rounded-xl p-3 ring-1 ring-line">
      <button type="button" onClick={() => setZoom((z) => !z)} className={`shrink-0 overflow-hidden rounded-lg bg-paper ring-1 ring-line ${zoom ? "w-56" : "w-20"} transition-[width] duration-200`} aria-label={zoom ? t("rxi.shrink") : t("rxi.enlarge")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
        <img src={p.image} alt={t("rxi.photo")} className="h-full w-full object-cover" />
      </button>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-mono text-xs text-muted">
          {p.phone} · {time.format(p.createdAt)}
        </p>
        {p.note && <p className="mt-1">“{p.note}”</p>}
        {p.status === "answered" && p.reply ? (
          <p className="mt-2 rounded-lg bg-green-soft px-3 py-2 text-green">
            {t("rxi.answered", { message: p.reply.message, price: fmtPrice(p.reply.total) })}
          </p>
        ) : (
          <form
            noValidate
            className="mt-2 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const message = String(d.get("message") ?? "").trim();
              const total = Number(d.get("total"));
              if (!message) return setError(t("rxi.sayWhat"));
              if (!(total >= 0)) return setError(t("rxi.addTotal"));
              answerPrescription(p.id, message, total);
            }}
          >
            <input name="message" placeholder={t("rxi.messagePh")} className="h-9 min-w-0 flex-1 rounded-lg bg-paper px-3 ring-1 ring-line outline-none focus:ring-2 focus:ring-green" />
            <input name="total" type="number" min={0} placeholder="DA" inputMode="numeric" className="h-9 w-24 rounded-lg bg-paper px-3 font-mono ring-1 ring-line outline-none focus:ring-2 focus:ring-green" />
            <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-xs font-medium text-white hover:bg-green-700">
              <Send className="size-3.5 rtl:-scale-x-100" aria-hidden /> {t("rxi.answer")}
            </button>
            {error && (
              <p role="alert" className="w-full text-xs text-danger">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </li>
  );
}
