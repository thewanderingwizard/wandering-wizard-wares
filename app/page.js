"use client";

/* Shopify supplies external product images at runtime; Next image optimization is
   intentionally disabled for this portable headless storefront. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { createShopifyCheckout } from "@/lib/shopify";
import { Mark, MetatronsCube } from "@/app/components/BrandMarks";
import {
  ArrowRight,
  BookOpen,
  Check,
  Menu,
  Minus,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

const CART_STORAGE_KEY = "wandering-wizard-wares-cart-v1";
const INSTAGRAM_URL = "https://www.instagram.com/justawanderingwizard/";
const SUBSTACK_URL = "https://justawanderingwizard.substack.com/";
const SUBSTACK_ARTICLES = [
  {
    title: "The Rooted Magical Renaissance",
    description: "The world is changed.",
    href: "https://justawanderingwizard.substack.com/p/the-rooted-magical-renaissance",
    theme: "rooted",
    image: "/images/editorial/rooted-magical-renaissance.webp",
    imageAlt: "A luminous Tree of Life rising over a green landscape beneath a star-filled sky",
    imagePosition: "center",
  },
  {
    title: "The Narrow Path Forward",
    description: "Friction is unavoidable on the hero’s journey.",
    href: "https://justawanderingwizard.substack.com/p/the-narrow-path-forward",
    theme: "path",
    image: "/images/editorial/narrow-path-forward.webp",
    imageAlt: "A white-robed figure following a narrow green path through a towering hedge maze",
    imagePosition: "center",
  },
  {
    title: "The Occult Oscillation",
    description:
      "Why meaning-starved cultures oscillate between mystery and institution.",
    href: "https://justawanderingwizard.substack.com/p/the-occult-oscillation",
    theme: "occult",
    image: "/images/substack/occult-oscillation.webp",
    imageAlt: "Cover artwork for The Occult Oscillation",
    imagePosition: "center 42%",
  },
];
const SHOPIFY_POLICY_BASE =
  "https://wandering-wizard-wares.myshopify.com/policies";

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
    const hydrationFrame = window.requestAnimationFrame(() => {
      try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) setCart(parsedCart);
        }
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        setCartHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(hydrationFrame);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Checkout remains functional when storage is unavailable.
    }
  }, [cart, cartHydrated]);

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

  return (
    <main>
      <header className="site-header">
        <img
          className="header-heraldry"
          src="/images/brand/serpentine-heraldry-v1.webp"
          alt=""
          aria-hidden="true"
        />
        <Link className="brand" href="/" aria-label="Wandering Wizard Wares home">
          <span>
            <b>Wandering Wizard Wares</b>
            <small>MENAGERIE OF THE MAGICAL AND MUNDANE</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/shop">Shop wares</Link>
          <a href="#story">About the Wizard</a>
          <a href="#journal">Field notes</a>
          <a href="#events">The route ahead</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>

        <div className="header-actions">
          <Link className="header-shop-link" href="/shop">
            Peruse the wares
          </Link>
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

      </header>

      <section
        className="hero"
        aria-label="Wandering Wizard Wares engraved poster"
      />

      <section className="hero-introduction" aria-labelledby="home-introduction-title">
        <div className="hero-content">
          <h1 id="home-introduction-title">
            Books, Curios,
            <br />
            <em>Oddities &amp; Ephemera.</em>
          </h1>
          <p className="hero-intro">
            <span>
              Curated by{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                @justawanderingwizard
              </a>
            </span>
            <em lang="la">Summa scientia nihil scire.</em>
          </p>
        </div>
      </section>

      <section className="promises" aria-label="Shop benefits">
        <div>
          <Sparkles size={21} />
          <span>
            <b>Curated by the Wizard</b>
            <small>Magically resonant or beautifully mundane</small>
          </span>
        </div>
        <div>
          <PackageCheck size={21} />
          <span>
            <b>Packaged in the Tower</b>
            <small>Shipped with care</small>
          </span>
        </div>
        <div>
          <ShieldCheck size={21} />
          <span>
            <b>14-day return window</b>
            <small>Send requests through the return portal</small>
          </span>
        </div>
      </section>

      <section className="shop-portal" id="shop" aria-labelledby="shop-portal-title">
        <div className="portal-unified-geometry" aria-hidden="true">
          <img
            className="portal-sacred-atlas"
            src="/images/editorial/sacred-geometry-atlas.webp"
            alt=""
          />
        </div>
        <div className="shop-portal-art" aria-hidden="true" />
        <div className="shop-portal-copy">
          <p className="eyebrow">BEYOND THE CURTAIN</p>
          <h2 id="shop-portal-title">
            The wares
            <br />
            <em>await.</em>
          </h2>
          <p>
            Enter the shop to explore the full Shopify catalogue—organized by
            author, genre, Wizard Wear, and whether each finding is magical or
            mundane.
          </p>
          <div className="portal-taxonomy" aria-label="Shop categories">
            <span>Books</span><span>Curios</span><span>Magical</span><span>Mundane</span><span>Wizard Wear</span>
          </div>
          <Link className="button button-primary" href="/shop">
            Peruse the wares <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-backdrop" aria-hidden="true">
          <picture>
            <source
              media="(max-width: 700px)"
              srcSet="/images/brand/wandering-wizard-canon.webp"
            />
            <img
              src="/images/brand/wandering-wizard-tower-banner.webp"
              alt=""
            />
          </picture>
        </div>
        <div className="story-copy">
          <MetatronsCube className="story-copy-sigil" />
          <p className="eyebrow">ABOUT THE WIZARD</p>
          <h2>
            The wanderer
            <br />
            behind the wares.
          </h2>
          <p className="story-lead">
            A menagerie of the magical and the mundane, curated by
            @justawanderingwizard.
          </p>
          <p>
            The fuller account is still being written. Until then, follow the
            wandering, the research, and the stories that shape the collection.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="button button-light"
          >
            Meet the wanderer <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="notes-section" id="journal" aria-labelledby="journal-title">
        <div className="section-heading notes-heading">
          <div>
            <p className="eyebrow dark">NOTES FROM THE ROAD</p>
            <h2 id="journal-title">
              A little lore for the <em>long way round.</em>
            </h2>
          </div>
          <a href={SUBSTACK_URL} target="_blank" rel="noreferrer">
            Open the whole journal <ArrowRight size={16} />
          </a>
        </div>

        <div className="substack-grid">
          {SUBSTACK_ARTICLES.map((article, index) => (
            <article className={`substack-card ${article.theme}`} key={article.href}>
              <div className="substack-card-art">
                <img
                  src={article.image}
                  alt={article.imageAlt}
                  style={{ objectPosition: article.imagePosition }}
                />
                <span className="article-number">0{index + 1}</span>
                <span className="article-art-veil" aria-hidden="true" />
              </div>
              <div className="substack-card-copy">
                <span className="journal-tag">FIELD NOTE · SUBSTACK</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <a href={article.href} target="_blank" rel="noreferrer">
                  Read the dispatch <ArrowRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="substack-signup" id="subscribe" aria-labelledby="subscribe-title">
        <img
          className="signup-panorama"
          src="/images/editorial/mystical-panorama.webp"
          alt=""
          aria-hidden="true"
        />
        <div className="signup-copy">
          <p className="eyebrow">SUBSCRIBE ON SUBSTACK</p>
          <h2 id="subscribe-title">Postcards from the Path.</h2>
          <p>
            Subscribe for essays, field notes, and occasional dispatches from
            the road.
          </p>
        </div>
        <div className="substack-frame">
          <iframe
            src="https://justawanderingwizard.substack.com/embed"
            width="480"
            height="320"
            title="Subscribe to Just a Wandering Wizard on Substack"
            loading="lazy"
            frameBorder="0"
            scrolling="no"
          />
        </div>
      </section>

      <section className="route-section" id="events">
        <div>
          <p className="eyebrow">THE ROUTE AHEAD</p>
          <h2>Pop-ups, talks, and appearances.</h2>
          <p>
            Confirmed dates will be posted here as the route takes shape.
            Follow along for the first announcements.
          </p>
        </div>
        <a
          className="button route-button"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          Follow the route <ArrowRight size={17} />
        </a>
      </section>

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="brand brand-light" href="/">
              <Mark />
              <span><b>Wandering Wizard</b><small>WARES FOR THE CURIOUS</small></span>
            </Link>
            <p>Curious goods for curious folk,<br />gathered wherever the road leads.</p>
          </div>
          <div className="footer-links">
            <div>
              <b>Explore</b>
              <Link href="/shop">Shop all wares</Link>
              <a href="#story">About the Wizard</a>
              <a href="#journal">Field notes</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a>
            </div>
            <div>
              <b>Good to know</b>
              <a href={`${SHOPIFY_POLICY_BASE}/shipping-policy`}>Shipping</a>
              <a href={`${SHOPIFY_POLICY_BASE}/refund-policy`}>Returns</a>
              <a href={`${SHOPIFY_POLICY_BASE}/privacy-policy`}>Privacy</a>
            </div>
            <div>
              <b>Come find us</b>
              <a href="#events">The route ahead</a>
              <a href="#subscribe">Subscribe on Substack</a>
              <a href="mailto:thewizard@wanderingwizardwares.com">Send a raven</a>
              <a href={`${SHOPIFY_POLICY_BASE}/terms-of-service`}>Terms of service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom footer-bottom-home">
          <span>© 2026 Wandering Wizard Wares</span>
          <span className="footer-motto">Solo Deo Gloria</span>
          <span>
            <a href={`${SHOPIFY_POLICY_BASE}/privacy-policy`}>Privacy</a>
            <a href={`${SHOPIFY_POLICY_BASE}/terms-of-service`}>Terms</a>
          </span>
        </div>
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
              {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className={`cart-thumb ${item.palette}`}>
                      {item.image ? (
                        <img src={item.image} alt="" />
                      ) : (
                        <BookOpen strokeWidth={1.2} />
                      )}
                    </div>
                    <div>
                      <h3>{item.name}</h3>
                      <p>${item.price.toFixed(2)}</p>
                      <div className="quantity">
                        <button onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={13} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button>
                      </div>
                    </div>
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
              ))}
            </div>
            <div className="cart-summary">
              <div><span>Subtotal</span><strong>${cartTotal.toFixed(2)}</strong></div>
              <p>Shipping and taxes are calculated securely by Shopify.</p>
              <button className="checkout-button" onClick={beginCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? "Opening Shopify…" : "Continue to secure checkout"} <ArrowRight size={17} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <ShoppingBag size={42} strokeWidth={1} />
            <p>Your next favorite oddity is waiting.</p>
            <Link href="/shop" onClick={() => setCartOpen(false)}>Peruse the wares</Link>
          </div>
        )}
      </aside>

      <aside className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawer-head"><Mark /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
        <nav>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop wares <span>01</span></Link>
          <a href="#story" onClick={() => setMenuOpen(false)}>About the Wizard <span>02</span></a>
          <a href="#journal" onClick={() => setMenuOpen(false)}>Field notes <span>03</span></a>
          <a href="#events" onClick={() => setMenuOpen(false)}>The route ahead <span>04</span></a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Instagram <span>05</span></a>
        </nav>
      </aside>

      <div className={`toast ${toast ? "show" : ""}`} role="status">
        <Check size={16} /> {toast}
      </div>
    </main>
  );
}
