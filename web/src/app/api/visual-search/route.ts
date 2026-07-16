import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ShopifyProduct } from "@/lib/shopify";
import { callNvidia, parseJsonReply, AiError, VISION_MODEL } from "@/lib/nvidia";

/**
 * Visual search — the shopper uploads a saree photo; a multimodal model reads
 * its colour / fabric / weave, and we match those attributes against the
 * catalogue deterministically (same approach as text AI Search, seeded from an
 * image). Returns real products only.
 */
interface VisualFilter {
  colors: string[];
  fabrics: string[];
  types: string[];
  keywords: string[];
}

const asArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];

function facetMatch(haystack: string, facet: string[]): boolean {
  if (facet.length === 0) return true;
  return facet.some((v) => haystack.includes(v.toLowerCase().trim()));
}

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
            {
              type: "text",
              text:
                'Look at this saree photo and describe it as ONLY this JSON: {"colors":[],"fabrics":[],"types":[],"keywords":[]}. colors = main colours (e.g. "red","navy blue"). fabrics = e.g. "Silk","Cotton". types = any of ["Banarasi","Kanjivaram","Mysore Silk","Semi Silk"] it resembles, else []. keywords = notable features (e.g. "zari","floral","border","brocade"). No prose.',
            },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      { model: VISION_MODEL, maxTokens: 300, temperature: 0.1, timeoutMs: 25_000 }
    );

    const parsed = parseJsonReply<Record<string, unknown>>(reply) ?? {};
    const filter: VisualFilter = {
      colors: asArr(parsed.colors),
      fabrics: asArr(parsed.fabrics),
      types: asArr(parsed.types),
      keywords: asArr(parsed.keywords),
    };

    const { products } = await getProducts({ first: 100, sortKey: "CREATED_AT", reverse: true }).catch(
      () => ({ products: [] as ShopifyProduct[], hasNextPage: false, endCursor: null })
    );

    // Colour is the strongest visual signal; require it, then rank by how many
    // other facets also match so the closest looks come first.
    const facets = [filter.colors, filter.fabrics, filter.types, filter.keywords];
    const scored = products
      .map((p) => {
        const hay = `${p.title} ${p.tags.join(" ")}`.toLowerCase();
        const score = facets.reduce((s, f) => s + (f.length && facetMatch(hay, f) ? 1 : 0), 0);
        const colourOk = facetMatch(hay, filter.colors);
        return { p, score, colourOk };
      })
      .filter((x) => x.colourOk && x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.p);

    return NextResponse.json({ products: scored, filter });
  } catch (err) {
    const e = err as AiError;
    return NextResponse.json({ error: e.message, products: [] }, { status: e.status ?? 500 });
  }
}
