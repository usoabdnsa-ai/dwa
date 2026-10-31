"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, Check, Loader2, PartyPopper } from "lucide-react";
import { fmtPrice } from "@/lib/finder";
import { PRO_DZD, setPro, usePro } from "@/lib/reservations";
import type { MessageKey } from "@/lib/i18n";
import { useT } from "@/lib/locale";
import { startCheckout } from "./reserve-dialog";

const PLANS: { name: MessageKey; price: number | null; blurb: MessageKey; features: MessageKey[]; highlight?: boolean }[] = [
  { name: "pro.free", price: 0, blurb: "pro.freeBlurb", features: ["pro.f1", "pro.f2", "pro.f3", "pro.f4"] },
  { name: "pro.pro", price: PRO_DZD, blurb: "pro.proBlurb", features: ["pro.p1", "pro.p2", "pro.p3", "pro.p4", "pro.p5"], highlight: true },
  { name: "pro.network", price: null, blurb: "pro.networkBlurb", features: ["pro.n1", "pro.n2", "pro.n3"] },
];

export function ProPlans({ activated, cancelled }: { activated: boolean; cancelled: boolean }) {
  const { t } = useT();
  const pro = usePro();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Back from a successful payment. In production the Chargily webhook activates the plan server-side.
  useEffect(() => {
    if (activated && pro === false) setPro(true);
  }, [activated, pro]);

  return (
    <>
      <section className="dusk-band">
        <div className="mx-auto max-w-6xl px-4 pt-32 pb-14 text-center sm:px-6">
          <p className="text-sm font-medium text-dusk-mint">{t("pro.kicker")}</p>
          <h1 className="mx-auto mt-3 max-w-[20ch] font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("pro.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-dusk-muted">
            {t("pro.lede")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6">
        {(activated || pro) && (
          <div className="mb-8 flex flex-wrap items-center gap-3 rounded-card bg-green-soft px-5 py-4 text-green" role="status">
            <PartyPopper className="size-5" aria-hidden />
            <p className="flex-1 font-medium">{t("pro.active")}</p>
            <Link href="/dashboard" className="font-medium underline underline-offset-4">
              {t("pro.openDash")}
            </Link>
          </div>
        )}
        {cancelled && !pro && <p className="mb-8 rounded-card bg-amber-soft px-5 py-4 text-amber-ink">{t("pro.cancelled")}</p>}

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <article key={plan.name} className={`flex flex-col rounded-card p-6 ${plan.highlight ? "bg-night text-white ring-2 ring-neon" : "surface"}`}>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                {t(plan.name)}
                {plan.highlight && <BadgeCheck className="size-5 text-neon" aria-hidden />}
              </h2>
              <p className={`mt-1 text-sm ${plan.highlight ? "text-night-muted" : "text-muted"}`}>{t(plan.blurb)}</p>
              <p className="mt-5 font-mono text-3xl font-medium nums">
                {plan.price === null ? t("pro.onRequest") : plan.price === 0 ? fmtPrice(0) : fmtPrice(plan.price)}
                {!!plan.price && <span className={`text-sm ${plan.highlight ? "text-night-muted" : "text-muted"}`}> {t("pro.month")}</span>}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className={`mt-0.5 size-4 shrink-0 ${plan.highlight ? "text-neon" : "text-green"}`} aria-hidden />
                    {t(f)}
                  </li>
                ))}
              </ul>
              {plan.highlight ? (
                pro ? (
                  <Link href="/dashboard" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-neon font-semibold text-night">
                    {t("pro.goDash")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError(null);
                      try {
                        await startCheckout("pro", "kouba-garidi");
                      } catch (e) {
                        setError(e instanceof Error ? e.message : t("pro.error"));
                        setBusy(false);
                      }
                    }}
                    className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neon font-semibold text-night hover:bg-white disabled:opacity-70"
                  >
                    {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                    {t("pro.start")}
                  </button>
                )
              ) : plan.price === 0 ? (
                <Link href="/login" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl font-medium ring-1 ring-line hover:bg-paper">
                  {t("pro.signIn")}
                </Link>
              ) : (
                <a href="mailto:contact@dwa.example?subject=dwa%20Network" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl font-medium ring-1 ring-line hover:bg-paper">
                  {t("pro.contact")}
                </a>
              )}
            </article>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-muted">{t("pro.foot")}</p>
      </div>
    </>
  );
}
