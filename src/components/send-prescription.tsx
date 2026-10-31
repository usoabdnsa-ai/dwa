"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";
import { Camera, Check, FileImage, Loader2, Lock, X } from "lucide-react";
import type { Pharmacy } from "@/lib/data";
import { sendPrescription, validPhone } from "@/lib/reservations";
import { useT } from "@/lib/locale";

/** Shrink a photo to at most 1200px on its long side, as JPEG, so it fits in storage. */
async function downscale(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

/*
 * Photograph a prescription and ask this pharmacy what it has and the total.
 * Nothing is sold online: the pharmacist answers, the patient comes in.
 */
export function SendPrescription({ pharmacy }: { pharmacy: Pharmacy }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setImage(null);
          setSent(false);
          setError(null);
        }
      }}
    >
      <Dialog.Trigger className="inline-flex h-10 items-center gap-2 rounded-xl bg-dusk-mint px-4 text-sm font-semibold text-[#06241f] transition-colors duration-150 hover:bg-white">
        <Camera className="size-4" aria-hidden /> {t("rxs.button")}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="cmd-overlay fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content className="cmd-panel surface fixed top-[8vh] left-1/2 z-50 max-h-[86vh] w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-card p-6 text-ink">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">{t("rxs.title")}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                {t("rxs.desc", { name: pharmacy.name })}
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label={t("common.close")} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {sent ? (
            <div className="mt-6 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-green-soft text-green">
                <Check className="size-6" aria-hidden />
              </span>
              <p className="mt-3 font-semibold">{t("rxs.sent", { name: pharmacy.name })}</p>
              <p className="mt-1 text-sm text-muted">{t("rxs.sentHelp")}</p>
              <Link href="/me#prescriptions" className="mt-5 inline-flex h-10 items-center rounded-xl bg-green px-4 text-sm font-medium text-white hover:bg-green-700">
                {t("rxs.goMy")}
              </Link>
            </div>
          ) : (
            <form
              noValidate
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                const phone = String(d.get("phone") ?? "");
                const note = String(d.get("note") ?? "").slice(0, 300);
                if (!image) return setError(t("rxs.noPhoto"));
                if (!validPhone(phone)) return setError(t("common.phoneError"));
                if (!sendPrescription({ pharmacyId: pharmacy.id, image, phone, note })) return setError(t("rxs.full"));
                setSent(true);
              }}
            >
              <label className="block cursor-pointer">
                <span className="text-sm font-medium">{t("rxs.photo")}</span>
                <span className="mt-1.5 flex min-h-36 items-center justify-center overflow-hidden rounded-xl bg-paper ring-1 ring-line ring-dashed hover:ring-ink/30">
                  {busy ? (
                    <Loader2 className="size-5 animate-spin text-muted" aria-hidden />
                  ) : image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                    <img src={image} alt={t("rxs.preview")} className="max-h-64 w-full object-contain" />
                  ) : (
                    <span className="flex flex-col items-center gap-2 py-6 text-sm text-muted">
                      <FileImage className="size-6" aria-hidden /> {t("rxs.take")}
                    </span>
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setBusy(true);
                    setError(null);
                    try {
                      setImage(await downscale(f));
                    } catch {
                      setError(t("rxs.bad"));
                    }
                    setBusy(false);
                  }}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">{t("common.phone")}</span>
                <input name="phone" type="tel" autoComplete="tel" placeholder={t("common.phonePh")} dir="ltr" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 font-mono ring-1 ring-line outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-green" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">{t("rxs.note")}</span>
                <textarea name="note" rows={2} maxLength={300} placeholder={t("rxs.notePh")} className="mt-1.5 w-full rounded-xl bg-paper px-3 py-2 text-sm ring-1 ring-line outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-green" />
              </label>
              <p className="flex items-start gap-2 text-xs text-muted">
                <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {t("rxs.privacy")}
              </p>
              {error && (
                <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Dialog.Close className="h-10 rounded-xl px-4 text-sm font-medium text-muted hover:text-ink">{t("common.cancel")}</Dialog.Close>
                <button type="submit" disabled={busy} className="h-10 rounded-xl bg-green px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
                  {t("rxs.send")}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
