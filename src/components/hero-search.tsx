"use client";

import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { searchMedicines } from "@/lib/finder";

const SUGGESTED = ["Doliprane", "Augmentin", "Ventoline", "Glucophage"];

/** The hero's one action: a medicine search with live suggestions. `dark` restyles the chips for the night map. */
export function HeroSearch({ tone = "light" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const matches = useMemo(() => searchMedicines(q).slice(0, 5), [q]);
  const showList = focused && q.length > 0;

  const go = (term: string) => router.push(`/search?q=${encodeURIComponent(term)}`);

  return (
    <div className="w-full max-w-xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const pick = matches[active]?.name ?? q.trim();
          if (pick) go(pick);
        }}
        className="relative"
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Medicine name or active ingredient
        </label>
        <div className="surface flex items-center gap-3 rounded-2xl p-2 pl-5 focus-within:ring-2 focus-within:ring-green">
          <Search className="size-5 shrink-0 text-muted" aria-hidden />
          <input
            id={`${listId}-input`}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(-1);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onKeyDown={(e) => {
              if (!showList) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, matches.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, -1));
              } else if (e.key === "Escape") setFocused(false);
            }}
            role="combobox"
            aria-expanded={showList}
            aria-controls={`${listId}-list`}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder="Medicine or active ingredient…"
            className="h-12 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="flex h-12 items-center gap-2 rounded-xl bg-green px-5 font-medium text-white transition-colors duration-150 hover:bg-green-700"
          >
            <span className="hidden sm:inline">Find it</span>
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        {showList && (
          <ul
            id={`${listId}-list`}
            role="listbox"
            className="surface absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl p-1.5 text-left"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted">No medicine called “{q}” yet. Press Enter to search anyway.</li>
            ) : (
              matches.map((m, i) => (
                <li key={m.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(m.name)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-baseline gap-3 rounded-lg px-3 py-2.5 ${i === active ? "bg-green-soft" : ""}`}
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="font-mono text-xs text-muted">{m.dosage}</span>
                    <span className="ml-auto truncate text-sm text-muted">{m.dci}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </form>

      <p className={`mt-4 flex flex-wrap items-center gap-2 text-sm ${tone === "dark" ? "text-dusk-muted" : "text-muted"}`}>
        <span>Try</span>
        {SUGGESTED.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className={`rounded-full px-3 py-1 ring-1 transition-colors duration-150 ${
              tone === "dark" ? "ring-white/15 hover:bg-white/10 hover:text-dusk-ink" : "ring-line hover:bg-surface hover:text-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </p>
    </div>
  );
}
