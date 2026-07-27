"use client";
import Image from "next/image";
import Link from "next/link";

export default function GenderCurations() {
  const CURATIONS = [
    {
      id: "for-her",
      eyebrow: "WOMEN'S EDIT",
      title: "For Her",
      subtitle: "Pure Kanjivarams, Banarasis & Silk Creations",
      cta: "Explore Sarees",
      href: "/#shop",
      image: "/for-her.jpg",
      alt: "Thamanvi Silks For Her Collection",
    },
    {
      id: "for-him",
      eyebrow: "MEN'S & ETHNIC EDIT",
      title: "For Him",
      subtitle: "Royal Silk Kurtas, Sets & Traditional Wear",
      cta: "Explore Kurtas",
      href: "/#mens",
      image: "/for-him.jpg",
      alt: "Thamanvi Silks For Him Collection",
    },
  ];

  return (
    <section className="bg-[#FAF6F0] py-10 md:py-16 border-b border-[#E8DDD0] overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-10 bg-[#B8860B]" />
            <span className="text-[#B8860B] text-xs tracking-[0.3em] uppercase font-medium">
              Curated Collections
            </span>
            <div className="h-px w-10 bg-[#B8860B]" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-[#0D0808]">
            Crafted for Elegance
          </h2>
          <p className="text-xs md:text-sm text-[#666] mt-2 italic font-serif">
            Discover exquisite heritage wear tailored for every occasion
          </p>
        </div>

        {/* Dome Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {CURATIONS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative flex flex-col items-center"
            >
              {/* Arched Dome Container */}
              <div className="relative w-full aspect-square overflow-hidden rounded-t-[160px] md:rounded-t-[220px] rounded-b-2xl border-2 border-[#D4A96A]/30 shadow-xl group-hover:border-[#B8860B] transition-all duration-500 bg-[#0D0808]">
                {/* Background Image */}
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Subtle Arch Gold Inset Border Overlay */}
                <div className="absolute inset-2 rounded-t-[152px] md:rounded-t-[212px] rounded-b-xl border border-white/20 pointer-events-none group-hover:border-[#B8860B]/50 transition-colors duration-500" />

                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0808]/90 via-[#0D0808]/30 to-transparent" />

                {/* Card Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-center items-center">
                  <span className="text-[#D4AF37] text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase mb-1 drop-shadow-sm">
                    {item.eyebrow}
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl text-white font-medium mb-2 tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-xs md:text-sm max-w-xs mb-5 font-light leading-snug line-clamp-2">
                    {item.subtitle}
                  </p>

                  {/* Call to Action Button */}
                  <span className="inline-flex items-center gap-2 bg-[#8B1A1A] text-white text-xs tracking-[0.15em] uppercase px-6 py-2.5 rounded-full shadow-md group-hover:bg-[#B8860B] group-hover:text-[#0D0808] transition-all duration-300 transform group-hover:-translate-y-0.5">
                    {item.cta}
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
