import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyRazorpayWebhook(body, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as { event: string; payload?: unknown };

  if (event.event === "payment.captured") {
    if (process.env.MAKE_WEBHOOK_URL) {
      void fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "payment_captured", payload: event }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
