"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartContext as useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, setIsOpen } = useCart();
  const pathname = usePathname();
  const itemCount = cart?.totalQuantity ?? 0;

  // Only start transparent on homepage — all other pages get dark nav immediately
  const isHomepage = pathname === "/";
  const isDark = !isHomepage || scrolled;

  // Header links. "Shop All" jumps to the shop section on the homepage
  // (works from any page — Next resolves the hash after navigating home).
  const NAV_LINKS = [
    { label: "Shop All", href: "/#shop" },
    { label: "Wedding", href: "/?occasion=Wedding#shop" },
    { label: "Men", href: "/#mens" },
    { label: "About", href: "/about" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || !navRef.current) return;
    gsap.fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 });
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isDark
            ? "bg-[#0D0808]/95 backdrop-blur-sm shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo-512.png" alt="Thamanvi Silks" width={36} height={36} className="rounded-full" priority />
            <span className="font-display text-xl tracking-[0.2em] text-white group-hover:text-[#B8860B] transition-colors">
              THAMANVI
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs tracking-[0.15em] text-white/80 hover:text-[#B8860B] transition-colors uppercase"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Account — Shopify customer portal (desktop only; mobile uses bottom nav) */}
            <a
              href="https://shopify.com/82183880953/account"
              aria-label="My account"
              className="hidden md:block text-white/80 hover:text-[#B8860B] transition-colors"
            >
              <User className="h-5 w-5" />
            </a>
            <button
              onClick={() => setIsOpen(true)}
              aria-label={`Cart (${itemCount} items)`}
              className="relative text-white/80 hover:text-[#B8860B] transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#8B1A1A] text-[10px] font-bold text-white flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden text-white/80 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0D0808] border-t border-white/10 px-6 py-6 space-y-5">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm tracking-[0.15em] text-white/80 hover:text-[#B8860B] uppercase transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
