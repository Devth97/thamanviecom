"use client";
import { useState, useEffect, useCallback } from "react";
import { ShopifyCart } from "@/lib/shopify";
import { apiFetch } from "@/lib/api-client";

const CART_ID_KEY = "thamanvi_cart_id";

export function useCart() {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCartId = localStorage.getItem(CART_ID_KEY);
    if (savedCartId) {
      apiFetch<ShopifyCart>(`/api/shopify/cart?cartId=${savedCartId}`)
        .then(setCart)
        .catch(() => localStorage.removeItem(CART_ID_KEY));
    }
  }, []);

  const addItem = useCallback(async (merchandiseId: string, quantity = 1) => {
    setLoading(true);
    try {
      let cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) {
        const created = await apiFetch<ShopifyCart>("/api/shopify/cart", {
          method: "POST",
          body: JSON.stringify({ action: "create" }),
        });
        cartId = created.id;
        localStorage.setItem(CART_ID_KEY, cartId);
      }
      const updated = await apiFetch<ShopifyCart>("/api/shopify/cart", {
        method: "POST",
        body: JSON.stringify({ action: "add", cartId, lines: [{ merchandiseId, quantity }] }),
      });
      setCart(updated);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;
    setLoading(true);
    try {
      const updated = await apiFetch<ShopifyCart>("/api/shopify/cart", {
        method: "POST",
        body: JSON.stringify({ action: "update", cartId, lineId, quantity }),
      });
      setCart(updated);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (lineId: string) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;
    setLoading(true);
    try {
      const updated = await apiFetch<ShopifyCart>("/api/shopify/cart", {
        method: "POST",
        body: JSON.stringify({ action: "remove", cartId, lineIds: [lineId] }),
      });
      setCart(updated);
    } finally {
      setLoading(false);
    }
  }, []);

  return { cart, loading, isOpen, setIsOpen, addItem, updateItem, removeItem };
}
