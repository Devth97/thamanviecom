import { NextRequest, NextResponse } from "next/server";
import { createCart, addToCart, updateCartLine, removeFromCart } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const cartId = new URL(req.url).searchParams.get("cartId");
  if (!cartId) return NextResponse.json({ error: "Missing cartId" }, { status: 400 });
  // Return an empty cart shell — client refreshes via mutations
  return NextResponse.json({
    id: cartId,
    totalQuantity: 0,
    lines: { nodes: [] },
    cost: {
      totalAmount: { amount: "0", currencyCode: "INR" },
      subtotalAmount: { amount: "0", currencyCode: "INR" },
    },
    checkoutUrl: "",
  });
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
