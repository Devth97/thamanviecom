"use client";
import Image from "next/image";
import Link from "next/link";
import { ShopifyProduct, formatPrice } from "@/lib/shopify";
import WishlistButton from "./WishlistButton";
import { useCartContext } from "@/contexts/CartContext";
import { promoConfig, type PromoSurface } from "@/config/promo";
import { getPromoPricing } from "@/lib/promo";
import PromoPrice from "./PromoPrice";
import PromoCountdown from "./PromoCountdown";
import { FeatureBadges, OfferBadge } from "./PromoBadges";

export default function ProductCard({
  product,
  surface,
}: {
  product: ShopifyProduct;
  /** Which card surface this is on — gates promo display via config.showOn. */
  surface?: PromoSurface;
}) {
  const { addItem, loading } = useCartContext();
  const image = product.images.nodes[0];
  const hoverImage = product.images.nodes[1]; // second image on hover if available
  const price = product.priceRange.minVariantPrice;
  const firstVariantId = product.variants.nodes[0]?.id ?? "";
  const inStock = product.variants.nodes.some(v => v.availableForSale);

  // Promo pricing is gated by the master switch and the per-surface toggle.
  const promoOn =
    promoConfig.enabled && (surface ? promoConfig.showOn[surface] : true);
  const promo = getPromoPricing(product);
  const showPromo = promoOn && promo.show;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstVariantId || !inStock) return;
    await addItem(firstVariantId);
  };

  return (
    <Link href={`/products/${product.handle}`} className="group relative flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-[#F5EDE0]">
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              className={`object-cover transition-all duration-700 ${hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage.url}
                alt={hoverImage.altText ?? product.title}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#D4A96A] text-4xl">🧣</div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {promoOn && <FeatureBadges tags={product.tags} />}
          {!inStock && (
            <span className="bg-[#666] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">SOLD OUT</span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} />
        </div>

        {/* Quick Add — slides up on hover */}
        {inStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              disabled={loading}
              className="w-full bg-[#0D0808]/90 text-white text-xs tracking-[0.15em] uppercase py-3 hover:bg-[#8B1A1A] transition-colors disabled:opacity-60"
            >
              {loading ? "Adding..." : "Quick Add"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex-1 px-0.5">
        <h3 className="text-sm font-medium line-clamp-2 text-[#1A1A1A] mb-1">{product.title}</h3>
        {showPromo ? (
          <>
            <PromoPrice pricing={promo} />
            <div className="mt-1 flex flex-col gap-1">
              <OfferBadge />
              <PromoCountdown />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#8B1A1A]">{formatPrice(price)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
