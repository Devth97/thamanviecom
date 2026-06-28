"use client";
import Image from "next/image";
import Link from "next/link";
import { ShopifyProduct, formatPrice } from "@/lib/shopify";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.nodes[0];
  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.compareAtPriceRange.minVariantPrice;
  const hasDiscount = Number(comparePrice.amount) > Number(price.amount);

  return (
    <Link href={`/products/${product.handle}`} className="group relative flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-[#FDF0E0]">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#D4A96A] text-4xl">
            🧣
          </div>
        )}
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} />
        </div>
        {hasDiscount && (
          <div className="absolute top-2 left-2 rounded bg-[#8B1A1A] px-1.5 py-0.5 text-xs font-semibold text-white">
            Sale
          </div>
        )}
      </div>
      <div className="mt-2 flex-1 px-0.5">
        <h3 className="text-sm font-medium line-clamp-2 text-[#1A1A1A]">{product.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#8B1A1A]">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-[#999] line-through">{formatPrice(comparePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
