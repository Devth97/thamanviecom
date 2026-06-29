"use client";
import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotifyMe({ productTitle }: { productTitle: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Save to newsletter_subscribers with source = "notify_me"
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: `notify_me:${productTitle}` }),
    }).catch(() => {});
    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="bg-[#E8F5E9] border border-[#4CAF50]/30 rounded-lg px-4 py-3 text-center">
        <p className="text-sm font-semibold text-[#2E7D32]">✓ You're on the list!</p>
        <p className="text-xs text-[#555] mt-1">We'll notify you at <strong>{email}</strong> when this saree is back in stock.</p>
      </div>
    );
  }

  return (
    <div className="border border-[#E8DDD0] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="h-4 w-4 text-[#8B1A1A]" />
        <span className="text-sm font-semibold text-[#1A1A1A]">Notify Me When Available</span>
      </div>
      <p className="text-xs text-[#666] mb-3">This saree is currently out of stock. Enter your email to be the first to know when it's back.</p>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 border border-[#D4A96A] rounded px-3 py-2 text-sm outline-none focus:border-[#8B1A1A] bg-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#8B1A1A] text-white text-xs font-semibold rounded hover:bg-[#6d1414] transition-colors disabled:opacity-60"
        >
          {loading ? "..." : "Notify Me"}
        </button>
      </form>
    </div>
  );
}
