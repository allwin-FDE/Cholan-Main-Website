import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { formatINR, hasPhoto } from "../data/products";
import { useCart } from "./CartContext";
import "./cart.css";

export default function CartDrawer() {
  const { items, count, subtotal, hasUnpriced, setQty, clear, open, setOpen } = useCart();
  const panelRef = useRef(null);

  // Escape closes; focus moves into the drawer when it opens.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <div className={`cart${open ? " cart--open" : ""}`} inert={!open}>
      <div className="cart__backdrop" onClick={() => setOpen(false)} />

      <aside
        className="cart__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        tabIndex={-1}
        ref={panelRef}
      >
        <header className="cart__head">
          <h2>
            Your cart <span className="cart__head-count">{count}</span>
          </h2>
          <button type="button" className="cart__close" onClick={() => setOpen(false)} aria-label="Close cart">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart__empty">
            <span className="cart__empty-icon" aria-hidden="true">🌾</span>
            <p>Your cart is empty.</p>
            <Link to="/products" className="btn btn--primary" onClick={() => setOpen(false)}>
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart__list">
              {items.map((i, n) => (
                <li key={i.key} className="cart__line" style={{ "--i": n }}>
                  <Link
                    to={`/products/${i.product.id}`}
                    className="cart__thumb"
                    data-cat={i.product.category}
                    onClick={() => setOpen(false)}
                  >
                    {hasPhoto(i.product) ? (
                      <img src={i.product.image} alt="" loading="lazy" />
                    ) : (
                      <span>{i.product.name.charAt(0)}</span>
                    )}
                  </Link>

                  <div className="cart__info">
                    <Link to={`/products/${i.product.id}`} className="cart__name" onClick={() => setOpen(false)}>
                      {i.product.name}
                    </Link>
                    <span className="cart__meta">
                      {i.size ? `${i.size} · ` : ""}
                      {formatINR(i.price)}
                    </span>

                    <div className="cart__qty">
                      <button type="button" onClick={() => setQty(i.id, i.size, i.qty - 1)} aria-label={`One less ${i.product.name}`}>
                        −
                      </button>
                      <span key={i.qty} className="atc__num">
                        {i.qty}
                      </span>
                      <button type="button" onClick={() => setQty(i.id, i.size, i.qty + 1)} aria-label={`One more ${i.product.name}`}>
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart__end">
                    <span className="cart__total">{i.total == null ? "On request" : formatINR(i.total)}</span>
                    <button
                      type="button"
                      className="cart__remove"
                      onClick={() => setQty(i.id, i.size, 0)}
                      aria-label={`Remove ${i.product.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="cart__foot">
              <div className="cart__sum">
                <span>Subtotal</span>
                <strong>{formatINR(subtotal)}</strong>
              </div>
              {hasUnpriced && <p className="cart__note">Some items are priced on request — we'll confirm on WhatsApp.</p>}
              <Link to="/checkout" className="cart__order" onClick={() => setOpen(false)}>
                Checkout · {formatINR(subtotal)}
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <button type="button" className="cart__clear" onClick={clear}>
                Clear cart
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
