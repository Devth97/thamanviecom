"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartContext as useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/shopify";

export default function CartDrawer() {
  const { cart, loading, isOpen, setIsOpen, updateItem, removeItem } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!drawerRef.current || !overlayRef.current) return;
    if (isOpen) {
      gsap.set(drawerRef.current, { x: "100%" });
      gsap.to(drawerRef.current, { x: "0%", duration: 0.35, ease: "power2.out" });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, pointerEvents: "auto" });
    } else {
      if (!mq.matches) {
        gsap.to(drawerRef.current, { x: "100%", duration: 0.3, ease: "power2.in" });
      }
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, pointerEvents: "none" });
    }
  }, [isOpen]);

  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <>
      <div
        ref={overlayRef}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-40 bg-black/40 opacity-0 pointer-events-none"
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#FAF6F0] shadow-2xl flex flex-col translate-x-full"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-[#D4A96A] px-6 py-4">
          <h2 className="font-display text-xl text-[#8B1A1A]">
            Your Cart{" "}
            {itemCount > 0 && (
              <span className="text-sm font-sans text-[#666]">({itemCount} items)</span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
            className="rounded-full p-1 hover:bg-[#F5EDE0] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-4">
          {!cart || itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="h-12 w-12 text-[#D4A96A]" aria-hidden="true" />
              <p className="text-[#666]">Your cart is empty.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-[#8B1A1A] underline underline-offset-2"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.lines.nodes.map((line) => (
              <div key={line.id} className="flex gap-4 items-start">
                <div className="relative h-20 w-16 shrink-0 rounded overflow-hidden bg-[#F5EDE0]">
                  {line.merchandise.product.images.nodes[0] && (
                    <Image
                      src={line.merchandise.product.images.nodes[0].url}
                      alt={
                        line.merchandise.product.images.nodes[0].altText ??
                        line.merchandise.product.title
                      }
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {line.merchandise.product.title}
                  </p>
                  <p className="text-xs text-[#666]">{line.merchandise.title}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => updateItem(line.id, line.quantity - 1)}
                      disabled={loading || line.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="rounded-full border border-[#D4A96A] p-0.5 disabled:opacity-40 hover:bg-[#F5EDE0] transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm w-5 text-center">{line.quantity}</span>
                    <button
                      onClick={() => updateItem(line.id, line.quantity + 1)}
                      disabled={loading}
                      aria-label="Increase quantity"
                      className="rounded-full border border-[#D4A96A] p-0.5 disabled:opacity-40 hover:bg-[#F5EDE0] transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#8B1A1A]">
                    {formatPrice(line.cost.totalAmount)}
                  </p>
                  <button
                    onClick={() => removeItem(line.id)}
                    className="mt-1 text-xs text-[#999] hover:text-[#C62828] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart && itemCount > 0 && (
          <div className="border-t border-[#D4A96A] px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Subtotal</span>
              <span className="font-semibold">{formatPrice(cart.cost.subtotalAmount)}</span>
            </div>
            <p className="text-xs text-[#666]">Shipping calculated at checkout</p>
            <a
              href={cart.checkoutUrl}
              className="block w-full rounded bg-[#8B1A1A] py-3 text-center text-sm font-semibold text-white hover:bg-[#6d1414] transition-colors"
            >
              Proceed to Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
