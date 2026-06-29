"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

const collections = [
  { num: "01", handle: "kanjivaram-silk", title: "Kanjivaram Silk", origin: "Kanchipuram, TN", desc: "Pure mulberry silk with gold zari. The queen of Indian sarees." },
  { num: "02", handle: "banarasi-silk", title: "Banarasi Silk", origin: "Varanasi, UP", desc: "Royal brocade weaving with intricate motifs from the holy city." },
  { num: "03", handle: "mysore-silk", title: "Mysore Silk", origin: "Mysuru, Karnataka", desc: "Lustrous silk with pure gold zari, the pride of Karnataka." },
  { num: "04", handle: "wedding-silk", title: "Bridal Collection", origin: "Curated Selection", desc: "The most auspicious sarees for your most treasured moments." },
  { num: "05", handle: "casual-cotton", title: "Cotton Weaves", origin: "South India", desc: "Lightweight elegance for everyday grace and comfort." },
];

export default function CollectionsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const cards = sectionRef.current?.querySelectorAll(".collection-card");
    if (cards) {
      gsap.fromTo(cards,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
        }
      );
    }
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#FDF6EE] py-24" id="collections">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px w-8 bg-[#B8860B]" />
          <span className="text-[#B8860B] text-xs tracking-[0.25em] uppercase">Curated Silks</span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-[#0D0808] mb-16">Our Collections</h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {collections.map(({ num, handle, title, origin, desc }) => (
            <Link
              key={handle}
              href={`/collections/${handle}`}
              className="collection-card group opacity-0 flex flex-col"
            >
              {/* Image placeholder */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-[#FDF0E0] to-[#E8D5C0] overflow-hidden mb-4 border border-[#D4A96A]/20">
                <div className="absolute top-3 left-3 font-display text-5xl text-[#B8860B]/15 leading-none select-none">{num}</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 border border-[#B8860B]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <span className="text-[#B8860B]/40 text-xs tracking-widest">IMG</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-[#0D0808]/0 group-hover:bg-[#0D0808]/30 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-[#0D0808]/80">
                  <p className="text-white text-[10px] leading-relaxed">{desc}</p>
                </div>
              </div>
              <div>
                <p className="text-[#B8860B] text-[10px] tracking-[0.2em] uppercase mb-1">{origin}</p>
                <h3 className="font-display text-base text-[#0D0808] group-hover:text-[#8B1A1A] transition-colors">{title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
