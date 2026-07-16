"use client";
import { useEffect, useState } from "react";
import { Sparkles, Shirt, Gem, CalendarHeart, Lightbulb } from "lucide-react";
import type { StylistAdvice } from "@/app/api/ai-stylist/route";

/**
 * AI Stylist — "complete the look". Fetches concise styling guidance (blouse,
 * jewellery, occasion, a tip) for the saree being viewed. Renders nothing on
 * failure so it never leaves a broken block on the PDP.
 */
const ROWS: { key: keyof StylistAdvice; label: string; Icon: typeof Shirt }[] = [
  { key: "blouse", label: "Blouse", Icon: Shirt },
  { key: "jewellery", label: "Jewellery", Icon: Gem },
  { key: "occasion", label: "Best for", Icon: CalendarHeart },
  { key: "tip", label: "Stylist tip", Icon: Lightbulb },
];

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
        if (d.advice) setAdvice(d.advice);
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
        <h2 className="font-display text-lg text-[#0D0808]">Style this saree</h2>
        <span className="text-[10px] font-semibold tracking-wide text-[#999]">AI STYLIST</span>
      </div>

      {advice === null ? (
        <div className="space-y-3">
          {ROWS.map((r) => (
            <div key={r.key} className="h-4 bg-[#F0E8DC] animate-pulse rounded w-3/4" />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {ROWS.map(({ key, label, Icon }) =>
            advice[key] ? (
              <li key={key} className="flex gap-3">
                <Icon className="h-4 w-4 shrink-0 text-[#8B1A1A] mt-0.5" aria-hidden="true" />
                <span className="text-sm text-[#4A4A4A] leading-relaxed">
                  <span className="font-medium text-[#1A1A1A]">{label}:</span> {advice[key]}
                </span>
              </li>
            ) : null
          )}
        </ul>
      )}
    </div>
  );
}
