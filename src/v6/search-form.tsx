"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { searchMedicines } from "@/lib/finder";

/* Large rounded search with live suggestions. */
export function SearchForm({
  defaultValue = "",
  compact = false,
}: {
  defaultValue?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const hits = useMemo(() => searchMedicines(value).slice(0, 6), [value]);
  const show =
    open &&
    value.trim() !== "" &&
    hits.length > 0 &&
    value.trim() !== defaultValue;

  const go = (q: string) => {
    setOpen(false);
    router.push(`/v6/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        const pick = show && cursor >= 0 ? hits[cursor].name : value;
        if (pick.trim()) go(pick);
      }}
    >
      <label
        htmlFor={`${id}-q`}
        className={`flex items-center gap-3 rounded-full border border-(--e-line) bg-white ps-5 pe-1.5 shadow-[0_18px_40px_-24px_rgb(15_76_58/0.45)] transition-[border-color,box-shadow] duration-200 focus-within:border-(--e-green) focus-within:shadow-[0_0_0_4px_rgb(15_76_58/0.12)] ${compact ? "py-1" : "py-1.5"}`}
      >
        <Search
          className="size-5 shrink-0 text-(--e-green)"
          aria-hidden="true"
        />
        <span className="sr-only">Medicine name or active ingredient</span>
        <input
          id={`${id}-q`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setCursor(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!show) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCursor((c) => (c + 1) % hits.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor((c) => (c <= 0 ? hits.length - 1 : c - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          role="combobox"
          aria-expanded={show}
          aria-controls={`${id}-list`}
          aria-activedescendant={
            cursor >= 0 ? `${id}-opt-${cursor}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder="Doliprane, Augmentin, insulin…"
          className={`min-w-0 flex-1 bg-transparent text-(--e-ink) outline-none placeholder:text-(--e-muted) ${compact ? "py-2 text-base" : "py-3 text-lg"}`}
        />
        <button
          type="submit"
          className={`v6-btn v6-btn-cta shrink-0 ${compact ? "h-10 px-4 text-sm" : "h-12 px-6"}`}
        >
          <span className={compact ? "sr-only" : "hidden sm:inline"}>
            Search
          </span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </label>
      {show && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="v6-card absolute inset-x-0 top-full z-30 mt-2 overflow-hidden p-1.5"
        >
          {hits.map((m, i) => (
            <li
              key={m.id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === cursor}
              onMouseDown={(e) => {
                e.preventDefault();
                go(m.name);
              }}
              onMouseEnter={() => setCursor(i)}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 ${i === cursor ? "bg-(--e-sage)" : ""}`}
            >
              <span>
                <span className="font-semibold">{m.name}</span>{" "}
                <span className="text-(--e-muted)">{m.dosage}</span>
              </span>
              <span className="text-sm text-(--e-muted)">{m.dci}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
