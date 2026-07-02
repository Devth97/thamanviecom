import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection") ?? undefined;
  const first = Number(searchParams.get("first") ?? 24);
  const after = searchParams.get("after") ?? undefined;
  const rawSortKey = searchParams.get("sortKey") ?? "BEST_SELLING";
  // Shopify has no PRICE_DESC key — descending price is PRICE + reverse.
  const sortKey = rawSortKey === "PRICE_DESC" ? "PRICE" : rawSortKey;
  const reverse = rawSortKey === "PRICE_DESC" || searchParams.get("reverse") === "true";

  try {
    const result = await getProducts({ collection, first, after, sortKey, reverse });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
