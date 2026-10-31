"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { searchMedicines } from "@/lib/finder";
import { Pill } from "./ui";

/* A big capsule-shaped search field with live suggestions. */
export function SearchBox({ defaultValue = "", size = "lg", tone = "light" }: { defaultValue?: string; size?: "lg" | "md"; tone?: "light" | "dark" }) {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const hits = useMemo(() => searchMedicines(value).slice(0, 6), [value]);
  const showList = open && value.trim() !== "" && hits.length > 0 && value.trim() !== defaultValue;

  const go = (q: string) => {
    setOpen(false);
    router.push(`/v3/search?q=${encodeURIComponent(q.trim())}`);
  };

  const big = size === "lg";
  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        const pick = showList && cursor >= 0 ? hits[cursor].name : value;
        if (pick.trim()) go(pick);
      }}
    >
      <label
        className={`v3-sticker flex items-center gap-3 rounded-full bg-white pr-2 transition-shadow focus-within:shadow-[0_6px_0_0_var(--pp-ink)] ${big ? "py-2 pl-5" : "py-1.5 pl-4"} ${tone === "dark" ? "border-(--pp-mint)! shadow-[0_4px_0_0_var(--pp-tang)]!" : ""}`}
      >
        <Pill kind="capsule" className={`shrink-0 -rotate-12 ${big ? "w-11" : "w-9"}`} />
        <span className="sr-only">Medicine name or active ingredient</span>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setCursor(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!showList) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCursor((c) => (c + 1) % hits.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor((c) => (c <= 0 ? hits.length - 1 : c - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Doliprane, Ventoline, insulin…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={cursor >= 0 ? `${listId}-${cursor}` : undefined}
          className={`min-w-0 flex-1 bg-transparent font-semibold text-(--pp-ink) placeholder:font-medium placeholder:text-(--pp-muted) focus:outline-none ${big ? "py-2 text-lg sm:text-xl" : "py-1.5 text-base"}`}
        />
        <button
          type="submit"
          className={`v3-press flex shrink-0 items-center gap-2 rounded-full bg-(--pp-tang) font-bold text-(--pp-ink) ring-2 ring-(--pp-ink) ${big ? "h-12 px-5 sm:h-14 sm:px-7" : "h-10 px-4"}`}
        >
          <span className={big ? "hidden sm:inline" : "sr-only"}>Check shelves</span>
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      </label>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="v3-sticker absolute inset-x-0 top-full z-40 mt-3 origin-top overflow-hidden rounded-3xl bg-white text-(--pp-ink) motion-safe:animate-[v3-drop_180ms_var(--pp-ease)]"
        >
          {hits.map((m, i) => (
            <li
              key={m.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === cursor}
              onMouseDown={(e) => {
                e.preventDefault();
                go(m.name);
              }}
              onMouseEnter={() => setCursor(i)}
              className={`flex cursor-pointer items-center justify-between gap-4 px-5 py-3 ${i === cursor ? "bg-(--pp-lemon)" : ""}`}
            >
              <span>
                <span className="font-bold">{m.name}</span> <span className="text-sm text-(--pp-muted)">{m.dosage} · {m.dci}</span>
              </span>
              <span className="rounded-full bg-(--pp-mint) px-2.5 py-0.5 text-xs font-semibold">{m.form}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
