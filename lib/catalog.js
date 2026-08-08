export const WIZARD_WEAR_CATEGORY = "Wizard Wear";

export const SHOP_GENRES = [
  "Art",
  "Biography",
  "Ephemera",
  "Encyclopedias",
  "Esoterica",
  "Fantasy",
  "Fiction",
  "Folklore",
  "Mythology",
  "History",
  "Horror",
  "Nature",
  "Natural History",
  "Oddities",
  "Philosophy",
  "Metaphysical",
  "Poetry",
  "Rare Books",
  "Religion",
  "Spirituality",
  "Science Fiction",
];

const productPalettes = [
  "ink",
  "moss",
  "moon",
  "sage",
  "quartz",
  "ember",
  "brass",
  "sky",
];

export function titleCase(value = "") {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function tagValue(tags = [], prefix) {
  const normalizedPrefix = `${prefix.toLowerCase()}:`;
  const match = tags.find((tag) =>
    tag.toLowerCase().startsWith(normalizedPrefix)
  );
  return match ? match.slice(match.indexOf(":") + 1).trim() : "";
}

export function tagValues(tags = [], prefix) {
  const normalizedPrefix = `${prefix.toLowerCase()}:`;
  return [
    ...new Set(
      tags
        .filter((tag) => tag.toLowerCase().startsWith(normalizedPrefix))
        .map((tag) => tag.slice(tag.indexOf(":") + 1).trim())
        .filter(Boolean)
        .map(titleCase)
    ),
  ];
}

function productOrganization(product) {
  const tags = product.tags || [];
  const isWizardWear = tags.some((tag) =>
    ["wizard-wear", "wizard wear", "merch"].includes(tag.toLowerCase())
  );
  const category = isWizardWear
    ? WIZARD_WEAR_CATEGORY
    : product.productType ||
      (tags.some((tag) => tag.toLowerCase() === "book") ? "Books" : "Wares");
  const author =
    tagValue(tags, "author") ||
    (category.toLowerCase().includes("book") ? product.vendor : "");
  const genres = tagValues(tags, "genre");
  const realmTag = tagValue(tags, "realm").toLowerCase();
  const plainRealm = tags.find((tag) =>
    ["magical", "mundane"].includes(tag.toLowerCase())
  );
  const realm = realmTag
    ? titleCase(realmTag)
    : plainRealm
      ? titleCase(plainRealm.toLowerCase())
      : "";

  return { tags, category, author, genres, realm };
}

function mapMoney(money) {
  if (!money) return null;
  return {
    amount: Number(money.amount),
    currencyCode: money.currencyCode,
  };
}

function mapImage(image) {
  if (!image) return null;
  return {
    id: image.id || image.url,
    url: image.url,
    altText: image.altText || "",
    width: image.width || null,
    height: image.height || null,
  };
}

export function mapVariant(variant) {
  if (!variant) return null;
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    currentlyNotInStock: variant.currentlyNotInStock || false,
    price: mapMoney(variant.price),
    compareAtPrice: mapMoney(variant.compareAtPrice),
    selectedOptions: variant.selectedOptions || [],
    image: mapImage(variant.image),
    sku: variant.sku || "",
    requiresShipping: variant.requiresShipping,
  };
}

export function mapProductSummary(product, index = 0) {
  const organization = productOrganization(product);
  const variantNodes = product.variants?.nodes || [];
  const rawVariant =
    product.selectedOrFirstAvailableVariant ||
    variantNodes.find((variant) => variant.availableForSale) ||
    variantNodes[0];
  const variant = mapVariant(rawVariant);

  return {
    id: product.id,
    name: product.title,
    handle: product.handle,
    subtitle:
      product.description || "Details forthcoming from the inventory ledger.",
    vendor: product.vendor || "",
    availableForSale: product.availableForSale,
    ...organization,
    price: variant?.price?.amount || 0,
    currencyCode: variant?.price?.currencyCode || "USD",
    palette: productPalettes[index % productPalettes.length],
    image: product.featuredImage?.url || variant?.image?.url || "",
    imageAlt: product.featuredImage?.altText || product.title,
  };
}

export function mapProductDetails(product) {
  const organization = productOrganization(product);
  const variants = (product.variants?.nodes || []).map(mapVariant).filter(Boolean);
  const images = [];
  const seenImages = new Set();

  for (const rawImage of product.images?.nodes || []) {
    const image = mapImage(rawImage);
    if (image?.url && !seenImages.has(image.url)) {
      seenImages.add(image.url);
      images.push(image);
    }
  }

  for (const variant of variants) {
    if (variant.image?.url && !seenImages.has(variant.image.url)) {
      seenImages.add(variant.image.url);
      images.push(variant.image);
    }
  }

  if (product.featuredImage?.url && !seenImages.has(product.featuredImage.url)) {
    images.unshift(mapImage(product.featuredImage));
  }

  const options = (product.options || []).filter(
    (option) =>
      !(option.name === "Title" && option.values?.length === 1 && option.values[0] === "Default Title")
  );

  return {
    id: product.id,
    name: product.title,
    handle: product.handle,
    description: product.description || "",
    descriptionHtml: product.descriptionHtml || "",
    vendor: product.vendor || "",
    availableForSale: product.availableForSale,
    featuredImage: mapImage(product.featuredImage),
    images,
    variants,
    options,
    ...organization,
  };
}

export function formatMoney(amount, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount || 0));
}

export function variantDisplayName(variant) {
  if (!variant || variant.title === "Default Title") return "";
  return variant.selectedOptions?.map(({ value }) => value).join(" / ") || variant.title;
}

export function createCartItem(product, variant) {
  const image = variant.image || product.featuredImage || product.images?.[0];
  return {
    id: variant.id,
    productId: product.id,
    variantId: variant.id,
    handle: product.handle,
    name: product.name,
    variantTitle: variantDisplayName(variant),
    selectedOptions: variant.selectedOptions || [],
    price: variant.price.amount,
    currencyCode: variant.price.currencyCode,
    image: image?.url || "",
    imageAlt: image?.altText || product.name,
    palette: "brass",
  };
}
