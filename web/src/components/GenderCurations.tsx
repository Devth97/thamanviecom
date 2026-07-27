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
      eyebrow: "MEN'S & ETHNIC",
      title: "For Him",
      subtitle: "Royal Silk Kurtas, Sets & Traditional Wear",
      cta: "Explore Kurtas",
      href: "/#mens",
      image: "/for-him.jpg",
      alt: "Thamanvi Silks For Him Collection",
    },
  ];

  return (
    <section className="bg-[#FAF6F0] py-5 sm:py-8 md:py-14 border-b border-[#E8DDD0] overflow-hidden">
      <div className="mx-auto max-w-5xl px-3 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-3 sm:mb-6 md:mb-10">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <div className="h-px w-6 sm:w-10 bg-[#B8860B]" />
            <span className="text-[#B8860B] text-[9px] sm:text-xs tracking-[0.25em] uppercase font-medium">
              Curated Edits
            </span>
            <div className="h-px w-6 sm:w-10 bg-[#B8860B]" />
          </div>
          <h2 className="font-display text-lg sm:text-2xl md:text-4xl text-[#0D0808]">
            For Him &amp; For Her
          </h2>
        </div>

        {/* Dome Cards Grid — Side by Side on Mobile */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-10 max-w-3xl mx-auto">
          {CURATIONS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative flex flex-col items-center"
            >
              {/* Arched Dome Container */}
              <div className="relative w-full aspect-[4/5] sm:aspect-square overflow-hidden rounded-t-[75px] sm:rounded-t-[140px] md:rounded-t-[200px] rounded-b-xl border border-[#D4A96A]/40 shadow-lg group-hover:border-[#B8860B] transition-all duration-500 bg-[#0D0808]">
                {/* Background Image */}
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 50vw"
                />

                {/* Subtle Arch Gold Inset Border Overlay */}
                <div className="absolute inset-1 sm:inset-2 rounded-t-[71px] sm:rounded-t-[132px] md:rounded-t-[192px] rounded-b-lg border border-white/20 pointer-events-none group-hover:border-[#B8860B]/50 transition-colors duration-500" />

                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0808]/90 via-[#0D0808]/30 to-transparent" />

                {/* Card Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-6 text-center items-center">
                  <span className="text-[#D4AF37] text-[8px] sm:text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase mb-0.5 drop-shadow-sm">
                    {item.eyebrow}
                  </span>
                  <h3 className="font-display text-sm sm:text-2xl md:text-4xl text-white font-medium mb-1 tracking-wide leading-tight">
                    {item.title}
                  </h3>
                  <p className="hidden sm:block text-white/80 text-xs md:text-sm max-w-xs mb-4 font-light leading-snug line-clamp-2">
                    {item.subtitle}
                  </p>

                  {/* Call to Action Button */}
                  <span className="inline-flex items-center gap-1 sm:gap-2 bg-[#8B1A1A] text-white text-[9px] sm:text-xs tracking-[0.1em] uppercase px-2.5 py-1 sm:px-6 sm:py-2.5 rounded-full shadow-md group-hover:bg-[#B8860B] group-hover:text-[#0D0808] transition-all duration-300 transform group-hover:-translate-y-0.5">
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
