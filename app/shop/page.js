"use client";

/* Shopify supplies external product images at runtime. */
/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, MoonStar, Search } from "lucide-react";
import { isShopifyConfigured, loadShopifyProducts } from "@/lib/shopify";
import {
  EXCLUDED_SHOP_GENRES,
  formatMoney,
  mapProductSummary,
  SHOP_CATEGORIES,
  SHOP_GENRES,
  shopFilterHref,
} from "@/lib/catalog";

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link
        className="product-card-image-link"
        href={`/shop/${product.handle}`}
        aria-label={`View the complete listing for ${product.name}`}
      >
        <div className={`product-art ${product.palette}`}>
          {product.image ? (
            <img
              className="shopify-product-image"
              src={product.image}
              alt={product.imageAlt || product.name}
            />
          ) : (
            <>
              <span className="orbit orbit-one" />
              <span className="orbit orbit-two" />
              <BookOpen className="product-icon" strokeWidth={1.15} aria-hidden="true" />
            </>
          )}
          {product.realm && <span className="product-badge">{product.realm}</span>}
        </div>
      </Link>
      <div className="product-copy">
        <div className="product-meta">
          <ProductFilterLink filter="category" value={product.category} />
          {product.author && <ProductFilterLink filter="author" value={product.author} />}
        </div>
        <h3>
          <Link className="product-card-title-link" href={`/shop/${product.handle}`}>
            {product.name}
          </Link>
        </h3>
        {(product.genres.length > 0 || product.realm) && (
          <div className="product-facets" aria-label={`Browse tags for ${product.name}`}>
            {product.genres.map((productGenre) => (
              <ProductFilterLink key={productGenre} filter="genre" value={productGenre} />
            ))}
            {product.realm && <ProductFilterLink filter="realm" value={product.realm} />}
          </div>
        )}
        <div className="product-foot">
          <strong>{formatMoney(product.price, product.currencyCode)}</strong>
          <Link className="quick-add" href={`/shop/${product.handle}`}>
            View full listing <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductFilterLink({ filter, value }) {
  return (
    <Link className="product-filter-link" href={shopFilterHref(filter, value)}>
      {value}
    </Link>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<CatalogMessage title="Opening the inventory ledger…" copy="Preparing the complete collection." />}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [catalog, setCatalog] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState(() =>
    isShopifyConfigured() ? "loading" : "unavailable"
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [author, setAuthor] = useState("All");
  const [genre, setGenre] = useState("All");
  const [realm, setRealm] = useState("All");
  const [tag, setTag] = useState("");

  const facets = useMemo(
    () => ({
      categories: SHOP_CATEGORIES,
      authors: [...new Set(catalog.map((product) => product.author).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second)),
      genres: [
        ...new Set([
          ...SHOP_GENRES,
          ...catalog.flatMap((product) => product.genres),
        ]),
      ]
        .filter(
          (entry) =>
            !EXCLUDED_SHOP_GENRES.some(
              (excluded) => excluded.toLowerCase() === entry.toLowerCase()
            )
        )
        .sort((first, second) => first.localeCompare(second)),
      realms: [...new Set(catalog.map((product) => product.realm).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second)),
    }),
    [catalog]
  );

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalog.filter((product) => {
      const searchable = [
        product.name,
        product.subtitle,
        product.category,
        product.author,
        ...product.genres,
        product.realm,
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!needle || searchable.includes(needle)) &&
        (category === "All" || product.category === category) &&
        (author === "All" || product.author === author) &&
        (genre === "All" || product.genres.includes(genre)) &&
        (realm === "All" || product.realm === realm) &&
        (!tag || product.tags.some((productTag) => productTag.toLowerCase() === tag.toLowerCase()))
      );
    });
  }, [author, catalog, category, genre, query, realm, tag]);

  const hasFilters =
    Boolean(query || tag) || [category, author, genre, realm].some((value) => value !== "All");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "All");
    setAuthor(searchParams.get("author") || "All");
    setGenre(searchParams.get("genre") || "All");
    setRealm(searchParams.get("realm") || "All");
    setTag(searchParams.get("tag") || "");
  }, [searchKey, searchParams]);

  useEffect(() => {
    if (!isShopifyConfigured()) return;
    loadShopifyProducts()
      .then((products) => {
        setCatalog(products.map(mapProductSummary));
        setCatalogStatus("ready");
      })
      .catch(() => setCatalogStatus("error"));
  }, []);

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setAuthor("All");
    setGenre("All");
    setRealm("All");
    setTag("");
  }

  return (
    <>
      <section className="shop-hero">
        <div>
          <p className="eyebrow">ENTER THE SHOP</p>
          <h1>Peruse the <em>wares.</em></h1>
          <p>
            All the wizard&apos;s wares: books, curios, oddities, and ephemera.
          </p>
        </div>
      </section>

      <section className="shop-catalog" aria-labelledby="catalog-title">
        <div className="catalog-intro">
          <div>
            <p className="eyebrow dark">THE FULL OFFERING</p>
            <h2 id="catalog-title">Find what calls to you.</h2>
          </div>
          <p>
            Search freely, or narrow the ledger by author, genre, and the
            magical or beautifully mundane nature of the piece.
          </p>
        </div>

        <div className="catalog-controls" aria-label="Filter the wares">
          <label className="catalog-search">
            <span className="sr-only">Search the wares</span>
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, author, genre…"
            />
          </label>
          <FilterSelect label="Category" value={category} values={facets.categories} onChange={(value) => { setTag(""); setCategory(value); }} />
          <FilterSelect label="Author" value={author} values={facets.authors} onChange={(value) => { setTag(""); setAuthor(value); }} />
          <FilterSelect label="Genre" value={genre} values={facets.genres} onChange={(value) => { setTag(""); setGenre(value); }} />
          <FilterSelect label="Nature" value={realm} values={facets.realms} onChange={(value) => { setTag(""); setRealm(value); }} />
        </div>

        <div className="genre-shortcuts" aria-label="Browse by genre">
          <span>Browse by genre</span>
          <div>
            {SHOP_GENRES.map((shopGenre) => (
              <button
                className={genre === shopGenre ? "active" : ""}
                type="button"
                key={shopGenre}
                aria-pressed={genre === shopGenre}
                onClick={() => { setTag(""); setGenre(genre === shopGenre ? "All" : shopGenre); }}
              >
                {shopGenre}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-status-line">
          <span>
            {visibleProducts.length} {visibleProducts.length === 1 ? "curio" : "curios"} found
            {tag ? ` · Shopify tag: ${tag}` : ""}
          </span>
          {hasFilters && <button onClick={clearFilters}>Clear all filters</button>}
        </div>

        {catalogStatus === "loading" ? (
          <CatalogMessage title="Consulting the inventory ledger…" copy="The latest wares are being gathered from Shopify." />
        ) : visibleProducts.length ? (
          <div className="product-grid shop-product-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : catalogStatus === "ready" && hasFilters ? (
          <CatalogMessage title="That curiosity is still out wandering." copy="Try another phrase or clear the filters to return to the full collection.">
            <button onClick={clearFilters}>Show all wares</button>
          </CatalogMessage>
        ) : catalogStatus === "ready" ? (
          <CatalogMessage title="The cart is being stocked." copy="Real wares will appear as soon as their photographs, details, and prices are published in Shopify." />
        ) : (
          <CatalogMessage title="The inventory ledger is taking the scenic route." copy="No substitute or fictional products will be shown.">
            <button onClick={() => window.location.reload()}>Try the catalog again</button>
          </CatalogMessage>
        )}
      </section>
    </>
  );
}

function FilterSelect({ label, value, values, onChange }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">All</option>
        {values.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
      </select>
    </label>
  );
}

function CatalogMessage({ title, copy, children }) {
  return (
    <div className="catalog-message" role="status">
      <MoonStar size={30} />
      <h3>{title}</h3>
      <p>{copy}</p>
      {children}
    </div>
  );
}
