"use client";
import { useState, useEffect, useCallback } from "react";
import { WishlistItem } from "@/lib/supabase";
import { apiFetch } from "@/lib/api-client";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    apiFetch<WishlistItem[]>("/api/wishlist").then(setItems).catch(() => {});
  }, []);

  const toggle = useCallback(
    async (shopify_product_id: string) => {
      const exists = items.some((i) => i.shopify_product_id === shopify_product_id);
      if (exists) {
        await apiFetch(`/api/wishlist?productId=${shopify_product_id}`, { method: "DELETE" });
        setItems((prev) => prev.filter((i) => i.shopify_product_id !== shopify_product_id));
      } else {
        await apiFetch("/api/wishlist", {
          method: "POST",
          body: JSON.stringify({ shopify_product_id }),
        });
        setItems((prev) => [
          ...prev,
          {
            id: "",
            user_id: "",
            shopify_product_id,
            shopify_variant_id: null,
            created_at: "",
          },
        ]);
      }
    },
    [items]
  );

  const isWishlisted = useCallback(
    (id: string) => items.some((i) => i.shopify_product_id === id),
    [items]
  );

  return { items, toggle, isWishlisted };
}
