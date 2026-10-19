import { NextRequest, NextResponse } from "next/server";
import { CATALOG_REVALIDATE_SECONDS, getProducts } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection") ?? undefined;
  // Shopify caps a page at 250; clamping also stops arbitrary values from
  // each creating their own cache entry.
  const first = Math.min(Math.max(Number(searchParams.get("first")) || 24, 1), 250);
  const after = searchParams.get("after") ?? undefined;
  const rawSortKey = searchParams.get("sortKey") ?? "BEST_SELLING";

  // Translate UI sort options into valid Shopify sort keys + reverse flag:
  // - PRICE_DESC: Shopify has no such key, use PRICE + reverse.
  // - CREATED_AT (Newest) and BEST_SELLING: no real sales history on this store,
  //   so both surface the most recently uploaded product first (CREATED_AT reverse).
  // Shopify's collection sort enum uses CREATED; the product enum uses CREATED_AT.
  const createdKey = collection ? "CREATED" : "CREATED_AT";
  let sortKey = rawSortKey;
  let reverse = searchParams.get("reverse") === "true";
  if (rawSortKey === "PRICE_DESC") {
    sortKey = "PRICE";
    reverse = true;
  } else if (rawSortKey === "CREATED_AT" || rawSortKey === "BEST_SELLING") {
    sortKey = createdKey;
    reverse = true;
  }

  try {
    // Only product grids call this, so return the lean card shape.
    const result = await getProducts({ collection, first, after, sortKey, reverse, fields: "card" });
    return NextResponse.json(result, {
      headers: { "Cache-Control": `s-maxage=${CATALOG_REVALIDATE_SECONDS}, stale-while-revalidate=3600` },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
