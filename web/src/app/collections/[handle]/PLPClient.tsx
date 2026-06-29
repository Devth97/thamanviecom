"use client";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ShopifyCollection, ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppCTA from "@/components/WhatsAppCTA";

type Props = { collection: ShopifyCollection };

export default function PLPClient({ collection }: Props) {
  const [products, setProducts] = useState<ShopifyProduct[]>(collection.products.nodes);
  const [sortKey, setSortKey] = useState("BEST_SELLING");
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/shopify/products?collection=${collection.handle}&sortKey=${sortKey}&first=48`)
      .then((r) => r.json())
      .then(({ products: p }: { products: ShopifyProduct[] }) => {
        setProducts(p ?? []);
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!mq.matches && gridRef.current) {
          const cards = gridRef.current.querySelectorAll("a");
          gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sortKey, collection.handle]);

  return (
    <>
      {/* Back bar */}
      <div className="border-b border-[#E8DDD0] bg-[#FAF6F0] pt-16">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-xs text-[#666] hover:text-[#8B1A1A] transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </a>
          <nav className="hidden md:flex items-center text-xs text-[#999]">
            <a href="/" className="hover:text-[#8B1A1A] transition-colors">Home</a>
            <span className="mx-2">›</span>
            <span className="text-[#1A1A1A]">{collection.title}</span>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl text-[#8B1A1A] mb-2">{collection.title}</h1>
        <p className="text-sm text-[#666] mb-8">{products.length} products</p>
        {collection.description && (
          <p className="text-sm text-[#666] mb-8 max-w-xl">{collection.description}</p>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          <FilterSidebar sortKey={sortKey} onSortChange={setSortKey} />
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded bg-[#F5EDE0] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-[#666] py-12 text-center">No products found in this collection.</p>
            ) : (
              <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
