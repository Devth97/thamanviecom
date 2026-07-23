import { NextRequest, NextResponse } from "next/server";
import { getProduct, type ShopifyProduct } from "@/lib/shopify";
import { isMensWear } from "@/lib/mensWear";
import { callNvidia, parseJsonReply, AiError } from "@/lib/nvidia";

/**
 * AI Stylist — "complete the look". Detects the product category server-side:
 * sarees get blouse/jewellery guidance; men's wear gets pairing/accessory
 * guidance. Returns a normalized { heading, items[] } shape so the UI never
 * shows saree copy on a shirt (or vice versa).
 */
export interface StylistItem {
  label: string;
  text: string;
}

export interface StylistAdvice {
  heading: string;
  items: StylistItem[];
}

const SAREE_PROMPT =
  'You are an expert Indian saree stylist. For the given saree, give practical styling advice as ONLY this JSON: {"blouse":"...","jewellery":"...","occasion":"...","tip":"..."}. Each value one short sentence (max ~18 words), warm and specific to the saree\'s colour and fabric. No prose outside the JSON.';

const MENS_PROMPT =
  'You are an expert menswear stylist. For the given garment, give practical styling advice as ONLY this JSON: {"pairing":"...","accessories":"...","occasion":"...","tip":"..."}. pairing = trousers/layers that go with it; accessories = shoes/watch/belt. Each value one short sentence (max ~18 words), specific to the garment\'s colour and fabric. No prose outside the JSON.';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const handle = typeof body?.handle === "string" ? body.handle : "";
  if (!handle) return NextResponse.json({ error: "Missing product handle." }, { status: 400 });

  const product: ShopifyProduct | null = await getProduct(handle).catch(() => null);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const mens = isMensWear(product);

  try {
    const reply = await callNvidia(
      [
        { role: "system", content: mens ? MENS_PROMPT : SAREE_PROMPT },
        {
          role: "user",
          content: `ITEM: ${product.title}\nDETAILS: ${(product.description || "").slice(0, 400)}\nTAGS: ${product.tags.join(", ")}`,
        },
      ],
      { maxTokens: 300, temperature: 0.5 }
    );

    const raw = parseJsonReply<Record<string, string>>(reply);
    if (!raw) {
      return NextResponse.json({ error: "Could not generate styling advice." }, { status: 502 });
    }

    const items: StylistItem[] = (
      mens
        ? [
            { label: "Pair with", text: raw.pairing },
            { label: "Accessories", text: raw.accessories },
            { label: "Best for", text: raw.occasion },
            { label: "Stylist tip", text: raw.tip },
          ]
        : [
            { label: "Blouse", text: raw.blouse },
            { label: "Jewellery", text: raw.jewellery },
            { label: "Best for", text: raw.occasion },
            { label: "Stylist tip", text: raw.tip },
          ]
    ).filter((i): i is StylistItem => typeof i.text === "string" && i.text.trim().length > 0);

    if (items.length === 0) {
      return NextResponse.json({ error: "Could not generate styling advice." }, { status: 502 });
    }

    const advice: StylistAdvice = {
      heading: mens ? "How to style it" : "Style this saree",
      items,
    };
    return NextResponse.json({ advice });
  } catch (err) {
    const e = err as AiError;
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
