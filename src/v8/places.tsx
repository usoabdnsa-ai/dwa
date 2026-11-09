"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Camera, Check, Clock, CreditCard, ImageUp, MapPin, Navigation, Phone, Search, Star } from "lucide-react";
import { getPharmacy, pharmacies } from "@/lib/data";
import { extrasOf, waitNow } from "@/lib/extras";
import { algiersMinutes, DEFAULT_ORIGIN, distanceKm, fmtKm, fmtPrice, fmtUpdated, hoursLabel, isOpen, statusOf, stockOf } from "@/lib/finder";
import { sendPrescription, validPhone } from "@/lib/reservations";
import { useNow } from "@/lib/use-now";
import { OpenMap } from "./map";
import { OpenPill, Pill, STATUS, Title, useCornerBlob } from "./ui";

/* ---------- tonight: a 24-hour timeline per pharmacy ---------- */

export function TonightView() {
  useCornerBlob("pearl");
  const now = useNow();
  const mins = now ? algiersMinutes(now) : null;
  const list = pharmacies
    .map((p) => ({ p, km: distanceKm(DEFAULT_ORIGIN, p), open: mins === null ? null : isOpen(p, mins) }))
    .sort((a, b) => Number(b.open) - Number(a.open) || Number(b.p.onDuty) - Number(a.p.onDuty) || a.km - b.km);
  const openCount = list.filter((x) => x.open).length;
  const pct = (m: number) => `${(m / 1440) * 100}%`;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-12">
      <Title kicker={mins === null ? "Checking hours…" : `${openCount} open right now`} sub="Pharmacies de garde stay open through the night. Bars show each day's opening hours; the line is now, Algiers time.">
        Who is open tonight
      </Title>
      <OpenMap className="mt-10" />
      <h2 className="display mt-14 text-[32px]">Today&apos;s hours</h2>
      <div className="card mt-5 p-3 sm:p-5">
        <div className="relative ms-[clamp(9rem,30%,18rem)] hidden h-6 text-[12px] text-(--l-faint) sm:block" aria-hidden>
          {[0, 6, 12, 18, 24].map((h) => (
            <span key={h} className="absolute -translate-x-1/2 nums" style={{ left: pct(h * 60) }}>
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        <ul>
          {list.map(({ p, km, open }, i) => (
            <li key={p.id} className="in" style={{ animationDelay: `${i * 45}ms` }}>
              <Link href={`/v8/pharmacy/${p.id}`} className={`grid items-center gap-x-4 gap-y-2 rounded-[20px] px-3 py-3.5 hover:bg-white sm:grid-cols-[clamp(9rem,30%,18rem)_minmax(0,1fr)] ${open === false ? "opacity-60" : ""}`}>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{p.name}</span>
                  <span className="text-[13px] text-(--l-faint) nums">
                    {p.commune} · {fmtKm(km)}
                  </span>
                </span>
                <span className="relative h-9 rounded-full bg-(--l-sunk)" role="img" aria-label={p.onDuty ? "On duty, open all night" : hoursLabel(p)}>
                  {p.onDuty ? (
                    <span className="absolute inset-y-1 inset-x-1 rounded-full bg-(--l-lilac-soft) shadow-[inset_0_0_0_1px_rgb(91_72_217/0.25)]" />
                  ) : (
                    <span className="absolute inset-y-1 rounded-full bg-(--l-in-soft) shadow-[inset_0_0_0_1px_rgb(11_122_85/0.2)]" style={{ left: pct(p.opens), width: `calc(${pct(p.closes - p.opens)})` }} />
                  )}
                  <span className="absolute inset-y-0 start-3 flex items-center text-[12.5px] font-medium" style={{ color: p.onDuty ? "var(--l-lilac)" : "var(--l-in)", left: p.onDuty ? undefined : `calc(${pct(p.opens)} + 10px)` }}>
                    {p.onDuty ? "On duty, all night" : hoursLabel(p)}
                  </span>
                  {mins !== null && <span className="absolute -inset-y-1 w-0.5 rounded bg-(--l-ink)" style={{ left: pct(mins) }} />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- pharmacy ---------- */

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

export function PharmacyView({ id }: { id: string }) {
  useCornerBlob("pearl");
  const p = getPharmacy(id)!;
  const x = extrasOf(p.id);
  const now = useNow();
  const [q, setQ] = useState("");
  const shelf = stockOf(p.id)
    .filter((l) => !q || (l.medicine.name + l.medicine.dci).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.qty > 0) - Number(a.qty > 0) || a.medicine.name.localeCompare(b.medicine.name));
  const maps = `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=17/${p.lat}/${p.lng}`;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-12">
      <section className="card card-solid in p-7 sm:p-10">
        <div className="flex flex-wrap items-start gap-6">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[14px] text-(--l-muted)">
              <MapPin className="size-4" aria-hidden /> {p.address}, {p.commune}
            </p>
            <h1 className="display mt-3 text-[clamp(2.8rem,6vw,4.8rem)]">{p.name}</h1>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <OpenPill p={p} />
              {x.chifa && (
                <Pill tone="in">
                  <CreditCard className="size-3.5" aria-hidden /> CHIFA card
                </Pill>
              )}
              <Pill>{p.pharmacist}</Pill>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="btn btn-soft btn-sm">
              <Phone className="size-4" aria-hidden /> Call
            </a>
            <a href={maps} target="_blank" rel="noreferrer" className="btn btn-ink btn-sm">
              <Navigation className="size-4" aria-hidden /> Directions
            </a>
          </div>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Distance", fmtKm(distanceKm(DEFAULT_ORIGIN, p)), MapPin],
            ["Wait now", now ? `~${waitNow(p.id, algiersMinutes(now))} min` : "…", Clock],
            ["Rating", `${x.rating.toFixed(1)} · ${x.reviews}`, Star],
            ["Hours", p.onDuty ? "All night" : hoursLabel(p), Clock],
          ].map(([k, v, I]) => {
            const Icon = I as typeof Clock;
            return (
              <div key={k as string} className="rounded-[20px] bg-(--l-bg) p-4">
                <dt className="flex items-center gap-1.5 text-[13px] text-(--l-faint)">
                  <Icon className="size-3.5" aria-hidden /> {k as string}
                </dt>
                <dd className="mt-1 text-[18px] font-semibold nums">{v as string}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap items-end gap-4">
        <h2 className="display text-[36px]">On the shelf</h2>
        <label className="relative ms-auto w-full sm:w-72">
          <span className="sr-only">Filter this pharmacy&apos;s stock</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-(--l-faint)" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter medicines" className="input h-12 ps-11" />
        </label>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shelf.map((l, i) => {
          const s = statusOf(l.qty);
          return (
            <li key={l.medicineId} className="in" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
              <div className={`card flex h-full flex-col p-5 ${l.qty === 0 ? "opacity-70" : ""}`}>
                <p className="font-semibold">{l.medicine.name}</p>
                <p className="text-[13px] text-(--l-faint)">
                  {l.medicine.dosage} · {fmtPrice(l.medicine.priceDzd)}
                </p>
                <p className="display mt-4 text-[40px] leading-none nums" style={{ color: STATUS[s].fg }}>
                  {l.qty}
                </p>
                <p className="mt-1 text-[12.5px] text-(--l-faint)">checked {fmtUpdated(l.updatedMinsAgo)}</p>
                <div className="mt-auto pt-4">
                  {l.qty > 0 ? (
                    <Link href={`/v8/reserve?ph=${p.id}&med=${l.medicineId}`} className="btn btn-soft btn-sm w-full">
                      Reserve
                    </Link>
                  ) : (
                    <Link href={`/v8/search?q=${encodeURIComponent(l.medicine.name)}`} className="btn btn-soft btn-sm w-full text-(--l-muted)">
                      Find elsewhere
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {shelf.length === 0 && <li className="card p-8 text-center text-(--l-muted) sm:col-span-2 lg:col-span-4">No medicine matches “{q}” here.</li>}
      </ul>

      <PrescriptionUpload pharmacyId={p.id} name={p.name} />
    </div>
  );
}

function PrescriptionUpload({ pharmacyId, name }: { pharmacyId: string; name: string }) {
  const [image, setImage] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  return (
    <section className="card card-solid mt-12 grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" aria-labelledby="rx-title" aria-live="polite">
      <div>
        <h2 id="rx-title" className="display flex items-center gap-3 text-[34px]">
          <Camera className="size-7 text-(--l-lilac)" aria-hidden /> Send a prescription
        </h2>
        <p className="mt-3 max-w-md text-(--l-muted)">Several medicines? Send a photo. {name} answers with what is in stock and the total, in My dwa.</p>
        {sent && (
          <p className="pop mt-6 inline-flex items-center gap-2 rounded-full bg-(--l-in-soft) px-4 py-2 font-semibold text-(--l-in)">
            <Check className="size-4" aria-hidden /> Sent. <Link href="/v8/me#prescriptions" className="underline underline-offset-4">Open My dwa</Link>
          </p>
        )}
      </div>
      {!sent && (
        <form
          className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!image) return setErr("Add a photo of the prescription.");
            if (!validPhone(phone)) return setErr("Enter an Algerian mobile number, like 0550 12 34 56.");
            if (!sendPrescription({ pharmacyId, image, phone, note })) return setErr("This browser's storage is full. Remove an older prescription in My dwa.");
            setSent(true);
          }}
        >
          <button type="button" onClick={() => file.current?.click()} className="flex aspect-[3/4] flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-(--l-bg) text-(--l-muted) shadow-[inset_0_0_0_1px_var(--l-line-2)] hover:bg-(--l-sunk) sm:row-span-3">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview
              <img src={image} alt="Your prescription photo" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImageUp className="size-7" aria-hidden />
                <span className="text-[13px]">Add photo</span>
              </>
            )}
          </button>
          <input
            ref={file}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            aria-label="Prescription photo"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                setImage(await downscale(f));
                setErr(null);
              }
            }}
          />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Your mobile, 0550 12 34 56" aria-label="Your mobile" className="input" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional): generic is fine" aria-label="Note" className="input" />
          <div>
            {err && (
              <p role="alert" className="mb-3 text-[14px] text-(--l-out)">
                {err}
              </p>
            )}
            <button className="btn btn-ink w-full">Send to the pharmacist</button>
          </div>
        </form>
      )}
    </section>
  );
}
