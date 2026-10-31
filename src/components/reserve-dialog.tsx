"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BellRing, Loader2, ShieldCheck, X } from "lucide-react";
import type { Medicine, Pharmacy } from "@/lib/data";
import { fmtPrice } from "@/lib/finder";
import { DEPOSIT_DZD, HOLD_HOURS, HOLD_HOURS_WITH_DEPOSIT, createReservation, validPhone } from "@/lib/reservations";
import { useT } from "@/lib/locale";

/** Asks the server for a payment page (Chargily, or the demo page) and goes there. */
export async function startCheckout(purpose: "deposit" | "pro", ref: string) {
  const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purpose, ref }) });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Payment could not start");
  window.location.assign(data.url);
}

/*
 * "Hold it for me": the patient asks a pharmacy to set boxes aside. They pay at
 * the counter as usual; an optional small deposit doubles the hold time.
 */
export function ReserveDialog({ pharmacy, medicine, available, compact = false }: { pharmacy: Pharmacy; medicine: Medicine; available: number; compact?: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const max = Math.max(1, Math.min(available, 5));

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        setError(null);
      }}
    >
      <Dialog.Trigger
        className={`inline-flex items-center gap-1.5 rounded-lg bg-green font-medium text-white transition-colors duration-150 hover:bg-green-700 ${compact ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm"}`}
      >
        <BellRing className="size-3.5" aria-hidden /> {t("res.button")}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="cmd-overlay fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content className="cmd-panel surface fixed top-[10vh] left-1/2 z-50 max-h-[85vh] w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">{t("res.title")}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                {t("res.desc", { name: pharmacy.name })}
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label={t("common.close")} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-paper px-4 py-3 text-sm">
            <span>
              <span className="font-semibold">{medicine.name}</span> <span className="font-mono text-xs text-muted">{medicine.dosage}</span>
            </span>
            <span className="font-mono text-muted nums">{t("common.perBox", { price: fmtPrice(medicine.priceDzd) })}</span>
          </div>
          {medicine.rx && (
            <p className="mt-2 rounded-lg bg-amber-soft px-3 py-2 text-xs text-amber-ink">{t("res.rx")}</p>
          )}

          <form
            noValidate
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const name = String(d.get("name") ?? "").trim();
              const phone = String(d.get("phone") ?? "");
              const qty = Number(d.get("qty"));
              const withDeposit = d.get("deposit") === "on";
              if (name.length < 2) return setError(t("res.nameError"));
              if (!validPhone(phone)) return setError(t("common.phoneError"));
              if (!Number.isInteger(qty) || qty < 1 || qty > max) return setError(t("res.boxesError", { max }));
              const r = createReservation({ pharmacyId: pharmacy.id, medicineId: medicine.id, qty, name, phone, withDeposit });
              if (!withDeposit) {
                router.push(`/reservation/${r.code}`);
                return;
              }
              setBusy(true);
              try {
                await startCheckout("deposit", r.code);
              } catch {
                setBusy(false);
                router.push(`/reservation/${r.code}`);
              }
            }}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
              <label className="block">
                <span className="text-sm font-medium">{t("res.name")}</span>
                <input name="name" autoComplete="name" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 ring-1 ring-line outline-none focus:ring-2 focus:ring-green" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">{t("res.boxes")}</span>
                <input name="qty" type="number" min={1} max={max} defaultValue={1} inputMode="numeric" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 font-mono ring-1 ring-line outline-none focus:ring-2 focus:ring-green" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium">{t("common.phone")}</span>
              <input name="phone" type="tel" autoComplete="tel" placeholder={t("common.phonePh")} dir="ltr" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 font-mono ring-1 ring-line outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-green" />
              <span className="mt-1 block text-xs text-muted">{t("res.phoneHint")}</span>
            </label>

            <label className="flex cursor-pointer gap-3 rounded-xl p-3 ring-1 ring-line has-[:checked]:bg-green-soft has-[:checked]:ring-green">
              <input name="deposit" type="checkbox" className="mt-0.5 size-4 accent-[var(--color-green)]" />
              <span className="text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="size-4 text-green" aria-hidden /> {t("res.guarantee", { price: fmtPrice(DEPOSIT_DZD) })}
                </span>
                <span className="mt-0.5 block text-muted">
                  {t("res.guaranteeBody", { long: HOLD_HOURS_WITH_DEPOSIT, short: HOLD_HOURS })}
                </span>
              </span>
            </label>

            {error && (
              <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close className="h-10 rounded-xl px-4 text-sm font-medium text-muted hover:text-ink">{t("common.cancel")}</Dialog.Close>
              <button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-xl bg-green px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {t("res.send")}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
