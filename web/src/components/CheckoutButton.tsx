"use client";
import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";

// Gates checkout behind Clerk sign-in. Guests are prompted to sign in
// (Google / phone) via the Clerk modal; once signed in they're sent straight
// to Shopify's hosted checkout to fill their address and pay.
export default function CheckoutButton({ checkoutUrl }: { checkoutUrl: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [pending, setPending] = useState(false);

  // After the guest signs in, continue to checkout automatically.
  useEffect(() => {
    if (pending && isLoaded && isSignedIn) {
      window.location.href = checkoutUrl;
    }
  }, [pending, isLoaded, isSignedIn, checkoutUrl]);

  const handleClick = () => {
    if (!isLoaded) return;
    if (isSignedIn) {
      window.location.href = checkoutUrl;
    } else {
      setPending(true);
      openSignIn({});
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isLoaded}
      className="block w-full rounded bg-[#8B1A1A] py-3 text-center text-sm font-semibold text-white hover:bg-[#6d1414] transition-colors disabled:opacity-60"
    >
      {isLoaded && !isSignedIn ? "Sign in to Checkout" : "Proceed to Checkout"}
    </button>
  );
}
