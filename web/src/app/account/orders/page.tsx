import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { ShoppingBag, Mail, Phone } from "lucide-react";

export default async function OrdersPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const name =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Welcome";
  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    null;
  const phone =
    user.phoneNumbers.find((p) => p.id === user.primaryPhoneNumberId)?.phoneNumber ||
    user.phoneNumbers[0]?.phoneNumber ||
    null;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-2xl text-[#8B1A1A] mb-6">My Account</h1>

      {/* Profile card */}
      <div className="rounded-xl border border-[#E8DDD0] bg-white p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center text-xl font-semibold">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#1A1A1A] text-lg truncate">{name}</p>
            {email && (
              <p className="text-sm text-[#666] flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" /> {email}
              </p>
            )}
            {phone && (
              <p className="text-sm text-[#666] flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" /> {phone}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#F0E8DC]">
          <SignOutButton>
            <button className="text-sm text-[#8B1A1A] hover:underline underline-offset-2">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* Orders */}
      <h2 className="font-display text-xl text-[#1A1A1A] mb-3">My Orders</h2>
      <div className="rounded-xl border border-[#D4A96A] bg-white p-12 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-[#D4A96A] mb-3" aria-hidden="true" />
        <p className="text-[#666] text-sm">You have no orders yet.</p>
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
