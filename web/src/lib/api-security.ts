import crypto from "crypto";

export function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body, "utf8")
    .digest("base64");
  return digest === hmacHeader;
}
