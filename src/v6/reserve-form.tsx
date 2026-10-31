"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Medicine, Pharmacy } from "@/lib/data";
import { fmtPrice } from "@/lib/finder";
import {
  DEPOSIT_DZD,
  HOLD_HOURS,
  HOLD_HOURS_WITH_DEPOSIT,
  createReservation,
  validPhone,
} from "@/lib/reservations";
import { Reveal } from "./reveal";
import { Breadcrumbs, Inset } from "./ui";

type Errors = Partial<Record<"name" | "phone", string>>;

/*
 * Reservation as a one-question-per-section form page, with an error summary
 * at the top that links to each field, the way public services do it.
 */
export function ReserveForm({
  pharmacy: p,
  medicine: m,
  available,
}: {
  pharmacy: Pharmacy;
  medicine: Medicine;
  available: number;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const max = Math.max(1, Math.min(5, available));

  const fieldClass = (k: keyof Errors) =>
    `v6-input mt-2 ${errors[k] ? "border-(--e-red)!" : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
      <Breadcrumbs
        items={[
          { href: "/v6", label: "Home" },
          { href: `/v6/pharmacy/${p.id}`, label: p.name },
          { label: "Reserve" },
        ]}
      />

      <Reveal className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div data-reveal>
          <h1 className="v6-serif text-[clamp(2.4rem,4.6vw,3.6rem)]">
            Set it <em>aside</em> for you
          </h1>
          <p className="mt-3 text-lg text-(--e-muted)">
            The pharmacist confirms, then texts you when it is ready.
          </p>

          {Object.keys(errors).length > 0 && (
            <div
              ref={summary}
              tabIndex={-1}
              role="alert"
              aria-labelledby="error-title"
              className="mt-8 rounded-2xl bg-(--e-red-tint) p-5 outline-none"
            >
              <h2 id="error-title" className="font-semibold text-(--e-red)">
                Check these before sending
              </h2>
              <ul className="mt-2 space-y-1">
                {(Object.entries(errors) as [keyof Errors, string][]).map(
                  ([k, msg]) => (
                    <li key={k}>
                      <a
                        href={`#${k}`}
                        className="text-(--e-red) underline underline-offset-2"
                      >
                        {msg}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          <form
            noValidate
            className="v6-card mt-8 space-y-7 p-6 sm:p-8"
            onSubmit={async (e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const name = String(d.get("name") ?? "").trim();
              const phone = String(d.get("phone") ?? "");
              const qty = Number(d.get("qty"));
              const deposit = d.get("deposit") === "yes";
              const next: Errors = {};
              if (name.length < 2) next.name = "Enter your full name";
              if (!validPhone(phone))
                next.phone =
                  "Enter a mobile number in the correct format, like 0550 12 34 56";
              setErrors(next);
              if (Object.keys(next).length) {
                requestAnimationFrame(() => summary.current?.focus());
                return;
              }
              const r = createReservation({
                pharmacyId: p.id,
                medicineId: m.id,
                qty,
                name,
                phone,
                withDeposit: deposit,
              });
              if (!deposit) return router.push(`/v6/reservation/${r.code}`);
              setBusy(true);
              try {
                const res = await fetch("/api/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    purpose: "deposit",
                    ref: r.code,
                    version: "v6",
                  }),
                });
                const data = (await res.json()) as { url?: string };
                if (!data.url) throw new Error();
                window.location.assign(data.url);
              } catch {
                router.push(`/v6/reservation/${r.code}`);
              }
            }}
          >
            <div>
              <label htmlFor="name" className="block font-semibold">
                Full name
              </label>
              <p className="text-sm text-(--e-muted)">
                The pharmacist will ask for this name.
              </p>
              {errors.name && (
                <p className="mt-1 text-sm font-semibold text-(--e-red)">
                  <span className="sr-only">Error: </span>
                  {errors.name}
                </p>
              )}
              <input
                id="name"
                name="name"
                autoComplete="name"
                className={`${fieldClass("name")} max-w-md`}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block font-semibold">
                Mobile number
              </label>
              <p className="text-sm text-(--e-muted)">
                We send a text message when the medicine is ready. For example,
                0550 12 34 56.
              </p>
              {errors.phone && (
                <p className="mt-1 text-sm font-semibold text-(--e-red)">
                  <span className="sr-only">Error: </span>
                  {errors.phone}
                </p>
              )}
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={`${fieldClass("phone")} max-w-xs`}
              />
            </div>

            <div>
              <label htmlFor="qty" className="block font-semibold">
                Number of boxes
              </label>
              <select
                id="qty"
                name="qty"
                defaultValue="1"
                className="v6-input mt-2 max-w-[8rem]"
              >
                {Array.from({ length: max }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="font-semibold">
                Do you want to pay a deposit?
              </legend>
              <p className="text-sm text-(--e-muted)">
                A deposit keeps the medicine for longer. It is deducted from the
                price at the counter.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 ring-(--e-line) has-checked:bg-(--e-sage) has-checked:ring-2 has-checked:ring-(--e-green)">
                  <input
                    type="radio"
                    name="deposit"
                    value="no"
                    defaultChecked
                    className="mt-0.5 size-5 shrink-0 accent-(--e-green)"
                  />
                  <span>No, hold it for {HOLD_HOURS} hours</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 ring-(--e-line) has-checked:bg-(--e-sage) has-checked:ring-2 has-checked:ring-(--e-green)">
                  <input
                    type="radio"
                    name="deposit"
                    value="yes"
                    className="mt-0.5 size-5 shrink-0 accent-(--e-green)"
                  />
                  <span>
                    Yes, pay {fmtPrice(DEPOSIT_DZD)} by Edahabia or CIB and hold
                    it for {HOLD_HOURS_WITH_DEPOSIT} hours
                  </span>
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={busy}
              className="v6-btn v6-btn-cta h-13 w-full px-6 text-lg sm:w-auto"
            >
              {busy ? "Opening payment…" : "Send reservation request"}
            </button>
          </form>
        </div>

        <aside data-reveal className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[28px] bg-(--e-dark) text-white">
            <div className="p-6">
              <p className="text-sm text-(--e-sage-2)">Your reservation</p>
              <p className="v6-serif mt-2 text-3xl">
                {m.name} <em className="text-(--e-sage-2)!">{m.dosage}</em>
              </p>
              <p className="text-sm text-(--e-sage-2)">{m.dci}</p>
            </div>
            <dl className="space-y-3 border-t border-white/10 p-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-(--e-sage-2)">Pharmacy</dt>
                <dd className="text-end">
                  {p.name}
                  <span className="block text-(--e-sage-2)">{p.commune}</span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-(--e-sage-2)">On the shelf</dt>
                <dd className="v6-nums">{available} boxes</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-(--e-sage-2)">Price per box</dt>
                <dd className="v6-nums">
                  {fmtPrice(m.priceDzd)}, at the counter
                </dd>
              </div>
            </dl>
          </div>
          {m.rx && (
            <div className="mt-4">
              <Inset>
                <p className="text-sm">
                  This medicine needs a prescription. Bring it when you collect.
                </p>
              </Inset>
            </div>
          )}
        </aside>
      </Reveal>
    </div>
  );
}
