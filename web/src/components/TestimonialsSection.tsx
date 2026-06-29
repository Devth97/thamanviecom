"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const testimonials = [
  { quote: "The Kanjivaram saree I bought for my daughter's wedding was breathtaking. Three months later, guests still ask where we got it.", name: "Kavitha R.", location: "Bengaluru" },
  { quote: "Been buying from Thamanvi Silks for over ten years. The zari quality and authenticity is unmatched by any online store I've tried.", name: "Anitha Bhat", location: "Mangaluru" },
  { quote: "Staff took two hours showing us different sarees without any pressure. Rare patience. We left with three. Absolutely worth the visit.", name: "Meena Shetty", location: "Puttur" },
];

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
        <h2 className="font-display text-2xl md:text-5xl text-white italic mb-6 md:mb-10">Voices of Trust</h2>

        {/* Mobile: horizontal scroll | Desktop: 3-col grid */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {testimonials.map(({ quote, name, location }) => (
            <div key={name} className="testimonial-card opacity-0 shrink-0 w-[80vw] md:w-auto border border-[#B8860B]/20 p-5 md:p-8 hover:border-[#B8860B]/50 transition-colors duration-500 group">
              <div className="font-display text-4xl md:text-6xl text-[#B8860B]/20 leading-none mb-2 md:mb-4">&quot;</div>
              <p className="text-white/70 text-sm leading-relaxed mb-4 md:mb-6 italic">{quote}</p>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#B8860B]/20" />
                <div className="text-right">
                  <div className="text-white text-sm font-medium">{name}</div>
                  <div className="text-[#B8860B]/60 text-xs tracking-wide">{location}</div>
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
