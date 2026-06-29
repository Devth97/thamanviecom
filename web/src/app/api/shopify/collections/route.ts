import { NextResponse } from "next/server";
import { getCollections } from "@/lib/shopify";

export async function GET() {
  try {
    const collections = await getCollections();
    return NextResponse.json(collections, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
