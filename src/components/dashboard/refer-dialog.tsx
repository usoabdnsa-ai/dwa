"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Check, Copy, Phone, Send, Users, X } from "lucide-react";
import { getPharmacy, pharmacies, stock, type Medicine } from "@/lib/data";
import { distanceKm, fmtKm, statusOf } from "@/lib/finder";
import { countReferral } from "@/lib/reservations";
import { useT } from "@/lib/locale";

/*
 * Out of something? See which colleagues nearby have it and send the patient
 * there with a ready-made text, instead of a shrug. Pharmacists who refer get
 * referred back: that's the network effect.
 */
export function ReferDialog({ fromId, medicine }: { fromId: string; medicine: Medicine }) {
  const { t } = useT();
  const from = getPharmacy(fromId)!;
  const [copied, setCopied] = useState<string | null>(null);

  const nearby = pharmacies
    .filter((p) => p.id !== fromId)
    .map((p) => {
      const line = stock.find((s) => s.pharmacyId === p.id && s.medicineId === medicine.id);
      return { p, qty: line?.qty ?? 0, km: distanceKm(from, p) };
    })
    .filter((x) => statusOf(x.qty) !== "out")
    .sort((a, b) => a.km - b.km)
    .slice(0, 4);

  const message = (p: (typeof nearby)[number]["p"]) =>
    `${medicine.name} ${medicine.dosage} est disponible à la ${p.name}, ${p.address}, ${p.commune}. Tél ${p.phone}. Orienté par la ${from.name} via dwa.`;

  return (
    <Dialog.Root onOpenChange={() => setCopied(null)}>
      <Dialog.Trigger
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-green ring-1 ring-line hover:bg-green-soft"
        aria-label={t("ref.buttonLabel", { name: medicine.name })}
      >
        <Users className="size-3.5" aria-hidden /> {t("ref.button")}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="cmd-overlay fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content className="cmd-panel surface fixed top-[12vh] left-1/2 z-50 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 rounded-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">{t("ref.title", { name: medicine.name })}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">{t("ref.desc")}</Dialog.Description>
            </div>
            <Dialog.Close aria-label={t("common.close")} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {nearby.length === 0 ? (
            <p className="mt-6 rounded-lg bg-paper p-4 text-sm text-muted">{t("ref.none")}</p>
          ) : (
            <ul className="mt-5 divide-y divide-line/70">
              {nearby.map((x) => (
                <li key={x.p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{x.p.name}</span>
                    <span className="block text-xs text-muted">
                      {x.p.commune} · <span className="font-mono">{fmtKm(x.km)}</span> · <span className="font-mono">{t("common.boxes", { n: x.qty })}</span>
                    </span>
                  </span>
                  <a href={`tel:${x.p.phone.replace(/\s/g, "")}`} aria-label={t("ref.callLabel", { name: x.p.name })} className="grid size-8 place-items-center rounded-lg text-muted ring-1 ring-line hover:text-ink">
                    <Phone className="size-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(message(x.p));
                      } catch {}
                      countReferral();
                      setCopied(x.p.id);
                    }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-green px-3 text-xs font-medium text-white hover:bg-green-700"
                  >
                    {copied === x.p.id ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                    {copied === x.p.id ? t("ref.copied") : t("ref.copy")}
                  </button>
                  <a
                    href={`sms:?body=${encodeURIComponent(message(x.p))}`}
                    onClick={() => countReferral()}
                    aria-label={t("ref.sms")}
                    className="grid size-8 place-items-center rounded-lg text-muted ring-1 ring-line hover:text-ink"
                  >
                    <Send className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {copied && (
            <p className="mt-4 rounded-lg bg-paper p-3 text-xs text-muted" role="status">
              {message(nearby.find((x) => x.p.id === copied)!.p)}
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
