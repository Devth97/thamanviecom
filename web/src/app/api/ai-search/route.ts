import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ShopifyProduct } from "@/lib/shopify";

/**
 * AI Search — natural-language product search powered by an NVIDIA-hosted LLM.
 *
 * Approach: AI-assisted FILTERING (not AI-picks-products). The LLM only turns
 * the shopper's request into a structured filter (price range + colour / fabric
 * / type / occasion / keywords). We then apply that filter deterministically
 * against the whole catalogue, so EVERY matching product is returned — not a
 * curated handful. This mirrors the on-site filters and guarantees completeness
 * (e.g. "under 3000" returns all products at or below ₹3000).
 *
 * Requires NVIDIA_API_KEY (free at build.nvidia.com). Model overridable via
 * NVIDIA_MODEL.
 */
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
// A FAST, SMALL instruct model — search must feel instant. Reasoning models
// (e.g. GLM-5.2) and even 70B models can be slow/queued on the free tier; an 8B
// instruct model is plenty for extracting a small filter from a short query.
const NVIDIA_MODEL = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct";

const SYSTEM_PROMPT = `You convert a saree-shop customer's request into a JSON search filter.
Extract ONLY attributes the customer explicitly states. If something is not mentioned, use null (prices) or [] (arrays). NEVER list options the customer did not ask for.

Output ONLY this JSON, no prose, no code fences:
{"minPrice": number|null, "maxPrice": number|null, "types": string[], "occasions": string[], "colors": string[], "fabrics": string[], "keywords": string[]}

Field guide (include a value ONLY if the customer mentions it):
- types: subset of ["Banarasi","Kanjivaram","Mysore Silk","Semi Silk"].
- occasions: subset of ["Wedding","Festive","Party Wear","Reception","Casual","Daily Wear"].
- colors: colour words the customer used (e.g. "red","navy blue","yellow").
- fabrics: e.g. "Silk","Cotton".
- keywords: other concrete terms (e.g. "zari","brocade","floral"). Never subjective words like "nice" or "elegant".
- Prices in INR: "under/below/upto X" -> maxPrice X; "above/over/from X" -> minPrice X; "between A and B" -> both.

Examples:
"under 3000" -> {"minPrice":null,"maxPrice":3000,"types":[],"occasions":[],"colors":[],"fabrics":[],"keywords":[]}
"wedding sarees" -> {"minPrice":null,"maxPrice":null,"types":[],"occasions":["Wedding"],"colors":[],"fabrics":[],"keywords":[]}
"blue silk saree under 2000" -> {"minPrice":null,"maxPrice":2000,"types":[],"occasions":[],"colors":["blue"],"fabrics":["Silk"],"keywords":[]}
"kanjivaram for reception" -> {"minPrice":null,"maxPrice":null,"types":["Kanjivaram"],"occasions":["Reception"],"colors":[],"fabrics":[],"keywords":[]}
"red banarasi with zari work" -> {"minPrice":null,"maxPrice":null,"types":["Banarasi"],"occasions":[],"colors":["red"],"fabrics":[],"keywords":["zari"]}`;

// Closed enums used to detect "the model dumped every option" (= no real constraint).
const KNOWN_TYPES = ["banarasi", "kanjivaram", "mysore silk", "semi silk"];
const KNOWN_OCCASIONS = ["wedding", "festive", "party wear", "reception", "casual", "daily wear"];

/** If a facet lists (nearly) every option in its enum, the model dumped the list — treat as no constraint. */
function deDump(facet: string[], known: string[]): string[] {
  const lower = facet.map((f) => f.toLowerCase().trim());
  const coverage = known.filter((k) => lower.includes(k)).length;
  return coverage >= known.length ? [] : facet;
}

interface SearchFilter {
  minPrice: number | null;
  maxPrice: number | null;
  types: string[];
  occasions: string[];
  colors: string[];
  fabrics: string[];
  keywords: string[];
}

const EMPTY_FILTER: SearchFilter = {
  minPrice: null,
  maxPrice: null,
  types: [],
  occasions: [],
  colors: [],
  fabrics: [],
  keywords: [],
};

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];

const asPrice = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;

/** Parse the structured filter out of a model response, tolerating stray text/fences. */
function parseFilter(text: string): SearchFilter {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```(?:json)?/gi, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return { ...EMPTY_FILTER };
  try {
    const o = JSON.parse(match[0]) as Record<string, unknown>;
    return {
      minPrice: asPrice(o.minPrice),
      maxPrice: asPrice(o.maxPrice),
      types: asStringArray(o.types),
      occasions: asStringArray(o.occasions),
      colors: asStringArray(o.colors),
      fabrics: asStringArray(o.fabrics),
      keywords: asStringArray(o.keywords),
    };
  } catch {
    return { ...EMPTY_FILTER };
  }
}

/** Regex fallback for price bounds, so "under 3000" works even if the LLM misses it. */
function priceFromText(q: string): { min: number | null; max: number | null } {
  const num = (s: string) => parseInt(s.replace(/[,\s]/g, ""), 10);
  let min: number | null = null;
  let max: number | null = null;
  const between = q.match(/between\s*₹?\s*([\d,]+)\s*(?:and|-|to)\s*₹?\s*([\d,]+)/i);
  if (between) {
    const a = num(between[1]);
    const b = num(between[2]);
    min = Math.min(a, b);
    max = Math.max(a, b);
    return { min, max };
  }
  const under = q.match(/(?:under|below|less than|upto|up to|within|max|cheaper than|<=?)\s*₹?\s*([\d,]+)/i);
  if (under) max = num(under[1]);
  const over = q.match(/(?:above|over|more than|from|min|starting|>=?)\s*₹?\s*([\d,]+)/i);
  if (over) min = num(over[1]);
  return { min, max };
}

const STOPWORDS = new Set([
  "saree", "sarees", "sari", "saris", "silk", "for", "the", "and", "with", "under",
  "below", "above", "over", "less", "more", "than", "want", "need", "show", "me",
  "find", "some", "any", "please", "buy", "in", "a", "an", "of", "to", "at",
]);

/** Does the product's title/tags contain any value in the facet? Empty facet = match all. */
function facetMatches(haystack: string, facet: string[]): boolean {
  if (facet.length === 0) return true;
  return facet.some((v) => haystack.includes(v.toLowerCase().trim()));
}

export function GET() {
  return NextResponse.json({
    model: NVIDIA_MODEL,
    keyConfigured: Boolean(process.env.NVIDIA_API_KEY),
  });
}

export async function POST(req: NextRequest) {
  const debug = new URL(req.url).searchParams.has("debug");
  const body = await req.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json({ error: "Please describe what you're looking for." }, { status: 400 });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI Search isn't configured yet. Add NVIDIA_API_KEY to enable it." },
      { status: 503 }
    );
  }

  // Hard cap so a slow/hung upstream never leaves the shopper's search spinning.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  let filter: SearchFilter = { ...EMPTY_FILTER };
  try {
    const res = await fetch(NVIDIA_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error("NVIDIA AI search error:", res.status, detail);
      return NextResponse.json({ error: "AI Search is temporarily unavailable." }, { status: 502 });
    }

    const data = await res.json();
    filter = parseFilter(data.choices?.[0]?.message?.content ?? "");
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json(
        { error: "AI Search took too long. Please try again." },
        { status: 504 }
      );
    }
    console.error("AI search failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }

  // Defend against the model dumping whole enum lists (= "no constraint").
  filter.types = deDump(filter.types, KNOWN_TYPES);
  filter.occasions = deDump(filter.occasions, KNOWN_OCCASIONS);

  // Regex price fallback fills any gap the model left.
  const rx = priceFromText(query);
  const minPrice = filter.minPrice ?? rx.min;
  const maxPrice = filter.maxPrice ?? rx.max;

  // If the model extracted nothing usable, fall back to matching the raw query
  // tokens (minus generic words) so a specific query never returns everything.
  const hasFacets =
    filter.types.length || filter.occasions.length || filter.colors.length ||
    filter.fabrics.length || filter.keywords.length;
  if (!hasFacets && minPrice === null && maxPrice === null) {
    filter.keywords = query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t: string) => t.length > 2 && !STOPWORDS.has(t));
  }

  // Fetch the catalogue and filter deterministically — return ALL that match.
  const { products } = await getProducts({
    first: 250,
    sortKey: "CREATED_AT",
    reverse: true,
  }).catch(() => ({ products: [] as ShopifyProduct[], hasNextPage: false, endCursor: null }));

  const attributeFacets = [
    filter.types,
    filter.occasions,
    filter.colors,
    filter.fabrics,
    filter.keywords,
  ];

  const matched = products
    .filter((p) => {
      const price = Number(p.priceRange.minVariantPrice.amount);
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
      const haystack = `${p.title} ${p.tags.join(" ")}`.toLowerCase();
      // Each specified attribute facet must match (empty facets are ignored).
      return attributeFacets.every((facet) => facetMatches(haystack, facet));
    })
    .sort(
      (a, b) =>
        Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount)
    );

  return NextResponse.json({
    products: matched,
    ...(debug ? { _debug: { filter, minPrice, maxPrice, matched: matched.length } } : {}),
  });
}
