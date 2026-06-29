// Shopify Storefront API client for Thamanvi Silks
// API version: 2024-10

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyMetafield = {
  key: string;
  value: string;
  type: string;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: { name: string; value: string }[];
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  priceRange: { minVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney };
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
  metafields: (ShopifyMetafield | null)[];
  collections: { nodes: { handle: string; title: string }[] };
};

export type ShopifyProductPreview = Pick<ShopifyProduct, "id" | "handle" | "title" | "images" | "priceRange">;

export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: { nodes: ShopifyProduct[] };
};

// Used by getCollections() which fetches partial product data
export type ShopifyCollectionPreview = Omit<ShopifyCollection, "products"> & {
  products: { nodes: ShopifyProductPreview[] };
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: ShopifyMoney };
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
      images: { nodes: ShopifyImage[] };
    };
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
  };
  lines: { nodes: ShopifyCartLine[] };
};

// ─── Internal GraphQL Fragments ───────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  id
  handle
  title
  description
  descriptionHtml
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  images(first: 10) {
    nodes {
      url
      altText
      width
      height
    }
  }
  variants(first: 20) {
    nodes {
      id
      title
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      availableForSale
      quantityAvailable
      selectedOptions {
        name
        value
      }
    }
  }
  metafields(identifiers: [
    { namespace: "custom", key: "fabric_type" },
    { namespace: "custom", key: "weave_type" },
    { namespace: "custom", key: "zari_purity" },
    { namespace: "custom", key: "wash_care" },
    { namespace: "custom", key: "region_of_origin" },
    { namespace: "custom", key: "blouse_piece" },
    { namespace: "custom", key: "product_video_url" }
  ]) {
    key
    value
    type
  }
  collections(first: 3) {
    nodes {
      handle
      title
    }
  }
`;

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          product {
            title
            handle
            images(first: 1) {
              nodes {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Internal Fetch ───────────────────────────────────────────────────────────

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN env vars");
  }

  const endpoint = `https://${domain}/api/2024-10/graphql.json`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Shopify API HTTP error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };

  if (json.errors && json.errors.length > 0) {
    throw new Error(`Shopify GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`);
  }

  if (json.data === undefined) {
    throw new Error("Shopify API returned no data");
  }

  return json.data;
}

// ─── Products ─────────────────────────────────────────────────────────────────

type GetProductsResult = {
  products?: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: ShopifyProduct[];
  };
  collection?: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: ShopifyProduct[];
    };
  };
};

export async function getProducts(options: {
  collection?: string;
  first?: number;
  after?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
}): Promise<{ products: ShopifyProduct[]; hasNextPage: boolean; endCursor: string | null }> {
  const { collection, first = 24, after, sortKey, reverse, query } = options;

  if (collection) {
    const gql = `
      query GetCollectionProducts(
        $handle: String!
        $first: Int!
        $after: String
        $sortKey: ProductCollectionSortKeys
        $reverse: Boolean
      ) {
        collection(handle: $handle) {
          products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              ${PRODUCT_FRAGMENT}
            }
          }
        }
      }
    `;

    const data = await shopifyFetch<GetProductsResult>(gql, {
      handle: collection,
      first,
      after: after ?? null,
      sortKey: sortKey ?? null,
      reverse: reverse ?? false,
    });

    const productsConn = data.collection?.products;
    return {
      products: productsConn?.nodes ?? [],
      hasNextPage: productsConn?.pageInfo.hasNextPage ?? false,
      endCursor: productsConn?.pageInfo.endCursor ?? null,
    };
  } else {
    const gql = `
      query GetProducts(
        $first: Int!
        $after: String
        $sortKey: ProductSortKeys
        $reverse: Boolean
        $query: String
      ) {
        products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ${PRODUCT_FRAGMENT}
          }
        }
      }
    `;

    const data = await shopifyFetch<GetProductsResult>(gql, {
      first,
      after: after ?? null,
      sortKey: sortKey ?? null,
      reverse: reverse ?? false,
      query: query ?? null,
    });

    const productsConn = data.products;
    return {
      products: productsConn?.nodes ?? [],
      hasNextPage: productsConn?.pageInfo.hasNextPage ?? false,
      endCursor: productsConn?.pageInfo.endCursor ?? null,
    };
  }
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const gql = `
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        ${PRODUCT_FRAGMENT}
      }
    }
  `;

  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(gql, { handle });
  return data.product;
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function getCollections(): Promise<ShopifyCollectionPreview[]> {
  const gql = `
    query GetCollections {
      collections(first: 20) {
        nodes {
          id
          handle
          title
          description
          image {
            url
            altText
            width
            height
          }
          products(first: 4) {
            nodes {
              id
              handle
              title
              images(first: 1) {
                nodes {
                  url
                  altText
                  width
                  height
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ collections: { nodes: ShopifyCollectionPreview[] } }>(gql);
  return data.collections.nodes;
}

export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
  const gql = `
    query GetCollection($handle: String!) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
        products(first: 48) {
          nodes {
            ${PRODUCT_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ collection: ShopifyCollection | null }>(gql, { handle });
  return data.collection;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function createCart(): Promise<ShopifyCart> {
  const gql = `
    mutation CreateCart {
      cartCreate {
        cart {
          ${CART_FRAGMENT}
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(gql);
  return data.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const gql = `
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(gql, { cartId, lines });
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart> {
  const gql = `
    mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>(gql, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const gql = `
    mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FRAGMENT}
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(gql, {
    cartId,
    lineIds,
  });
  return data.cartLinesRemove.cart;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function getProductRecommendations(productId: string): Promise<ShopifyProduct[]> {
  const gql = `
    query GetProductRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
        ${PRODUCT_FRAGMENT}
      }
    }
  `;

  const data = await shopifyFetch<{ productRecommendations: ShopifyProduct[] }>(gql, { productId });
  return data.productRecommendations;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(money: ShopifyMoney): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currencyCode,
    maximumFractionDigits: 0,
  }).format(parseFloat(money.amount));
}

export function getMetafield(product: ShopifyProduct, key: string): string | null {
  const field = product.metafields.find((m) => m !== null && m.key === key);
  return field ? field.value : null;
}
// shopify connected Mon Jun 29 13:33:52 IST 2026
