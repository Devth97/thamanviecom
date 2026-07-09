import type { ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

/**
 * Men's Wear homepage section. Presentational — receives the already-filtered
 * men's products (see `isMensWear`). Renders nothing when there are none, so it
 * stays invisible until the shop tags its first men's item.
 *
 * Styling deliberately mirrors HomeShopSection's header (gold eyebrow +
 * Playfair display heading) and the site's card grid so it reads as one system.
 */
export default function MensWearSection({ products }: { products: ShopifyProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section
      id="mens"
      className="bg-[#FAF6F0] py-8 md:py-12 scroll-mt-16 border-t border-[#E8DDD0]"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px w-6 bg-[#B8860B]" />
            <span className="text-[#B8860B] text-[10px] tracking-[0.25em] uppercase">For Him</span>
          </div>
          <h2 className="font-display text-2xl md:text-4xl text-[#0D0808]">Men&apos;s Wear</h2>
          <p className="text-xs text-[#666] mt-1">
            {products.length} style{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} surface="home" />
          ))}
        </div>
      </div>
    </section>
  );
}
