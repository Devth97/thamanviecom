"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { SlidersHorizontal, X } from "lucide-react";

export default function HomeShopSection({ initial }: { initial: ShopifyProduct[] }) {
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>(initial);
  const [sortKey, setSortKey] = useState("BEST_SELLING");
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Only render sidebar in DOM on desktop (1024px+)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/shopify/products?sortKey=${sortKey}&first=48`)
      .then(r => r.json())
      .then(({ products: p }: { products: ShopifyProduct[] }) => {
        setAllProducts(p ?? []);
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!mq.matches && gridRef.current) {
          const cards = gridRef.current.querySelectorAll("a");
          gsap.fromTo(cards, { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: "power2.out" });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sortKey]);

  const maxPrice = useMemo(() =>
    allProducts.length === 0 ? 50000 : Math.max(...allProducts.map(p => Number(p.priceRange.minVariantPrice.amount)), 1000),
    [allProducts]
  );

  const filtered = useMemo(() => allProducts.filter(p => {
    if (inStockOnly && !p.variants.nodes.some(v => v.availableForSale)) return false;
    const price = Number(p.priceRange.minVariantPrice.amount);
    if (price < priceRange[0] || price > priceRange[1]) return false;
    return true;
  }), [allProducts, inStockOnly, priceRange]);

  const activeCount = (inStockOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  const reset = () => {
    setSelectedTypes([]); setSelectedFabrics([]); setSelectedWorks([]);
    setSelectedColors([]); setPriceRange([0, maxPrice]); setInStockOnly(false);
  };

  const filterProps = {
    sortKey, onSortChange: setSortKey,
    selectedTypes, onTypeChange: setSelectedTypes,
    selectedFabrics, onFabricChange: setSelectedFabrics,
    selectedWorks, onWorkChange: setSelectedWorks,
    selectedColors, onColorChange: setSelectedColors,
    priceRange, onPriceChange: setPriceRange, maxPrice,
    inStockOnly, onInStockChange: setInStockOnly,
    onReset: reset,
  };

  return (
    <section id="shop" className="bg-[#FAF6F0] py-8 md:py-12 scroll-mt-16 border-t border-[#E8DDD0]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-px w-6 bg-[#B8860B]" />
              <span className="text-[#B8860B] text-[10px] tracking-[0.25em] uppercase">Our Sarees</span>
            </div>
            <h2 className="font-display text-2xl md:text-4xl text-[#0D0808]">Shop All</h2>
            <p className="text-xs text-[#666] mt-1">{filtered.length} saree{filtered.length !== 1 ? "s" : ""}{activeCount > 0 ? " (filtered)" : ""}</p>
          </div>
          {/* Mobile filter button */}
          <button
            onClick={() => setFiltersOpen(true)}
            className={`${isDesktop ? "hidden" : "flex"} items-center gap-2 border border-[#D4A96A] px-3 py-2 text-xs rounded-full text-[#1A1A1A]`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter {activeCount > 0 && <span className="bg-[#8B1A1A] text-white rounded-full px-1.5 text-[10px]">{activeCount}</span>}
          </button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar — only in DOM on desktop, never renders on mobile */}
          {isDesktop && <FilterSidebar {...filterProps} />}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-[#F0E8DC] animate-pulse rounded-sm" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#666] mb-3">No sarees match your filters.</p>
                <button onClick={reset} className="text-sm text-[#8B1A1A] underline">Clear filters</button>
              </div>
            ) : (
              <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/tablet filter drawer — only when not desktop */}
      {filtersOpen && !isDesktop && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[88vw] max-w-xs bg-white overflow-y-auto shadow-2xl flex flex-col">
            {/* Sticky header inside drawer */}
            <div className="sticky top-0 bg-white border-b border-[#E8DDD0] px-4 py-4 flex items-center justify-between z-10">
              <span className="font-semibold text-sm text-[#1A1A1A] tracking-wide">FILTERS</span>
              <button
                onClick={() => setFiltersOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#F5EDE0] hover:bg-[#E8DDD0] transition-colors"
                aria-label="Close filters"
              >
                <X className="h-4 w-4 text-[#666]" />
              </button>
            </div>
            {/* Filter content — hide FilterSidebar's own title */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <FilterSidebar {...filterProps} />
            </div>
            {/* Apply button */}
            <div className="sticky bottom-0 bg-white border-t border-[#E8DDD0] p-4">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-[#8B1A1A] text-white py-3 text-sm font-semibold tracking-wide rounded-sm hover:bg-[#6d1414] transition-colors"
              >
                View {filtered.length} Saree{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
