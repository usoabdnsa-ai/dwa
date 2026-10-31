/*
 * Starts a payment. Prices are fixed here, never taken from the browser.
 *
 * With CHARGILY_SECRET_KEY set (in .env.local), this creates a real Chargily Pay
 * V2 checkout (EDAHABIA / CIB) and returns its hosted payment URL. Test keys hit
 * Chargily's test environment; set CHARGILY_MODE=live only with live keys.
 * Without a key it returns our own clearly labelled demo payment page, so the
 * flow can be tried end to end with no account.
 *
 * Chargily API reference: https://dev.chargily.com/pay-v2/introduction
 */

const PRICES = {
  deposit: { amount: 100, description: "dwa reservation deposit (deducted at the counter)" },
  pro: { amount: 2900, description: "dwa Pro, 1 month" },
} as const;

type Purpose = keyof typeof PRICES;

export async function POST(request: Request) {
  let body: { purpose?: string; ref?: string; version?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const purpose = body.purpose as Purpose;
  if (!(purpose in PRICES)) return Response.json({ error: "Unknown purpose" }, { status: 400 });
  // Reservation codes look like DWA-K7Q3; Pro checkouts use the pharmacy id.
  const ref = String(body.ref ?? "");
  if (!/^[A-Za-z0-9-]{3,40}$/.test(ref)) return Response.json({ error: "Invalid reference" }, { status: 400 });

  const { amount, description } = PRICES[purpose];
  const origin = new URL(request.url).origin;
  // The v6 design has its own confirmation page; everything else returns to the main site.
  const base = body.version === "v6" ? "/v6" : "";
  const success = purpose === "deposit" ? `${origin}${base}/reservation/${ref}?paid=1` : `${origin}/pro?activated=1`;
  const failure = purpose === "deposit" ? `${origin}${base}/reservation/${ref}?paid=0` : `${origin}/pro?cancelled=1`;

  const secret = process.env.CHARGILY_SECRET_KEY;
  if (!secret) {
    const demo = new URL("/pay/demo", origin);
    demo.search = new URLSearchParams({ purpose, ref, amount: String(amount), success, failure }).toString();
    return Response.json({ url: demo.toString(), mode: "demo" });
  }

  const api = process.env.CHARGILY_MODE === "live" ? "https://pay.chargily.net/api/v2" : "https://pay.chargily.net/test/api/v2";
  const res = await fetch(`${api}/checkouts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "dzd",
      success_url: success,
      failure_url: failure,
      description,
      locale: "fr",
      metadata: { purpose, ref },
    }),
  });

  if (!res.ok) {
    return Response.json({ error: "Payment provider error", status: res.status }, { status: 502 });
  }
  const data = (await res.json()) as { checkout_url?: string };
  if (!data.checkout_url) return Response.json({ error: "No checkout URL returned" }, { status: 502 });
  return Response.json({ url: data.checkout_url, mode: process.env.CHARGILY_MODE === "live" ? "live" : "test" });
}
