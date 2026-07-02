import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.amountInPaise || typeof body.amountInPaise !== "number" || body.amountInPaise < 100) {
    return NextResponse.json({ error: "Invalid amount — must be at least 100 paise (₹1)" }, { status: 400 });
  }

  try {
    const receipt = `cart_${body.cartId ?? "unknown"}_${Date.now()}`;
    const order = await createRazorpayOrder(body.amountInPaise, receipt);
    return NextResponse.json({
      orderId: (order as { id: string }).id,
      amount: (order as { amount: number }).amount,
      currency: (order as { currency: string }).currency,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
