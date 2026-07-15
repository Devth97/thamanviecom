import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ShopifyProduct } from "@/lib/shopify";

/**
 * AI Search — natural-language product search powered by an NVIDIA-hosted LLM.
 *
 * Approach: LLM-over-catalog. We send the shopper's request plus a compact
 * catalogue to NVIDIA's OpenAI-compatible chat API and ask it to return the
 * best-matching product handles as JSON. Handles are then resolved back to real
 * products (and filtered to ones that actually exist), so the model can never
 * invent a product.
 *
 * Requires NVIDIA_API_KEY (get one free at build.nvidia.com). The model can be
 * overridden with NVIDIA_MODEL.
 */
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
// A FAST instruct model — search must feel instant. Reasoning models such as
// GLM-5.2 answer well but take ~60-85s, which is unusable for a search box.
const NVIDIA_MODEL = process.env.NVIDIA_MODEL ?? "meta/llama-3.3-70b-instruct";

const SYSTEM_PROMPT = `You are the shopping assistant for Thamanvi Silks, a premium Indian saree store.
Match the customer's request to products in the CATALOG (a JSON array).
Consider colour, fabric/weave (Kanjivaram, Banarasi, Mysore silk, cotton, semi silk),
occasion (wedding, festive, party, casual, daily), and price in INR.
Return ONLY compact JSON of the form {"handles": ["<handle>", ...]}, ordered best-match
first, at most 12 handles, using ONLY handles that appear in the catalog. Prefer in-stock
items. If nothing is a reasonable match, return {"handles": []}. Do not add any prose.`;

/**
 * Pull the {"handles":[...]} array out of a model response, tolerating the
 * extras reasoning models add: <think>…</think> blocks, ```json fences, and
 * prose around the JSON. Our target JSON is flat ({"handles":[...]}), so we scan
 * for the object that actually contains a handles array.
 */
function extractHandles(text: string): string[] {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```(?:json)?/gi, "");

  const asHandles = (value: unknown): string[] | null =>
    value && typeof value === "object" && Array.isArray((value as { handles?: unknown }).handles)
      ? (value as { handles: unknown[] }).handles.filter((h): h is string => typeof h === "string")
      : null;

  // Prefer the last flat {...} object that parses and has a handles array.
  const candidates = cleaned.match(/\{[^{}]*\}/g) ?? [];
  for (const candidate of candidates.reverse()) {
    try {
      const result = asHandles(JSON.parse(candidate));
      if (result) return result;
    } catch {
      /* try the next candidate */
    }
  }

  // Fallback: greedy outermost object.
  try {
    const match = cleaned.match(/\{[\s\S]*\}/);
    return asHandles(JSON.parse(match ? match[0] : cleaned)) ?? [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
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

  // Compact catalogue — only what the model needs to match on.
  const { products } = await getProducts({
    first: 100,
    sortKey: "CREATED_AT",
    reverse: true,
  }).catch(() => ({ products: [] as ShopifyProduct[], hasNextPage: false, endCursor: null }));

  const catalog = products.map((p) => ({
    handle: p.handle,
    title: p.title,
    tags: p.tags,
    price: Math.round(Number(p.priceRange.minVariantPrice.amount)),
    inStock: p.variants.nodes.some((v) => v.availableForSale),
  }));

  // Hard cap so a slow or hung upstream never leaves the shopper's search
  // spinning. A healthy call returns in a couple of seconds.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

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
          { role: "user", content: `CUSTOMER REQUEST: ${query}\n\nCATALOG:\n${JSON.stringify(catalog)}` },
        ],
        temperature: 0.2,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error("NVIDIA AI search error:", res.status, detail);
      return NextResponse.json({ error: "AI Search is temporarily unavailable." }, { status: 502 });
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const handles = extractHandles(content);

    const byHandle = new Map(products.map((p) => [p.handle, p]));
    const matched = handles
      .map((h) => byHandle.get(h))
      .filter((p): p is ShopifyProduct => Boolean(p))
      .slice(0, 12);

    return NextResponse.json({ products: matched });
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
}
