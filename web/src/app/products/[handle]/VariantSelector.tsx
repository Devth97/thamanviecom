"use client";
import { useMemo, useState, useEffect } from "react";
import { Check } from "lucide-react";
import { ShopifyProduct, ShopifyVariant, formatPrice } from "@/lib/shopify";
import { useCartContext as useCart } from "@/contexts/CartContext";
import { useProductMedia } from "@/components/ProductMediaSync";

const COLOUR_OPTION = /colou?r/i;

/** Common Indian garment/saree colours → hex/CSS, for rendering colour dots. */
const COLOUR_HEX: Record<string, string> = {
  white: "#FFFFFF",
  "off white": "#F3EFE7",
  offwhite: "#F3EFE7",
  cream: "#F5EFE0",
  ivory: "#FFFFF0",
  beige: "#E8D9B5",
  black: "#141414",
  grey: "#808080",
  gray: "#808080",
  silver: "#C0C0C0",
  charcoal: "#36454F",
  red: "#C0392B",
  maroon: "#7B241C",
  wine: "#5E2129",
  rust: "#B7410E",
  pink: "#E91E8C",
  "rani pink": "#E30B5C",
  "baby pink": "#F4B6C2",
  magenta: "#C2185B",
  "hot pink": "#FF4FA3",
  rose: "#E75480",
  peach: "#FFCBA4",
  orange: "#E67E22",
  yellow: "#F4C430",
  mustard: "#D4A017",
  gold: "#C9A227",
  golden: "#C9A227",
  turmeric: "#E4A11B",
  green: "#2E7D32",
  "pista green": "#B7C77E",
  pista: "#B7C77E",
  "parrot green": "#5BBF1F",
  "bottle green": "#0B3D2E",
  "dark green": "#14532D",
  mehendi: "#8A9A2E",
  mehndi: "#8A9A2E",
  olive: "#6B7A2E",
  mint: "#B7E4C7",
  teal: "#0D9488",
  blue: "#2563EB",
  "navy blue": "#1E3A5F",
  navy: "#1E3A5F",
  "sky blue": "#5FB4E5",
  "royal blue": "#1E40AF",
  "powder blue": "#B0E0E6",
  purple: "#7B2D8E",
  lavender: "#B57EDC",
  violet: "#7C3AED",
  "slate blue": "#5A6E8C",
  brown: "#6B4226",
  coffee: "#4B3621",
  tan: "#D2B48C",
};

function isLightHex(hex: string): boolean {
  if (!hex || typeof hex !== "string") return false;
  if (!hex.startsWith("#")) return hex === "#FFFFFF" || hex.toLowerCase() === "white";
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return false;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255,
    g = (int >> 8) & 255,
    b = int & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 186;
}

function colourStyle(name: string): { background: string; isLight: boolean } {
  const n = name.toLowerCase().trim();

  // Explicit dual colors e.g. "Black & White", "Black and White", "Black/White", "White & Black"
  if (
    (n.includes("black") && n.includes("white")) ||
    n === "black/white" ||
    n === "white/black"
  ) {
    return {
      background: "linear-gradient(135deg, #141414 50%, #FFFFFF 50%)",
      isLight: true,
    };
  }

  if (COLOUR_HEX[n]) {
    const hex = COLOUR_HEX[n];
    return { background: hex, isLight: isLightHex(hex) };
  }

  // Handle multi-word strings e.g. "Black and Gold", "Red & White"
  const words = n.split(/[\s/&-]+/);
  if (words.length > 1) {
    const hexes = words.map((w) => COLOUR_HEX[w]).filter(Boolean);
    if (hexes.length >= 2) {
      return {
        background: `linear-gradient(135deg, ${hexes[0]} 50%, ${hexes[1]} 50%)`,
        isLight: isLightHex(hexes[0]),
      };
    }
    if (hexes.length === 1) {
      return { background: hexes[0], isLight: isLightHex(hexes[0]) };
    }
  }

  const last = words.pop() ?? n;
  const hex = COLOUR_HEX[last] ?? last;
  return { background: hex, isLight: isLightHex(hex) };
}

/**
 * Variant selector + add-to-cart. Colours render as pure colour swatches,
 * other options (size…) as text buttons. Picking a colour filters the gallery and
 * switches the main image to the selected variant/colour image.
 */
export default function VariantSelector({ product }: { product: ShopifyProduct }) {
  const { addItem, loading } = useCart();
  const media = useProductMedia();

  const variants = product.variants.nodes;
  const options = (product.options ?? []).filter(
    (o) => o.name.toLowerCase() !== "title" && o.optionValues.length > 0
  );
  const colourOption = options.find((o) => COLOUR_OPTION.test(o.name));

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

  // Images for the selected colour: prefer alt-text match, then per-variant image
  const colourImages = useMemo(() => {
    if (!colourOption) return null;
    const colour = selected[colourOption.name]?.toLowerCase().trim();
    if (!colour) return null;
    const all = product.images.nodes;

    const byAlt = all.filter((im) => (im.altText ?? "").toLowerCase().includes(colour));
    if (byAlt.length > 0) return byAlt;

    const variantUrls = new Set(
      variants
        .filter(
          (v) =>
            v.selectedOptions.some(
              (o) => o.name === colourOption.name && o.value.toLowerCase().trim() === colour
            ) && v.image
        )
        .map((v) => v.image!.url)
    );
    const byVariant = all.filter((im) => variantUrls.has(im.url));
    return byVariant.length > 0 ? byVariant : null;
  }, [colourOption, selected, variants, product.images.nodes]);

  useEffect(() => {
    media?.setColourImages(colourImages);
    if (selectedVariant?.image) {
      media?.setSelectedImage(selectedVariant.image);
    } else if (colourOption && selected[colourOption.name]) {
      const colourName = selected[colourOption.name].toLowerCase().trim();
      const match = product.images.nodes.find(
        (im) =>
          (im.altText ?? "").toLowerCase().includes(colourName) ||
          im.url.toLowerCase().includes(colourName)
      );
      if (match) media?.setSelectedImage(match);
    }
  }, [colourImages, selectedVariant, selected, colourOption, product.images.nodes]);

  const pick = (optionName: string, value: string) =>
    setSelected((s) => ({ ...s, [optionName]: value }));

  const valueAvailable = (optionName: string, value: string) =>
    variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) =>
          o.name === optionName ? o.value === value : selected[o.name] === o.value
        )
    );

  const inStock = selectedVariant?.availableForSale ?? false;
  const pricesVary = variants.some((v) => v.price.amount !== variants[0].price.amount);

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
                  const styleObj = colourStyle(value);
                  return (
                    <button
                      key={value}
                      onClick={() => pick(opt.name, value)}
                      disabled={!avail}
                      aria-label={value}
                      aria-pressed={active}
                      title={avail ? value : `${value} — sold out`}
                      style={{ background: styleObj.background }}
                      className={`relative h-9 w-9 rounded-full border-2 shadow-sm transition-all ${
                        active
                          ? "border-[#8B1A1A] ring-2 ring-[#8B1A1A]/30 scale-105"
                          : "border-[#D0C7BA]"
                      } ${!avail ? "opacity-40" : "hover:border-[#8B1A1A]"}`}
                    >
                      {active && (
                        <Check
                          className={`absolute inset-0 m-auto h-4 w-4 ${
                            styleObj.isLight ? "text-[#1A1A1A]" : "text-white"
                          }`}
                        />
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

      {pricesVary && selectedVariant && (
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
