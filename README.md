# Wandering Wizard Wares

A book-led fantasy storefront built with Next.js, React, and Shopify's
Storefront Cart API.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` to connect a Shopify catalog:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=wandering-wizard-wares.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_public_storefront_token
NEXT_PUBLIC_SHOPIFY_API_VERSION=2026-07
```

When those values are present, the storefront automatically displays active
Shopify products. Catalogue cards open complete product pages with every
photograph, rich description, tag, option, variant, price, SKU, and availability
state. The selected variant and quantity are then sent to Shopify's hosted
secure checkout.
If Shopify is unavailable or no products are published, the storefront shows
an honest empty state and never substitutes fictional inventory.

The homepage also links the current Substack field notes using their canonical
post URLs and embeds Substack's official subscription form.

## Organizing the catalogue

The complete Shopify catalogue lives at `/shop`. Product types populate the
category filter automatically. Add the following Shopify product tags to make
the remaining filters work without changing the site code:

- `author:Author Name`
- `genre:Genre Name`
- `realm:magical` or `realm:mundane`

For books without an `author:` tag, the Shopify vendor is used as the author.
Plain `magical` and `mundane` tags are also recognized. Products are never
invented or filled in when Shopify data is unavailable.

For the owner-only Sites review host, `npm run build:sites` packages the
statically generated storefront with a minimal asset worker. Shopify catalog
and cart requests continue to run securely in the visitor's browser.

## Vercel

The included `vercel.json` selects the native Next.js build. Add the three
Shopify environment variables to Production, Preview, and Development in
Vercel before deploying.

After deployment, attach both `wanderingwizardwares.com` and
`www.wanderingwizardwares.com` in the project domain settings and choose the
preferred redirect.
