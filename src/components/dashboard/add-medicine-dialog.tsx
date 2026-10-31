"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { Medicine } from "@/lib/data";
import { useT } from "@/lib/locale";

export function AddMedicineDialog({ options, onAdd }: { options: Medicine[]; onAdd: (medicineId: string, qty: number, expiry: string) => void }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); setError(null); }}>
      <Dialog.Trigger className="flex h-10 items-center gap-2 rounded-xl bg-green px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-green-700">
        <Plus className="size-4" aria-hidden /> {t("dash.add")}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="cmd-overlay fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content className="cmd-panel surface fixed top-[14vh] left-1/2 z-50 w-[min(460px,calc(100vw-2rem))] -translate-x-1/2 rounded-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">{t("add.title")}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">{t("add.desc")}</Dialog.Description>
            </div>
            <Dialog.Close aria-label={t("common.close")} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {options.length === 0 ? (
            <p className="mt-6 rounded-lg bg-paper p-4 text-sm text-muted">{t("add.all")}</p>
          ) : (
            <form
              noValidate
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                const id = String(d.get("medicine"));
                const qty = Number(d.get("qty"));
                const expiry = String(d.get("expiry"));
                if (!Number.isInteger(qty) || qty < 0) return setError(t("add.qtyError"));
                if (!expiry) return setError(t("add.expiryError"));
                onAdd(id, qty, expiry);
                setOpen(false);
              }}
            >
              <label className="block">
                <span className="text-sm font-medium">{t("add.medicine")}</span>
                <select name="medicine" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 ring-1 ring-line outline-none focus:ring-2 focus:ring-green">
                  {options.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.dosage} ({m.dci})
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium">{t("add.boxes")}</span>
                  <input name="qty" type="number" min={0} defaultValue={10} inputMode="numeric" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 font-mono ring-1 ring-line outline-none focus:ring-2 focus:ring-green" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">{t("add.expiry")}</span>
                  <input name="expiry" type="date" className="mt-1.5 h-11 w-full rounded-xl bg-paper px-3 font-mono text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-green" />
                </label>
              </div>
              {error && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Dialog.Close className="h-10 rounded-xl px-4 text-sm font-medium text-muted hover:text-ink">{t("common.cancel")}</Dialog.Close>
                <button type="submit" className="h-10 rounded-xl bg-green px-4 text-sm font-medium text-white hover:bg-green-700">{t("add.submit")}</button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
