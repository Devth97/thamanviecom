import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.razorpay_order_id || !body?.razorpay_payment_id || !body?.razorpay_signature) {
    return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
  }

  const valid = verifyRazorpaySignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature
  );

  if (!valid) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

  return NextResponse.json({ ok: true, paymentId: body.razorpay_payment_id });
}
