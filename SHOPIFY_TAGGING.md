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

- `Genre: Alchemy`
- `Genre: Art`
- `Genre: Arthurian`
- `Genre: Biography`
- `Genre: Conspiracy`
- `Genre: Eastern Wisdom`
- `Genre: Encyclopedias`
- `Genre: Ephemera`
- `Genre: Esoterica`
- `Genre: Fantasy`
- `Genre: Fiction`
- `Genre: Folklore`
- `Genre: Graphic Novels`
- `Genre: Hermeticism`
- `Genre: History`
- `Genre: Horror`
- `Genre: Limited Editions`
- `Genre: Magic`
- `Genre: Metaphysical`
- `Genre: Mystery`
- `Genre: Mythology`
- `Genre: Natural Magic`
- `Genre: Nature`
- `Genre: New Age`
- `Genre: Oddities`
- `Genre: Philosophy`
- `Genre: Picture Books`
- `Genre: Poetry`
- `Genre: Rare Books`
- `Genre: Religion`
- `Genre: Rosicrucianism`
- `Genre: Science`
- `Genre: Science Fiction`
- `Genre: Self-Help`
- `Genre: Shamanism`
- `Genre: Spirituality`
- `Genre: Wicca`
- `Genre: Witchcraft`

New `Genre:` values automatically join the shop's genre dropdown even if they are not in this starter list. `Natural History` is intentionally excluded from the custom storefront.

## Author

For books, add `Author: Full Name`. When this tag is absent, the shop uses the Shopify vendor only when the vendor is not `Wandering Wizard Wares`.

## Nature

Use either `Realm: Magical` or `Realm: Mundane`. The plain tags `Magical` and `Mundane` also work.

## Product type

Set Shopify's Product type to one of the four customer-facing categories: `Books`, `Curios`, `Oddities`, or `Ephemera`. Other product types fall back to `Curios` in the custom storefront.

## Optional descriptive tags

Any additional tag remains visible on the complete product page. Useful
examples include `Edition: First`, `Condition: Very Good`, `Signed`,
`Material: Brass`, or `Era: Victorian`. Every tag is clickable on the full
listing. `Author:`, `Genre:`, and `Realm:` tags open their dedicated shop
filter; other tags open an exact Shopify-tag view.
