import { Star, RefreshCw, Award, MapPin } from "lucide-react";

const items = [
  { icon: Star, label: "4.8 Google Rating", sub: "420+ Reviews" },
  { icon: RefreshCw, label: "Free Exchanges", sub: "Hassle-free policy" },
  { icon: Award, label: "30-Year Legacy", sub: "Trusted since 1994" },
  { icon: MapPin, label: "Puttur, Karnataka", sub: "Visit our store" },
];

export default function TrustStrip() {
  return (
    <div className="bg-[#8B1A1A] text-white py-4">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-[#B8860B]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-white/70">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
