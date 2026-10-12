# Style lock: dwa (pharmacy-finder)

Direction: warm consumer-health. Paper background, pharmacy-cross green, amber for warnings. The night palette is only for the intro and the "de garde" band.
Thesis: the search box is the product, so the page shows a real result instead of describing one.
Mode: light only (no toggle). Night palette scoped to intro + on-duty band.

## Type
- Display: Bricolage Grotesque (600/700, tight tracking)
- Body: Public Sans
- Data (qty, prices, km, times, codes): JetBrains Mono, tabular-nums. Never for paragraphs.

## Color contract (tokens in src/app/globals.css @theme)
paper F6F4EE · paper-2 EDEAE2 · surface FFFFFF · ink 15201A · muted 5B655E · line DEDBD2
green 0B6B3A (hover 08552E) · green-soft E4F0E7 · amber B45309 · amber-ink 9A4508 · amber-soft FBEFDC
danger B42318 · danger-soft FBE8E6 · night 0E1411 · neon 2BD66B · night-muted 9FB3A7
Text-safe (checked): ink/paper 15.2 · ink/paper-2 13.9 · muted/white 6.06 · green/paper 6.01 · white/green 6.61
green/green-soft 5.64 · amber-ink/amber-soft 5.72 (amber B45309 on amber-soft FAILS 4.42, use amber-ink)
danger/danger-soft 5.57 · white/amber 5.02 · amber/paper 4.57 · neon/night 9.70 · night-muted/night 8.41

## Shape & depth
Radius: card 14px, controls 12px (rounded-xl), pills full. Depth via `surface` utility (hairline ring + 2 soft shadows).

## Motion
GSAP: intro (LED cross + counter + column lift), hero entrance gated on intro, door-to-door route scrub, [data-reveal] batch.
App shell: CSS only (row-in 220ms, qty-bump 400ms tint, toast 200ms). Reduced motion: intro skipped by boot script, global CSS clamp.

## Assets
Icons: lucide-react only. No photography (product is data-first). Illustrations: code-native SVG (LED cross, route map), no unDraw library used.
Logo: geometric cross with a map dot punched through (src/components/logo.tsx). Maps: Leaflet + OSM tiles, CSS-desaturated.
