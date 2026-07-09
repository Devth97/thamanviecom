/**
 * Per-product feature badges (🔥 Best Seller, ⭐ Trending, ⚡ Flash Sale,
 * 💎 Premium Choice, 🆕 New Arrival) resolved from Shopify product tags, plus an
 * optional small offer badge (e.g. "LIMITED OFFER").
 *
 * `FeatureBadges` overlays pills on the image; `OfferBadge` sits beneath the
 * price. Both are presentational and safe to render on the server.
 */
import { promoConfig, resolveFeatureBadges } from "@/config/promo";

/** Image-overlay pills driven by product tags. Renders nothing when none match. */
export function FeatureBadges({ tags }: { tags: string[] }) {
  const badges = resolveFeatureBadges(tags);
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {badges.map((b) => (
        <span
          key={b.label}
          className="promo-fade inline-flex w-fit items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm"
          style={{
            backgroundColor: b.bg,
            color: b.color,
            borderRadius: promoConfig.colors.badgeRadius,
          }}
        >
          <span aria-hidden="true">{b.icon}</span>
          {b.label}
        </span>
      ))}
    </div>
  );
}

/** Small offer badge shown under the price. Controlled by config. */
export function OfferBadge() {
  const { offerBadge, colors } = promoConfig;
  if (!offerBadge.enabled || !offerBadge.text) return null;

  return (
    <span
      className="promo-badge-hover inline-flex w-fit items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{
        backgroundColor: colors.badgeBg,
        color: colors.badgeText,
        borderRadius: colors.badgeRadius,
      }}
    >
      {offerBadge.text}
    </span>
  );
}
