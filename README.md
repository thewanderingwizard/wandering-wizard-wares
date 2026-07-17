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
Shopify products and sends the satchel to Shopify's hosted secure checkout.
Without them, it displays the curated fallback catalog.

## Vercel

The included `vercel.json` selects the native Next.js build. Add the three
Shopify environment variables to Production, Preview, and Development in
Vercel before deploying.

After deployment, attach both `wanderingwizardwares.com` and
`www.wanderingwizardwares.com` in the project domain settings and choose the
preferred redirect.
