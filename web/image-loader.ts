/**
 * Custom Next.js image loader.
 *
 * Shopify's CDN already resizes and optimises images (via the `width` query
 * param), so we serve those URLs directly instead of proxying them through
 * Vercel's image optimizer. That avoids Vercel's image-optimization quota
 * (which was returning HTTP 402 and blanking product images) and is faster.
 * Any non-Shopify src (e.g. the local logo) is passed through unchanged.
 */
export default function shopifyImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("http") && src.includes("cdn.shopify.com")) {
    try {
      const url = new URL(src);
      url.searchParams.set("width", String(width));
      return url.href;
    } catch {
      return src;
    }
  }
  return src;
}
