# Style lock: dwa v4 "Neon Pharmacy Night" (route /v4, code in src/v4 + src/app/v4)

Separate version alongside v3 "Pill Pop". User picked it from Neon Night / Fresh Clinical Gradient / Algerian Zellige.

## Direction
Thesis: the pharmacy cross as a neon sign at 3 a.m. The question the page answers is "who is open right now, and do they have it".
Mood: premium/cinematic, dark only.

## Color contract (tokens on .v4 in src/v4/v4.css)
bg 04120E · bg-2 071A14 · surface 0C231C · line 1F4A3C · ink E9FFF4 · muted 8FB8A8
neon 39FF9C · magenta FF4FD8 (de garde) · amber FFC24B (last few) · red FF6B6B (out)
Text-safe: ink/bg 18.5 · ink/surface 15.9 · muted/bg 8.7 · muted/surface 7.5 · neon/bg 14.6 · neon/surface 12.5
           magenta/bg 6.7 · magenta/surface 5.8 · amber/bg 11.9 · red/bg 6.9 · bg/neon 14.6 (button labels)
Magenta always means de garde. Neon means open or in stock.

## Type
Display: Syne 800. Body: Manrope.

## Shape
Glass panels (5% ink fill, 12% ink border, 14px blur), radius 16 to 24px. Glow via drop-shadow / text-shadow, never as the only state signal.

## Motion (GSAP + ScrollTrigger + useGSAP, behind prefers-reduced-motion: no-preference)
Intro (once per tab, skippable): cold tube draws, neon flickers on, "Open all night" stutters on in magenta, camera flies through the cross.
Hero: cross settles from close up, words rise out of blur; scroll swells the cross, stars parallax by depth.
Night clock: pinned 250% scrub, clock 18:00 to 03:00, each shop flickers off at its real closing time, de garde turn magenta, sky drains.
Feed: live stock updates arrive every 1.8 s while visible (IntersectionObserver), counters roll up.
Cursor: soft green light trails fine pointers. Search: rotating conic light ring.
App pages: cards fade up out of blur 0.35 s / 40 ms stagger, gauges light, count rolls up.

## Assets
Icons: lucide-react. Neon cross, plan, stars: code-native SVG/CSS. No photography.
