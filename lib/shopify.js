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

const IMAGE_FIELDS = `
  id
  url
  altText
  width
  height
`;

const VARIANT_FIELDS = `
  id
  title
  availableForSale
  currentlyNotInStock
  sku
  requiresShipping
  selectedOptions {
    name
    value
  }
  price {
    amount
    currencyCode
  }
  compareAtPrice {
    amount
    currencyCode
  }
  image {
    ${IMAGE_FIELDS}
  }
`;

export async function loadShopifyProducts() {
  const products = [];
  let after = null;

  do {
    const data = await shopifyRequest(
      `
        query StorefrontProducts($after: String) {
          products(first: 100, after: $after, sortKey: CREATED_AT, reverse: true) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              title
              handle
              description
              productType
              vendor
              tags
              availableForSale
              featuredImage {
                ${IMAGE_FIELDS}
              }
              selectedOrFirstAvailableVariant {
                ${VARIANT_FIELDS}
              }
              variants(first: 2) {
                nodes {
                  ${VARIANT_FIELDS}
                }
              }
            }
          }
        }
      `,
      { after }
    );

    products.push(...data.products.nodes);
    after = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (after);

  // Keep sold-out findings visible so their photographs and provenance remain
  // available; the complete listing page disables purchase safely.
  return products;
}

export async function loadShopifyProduct(handle) {
  const data = await shopifyRequest(
    `
      query StorefrontProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          productType
          vendor
          tags
          availableForSale
          featuredImage {
            ${IMAGE_FIELDS}
          }
          images(first: 250) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              ${IMAGE_FIELDS}
            }
          }
          options {
            name
            values
          }
          variants(first: 250) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              ${VARIANT_FIELDS}
            }
          }
        }
      }
    `,
    { handle }
  );

  if (!data.product) return null;

  const product = data.product;
  const images = [...product.images.nodes];
  const variants = [...product.variants.nodes];

  let imagePage = product.images.pageInfo;
  while (imagePage.hasNextPage && imagePage.endCursor) {
    const imageData = await shopifyRequest(
      `
        query StorefrontProductImages($handle: String!, $after: String!) {
          product(handle: $handle) {
            images(first: 250, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                ${IMAGE_FIELDS}
              }
            }
          }
        }
      `,
      { handle, after: imagePage.endCursor }
    );

    if (!imageData.product) return null;
    images.push(...imageData.product.images.nodes);
    imagePage = imageData.product.images.pageInfo;
  }

  let variantPage = product.variants.pageInfo;
  while (variantPage.hasNextPage && variantPage.endCursor) {
    const variantData = await shopifyRequest(
      `
        query StorefrontProductVariants($handle: String!, $after: String!) {
          product(handle: $handle) {
            variants(first: 250, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                ${VARIANT_FIELDS}
              }
            }
          }
        }
      `,
      { handle, after: variantPage.endCursor }
    );

    if (!variantData.product) return null;
    variants.push(...variantData.product.variants.nodes);
    variantPage = variantData.product.variants.pageInfo;
  }

  return {
    ...product,
    images: { nodes: images },
    variants: { nodes: variants },
  };
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
          warnings {
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
  if (!data.cartCreate.cart?.checkoutUrl) {
    throw new Error(
      data.cartCreate.warnings?.[0]?.message ||
        "Shopify checkout could not be opened."
    );
  }

  return data.cartCreate.cart.checkoutUrl;
}
