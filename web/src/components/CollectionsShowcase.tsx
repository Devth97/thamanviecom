"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";

// `href` routes to the Shop All section with the matching filter pre-applied.
const collections = [
  { num: "01", handle: "kanjivaram-silk", href: "/?type=Kanjivaram#shop", title: "Kanjivaram Silk", origin: "Kanchipuram, TN", desc: "Pure mulberry silk with gold zari. The queen of Indian sarees.", image: "/collections/kanjivaram-silk.png" },
  { num: "02", handle: "banarasi-silk", href: "/?type=Banarasi#shop", title: "Banarasi Silk", origin: "Varanasi, UP", desc: "Royal brocade weaving with intricate motifs from the holy city.", image: "/collections/banarasi-silk.png" },
  { num: "03", handle: "mysore-silk", href: "/?type=Mysore Silk#shop", title: "Mysore Silk", origin: "Mysuru, Karnataka", desc: "Lustrous silk with pure gold zari, the pride of Karnataka.", image: "/collections/mysore-silk.png" },
  { num: "04", handle: "wedding-silk", href: "/?occasion=Wedding#shop", title: "Bridal Collection", origin: "Curated Selection", desc: "The most auspicious sarees for your most treasured moments.", image: "/collections/wedding-silk.png" },
  { num: "05", handle: "casual-cotton", href: "/?fabric=Cotton#shop", title: "Cotton Weaves", origin: "South India", desc: "Lightweight elegance for everyday grace and comfort.", image: "/collections/casual-cotton.png" },
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
    <section ref={sectionRef} className="bg-[#FAF6F0] py-8 md:py-16" id="collections">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-6 bg-[#B8860B]" />
          <span className="text-[#B8860B] text-[10px] tracking-[0.25em] uppercase">Curated Silks</span>
        </div>
        <h2 className="font-display text-2xl md:text-5xl text-[#0D0808] mb-6 md:mb-10">Our Collections</h2>

        {/* Mobile: horizontal scroll — Desktop: 5-col grid */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0">
          {collections.map(({ num, handle, href, title, origin, desc, image }) => (
            <Link
              key={handle}
              href={href}
              className="collection-card group opacity-0 flex flex-col shrink-0 w-36 md:w-auto"
            >
              {/* Collection image — shorter aspect on mobile */}
              <div className="relative aspect-[3/4] w-full bg-[#1A0A0A] overflow-hidden mb-2 md:mb-4">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 144px, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0808]/50 via-transparent to-transparent" />
                {/* Title overlay on mobile */}
                <div className="absolute bottom-0 left-0 right-0 p-2 md:translate-y-full md:group-hover:translate-y-0 md:transition-transform md:duration-500 bg-[#0D0808]/70 md:bg-[#0D0808]/85">
                  <p className="text-white text-[9px] md:text-[10px] leading-relaxed font-medium md:font-normal">{title}</p>
                </div>
              </div>
              {/* Below-image label — desktop only */}
              <div className="hidden md:block">
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
