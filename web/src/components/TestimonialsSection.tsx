"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GOOGLE_REVIEWS, GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from "@/data/googleReviews";

export default function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const cards = ref.current?.querySelectorAll(".testimonial-card");
    if (cards) {
      gsap.fromTo(cards, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, stagger: 0.2, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" }
      });
    }
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section ref={ref} className="bg-[#0D0808] py-8 md:py-16 border-t border-[#B8860B]/10">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px w-8 bg-[#B8860B]" />
          <span className="text-[#B8860B] text-xs tracking-[0.25em] uppercase">What they say</span>
        </div>
        <h2 className="font-display text-2xl md:text-5xl text-white italic mb-3 md:mb-4">Voices of Trust</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 md:mb-10 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="flex text-[#B8860B]">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            </span>
            <span className="text-white font-medium">{GOOGLE_RATING}</span>
            <span className="text-white/50">· {GOOGLE_REVIEW_COUNT} Google reviews</span>
          </div>
          <span className="text-white/30 hidden md:inline">|</span>
          <span className="text-white/50">4.8/5 Justdial · 363 votes</span>
        </div>

        {/* Mobile: horizontal scroll | Desktop: 3-col grid */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {GOOGLE_REVIEWS.map(({ quote, name }) => (
            <div key={name} className="testimonial-card opacity-0 shrink-0 w-[80vw] md:w-auto border border-[#B8860B]/20 p-5 md:p-8 hover:border-[#B8860B]/50 transition-colors duration-500 group">
              <div className="font-display text-4xl md:text-6xl text-[#B8860B]/20 leading-none mb-2 md:mb-4">&quot;</div>
              <p className="text-white/70 text-sm leading-relaxed mb-4 md:mb-6 italic">{quote}</p>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#B8860B]/20" />
                <div className="text-right">
                  <div className="text-white text-sm font-medium">{name}</div>
                  <div className="text-[#B8860B]/60 text-xs tracking-wide">Google Review</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Scroll hint on mobile */}
        <p className="md:hidden text-center text-[#B8860B]/40 text-[10px] tracking-widest uppercase mt-3">Swipe for more →</p>
      </div>
    </section>
  );
}
