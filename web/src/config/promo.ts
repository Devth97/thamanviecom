/**
 * Promotional pricing configuration — the single "merchant settings" home.
 *
 * Because thamanvi.com is a headless Next.js storefront (not a Shopify Liquid
 * theme), there is no Shopify theme editor to drive these values. Global
 * defaults live here; per-product feature badges are driven by Shopify product
 * TAGS (see `FEATURE_BADGE_PRESETS`) so the shop owner controls them from admin.
 *
 * Nothing here changes checkout pricing. When a product has a genuine Shopify
 * `compareAtPrice`, that real sale wins. Only when there is no real sale do we
 * synthesise a higher strikethrough "MRP" — the real price stays the charged
 * price, so checkout is always honest.
 */

/** Card surfaces the promo system can appear on. */
export type PromoSurface =
  | "home"
  | "collection"
  | "featured"
  | "related"
  | "search"
  | "recommendations";

export interface PromoColors {
  /** Strikethrough MRP colour. */
  originalPrice: string;
  /** Live (charged) price colour. */
  discountPrice: string;
  /** "15% OFF" text colour. */
  percentText: string;
  /** Offer/discount badge background. */
  badgeBg: string;
  /** Offer/discount badge text. */
  badgeText: string;
  /** Border radius of pills/badges (any CSS length). */
  badgeRadius: string;
}

export interface PromoConfig {
  /** Master switch. When false the card renders its plain price. */
  enabled: boolean;
  /**
   * Fallback discount used ONLY when a product has no real Shopify sale.
   * We inflate a synthetic MRP upward from the live price by this percentage.
   */
  fallbackDiscountPercent: number;
  /** If false, products without a real sale show no promo (safest). */
  applyFallback: boolean;
  /** Show the "Save ₹X" line under the price. */
  showSavings: boolean;
  /** Small offer badge shown beneath the price (e.g. "LIMITED OFFER"). */
  offerBadge: { enabled: boolean; text: string };
  /** Evergreen countdown timer (optional). */
  countdown: { enabled: boolean; durationHours: number; label: string };
  /** How many per-product feature badges to show at most (keeps it premium). */
  maxFeatureBadges: number;
  colors: PromoColors;
  /** Toggle the whole promo system per surface. */
  showOn: Record<PromoSurface, boolean>;
}

export const promoConfig: PromoConfig = {
  enabled: true,
  fallbackDiscountPercent: 15,
  applyFallback: true,
  showSavings: true,
  offerBadge: { enabled: true, text: "LIMITED OFFER" },
  countdown: { enabled: false, durationHours: 24, label: "Offer ends in" },
  maxFeatureBadges: 2,
  colors: {
    originalPrice: "#9A9A9A",
    discountPrice: "#8B1A1A",
    percentText: "#B8860B",
    badgeBg: "#8B1A1A",
    badgeText: "#FFFFFF",
    badgeRadius: "9999px",
  },
  showOn: {
    home: true,
    collection: true,
    featured: true,
    related: true,
    search: true,
    recommendations: true,
  },
};

export interface FeatureBadgePreset {
  /** Normalised tag key (lowercase, alphanumerics only) → preset. */
  label: string;
  icon: string;
  bg: string;
  color: string;
}

/**
 * Per-product feature badges. The shop owner adds the matching TAG to a product
 * in Shopify admin (case-insensitive, spacing/punctuation ignored) and the pill
 * appears automatically. Order here defines display priority.
 */
export const FEATURE_BADGE_PRESETS: Record<string, FeatureBadgePreset> = {
  bestseller: { label: "Best Seller", icon: "🔥", bg: "#0D0808", color: "#FFFFFF" },
  trending: { label: "Trending", icon: "⭐", bg: "#8B1A1A", color: "#FFFFFF" },
  flashsale: { label: "Flash Sale", icon: "⚡", bg: "#B8860B", color: "#0D0808" },
  premiumchoice: { label: "Premium Choice", icon: "💎", bg: "#0D0808", color: "#D4AF37" },
  newarrival: { label: "New Arrival", icon: "🆕", bg: "#F5EDE0", color: "#8B1A1A" },
};

/** Normalise a tag/key for matching: lowercase, strip non-alphanumerics. */
export function normalizeBadgeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolve a product's tags to feature-badge presets, in preset priority order,
 * de-duplicated and capped by `maxFeatureBadges`.
 */
export function resolveFeatureBadges(
  tags: string[],
  max: number = promoConfig.maxFeatureBadges
): FeatureBadgePreset[] {
  const present = new Set(tags.map(normalizeBadgeKey));
  const matched: FeatureBadgePreset[] = [];
  for (const key of Object.keys(FEATURE_BADGE_PRESETS)) {
    if (present.has(key)) matched.push(FEATURE_BADGE_PRESETS[key]);
    if (matched.length >= max) break;
  }
  return matched;
}
