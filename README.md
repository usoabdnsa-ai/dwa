# dwa

A prototype that shows which pharmacy in Alger has a medicine in stock, so people stop going from one pharmacy to the next.

All pharmacy names, addresses, phone numbers and stock levels are invented. Medicine names are real and prices are approximate. Payments run on a labelled test page unless a Chargily key is set, so no real money moves.

## Designs

| Path | Design |
| --- | --- |
| `/` | Live city map: a scroll-driven 3D night map of Alger |
| `/v3` | Pill Pop |
| `/v4` | Neon Night |
| `/v5` | Dark product |
| `/v6` | Evergreen |

Each version has its own search and pharmacy pages. `/dashboard` is the pharmacist side, and any well-formed login works.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The map needs an internet connection to load its tiles from OpenFreeMap.

To test real Chargily payments, copy `.env.example` to `.env.local` and add a test key.
