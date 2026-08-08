"use client";

/* Shopify supplies external product images at runtime. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, MoonStar, Search } from "lucide-react";
import { isShopifyConfigured, loadShopifyProducts } from "@/lib/shopify";
import {
  formatMoney,
  mapProductSummary,
  SHOP_GENRES,
  WIZARD_WEAR_CATEGORY,
} from "@/lib/catalog";

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link className="product-card-link" href={`/shop/${product.handle}`}>
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
        <div className="product-copy">
          <div className="product-meta">
            <span>{product.category}</span>
            {product.author && <span>{product.author}</span>}
          </div>
          <h3>{product.name}</h3>
          {(product.genres.length > 0 || product.realm) && (
            <div className="product-facets">
              {product.genres.map((productGenre) => (
                <span key={productGenre}>{productGenre}</span>
              ))}
              {product.realm && <span>{product.realm}</span>}
            </div>
          )}
          <div className="product-foot">
            <strong>{formatMoney(product.price, product.currencyCode)}</strong>
            <span className="quick-add">View full listing <ArrowRight size={15} /></span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function Shop() {
  const [catalog, setCatalog] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState(() =>
    isShopifyConfigured() ? "loading" : "unavailable"
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [author, setAuthor] = useState("All");
  const [genre, setGenre] = useState("All");
  const [realm, setRealm] = useState("All");

  const facets = useMemo(
    () => ({
      categories: [
        ...new Set([
          ...catalog.map((product) => product.category).filter(Boolean),
          WIZARD_WEAR_CATEGORY,
        ]),
      ].sort(),
      authors: [...new Set(catalog.map((product) => product.author).filter(Boolean))].sort(),
      genres: [
        ...new Set([
          ...SHOP_GENRES,
          ...catalog.flatMap((product) => product.genres),
        ]),
      ].sort(),
      realms: [...new Set(catalog.map((product) => product.realm).filter(Boolean))].sort(),
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
        (realm === "All" || product.realm === realm)
      );
    });
  }, [author, catalog, category, genre, query, realm]);

  const hasFilters =
    Boolean(query) || [category, author, genre, realm].some((value) => value !== "All");

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
  }

  return (
    <>
      <section className="shop-hero">
        <div>
          <p className="eyebrow">ENTER THE SHOP</p>
          <h1>Peruse the <em>wares.</em></h1>
          <p>
            All the wizard&apos;s wares: Books, curios, oddities, ephemera and
            wizard wear.
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
          <FilterSelect label="Category" value={category} values={facets.categories} onChange={setCategory} />
          <FilterSelect label="Author" value={author} values={facets.authors} onChange={setAuthor} />
          <FilterSelect label="Genre" value={genre} values={facets.genres} onChange={setGenre} />
          <FilterSelect label="Nature" value={realm} values={facets.realms} onChange={setRealm} />
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
                onClick={() => setGenre(genre === shopGenre ? "All" : shopGenre)}
              >
                {shopGenre}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-status-line">
          <span>{visibleProducts.length} {visibleProducts.length === 1 ? "curio" : "curios"} found</span>
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
