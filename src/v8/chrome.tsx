"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Moon, Search, Store, UserRound } from "lucide-react";
import { useReservations } from "@/lib/reservations";

/* The dwa cross, drawn as a soft pearl tile (same path as components/logo.tsx). */
export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`${className} grid place-items-center rounded-[30%] bg-(--l-ink) shadow-[0_6px_16px_-6px_rgb(18_19_28/0.5)]`} aria-hidden>
      <svg viewBox="0 0 32 32" className="size-[62%]">
        <defs>
          <linearGradient id="v8-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b9f5dc" />
            <stop offset="1" stopColor="#c9c1ff" />
          </linearGradient>
        </defs>
        <path d="M12 3h8a1 1 0 0 1 1 1v7h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7v7a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-7H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h7V4a1 1 0 0 1 1-1Z" fill="url(#v8-mark)" />
        <circle cx="16" cy="16" r="3.4" fill="#12131c" />
      </svg>
    </span>
  );
}

export function TopBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/v8" className="pointer-events-auto flex items-center gap-2.5" aria-label="dwa, home">
          <Mark />
          <span className="display text-[24px]">dwa</span>
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          <Link href="/v8/pro" className="btn btn-soft btn-sm hidden sm:inline-flex">
            dwa Pro
          </Link>
          <Link href="/v8/login" className="btn btn-ink btn-sm">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

const DOCK = [
  { href: "/v8", label: "Home", Icon: House, exact: true },
  { href: "/v8/search", label: "Search", Icon: Search },
  { href: "/v8/tonight", label: "Tonight", Icon: Moon },
  { href: "/v8/me", label: "My dwa", Icon: UserRound },
  { href: "/v8/dashboard", label: "Pharmacy", Icon: Store },
];

/* Floating dock at the bottom on every screen size: the app-like move of v8. */
export function Dock() {
  const path = usePathname();
  const active = useReservations().filter((r) => ["requested", "confirmed", "ready"].includes(r.status)).length;
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-3">
      <ul className="frost flex items-center gap-1 rounded-full p-1.5">
        {DOCK.map((d) => {
          const on = d.exact ? path === d.href : path.startsWith(d.href);
          return (
            <li key={d.href}>
              <Link
                href={d.href}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-12 items-center gap-2 rounded-full px-3.5 text-[14px] font-medium transition-[background-color,color] duration-200 sm:px-4 ${on ? "bg-(--l-ink) text-white" : "text-(--l-muted) hover:text-(--l-ink)"}`}
              >
                <d.Icon className="size-[18px]" aria-hidden />
                <span className={on ? "" : "max-sm:sr-only"}>{d.label}</span>
                {d.href === "/v8/me" && active > 0 && <span className="absolute -top-0.5 end-1 grid size-5 place-items-center rounded-full bg-(--l-lilac) text-[11px] font-bold text-white nums">{active}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 pb-28 text-[13px] text-(--l-faint)">
      <span className="flex items-center gap-2 text-(--l-muted)">
        <Mark className="size-5" /> dwa · Alger
      </span>
      <span>Demo data: pharmacies, stock and prices are placeholders.</span>
      <Link href="/v8/pro" className="ms-auto hover:text-(--l-ink)">
        dwa Pro
      </Link>
      <Link href="/v8/dashboard" className="hover:text-(--l-ink)">
        Pharmacist dashboard
      </Link>
    </footer>
  );
}
