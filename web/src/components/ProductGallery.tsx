"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ShopifyImage } from "@/lib/shopify";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ images }: { images: ShopifyImage[] }) {
  const [active, setActive] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const switchImage = useCallback((idx: number) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches && mainRef.current) {
      gsap.to(mainRef.current, {
        opacity: 0,
        duration: 0.12,
        onComplete: () => {
          setActive(idx);
          gsap.to(mainRef.current, { opacity: 1, duration: 0.2 });
        },
      });
    } else {
      setActive(idx);
    }

    // Scroll selected thumbnail into view on mobile
    if (thumbsRef.current) {
      const thumb = thumbsRef.current.children[idx] as HTMLElement;
      if (thumb) {
        thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, []);

  const prev = () => switchImage((active - 1 + images.length) % images.length);
  const next = () => switchImage((active + 1) % images.length);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded bg-[#F5EDE0] flex items-center justify-center text-6xl">
        🧣
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* ── Desktop layout: vertical thumbnails left + main image right ── */}
      <div className="hidden md:flex gap-3">
        {/* Vertical thumbnails */}
        <div className="flex flex-col gap-2 w-16 shrink-0">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => switchImage(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-square w-full overflow-hidden rounded border-2 transition-all duration-200 ${
                i === active
                  ? "border-[#8B1A1A] shadow-md"
                  : "border-transparent hover:border-[#D4A96A]"
              }`}
            >
              <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div ref={mainRef} className="flex-1 relative aspect-[3/4] rounded overflow-hidden bg-[#F5EDE0]">
          <Image
            src={images[active].url}
            alt={images[active].altText ?? ""}
            fill
            className="object-contain"
            sizes="50vw"
            priority={active === 0}
          />
        </div>
      </div>

      {/* ── Mobile layout: swipeable main + horizontal thumbnails below ── */}
      <div className="md:hidden">

        {/* Main image with prev/next arrows */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#F5EDE0]">
          <div ref={mainRef} className="w-full h-full">
            <Image
              src={images[active].url}
              alt={images[active].altText ?? ""}
              fill
              className="object-contain"
              sizes="100vw"
              priority={active === 0}
            />
          </div>

          {/* Prev / Next arrows — only when multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-[#1A1A1A]" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-[#1A1A1A]" />
              </button>

              {/* Image counter badge */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                {active + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Horizontal thumbnail strip */}
        {images.length > 1 && (
          <div
            ref={thumbsRef}
            className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1"
          >
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => switchImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative aspect-square shrink-0 w-16 h-16 overflow-hidden rounded border-2 transition-all duration-200 ${
                  i === active
                    ? "border-[#8B1A1A] shadow-sm scale-105"
                    : "border-[#E0D8CF] opacity-70 hover:opacity-100 hover:border-[#D4A96A]"
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
        )}
      </div>

    </div>
  );
}
