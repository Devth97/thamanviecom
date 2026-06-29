"use client";
import { useEffect } from "react";
import { saveRecentlyViewed, type RecentItem } from "@/components/RecentlyViewed";

export default function RecentlyViewedTracker({ item }: { item: RecentItem }) {
  useEffect(() => {
    saveRecentlyViewed(item);
  }, [item]);
  return null;
}
