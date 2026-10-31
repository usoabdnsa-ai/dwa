"use client";

import { useState } from "react";
import { CreditCard, FlaskConical, Loader2, Lock } from "lucide-react";
import { fmtPrice } from "@/lib/finder";
import type { MessageKey } from "@/lib/i18n";
import { useT } from "@/lib/locale";

const LABEL: Record<string, MessageKey> = { deposit: "pay.deposit", pro: "pay.pro" };

/*
 * Stand-in for the hosted payment page while no Chargily key is configured.
 * Clearly marked as a test: it takes no card data and moves no money. With
 * CHARGILY_SECRET_KEY set, /api/checkout sends people to Chargily instead.
 */
export function DemoPay({ purpose, reference, amount, success, failure }: { purpose: string; reference: string; amount: number; success: string; failure: string }) {
  const { t } = useT();
  const [method, setMethod] = useState<"edahabia" | "cib">("edahabia");
  const [busy, setBusy] = useState(false);

  // Only ever send people back into this site.
  const safe = (url: string) => {
    try {
      const u = new URL(url, window.location.origin);
      return u.origin === window.location.origin ? u.pathname + u.search : "/";
    } catch {
      return "/";
    }
  };

  const valid = LABEL[purpose] && amount > 0;

  return (
    <section className="dusk-band min-h-[80vh]">
      <div className="mx-auto max-w-md px-4 pt-28 pb-20 sm:px-6">
        <div className="flex items-start gap-3 rounded-xl bg-amber-soft px-4 py-3 text-sm text-amber-ink">
          <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <strong>{t("pay.test")}</strong> {t("pay.testBody")}
          </p>
        </div>

        <div className="surface mt-5 rounded-card p-6 text-ink">
          {!valid ? (
            <p className="text-muted">{t("pay.incomplete")}</p>
          ) : (
            <>
              <p className="text-sm text-muted">{t(LABEL[purpose])}</p>
              <p className="mt-1 font-mono text-4xl font-medium nums">{fmtPrice(amount)}</p>
              <p className="mt-1 font-mono text-xs text-muted">{t("pay.ref", { ref: reference })}</p>

              <fieldset className="mt-6">
                <legend className="text-sm font-medium">{t("pay.with")}</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["edahabia", "cib"] as const).map((m) => (
                    <label
                      key={m}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-sm ring-1 ring-line has-[:checked]:bg-green-soft has-[:checked]:ring-2 has-[:checked]:ring-green"
                    >
                      <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                      <CreditCard className="size-4" aria-hidden />
                      {m === "edahabia" ? "Edahabia" : "CIB"}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  setTimeout(() => window.location.assign(safe(success)), 1200);
                }}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green font-medium text-white hover:bg-green-700 disabled:opacity-70"
              >
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                {busy ? t("pay.processing") : t("pay.pay", { price: fmtPrice(amount) })}
              </button>
              <button type="button" onClick={() => window.location.assign(safe(failure))} className="mt-3 w-full text-center text-sm text-muted hover:text-ink">
                {t("common.cancel")}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
