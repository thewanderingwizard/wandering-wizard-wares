const SHOP_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  "wandering-wizard-wares.myshopify.com";
const STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION =
  process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";

export function isShopifyConfigured() {
  return Boolean(SHOP_DOMAIN && STOREFRONT_TOKEN);
}

async function shopifyRequest(query, variables = {}) {
  if (!isShopifyConfigured()) {
    throw new Error(
      "Shopify checkout is ready for your store domain and Storefront token."
    );
  }

  const domain = SHOP_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const response = await fetch(
    `https://${domain}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const result = await response.json();

  if (!response.ok || result.errors?.length) {
    throw new Error(
      result.errors?.[0]?.message || "Shopify could not complete the request."
    );
  }

  return result.data;
}

export async function loadShopifyProducts() {
  const data = await shopifyRequest(`
    query StorefrontProducts {
      products(first: 40, sortKey: CREATED_AT, reverse: true) {
        nodes {
          id
          title
          handle
          description
          productType
          vendor
          tags
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            nodes {
              id
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `);

  return data.products.nodes
    .filter((product) => product.variants.nodes[0]?.availableForSale)
    .map((product) => ({
      ...product,
      variant: product.variants.nodes[0],
    }));
}

export async function createShopifyCheckout(items) {
  if (!items.length) throw new Error("Your satchel is empty.");
  if (items.some((item) => !item.variantId)) {
    throw new Error(
      "Connect the Shopify catalog before opening secure checkout."
    );
  }

  const data = await shopifyRequest(
    `
      mutation CreateCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: {
        lines: items.map((item) => ({
          merchandiseId: item.variantId,
          quantity: item.quantity,
        })),
      },
    }
  );

  const error = data.cartCreate.userErrors[0];
  if (error) throw new Error(error.message);

  return data.cartCreate.cart.checkoutUrl;
}
