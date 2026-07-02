"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Bestsellers", value: "BEST_SELLING" },
  { label: "Newest", value: "CREATED_AT" },
  { label: "Price: Low to High", value: "PRICE" },
  { label: "Price: High to Low", value: "PRICE_DESC" },
];

const OCCASIONS = ["Wedding", "Festive", "Party Wear", "Reception", "Casual", "Daily Wear"];
const SAREE_TYPES = ["Banarasi", "Kanjivaram", "Mysore Silk", "Semi Silk"];
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
  selectedOccasions?: string[];
  onOccasionChange?: (occasions: string[]) => void;
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

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8DDD0] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left px-4 py-3.5"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#1A1A1A] tracking-wide">{title}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-[#888] shrink-0" />
          : <ChevronDown className="h-4 w-4 text-[#888] shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label onClick={onChange} className="flex items-center gap-3 py-1 cursor-pointer group">
      <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
        checked ? "border-[#8B1A1A]" : "border-[#CCC] group-hover:border-[#8B1A1A]"
      }`}>
        {checked && <span className="w-2 h-2 rounded-full bg-[#8B1A1A]" />}
      </span>
      <span className={`text-sm leading-none transition-colors ${checked ? "text-[#8B1A1A] font-medium" : "text-[#444] group-hover:text-[#8B1A1A]"}`}>
        {label}
      </span>
    </label>
  );
}

function CheckOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label onClick={onChange} className="flex items-center gap-3 py-1 cursor-pointer group">
      <span className={`flex-shrink-0 w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors ${
        checked ? "border-[#8B1A1A] bg-[#8B1A1A]" : "border-[#CCC] group-hover:border-[#8B1A1A]"
      }`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
            <path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`text-sm leading-none transition-colors ${checked ? "text-[#8B1A1A] font-medium" : "text-[#444] group-hover:text-[#8B1A1A]"}`}>
        {label}
      </span>
    </label>
  );
}

function CheckList({
  items,
  selected,
  onChange,
}: {
  items: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 6);
  const toggle = (item: string) =>
    onChange(selected.includes(item) ? selected.filter(i => i !== item) : [...selected, item]);

  return (
    <div>
      <div className="space-y-0.5">
        {visible.map(item => (
          <CheckOption
            key={item}
            label={item}
            checked={selected.includes(item)}
            onChange={() => toggle(item)}
          />
        ))}
      </div>
      {items.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs font-medium text-[#8B1A1A] hover:underline underline-offset-2"
        >
          {showAll ? "Show less ↑" : `+ ${items.length - 6} more`}
        </button>
      )}
    </div>
  );
}

export default function FilterSidebar({
  sortKey, onSortChange,
  selectedOccasions = [], onOccasionChange = () => {},
  selectedTypes = [], onTypeChange = () => {},
  selectedFabrics = [], onFabricChange = () => {},
  selectedWorks = [], onWorkChange = () => {},
  selectedColors = [], onColorChange = () => {},
  priceRange = [0, 50000], onPriceChange = () => {},
  maxPrice = 50000,
  inStockOnly = false, onInStockChange = () => {},
  onReset,
}: Props) {
  const hasFilters =
    selectedOccasions.length > 0 || selectedTypes.length > 0 || selectedFabrics.length > 0 ||
    selectedWorks.length > 0 || selectedColors.length > 0 ||
    inStockOnly || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const toggleColor = (name: string) =>
    onColorChange(selectedColors.includes(name)
      ? selectedColors.filter(c => c !== name)
      : [...selectedColors, name]);

  return (
    <aside className="w-full lg:w-60 shrink-0">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold text-[#1A1A1A] tracking-[0.15em] uppercase">Filters</span>
        {hasFilters && onReset && (
          <button
            onClick={onReset}
            className="text-xs text-[#8B1A1A] hover:underline underline-offset-2 font-medium"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Filter card */}
      <div className="bg-white border border-[#E8DDD0] rounded-xl overflow-hidden divide-y divide-[#E8DDD0]">

        {/* Sort By */}
        <Section title="Sort By">
          <div className="space-y-0.5">
            {SORT_OPTIONS.map(opt => (
              <RadioOption
                key={opt.value}
                label={opt.label}
                checked={sortKey === opt.value}
                onChange={() => onSortChange(opt.value)}
              />
            ))}
          </div>
        </Section>

        {/* Availability */}
        <Section title="Availability">
          <CheckOption
            label="In stock only"
            checked={inStockOnly}
            onChange={() => onInStockChange(!inStockOnly)}
          />
        </Section>

        {/* Occasion */}
        <Section title="Occasion" defaultOpen={false}>
          <CheckList items={OCCASIONS} selected={selectedOccasions} onChange={onOccasionChange} />
        </Section>

        {/* Price Range */}
        <Section title="Price">
          <div className="space-y-3">
            {/* Min / Max labels */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#555] bg-[#F5EDE0] px-2 py-1 rounded">
                ₹{priceRange[0].toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-medium text-[#555] bg-[#F5EDE0] px-2 py-1 rounded">
                ₹{priceRange[1].toLocaleString("en-IN")}
              </span>
            </div>
            {/* Slider */}
            <div className="px-0.5">
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={500}
                value={priceRange[1]}
                onChange={e => onPriceChange([priceRange[0], Number(e.target.value)])}
                className="w-full h-1.5 accent-[#8B1A1A] cursor-pointer"
              />
            </div>
            {/* Summary */}
            <p className="text-[11px] text-[#888] text-center">
              ₹{priceRange[0].toLocaleString("en-IN")} — ₹{priceRange[1].toLocaleString("en-IN")}
            </p>
          </div>
        </Section>

        {/* Color */}
        <Section title="Colour" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(({ name, hex }) => (
              <button
                key={name}
                onClick={() => toggleColor(name)}
                title={name}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  selectedColors.includes(name)
                    ? "border-[#8B1A1A] bg-[#8B1A1A]/5 text-[#8B1A1A]"
                    : "border-[#E0D8CF] text-[#555] hover:border-[#B8860B]"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: hex }}
                />
                {name}
              </button>
            ))}
          </div>
        </Section>

        {/* Type */}
        <Section title="Type" defaultOpen={false}>
          <CheckList items={SAREE_TYPES} selected={selectedTypes} onChange={onTypeChange} />
        </Section>

      </div>
    </aside>
  );
}
