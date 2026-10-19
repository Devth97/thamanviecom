/**
 * Resolve a site media path (videos, collection covers) to the URL to load.
 *
 * Vercel bills the bytes it serves from public/, so heavy media is hosted in
 * Shopify (Admin → Content → Files) and served from Shopify's CDN instead.
 * To add or replace one: upload the file there, click its "Copy link" icon and
 * put the link below against the file's public/ path. Paths not listed are
 * served from public/ as before.
 */
const SHOPIFY_MEDIA: Record<string, string> = {
  "/media/videos/hero-silk.mp4": "https://cdn.shopify.com/videos/c/o/v/73e1b12cd3ff4d01a7f68897a77aca60.mp4",
  "/media/videos/saree-unfurling.mp4": "https://cdn.shopify.com/videos/c/o/v/75739e362f134178921d12ff86136552.mp4",
  "/media/videos/hands-weaving.mp4": "https://cdn.shopify.com/videos/c/o/v/6946a1c19dcf428baf8a7322579d1c10.mp4",
  "/media/videos/gold-zari.mp4": "https://cdn.shopify.com/videos/c/o/v/03fa9fd3b73645d1b04a6bc58a95d939.mp4",
  "/media/videos/silk-reeling.mp4": "https://cdn.shopify.com/videos/c/o/v/f8354494f3e3499b98448b7c4c2423e4.mp4",
  "/collections/banarasi-silk.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/banarasi-silk.webp?v=1792417607",
  "/collections/kanjivaram-silk.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/kanjivaram-silk.webp?v=1792417601",
  "/collections/mysore-silk.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/mysore-silk.webp?v=1792417582",
  "/collections/wedding-silk.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/wedding-silk.webp?v=1792417597",
  "/collections/casual-cotton.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/casual-cotton.webp?v=1792417602",
  "/collections/fancy-saree.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/fancy-saree.webp?v=1792417604",
  "/collections/tissue-saree.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/tissue-saree.webp?v=1792417601",
  "/collections/crepe-saree.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/crepe-saree.webp?v=1792417602",
  "/collections/semi-silk-saree.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/semi-silk-saree.webp?v=1792417603",
  "/collections/georgette-saree.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/georgette-saree.webp?v=1792417601",
  "/collections/tussar-saree.webp": "https://cdn.shopify.com/s/files/1/0821/8388/0953/files/tussar-saree.webp?v=1792417596",
};

export function mediaUrl(path: string): string {
  return SHOPIFY_MEDIA[path] ?? path;
}
