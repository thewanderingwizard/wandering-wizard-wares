export const SHOP_CATEGORIES = ["Books", "Curios", "Oddities", "Ephemera"];

export const EXCLUDED_SHOP_GENRES = ["Natural History"];

export const SHOP_GENRES = [
  "Alchemy",
  "Art",
  "Arthurian",
  "Biography",
  "Conspiracy",
  "Eastern Wisdom",
  "Encyclopedias",
  "Ephemera",
  "Esoterica",
  "Fantasy",
  "Fiction",
  "Folklore",
  "Graphic Novels",
  "Hermeticism",
  "History",
  "Horror",
  "Limited Editions",
  "Magic",
  "Metaphysical",
  "Mystery",
  "Mythology",
  "Natural Magic",
  "Nature",
  "New Age",
  "Oddities",
  "Philosophy",
  "Picture Books",
  "Poetry",
  "Rare Books",
  "Religion",
  "Rosicrucianism",
  "Science",
  "Science Fiction",
  "Self-Help",
  "Shamanism",
  "Spirituality",
  "Wicca",
  "Witchcraft",
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
  const rawCategory = product.productType || "";
  const category =
    SHOP_CATEGORIES.find(
      (shopCategory) => shopCategory.toLowerCase() === rawCategory.toLowerCase()
    ) ||
    (rawCategory.toLowerCase() === "book" ||
    tags.some((tag) => ["book", "books"].includes(tag.toLowerCase()))
      ? "Books"
      : "Curios");
  const taggedAuthor = tagValue(tags, "author");
  const author =
    taggedAuthor ||
    (category === "Books" &&
    product.vendor &&
    product.vendor.toLowerCase() !== "wandering wizard wares"
      ? product.vendor
      : "");
  const excludedGenres = new Set(
    EXCLUDED_SHOP_GENRES.map((genre) => genre.toLowerCase())
  );
  const genres = tagValues(tags, "genre").filter(
    (genre) => !excludedGenres.has(genre.toLowerCase())
  );
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

export function shopFilterHref(filter, value) {
  const params = new URLSearchParams({ [filter]: value });
  return `/shop?${params.toString()}#catalog-title`;
}

export function shopTagFilter(tag = "") {
  const trimmedTag = tag.trim();
  const separatorIndex = trimmedTag.indexOf(":");
  const prefix = separatorIndex >= 0
    ? trimmedTag.slice(0, separatorIndex).trim().toLowerCase()
    : "";
  const value = separatorIndex >= 0
    ? trimmedTag.slice(separatorIndex + 1).trim()
    : trimmedTag;

  if (prefix === "author") return { filter: "author", value };
  if (prefix === "genre") return { filter: "genre", value: titleCase(value) };
  if (prefix === "realm") return { filter: "realm", value: titleCase(value) };

  if (["magical", "mundane"].includes(trimmedTag.toLowerCase())) {
    return { filter: "realm", value: titleCase(trimmedTag.toLowerCase()) };
  }

  const category = SHOP_CATEGORIES.find(
    (shopCategory) => shopCategory.toLowerCase() === trimmedTag.toLowerCase()
  );
  if (category) return { filter: "category", value: category };

  return { filter: "tag", value: trimmedTag };
}

export function shopTagHref(tag) {
  const { filter, value } = shopTagFilter(tag);
  return shopFilterHref(filter, value);
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
