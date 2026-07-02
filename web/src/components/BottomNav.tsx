"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useCartContext } from "@/contexts/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { setIsOpen, cart } = useCartContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8DDD0] shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch">
          {/* Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-medium tracking-wide transition-colors ${
              pathname === "/" ? "text-[#B8860B]" : "text-[#555]"
            }`}
          >
            <Menu className="h-5 w-5" />
            <span>MENU</span>
          </button>

          {/* Cart (center, prominent) */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-medium tracking-wide text-[#555] relative"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#8B1A1A] text-[9px] font-bold text-white flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span>CART</span>
          </button>

          {/* Account */}
          <Link
            href="/account/orders"
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-medium tracking-wide transition-colors ${
              pathname.startsWith("/account") || pathname.startsWith("/sign") ? "text-[#B8860B]" : "text-[#555]"
            }`}
          >
            <User className="h-5 w-5" />
            <span>ACCOUNT</span>
          </Link>
        </div>
      </nav>

      {/* Mobile slide-up menu panel */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}>
            <div className="w-10 h-1 rounded-full bg-[#E8DDD0] mx-auto mb-6" />
            <h3 className="font-display text-lg text-[#0D0808] mb-5">Explore</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "All Sarees", href: "/#shop", emoji: "🧣" },
                { label: "Kanjivaram", href: "/?type=Kanjivaram#shop", emoji: "✨" },
                { label: "Banarasi Silk", href: "/?type=Banarasi#shop", emoji: "👑" },
                { label: "Mysore Silk", href: "/?type=Mysore Silk#shop", emoji: "💚" },
                { label: "Bridal", href: "/?occasion=Wedding#shop", emoji: "👰" },
                { label: "Cotton Weaves", href: "/?fabric=Cotton#shop", emoji: "🌸" },
              ].map(({ label, href, emoji }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 bg-[#FAF6F0] rounded-xl px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5EDE0] transition-colors"
                >
                  <span className="text-xl">{emoji}</span>
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-[#E8DDD0] flex gap-3">
              <a
                href="https://wa.me/919535779597"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-semibold py-3 rounded-xl"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.534 5.867L.057 23.63a.5.5 0 0 0 .609.63l5.939-1.56A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 0 1-5.186-1.452l-.371-.22-3.525.927.934-3.432-.241-.383A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp Us
              </a>
              <Link
                href="/account/orders"
                onClick={() => setMenuOpen(false)}
                className="flex-1 flex items-center justify-center bg-[#0D0808] text-white text-sm font-semibold py-3 rounded-xl"
              >
                My Orders
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
