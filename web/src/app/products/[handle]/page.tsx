import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProductRecommendations, formatPrice, getMetafield } from "@/lib/shopify";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import CartDrawer from "@/components/CartDrawer";
import WishlistButton from "@/components/WishlistButton";
import AddToCartButton from "./AddToCartButton";

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

  const recommendations = await getProductRecommendations(product.id).catch(() => []);

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

  const videoUrl = getMetafield(product, "product_video_url");
  const whatsappNumber = "919535779597";
  const whatsappMsg = `Hi! I'm interested in the ${product.title} on your website. Can you share more details?`;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#666] mb-6" aria-label="Breadcrumb">
          <a href="/" className="hover:text-[#8B1A1A]">Home</a>
          <span className="mx-2" aria-hidden="true">›</span>
          {product.collections.nodes[0] && (
            <>
              <a href={`/collections/${product.collections.nodes[0].handle}`} className="hover:text-[#8B1A1A]">
                {product.collections.nodes[0].title}
              </a>
              <span className="mx-2" aria-hidden="true">›</span>
            </>
          )}
          <span>{product.title}</span>
        </nav>

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

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#8B1A1A]">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-base text-[#999] line-through">{formatPrice(comparePrice)}</span>
              )}
            </div>

            <AddToCartButton product={product} />

            {/* WhatsApp enquiry */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded border-2 border-[#25D366] py-2.5 text-sm font-semibold text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.534 5.867L.057 23.63a.5.5 0 0 0 .609.63l5.939-1.56A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 0 1-5.186-1.452l-.371-.22-3.525.927.934-3.432-.241-.383A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Enquire on WhatsApp
            </a>

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

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl text-[#8B1A1A] mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendations.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

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
          }),
        }}
      />

      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
