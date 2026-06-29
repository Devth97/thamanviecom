import HeroSection from "@/components/HeroSection";
import MarqueeStrip from "@/components/MarqueeStrip";
import NewsletterForm from "@/components/NewsletterForm";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import CartDrawer from "@/components/CartDrawer";
import CollectionsShowcase from "@/components/CollectionsShowcase";
import HeritageBanner from "@/components/HeritageBanner";
import TestimonialsSection from "@/components/TestimonialsSection";
import ScrollFrameAnimation from "@/components/ScrollFrameAnimation";
import { getProducts } from "@/lib/shopify";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  const { products: bestsellers } = await getProducts({ first: 4, sortKey: "BEST_SELLING" }).catch(() => ({ products: [], hasNextPage: false, endCursor: null }));

  return (
    <>
      <HeroSection />
      <MarqueeStrip />
      <CollectionsShowcase />
      <HeritageBanner />
      <ScrollFrameAnimation />

      {/* Bestsellers */}
      <section className="bg-[#FDF6EE] py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#B8860B]" />
                <span className="text-[#B8860B] text-xs tracking-[0.25em] uppercase">Curated for you</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-[#0D0808]">Bestsellers</h2>
            </div>
            <Link href="/collections/kanjivaram-silk" className="hidden md:inline-flex items-center gap-2 text-sm tracking-[0.1em] text-[#8B1A1A] uppercase hover:text-[#B8860B] transition-colors group">
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          {bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            /* Elegant placeholder grid when no Shopify products yet */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {["Kanjivaram Crimson", "Mysore Blue", "Banarasi Gold", "Wedding Red"].map((name, i) => (
                <div key={name} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-[#FDF0E0] to-[#E8D5B7] overflow-hidden border border-[#D4A96A]/30 mb-3">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 border border-[#B8860B]/40 rounded-full flex items-center justify-center mb-3">
                        <span className="text-[#B8860B] text-xs font-display italic">0{i + 1}</span>
                      </div>
                      <span className="text-[#B8860B]/60 text-xs tracking-[0.2em] uppercase">Image Placeholder</span>
                      <span className="text-[#1A1A1A]/40 text-[10px] mt-1">Upload via Shopify</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0808]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-sm font-medium text-[#1A1A1A]">{name} Saree</h3>
                  <p className="text-sm text-[#8B1A1A] font-semibold mt-0.5">From ₹8,500</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-10 text-center md:hidden">
            <Link href="/collections/kanjivaram-silk" className="inline-flex items-center gap-2 text-sm tracking-[0.1em] text-[#8B1A1A] uppercase border border-[#8B1A1A] px-6 py-3 hover:bg-[#8B1A1A] hover:text-white transition-colors">
              View All Collections →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature split */}
      <section className="bg-[#0D0808] py-0 overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[70vh]">
          <div className="flex flex-col justify-center px-8 md:px-16 py-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#B8860B]" />
              <span className="text-[#B8860B] text-xs tracking-[0.25em] uppercase">The Signature Piece</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-white italic leading-tight mb-6">
              Pure Kanjivaram,<br />Woven in Gold
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8 max-w-sm">
              Each Kanjivaram saree at Thamanvi is sourced directly from master weavers in Kanchipuram. Pure mulberry silk, interlocked zari, no compromises.
            </p>
            <Link
              href="/collections/kanjivaram-silk"
              className="inline-flex items-center gap-4 group self-start"
            >
              <span className="border border-[#B8860B] text-[#B8860B] text-sm tracking-[0.15em] uppercase px-8 py-4 hover:bg-[#B8860B] hover:text-[#0D0808] transition-colors duration-300">
                Explore Kanjivaram
              </span>
            </Link>
          </div>
          {/* Image placeholder */}
          <div className="relative bg-gradient-to-br from-[#1A0A0A] to-[#2A1010] flex items-center justify-center min-h-[400px]">
            <div className="absolute inset-8 border border-[#B8860B]/20" />
            <div className="absolute inset-12 border border-[#B8860B]/10" />
            <div className="text-center z-10">
              <div className="w-20 h-20 border border-[#B8860B]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#B8860B]/50 text-2xl font-display italic">✦</span>
              </div>
              <p className="text-[#B8860B]/40 text-xs tracking-[0.25em] uppercase">Hero Image</p>
              <p className="text-white/20 text-[10px] mt-1">Upload silk saree photograph</p>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <NewsletterForm />
      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
