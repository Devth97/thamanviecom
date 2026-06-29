"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";

const collections = [
  { num: "01", handle: "kanjivaram-silk", title: "Kanjivaram Silk", origin: "Kanchipuram, TN", desc: "Pure mulberry silk with gold zari. The queen of Indian sarees.", image: "/collections/kanjivaram-silk.png" },
  { num: "02", handle: "banarasi-silk", title: "Banarasi Silk", origin: "Varanasi, UP", desc: "Royal brocade weaving with intricate motifs from the holy city.", image: "/collections/banarasi-silk.png" },
  { num: "03", handle: "mysore-silk", title: "Mysore Silk", origin: "Mysuru, Karnataka", desc: "Lustrous silk with pure gold zari, the pride of Karnataka.", image: "/collections/mysore-silk.png" },
  { num: "04", handle: "wedding-silk", title: "Bridal Collection", origin: "Curated Selection", desc: "The most auspicious sarees for your most treasured moments.", image: "/collections/wedding-silk.png" },
  { num: "05", handle: "casual-cotton", title: "Cotton Weaves", origin: "South India", desc: "Lightweight elegance for everyday grace and comfort.", image: "/collections/casual-cotton.png" },
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
          {collections.map(({ num, handle, title, origin, desc, image }) => (
            <Link
              key={handle}
              href={`/collections/${handle}`}
              className="collection-card group opacity-0 flex flex-col"
            >
              {/* Collection image */}
              <div className="relative aspect-[3/4] bg-[#1A0A0A] overflow-hidden mb-4">
                <div className="absolute top-3 left-3 z-10 font-display text-5xl text-white/10 leading-none select-none">{num}</div>
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0808]/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[#0D0808]/0 group-hover:bg-[#0D0808]/20 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-[#0D0808]/85">
                  <p className="text-white/90 text-[10px] leading-relaxed">{desc}</p>
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
