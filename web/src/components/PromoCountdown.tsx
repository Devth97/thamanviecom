"use client";

/**
 * Optional "Offer ends in HH:MM:SS" countdown.
 *
 * Subscribes to the shared promo clock (one interval for the whole page, one
 * evergreen deadline in localStorage). Renders nothing until mounted so server
 * and first client render match (no hydration mismatch, no CLS from a value
 * flashing in — the row simply appears once, faded).
 */
import { useEffect, useState } from "react";
import { promoConfig } from "@/config/promo";
import { subscribePromoClock, formatRemaining } from "@/lib/promoClock";

export default function PromoCountdown() {
  const { enabled, durationHours, label } = promoConfig.countdown;
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    return subscribePromoClock(setRemaining, durationHours);
  }, [enabled, durationHours]);

  if (!enabled || remaining === null) return null;

  const { hours, minutes, seconds } = formatRemaining(remaining);

  return (
    <div
      className="promo-fade mt-1 flex items-center gap-1 text-[11px] text-[#6B6B6B]"
      role="timer"
      aria-live="off"
      aria-label={`${label} ${hours} hours ${minutes} minutes ${seconds} seconds`}
    >
      <span className="uppercase tracking-wide">{label}</span>
      <span
        className="font-semibold tabular-nums"
        style={{ color: promoConfig.colors.discountPrice }}
      >
        {hours}:{minutes}:{seconds}
      </span>
    </div>
  );
}
