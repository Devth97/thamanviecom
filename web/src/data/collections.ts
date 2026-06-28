export const COLLECTIONS = [
  {
    handle: "kanjivaram-silk",
    title: "Kanjivaram Silk",
    description: "Authentic Kanjivaram silk sarees woven in Kanchipuram with pure zari borders.",
    emoji: "🌟",
  },
  {
    handle: "banarasi-silk",
    title: "Banarasi Silk",
    description: "Royal Banarasi silk sarees with intricate brocade weaving from Varanasi.",
    emoji: "✨",
  },
  {
    handle: "mysore-silk",
    title: "Mysore Silk",
    description: "Luxurious Mysore silk sarees with a distinctive sheen and vibrant colours.",
    emoji: "💜",
  },
  {
    handle: "wedding-silk",
    title: "Wedding Silk",
    description: "Bridal collection — rich silks with heavy zari work for your special day.",
    emoji: "👰",
  },
  {
    handle: "casual-cotton",
    title: "Casual Cotton",
    description: "Lightweight cotton sarees for everyday elegance.",
    emoji: "🌸",
  },
] as const;

export type CollectionHandle = (typeof COLLECTIONS)[number]["handle"];
