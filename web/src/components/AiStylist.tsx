"use client";
import { useEffect, useState } from "react";
import { Sparkles, Shirt, Gem, CalendarHeart, Lightbulb } from "lucide-react";
import type { StylistAdvice } from "@/app/api/ai-stylist/route";

/**
 * AI Stylist — "complete the look". The API detects the product category and
 * returns a heading + advice rows (saree: blouse/jewellery; men's wear:
 * pairing/accessories), so the copy always matches the garment. Renders
 * nothing on failure so it never leaves a broken block on the PDP.
 */
const ICONS = [Shirt, Gem, CalendarHeart, Lightbulb];

export default function AiStylist({ handle }: { handle: string }) {
  const [advice, setAdvice] = useState<StylistAdvice | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai-stylist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.advice?.items?.length) setAdvice(d.advice);
        else setFailed(true);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (failed) return null;

  return (
    <div className="rounded-xl border border-[#E8DDD0] bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-[#B8860B]" />
        <h2 className="font-display text-lg text-[#0D0808]">
          {advice?.heading ?? "Styling advice"}
        </h2>
        <span className="text-[10px] font-semibold tracking-wide text-[#999]">AI STYLIST</span>
      </div>

      {advice === null ? (
        <div className="space-y-3">
          {ICONS.map((_, i) => (
            <div key={i} className="h-4 bg-[#F0E8DC] animate-pulse rounded w-3/4" />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {advice.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={item.label} className="flex gap-3">
                <Icon className="h-4 w-4 shrink-0 text-[#8B1A1A] mt-0.5" aria-hidden="true" />
                <span className="text-sm text-[#4A4A4A] leading-relaxed">
                  <span className="font-medium text-[#1A1A1A]">{item.label}:</span> {item.text}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
