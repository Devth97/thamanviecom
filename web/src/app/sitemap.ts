import { MetadataRoute } from "next";
import { getProducts, getCollections } from "@/lib/shopify";

const BASE_URL = "https://thamanvi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, collections] = await Promise.all([
    getProducts({ first: 250 }).catch(() => ({ products: [], hasNextPage: false, endCursor: null })),
    getCollections().catch(() => []),
  ]);

  const productUrls = products.map((p) => ({
    url: `${BASE_URL}/products/${p.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const collectionUrls = collections.map((c) => ({
    url: `${BASE_URL}/collections/${c.handle}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...collectionUrls,
    ...productUrls,
  ];
}
