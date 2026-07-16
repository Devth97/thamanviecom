import { NextRequest, NextResponse } from "next/server";
import { getProduct, type ShopifyProduct } from "@/lib/shopify";
import { callNvidia, parseJsonReply, AiError } from "@/lib/nvidia";

/**
 * AI Stylist — "complete the look". Given a saree, the LLM returns concise
 * styling guidance (blouse colour, jewellery, best occasion, a draping tip).
 * A concierge touch that big marketplaces don't offer.
 */
export interface StylistAdvice {
  blouse: string;
  jewellery: string;
  occasion: string;
  tip: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const handle = typeof body?.handle === "string" ? body.handle : "";
  if (!handle) return NextResponse.json({ error: "Missing product handle." }, { status: 400 });

  const product: ShopifyProduct | null = await getProduct(handle).catch(() => null);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  try {
    const reply = await callNvidia(
      [
        {
          role: "system",
          content:
            'You are an expert Indian saree stylist. For the given saree, give practical styling advice as ONLY this JSON: {"blouse":"...","jewellery":"...","occasion":"...","tip":"..."}. Each value one short sentence (max ~18 words), warm and specific to the saree\'s colour and fabric. No prose outside the JSON.',
        },
        {
          role: "user",
          content: `SAREE: ${product.title}\nDETAILS: ${(product.description || "").slice(0, 400)}\nTAGS: ${product.tags.join(", ")}`,
        },
      ],
      { maxTokens: 300, temperature: 0.5 }
    );

    const advice = parseJsonReply<StylistAdvice>(reply);
    if (!advice || !advice.blouse) {
      return NextResponse.json({ error: "Could not generate styling advice." }, { status: 502 });
    }
    return NextResponse.json({ advice });
  } catch (err) {
    const e = err as AiError;
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
