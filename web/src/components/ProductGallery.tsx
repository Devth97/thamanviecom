"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ShopifyImage } from "@/lib/shopify";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

export default function ProductGallery({ images }: { images: ShopifyImage[] }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
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

  const prev = useCallback(
    () => setActive((a) => (a - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setActive((a) => (a + 1) % images.length),
    [images.length]
  );

  // Touch swipe on mobile: swipe left → next image, swipe right → previous.
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
  };

  // Lightbox: lock body scroll and wire up keyboard (Esc to close, arrows to navigate).
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomOpen, prev, next]);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded bg-[#F5EDE0] flex items-center justify-center text-6xl">
        🧣
      </div>
    );
  }

  // Reusable floating zoom button shown on each main image.
  const ZoomButton = () => (
    <button
      type="button"
      onClick={() => setZoomOpen(true)}
      aria-label="Zoom image to full screen"
      className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm shadow-md text-[#8B1A1A] hover:bg-white hover:scale-105 transition-all"
    >
      <ZoomIn className="h-5 w-5" />
    </button>
  );

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

        {/* Main image — the zoom button (not the whole image) opens the viewer */}
        <div className="flex-1 relative aspect-[3/4] rounded overflow-hidden bg-[#F5EDE0]">
          <div ref={mainRef} className="absolute inset-0">
            <Image
              src={images[active].url}
              alt={images[active].altText ?? ""}
              fill
              className="object-contain"
              sizes="50vw"
              priority={active === 0}
            />
          </div>
          <ZoomButton />
        </div>
      </div>

      {/* ── Mobile layout: swipeable main + horizontal thumbnails below ── */}
      <div className="md:hidden">

        {/* Main image with prev/next arrows + swipe */}
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#F5EDE0]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
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

          <ZoomButton />

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
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
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

      {/* ── Full-screen lightbox ── */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={() => setZoomOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setZoomOpen(false)}
            aria-label="Close image viewer"
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Full image — object-contain so the whole saree is visible.
              stopPropagation so clicking the image doesn't close the viewer. */}
          <div
            className="relative h-[88vh] w-[94vw] md:w-[92vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active].url}
              alt={images[active].altText ?? ""}
              fill
              className="object-contain select-none"
              sizes="92vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous image"
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next image"
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Counter + thumbnail dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.url}
                    onClick={(e) => { e.stopPropagation(); setActive(i); }}
                    aria-label={`View image ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === active ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
