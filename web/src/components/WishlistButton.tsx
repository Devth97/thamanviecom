"use client";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@clerk/nextjs";

export default function WishlistButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const { isSignedIn } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const active = isWishlisted(productId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    await toggle(productId).catch(() => {});
  }

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          active ? "fill-[#8B1A1A] text-[#8B1A1A]" : "text-[#666]"
        }`}
      />
    </button>
  );
}
