import type { ShopifyProduct } from "@/lib/shopify";

/**
 * A product belongs to Men's Wear if it carries any of these tags
 * (case-insensitive). To move an item into the Men's Wear homepage section,
 * add one of these tags to the product in Shopify admin — "Men" is the
 * preferred convention going forward; "Shirt"/"Kurta"/etc. also match.
 *
 * Everything else is treated as women's (saree) inventory, so these tags also
 * keep men's items OUT of the "Our Sarees" grid.
 */
export const MENS_WEAR_TAGS = [
  "men",
  "mens",
  "men's",
  "mens wear",
  "men's wear",
  "menswear",
  "shirt",
  "t-shirt",
  "tshirt",
  "kurta",
  "kurta set",
  "pant",
  "pants",
  "trouser",
  "trousers",
  "ethnic men",
];

/** True when the product is tagged as men's wear. */
export function isMensWear(product: Pick<ShopifyProduct, "tags">): boolean {
  return product.tags.some((tag) => MENS_WEAR_TAGS.includes(tag.toLowerCase().trim()));
}
