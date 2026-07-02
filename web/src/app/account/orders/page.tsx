import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export default async function OrdersPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-2xl text-[#8B1A1A] mb-6">My Orders</h1>
      <div className="rounded-lg border border-[#D4A96A] bg-white p-12 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-[#D4A96A] mb-3" aria-hidden="true" />
        <p className="text-[#666] text-sm">
          Your order history will appear here once you&apos;ve placed your first order.
        </p>
        <a
          href="/#shop"
          className="mt-4 inline-block text-sm text-[#8B1A1A] underline underline-offset-2"
        >
          Start Shopping
        </a>
      </div>
    </div>
  );
}
