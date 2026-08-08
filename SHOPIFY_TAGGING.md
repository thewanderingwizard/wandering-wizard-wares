# Shopify catalogue tags

Use these tags when publishing products in Shopify. Prefixes are not case-sensitive.

## What the custom storefront displays

Every published Shopify product receives its own page at `/shop/product-handle`.
The page automatically displays:

- every product photograph, in Shopify's chosen order; the storefront keeps
  requesting pages until Shopify reports that no photographs remain;
- each image's alt text;
- the complete rich-text description, including headings, lists, and links;
- the title, price, compare-at price, vendor, availability, and SKU;
- every option and variant combination, including variant-specific price,
  availability, photograph, and selected values;
- Product type, the structured tags below, and every additional Shopify tag;
- a variant-aware Add to satchel action that sends the exact selected variant
  and quantity to Shopify's hosted checkout.

Use Shopify's product description for all customer-facing condition,
provenance, measurements, edition, material, and care details. Keep searchable
organization in tags so it also appears in the storefront's filters and
"At a glance" ledger.

### Photograph checklist

- Upload the strongest image first; Shopify uses it as the catalogue card and
  featured image.
- Add useful alt text to every image (for example, `Front cover of ...` or
  `Maker's mark on underside`).
- Do not leave alt text blank. The custom site falls back to the product title
  when it is missing, but a specific visual description is substantially more
  useful to customers using screen readers.
- Assign a photograph to a variant when a size, color, format, or condition has
  its own image.
- Photograph condition details honestly; the customer can open every image at
  full size on the custom storefront.

## Genre

Add one or more `Genre:` tags. A product may belong to several genres.

- `Genre: Art`
- `Genre: Biography`
- `Genre: Ephemera`
- `Genre: Encyclopedias`
- `Genre: Esoterica`
- `Genre: Fantasy`
- `Genre: Fiction`
- `Genre: Folklore`
- `Genre: Mythology`
- `Genre: History`
- `Genre: Horror`
- `Genre: Nature`
- `Genre: Natural History`
- `Genre: Oddities`
- `Genre: Philosophy`
- `Genre: Metaphysical`
- `Genre: Poetry`
- `Genre: Rare Books`
- `Genre: Religion`
- `Genre: Spirituality`
- `Genre: Science Fiction`

New `Genre:` values will automatically join the shop's genre dropdown even if they are not in this starter list.

## Author

For books, add `Author: Full Name`. When this tag is absent, the shop uses the Shopify vendor as the author.

## Nature

Use either `Realm: Magical` or `Realm: Mundane`. The plain tags `Magical` and `Mundane` also work.

## Wizard Wear

Add any one of these tags to branded merchandise:

- `Wizard Wear`
- `wizard-wear`
- `merch`

This automatically places the product in the Wizard Wear category.

## Product type

Set Shopify's Product type to the customer-facing category, such as `Books`, `Curios`, `Oddities`, or `Ephemera`.

## Optional descriptive tags

Any additional tag remains visible on the complete product page. Useful
examples include `Edition: First`, `Condition: Very Good`, `Signed`,
`Material: Brass`, or `Era: Victorian`. Only the `Author:`, `Genre:`, and
`Realm:` prefixes have special filtering behavior.
