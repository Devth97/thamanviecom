import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ShopifyProduct } from "@/lib/shopify";
import { callNvidia, parseJsonReply, AiError, VISION_MODELS } from "@/lib/nvidia";
import { isMensWear } from "@/lib/mensWear";

/**
 * Visual search — the shopper uploads a photo; a multimodal model reads its
 * colour / fabric / weave, and we match those attributes against the catalogue
 * deterministically (same approach as text AI Search, seeded from an image).
 * Returns real products only.
 *
 * The prompt covers the WHOLE catalogue (sarees AND men's wear) — an earlier
 * saree-only prompt made the model return an empty description for shirts and
 * kurtas, which then matched nothing.
 */
interface VisualFilter {
  /** "saree" | "kurta" | "shirt" | "other" — keeps results in the right aisle. */
  garment: string;
  colors: string[];
  fabrics: string[];
  types: string[];
  keywords: string[];
}

const asArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];

function facetMatch(haystack: string, facet: string[]): boolean {
  if (facet.length === 0) return false;
  return facet.some((v) => {
    const val = v.toLowerCase().trim();
    if (!val) return false;
    if (haystack.includes(val)) return true;
    // The model describes a colour as "sage green" while the product is titled
    // "Pale Lime Green" — fall back to the individual significant words so
    // multi-word descriptions still match.
    return val.split(/\s+/).some((w) => w.length > 3 && haystack.includes(w));
  });
}

const VISION_PROMPT =
  'Look at this clothing photo and describe it as ONLY this JSON: ' +
  '{"garment":"","colors":[],"fabrics":[],"types":[],"keywords":[]}. ' +
  'garment = exactly one of "saree","kurta","shirt","other" — what the item actually is. ' +
  'colors = the main colours you actually see (e.g. "red","navy blue","sage green"). ' +
  'fabrics = e.g. "Silk","Cotton","Linen". ' +
  'types = weave if obvious (e.g. "Banarasi","Kanjivaram","Mysore Silk"), else []. ' +
  'keywords = notable features (e.g. "zari","floral","border","brocade","striped","formal"). ' +
  'Always fill in garment and colors. No prose.';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const image = typeof body?.image === "string" ? body.image : "";
  // Expect a data URL (data:image/...;base64,....)
  if (!image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Please upload a valid image." }, { status: 400 });
  }
  if (image.length > 8_000_000) {
    return NextResponse.json({ error: "Image is too large. Try a smaller photo." }, { status: 413 });
  }

  try {
    const reply = await callNvidia(
      [
        {
          role: "user",
          content: [
            { type: "text", text: VISION_PROMPT },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      { models: VISION_MODELS, maxTokens: 300, temperature: 0.1, timeoutMs: 25_000 }
    );

    const parsed = parseJsonReply<Record<string, unknown>>(reply) ?? {};
    const filter: VisualFilter = {
      garment: typeof parsed.garment === "string" ? parsed.garment.toLowerCase().trim() : "",
      colors: asArr(parsed.colors),
      fabrics: asArr(parsed.fabrics),
      types: asArr(parsed.types),
      keywords: asArr(parsed.keywords),
    };

    // No usable signal at all — say so plainly instead of a misleading
    // "no matches found", which implies we searched successfully.
    const hasSignal =
      filter.colors.length + filter.fabrics.length + filter.types.length + filter.keywords.length > 0;
    if (!hasSignal) {
      return NextResponse.json(
        {
          products: [],
          filter,
          error: "Couldn't read that photo. Try a clearer, closer shot of the fabric.",
        },
        { status: 422 }
      );
    }

    const { products } = await getProducts({ first: 250, sortKey: "CREATED_AT", reverse: true }).catch(
      () => ({ products: [] as ShopifyProduct[], hasNextPage: false, endCursor: null })
    );

    // Keep results in the right aisle — a saree photo shouldn't return men's
    // shirts just because "pink" appears in both. Fall back to the full
    // catalogue if the category filter leaves nothing.
    const wantsMens = filter.garment === "kurta" || filter.garment === "shirt";
    const inCategory =
      filter.garment && filter.garment !== "other"
        ? products.filter((p) => isMensWear(p) === wantsMens)
        : products;
    const candidates = inCategory.length > 0 ? inCategory : products;

    // Rank by how much matches, weighting colour highest. Colour is NOT a hard
    // requirement any more — a fabric/type/keyword match should still surface a
    // product, otherwise one unusual colour word wipes out every result.
    const scored = candidates
      .map((p) => {
        const hay = `${p.title} ${p.tags.join(" ")}`.toLowerCase();
        const score =
          (facetMatch(hay, filter.colors) ? 3 : 0) +
          (facetMatch(hay, filter.types) ? 2 : 0) +
          (facetMatch(hay, filter.fabrics) ? 1 : 0) +
          (facetMatch(hay, filter.keywords) ? 1 : 0);
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.p);

    return NextResponse.json({ products: scored, filter });
  } catch (err) {
    const e = err as AiError;
    return NextResponse.json({ error: e.message, products: [] }, { status: e.status ?? 500 });
  }
}
