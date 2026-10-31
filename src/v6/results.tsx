"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { pharmacies, stock, type Medicine } from "@/lib/data";
import { extrasOf, waitNow } from "@/lib/extras";
import {
  algiersMinutes,
  availabilityFor,
  distanceKm,
  DEFAULT_ORIGIN,
  equivalentsOf,
  fmtKm,
  fmtPrice,
  fmtUpdated,
  hoursLabel,
  isOpen,
  searchMedicines,
  statusOf,
  type Availability,
} from "@/lib/finder";
import { addAlert, useAlerts, validPhone } from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import { SearchForm } from "./search-form";
import { Check, ChevronDown, Phone } from "lucide-react";
import { Reveal } from "./reveal";
import { Breadcrumbs, Gauge, StockTag, Tag, Warning } from "./ui";

export type Filters = {
  stocked: boolean;
  open: boolean;
  garde: boolean;
  chifa: boolean;
  sort: "near" | "most";
};

const FILTERS: {
  key: Exclude<keyof Filters, "sort">;
  label: string;
  hint?: string;
}[] = [
  { key: "stocked", label: "In stock only" },
  { key: "open", label: "Open now" },
  { key: "garde", label: "On duty tonight" },
  {
    key: "chifa",
    label: "Accepts the CHIFA card",
    hint: "No payment up front for covered medicines",
  },
];

export function Results({ q, initial }: { q: string; initial: Filters }) {
  const router = useRouter();
  const now = useNow();
  const minutes = now ? algiersMinutes(now) : null;
  const [f, setF] = useState(initial);
  const matches = useMemo(() => searchMedicines(q), [q]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const med: Medicine | undefined =
    matches.find((m) => m.id === pickedId) ?? matches[0];

  const update = (next: Filters) => {
    setF(next);
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    for (const k of ["stocked", "open", "garde", "chifa"] as const)
      if (next[k]) sp.set(k, "1");
    if (next.sort !== "near") sp.set("sort", next.sort);
    router.replace(`/v6/search${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const all: Availability[] = useMemo(
    () =>
      med
        ? availabilityFor(med.id)
        : pharmacies
            .map((pharmacy) => ({
              pharmacy,
              item: undefined,
              status: "in" as const,
              km: distanceKm(DEFAULT_ORIGIN, pharmacy),
            }))
            .sort((a, b) => a.km - b.km),
    [med],
  );
  const filtered = all.filter(
    (a) =>
      (!f.open || minutes === null || isOpen(a.pharmacy, minutes)) &&
      (!f.garde || a.pharmacy.onDuty) &&
      (!f.chifa || extrasOf(a.pharmacy.id).chifa),
  );
  const sorter = (a: Availability, b: Availability) =>
    f.sort === "most" ? (b.item?.qty ?? 0) - (a.item?.qty ?? 0) : a.km - b.km;
  const withStock = med
    ? filtered.filter((a) => a.status !== "out").sort(sorter)
    : filtered;
  const without =
    med && !f.stocked
      ? filtered.filter((a) => a.status === "out").sort((a, b) => a.km - b.km)
      : [];
  const stockedTotal = med ? all.filter((a) => a.status !== "out").length : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
      <Breadcrumbs
        items={[
          { href: "/v6", label: "Home" },
          { label: med ? `${med.name} ${med.dosage}` : "Search" },
        ]}
      />

      {q && !med ? (
        <div className="mt-10 max-w-2xl">
          <h1 className="v6-serif text-5xl">
            Nothing matches <em>&ldquo;{q}&rdquo;</em>
          </h1>
          <p className="mt-4 text-lg text-(--e-muted)">
            Check the spelling on the box, or search for the active ingredient
            printed under the name.
          </p>
          <div className="mt-8">
            <SearchForm defaultValue={q} compact />
          </div>
        </div>
      ) : (
        <>
          <header className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div>
              {med ? (
                <>
                  <p className="flex flex-wrap items-center gap-2 text-(--e-muted)">
                    {med.dci} · {med.form}
                    {med.rx && <Tag tone="warm">Prescription</Tag>}
                  </p>
                  <h1 className="v6-serif mt-2 text-[clamp(2.6rem,5vw,4rem)]">
                    {med.name} <em>{med.dosage}</em>
                  </h1>
                  <p className="mt-3 text-lg">
                    <strong className="v6-nums text-(--e-green)">
                      {stockedTotal}
                    </strong>{" "}
                    of {pharmacies.length} pharmacies have it · about{" "}
                    {fmtPrice(med.priceDzd)} a box
                  </p>
                </>
              ) : (
                <h1 className="v6-serif text-[clamp(2.6rem,5vw,4rem)]">
                  {f.garde ? (
                    <>
                      On duty <em>tonight</em>
                    </>
                  ) : (
                    <>
                      All <em>pharmacies</em>
                    </>
                  )}
                </h1>
              )}
              {matches.length > 1 && (
                <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-(--e-muted)">
                  Also:
                  {matches
                    .filter((m) => m.id !== med?.id)
                    .slice(0, 5)
                    .map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPickedId(m.id)}
                        className="rounded-full bg-white px-3 py-1 font-medium text-(--e-ink) ring-1 ring-(--e-line) hover:ring-(--e-green)"
                      >
                        {m.name} {m.dosage}
                      </button>
                    ))}
                </p>
              )}
            </div>
            <SearchForm defaultValue={q} compact key={q} />
          </header>

          <div
            className="mt-10 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filters"
          >
            {FILTERS.filter((x) => x.key !== "stocked" || med).map((x) => (
              <button
                key={x.key}
                type="button"
                aria-pressed={f[x.key]}
                title={x.hint}
                onClick={() => update({ ...f, [x.key]: !f[x.key] })}
                className={`v6-btn h-10 px-4 text-sm ${f[x.key] ? "bg-(--e-green) text-white" : "bg-white text-(--e-ink) ring-1 ring-(--e-line) hover:ring-(--e-green)"}`}
              >
                {f[x.key] && <Check className="size-4" aria-hidden />}
                {x.label}
              </button>
            ))}
            {med && (
              <label className="ms-auto flex items-center gap-2 text-sm text-(--e-muted)">
                Sort
                <select
                  value={f.sort}
                  onChange={(e) =>
                    update({ ...f, sort: e.target.value as Filters["sort"] })
                  }
                  className="v6-input w-auto! py-2!"
                >
                  <option value="near">Nearest first</option>
                  <option value="most">Most boxes first</option>
                </select>
              </label>
            )}
          </div>

          <section aria-live="polite" className="mt-8">
            {med && stockedTotal <= 2 && (
              <ScarceNotice med={med} count={stockedTotal} />
            )}
            <h2 className="text-sm font-semibold tracking-wide text-(--e-muted) uppercase">
              {withStock.length}{" "}
              {withStock.length === 1 ? "pharmacy" : "pharmacies"}
              {med && " with stock"}
              {(f.open || f.garde || f.chifa || f.stocked) && " (filtered)"} ·
              distances from Alger Centre
            </h2>
            {withStock.length === 0 ? (
              <div className="v6-card mt-4 p-8 text-center">
                <p className="v6-serif text-2xl">
                  No pharmacy matches these filters.
                </p>
                <p className="mt-2 text-(--e-muted)">
                  Remove a filter to see more.
                </p>
              </div>
            ) : (
              <Reveal className="mt-4 grid gap-3">
                {withStock.map((a, i) => (
                  <ResultItem
                    key={a.pharmacy.id}
                    a={a}
                    med={med}
                    minutes={minutes}
                    best={!!med && i === 0}
                  />
                ))}
              </Reveal>
            )}

            {without.length > 0 && (
              <details className="group mt-10">
                <summary className="v6-btn v6-btn-ghost h-11 cursor-pointer list-none px-5 text-sm">
                  {without.length} pharmacies without stock
                  <ChevronDown
                    className="size-4 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="mt-4 grid gap-3 opacity-80">
                  {without.map((a) => (
                    <ResultItem
                      key={a.pharmacy.id}
                      a={a}
                      med={med}
                      minutes={minutes}
                      best={false}
                    />
                  ))}
                </div>
              </details>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ResultItem({
  a,
  med,
  minutes,
  best,
}: {
  a: Availability;
  med?: Medicine;
  minutes: number | null;
  best: boolean;
}) {
  const p = a.pharmacy;
  const open = minutes === null ? null : isOpen(p, minutes);
  const qty = a.item?.qty ?? 0;
  const ex = extrasOf(p.id);
  return (
    <article
      data-reveal
      className={`v6-card group relative grid gap-5 p-5 hover:shadow-[0_20px_40px_-24px_rgb(15_76_58/0.45)] sm:grid-cols-[minmax(0,1fr)_14rem_auto] sm:items-center sm:p-6 ${best ? "ring-2 ring-(--e-green)" : ""}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {best && <Tag tone="dark">Best match</Tag>}
          {p.onDuty && <Tag tone="sage">On duty tonight</Tag>}
          {open !== null && !p.onDuty && (
            <Tag tone={open ? "sage" : "grey"}>
              {open ? "Open now" : "Closed now"}
            </Tag>
          )}
          {ex.chifa && <Tag tone="grey">CHIFA</Tag>}
        </div>
        <h3 className="v6-serif mt-2 text-2xl">
          <Link
            href={`/v6/pharmacy/${p.id}`}
            className="after:absolute after:inset-0"
          >
            {p.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-(--e-muted)">
          {p.address}, {p.commune} ·{" "}
          <span className="v6-nums">{fmtKm(a.km)}</span>
          {open && minutes !== null && (
            <>
              {" "}
              · <span className="v6-nums">
                ~{waitNow(p.id, minutes)} min
              </span>{" "}
              wait
            </>
          )}
        </p>
      </div>
      {med ? (
        <div>
          <div className="flex items-center justify-between gap-2">
            <StockTag status={a.status} />
            <span className="v6-nums text-sm font-semibold">
              {a.item ? `${qty} ${qty === 1 ? "box" : "boxes"}` : "Not listed"}
            </span>
          </div>
          <Gauge qty={qty} status={a.status} className="mt-2.5 w-full" />
          {a.item && (
            <p className="mt-1.5 text-xs text-(--e-muted)">
              Counted {fmtUpdated(a.item.updatedMinsAgo)}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-(--e-muted)">{hoursLabel(p)}</p>
      )}
      <div className="relative z-10 flex items-center gap-2">
        <a
          href={`tel:${p.phone.replace(/\s/g, "")}`}
          aria-label={`Call ${p.name}`}
          className="v6-btn v6-btn-ghost size-11"
        >
          <Phone className="size-4" aria-hidden />
        </a>
        {med && a.status !== "out" && (
          <Link
            href={`/v6/reserve?pharmacy=${p.id}&medicine=${med.id}`}
            className="v6-btn v6-btn-cta h-11 px-5 text-sm"
          >
            Reserve
          </Link>
        )}
      </div>
    </article>
  );
}

function ScarceNotice({ med, count }: { med: Medicine; count: number }) {
  const alerts = useAlerts();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const subscribed = alerts.some((x) => x.medicineId === med.id);
  const alts = equivalentsOf(med)
    .map((m) => ({
      m,
      n: stock.filter((s) => s.medicineId === m.id && statusOf(s.qty) !== "out")
        .length,
    }))
    .filter((x) => x.n > 0);

  return (
    <div className="mb-8 rounded-3xl bg-(--e-amber-tint) p-6">
      <Warning>
        {count === 0
          ? `No pharmacy reports ${med.name} in stock.`
          : `Only ${count} ${count === 1 ? "pharmacy reports" : "pharmacies report"} ${med.name} in stock.`}
      </Warning>
      {alts.length > 0 && (
        <p className="mt-3">
          The same active ingredient is available as{" "}
          {alts.map(({ m, n }, i) => (
            <span key={m.id}>
              {i > 0 && (i === alts.length - 1 ? " and " : ", ")}
              <Link
                href={`/v6/search?q=${encodeURIComponent(m.name)}`}
                className="font-semibold text-(--e-green) underline underline-offset-2"
              >
                {m.name} {m.dosage}
              </Link>{" "}
              ({n} pharmacies)
            </span>
          ))}
          . Ask your doctor or pharmacist before switching.
        </p>
      )}
      {subscribed ? (
        <p className="mt-4 font-semibold text-(--e-green)">
          We will send you a text message when more stock is reported.
        </p>
      ) : (
        <form
          noValidate
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validPhone(phone))
              return setError(
                "Enter a mobile number in the correct format, like 0550 12 34 56",
              );
            setError(null);
            addAlert(med.id, phone);
          }}
        >
          <label htmlFor="alert-phone" className="block font-semibold">
            Get a text message when more stock is reported
          </label>
          <p className="text-sm text-(--e-muted)">
            Mobile number, for example 0550 12 34 56
          </p>
          {error && (
            <p className="mt-1 font-semibold text-(--e-red)" role="alert">
              <span className="sr-only">Error: </span>
              {error}
            </p>
          )}
          <div className="mt-2 flex max-w-md gap-2">
            <input
              id="alert-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`v6-input min-w-0 flex-1 ${error ? "border-(--e-red)!" : ""}`}
            />
            <button
              type="submit"
              className="v6-btn v6-btn-cta h-12 shrink-0 px-5"
            >
              Notify me
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
