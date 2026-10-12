"use client";

import { useSyncExternalStore } from "react";

/*
 * Current time, refreshed every 30 s. Returns null during server render and
 * hydration so "open now" badges never mismatch between server and client.
 */
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function useNow(): Date | null {
  const t = useSyncExternalStore(subscribe, () => now, () => 0);
  return t ? new Date(t) : null;
}
