import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Chargily calls this after a payment. The body is signed with HMAC-SHA256
 * using the secret key, sent in the "signature" header; anything that fails
 * the check is rejected.
 *
 * The demo has no database yet, so a verified event is only logged. With a
 * database, this is where a deposit is marked paid or a Pro plan is activated
 * (event.data.metadata carries { purpose, ref }). The browser redirect alone
 * must never be trusted for that in production.
 */
export async function POST(request: Request) {
  const secret = process.env.CHARGILY_SECRET_KEY;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("signature") ?? "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");

  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response("Bad signature", { status: 403 });

  let event: { type?: string; data?: { id?: string; metadata?: unknown } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  console.info("[chargily] verified event", event.type, event.data?.id, event.data?.metadata);
  return new Response(null, { status: 200 });
}
