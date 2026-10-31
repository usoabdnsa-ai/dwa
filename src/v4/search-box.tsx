"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { searchMedicines } from "@/lib/finder";

/* Glass search field ringed by a slowly turning band of light. */
export function SearchBox({ defaultValue = "", size = "lg" }: { defaultValue?: string; size?: "lg" | "md" }) {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const hits = useMemo(() => searchMedicines(value).slice(0, 6), [value]);
  const showList = open && value.trim() !== "" && hits.length > 0 && value.trim() !== defaultValue;

  const go = (q: string) => {
    setOpen(false);
    router.push(`/v4/search?q=${encodeURIComponent(q.trim())}`);
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
      <label className={`v4-ring flex items-center gap-3 rounded-2xl pr-2 shadow-[0_0_60px_-20px_var(--nn-neon)] ${big ? "py-2 pl-5" : "py-1.5 pl-4"}`}>
        <Search className="size-5 shrink-0 text-(--nn-neon)" aria-hidden="true" />
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
          placeholder="Ventoline, insulin, amoxicillin…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={cursor >= 0 ? `${listId}-${cursor}` : undefined}
          className={`min-w-0 flex-1 bg-transparent font-medium text-(--nn-ink) placeholder:text-(--nn-muted) focus:outline-none ${big ? "py-2.5 text-lg" : "py-1.5 text-base"}`}
        />
        <button
          type="submit"
          className={`v4-press flex shrink-0 items-center gap-2 rounded-xl bg-(--nn-neon) font-semibold text-(--nn-bg) shadow-[0_0_24px_-4px_var(--nn-neon)] ${big ? "h-12 px-5" : "h-10 px-3.5"}`}
        >
          <span className={big ? "hidden sm:inline" : "sr-only"}>Who has it?</span>
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      </label>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="v4-glass absolute inset-x-0 top-full z-40 mt-2 origin-top overflow-hidden rounded-2xl bg-(--nn-bg-2)/90 motion-safe:animate-[v4-drop_180ms_var(--nn-ease)]"
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
              className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-3 ${i === cursor ? "bg-(--nn-neon)/10" : ""}`}
            >
              <span>
                <span className={`font-semibold ${i === cursor ? "text-(--nn-neon)" : ""}`}>{m.name}</span>{" "}
                <span className="text-sm text-(--nn-muted)">
                  {m.dosage} · {m.dci}
                </span>
              </span>
              <span className="text-xs text-(--nn-muted)">{m.form}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
