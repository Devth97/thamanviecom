/**
 * Renders the promotional price block: live price, struck-through MRP, "% OFF",
 * and an optional "Save ₹X" line. Purely presentational — pass it a computed
 * `PromoPricing` from `getPromoPricing`. Colours come from `promoConfig` so the
 * shop owner can retheme without touching this file.
 *
 * Sizing matches the original card price row (text-sm price, text-xs original)
 * so integrating it causes no layout shift.
 */
import { formatPrice } from "@/lib/shopify";
import { promoConfig } from "@/config/promo";
import type { PromoPricing } from "@/lib/promo";

export default function PromoPrice({ pricing }: { pricing: PromoPricing }) {
  const c = promoConfig.colors;
  const currentText = formatPrice(pricing.current);

  // No discount to show → plain price, same style as before.
  if (!pricing.show || !pricing.original) {
    return (
      <span className="text-sm font-bold" style={{ color: c.discountPrice }}>
        {currentText}
      </span>
    );
  }

  const originalText = formatPrice(pricing.original);
  const savingsText = formatPrice(pricing.savings);

  return (
    <div className="promo-fade flex flex-col gap-0.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span
          className="text-sm font-bold"
          style={{ color: c.discountPrice }}
          aria-label={`Offer price ${currentText}`}
        >
          {currentText}
        </span>
        <span
          className="text-xs line-through"
          style={{ color: c.originalPrice }}
          aria-label={`Original price ${originalText}`}
        >
          {originalText}
        </span>
        <span
          className="text-[11px] font-semibold tracking-wide"
          style={{ color: c.percentText }}
        >
          {pricing.discountPercent}% OFF
        </span>
      </div>
      {promoConfig.showSavings && (
        <span className="text-[11px] text-[#6B6B6B]">
          Save {savingsText}
        </span>
      )}
    </div>
  );
}
