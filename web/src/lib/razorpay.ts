import crypto, { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function createRazorpayClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function createRazorpayOrder(amountInPaise: number, receiptId: string) {
  const razorpay = createRazorpayClient();
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: receiptId,
  });
  return order;
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return safeCompare(expectedSignature, signature);
}

export function verifyRazorpayWebhook(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  return safeCompare(expectedSignature, signature);
}
