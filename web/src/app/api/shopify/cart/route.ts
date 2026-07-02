import { NextRequest, NextResponse } from "next/server";
import { getCart, createCart, addToCart, updateCartLine, removeFromCart } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const cartId = new URL(req.url).searchParams.get("cartId");
  if (!cartId) return NextResponse.json({ error: "Missing cartId" }, { status: 400 });

  // Fetch the real cart from Shopify so it survives page reloads.
  const cart = await getCart(cartId).catch(() => null);
  if (!cart) {
    // Cart expired or invalid — tell the client so it clears the stored id.
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }
  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  const { action, cartId, lines, lineId, lineIds, quantity } = body;

  try {
    switch (action) {
      case "create":
        return NextResponse.json(await createCart());
      case "add":
        return NextResponse.json(await addToCart(cartId, lines));
      case "update":
        return NextResponse.json(await updateCartLine(cartId, lineId, quantity));
      case "remove":
        return NextResponse.json(await removeFromCart(cartId, lineIds));
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
