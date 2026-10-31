# Style lock: dwa (pharmacy-finder) · v2 "live city map"

v1 (paper + Bricolage + neon LED intro) is preserved at git tag `v1`. v2 = git tag `v2`.

## Home (kept 2026-10-13): live city map, night mode
Thesis: the map is the product. The home is one sticky 3D night map of Alger; scrolling flies the camera through 7 beats (hook, oldway, newrule, mechanism, night, pharmacist, action), defined as data in src/components/map-story/story.ts.
Structure: poster fold + sticky-stack scroll story (F3), floating pill nav (N3), one-line dark footer (Ft2). Route group src/app/(home).
Map: MapLibre GL 5 + OpenFreeMap tiles, custom night style (map-style.ts), 3D buildings. Pins are HTML: mint = has it, amber = selected/low, coral cross = out.
Dusk tokens: dusk 061519 · dusk-2 0E262C · dusk-ink E8F3F1 · dusk-muted 8DB0B3 · dusk-mint 7AE8C8 · dusk-amber F2B35B · dusk-coral FF8A7A
Text-safe on dusk / dusk-2: ink 16.4/13.9 · muted 7.97/6.75 · mint 12.6/10.7 · amber 10.1/8.54 · coral 8.12/6.88
Camera rules: the desktop overview keeps all 8 pins right of the 560px text column (hook start: center 3.071,36.748 z11.3). On narrow screens, zoom is pulled back by log2(1024/w)*0.6.
Motion: v1 LED-cross intro restyled in dusk (map-story/night-intro.tsx, ~1.9s, once per session, skippable; it dissolves while the sign shrinks like a pin), and its end triggers the map fly-in (top-down to pitched), then ScrollTrigger scrubs the camera with jumpTo; rAF only while scrolling. Reduced motion shows each beat's end state.

## App pages (search, pharmacy, dashboard, login): v2 "clinical", unchanged below

Direction: clean clinical pharmacy. Cool white background, pharmacy teal-green, amber for warnings, a calm deep-teal band (with mint) for the "de garde" rota.
Thesis: the search box is the product, so the page shows a real result instead of describing one.
Mode: light only (no toggle).

## Type
- Display: Plus Jakarta Sans (600/700/800, tight tracking)
- Body: Inter
- Data (qty, prices, km, times, codes): Inter with tabular-nums (`font-mono` maps to the body font + tnum). No code-style monospace.

## Color contract (tokens in src/app/globals.css @theme)
paper F4F8F8 · paper-2 E8F0F0 · surface FFFFFF · ink 0D2A30 · muted 4D666C · line D5E3E4
green 07725E (hover 075F4F) · green-soft DDF2EC · amber B45309 · amber-ink 9A4508 · amber-soft FBEFDC
danger B42318 · danger-soft FBE8E6 · night 0B3A42 (deep teal) · neon 7AE8C8 (mint) · night-muted A6CBD0
Text-safe (checked): ink/paper 14.1 · muted/white 6.12 · muted/paper-2 5.29 · green/paper 5.49 · white/green 5.87
green/green-soft 5.03 · mint/night 8.36 · night-muted/night 7.11 · amber-ink/amber-soft 5.72

## Shape & depth
Radius: card 18px, controls 12px (rounded-xl), pills full. Depth via `surface` utility (hairline ring + soft green-tinted shadow).

## Motion
Intro (GSAP): white screen, cross pops in (back.out), two heartbeat pulses, CSS rings ripple, thin progress line, screen fades up. ~2s, skippable.
Hero: text fades up; illustration pieces pop in, then capsules/tablet/pin float slowly (CSS, 5.5–8s), disc breathes (soft-pulse 4s).
Door-to-door route scrub, [data-reveal] batch (y 16, 0.6s power2.out).
App shell: CSS only (row-in 220ms, qty-bump 400ms tint, toast 200ms). Reduced motion: intro skipped by boot script, global CSS clamp.

## Assets
Icons: lucide-react only. No photography. Illustrations: code-native SVG (hero pharmacy scene, route map).
Logo: geometric cross with a map dot punched through (src/components/logo.tsx). Maps: Leaflet + OSM tiles, CSS-desaturated toward cool tones.
