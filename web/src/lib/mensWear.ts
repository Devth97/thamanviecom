import type { ShopifyProduct } from "@/lib/shopify";

/**
 * Decide whether a product is men's wear from its title + tags.
 *
 * Uses substring/word matching (not exact tags) because real Shopify tags look
 * like "Men's Kurta Set", "Kurtas & Sets", "White Pant" — none of which equal a
 * fixed keyword. Order matters:
 *   1. men's-only garments (kurta, sherwani…) → men's.
 *   2. explicit women's markers (saree, blouse, women…) → women's.
 *   3. general men's markers (men, shirt, pant…) → men's.
 * This keeps sarees out of Men's Wear and keeps kurtas/shirts out of the saree
 * ("For Her") grid.
 */
const MENS_GARMENTS = /\b(kurta|kurtas|sherwani|sherwanis|dhoti|dhotis|lungi|nehru|bandhgala|pathani)\b/i;
const WOMENS_MARKERS = /\b(saree|sarees|sari|saris|blouse|lehenga|lehnga|ladies|kurti|kurtis)\b|women/i;
const MENS_MARKERS = /\b(men|mens|man|shirt|shirts|t-?shirt|pant|pants|trouser|trousers)\b/i;

export function isMensWear(product: Pick<ShopifyProduct, "tags"> & { title?: string }): boolean {
  const hay = `${product.title ?? ""} ${product.tags.join(" ")}`.toLowerCase();
  if (MENS_GARMENTS.test(hay)) return true;
  if (WOMENS_MARKERS.test(hay)) return false;
  return MENS_MARKERS.test(hay);
}
