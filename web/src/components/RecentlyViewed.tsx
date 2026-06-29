"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type RecentItem = {
  handle: string;
  title: string;
  price: string;
  image: string;
};

const KEY = "thamanvi_recently_viewed";
const MAX = 6;

export function saveRecentlyViewed(item: RecentItem) {
  if (typeof window === "undefined") return;
  const existing: RecentItem[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  const filtered = existing.filter(i => i.handle !== item.handle);
  const updated = [item, ...filtered].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export default function RecentlyViewed({ currentHandle }: { currentHandle?: string }) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    const stored: RecentItem[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    setItems(stored.filter(i => i.handle !== currentHandle));
  }, [currentHandle]);

  if (items.length === 0) return null;

  return (
    <section className="bg-[#FAF6F0] py-10 border-t border-[#E8DDD0]">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-xl text-[#0D0808] mb-5">Recently Viewed</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {items.map(item => (
            <Link
              key={item.handle}
              href={`/products/${item.handle}`}
              className="shrink-0 w-36 group"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-[#F5EDE0] mb-2">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="144px"
                />
              </div>
              <p className="text-xs font-medium text-[#1A1A1A] line-clamp-2 leading-snug">{item.title}</p>
              <p className="text-xs text-[#8B1A1A] font-semibold mt-0.5">{item.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
