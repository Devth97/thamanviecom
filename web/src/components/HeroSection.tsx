"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || !headlineRef.current) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(headlineRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4")
      .fromTo(ctaRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.3");
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1A0A0A]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        aria-hidden="true"
      >
        <source src="/hero-silk.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A0A0A]/80 via-[#1A0A0A]/40 to-transparent" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <h1
          ref={headlineRef}
          className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-tight max-w-2xl opacity-0"
        >
          Wear the<br />
          <span className="text-[#B8860B]">Art of Silk</span>
        </h1>
        <p ref={subRef} className="mt-6 max-w-md text-white/80 text-lg opacity-0">
          Authentic silk sarees from Puttur, Karnataka — Kanjivaram, Banarasi, Mysore Silk and more. Trusted since 1994.
        </p>
        <a
          ref={ctaRef}
          href="/collections/kanjivaram-silk"
          className="mt-10 inline-block rounded bg-[#8B1A1A] px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-[#6d1414] transition-colors opacity-0"
        >
          Explore Collections
        </a>
      </div>
    </section>
  );
}
