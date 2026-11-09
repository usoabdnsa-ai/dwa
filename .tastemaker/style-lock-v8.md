# Style lock: dwa v8 "Liquid light" (whole app, /v8)

Picked by the user 2026-11-04 ("Liquid 3D light", note: "do the best"). Sits next to v7 Glass night city.
Background: src/v8/blob.tsx, a raymarched liquid-glass blob written from scratch, with pearl shading, thin-film rim and two speculars. Four shapes: 0 drop with droplets, 1 pill, 2 cluster, 3 ticket. setBlob({x,y,scale,morph,merge,energy,tint}). Home scroll moves and morphs it per beat; inner pages park it top-right (cornerBlob). Typing in search makes it wobble; results tint it mint (found) or coral (none).
Structure: top bar (logo + Pro + Sign in) and a floating bottom dock on every screen size; centred hero; sticky card stack; pinned how-it-works with blob morph; bento; pharmacist strip; close.
Type: Funnel Display + Funnel Sans, Geist Mono for codes.
Colour (checked): ink 12131C on F3F4F9/white >16 · muted 5A5F73 5.8 · faint 63687C 5.0 · lilac 5B48D9 >5.5 · in 0B7A55 4.9 · low 9A5200 5.3 · out C03A2B 4.9. Primary button = ink pill, white text.
Cards: white 78% fills with inner highlight and lilac-tinted shadow; only the dock and dropdowns blur.
Motion: spring UI 160 to 320ms; intro: droplets merge into the blob while "dwa" types in (once per session, skippable).
