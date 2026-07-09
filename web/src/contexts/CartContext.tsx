"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ShopifyCart } from "@/lib/shopify";
import { apiFetch } from "@/lib/api-client";

const CART_ID_KEY = "thamanvi_cart_id";

interface CartContextValue {
  cart: ShopifyCart | null;
  loading: boolean;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Rehydrate cart from localStorage on mount
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
    } catch (err) {
      console.error("Add to cart failed:", err);
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
    } catch (err) {
      console.error("Update cart failed:", err);
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
    } catch (err) {
      console.error("Remove from cart failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, isOpen, setIsOpen, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used inside CartProvider");
  return ctx;
}
