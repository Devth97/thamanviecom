"use client";
import { useState, useEffect, useCallback } from "react";

// Wishlist is stored locally on the device (no account needed). Persists the
// set of Shopify product IDs the shopper has saved.
const STORAGE_KEY = "thamanvi_wishlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, []);

  const toggle = useCallback(
    async (productId: string) => {
      const next = ids.includes(productId)
        ? ids.filter((id) => id !== productId)
        : [...ids, productId];
      persist(next);
    },
    [ids, persist]
  );

  const isWishlisted = useCallback((id: string) => ids.includes(id), [ids]);

  return { items: ids, toggle, isWishlisted };
}
