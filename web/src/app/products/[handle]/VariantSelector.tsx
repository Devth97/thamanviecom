"use client";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { ShopifyProduct, ShopifyVariant, formatPrice } from "@/lib/shopify";
import { useCartContext as useCart } from "@/contexts/CartContext";
import { useProductMedia } from "@/components/ProductMediaSync";

const COLOUR_OPTION = /colou?r/i;

/**
 * Variant selector + add-to-cart. Renders colour swatches (using each colour's
 * assigned photo) and size/other options as buttons, resolves the chosen
 * combination to a real variant, swaps the gallery image on colour change, and
 * adds the exact selected variant to the cart. For single-variant products
 * (e.g. one-of-a-kind sarees) it shows just the add-to-cart button.
 */
export default function VariantSelector({ product }: { product: ShopifyProduct }) {
  const { addItem, loading } = useCart();
  const media = useProductMedia();

  const variants = product.variants.nodes;
  // Ignore Shopify's implicit single "Title" option (unvaried products).
  const options = (product.options ?? []).filter(
    (o) => o.name.toLowerCase() !== "title" && o.optionValues.length > 0
  );

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = variants.find((v) => v.availableForSale) ?? variants[0];
    const init: Record<string, string> = {};
    first?.selectedOptions.forEach((o) => (init[o.name] = o.value));
    return init;
  });

  const selectedVariant: ShopifyVariant | undefined = useMemo(
    () =>
      variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)) ??
      variants[0],
    [variants, selected]
  );

  // Sync gallery image whenever the selected variant's photo changes.
  useEffect(() => {
    if (selectedVariant?.image?.url) media?.setActiveImageUrl(selectedVariant.image.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.image?.url]);

  const pick = (optionName: string, value: string) =>
    setSelected((s) => ({ ...s, [optionName]: value }));

  // A value is available if some in-stock variant has it alongside the other
  // currently-selected options.
  const valueAvailable = (optionName: string, value: string) =>
    variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) =>
          o.name === optionName ? o.value === value : selected[o.name] === o.value
        )
    );

  const inStock = selectedVariant?.availableForSale ?? false;

  return (
    <div className="space-y-4">
      {options.map((opt) => {
        const isColour = COLOUR_OPTION.test(opt.name);
        return (
          <div key={opt.name}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-[#1A1A1A]">{opt.name}:</span>
              <span className="text-sm text-[#666]">{selected[opt.name]}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {opt.optionValues.map(({ name: value }) => {
                const active = selected[opt.name] === value;
                const avail = valueAvailable(opt.name, value);

                if (isColour) {
                  const swatch = variants.find(
                    (v) =>
                      v.selectedOptions.some((o) => o.name === opt.name && o.value === value) &&
                      v.image
                  )?.image;
                  return (
                    <button
                      key={value}
                      onClick={() => pick(opt.name, value)}
                      disabled={!avail}
                      aria-label={value}
                      aria-pressed={active}
                      title={avail ? value : `${value} — sold out`}
                      className={`relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all ${
                        active ? "border-[#8B1A1A] ring-2 ring-[#8B1A1A]/30" : "border-[#E0D8CF]"
                      } ${!avail ? "opacity-40" : "hover:border-[#8B1A1A]"}`}
                    >
                      {swatch ? (
                        <Image src={swatch.url} alt={value} fill className="object-cover" sizes="48px" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-[#F5EDE0] text-[9px] text-[#666] px-0.5 text-center leading-tight">
                          {value}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={value}
                    onClick={() => pick(opt.name, value)}
                    disabled={!avail}
                    aria-pressed={active}
                    className={`min-w-[44px] px-3 py-2 text-sm rounded border transition-colors ${
                      active
                        ? "border-[#8B1A1A] bg-[#8B1A1A] text-white"
                        : "border-[#D4A96A] text-[#1A1A1A] hover:border-[#8B1A1A]"
                    } ${!avail ? "opacity-40 line-through" : ""}`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected-variant price (shown only when variants differ in price) */}
      {selectedVariant &&
        product.variants.nodes.some(
          (v) => v.price.amount !== product.variants.nodes[0].price.amount
        ) && (
          <p className="text-lg font-bold text-[#8B1A1A]">{formatPrice(selectedVariant.price)}</p>
        )}

      <button
        onClick={() => selectedVariant && addItem(selectedVariant.id)}
        disabled={loading || !inStock || !selectedVariant}
        className="w-full rounded bg-[#8B1A1A] py-3.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#6d1414] transition-colors"
      >
        {loading ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
}
