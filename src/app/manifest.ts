import type { MetadataRoute } from "next";

/* Makes dwa installable: "Add to home screen" on Android, "Install app" on desktop Chrome and Edge. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "dwa · find your medicine in stock",
    short_name: "dwa",
    description: "See which pharmacies near you have your medicine on the shelf, and reserve it.",
    start_url: "/search",
    scope: "/",
    display: "standalone",
    background_color: "#061519",
    theme_color: "#061519",
    lang: "fr-DZ",
    categories: ["health", "medical"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "On duty tonight", url: "/search?garde=1" },
      { name: "My dwa", url: "/me" },
    ],
  };
}
