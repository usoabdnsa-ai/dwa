"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, CornerDownLeft, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { pharmacies } from "@/lib/data";
import { searchMedicines } from "@/lib/finder";
import { useT } from "@/lib/locale";

type Row = { key: string; label: string; meta: string; href: string; kind: "medicine" | "pharmacy" };

/** The search field in the night pill nav: opens a keyboard-driven spotlight over medicines and pharmacies. */
export function CommandSearch() {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping(e.target))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rows = useMemo<Row[]>(() => {
    const meds = (q ? searchMedicines(q) : searchMedicines("a").slice(0, 4)).slice(0, 6).map((m) => ({
      key: m.id,
      label: `${m.name} ${m.dosage}`,
      meta: m.dci,
      href: `/search?q=${encodeURIComponent(m.name)}`,
      kind: "medicine" as const,
    }));
    const needle = q.toLowerCase();
    const shops = q
      ? pharmacies
          .filter((p) => (p.name + p.commune).toLowerCase().includes(needle))
          .slice(0, 3)
          .map((p) => ({ key: p.id, label: p.name, meta: p.commune, href: `/pharmacy/${p.id}`, kind: "pharmacy" as const }))
      : [];
    return [...meds, ...shops];
  }, [q]);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={t("cmd.triggerLabel")}
        className="group flex h-9 items-center gap-2 rounded-full px-3 text-sm text-dusk-muted ring-1 ring-white/10 transition-colors duration-150 hover:text-dusk-ink hover:ring-white/25 md:w-64"
      >
        <Search className="size-4" aria-hidden />
        <span className="hidden flex-1 truncate text-start whitespace-nowrap md:block">{t("cmd.trigger")}</span>
        <kbd className="hidden rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] md:inline">Ctrl K</kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="cmd-overlay fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]" />
        <Dialog.Content className="cmd-panel surface fixed top-[12vh] left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-card">
          <Dialog.Title className="sr-only">{t("cmd.title")}</Dialog.Title>
          <Dialog.Description className="sr-only">{t("cmd.desc")}</Dialog.Description>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const row = rows[active];
              if (row) go(row.href);
              else if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
            className="flex items-center gap-3 border-b border-line px-4"
          >
            <Search className="size-4 text-muted" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, rows.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                }
              }}
              placeholder={t("cmd.placeholder")}
              aria-label={t("cmd.title")}
              autoComplete="off"
              spellCheck={false}
              className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            />
          </form>
          <ul role="listbox" aria-label={t("cmd.results")} className="max-h-[50vh] overflow-y-auto p-2">
            {!q && <li className="px-3 pt-1 pb-2 text-xs font-medium text-muted">{t("cmd.often")}</li>}
            {rows.map((r, i) => (
              <li key={r.kind + r.key} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.href)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start ${i === active ? "bg-green-soft" : ""}`}
                >
                  {r.kind === "pharmacy" ? (
                    <Store className="size-4 text-muted" aria-hidden />
                  ) : (
                    <span className="grid size-4 place-items-center" aria-hidden>
                      <span className="h-1.5 w-3 rounded-full bg-green" />
                    </span>
                  )}
                  <span className="flex-1 truncate font-medium">{r.label}</span>
                  <span className="truncate text-sm text-muted">{r.meta}</span>
                  {i === active && <CornerDownLeft className="size-3.5 text-green" aria-hidden />}
                </button>
              </li>
            ))}
            {q && rows.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted">
                Nothing matches “{q}”. Press Enter to search anyway.
              </li>
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function isTyping(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}
