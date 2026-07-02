import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.amountInPaise || typeof body.amountInPaise !== "number" || body.amountInPaise < 100) {
    return NextResponse.json({ error: "Invalid amount — must be at least 100 paise (₹1)" }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payment gateway not configured. RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing on the server." },
      { status: 500 }
    );
  }

  try {
    // Razorpay caps `receipt` at 40 chars — Shopify cart GIDs blow past that,
    // so keep it short and unique.
    const receipt = `rcpt_${Date.now()}`;
    const order = await createRazorpayOrder(body.amountInPaise, receipt);
    return NextResponse.json({
      orderId: (order as { id: string }).id,
      amount: (order as { amount: number }).amount,
      currency: (order as { currency: string }).currency,
    });
  } catch (err) {
    // Surface Razorpay's actual error (auth, validation, etc.) instead of a generic message.
    const e = err as { statusCode?: number; error?: { description?: string }; message?: string };
    const description = e?.error?.description ?? e?.message ?? "Unknown Razorpay error";
    const status = e?.statusCode === 401 ? 401 : 500;
    return NextResponse.json({ error: `Razorpay: ${description}` }, { status });
  }
}
