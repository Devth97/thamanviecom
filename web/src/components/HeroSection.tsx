"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    // Entrance
    const tl = gsap.timeline({ delay: 0.5 });
    tl.fromTo(line1Ref.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power4.out" })
      .fromTo(line2Ref.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power4.out" }, "-=0.7")
      .fromTo(subRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.4")
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3")
      .fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.1");

    // Parallax on scroll
    gsap.to(overlayRef.current, {
      yPercent: 30,
      ease: "none",
      scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[80vh] md:min-h-screen flex items-center overflow-hidden bg-[#0D0808]">
      {/* Background texture — animated silk gradient */}
      <div ref={overlayRef} className="absolute inset-0">
        <div className="absolute inset-0 bg-[#0D0808]" />
        {/* Silk video — full brightness, only text area darkened */}
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" aria-hidden="true">
          <source src="/hero-silk.mp4" type="video/mp4" />
        </video>
        {/* Gradient only on the left third where text lives — right side shows full video */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0808]/90 via-[#0D0808]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 pt-24 pb-16 w-full">
        {/* Headline */}
        <div className="overflow-hidden mb-1">
          <div ref={line1Ref} className="opacity-0">
            <h1 className="font-display text-[12vw] md:text-[9vw] lg:text-[8vw] text-white leading-[0.9] tracking-tight">
              Wear the
            </h1>
          </div>
        </div>
        <div className="overflow-hidden mb-10">
          <div ref={line2Ref} className="opacity-0">
            <h1 className="font-display text-[12vw] md:text-[9vw] lg:text-[8vw] text-[#B8860B] leading-[0.9] tracking-tight italic">
              Art of Silk
            </h1>
          </div>
        </div>

        {/* Sub + CTA */}
        <div className="max-w-md">
          <p ref={subRef} className="text-white/60 text-base md:text-lg leading-relaxed mb-8 opacity-0">
            Authentic Kanjivaram, Banarasi & Mysore silk sarees. Each piece a story woven in pure gold zari, trusted by families across India.
          </p>
          <a
            ref={ctaRef}
            href="/#shop"
            className="opacity-0 inline-flex items-center gap-4 group"
          >
            <span className="bg-[#8B1A1A] text-white text-sm tracking-[0.15em] uppercase px-8 py-4 hover:bg-[#B8860B] transition-colors duration-300">
              Explore Collections
            </span>
            <span className="text-[#B8860B] group-hover:translate-x-2 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 flex flex-col items-center gap-2">
        <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#B8860B] to-transparent animate-pulse" />
      </div>

      {/* Stats bottom-right */}
      <div className="absolute bottom-8 right-8 hidden lg:flex gap-10">
        {[["4.8★", "Google Rating"], ["480+", "Reviews"], ["3yr", "Legacy"]].map(([val, label]) => (
          <div key={label} className="text-right">
            <div className="font-display text-2xl text-[#B8860B]">{val}</div>
            <div className="text-white/40 text-[10px] tracking-[0.1em] uppercase">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
