import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import NewsletterForm from "@/components/NewsletterForm";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import CartDrawer from "@/components/CartDrawer";
import { getProducts, getCollections } from "@/lib/shopify";
import { COLLECTIONS } from "@/data/collections";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  const [{ products: bestsellers }, collections] = await Promise.all([
    getProducts({ first: 8, sortKey: "BEST_SELLING" }).catch(() => ({ products: [], hasNextPage: false, endCursor: null })),
    getCollections().catch(() => []),
  ]);

  return (
    <>
      <HeroSection />
      <TrustStrip />

      {/* Collections Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl text-[#8B1A1A] text-center mb-10">
          Shop by Collection
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLLECTIONS.map((col) => {
            const shopifyCol = collections.find((c) => c.handle === col.handle);
            const image = shopifyCol?.image;
            return (
              <Link
                key={col.handle}
                href={`/collections/${col.handle}`}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <div className="relative h-28 w-28 rounded-full overflow-hidden bg-[#FDF0E0] border-2 border-transparent group-hover:border-[#8B1A1A] transition-colors">
                  {image ? (
                    <Image src={image.url} alt={col.title} fill className="object-cover" sizes="112px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">{col.emoji}</div>
                  )}
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">{col.title}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-[#FDF0E0] py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-3xl text-[#8B1A1A] mb-2">Bestsellers</h2>
            <p className="text-sm text-[#666] mb-8">Our most-loved sarees, chosen by customers across India.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/collections/all"
                className="inline-block border border-[#8B1A1A] text-[#8B1A1A] px-8 py-3 text-sm font-semibold rounded hover:bg-[#8B1A1A] hover:text-white transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl text-[#8B1A1A] text-center mb-10">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Kavitha R.", text: "The Kanjivaram I bought for my daughter's wedding was absolutely stunning. Pure quality!", stars: 5 },
            { name: "Meena Shetty", text: "Staff are so helpful and patient. They showed us 20+ sarees without any pressure. Loved the experience.", stars: 5 },
            { name: "Anitha Bhat", text: "Been buying from Thamanvi Silks for 10 years. Their collection is always fresh and the zari quality is unmatched.", stars: 5 },
          ].map(({ name, text, stars }) => (
            <div key={name} className="rounded-lg bg-[#FDF0E0] p-6">
              <div className="flex gap-0.5 mb-3" aria-label={`${stars} stars`}>
                {Array.from({ length: stars }).map((_, i) => <span key={i} className="text-[#B8860B]" aria-hidden="true">★</span>)}
              </div>
              <p className="text-sm text-[#444] italic mb-4">"{text}"</p>
              <p className="text-sm font-semibold text-[#1A1A1A]">— {name}</p>
            </div>
          ))}
        </div>
      </section>

      <NewsletterForm />
      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
