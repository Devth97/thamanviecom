import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ShopifyProduct } from "@/lib/shopify";
import { isMensWear } from "@/lib/mensWear";
import { callNvidia, parseJsonReply, AiError } from "@/lib/nvidia";

/**
 * AI "You may also like" — given the product being viewed, the LLM picks the
 * best-matching products from the catalogue (by colour / occasion / style),
 * more intelligently than plain tag matching. Handles are resolved to real
 * products so nothing is invented.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const handle = typeof body?.handle === "string" ? body.handle : "";
  if (!handle) return NextResponse.json({ error: "Missing product handle." }, { status: 400 });

  const { products } = await getProducts({ first: 100, sortKey: "CREATED_AT", reverse: true }).catch(
    () => ({ products: [] as ShopifyProduct[], hasNextPage: false, endCursor: null })
  );

  const current = products.find((p) => p.handle === handle);
  if (!current) return NextResponse.json({ products: [] });

  // Stay within the same category: men's wear recommends men's wear only,
  // sarees recommend sarees only.
  const mens = isMensWear(current);
  const others = products.filter((p) => p.handle !== handle && isMensWear(p) === mens);
  if (others.length === 0) return NextResponse.json({ products: [] });
  const catalog = others.map((p) => ({
    handle: p.handle,
    title: p.title,
    tags: p.tags,
    price: Math.round(Number(p.priceRange.minVariantPrice.amount)),
  }));

  try {
    const reply = await callNvidia(
      [
        {
          role: "system",
          content:
            "You are a merchandiser for Thamanvi Silks, an Indian clothing store. From the CATALOG, pick up to 4 products that best complement or resemble the product the customer is viewing (similar colour family, occasion, fabric or style). Return ONLY JSON {\"handles\": [\"...\"]} using handles from the catalog, best first. No prose.",
        },
        {
          role: "user",
          content: `VIEWING: ${JSON.stringify({ title: current.title, tags: current.tags })}\n\nCATALOG:\n${JSON.stringify(catalog)}`,
        },
      ],
      { maxTokens: 200 }
    );

    const parsed = parseJsonReply<{ handles?: unknown }>(reply);
    const handles = Array.isArray(parsed?.handles)
      ? parsed!.handles.filter((h): h is string => typeof h === "string")
      : [];
    const byHandle = new Map(others.map((p) => [p.handle, p]));
    const picks = handles
      .map((h) => byHandle.get(h))
      .filter((p): p is ShopifyProduct => Boolean(p))
      .slice(0, 4);

    return NextResponse.json({ products: picks });
  } catch (err) {
    const e = err as AiError;
    return NextResponse.json({ error: e.message, products: [] }, { status: e.status ?? 500 });
  }
}
