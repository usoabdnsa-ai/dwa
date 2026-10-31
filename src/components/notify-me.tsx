"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import type { Medicine } from "@/lib/data";
import { addAlert, useAlerts, validPhone } from "@/lib/reservations";
import { useT } from "@/lib/locale";

/* Back-in-stock alert: leave a number, get a text when any pharmacy nearby has it again. */
export function NotifyMe({ medicine, scarce = false }: { medicine: Medicine; scarce?: boolean }) {
  const { t } = useT();
  const alerts = useAlerts();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const subscribed = alerts.some((a) => a.medicineId === medicine.id);

  if (subscribed)
    return (
      <p className="mt-4 flex items-center gap-2 text-sm font-medium text-green" role="status">
        <Check className="size-4" aria-hidden /> {t(scarce ? "notify.doneMore" : "notify.doneBack", { name: medicine.name })}
      </p>
    );

  return (
    <form
      noValidate
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!validPhone(phone)) return setError(t("common.phoneError"));
        setError(null);
        addAlert(medicine.id, phone);
      }}
    >
      <p className="text-sm font-medium text-ink">{t(scarce ? "notify.more" : "notify.back")}</p>
      <div className="mt-2 flex gap-2">
        <label className="flex h-10 min-w-0 flex-1 items-center rounded-xl bg-surface px-3 ring-1 ring-line focus-within:ring-2 focus-within:ring-green">
          <span className="sr-only">{t("common.phone")}</span>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("common.phonePh")}
            dir="ltr"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted/70"
          />
        </label>
        <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-medium text-paper hover:bg-ink/90">
          <Bell className="size-4" aria-hidden /> {t("notify.button")}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
