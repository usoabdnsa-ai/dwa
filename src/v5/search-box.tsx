"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { searchMedicines } from "@/lib/finder";

/* Command-style search: dark field, live suggestions, Ctrl/Cmd+K focuses it from anywhere. */
export function SearchBox({ defaultValue = "", size = "lg", hotkey = false }: { defaultValue?: string; size?: "lg" | "md"; hotkey?: boolean }) {
  const router = useRouter();
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const hits = useMemo(() => searchMedicines(value).slice(0, 6), [value]);
  const showList = open && value.trim() !== "" && hits.length > 0 && value.trim() !== defaultValue;

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  const go = (q: string) => {
    setOpen(false);
    router.push(`/v5/search?q=${encodeURIComponent(q.trim())}`);
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
        className={`flex items-center gap-3 rounded-xl border border-(--ln-line-2) bg-(--ln-surface-2) pr-1.5 shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_20px_50px_-20px_rgb(34_197_94/0.25)] transition-[border-color,box-shadow] duration-200 focus-within:border-(--ln-green)/60 focus-within:shadow-[0_0_0_4px_rgb(74_222_128/0.12)] ${big ? "py-1.5 pl-4" : "py-1 pl-3.5"}`}
      >
        <Search className="size-4 shrink-0 text-(--ln-muted)" aria-hidden="true" />
        <span className="sr-only">Medicine name or active ingredient</span>
        <input
          ref={input}
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
          placeholder="Search a medicine or molecule…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={cursor >= 0 ? `${listId}-${cursor}` : undefined}
          className={`min-w-0 flex-1 bg-transparent text-(--ln-ink) placeholder:text-(--ln-muted) focus:outline-none ${big ? "py-2 text-base" : "py-1.5 text-sm"}`}
        />
        {hotkey && <kbd className="v5-kbd hidden sm:inline">Ctrl K</kbd>}
        <button
          type="submit"
          className={`v5-press flex shrink-0 items-center gap-1.5 rounded-lg bg-(--ln-green-solid) font-medium text-(--ln-bg) hover:bg-(--ln-green) ${big ? "h-10 px-4 text-sm" : "h-8 px-3 text-sm"}`}
        >
          <span className={big ? "hidden sm:inline" : "sr-only"}>Check stock</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </label>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-2 origin-top overflow-hidden rounded-xl border border-(--ln-line-2) bg-(--ln-surface-2) p-1 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.6)] motion-safe:animate-[v5-drop_160ms_var(--ln-ease)]"
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
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm ${i === cursor ? "bg-white/[0.06]" : ""}`}
            >
              <span>
                <span className="font-medium">{m.name}</span> <span className="text-(--ln-muted)">{m.dosage} · {m.dci}</span>
              </span>
              <span className="text-xs text-(--ln-muted)">{m.form}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
