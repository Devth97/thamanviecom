"use client";

type SortOption = { label: string; value: string };

const SORT_OPTIONS: SortOption[] = [
  { label: "Bestsellers", value: "BEST_SELLING" },
  { label: "Newest", value: "CREATED_AT" },
  { label: "Price: Low to High", value: "PRICE" },
  { label: "Price: High to Low", value: "PRICE_DESC" },
];

type Props = { sortKey: string; onSortChange: (key: string) => void };

export default function FilterSidebar({ sortKey, onSortChange }: Props) {
  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="rounded-lg border border-[#D4A96A] bg-white p-4">
        <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3">Sort By</h3>
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={sortKey === opt.value}
                onChange={() => onSortChange(opt.value)}
                className="accent-[#8B1A1A]"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
