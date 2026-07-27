"use client";
import { useState, useMemo } from "react";
import type { ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

const SUB_CATEGORIES = [
  { id: "all", label: "All Men's" },
  { id: "kurta", label: "Kurtas & Sets", tags: ["kurta", "kurta set", "kurta-set"] },
  { id: "shirt", label: "Shirts", tags: ["shirt", "t-shirt", "tshirt"] },
  { id: "bottoms", label: "Pants & Dhotis", tags: ["pant", "pants", "trouser", "trousers", "dhoti"] },
];

/**
 * Men's Wear homepage section with interactive sub-category filter pills
 * (e.g. Kurtas & Sets, Shirts, Pants & Dhotis).
 */
export default function MensWearSection({ products }: { products: ShopifyProduct[] }) {
  const [activeSubCat, setActiveSubCat] = useState("all");

  const filteredProducts = useMemo(() => {
    if (activeSubCat === "all") return products;

    const catObj = SUB_CATEGORIES.find((c) => c.id === activeSubCat);
    if (!catObj || !catObj.tags) return products;

    return products.filter((p) => {
      const lowerTags = p.tags.map((t) => t.toLowerCase().trim());
      const titleLower = p.title.toLowerCase();

      return catObj.tags.some(
        (targetTag) => lowerTags.includes(targetTag) || titleLower.includes(targetTag)
      );
    });
  }, [products, activeSubCat]);

  if (products.length === 0) return null;

  return (
    <section
      id="mens"
      className="bg-[#FAF6F0] py-8 md:py-12 scroll-mt-16 border-t border-[#E8DDD0]"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-px w-6 bg-[#B8860B]" />
              <span className="text-[#B8860B] text-[10px] tracking-[0.25em] uppercase">For Him</span>
            </div>
            <h2 className="font-display text-2xl md:text-4xl text-[#0D0808]">Men&apos;s Wear</h2>
            <p className="text-xs text-[#666] mt-1">
              {filteredProducts.length} style{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Sub-category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {SUB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveSubCat(cat.id)}
                className={`shrink-0 px-4 py-1.5 text-xs tracking-[0.1em] uppercase rounded-full transition-colors whitespace-nowrap border ${
                  activeSubCat === cat.id
                    ? "bg-[#8B1A1A] text-white border-[#8B1A1A]"
                    : "border-[#D4A96A]/50 text-[#1A1A1A] hover:bg-[#8B1A1A]/10 hover:border-[#8B1A1A]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} surface="home" />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#888] bg-white/50 rounded border border-[#E8DDD0]">
            No styles found under this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
