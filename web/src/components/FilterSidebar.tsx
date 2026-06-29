"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Bestsellers", value: "BEST_SELLING" },
  { label: "Newest", value: "CREATED_AT" },
  { label: "Price: Low to High", value: "PRICE" },
  { label: "Price: High to Low", value: "PRICE_DESC" },
];

const SAREE_TYPES = ["Baluchari", "Banarasi", "Bandhani", "Embellished", "Embroidery", "Floral Printed", "Foil Printed", "Geometric Printed", "Kanjivaram", "Mysore Silk"];
const FABRICS = ["Chanderi", "Chanderi Cotton", "Chiffon", "Cotton", "Cotton Linen", "Cotton Silk", "Georgette", "Silk", "Tussar Silk"];
const WORKS = ["Abstract", "Bandhani", "Dyed", "Embellished", "Embroidery", "Floral Printed", "Foil Printed", "Gota Lace", "Woven Zari"];
const COLORS = [
  { name: "Beige", hex: "#F5F0E8" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "Blue", hex: "#1B4FD8" },
  { name: "Brown", hex: "#7B3F1E" },
  { name: "Golden", hex: "#B8860B" },
  { name: "Green", hex: "#1B6B3A" },
  { name: "Maroon", hex: "#7B0D1E" },
  { name: "Pink", hex: "#E75480" },
  { name: "Red", hex: "#C41E3A" },
  { name: "White", hex: "#F8F8F8" },
];

type Props = {
  sortKey: string;
  onSortChange: (key: string) => void;
  selectedTypes?: string[];
  onTypeChange?: (types: string[]) => void;
  selectedFabrics?: string[];
  onFabricChange?: (fabrics: string[]) => void;
  selectedWorks?: string[];
  onWorkChange?: (works: string[]) => void;
  selectedColors?: string[];
  onColorChange?: (colors: string[]) => void;
  priceRange?: [number, number];
  onPriceChange?: (range: [number, number]) => void;
  maxPrice?: number;
  inStockOnly?: boolean;
  onInStockChange?: (v: boolean) => void;
  onReset?: () => void;
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8DDD0] py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left mb-3"
      >
        <span className="font-semibold text-sm text-[#1A1A1A] tracking-wide">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#666]" /> : <ChevronDown className="h-4 w-4 text-[#666]" />}
      </button>
      {open && children}
    </div>
  );
}

function CheckList({ items, selected, onChange }: { items: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter(i => i !== item) : [...selected, item]);
  };
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 7);

  return (
    <div>
      <div className="space-y-2">
        {visible.map(item => (
          <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => toggle(item)}
              className="w-3.5 h-3.5 accent-[#8B1A1A] rounded-sm"
            />
            <span className="text-sm text-[#444] group-hover:text-[#8B1A1A] transition-colors">{item}</span>
          </label>
        ))}
      </div>
      {items.length > 7 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-xs text-[#8B1A1A] hover:underline"
        >
          {showAll ? "Show less" : `+${items.length - 7} more`}
        </button>
      )}
    </div>
  );
}

export default function FilterSidebar({
  sortKey, onSortChange,
  selectedTypes = [], onTypeChange = () => {},
  selectedFabrics = [], onFabricChange = () => {},
  selectedWorks = [], onWorkChange = () => {},
  selectedColors = [], onColorChange = () => {},
  priceRange = [0, 50000], onPriceChange = () => {},
  maxPrice = 50000,
  inStockOnly = false, onInStockChange = () => {},
  onReset,
}: Props) {
  const hasFilters = selectedTypes.length > 0 || selectedFabrics.length > 0 ||
    selectedWorks.length > 0 || selectedColors.length > 0 || inStockOnly ||
    priceRange[0] > 0 || priceRange[1] < maxPrice;

  const toggleColor = (name: string) => {
    onColorChange(selectedColors.includes(name) ? selectedColors.filter(c => c !== name) : [...selectedColors, name]);
  };

  return (
    <aside className="w-full lg:w-60 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-xs text-[#1A1A1A] tracking-widest uppercase">Filters</span>
        {hasFilters && onReset && (
          <button onClick={onReset} className="text-xs text-[#8B1A1A] hover:underline">Reset all</button>
        )}
      </div>

      <div className="bg-white border border-[#E8DDD0] rounded-lg overflow-hidden">

        {/* Sort */}
        <Section title="Sort By">
          <div className="space-y-2">
            {SORT_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  value={opt.value}
                  checked={sortKey === opt.value}
                  onChange={() => onSortChange(opt.value)}
                  className="w-3.5 h-3.5 accent-[#8B1A1A]"
                />
                <span className="text-sm text-[#444] group-hover:text-[#8B1A1A] transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Availability */}
        <Section title="Availability">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => onInStockChange(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#8B1A1A]"
            />
            <span className="text-sm text-[#444] group-hover:text-[#8B1A1A] transition-colors">In stock</span>
          </label>
        </Section>

        {/* Price Range */}
        <Section title="Price">
          <div className="px-1">
            <div className="flex justify-between text-xs text-[#666] mb-3">
              <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
              <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={500}
              value={priceRange[1]}
              onChange={e => onPriceChange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-[#8B1A1A] cursor-pointer"
            />
            <p className="text-xs text-[#666] mt-2 text-center">
              Price: ₹{priceRange[0].toLocaleString("en-IN")} — ₹{priceRange[1].toLocaleString("en-IN")}
            </p>
          </div>
        </Section>

        {/* Color */}
        <Section title="Color" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(({ name, hex }) => (
              <button
                key={name}
                onClick={() => toggleColor(name)}
                title={name}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs transition-all ${
                  selectedColors.includes(name)
                    ? "border-[#8B1A1A] shadow-sm"
                    : "border-[#E8DDD0] hover:border-[#B8860B]"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-[#00000015] inline-block shrink-0"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-[#444]">{name}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Category / Type */}
        <Section title="Type" defaultOpen={false}>
          <CheckList items={SAREE_TYPES} selected={selectedTypes} onChange={onTypeChange} />
        </Section>

        {/* Fabric */}
        <Section title="Fabric" defaultOpen={false}>
          <CheckList items={FABRICS} selected={selectedFabrics} onChange={onFabricChange} />
        </Section>

        {/* Work */}
        <Section title="Work" defaultOpen={false}>
          <CheckList items={WORKS} selected={selectedWorks} onChange={onWorkChange} />
        </Section>

      </div>
    </aside>
  );
}
