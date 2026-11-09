"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, BellRing, Camera, Check, CreditCard, Moon, PackageCheck, Search, X } from "lucide-react";
import { pharmacies } from "@/lib/data";
import { extrasOf } from "@/lib/extras";
import { availabilityFor, DEFAULT_ORIGIN, distanceKm, fmtKm } from "@/lib/finder";
import { setBlob, TINTS } from "./blob";
import { onIntroDone } from "./intro";
import { OpenMap } from "./map";
import { Kicker, MedicineSearch, OpenPill, StockChip } from "./ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CHIPS = ["Ventoline", "Lantus", "Augmentin", "Doliprane", "Smecta"];
const OLD_WAY = ["Meziane", "Du Centre", "Des Pins", "La Colonne"];
const STEPS = [
  { title: "Type the medicine", text: "Brand or active ingredient. dwa also suggests equivalents, like Efferalgan when Doliprane is gone." },
  { title: "See who has it", text: "Real shelf counts from each pharmacist's dashboard, with when they last checked." },
  { title: "Reserve, then collect", text: "Held 2 hours free, or 4 hours with a 100 DA deposit that comes off the price." },
];

/** Blob positions per beat. Units: y from -1 (bottom) to 1 (top), x scaled by the aspect ratio. */
function place(beat: "hero" | "old" | "how" | "bento" | "close") {
  const w = innerWidth, ar = w / innerHeight, narrow = w < 1024;
  const P = {
    hero: narrow ? { x: 0, y: 0.64, scale: 0.5 } : { x: 0, y: 0.6, scale: 0.64 },
    old: narrow ? { x: ar * 0.6, y: 0.8, scale: 0.32 } : { x: ar * 0.5, y: 0.66, scale: 0.4 },
    how: narrow ? { x: 0, y: 0.45, scale: 0.6 } : { x: ar * 0.42, y: 0, scale: 1.05 },
    bento: narrow ? { x: ar * 0.7, y: 0.85, scale: 0.3 } : { x: ar * 0.8, y: 0.78, scale: 0.42 },
    close: narrow ? { x: 0, y: 0.5, scale: 0.6 } : { x: 0, y: 0.45, scale: 0.85 },
  };
  return P[beat];
}

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  const live = availabilityFor("ventoline-100").slice(0, 3);
  const tonight = pharmacies.filter((p) => p.onDuty).map((p) => ({ p, km: distanceKm(DEFAULT_ORIGIN, p) })).sort((a, b) => a.km - b.km);
  const chifa = pharmacies.filter((p) => extrasOf(p.id).chifa).length;

  useGSAP(
    () => {
      setBlob({ ...place("hero"), morph: 0, tint: TINTS.pearl });

      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };

        /* How it works: pinned; scroll progress melts the blob from pill to shelf to ticket. */
        ScrollTrigger.create({
          trigger: ".b-how",
          start: "top top",
          end: "+=1800",
          pin: ".b-how-pin",
          scrub: motion ? 0.4 : false,
          onToggle: (st) => st.isActive && setBlob({ ...place("how"), tint: TINTS.pearl }),
          onUpdate: (st) => {
            const step = Math.min(2, Math.floor(st.progress * 3));
            setBlob({ ...place("how"), morph: 1 + Math.min(2, st.progress * 2.4) });
            root.current?.querySelectorAll<HTMLElement>(".how-step").forEach((el, i) => el.toggleAttribute("data-on", i === step));
          },
        });
        if (!motion) return;

        const hero = gsap.timeline({ paused: true });
        hero
          .from(".h-word", { yPercent: 115, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 })
          .from(".h-fade", { opacity: 0, y: 16, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0.25)
          .from(".h-tile", { opacity: 0, y: 30, scale: 0.94, duration: 0.8, ease: "back.out(1.4)", stagger: 0.1 }, 0.5);
        const off = onIntroDone(() => hero.play());

        /* The old way: four "no" cards stack up as you scroll, then the right one lands.
           refreshPriority 1: this pin sits above "how it works" but is created after it, so it must be measured first. */
        const cards = gsap.utils.toArray<HTMLElement>(".o-card");
        const clock = { m: 0 };
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".b-old", refreshPriority: 1, start: desktop ? "top top" : "top 70%", end: desktop ? "+=1700" : "bottom 70%", scrub: 0.5, pin: desktop ? ".b-old-pin" : false } });
        cards.forEach((c, i) => tl.from(c, { yPercent: 140, rotate: i % 2 ? 6 : -6, opacity: 0, duration: 1, ease: "power2.out" }, i * 0.8));
        tl.to(clock, { m: 47, duration: cards.length * 0.8, ease: "none", onUpdate: () => { const el = root.current?.querySelector(".o-clock"); if (el) el.textContent = String(Math.round(clock.m)); } }, 0);
        tl.from(".o-after", { opacity: 0, y: 16, duration: 0.6 }, ">-0.2");

        gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el) => gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
        gsap.from(".bento > *", { opacity: 0, y: 40, scale: 0.97, duration: 0.8, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: ".bento", start: "top 80%", once: true } });
        gsap.timeline({ scrollTrigger: { trigger: ".b-pharm", start: "top 60%", once: true } })
          .from(".ph-toast", { y: -30, opacity: 0, duration: 0.6, ease: "back.out(1.7)" })
          .to(".ph-a", { yPercent: -100, opacity: 0, duration: 0.35 }, "+=0.4")
          .from(".ph-b", { yPercent: 100, opacity: 0, duration: 0.35 }, "<");
        return () => off();
      });

      /* Created after the pins so their start/end include the pin spacing. */
      const beat = (trigger: string, b: Parameters<typeof place>[0], extra: Record<string, unknown> = {}) =>
        ScrollTrigger.create({ trigger, start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && setBlob({ ...place(b), ...extra }) });
      beat(".b-hero", "hero", { morph: 0, tint: TINTS.pearl });
      beat(".b-old", "old", { morph: 0, tint: TINTS.none });
      beat(".b-map", "bento", { morph: 0, tint: TINTS.found });
      beat(".b-bento", "bento", { morph: 0, tint: TINTS.pearl });
      beat(".b-pharm", "bento", { morph: 2, tint: TINTS.found });
      beat(".b-close", "close", { morph: 0, tint: TINTS.pearl });
      ScrollTrigger.refresh();
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* 1 · Hook: blob above, question and search below */}
      <section className="b-hero mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-end px-6 pt-[40svh] pb-28 text-center lg:pt-[36svh]">
        <div className="h-fade">
          <Kicker>8 pharmacies in Alger, updated live</Kicker>
        </div>
        <h1 className="display mt-5 text-[clamp(2.8rem,6vw,5.4rem)]">
          {"Who has your medicine tonight?".split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span className="h-word inline-block">{w}&nbsp;</span>
            </span>
          ))}
        </h1>
        <p className="h-fade mt-5 max-w-xl text-[18px] leading-relaxed text-(--l-muted)">Type it once. dwa checks the shelves of every pharmacy nearby and tells you where to go.</p>
        <div className="h-fade mt-8 w-full max-w-2xl">
          <MedicineSearch />
        </div>
        <div className="h-fade mt-4 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => (
            <Link key={c} href={`/v8/search?q=${c}`} className="pill bg-white/80 text-(--l-ink) shadow-[0_0_0_1px_var(--l-line)] hover:bg-white">
              {c}
            </Link>
          ))}
        </div>
        <ul className="mt-12 grid w-full grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Live example: Ventoline right now">
          {live.map((a) => (
            <li key={a.pharmacy.id} className="h-tile card flex items-center justify-between gap-3 p-4 text-start">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{a.pharmacy.name.replace("Pharmacie ", "")}</span>
                <span className="text-[13px] text-(--l-faint) nums">
                  Ventoline · {fmtKm(a.km)}
                </span>
              </span>
              <StockChip status={a.status} qty={a.item?.qty} />
            </li>
          ))}
        </ul>
      </section>

      {/* 2 · The old way, as a stack of refusals */}
      <section className="b-old">
        <div className="b-old-pin mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
          <div className="lg:ps-[8%]">
            <p className="text-[14px] font-semibold text-(--l-out)">Without dwa</p>
            <h2 className="display mt-3 text-[clamp(2.8rem,5.6vw,4.8rem)]">
              Five counters, <span className="o-clock nums">47</span> minutes.
            </h2>
            <p className="mt-4 max-w-md text-[18px] text-(--l-muted)">You ask, they shake their head, you take another taxi. The answer was in Kouba the whole time.</p>
            <p className="o-after mt-8 inline-flex items-center gap-2 rounded-full bg-(--l-in-soft) px-4 py-2 font-semibold text-(--l-in)">
              <Check className="size-4" aria-hidden /> With dwa: one search, one trip.
            </p>
          </div>
          <div className="relative mx-auto h-[420px] w-full max-w-sm">
            {OLD_WAY.map((n, i) => (
              <div key={n} className="o-card card card-solid absolute inset-x-0 flex items-center gap-4 p-5" style={{ top: i * 62, zIndex: i }}>
                <span className="grid size-11 place-items-center rounded-2xl bg-(--l-out-soft) text-(--l-out)">
                  <X className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">Pharmacie {n}</span>
                  <span className="text-[14px] text-(--l-muted)">&quot;No Ventoline, sorry.&quot;</span>
                </span>
                <span className="ms-auto text-[13px] text-(--l-faint) nums">+{9 + i * 3} min</span>
              </div>
            ))}
            <div className="o-card card card-solid absolute inset-x-0 flex items-center gap-4 p-5 shadow-[0_0_0_2px_var(--l-in),var(--l-shadow-lg)]!" style={{ top: 4 * 62 + 8, zIndex: 9 }}>
              <span className="grid size-11 place-items-center rounded-2xl bg-(--l-in-soft) text-(--l-in)">
                <Check className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Pharmacie Garidi</span>
                <span className="text-[14px] text-(--l-in)">3 on the shelf</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · How it works: pinned, the blob changes shape for each step */}
      <section className="b-how">
        <div className="b-how-pin mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-6 py-24 lg:grid-cols-2">
          <div>
            <p className="text-[14px] font-semibold text-(--l-lilac)">How it works</p>
            <h2 className="display mt-3 text-[clamp(2.8rem,5.6vw,4.8rem)]">Three steps, then you go.</h2>
            <ol className="mt-10 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="how-step card group flex gap-5 p-5 opacity-55 transition-[opacity,transform] duration-300 data-[on]:translate-x-2 data-[on]:opacity-100 max-lg:opacity-100" data-on={i === 0 ? "" : undefined}>
                  <span className="mono grid size-10 shrink-0 place-items-center rounded-full bg-(--l-sunk) text-[13px] font-semibold group-data-[on]:bg-(--l-ink) group-data-[on]:text-white">{i + 1}</span>
                  <span>
                    <span className="block text-[19px] font-semibold">{s.title}</span>
                    <span className="mt-1 block text-(--l-muted)">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative hidden h-full min-h-[420px] lg:block" aria-hidden>
            <span className="card absolute start-0 top-[12%] flex items-center gap-2 px-4 py-3 text-[14px]">
              <Search className="size-4 text-(--l-faint)" /> Lantus
            </span>
            <span className="card absolute end-0 top-[46%] flex items-center gap-2 px-4 py-3 text-[14px]">
              <StockChip status="in" qty={24} /> Des Pins
            </span>
            <span className="card absolute start-[10%] bottom-[10%] flex items-center gap-2 px-4 py-3 text-[14px]">
              <PackageCheck className="size-4 text-(--l-in)" /> <span className="mono font-semibold">DWA-K7Q3</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4 · The map: every pharmacy, coloured by whether it is open right now */}
      <section className="b-map mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6" data-rise>
          <div>
            <p className="text-[14px] font-semibold text-(--l-lilac)">Around you</p>
            <h2 className="display mt-3 max-w-2xl text-[clamp(2.6rem,5vw,4.4rem)]">Who is open, right now.</h2>
          </div>
          <p className="max-w-sm text-(--l-muted)">Every pharmacy in Alger on one map, coloured by its hours in Algiers time. Pick one to see its shelf.</p>
        </div>
        <div data-rise>
          <OpenMap className="mt-10" />
        </div>
      </section>

      {/* 5 · Live bento: real data in every tile */}
      <section className="b-bento mx-auto max-w-6xl px-6 py-24">
        <h2 className="display max-w-3xl text-[clamp(2.6rem,5vw,4.4rem)]" data-rise>
          Everything around the trip, too.
        </h2>
        <div className="bento mt-12 grid gap-4 md:grid-cols-6">
          <Link href="/v8/tonight" className="card tile-lilac hover-rise p-6 md:col-span-3 md:row-span-2">
            <p className="flex items-center gap-2 font-semibold">
              <Moon className="size-5 text-(--l-lilac)" aria-hidden /> On duty tonight
            </p>
            <p className="mt-1 text-(--l-muted)">Pharmacies de garde stay open until morning.</p>
            <ul className="mt-6 space-y-2">
              {tonight.map(({ p, km }) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_0_0_1px_var(--l-line)]">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="text-[13px] text-(--l-faint) nums">
                      {p.commune} · {fmtKm(km)}
                    </span>
                  </span>
                  <OpenPill p={p} />
                </li>
              ))}
            </ul>
          </Link>
          <Link href="/v8/me#treatments" className="card hover-rise flex items-center gap-5 p-6 md:col-span-3">
            <svg viewBox="0 0 64 64" className="size-20 shrink-0 -rotate-90" aria-hidden>
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--l-sunk)" strokeWidth="8" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--l-low)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(4 / 30) * 163} 163`} />
            </svg>
            <span>
              <span className="block font-semibold">Refill reminders</span>
              <span className="mt-1 block text-(--l-muted)">Glucophage: 4 days left. dwa tells you 5 days before you run out, with the nearest pharmacy that has it.</span>
            </span>
          </Link>
          <Link href="/v8/search?q=Smecta" className="card tile-mint hover-rise p-6 md:col-span-3">
            <BellRing className="size-6 text-(--l-in)" aria-hidden />
            <p className="mt-4 font-semibold">Back-in-stock texts</p>
            <p className="mt-1 text-[14.5px] text-(--l-muted)">Nobody has it? Leave your number and get a text the moment a shelf is refilled.</p>
          </Link>
          <Link href="/v8/pharmacy/kouba-garidi" className="card hover-rise p-6 md:col-span-3">
            <Camera className="size-6 text-(--l-lilac)" aria-hidden />
            <p className="mt-4 font-semibold">Send the prescription</p>
            <p className="mt-1 text-[14.5px] text-(--l-muted)">A photo of a long prescription; the pharmacist answers with what they have and the total.</p>
          </Link>
          <div className="card tile-peach p-6 md:col-span-3">
            <CreditCard className="size-6 text-(--l-lilac)" aria-hidden />
            <p className="display mt-4 text-[52px] leading-none nums">
              {chifa}
              <span className="text-[24px] text-(--l-faint)"> of {pharmacies.length}</span>
            </p>
            <p className="mt-2 text-[14.5px] text-(--l-muted)">pharmacies take the CHIFA card, so covered medicines cost nothing up front.</p>
          </div>
        </div>
      </section>

      {/* 6 · Pharmacist strip */}
      <section className="b-pharm mx-auto max-w-6xl px-6 py-24">
        <div className="band-indigo grid items-center gap-10 overflow-hidden rounded-[32px] p-8 sm:p-12 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div data-rise>
            <p className="text-[14px] font-semibold text-(--l-mint)">For pharmacists</p>
            <h2 className="display mt-3 text-[clamp(2.4rem,4.6vw,3.8rem)]">Scan a box. Alger sees it.</h2>
            <p className="mt-4 max-w-md text-[17px] text-(--l-muted)">Update stock with the barcode scanner you already have. Reservations and prescription photos land in one inbox.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/v8/dashboard" className="btn btn-light">
                Open the dashboard <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/v8/pro" className="btn btn-glass">
                dwa Pro
              </Link>
            </div>
          </div>
          <div className="relative rounded-[24px] bg-white/8 p-5 text-(--l-ink) shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]" aria-label="Dashboard preview">
            <div className="ph-toast card card-solid absolute -top-5 end-5 flex items-center gap-3 px-4 py-3 text-[14px]">
              <BellRing className="size-4 text-(--l-lilac)" aria-hidden /> New reservation · 1 × Ventoline
            </div>
            {[
              ["Doliprane 1000 mg", "62", "in"],
              ["Ventoline 100 µg", "3", "low"],
              ["Lantus 100 U/ml", "0", "out"],
            ].map(([n, q, s], i) => (
              <div key={n} className={`flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_0_0_1px_var(--l-line)] ${i ? "mt-2" : "mt-6"}`}>
                <span className="font-medium">{n}</span>
                <span className="relative h-7 w-10 overflow-hidden text-end">
                  {i === 1 ? (
                    <>
                      <span className="ph-a display absolute inset-0 text-[22px] text-(--l-low)">3</span>
                      <span className="ph-b display absolute inset-0 text-[22px] text-(--l-low)">2</span>
                    </>
                  ) : (
                    <span className="display text-[22px]" style={{ color: `var(--l-${s})` }}>
                      {q}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · Close */}
      <section className="b-close mx-auto max-w-3xl px-6 pt-[40svh] pb-16 text-center">
        <h2 className="display text-[clamp(2.8rem,6.6vw,5.6rem)]" data-rise>
          Type it. We check all eight.
        </h2>
        <div className="mx-auto mt-10 max-w-2xl" data-rise>
          <MedicineSearch />
        </div>
      </section>
    </div>
  );
}
