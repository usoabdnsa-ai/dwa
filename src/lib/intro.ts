"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared flag for "the opening sequence has finished". The hero waits on it
 * so its entrance plays once the screen has opened, not underneath it.
 * The inline boot script sets data-intro="skip" before first paint when the
 * intro already played this session or motion is reduced.
 */
let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return done || document.documentElement.dataset.intro === "skip";
}

export function useIntroDone() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
