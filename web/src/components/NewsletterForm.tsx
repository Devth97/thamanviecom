"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

export default function NewsletterForm({ source = "homepage" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await apiFetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email, source }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-[#F5EDE0] py-14 px-4">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl text-[#8B1A1A] mb-2">Get 10% Off Your First Order</h2>
        <p className="text-sm text-[#666] mb-6">Subscribe for new arrivals, exclusive offers & styling tips.</p>
        {status === "success" ? (
          <p className="text-[#2E7D32] font-medium">Thank you! Check your email for your coupon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded border border-[#D4A96A] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#8B1A1A]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded bg-[#8B1A1A] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:bg-[#6d1414] transition-colors"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm text-red-600">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}
