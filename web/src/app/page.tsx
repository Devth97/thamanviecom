import HeroSection from "@/components/HeroSection";
import MarqueeStrip from "@/components/MarqueeStrip";
import NewsletterForm from "@/components/NewsletterForm";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import CartDrawer from "@/components/CartDrawer";
import CollectionsShowcase from "@/components/CollectionsShowcase";
import HeritageBanner from "@/components/HeritageBanner";
import TestimonialsSection from "@/components/TestimonialsSection";
import HomeShopSection from "@/components/HomeShopSection";
import { getProducts } from "@/lib/shopify";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const { products: allProducts } = await getProducts({ first: 48, sortKey: "BEST_SELLING" }).catch(() => ({ products: [], hasNextPage: false, endCursor: null }));

  return (
    <>
      <HeroSection />
      <MarqueeStrip />

      {/* Category quick-links */}
      <div className="bg-[#FAF6F0] border-b border-[#E8DDD0]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { label: "All Sarees", href: "/collections/all" },
              { label: "Kanjivaram", href: "/collections/kanjivaram-silk" },
              { label: "Banarasi", href: "/collections/banarasi-silk" },
              { label: "Mysore Silk", href: "/collections/mysore-silk" },
              { label: "Wedding", href: "/collections/wedding-silk" },
              { label: "Cotton", href: "/collections/casual-cotton" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="shrink-0 px-4 py-1.5 text-xs tracking-[0.1em] uppercase border border-[#D4A96A]/50 text-[#1A1A1A] hover:bg-[#8B1A1A] hover:text-white hover:border-[#8B1A1A] transition-colors rounded-full whitespace-nowrap"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <CollectionsShowcase />

      {/* Inline shop — all products with filters, no page navigation needed */}
      <HomeShopSection initial={allProducts} />

      <HeritageBanner />

      {/* Feature split — saree unfurling video */}
      <section className="overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[80vh]">
          {/* Left — video */}
          <div className="relative bg-[#0D0808] min-h-[50vh] md:min-h-[80vh]">
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" aria-hidden="true">
              <source src="/videos/saree-unfurling.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0808]/30" />
          </div>
          {/* Right — text on warm dark background */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-16 md:py-20 bg-[#1C0A06]">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#B8860B]" />
              <span className="text-[#B8860B] text-xs tracking-[0.25em] uppercase">The Signature Piece</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-white italic leading-tight mb-6">
              Pure Kanjivaram,<br />Woven in Gold
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-8 max-w-sm">
              Each Kanjivaram saree at Thamanvi is sourced directly from master weavers in Kanchipuram. Pure mulberry silk, interlocked zari, no compromises.
            </p>
            <Link href="/collections/kanjivaram-silk" className="inline-flex items-center gap-4 group self-start">
              <span className="border border-[#B8860B] text-[#B8860B] text-sm tracking-[0.15em] uppercase px-8 py-4 hover:bg-[#B8860B] hover:text-[#0D0808] transition-colors duration-300">
                Explore Kanjivaram
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Heritage video 1 — Hands weaving */}
      <section className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" aria-hidden="true">
          <source src="/videos/hands-weaving.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0808]/20 via-transparent to-[#0D0808]/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center px-4">
          <span className="text-[#B8860B] text-xs tracking-[0.3em] uppercase mb-2">The Craft</span>
          <h3 className="font-display text-3xl md:text-5xl text-white italic">Woven by Master Hands</h3>
        </div>
      </section>

      {/* Heritage video 2 — Gold zari */}
      <section className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" aria-hidden="true">
          <source src="/videos/gold-zari.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0808]/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-center pl-8 md:pl-20">
          <span className="text-[#B8860B] text-xs tracking-[0.3em] uppercase mb-2">Pure Gold Zari</span>
          <h3 className="font-display text-3xl md:text-5xl text-white italic max-w-xs">Thread of Liquid Gold</h3>
        </div>
      </section>

      {/* Heritage video 3 — Silk reeling */}
      <section className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" aria-hidden="true">
          <source src="/videos/silk-reeling.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0808]/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-center">
          <span className="text-[#B8860B] text-xs tracking-[0.3em] uppercase mb-2 block">The Source</span>
          <h3 className="font-display text-3xl md:text-5xl text-white italic">Pure Mulberry Silk</h3>
          <p className="text-white/60 text-sm mt-2">Sourced from Karnataka&apos;s finest silk farms</p>
        </div>
      </section>

      <TestimonialsSection />
      <NewsletterForm />
      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
