// Kept out of the "use client" intro module so the server layout can inline it.
export const INTRO_STORAGE_KEY = "dwa-intro-seen";

// Inlined in <head> so it runs before first paint: a returning visitor (or
// one who prefers reduced motion) never sees the overlay flash.
export const introBootScript = `try{if(sessionStorage.getItem("${INTRO_STORAGE_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="skip"}catch(e){document.documentElement.dataset.intro="skip"}`;
