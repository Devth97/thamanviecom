import { Metadata } from "next";
import { getCollection, getCollections, getProducts, ShopifyCollection } from "@/lib/shopify";
import PLPClient from "./PLPClient";

export const revalidate = 60;

// Map our nav handles to display names for graceful fallback
const COLLECTION_NAMES: Record<string, string> = {
  "kanjivaram-silk": "Kanjivaram Silk",
  "banarasi-silk": "Banarasi Silk",
  "mysore-silk": "Mysore Silk",
  "wedding-silk": "Wedding Collection",
  "casual-cotton": "Cotton Weaves",
  "all": "All Sarees",
};

export async function generateStaticParams() {
  const collections = await getCollections().catch(() => []);
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const name = COLLECTION_NAMES[handle] ?? handle.replace(/-/g, " ");
  const collection = await getCollection(handle).catch(() => null);
  return {
    title: collection?.title ?? name,
    description: collection?.description || `Shop ${name} sarees at Thamanvi Silks.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  // Try to get the real Shopify collection first
  const collection = await getCollection(handle).catch(() => null);

  if (collection) {
    return <PLPClient collection={collection} />;
  }

  // Collection not in Shopify yet — show all products with a friendly label
  const name = COLLECTION_NAMES[handle] ?? handle.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const { products } = await getProducts({ first: 48 }).catch(() => ({ products: [], hasNextPage: false, endCursor: null }));

  const fallbackCollection: ShopifyCollection = {
    id: handle,
    handle,
    title: name,
    description: `Explore our ${name} collection. More products coming soon — check back shortly!`,
    image: null,
    products: { nodes: products },
  };

  return <PLPClient collection={fallbackCollection} />;
}
