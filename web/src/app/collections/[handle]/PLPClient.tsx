"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ShopifyCollection, ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { SlidersHorizontal, X } from "lucide-react";

// `showAllProducts` is set when the requested handle isn't a real Shopify
// collection — we then show the full catalog instead of an empty collection.
type Props = { collection: ShopifyCollection; showAllProducts?: boolean };

export default function PLPClient({ collection, showAllProducts = false }: Props) {
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>(collection.products.nodes);
  const [sortKey, setSortKey] = useState("BEST_SELLING");
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile drawer
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fetch from Shopify when sort changes.
  // In showAllProducts mode the handle isn't a real collection, so fetch the
  // whole catalog (no collection filter) instead of an empty collection.
  useEffect(() => {
    setLoading(true);
    const url = showAllProducts
      ? `/api/shopify/products?sortKey=${sortKey}&first=48`
      : `/api/shopify/products?collection=${collection.handle}&sortKey=${sortKey}&first=48`;
    fetch(url)
      .then(r => r.json())
      .then(({ products: p }: { products: ShopifyProduct[] }) => {
        // Never clobber a populated list with an empty response.
        if (p && p.length > 0) setAllProducts(p);
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!mq.matches && gridRef.current) {
          const cards = gridRef.current.querySelectorAll("a");
          gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sortKey, collection.handle, showAllProducts]);

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    // A product matches a filter if any selected value is either an exact tag
    // OR appears in the product name — so naming a saree "Kanjivaram Silk…"
    // makes it show under the Kanjivaram filter without needing a tag.
    const matchesAny = (p: ShopifyProduct, selected: string[]) => {
      if (selected.length === 0) return true;
      const lowerTags = p.tags.map(t => t.toLowerCase());
      const title = p.title.toLowerCase();
      return selected.some(s => {
        const sl = s.toLowerCase();
        return lowerTags.includes(sl) || title.includes(sl);
      });
    };

    return allProducts.filter(p => {
      // In stock
      if (inStockOnly && !p.variants.nodes.some(v => v.availableForSale)) return false;
      // Price
      const price = Number(p.priceRange.minVariantPrice.amount);
      if (price < priceRange[0] || price > priceRange[1]) return false;
      // Occasion / Type / Fabric / Work / Colour — matched against the product's
      // tags or its name (case-insensitive).
      if (!matchesAny(p, selectedOccasions)) return false;
      if (!matchesAny(p, selectedTypes)) return false;
      if (!matchesAny(p, selectedFabrics)) return false;
      if (!matchesAny(p, selectedWorks)) return false;
      if (!matchesAny(p, selectedColors)) return false;
      return true;
    });
  }, [allProducts, inStockOnly, priceRange, selectedOccasions, selectedTypes, selectedFabrics, selectedWorks, selectedColors]);

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 50000;
    return Math.max(...allProducts.map(p => Number(p.priceRange.minVariantPrice.amount)), 1000);
  }, [allProducts]);

  const resetFilters = () => {
    setSelectedOccasions([]);
    setSelectedTypes([]);
    setSelectedFabrics([]);
    setSelectedWorks([]);
    setSelectedColors([]);
    setPriceRange([0, maxPrice]);
    setInStockOnly(false);
  };

  const activeFilterCount = selectedOccasions.length + selectedTypes.length + selectedFabrics.length +
    selectedWorks.length + selectedColors.length + (inStockOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  const filterProps = {
    sortKey, onSortChange: setSortKey,
    selectedOccasions, onOccasionChange: setSelectedOccasions,
    selectedTypes, onTypeChange: setSelectedTypes,
    selectedFabrics, onFabricChange: setSelectedFabrics,
    selectedWorks, onWorkChange: setSelectedWorks,
    selectedColors, onColorChange: setSelectedColors,
    priceRange, onPriceChange: setPriceRange,
    maxPrice,
    inStockOnly, onInStockChange: setInStockOnly,
    onReset: resetFilters,
  };

  return (
    <>
      {/* Back bar */}
      <div className="border-b border-[#E8DDD0] bg-[#FAF6F0] pt-16">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
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

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-[#8B1A1A]">{collection.title}</h1>
            <p className="text-sm text-[#666] mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              {activeFilterCount > 0 && <span className="text-[#8B1A1A]"> (filtered)</span>}
            </p>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 border border-[#D4A96A] px-3 py-2 text-xs rounded-full text-[#1A1A1A]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters {activeFilterCount > 0 && <span className="bg-[#8B1A1A] text-white rounded-full px-1.5">{activeFilterCount}</span>}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <FilterSidebar {...filterProps} />
          </div>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded bg-[#F5EDE0] animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#666] mb-4">No products match your filters.</p>
                <button onClick={resetFilters} className="text-sm text-[#8B1A1A] underline">Clear all filters</button>
              </div>
            ) : (
              <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[88vw] max-w-xs bg-white overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1A1A1A]">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5 text-[#666]" />
              </button>
            </div>
            <FilterSidebar {...filterProps} />
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-6 w-full bg-[#8B1A1A] text-white py-3 text-sm font-semibold rounded"
            >
              View {filteredProducts.length} Products
            </button>
          </div>
        </div>
      )}

      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
