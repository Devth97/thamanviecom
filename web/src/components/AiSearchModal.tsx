"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Sparkles, Search } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import ProductCard from "@/components/ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";

/** Starter prompts to help shoppers who don't know what to type. */
const SUGGESTIONS = [
  "Wedding silk sarees",
  "Kanjivaram",
  "Under ₹3000",
  "Something in yellow",
  "Festive & party wear",
  "Banarasi silk",
];

export default function AiSearchModal() {
  const { isOpen, close } = useSearch();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShopifyProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (term: string) => {
      const q = term.trim();
      if (!q) return;
      setQuery(q);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Search failed. Please try again.");
          setResults([]);
        } else {
          setResults(data.products ?? []);
        }
      } catch {
        setError("Something went wrong. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Esc to close + scroll lock while open; reset state when closed.
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="AI Search"
      onClick={close}
    >
      <div
        className="relative mt-0 md:mt-10 w-full md:max-w-3xl h-full md:h-auto md:max-h-[85vh] bg-[#FAF6F0] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD0]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#B8860B]" />
            <span className="font-display text-lg text-[#0D0808]">AI Search</span>
          </div>
          <button
            onClick={close}
            aria-label="Close search"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F0E8DC] transition-colors"
          >
            <X className="h-5 w-5 text-[#666]" />
          </button>
        </div>

        {/* Search form */}
        <div className="px-5 pt-5">
          <p className="text-sm text-[#666] mb-3">Describe what you&apos;re looking for in plain language.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(query);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="e.g. yellow silk saree for a wedding under 3000"
              aria-label="Search products"
              className="flex-1 rounded-full border border-[#D4A96A] bg-white px-4 py-3 text-sm outline-none focus:border-[#8B1A1A] transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              aria-label="Search"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#8B1A1A] text-white hover:bg-[#6d1414] disabled:opacity-50 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Suggestion chips (hidden once there are results) */}
          {results === null && (
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => run(s)}
                  className="rounded-full border border-[#D4A96A]/60 px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#8B1A1A] hover:text-white hover:border-[#8B1A1A] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#F0E8DC] animate-pulse rounded-sm" />
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-sm text-[#8B1A1A] py-10">{error}</p>
          ) : results === null ? null : results.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#666] text-sm">No matches found. Try describing it differently.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#666] mb-3">
                {results.length} match{results.length !== 1 ? "es" : ""}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {results.map((p) => (
                  <div key={p.id} onClick={close}>
                    <ProductCard product={p} surface="search" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
