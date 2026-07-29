"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Lightweight bridge between the variant selector and the gallery: when a
 * shopper picks a colour, the selector sets that variant's image URL here and
 * the gallery switches its main image to it. Consumers get `null` outside a
 * provider, so the gallery still works on pages without a variant selector.
 */
interface ProductMediaValue {
  activeImageUrl: string | null;
  setActiveImageUrl: (url: string | null) => void;
}

const ProductMediaContext = createContext<ProductMediaValue | null>(null);

export function ProductMediaProvider({ children }: { children: ReactNode }) {
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  return (
    <ProductMediaContext.Provider value={{ activeImageUrl, setActiveImageUrl }}>
      {children}
    </ProductMediaContext.Provider>
  );
}

export function useProductMedia() {
  return useContext(ProductMediaContext);
}
