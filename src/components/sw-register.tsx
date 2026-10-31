"use client";

import { useEffect } from "react";

/* Registers the offline cache in production only, so it never fights the dev server's hot reload. */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
