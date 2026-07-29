"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { ShopifyImage } from "@/lib/shopify";

/**
 * Bridge between the variant selector and the gallery. When a shopper picks a
 * colour/variant, the selector updates `colourImages` or `selectedImage` here
 * and the gallery immediately updates its active display.
 */
interface ProductMediaValue {
  colourImages: ShopifyImage[] | null;
  setColourImages: (images: ShopifyImage[] | null) => void;
  selectedImage: ShopifyImage | null;
  setSelectedImage: (image: ShopifyImage | null) => void;
}

const ProductMediaContext = createContext<ProductMediaValue | null>(null);

export function ProductMediaProvider({ children }: { children: ReactNode }) {
  const [colourImages, setColourImages] = useState<ShopifyImage[] | null>(null);
  const [selectedImage, setSelectedImage] = useState<ShopifyImage | null>(null);

  return (
    <ProductMediaContext.Provider
      value={{ colourImages, setColourImages, selectedImage, setSelectedImage }}
    >
      {children}
    </ProductMediaContext.Provider>
  );
}

export function useProductMedia() {
  return useContext(ProductMediaContext);
}
