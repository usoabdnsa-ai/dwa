# Style lock: dwa v3 "Pill Pop" (route /v3, code in src/v3 + src/app/v3)

Separate version. Does not replace the v2 lock in style-lock.md.
Replaces the rejected v3 "Le Comptoir" (cream/serif, near-static), rejected 2026-10-13: "ugly, where are the animations, the colors".

## Direction
Thesis: medicine as toy-bright objects. Pills are the visual language (hero cluster, capsule that splits open, gauges shaped like capsules).
Mood: playful/consumer, light only. User picked "Pill Pop" from three options.

## Color contract (tokens on .v3 in src/v3/v3.css)
mint D6F5E6 (bg) · mint-2 C2EFD9 · white FFFFFF · ink 06372A · green 08724A · muted 3E6B5C · line A8DCC4
tangerine FF8A3D · lilac B9A6FF · lemon FFE066 · red C42F2A · amber 9A5300
Text-safe: ink/mint 11.4 · ink/white 13.2 · mint/ink 11.4 · green/white 6.0 · green/mint 5.1 · muted/mint 5.2 · muted/white 6.1
           ink/tangerine 5.6 · ink/lilac 6.3 · ink/lemon 10.1 · red/white 5.6 · amber/white 5.8
Rule: text on tangerine, lilac, lemon is always ink.

## Type
Display: Unbounded 800, tight tracking. Body: Figtree. Numbers: Figtree tabular.

## Shape
Sticker look: 2px ink border + solid 4px ink offset shadow (.v3-sticker). Radius: pills full, cards 1.75 to 2.25rem.

## Motion (GSAP + ScrollTrigger + useGSAP, all behind prefers-reduced-motion: no-preference)
Hero: lines rise from masks, pills rain in with bounce.out, idle bob, pointer parallax by depth (fine pointers), cluster lifts on scroll.
Story: pinned 220% scrub. Capsule straightens, splits, 8 answers burst out on an ellipse, 7 dim, yes card scales.
Steps: tiles drop in with back.out; typing loop; gauges fill; route draws on scrub.
Rota: rows slide from alternating sides; moon scrubs. Plan pins drop in with stagger.
App pages: cards deal in 0.35s / 40ms stagger, gauges fill, count rolls up. Press = translateY on pointer down.
Ambient CSS: marquee (pauses on hover), de garde ring spin, "you" ping.

## Assets
Icons: lucide-react. Pills, mark, plan, route: code-native SVG (no photo/illustration library used).
