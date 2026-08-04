"use client";

/* Shopify supplies external product images at runtime. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mark } from "@/app/components/BrandMarks";
import {
  createShopifyCheckout,
  isShopifyConfigured,
  loadShopifyProducts,
} from "@/lib/shopify";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Menu,
  Minus,
  MoonStar,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

const CART_STORAGE_KEY = "wandering-wizard-wares-cart-v1";
const INSTAGRAM_URL = "https://www.instagram.com/justawanderingwizard/";
const YOUTUBE_URL = "https://www.youtube.com/@justawanderingwizard";
const SHOPIFY_POLICY_BASE =
  "https://wandering-wizard-wares.myshopify.com/policies";
const WIZARD_WEAR_CATEGORY = "Wizard Wear";
const SHOP_GENRES = [
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

function tagValue(tags, prefix) {
  const match = tags.find((tag) =>
    tag.toLowerCase().startsWith(`${prefix.toLowerCase()}:`)
  );
  return match ? match.slice(match.indexOf(":") + 1).trim() : "";
}

function tagValues(tags, prefix) {
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

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mapProduct(product, index) {
  const tags = product.tags || [];
  const isWizardWear = tags.some((tag) =>
    ["wizard-wear", "wizard wear", "merch"].includes(tag.toLowerCase())
  );
  const category =
    isWizardWear
      ? WIZARD_WEAR_CATEGORY
      : product.productType ||
        (tags.some((tag) => tag.toLowerCase() === "book") ? "Books" : "Wares");
  const author = tagValue(tags, "author") ||
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

  return {
    id: product.id,
    name: product.title,
    handle: product.handle,
    subtitle: product.description || "Details forthcoming from the inventory ledger.",
    category,
    author,
    genres,
    realm,
    tags,
    price: Number(product.variant.price.amount),
    currencyCode: product.variant.price.currencyCode,
    palette: productPalettes[index % productPalettes.length],
    image: product.featuredImage?.url,
    imageAlt: product.featuredImage?.altText,
    variantId: product.variant.id,
  };
}

function ProductCard({ product, addToCart }) {
  return (
    <article className="product-card">
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
        <p>{product.subtitle}</p>
        {(product.genres.length || product.realm) && (
          <div className="product-facets">
            {product.genres.map((productGenre) => (
              <span key={productGenre}>{productGenre}</span>
            ))}
            {product.realm && <span>{product.realm}</span>}
          </div>
        )}
        <div className="product-foot">
          <strong>${product.price.toFixed(2)}</strong>
          <button
            className="quick-add"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to satchel`}
          >
            <ShoppingBag size={16} /> Add
          </button>
        </div>
      </div>
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
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const facets = useMemo(() => ({
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
  }), [catalog]);

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
      ].join(" ").toLowerCase();
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
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (!isShopifyConfigured()) return;
    loadShopifyProducts()
      .then((products) => {
        setCatalog(products.map(mapProduct));
        setCatalogStatus("ready");
      })
      .catch(() => {
        setCatalogStatus("error");
        setToast("The Shopify catalog is taking the scenic route.");
      });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setCart(parsed);
        }
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        setCartHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Checkout remains available if local storage is disabled.
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, menuOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setToast(`${product.name} added to your satchel`);
  }

  function changeQuantity(id, amount) {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0));
  }

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setAuthor("All");
    setGenre("All");
    setRealm("All");
  }

  async function beginCheckout() {
    setCheckoutLoading(true);
    try {
      const checkoutUrl = await createShopifyCheckout(cart);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setToast(error.message || "Shopify checkout could not be opened.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="shop-page">
      <header className="site-header shop-header">
        <img
          className="header-heraldry"
          src="/images/brand/serpentine-heraldry-v1.webp"
          alt=""
          aria-hidden="true"
        />
        <Link className="brand" href="/" aria-label="Wandering Wizard Wares home">
          <span><b>Wandering Wizard Wares</b><small>MENAGERIE OF THE MAGICAL AND MUNDANE</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Shop navigation">
          <Link href="/"><ArrowLeft size={14} /> Return to the road</Link>
          <Link href="/#story">About the Wizard</Link>
          <Link href="/#journal">Field notes</Link>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a>
          <a href={YOUTUBE_URL} target="_blank" rel="noreferrer">YouTube</a>
        </nav>
        <div className="header-actions">
          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open satchel, ${cartCount} items`}
          >
            <ShoppingBag size={19} /><span>Satchel</span><b>{cartCount}</b>
          </button>
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

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
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
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

      <footer className="shop-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="brand brand-light" href="/"><Mark /><span><b>Wandering Wizard</b><small>WARES FOR THE CURIOUS</small></span></Link>
            <p>Curious goods for curious folk,<br />gathered wherever the road leads.</p>
          </div>
          <div className="footer-links">
            <div><b>Explore</b><Link href="/">The road home</Link><Link href="/#story">About the Wizard</Link><Link href="/#journal">Field notes</Link></div>
            <div><b>Good to know</b><a href={`${SHOPIFY_POLICY_BASE}/shipping-policy`}>Shipping</a><a href={`${SHOPIFY_POLICY_BASE}/refund-policy`}>Returns</a><a href={`${SHOPIFY_POLICY_BASE}/privacy-policy`}>Privacy</a></div>
            <div><b>Come find us</b><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a><a href="mailto:thewizard@wanderingwizardwares.com">Send a raven</a></div>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2026 Wandering Wizard Wares</span><span>Secure checkout by Shopify</span></div>
        <div className="footer-signature">
          <img
            src="/images/brand/www-logo-v3.webp"
            alt="Wandering Wizard Wares emblem of four engraved alchemical symbols"
            width="956"
            height="935"
            loading="lazy"
          />
        </div>
      </footer>

      {(cartOpen || menuOpen) && <button className="scrim" aria-label="Close overlay" onClick={() => { setCartOpen(false); setMenuOpen(false); }} />}
      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <div><p className="eyebrow dark">YOUR SATCHEL</p><h2>{cartCount ? `${cartCount} good${cartCount === 1 ? "" : "s"}` : "Light as a feather"}</h2></div>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button>
        </div>
        {cart.length ? <>
          <div className="cart-items">{cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className={`cart-thumb ${item.palette}`}>{item.image ? <img src={item.image} alt="" /> : <BookOpen strokeWidth={1.2} />}</div>
              <div><h3>{item.name}</h3><p>${item.price.toFixed(2)}</p><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button></div></div>
              <strong>${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          ))}</div>
          <div className="cart-summary"><div><span>Subtotal</span><strong>${cartTotal.toFixed(2)}</strong></div><p>Shipping and taxes are calculated securely by Shopify.</p><button className="checkout-button" onClick={beginCheckout} disabled={checkoutLoading}>{checkoutLoading ? "Opening Shopify…" : "Continue to secure checkout"} <ArrowRight size={17} /></button></div>
        </> : <div className="empty-cart"><ShoppingBag size={42} strokeWidth={1} /><p>Your next favorite oddity is waiting.</p><button onClick={() => setCartOpen(false)}>Continue perusing</button></div>}
      </aside>

      <aside className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawer-head"><Mark /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
        <nav><Link href="/" onClick={() => setMenuOpen(false)}>The road home <span>01</span></Link><Link href="/#story" onClick={() => setMenuOpen(false)}>About the Wizard <span>02</span></Link><Link href="/#journal" onClick={() => setMenuOpen(false)}>Field notes <span>03</span></Link><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram <span>04</span></a><a href={YOUTUBE_URL} target="_blank" rel="noreferrer">YouTube <span>05</span></a></nav>
      </aside>

      <div className={`toast ${toast ? "show" : ""}`} role="status"><Check size={16} /> {toast}</div>
    </main>
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
