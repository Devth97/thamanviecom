export default function MarqueeStrip() {
  const items = ["Pure Zari", "COD Available", "Puttur, Karnataka", "4.8★ Google Rated", "Handwoven Silk", "Free Shipping", "480+ Happy Customers", "Open Box Returns"];

  return (
    <div className="bg-[#8B1A1A] overflow-hidden py-3 border-y border-[#6d1414]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-white/90 text-xs tracking-[0.25em] uppercase font-medium">
            {item} <span className="text-[#B8860B] mx-4">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
