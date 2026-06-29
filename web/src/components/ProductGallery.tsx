"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ShopifyImage } from "@/lib/shopify";

export default function ProductGallery({ images }: { images: ShopifyImage[] }) {
  const [active, setActive] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  function switchImage(idx: number) {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches && mainRef.current) {
      gsap.to(mainRef.current, {
        opacity: 0,
        duration: 0.15,
        onComplete: () => {
          setActive(idx);
          gsap.to(mainRef.current, { opacity: 1, duration: 0.25 });
        },
      });
    } else {
      setActive(idx);
    }
  }

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded bg-[#F5EDE0] flex items-center justify-center text-6xl">
        🧣
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails — desktop only */}
      <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
        {images.map((img, i) => (
          <button
            key={img.url}
            onClick={() => switchImage(i)}
            aria-label={`View image ${i + 1}`}
            className={`relative aspect-square w-full overflow-hidden rounded border-2 transition-colors ${
              i === active
                ? "border-[#8B1A1A]"
                : "border-transparent hover:border-[#D4A96A]"
            }`}
          >
            <Image
              src={img.url}
              alt={img.altText ?? ""}
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        ref={mainRef}
        className="flex-1 relative aspect-[3/4] rounded overflow-hidden bg-[#F5EDE0]"
      >
        <Image
          src={images[active].url}
          alt={images[active].altText ?? ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={active === 0}
        />
      </div>

      {/* Mobile dots */}
      {images.length > 1 && (
        <div className="md:hidden flex justify-center gap-1.5 mt-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => switchImage(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-4 bg-[#8B1A1A]" : "w-1.5 bg-[#D4A96A]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
