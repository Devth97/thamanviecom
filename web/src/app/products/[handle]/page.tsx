import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProductRecommendations, getProducts, formatPrice, getMetafield, getProductVideoUrl } from "@/lib/shopify";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import CartDrawer from "@/components/CartDrawer";
import WishlistButton from "@/components/WishlistButton";
import SizeGuideModal from "@/components/SizeGuideModal";
import PincodeChecker from "@/components/PincodeChecker";
import NotifyMe from "@/components/NotifyMe";
import ProductReviews from "@/components/ProductReviews";
import AddToCartButton from "./AddToCartButton";
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from "@/data/googleReviews";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle).catch(() => null);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 155),
    openGraph: {
      images: product.images.nodes[0] ? [{ url: product.images.nodes[0].url }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle).catch(() => null);
  if (!product) notFound();

  const [recommendations, collectionProducts, allStoreProducts] = await Promise.all([
    getProductRecommendations(product.id).catch(() => []),
    product.collections.nodes[0]
      ? getProducts({ collection: product.collections.nodes[0].handle, first: 8 })
          .then(r => r.products.filter(p => p.id !== product.id).slice(0, 4))
          .catch(() => [])
      : Promise.resolve([]),
    // Always fetch store products as final fallback
    getProducts({ first: 8, sortKey: "BEST_SELLING" })
      .then(r => r.products.filter(p => p.id !== product.id).slice(0, 4))
      .catch(() => []),
  ]);

  // Priority: AI recommendations → same collection → all store products
  const relatedProducts =
    recommendations.length > 0 ? recommendations.slice(0, 4) :
    collectionProducts.length > 0 ? collectionProducts :
    allStoreProducts;

  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.compareAtPriceRange.minVariantPrice;
  const hasDiscount = Number(comparePrice.amount) > Number(price.amount);

  const metaRows = [
    ["Fabric", getMetafield(product, "fabric_type")],
    ["Weave Type", getMetafield(product, "weave_type")],
    ["Zari Purity", getMetafield(product, "zari_purity")],
    ["Blouse Piece", getMetafield(product, "blouse_piece") === "true" ? "Included" : null],
    ["Region of Origin", getMetafield(product, "region_of_origin")],
    ["Wash Care", getMetafield(product, "wash_care")],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  const videoUrl = getProductVideoUrl(product);
  const whatsappNumber = "919535779597";
  const whatsappMsg = `Hi! I'm interested in the ${product.title} on your website. Can you share more details?`;

  return (
    <>
      {/* Top nav bar below fixed navbar — back button + breadcrumb */}
      <div className="border-b border-[#E8DDD0] bg-[#FAF6F0] pt-16">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Back button — frontpage collection always goes to home */}
          {(() => {
            const col = product.collections.nodes[0];
            const isFrontpage = !col || col.handle === "frontpage";
            const backHref = isFrontpage ? "/" : `/collections/${col.handle}`;
            const backLabel = isFrontpage ? "Home" : col.title;
            return (
              <a href={backHref} className="inline-flex items-center gap-2 text-xs text-[#666] hover:text-[#8B1A1A] transition-colors group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Back to {backLabel}</span>
              </a>
            );
          })()}
          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center text-xs text-[#999]" aria-label="Breadcrumb">
            <a href="/" className="hover:text-[#8B1A1A] transition-colors">Home</a>
            {product.collections.nodes[0] && product.collections.nodes[0].handle !== "frontpage" && (
              <>
                <span className="mx-2">›</span>
                <a href={`/collections/${product.collections.nodes[0].handle}`} className="hover:text-[#8B1A1A] transition-colors">
                  {product.collections.nodes[0].title}
                </a>
              </>
            )}
            <span className="mx-2">›</span>
            <span className="text-[#1A1A1A] truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 pb-4">

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images.nodes} />
            {videoUrl && (
              <video src={videoUrl} controls className="mt-4 w-full rounded" aria-label="Product video" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-2xl md:text-3xl text-[#1A1A1A] leading-snug">
                {product.title}
              </h1>
              <WishlistButton productId={product.id} className="shrink-0 mt-1" />
            </div>

            {/* Price + stock badge */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[#8B1A1A]">{formatPrice(price)}</span>
                {hasDiscount && (
                  <span className="text-base text-[#999] line-through">{formatPrice(comparePrice)}</span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-bold text-white bg-[#8B1A1A] px-2 py-0.5 rounded">
                    {Math.round((1 - Number(price.amount) / Number(comparePrice.amount)) * 100)}% OFF
                  </span>
                )}
              </div>
              {/* Stock status */}
              {(() => {
                const totalQty = product.variants.nodes.reduce((s, v) => s + (v.quantityAvailable ?? 0), 0);
                const inStock = product.variants.nodes.some(v => v.availableForSale);
                if (!inStock) return (
                  <p className="mt-1.5 text-xs font-semibold text-[#C62828] flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#C62828]" />
                    Currently Out of Stock
                  </p>
                );
                if (totalQty > 0 && totalQty <= 3) return (
                  <p className="mt-1.5 text-xs font-semibold text-[#C62828] flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#C62828] animate-pulse" />
                    Only {totalQty} left in stock — order soon!
                  </p>
                );
                if (totalQty > 3 && totalQty <= 7) return (
                  <p className="mt-1.5 text-xs font-semibold text-[#E65100] flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#E65100]" />
                    Selling fast — {totalQty} pieces left
                  </p>
                );
                return (
                  <p className="mt-1.5 text-xs font-semibold text-[#2E7D32] flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#2E7D32]" />
                    In Stock · Ready to Ship
                  </p>
                );
              })()}
            </div>

            {/* Size guide link */}
            <SizeGuideModal />

            {/* Add to cart or Notify Me */}
            {product.variants.nodes.some(v => v.availableForSale)
              ? <AddToCartButton product={product} />
              : <NotifyMe productTitle={product.title} />
            }

            {/* WhatsApp enquiry + Share row */}
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded border-2 border-[#25D366] py-2.5 text-sm font-semibold text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.534 5.867L.057 23.63a.5.5 0 0 0 .609.63l5.939-1.56A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 0 1-5.186-1.452l-.371-.22-3.525.927.934-3.432-.241-.383A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Enquire on WhatsApp
              </a>
              {/* WhatsApp Share */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this saree at Thamanvi Silks: ${product.title}\nhttps://thamanviecom.vercel.app/products/${product.handle}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on WhatsApp"
                className="flex items-center justify-center w-11 rounded border-2 border-[#E8DDD0] hover:border-[#25D366] hover:bg-[#25D366]/5 transition-colors"
                aria-label="Share this saree on WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.534 5.867L.057 23.63a.5.5 0 0 0 .609.63l5.939-1.56A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 0 1-5.186-1.452l-.371-.22-3.525.927.934-3.432-.241-.383A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              </a>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8DDD0]">
              {[
                { icon: "🚚", label: "Free Shipping", sub: "Pan India" },
                { icon: "📦", label: "Open Box Return", sub: "On delivery only" },
                { icon: "✓", label: "100% Authentic", sub: "Pure Silk Certified" },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center py-3 rounded border border-[#E8DDD0]">
                  <span className="text-lg mb-1">{icon}</span>
                  <span className="text-xs font-semibold text-[#1A1A1A]">{label}</span>
                  <span className="text-[10px] text-[#666]">{sub}</span>
                </div>
              ))}
            </div>

            {/* Pincode checker */}
            <PincodeChecker />

            {/* Product details table */}
            {metaRows.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm text-[#1A1A1A] mb-2">Product Details</h2>
                <table className="w-full text-sm">
                  <tbody>
                    {metaRows.map(([label, value]) => (
                      <tr key={label} className="border-b border-[#F0E0C8]">
                        <td className="py-2 pr-4 text-[#666] font-medium w-36">{label}</td>
                        <td className="py-2 text-[#1A1A1A]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Description */}
            {product.descriptionHtml && (
              <div
                className="text-sm text-[#444] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )}
          </div>
        </div>

      </div>

      {/* ── People Also Bought ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-[#FAF6F0] border-t border-[#E8DDD0] pt-6 md:pt-8 pb-10 md:pb-12">
          <div className="mx-auto max-w-6xl px-4">
            {/* Centered heading */}
            <div className="text-center mb-5 md:mb-6">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-px w-12 bg-[#B8860B]" />
                <span className="text-[#B8860B] text-[10px] tracking-[0.3em] uppercase">Customers Love</span>
                <div className="h-px w-12 bg-[#B8860B]" />
              </div>
              <h2 className="font-display text-2xl md:text-4xl text-[#0D0808]">Similar Products</h2>
            </div>

            {/* Desktop: 4-col grid | Mobile: 2-col grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* View All CTA */}
            <div className="text-center mt-8">
              <a
                href={relatedProducts[0]?.collections?.nodes?.[0]?.handle
                  ? `/collections/${relatedProducts[0].collections.nodes[0].handle}`
                  : "/"}
                className="inline-flex items-center gap-2 border border-[#8B1A1A] text-[#8B1A1A] text-sm tracking-[0.1em] uppercase px-8 py-3 hover:bg-[#8B1A1A] hover:text-white transition-colors duration-300 group"
              >
                View Full Collection
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* JSON-LD Product schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            description: product.description,
            image: product.images.nodes[0]?.url,
            offers: {
              "@type": "Offer",
              price: Number(price.amount),
              priceCurrency: price.currencyCode,
              availability: product.variants.nodes.some((v) => v.availableForSale)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: GOOGLE_RATING,
              reviewCount: GOOGLE_REVIEW_COUNT,
            },
          }),
        }}
      />

      {/* JSON-LD Breadcrumb schema — matches the visible breadcrumb nav above */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://thamanvi.com/" },
              ...(product.collections.nodes[0] && product.collections.nodes[0].handle !== "frontpage"
                ? [{
                    "@type": "ListItem",
                    position: 2,
                    name: product.collections.nodes[0].title,
                    item: `https://thamanvi.com/collections/${product.collections.nodes[0].handle}`,
                  }]
                : []),
              {
                "@type": "ListItem",
                position: product.collections.nodes[0] && product.collections.nodes[0].handle !== "frontpage" ? 3 : 2,
                name: product.title,
                item: `https://thamanvi.com/products/${product.handle}`,
              },
            ],
          }),
        }}
      />

      {/* Reviews (real Google reviews, store-wide) */}
      <ProductReviews />

      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
