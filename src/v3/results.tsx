"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Check, LocateFixed, Loader2, Phone, SearchX } from "lucide-react";
import { pharmacies, type Medicine } from "@/lib/data";
import {
  DEFAULT_ORIGIN,
  algiersMinutes,
  availabilityFor,
  distanceKm,
  equivalentsOf,
  fmtPrice,
  fmtUpdated,
  hoursLabel,
  isOpen,
  searchMedicines,
  type Availability,
} from "@/lib/finder";
import { useNow } from "@/lib/use-now";
import { CityPlan } from "./city-plan";
import { SearchBox } from "./search-box";
import { Gauge, Pill, StatusPill } from "./ui";

gsap.registerPlugin(useGSAP);

type Filters = { stocked: boolean; open: boolean; garde: boolean };
type Origin = { lat: number; lng: number; label: string };

export function Results({ q, initial }: { q: string; initial: Filters }) {
  const router = useRouter();
  const now = useNow();
  const minutes = now ? algiersMinutes(now) : null;
  const [filters, setFilters] = useState(initial);
  const [origin, setOrigin] = useState<Origin>(DEFAULT_ORIGIN);
  const [locating, setLocating] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => searchMedicines(q), [q]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const med: Medicine | undefined = matches.find((m) => m.id === pickedId) ?? matches[0];

  const toggle = (k: keyof Filters) => {
    const next = { ...filters, [k]: !filters[k] };
    setFilters(next);
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    for (const key of ["stocked", "open", "garde"] as const) if (next[key]) sp.set(key, "1");
    router.replace(`/v3/search${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const rows: Availability[] = useMemo(() => {
    const base: Availability[] = med
      ? availabilityFor(med.id, origin)
      : pharmacies
          .map((pharmacy) => ({ pharmacy, item: undefined, status: "in" as const, km: distanceKm(origin, pharmacy) }))
          .sort((a, b) => a.km - b.km);
    return base.filter(
      (r) =>
        (!filters.stocked || !med || r.status !== "out") &&
        (!filters.garde || r.pharmacy.onDuty) &&
        (!filters.open || minutes === null || isOpen(r.pharmacy, minutes)),
    );
  }, [med, origin, filters, minutes]);

  const stockedCount = med ? rows.filter((r) => r.status !== "out").length : rows.length;
  const rowKey = rows.map((r) => r.pharmacy.id).join() + (med?.id ?? "");

  // Cards deal in, gauges fill, the count rolls up. Short: this screen is used, not watched.
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-card]", { y: 24, autoAlpha: 0, duration: 0.35, ease: "power3.out", stagger: 0.04, clearProps: "transform" });
        gsap.from("[data-card] [data-gauge]", { scaleX: 0, duration: 0.6, ease: "power3.out", stagger: 0.04, delay: 0.1 });
        const el = ref.current?.querySelector<HTMLElement>("[data-count]");
        if (el) {
          const n = { v: 0 };
          gsap.to(n, { v: stockedCount, duration: 0.6, ease: "power2.out", onUpdate: () => void (el.textContent = String(Math.round(n.v))) });
        }
      });
    },
    { scope: ref, dependencies: [rowKey] },
  );

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "you" });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  const equivalents = med ? equivalentsOf(med) : [];
  const chips = (
    [
      ["stocked", "In stock only", !!med],
      ["open", "Open now", true],
      ["garde", "De garde", true],
    ] as const
  ).filter(([, , show]) => show);

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-4 pt-4 pb-20 sm:px-8">
      <div className="max-w-3xl">
        <SearchBox key={q} defaultValue={q} size="md" />
      </div>

      {q && !med && (
        <div className="v3-sticker mt-10 flex max-w-2xl items-start gap-5 rounded-[2rem] bg-white p-7">
          <SearchX className="size-8 shrink-0 text-(--pp-red)" aria-hidden="true" />
          <div>
            <h1 className="v3-display text-3xl">Nothing called “{q}”.</h1>
            <p className="mt-2 font-medium text-(--pp-muted)">Check the spelling, or try the active ingredient printed on the box, like “paracetamol”.</p>
          </div>
        </div>
      )}

      {med && (
        <header className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-(--pp-muted)">
              {med.dci} · {med.form}
              {med.rx && <span className="rounded-full bg-(--pp-ink) px-2.5 py-0.5 text-xs text-(--pp-mint)">Prescription</span>}
            </p>
            <h1 className="v3-display mt-2 text-[clamp(2.4rem,6vw,4.8rem)]">
              {med.name} <span className="text-(--pp-green)">{med.dosage}</span>
            </h1>
          </div>
          <div className="v3-sticker flex items-center gap-4 rounded-full bg-(--pp-lemon) py-2 pr-6 pl-2">
            <span className="grid size-14 place-items-center rounded-full bg-(--pp-ink) text-(--pp-mint)">
              <span data-count className="v3-display v3-nums text-2xl">
                {stockedCount}
              </span>
            </span>
            <span className="text-sm leading-tight font-semibold">
              of {rows.length} have it
              <br />~{fmtPrice(med.priceDzd)}
            </span>
          </div>
        </header>
      )}

      {med && matches.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {matches.slice(0, 6).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPickedId(m.id)}
              aria-pressed={m.id === med.id}
              className="rounded-full border-2 border-(--pp-ink) bg-white px-4 py-1.5 text-sm font-semibold aria-pressed:bg-(--pp-ink) aria-pressed:text-(--pp-mint)"
            >
              {m.name} {m.dosage}
            </button>
          ))}
        </div>
      )}

      {!q && (
        <header className="mt-10">
          <h1 className="v3-display text-[clamp(2.2rem,5vw,4rem)]">{filters.garde ? "Open tonight" : "Every pharmacy"}</h1>
          <p className="mt-2 font-medium text-(--pp-muted)">Type a medicine above to see who has it.</p>
        </header>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {chips.map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={filters[k]}
            onClick={() => toggle(k)}
            className="v3-press flex items-center gap-1.5 rounded-full border-2 border-(--pp-ink) bg-white px-4 py-2 text-sm font-bold aria-pressed:bg-(--pp-green) aria-pressed:text-white"
          >
            {filters[k] && <Check className="size-4" aria-hidden="true" />}
            {label}
          </button>
        ))}
        <button type="button" onClick={locate} className="ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-(--pp-mint-2)">
          {locating ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="size-4" aria-hidden="true" />}
          From {origin.label}
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <ol className="flex flex-col gap-4">
          {rows.length === 0 && (
            <li className="v3-sticker flex items-center gap-5 rounded-[2rem] bg-white p-7">
              <Pill kind="capsule" a="var(--pp-lilac)" className="w-16 shrink-0 rotate-12" />
              <p className="font-semibold">No pharmacy matches these filters. Turn one off to see more.</p>
            </li>
          )}
          {rows.map((r) => {
            const open = minutes === null ? null : isOpen(r.pharmacy, minutes);
            const qty = r.item?.qty ?? 0;
            const dim = med && r.status === "out";
            return (
              <li key={r.pharmacy.id} onMouseEnter={() => setActive(r.pharmacy.id)} onMouseLeave={() => setActive(null)}>
                <article
                  data-card
                  className={`v3-sticker relative rounded-[1.75rem] p-5 transition-transform duration-200 sm:p-6 ${dim ? "bg-white/60" : "bg-white"} ${active === r.pharmacy.id ? "-translate-y-1" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/v3/pharmacy/${r.pharmacy.id}`} className="text-xl font-extrabold after:absolute after:inset-0 after:rounded-[1.75rem] hover:underline">
                        {r.pharmacy.name}
                      </Link>
                      <p className="mt-0.5 text-sm font-medium text-(--pp-muted)">
                        {r.pharmacy.commune} · {r.km.toFixed(1)} km · {hoursLabel(r.pharmacy)}
                      </p>
                    </div>
                    {med ? (
                      <StatusPill status={r.status} />
                    ) : (
                      open !== null && (
                        <span className={`shrink-0 rounded-full border-2 px-3 py-1 text-xs font-bold ${open ? "border-(--pp-green) bg-(--pp-green) text-white" : "border-(--pp-ink) bg-white"}`}>
                          {open ? "Open now" : "Closed"}
                        </span>
                      )
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {med && (
                        <>
                          <Gauge qty={qty} status={r.status} />
                          <span className="v3-nums text-sm font-semibold">
                            {r.item ? `${qty} box${qty === 1 ? "" : "es"} · ${fmtUpdated(r.item.updatedMinsAgo)}` : "Not carried here"}
                          </span>
                        </>
                      )}
                      {r.pharmacy.onDuty && <span className="rounded-full bg-(--pp-tang) px-2.5 py-0.5 text-xs font-bold">De garde</span>}
                    </div>
                    <a
                      href={`tel:${r.pharmacy.phone.replace(/\s/g, "")}`}
                      className="relative z-10 flex items-center gap-1.5 rounded-full bg-(--pp-mint) px-3 py-1.5 text-sm font-semibold hover:bg-(--pp-lemon)"
                    >
                      <Phone className="size-4" aria-hidden="true" /> Call
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <aside className="order-first flex flex-col gap-6 lg:sticky lg:top-6 lg:order-none lg:self-start">
          <figure className="v3-sticker overflow-hidden rounded-[2rem] bg-white">
            <CityPlan points={rows.map((r) => ({ ...r.pharmacy, status: med ? r.status : "none" }))} origin={origin} active={active} onHover={setActive} />
            <figcaption className="flex flex-wrap gap-x-4 gap-y-1 border-t-2 border-(--pp-ink) px-5 py-3 text-xs font-bold">
              {med && (
                <>
                  <span className="flex items-center gap-1.5"><span className="size-3 rounded border-2 border-(--pp-ink) bg-(--pp-green)" /> In stock</span>
                  <span className="flex items-center gap-1.5"><span className="size-3 rounded border-2 border-(--pp-ink) bg-(--pp-tang)" /> Last few</span>
                  <span className="flex items-center gap-1.5"><span className="size-3 rounded border-2 border-(--pp-ink) bg-white" /> Out</span>
                </>
              )}
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-dashed border-(--pp-tang)" /> De garde</span>
            </figcaption>
          </figure>

          {equivalents.length > 0 && (
            <div className="v3-sticker rounded-[2rem] bg-(--pp-lilac) p-5">
              <p className="font-extrabold">Same active ingredient</p>
              <ul className="mt-3 space-y-2">
                {equivalents.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/v3/search?q=${encodeURIComponent(m.name)}`}
                      className="v3-press flex items-center justify-between gap-3 rounded-full border-2 border-(--pp-ink) bg-white px-4 py-2"
                    >
                      <span className="font-bold">
                        {m.name} <span className="font-medium">{m.dosage}</span>
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold">
                        {fmtPrice(m.priceDzd)} <ArrowUpRight className="size-4" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
