import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServiceSupabase, WishlistItem } from "@/lib/supabase";
import { getProduct } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";

export default async function WishlistPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const db = getServiceSupabase();
  const { data } = await db
    .from("wishlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (data ?? []) as WishlistItem[];

  const products = await Promise.all(
    items.map((item) => getProduct(item.shopify_product_id).catch(() => null))
  );
  const validProducts = products.filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-2xl text-[#8B1A1A] mb-6">My Wishlist</h1>
      {validProducts.length === 0 ? (
        <div className="rounded-lg border border-[#D4A96A] bg-white p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-[#D4A96A] mb-3" aria-hidden="true" />
          <p className="text-[#666] text-sm">Save sarees you love and find them here.</p>
          <a href="/" className="mt-4 inline-block text-sm text-[#8B1A1A] underline underline-offset-2">
            Explore Collections
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {validProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
