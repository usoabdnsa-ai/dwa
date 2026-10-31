"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getMedicine, getPharmacy } from "@/lib/data";
import { fmtPrice } from "@/lib/finder";
import {
  DEPOSIT_DZD,
  updateReservation,
  useReservations,
  type Reservation,
} from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import { Phone } from "lucide-react";
import { Reveal } from "./reveal";
import { Inset, SummaryList, Tag } from "./ui";

const time = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Algiers",
});

const STAGES = ["requested", "confirmed", "ready"] as const;

const STATUS: Record<
  Reservation["status"],
  { label: string; tone: "sage" | "warm" | "grey" | "dark" }
> = {
  requested: { label: "Sent", tone: "warm" },
  confirmed: { label: "Confirmed", tone: "sage" },
  ready: { label: "Ready", tone: "dark" },
  collected: { label: "Collected", tone: "grey" },
  declined: { label: "Declined by the pharmacy", tone: "grey" },
  cancelled: { label: "Cancelled", tone: "grey" },
};

const PANEL: Record<Reservation["status"], string> = {
  requested: "Reservation request sent",
  confirmed: "Reservation confirmed",
  ready: "Ready to collect",
  collected: "Medicine collected",
  declined: "Reservation declined",
  cancelled: "Reservation cancelled",
};

/* Confirmation page: the reference number in a panel, what happens next, and the live status. */
export function ReservationStatus({
  code,
  paid,
}: {
  code: string;
  paid: string | null;
}) {
  const r = useReservations().find((x) => x.code === code);
  const now = useNow();

  useEffect(() => {
    if (r && paid === "1" && r.deposit !== "paid")
      updateReservation(r.code, { deposit: "paid" });
  }, [paid, r]);

  // Demo: pharmacies without a dashboard here answer on their own after a few seconds.
  useEffect(() => {
    if (!r || r.pharmacyId === "kouba-garidi") return;
    const next =
      r.status === "requested"
        ? "confirmed"
        : r.status === "confirmed"
          ? "ready"
          : null;
    if (!next) return;
    const t = setTimeout(
      () => updateReservation(r.code, { status: next }),
      r.status === "requested" ? 4000 : 6000,
    );
    return () => clearTimeout(t);
  }, [r]);

  if (!r) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="v6-serif text-5xl">
          Reservation <em>not found</em>
        </h1>
        <p className="mt-4 text-lg text-(--e-muted)">
          This demonstration keeps reservations in this browser only.
        </p>
        <Link href="/v6" className="v6-btn v6-btn-cta mt-8 h-12 px-6">
          Search for a medicine
        </Link>
      </div>
    );
  }

  const p = getPharmacy(r.pharmacyId)!;
  const m = getMedicine(r.medicineId)!;
  const s = STATUS[r.status];
  const total = m.priceDzd * r.qty - (r.deposit === "paid" ? DEPOSIT_DZD : 0);
  const active =
    r.status !== "collected" &&
    r.status !== "declined" &&
    r.status !== "cancelled";
  const stage = STAGES.indexOf(r.status as (typeof STAGES)[number]);

  return (
    <Reveal className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6">
      <div
        data-reveal
        className={`relative overflow-hidden rounded-[36px] px-6 py-12 text-center text-white sm:px-12 ${active || r.status === "collected" ? "bg-(--e-dark)" : "bg-(--e-muted)"}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(159_196_178/0.22),transparent)]"
        />
        <p className="relative text-(--e-sage-2)">{PANEL[r.status]}</p>
        <p className="v6-nums relative mt-3 text-[clamp(3rem,10vw,5.5rem)] leading-none font-semibold tracking-wider">
          {r.code}
        </p>
        <p className="relative mt-4 text-sm text-(--e-sage-2)">
          Give this code at the counter
        </p>

        {stage >= 0 && (
          <ol
            className="relative mx-auto mt-10 grid max-w-md grid-cols-3 gap-2 text-xs"
            aria-label="Progress"
          >
            {STAGES.map((st, i) => (
              <li key={st} className="text-start">
                <span className="block h-1.5 overflow-hidden rounded-full bg-white/15">
                  <span
                    className="block h-full origin-left rounded-full bg-(--e-peach) transition-transform duration-500"
                    style={{
                      transform: `scaleX(${i <= stage ? 1 : 0})`,
                      transitionTimingFunction: "var(--e-ease)",
                    }}
                  />
                </span>
                <span
                  className={`mt-2 block ${i <= stage ? "text-white" : "text-(--e-sage-2)"}`}
                >
                  {STATUS[st].label}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div data-reveal className="mt-8">
        <SummaryList
          rows={[
            { key: "Status", value: <Tag tone={s.tone}>{s.label}</Tag> },
            { key: "Medicine", value: `${r.qty} × ${m.name} ${m.dosage}` },
            { key: "Pharmacy", value: `${p.name}, ${p.address}, ${p.commune}` },
            {
              key: "Held until",
              value: (
                <span className="v6-nums">
                  {time.format(r.holdUntil)}
                  {now && now.getTime() > r.holdUntil && active
                    ? " (expired)"
                    : ""}
                </span>
              ),
            },
            {
              key: "To pay at the counter",
              value: <span className="v6-nums">{fmtPrice(total)}</span>,
            },
            {
              key: "Deposit",
              value:
                r.deposit === "paid"
                  ? `${fmtPrice(DEPOSIT_DZD)} paid`
                  : r.deposit === "pending"
                    ? paid === "0"
                      ? "Payment not completed"
                      : "Payment pending"
                    : "No deposit",
            },
          ]}
        />
      </div>

      {r.status === "requested" && r.pharmacyId === "kouba-garidi" && (
        <div data-reveal className="mt-6">
          <Inset>
            <p>
              Demonstration: you can play the pharmacist.{" "}
              <Link
                href="/dashboard"
                target="_blank"
                className="font-semibold text-(--e-green) underline underline-offset-2"
              >
                Open the dashboard in a new tab
              </Link>{" "}
              and confirm this request. This page updates on its own.
            </p>
          </Inset>
        </div>
      )}

      <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="v6-btn v6-btn-ghost h-12 px-6"
        >
          <Phone className="size-4" aria-hidden />{" "}
          <span className="v6-nums">{p.phone}</span>
        </a>
        {active && (
          <button
            type="button"
            onClick={() => updateReservation(r.code, { status: "cancelled" })}
            className="v6-btn h-12 px-6 text-(--e-red) hover:bg-(--e-red-tint)"
          >
            Cancel reservation
          </button>
        )}
        {m.rx && (
          <p className="w-full text-sm text-(--e-muted)">
            Bring your prescription when you collect.
          </p>
        )}
      </div>
    </Reveal>
  );
}
