"use client";

/* Shopify supplies external product images at runtime. */
/* eslint-disable @next/next/no-img-element */

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Mark } from "@/app/components/BrandMarks";
import { createShopifyCheckout } from "@/lib/shopify";
import { formatMoney } from "@/lib/catalog";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Menu,
  Minus,
  ShoppingBag,
  X,
} from "lucide-react";

const CART_STORAGE_KEY = "wandering-wizard-wares-cart-v2";
const INSTAGRAM_URL = "https://www.instagram.com/justawanderingwizard/";
const YOUTUBE_URL = "https://www.youtube.com/@justawanderingwizard";
const SHOPIFY_POLICY_BASE =
  "https://wandering-wizard-wares.myshopify.com/policies";

const ShopContext = createContext(null);

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopShell.");
  return context;
}

export default function ShopShell({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCart(
              parsed.filter(
                (item) =>
                  item?.variantId &&
                  item?.name &&
                  Number.isFinite(item.price) &&
                  Number.isFinite(item.quantity) &&
                  item.quantity > 0
              )
            );
          }
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
      // Checkout remains available when local storage is unavailable.
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || menuOpen ? "hidden" : "";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cartOpen, menuOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message) {
    setToast(message);
  }

  function addToCart(item, quantity = 1) {
    setCart((current) => {
      const existing = current.find((entry) => entry.variantId === item.variantId);
      if (existing) {
        return current.map((entry) =>
          entry.variantId === item.variantId
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry
        );
      }
      return [...current, { ...item, id: item.variantId, quantity }];
    });
    setToast(`${item.name} added to your satchel`);
  }

  function changeQuantity(variantId, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + amount }
            : item
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

  const contextValue = {
    addToCart,
    openCart: () => setCartOpen(true),
    showToast,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      <main className="shop-page">
        <header className="site-header shop-header">
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
          <nav className="desktop-nav" aria-label="Shop navigation">
            <Link href="/"><ArrowLeft size={14} /> Return to the road</Link>
            <Link href="/shop">Shop all wares</Link>
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

        {children}

        <footer className="shop-footer">
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
                <Link href="/#story">About the Wizard</Link>
                <Link href="/#journal">Field notes</Link>
              </div>
              <div>
                <b>Good to know</b>
                <a href={`${SHOPIFY_POLICY_BASE}/shipping-policy`}>Shipping</a>
                <a href={`${SHOPIFY_POLICY_BASE}/refund-policy`}>Returns</a>
                <a href={`${SHOPIFY_POLICY_BASE}/privacy-policy`}>Privacy</a>
              </div>
              <div>
                <b>Come find us</b>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a>
                <a href={YOUTUBE_URL} target="_blank" rel="noreferrer">YouTube</a>
                <a href="mailto:thewizard@wanderingwizardwares.com">Send a raven</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Wandering Wizard Wares</span>
            <span>Secure checkout by Shopify</span>
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

        <aside
          className={`cart-drawer ${cartOpen ? "open" : ""}`}
          aria-hidden={!cartOpen}
          aria-label="Shopping satchel"
        >
          <div className="drawer-head">
            <div>
              <p className="eyebrow dark">YOUR SATCHEL</p>
              <h2>{cartCount ? `${cartCount} good${cartCount === 1 ? "" : "s"}` : "Light as a feather"}</h2>
            </div>
            <button onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button>
          </div>
          {cart.length ? (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.variantId}>
                    <Link
                      className={`cart-thumb ${item.palette || "brass"}`}
                      href={`/shop/${item.handle}`}
                      onClick={() => setCartOpen(false)}
                      aria-label={`View ${item.name}`}
                    >
                      {item.image ? <img src={item.image} alt="" /> : <BookOpen strokeWidth={1.2} />}
                    </Link>
                    <div>
                      <Link href={`/shop/${item.handle}`} onClick={() => setCartOpen(false)}>
                        <h3>{item.name}</h3>
                      </Link>
                      {item.variantTitle && <p>{item.variantTitle}</p>}
                      <p>{formatMoney(item.price, item.currencyCode)}</p>
                      <div className="quantity">
                        <button onClick={() => changeQuantity(item.variantId, -1)} aria-label={`Remove one ${item.name}`}><Minus size={13} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.variantId, 1)} aria-label={`Add one ${item.name}`}>+</button>
                      </div>
                    </div>
                    <strong>{formatMoney(item.price * item.quantity, item.currencyCode)}</strong>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <div><span>Subtotal</span><strong>{formatMoney(cartTotal, cart[0]?.currencyCode)}</strong></div>
                <p>Shipping and taxes are calculated securely by Shopify.</p>
                <button className="checkout-button" onClick={beginCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? "Opening Shopify…" : "Continue to secure checkout"}
                  <ArrowRight size={17} />
                </button>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <ShoppingBag size={42} strokeWidth={1} />
              <p>Your next favorite oddity is waiting.</p>
              <Link href="/shop" onClick={() => setCartOpen(false)}>Continue perusing</Link>
            </div>
          )}
        </aside>

        <aside
          className={`mobile-menu ${menuOpen ? "open" : ""}`}
          aria-hidden={!menuOpen}
          aria-label="Mobile navigation"
        >
          <div className="drawer-head">
            <Mark />
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
          </div>
          <nav>
            <Link href="/" onClick={() => setMenuOpen(false)}>The road home <span>01</span></Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop all wares <span>02</span></Link>
            <Link href="/#story" onClick={() => setMenuOpen(false)}>About the Wizard <span>03</span></Link>
            <Link href="/#journal" onClick={() => setMenuOpen(false)}>Field notes <span>04</span></Link>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram <span>05</span></a>
            <a href={YOUTUBE_URL} target="_blank" rel="noreferrer">YouTube <span>06</span></a>
          </nav>
        </aside>

        <div className={`toast ${toast ? "show" : ""}`} role="status">
          <Check size={16} /> {toast}
        </div>
      </main>
    </ShopContext.Provider>
  );
}
