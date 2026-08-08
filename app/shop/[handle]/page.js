"use client";

/* Shopify supplies external product images and trusted merchant HTML at runtime. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { loadShopifyProduct } from "@/lib/shopify";
import {
  createCartItem,
  formatMoney,
  mapProductDetails,
  variantDisplayName,
} from "@/lib/catalog";
import { useShop } from "../components/ShopShell";

const SHOPIFY_POLICY_BASE =
  "https://wandering-wizard-wares.myshopify.com/policies";

function selectedOptionMap(variant) {
  return Object.fromEntries(
    (variant?.selectedOptions || []).map(({ name, value }) => [name, value])
  );
}

function variantMatches(variant, selections) {
  return variant.selectedOptions.every(
    ({ name, value }) => selections[name] === value
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const handle = Array.isArray(params.handle) ? params.handle[0] : params.handle;
  const { addToCart, openCart } = useShop();
  const [status, setStatus] = useState("loading");
  const [product, setProduct] = useState(null);
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (!handle) return;
    let active = true;
    setStatus("loading");
    loadShopifyProduct(handle)
      .then((rawProduct) => {
        if (!active) return;
        if (!rawProduct) {
          setStatus("not-found");
          return;
        }
        const mappedProduct = mapProductDetails(rawProduct);
        const initialVariant =
          mappedProduct.variants.find((variant) => variant.availableForSale) ||
          mappedProduct.variants[0];
        setProduct(mappedProduct);
        setSelections(selectedOptionMap(initialVariant));
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => { active = false; };
  }, [handle]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((variant) => variantMatches(variant, selections)) ||
      product.variants.find((variant) => variant.availableForSale) ||
      product.variants[0]
    );
  }, [product, selections]);

  useEffect(() => {
    if (!selectedVariant?.image?.url || !product?.images?.length) return;
    const variantImageIndex = product.images.findIndex(
      (image) => image.url === selectedVariant.image.url
    );
    if (variantImageIndex >= 0) setActiveImageIndex(variantImageIndex);
  }, [product, selectedVariant]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const imageCount = product?.images.length || 0;
    document.body.style.overflow = "hidden";
    const close = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft" && imageCount > 1) {
        setActiveImageIndex((current) => current === 0 ? imageCount - 1 : current - 1);
      }
      if (event.key === "ArrowRight" && imageCount > 1) {
        setActiveImageIndex((current) => current === imageCount - 1 ? 0 : current + 1);
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [lightboxOpen, product?.images.length]);

  useEffect(() => {
    if (!product || !descriptionRef.current) return;
    descriptionRef.current.querySelectorAll("img").forEach((image, index) => {
      if (!image.hasAttribute("alt") || !image.alt.trim()) {
        image.alt = `${product.name} — description image ${index + 1}`;
      }
    });
  }, [product]);

  function chooseOption(optionName, optionValue) {
    if (!product) return;
    const preferredSelections = { ...selections, [optionName]: optionValue };
    let nextVariant = product.variants.find((variant) =>
      variantMatches(variant, preferredSelections)
    );
    if (!nextVariant) {
      nextVariant = product.variants.find((variant) =>
        variant.selectedOptions.some(
          ({ name, value }) => name === optionName && value === optionValue
        )
      );
    }
    if (nextVariant) {
      setSelections(selectedOptionMap(nextVariant));
      setQuantity(1);
    }
  }

  function optionValueAvailable(optionName, optionValue) {
    return product?.variants.some(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.some(
          ({ name, value }) => name === optionName && value === optionValue
        )
    );
  }

  function showPreviousImage() {
    if (!product?.images.length) return;
    setActiveImageIndex((current) =>
      current === 0 ? product.images.length - 1 : current - 1
    );
  }

  function showNextImage() {
    if (!product?.images.length) return;
    setActiveImageIndex((current) =>
      current === product.images.length - 1 ? 0 : current + 1
    );
  }

  function addSelectedVariant() {
    if (!product || !selectedVariant?.availableForSale) return;
    addToCart(createCartItem(product, selectedVariant), quantity);
    openCart();
  }

  if (status === "loading") {
    return <ProductState title="Opening the inventory ledger…" copy="Gathering every photograph and detail from Shopify." />;
  }

  if (status === "not-found") {
    return <ProductState title="This finding has wandered on." copy="It may have sold, been archived, or returned to the road." />;
  }

  if (status === "error" || !product || !selectedVariant) {
    return <ProductState title="The ledger is taking the scenic route." copy="Shopify could not return this listing just now." retry />;
  }

  const activeImage = product.images[activeImageIndex];
  const variantName = variantDisplayName(selectedVariant);

  return (
    <>
      <article className="product-detail-page">
        <div className="product-breadcrumb">
          <Link href="/shop"><ArrowLeft size={15} /> Return to all wares</Link>
          <span>{product.category}</span>
        </div>

        <div className="product-detail-grid">
          <section className="product-gallery" aria-label={`${product.name} photographs`}>
            {activeImage ? (
              <button
                className="product-main-image"
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Enlarge photograph ${activeImageIndex + 1} of ${product.images.length}`}
              >
                <img src={activeImage.url} alt={activeImage.altText || product.name} />
                <span><Expand size={15} /> View full size</span>
              </button>
            ) : (
              <div className="product-main-image product-image-placeholder">
                <ShoppingBag size={54} strokeWidth={1} />
                <span>Photograph forthcoming</span>
              </div>
            )}

            {product.images.length > 1 && (
              <div className="product-thumbnails" aria-label="Choose a photograph">
                {product.images.map((image, index) => (
                  <button
                    type="button"
                    className={activeImageIndex === index ? "active" : ""}
                    key={image.id}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Show photograph ${index + 1} of ${product.images.length}`}
                    aria-pressed={activeImageIndex === index}
                  >
                    <img src={image.url} alt="" />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="gallery-count">
              {product.images.length} {product.images.length === 1 ? "photograph" : "photographs"} from the inventory ledger
            </p>
          </section>

          <section className="product-purchase-panel">
            <p className="eyebrow">A FINDING FROM THE ROAD</p>
            <div className="product-title-meta">
              <span>{product.category}</span>
              {product.realm && <span>{product.realm}</span>}
            </div>
            <h1>{product.name}</h1>
            {product.author && <p className="product-byline">By {product.author}</p>}

            <div className="product-price" aria-live="polite">
              <strong>{formatMoney(selectedVariant.price.amount, selectedVariant.price.currencyCode)}</strong>
              {selectedVariant.compareAtPrice?.amount > selectedVariant.price.amount && (
                <del>{formatMoney(selectedVariant.compareAtPrice.amount, selectedVariant.compareAtPrice.currencyCode)}</del>
              )}
            </div>

            {product.options.map((option) => (
              <fieldset className="variant-option" key={option.name}>
                <legend>{option.name}: <strong>{selections[option.name]}</strong></legend>
                <div>
                  {option.values.map((value) => {
                    const available = optionValueAvailable(option.name, value);
                    return (
                      <button
                        type="button"
                        className={selections[option.name] === value ? "active" : ""}
                        key={value}
                        onClick={() => chooseOption(option.name, value)}
                        aria-pressed={selections[option.name] === value}
                      >
                        {value}
                        {!available && <small>Unavailable</small>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {variantName && <p className="selected-variant">Selected: {variantName}</p>}

            <div className={`availability ${selectedVariant.availableForSale ? "available" : "unavailable"}`}>
              <span />
              {selectedVariant.availableForSale ? "In stock and ready to wander" : "Currently unavailable"}
            </div>

            <div className="product-add-row">
              <div className="product-quantity" aria-label="Quantity">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Decrease quantity"><Minus size={15} /></button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((current) => Math.min(20, current + 1))} aria-label="Increase quantity"><Plus size={15} /></button>
              </div>
              <button
                className="product-add-button"
                type="button"
                disabled={!selectedVariant.availableForSale}
                onClick={addSelectedVariant}
              >
                <ShoppingBag size={18} />
                {selectedVariant.availableForSale ? "Add to satchel" : "Sold out"}
              </button>
            </div>

            <div className="product-assurances">
              <div><PackageCheck size={20} /><span><b>Shipped with care</b><small>Packaged in the Tower</small></span></div>
              <div><RotateCcw size={20} /><span><b>14-day return window</b><small><a href={`${SHOPIFY_POLICY_BASE}/refund-policy`}>Read the return policy</a></small></span></div>
              <div><ShieldCheck size={20} /><span><b>Secure checkout</b><small>Payment handled by Shopify</small></span></div>
            </div>
          </section>
        </div>

        <section className="product-description-section" aria-labelledby="product-description-title">
          <div className="product-description-copy">
            <p className="eyebrow dark">THE FULL ACCOUNT</p>
            <h2 id="product-description-title">Details from the ledger.</h2>
            {product.descriptionHtml ? (
              <div
                ref={descriptionRef}
                className="shopify-description"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <p>{product.description || "Further details are forthcoming."}</p>
            )}
          </div>

          <aside className="product-ledger" aria-label="Product information">
            <h3>At a glance</h3>
            <dl>
              <div><dt>Category</dt><dd>{product.category}</dd></div>
              {product.author && <div><dt>Author</dt><dd>{product.author}</dd></div>}
              {product.genres.length > 0 && <div><dt>Genre</dt><dd>{product.genres.join(", ")}</dd></div>}
              {product.realm && <div><dt>Nature</dt><dd>{product.realm}</dd></div>}
              {product.vendor && <div><dt>Vendor</dt><dd>{product.vendor}</dd></div>}
              {selectedVariant.sku && <div><dt>SKU</dt><dd>{selectedVariant.sku}</dd></div>}
              {variantName && <div><dt>Selection</dt><dd>{variantName}</dd></div>}
            </dl>
            {product.tags.length > 0 && (
              <div className="product-all-tags">
                <h4>Shopify tags</h4>
                <div>{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>
            )}
          </aside>
        </section>
      </article>

      {lightboxOpen && activeImage && (
        <div className="product-lightbox" role="dialog" aria-modal="true" aria-label={`${product.name} enlarged photograph`}>
          <button className="lightbox-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Close enlarged photograph"><X /></button>
          {product.images.length > 1 && (
            <button className="lightbox-previous" type="button" onClick={showPreviousImage} aria-label="Previous photograph"><ChevronLeft /></button>
          )}
          <img src={activeImage.url} alt={activeImage.altText || product.name} />
          {product.images.length > 1 && (
            <button className="lightbox-next" type="button" onClick={showNextImage} aria-label="Next photograph"><ChevronRight /></button>
          )}
          <p>{activeImageIndex + 1} / {product.images.length}</p>
        </div>
      )}
    </>
  );
}

function ProductState({ title, copy, retry = false }) {
  return (
    <section className="product-state" role="status">
      <ShoppingBag size={38} strokeWidth={1} />
      <p className="eyebrow">THE INVENTORY LEDGER</p>
      <h1>{title}</h1>
      <p>{copy}</p>
      {retry ? (
        <button type="button" onClick={() => window.location.reload()}>Try again</button>
      ) : (
        <Link href="/shop">Return to all wares <ChevronRight size={15} /></Link>
      )}
    </section>
  );
}
