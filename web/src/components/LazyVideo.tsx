"use client";
import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "@/lib/media";

/**
 * Muted, looping background video that only starts downloading once it is
 * near the viewport, so visitors who never scroll that far don't pull it.
 */
export default function LazyVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // `autoPlay` alone isn't reliable once src is attached after mount.
  useEffect(() => {
    if (inView) ref.current?.play().catch(() => {});
  }, [inView]);

  return (
    <video
      ref={ref}
      src={inView ? mediaUrl(src) : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      className={className}
      aria-hidden="true"
    />
  );
}
