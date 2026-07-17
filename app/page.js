"use client";

/* Shopify supplies external product images at runtime; Next image optimization is
   intentionally disabled for this portable headless storefront. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  createShopifyCheckout,
  isShopifyConfigured,
  loadShopifyProducts,
} from "@/lib/shopify";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleUserRound,
  Compass,
  Flame,
  Gem,
  Leaf,
  Menu,
  Minus,
  MoonStar,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  X,
} from "lucide-react";

const products = [
  {
    id: 1,
    name: "The Wandering Wizard's Book of Doors",
    handle: "the-wandering-wizards-book-of-doors",
    subtitle: "Threshold lore for the curious and courageous.",
    category: "Books",
    price: 42,
    rating: 4.9,
    reviews: 118,
    badge: "Bestseller",
    icon: BookOpen,
    palette: "ink",
  },
  {
    id: 2,
    name: "Mossbound Field Journal",
    handle: "mossbound-field-journal",
    subtitle: "Weatherproof pages for wild discoveries.",
    category: "Books",
    price: 28,
    rating: 4.8,
    reviews: 84,
    badge: "New",
    icon: BookOpen,
    palette: "moss",
  },
  {
    id: 3,
    name: "A Pocket Atlas of Friendly Stars",
    handle: "a-pocket-atlas-of-friendly-stars",
    subtitle: "Night-sky lore for windowsills and campfires.",
    category: "Books",
    price: 36,
    rating: 5.0,
    reviews: 63,
    badge: "Limited",
    icon: MoonStar,
    palette: "moon",
  },
  {
    id: 4,
    name: "The Roadside Herbal",
    handle: "the-roadside-herbal",
    subtitle: "Useful leaves, roots, remedies, and warnings.",
    category: "Books",
    price: 38,
    rating: 4.7,
    reviews: 96,
    icon: Leaf,
    palette: "sage",
  },
  {
    id: 5,
    name: "Grimoire of Everyday Enchantments",
    handle: "grimoire-of-everyday-enchantments",
    subtitle: "Small household magic for ordinary Tuesdays.",
    category: "Books",
    price: 44,
    rating: 4.9,
    reviews: 51,
    icon: Sparkles,
    palette: "quartz",
  },
  {
    id: 6,
    name: "Emberglass Lantern",
    handle: "emberglass-lantern",
    subtitle: "A pocket-sized glow for uncertain paths.",
    category: "Tools",
    price: 64,
    rating: 4.8,
    reviews: 72,
    icon: Flame,
    palette: "ember",
  },
  {
    id: 7,
    name: "Celestial Pocket Dial",
    handle: "celestial-pocket-dial",
    subtitle: "Find north, noon, and the nearest wish.",
    category: "Instruments",
    price: 78,
    rating: 4.8,
    reviews: 127,
    icon: Compass,
    palette: "brass",
  },
  {
    id: 8,
    name: "Wayfinder's Quartz",
    handle: "wayfinders-quartz",
    subtitle: "A clear companion for tangled decisions.",
    category: "Talismans",
    price: 46,
    rating: 4.9,
    reviews: 44,
    icon: Gem,
    palette: "quartz",
  },
];

const productPalettes = ["ink", "moss", "moon", "sage", "quartz", "ember", "brass", "sky"];
const productIcons = [BookOpen, BookOpen, MoonStar, Leaf, Sparkles, Flame, Compass, Gem];

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <MoonStar size={22} strokeWidth={1.7} />
    </span>
  );
}

function MetatronsCube({ className = "" }) {
  const outer = [
    [50, 12],
    [83, 31],
    [83, 69],
    [50, 88],
    [17, 69],
    [17, 31],
  ];
  const inner = [
    [50, 31],
    [66.5, 40.5],
    [66.5, 59.5],
    [50, 69],
    [33.5, 59.5],
    [33.5, 40.5],
  ];

  return (
    <svg
      className={`metatron-cube ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <g className="cube-lines">
        <path d="M50 12 83 69 17 69Z M50 88 83 31 17 31Z" />
        <path d="M50 12V88M17 31 83 69M83 31 17 69" />
        <path d="M50 31 66.5 59.5 33.5 59.5ZM50 69 66.5 40.5 33.5 40.5Z" />
        <path d="M50 50 50 12M50 50 83 31M50 50 83 69M50 50 50 88M50 50 17 69M50 50 17 31" />
        <path d="M50 12 66.5 40.5 83 69 50 69 17 69 33.5 40.5ZM83 31 66.5 59.5 50 88 33.5 59.5 17 31 50 31Z" />
      </g>
      <g className="cube-circles">
        <circle cx="50" cy="50" r="8" />
        {inner.map(([cx, cy]) => <circle key={`i-${cx}-${cy}`} cx={cx} cy={cy} r="8" />)}
        {outer.map(([cx, cy]) => <circle key={`o-${cx}-${cy}`} cx={cx} cy={cy} r="8" />)}
      </g>
    </svg>
  );
}

function ProductCard({ product, addToCart }) {
  const Icon = product.icon;
  return (
    <article className="product-card">
      <div className={`product-art ${product.palette}`}>
        {product.badge && <span className="product-badge">{product.badge}</span>}
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
            <Icon className="product-icon" strokeWidth={1.15} aria-hidden="true" />
            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">·</span>
          </>
        )}
      </div>
      <div className="product-copy">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="rating">
            <Star size={13} fill="currentColor" aria-hidden="true" />
            {product.rating} <span>({product.reviews})</span>
          </span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.subtitle}</p>
        <div className="product-foot">
          <strong>${product.price}</strong>
          <button
            className="quick-add"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to satchel`}
          >
            <ShoppingBag size={16} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [catalog, setCatalog] = useState(products);
  const [activeCategory, setActiveCategory] = useState("All wares");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const categories = useMemo(
    () => ["All wares", ...new Set(catalog.map((product) => product.category))],
    [catalog]
  );

  const visibleProducts = useMemo(() => {
    return catalog.filter((product) => {
      const inCategory =
        activeCategory === "All wares" || product.category === activeCategory;
      const matchesSearch =
        !search ||
        `${product.name} ${product.subtitle} ${product.category}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return inCategory && matchesSearch;
    });
  }, [activeCategory, catalog, search]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, menuOpen]);

  useEffect(() => {
    if (!isShopifyConfigured()) return;

    loadShopifyProducts()
      .then((shopifyProducts) => {
        if (!shopifyProducts.length) return;
        setCatalog(
          shopifyProducts.map((product, index) => ({
            id: product.id,
            name: product.title,
            handle: product.handle,
            subtitle: product.description || "A curious good, gathered for the road.",
            category:
              product.productType ||
              (product.tags.some((tag) => tag.toLowerCase() === "book")
                ? "Books"
                : "Wares"),
            price: Number(product.variant.price.amount),
            currencyCode: product.variant.price.currencyCode,
            rating: 5,
            reviews: null,
            badge: index < 2 ? "From Shopify" : null,
            icon: productIcons[index % productIcons.length],
            palette: productPalettes[index % productPalettes.length],
            image: product.featuredImage?.url,
            imageAlt: product.featuredImage?.altText,
            variantId: product.variant.id,
          }))
        );
      })
      .catch(() => {
        setToast("The Shopify catalog is taking the scenic route.");
      });
  }, []);

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setToast(`${product.name} added to your satchel`);
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + amount } : item
        )
        .filter((item) => item.quantity > 0)
    );
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

  function submitNewsletter(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <main>
      <div className="announcement">
        <span>✦</span>
        Free parcel post on orders over $75
        <span>✦</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#" aria-label="Wandering Wizard Wares home">
          <Mark />
          <span>
            <b>Wandering Wizard</b>
            <small>WARES FOR THE CURIOUS</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#shop">Shop wares</a>
          <a href="#story">Our travels</a>
          <a href="#notes">Field notes</a>
          <a href="#visit">Find the cart</a>
        </nav>

        <div className="header-actions">
          <button
            className="icon-button search-button"
            aria-label="Search wares"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search size={20} />
          </button>
          <button className="icon-button account-button" aria-label="Account">
            <CircleUserRound size={20} />
          </button>
          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open satchel, ${cartCount} items`}
          >
            <ShoppingBag size={19} />
            <span>Satchel</span>
            <b>{cartCount}</b>
          </button>
          <button
            className="icon-button menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {searchOpen && (
          <div className="search-panel">
            <Search size={18} />
            <input
              autoFocus
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by curiosity..."
              aria-label="Search products"
            />
            <button onClick={() => { setSearchOpen(false); setSearch(""); }} aria-label="Close search">
              <X size={18} />
            </button>
          </div>
        )}
      </header>

      <section className="hero">
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">THE CART HAS ARRIVED</p>
          <h1>Curios for the <em>curious.</em></h1>
          <p className="hero-intro">
            Useful oddities, storied objects, and small enchantments gathered
            from every road we wander.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#shop">
              Browse the wares <ArrowRight size={17} />
            </a>
            <a className="text-link" href="#story">
              Meet the wanderer <span>↗</span>
            </a>
          </div>
        </div>
        <div className="hero-note">
          <span className="note-line" />
          <span>Currently camped</span>
          <strong>Starfall Meadow</strong>
          <small>for three moons only</small>
        </div>
        <a className="scroll-cue" href="#shop" aria-label="Scroll to shop">
          <ChevronDown size={19} />
        </a>
      </section>

      <section className="promises" aria-label="Shop benefits">
        <div>
          <Sparkles size={21} />
          <span><b>Genuinely unusual</b><small>No ordinary objects here</small></span>
        </div>
        <div>
          <PackageCheck size={21} />
          <span><b>Wrapped with wonder</b><small>Gift-ready, always</small></span>
        </div>
        <div>
          <ShieldCheck size={21} />
          <span><b>30-day charm</b><small>Easy, friendly returns</small></span>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">FRESH FROM THE CART</p>
            <h2>Objects with a little <em>story</em> in them.</h2>
          </div>
          <p>
            Each piece is chosen for usefulness, beauty, or the simple delight
            of not quite knowing what it might do.
          </p>
        </div>

        <div className="shop-toolbar">
          <div className="category-tabs" role="tablist" aria-label="Product categories">
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
                role="tab"
                aria-selected={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
          <span className="product-count">{visibleProducts.length} curios found</span>
        </div>

        {visibleProducts.length ? (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="empty-search">
            <MoonStar size={30} />
            <h3>That curiosity is still out wandering.</h3>
            <p>Try another name or browse all wares.</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All wares"); }}>
              Show all wares
            </button>
          </div>
        )}
      </section>

      <section className="story-section" id="story">
        <div className="story-visual" aria-hidden="true">
          <MetatronsCube className="story-sigil" />
          <span className="sun-disc"><Sun size={48} strokeWidth={1} /></span>
          <span className="mountain mountain-one" />
          <span className="mountain mountain-two" />
          <span className="trail-dash dash-one" />
          <span className="trail-dash dash-two" />
          <Compass className="story-compass" size={78} strokeWidth={0.8} />
        </div>
        <div className="story-copy">
          <p className="eyebrow">A SHOP WITHOUT A SHOPFRONT</p>
          <h2>Found on the road.<br />Shared by the fire.</h2>
          <p className="story-lead">
            Wandering Wizard Wares began with a cart, a question, and too many
            beautiful things to keep.
          </p>
          <p>
            We follow old roads and new rumors, meeting makers, herbalists,
            mapmakers, and magnificent oddballs along the way. What we find,
            we bring to you—carefully packed and fully storied.
          </p>
          <a href="#notes" className="button button-light">
            Read our story <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="notes-section" id="notes">
        <div className="section-heading notes-heading">
          <div>
            <p className="eyebrow dark">NOTES FROM THE ROAD</p>
            <h2>A little lore for the <em>long way round.</em></h2>
          </div>
          <a href="#notes">Open the whole journal <ArrowRight size={16} /></a>
        </div>
        <div className="journal-grid">
          <article className="journal-feature">
            <div className="journal-art journal-map">
              <Compass size={88} strokeWidth={0.8} />
              <span className="map-route" />
            </div>
            <div>
              <span className="journal-tag">TRAVEL &middot; 6 MIN READ</span>
              <h3>Seven roadside shrines worth missing a turn for</h3>
              <p>A wandering guide to small wonders, good benches, and excellent tea.</p>
              <a href="#notes">Read the dispatch <ArrowRight size={15} /></a>
            </div>
          </article>
          <article className="journal-card">
            <div className="journal-art journal-herb">
              <Leaf size={72} strokeWidth={0.85} />
            </div>
            <span className="journal-tag">APOTHECARY &middot; 4 MIN READ</span>
            <h3>How to keep your herbs kindly</h3>
            <a href="#notes">Read note <ArrowRight size={14} /></a>
          </article>
          <article className="journal-card">
            <div className="journal-art journal-stars">
              <MoonStar size={72} strokeWidth={0.85} />
            </div>
            <span className="journal-tag">SKYLORE &middot; 8 MIN READ</span>
            <h3>A beginner’s atlas of friendly stars</h3>
            <a href="#notes">Read note <ArrowRight size={14} /></a>
          </article>
        </div>
      </section>

      <section className="newsletter" id="visit">
        <div className="newsletter-orbit" aria-hidden="true">
          <MetatronsCube className="newsletter-sigil" />
        </div>
        <div>
          <p className="eyebrow">POSTCARDS, NOT PESTERING</p>
          <h2>Know where the cart wanders next.</h2>
          <p>Monthly field notes, new wares, and the occasional useful spell.</p>
        </div>
        {subscribed ? (
          <div className="success-message">
            <Check size={20} />
            <span><b>Your owl has been briefed.</b><small>Watch your inbox for our next dispatch.</small></span>
          </div>
        ) : (
          <form onSubmit={submitNewsletter}>
            <label className="sr-only" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
            />
            <button type="submit">Join the route <ArrowRight size={16} /></button>
          </form>
        )}
      </section>

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand brand-light" href="#">
              <Mark />
              <span><b>Wandering Wizard</b><small>WARES FOR THE CURIOUS</small></span>
            </a>
            <p>Curious goods for curious folk,<br />gathered wherever the road leads.</p>
          </div>
          <div className="footer-links">
            <div><b>Explore</b><a href="#shop">Shop all wares</a><a href="#notes">Field notes</a><a href="#story">Our travels</a></div>
            <div><b>Good to know</b><a href="#visit">Parcel post</a><a href="#visit">Returns</a><a href="#visit">Care guides</a></div>
            <div><b>Come find us</b><a href="#visit">Current camp</a><a href="#visit">The route ahead</a><a href="#visit">Send a raven</a></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Wandering Wizard Wares</span>
          <span>Made with road dust &amp; starlight</span>
          <span><a href="#visit">Privacy</a><a href="#visit">Terms</a></span>
        </div>
      </footer>

      {(cartOpen || menuOpen) && (
        <button
          className="scrim"
          aria-label="Close overlay"
          onClick={() => { setCartOpen(false); setMenuOpen(false); }}
        />
      )}

      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <div><p className="eyebrow dark">YOUR SATCHEL</p><h2>{cartCount ? `${cartCount} good${cartCount === 1 ? "" : "s"}` : "Light as a feather"}</h2></div>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button>
        </div>
        {cart.length ? (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="cart-item" key={item.id}>
                    <div className={`cart-thumb ${item.palette}`}><Icon strokeWidth={1.2} /></div>
                    <div><h3>{item.name}</h3><p>${item.price}</p><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button></div></div>
                    <strong>${item.price * item.quantity}</strong>
                  </div>
                );
              })}
            </div>
            <div className="cart-summary">
              <div><span>Subtotal</span><strong>${cartTotal}</strong></div>
              <p>Parcel post is free over $75.</p>
              <button className="checkout-button" onClick={beginCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? "Opening Shopify…" : "Continue to secure checkout"} <ArrowRight size={17} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <ShoppingBag size={42} strokeWidth={1} />
            <p>Your next favorite oddity is waiting.</p>
            <button onClick={() => setCartOpen(false)}>Browse the wares</button>
          </div>
        )}
      </aside>

      <aside className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawer-head"><Mark /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
        <nav>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop wares <span>01</span></a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our travels <span>02</span></a>
          <a href="#notes" onClick={() => setMenuOpen(false)}>Field notes <span>03</span></a>
          <a href="#visit" onClick={() => setMenuOpen(false)}>Find the cart <span>04</span></a>
        </nav>
        <p>Currently camped at <b>Starfall Meadow</b></p>
      </aside>

      <div className={`toast ${toast ? "show" : ""}`} role="status">
        <Check size={16} /> {toast}
      </div>
    </main>
  );
}
