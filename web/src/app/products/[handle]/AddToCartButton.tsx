"use client";
import { useState } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartContext as useCart } from "@/contexts/CartContext";

export default function AddToCartButton({ product }: { product: ShopifyProduct }) {
  const { addItem, loading } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.nodes[0]?.id ?? ""
  );
  const selectedVariant = product.variants.nodes.find((v) => v.id === selectedVariantId);
  const inStock = selectedVariant?.availableForSale ?? false;

  return (
    <div className="space-y-3">
      {product.variants.nodes.length > 1 && (
        <select
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
          className="w-full rounded border border-[#D4A96A] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8B1A1A]"
          aria-label="Select variant"
        >
          {product.variants.nodes.map((v) => (
            <option key={v.id} value={v.id} disabled={!v.availableForSale}>
              {v.title}{!v.availableForSale ? " — Sold Out" : ""}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={() => addItem(selectedVariantId)}
        disabled={loading || !inStock || !selectedVariantId}
        className="w-full rounded bg-[#8B1A1A] py-3.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#6d1414] transition-colors"
      >
        {loading ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
}
