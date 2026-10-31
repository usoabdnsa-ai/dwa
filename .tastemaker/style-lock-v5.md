# Style lock: dwa v5 "Sleek dark product" (route /v5, code in src/v5 + src/app/v5)

Third pass. Rejected before it: "Zellige" (touristic) and its toned-down ivory/blue pass ("looks old").
User picked this direction: Linear / Vercel style dark product.

## Direction
Thesis: the product is the hero. A real app window runs a Ventoline search and resolves shelf by shelf.
Mood: premium/technical, dark only, one accent.

## Color contract (tokens on .v5 in src/v5/v5.css)
bg 09090B · surface 0F0F12 · surface-2 18181B · line white/8% · line-2 white/14% · ink FAFAFA · soft D4D4D8 · muted A1A1AA
dim 71717A (ornament only, 4.1 on bg) · green 4ADE80 (text) · green-solid 22C55E (buttons, bg text on it) · amber FBBF24 · red F87171
Text-safe: ink/bg 19.1 · muted/bg 7.8 · muted/surface-2 6.9 · green/bg 11.4 · green/surface-2 10.2 · amber/surface-2 10.6
           red/surface-2 6.4 · bg/green-solid 8.7 · soft/surface-2 12.0

## Type
Geist (600 display, -0.045em) + Geist Mono for numbers, km, phone, kbd.

## Shape
Cards: near-black plate, hairline border, faint top highlight, radius 16. Buttons radius 8 to 12. Static grid + green glows (gradients, not filters).

## Motion (GSAP + ScrollTrigger + useGSAP, behind prefers-reduced-motion: no-preference)
Intro (once per tab, ~1.4 s, skippable): plus traces in a green line, fills, tile pops, letters rise, overlay fades.
Hero: badge, lines, sub, then the window rises; window tilts from rotateX 24 to 0 on scroll; demo resolves rows when in view; Replay.
Bento: cards rise, gauges fill, numbers count; cursor spotlight per card (CSS vars).
How it works: CSS-sticky screen crossfades as each step crosses mid-screen (ScrollTrigger toggles, no scrub).
Close: stats count up, CTA rises. Ctrl/Cmd+K focuses the hero search.
Perf (4x CPU throttle, dev): ~47 fps intro, ~55 fps scroll, no long frames.

## Assets
Icons: lucide-react. Mark, map, window: code-native. No illustration, no photography.
