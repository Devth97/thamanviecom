/**
 * Promotional pricing engine (pure, no side effects, no DOM).
 *
 * Sale priority:
 *   1. If the product has a genuine Shopify sale (compareAtPrice > price) we use
 *      Shopify's numbers verbatim and never overwrite them.
 *   2. Otherwise, if fallback is enabled, we synthesise a HIGHER "MRP" from the
 *      configured percentage. The live price is unchanged (it is what checkout
 *      charges); only the struck-through original is fabricated. This keeps
 *      checkout honest while still showing a discount.
 *
 * The displayed percentage/savings are always recomputed from the actual two
 * numbers shown, so "15% OFF" can never disagree with the rounded prices.
 */
import type { ShopifyMoney } from "@/lib/shopify";
import { promoConfig, type PromoConfig } from "@/config/promo";

export interface PromoPricing {
  /** Whether any promotional treatment applies. */
  show: boolean;
  /** True = real Shopify sale; false = synthesised MRP. */
  isRealSale: boolean;
  /** The live, charged price. */
  current: ShopifyMoney;
  /** The struck-through original, or null when no discount is shown. */
  original: ShopifyMoney | null;
  /** Whole-number percent off, derived from `original` and `current`. */
  discountPercent: number;
  /** Amount saved (original − current). */
  savings: ShopifyMoney;
}

type PricedProduct = {
  priceRange: { minVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney };
  /** Optional Shopify tags — used for per-product discount overrides. */
  tags?: string[];
};

/**
 * A per-product discount can be set by adding a Shopify tag in admin, e.g.
 * `promo:20`, `promo-20`, `sale:25`, or `discount-10` → that percentage.
 * This overrides the global fallback for just that product.
 */
const DISCOUNT_TAG = /^(?:promo|sale|discount)[-:\s]?(\d{1,2})$/i;

export function getTagDiscountPercent(tags: string[]): number | null {
  for (const tag of tags) {
    const match = tag.trim().match(DISCOUNT_TAG);
    if (match) {
      const pct = parseInt(match[1], 10);
      if (pct > 0 && pct < 100) return pct;
    }
  }
  return null;
}

const money = (amount: number, currencyCode: string): ShopifyMoney => ({
  amount: String(amount),
  currencyCode,
});

/** Percent off, rounded to a whole number, guarded against divide-by-zero. */
function percentOff(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}

/**
 * Compute promotional pricing for a product card.
 * Returns `show: false` when nothing should be displayed beyond the plain price.
 */
export function getPromoPricing(
  product: PricedProduct,
  config: PromoConfig = promoConfig
): PromoPricing {
  const price = product.priceRange.minVariantPrice;
  const priceAmount = parseFloat(price.amount);
  const compareAmount = parseFloat(
    product.compareAtPriceRange?.minVariantPrice?.amount ?? "0"
  );

  const noPromo: PromoPricing = {
    show: false,
    isRealSale: false,
    current: price,
    original: null,
    discountPercent: 0,
    savings: money(0, price.currencyCode),
  };

  if (!config.enabled || !Number.isFinite(priceAmount) || priceAmount <= 0) {
    return noPromo;
  }

  // 1. Genuine Shopify sale wins.
  if (compareAmount > priceAmount) {
    return {
      show: true,
      isRealSale: true,
      current: price,
      original: money(compareAmount, price.currencyCode),
      discountPercent: percentOff(compareAmount, priceAmount),
      savings: money(compareAmount - priceAmount, price.currencyCode),
    };
  }

  // 2. Synthesised MRP (never touches checkout price).
  //    A per-product tag (e.g. `promo:20`) wins; otherwise the global fallback
  //    applies only when `applyFallback` is on. No tag + fallback off = no promo.
  const tagPct = product.tags ? getTagDiscountPercent(product.tags) : null;
  const pct = tagPct ?? (config.applyFallback ? config.fallbackDiscountPercent : null);
  if (pct === null || !(pct > 0 && pct < 100)) return noPromo;

  const factor = 1 - pct / 100;
  // Inflate upward, then round to a tidy multiple of 10 for a believable MRP.
  let original = Math.round(priceAmount / factor / 10) * 10;
  if (original <= priceAmount) original = priceAmount + 10;

  return {
    show: true,
    isRealSale: false,
    current: price,
    original: money(original, price.currencyCode),
    discountPercent: percentOff(original, priceAmount),
    savings: money(original - priceAmount, price.currencyCode),
  };
}
