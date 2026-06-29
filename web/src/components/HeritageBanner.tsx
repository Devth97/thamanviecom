"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const stats = [
  { value: "30+", label: "Years of Excellence", sub: "Est. 1994, Puttur" },
  { value: "420+", label: "Google Reviews", sub: "4.8 star rating" },
  { value: "100%", label: "Authentic Silk", sub: "Direct from weavers" },
  { value: "∞", label: "Free Exchanges", sub: "Hassle-free policy" },
];

export default function HeritageBanner() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const items = ref.current?.querySelectorAll(".stat-item");
    if (items) {
      gsap.fromTo(items, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, stagger: 0.15, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" }
      });
    }
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section ref={ref} id="heritage" className="bg-[#0D0808] py-8 md:py-16 border-y border-[#B8860B]/10">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-[#B8860B]/20">
          {stats.map(({ value, label, sub }) => (
            <div key={label} className="stat-item opacity-0 text-center md:px-8">
              <div className="font-display text-5xl md:text-6xl text-[#B8860B] mb-2 italic">{value}</div>
              <div className="text-white text-sm font-medium mb-1">{label}</div>
              <div className="text-white/40 text-xs tracking-wide">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
