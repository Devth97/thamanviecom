"use client";
import { useState, useCallback } from "react";
import Script from "next/script";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface RazorpayCheckoutButtonProps {
  amountInPaise: number;
  cartId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: (paymentId: string) => void;
  onFailure?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function RazorpayCheckoutButton({
  amountInPaise,
  cartId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  className,
  children,
}: RazorpayCheckoutButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = useCallback(async () => {
    if (!window.Razorpay) {
      setStatus("error");
      setErrorMsg("Payment script failed to load. Please refresh and try again.");
      return;
    }
    if (amountInPaise < 100) {
      setStatus("error");
      setErrorMsg("Minimum order value is ₹1.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    // Step 1: Create order on server
    let orderData: { orderId: string; amount: number; currency: string };
    try {
      const res = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInPaise, cartId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create order");
      orderData = json;
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message);
      return;
    }

    // Step 2: Open Razorpay modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Thamanvi Silks",
      description: "Saree Purchase",
      image: "/logo-512.png",
      order_id: orderData.orderId,
      prefill: {
        name: customerName ?? "",
        email: customerEmail ?? "",
        contact: customerPhone ?? "",
      },
      theme: { color: "#8B1A1A" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        // Step 3: Verify signature server-side
        try {
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyJson = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyJson.error ?? "Verification failed");
          setStatus("success");
          onSuccess?.(response.razorpay_payment_id);
        } catch (err) {
          setStatus("error");
          setErrorMsg("Payment received but verification failed. Please contact us.");
          onFailure?.((err as Error).message);
        }
      },
      modal: {
        ondismiss: () => {
          if (status === "loading") setStatus("idle");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp: { error: { description: string } }) => {
      setStatus("error");
      setErrorMsg(resp.error.description ?? "Payment failed. Please try again.");
      onFailure?.(resp.error.description);
    });

    setStatus("idle");
    rzp.open();
  }, [amountInPaise, cartId, customerName, customerEmail, customerPhone, onSuccess, onFailure, status]);

  if (status === "success") {
    return (
      <div className="rounded bg-green-50 border border-green-200 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-green-800">Payment successful!</p>
        <p className="text-xs text-green-700 mt-1">
          We will confirm your order via WhatsApp shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="space-y-2">
        <button
          onClick={handlePay}
          disabled={status === "loading" || amountInPaise < 100}
          className={
            className ??
            "block w-full rounded bg-[#8B1A1A] py-3 text-center text-sm font-semibold text-white hover:bg-[#6d1414] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          }
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Processing…
            </span>
          ) : (
            children ?? "Pay Now"
          )}
        </button>
        {status === "error" && errorMsg && (
          <p className="text-xs text-red-600 text-center">{errorMsg}</p>
        )}
      </div>
    </>
  );
}
