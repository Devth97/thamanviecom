"use client";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";

/**
 * "You May Also Like" — AI-picked complementary products for the product being
 * viewed. Fetches on mount; renders nothing until it has picks, so the PDP is
 * never blocked waiting on the model.
 */
export default function AiRecommendations({ handle }: { handle: string }) {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai-recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProducts(Array.isArray(d.products) ? d.products : []);
      })
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (products !== null && products.length === 0) return null;

  return (
    <section className="bg-[#FAF6F0] border-t border-[#E8DDD0] py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-2xl md:text-3xl text-[#0D0808]">You May Also Like</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0D0808] text-white text-[10px] font-semibold tracking-wide px-2 py-0.5">
            <Sparkles className="h-3 w-3 text-[#D4AF37]" />
            AI PICKED
          </span>
        </div>

        {products === null ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F0E8DC] animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} surface="recommendations" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
