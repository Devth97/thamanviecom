import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getCollections } from "@/lib/shopify";
import PLPClient from "./PLPClient";

export const revalidate = 60;

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
  const collection = await getCollection(handle).catch(() => null);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.description || `Shop ${collection.title} sarees at Thamanvi Silks.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCollection(handle).catch(() => null);
  if (!collection) notFound();
  return <PLPClient collection={collection} />;
}
