import crypto, { timingSafeEqual } from "crypto";

export function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body, "utf8")
    .digest("base64");
  const bufA = Buffer.from(digest);
  const bufB = Buffer.from(hmacHeader);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
