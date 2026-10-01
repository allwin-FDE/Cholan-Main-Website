import { useRef } from "react";
import gsap from "gsap";
import { defaultPack, useCart } from "./CartContext";
import "./cart.css";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
  Flies a copy of the product's picture from the card into the header cart,
  on an arc, shrinking as it goes; the cart bumps when it lands.
*/
function flyToCart(fromEl) {
  const cart = document.querySelector(".cart-btn");
  if (!cart || !fromEl || reduced()) return;
  const from = fromEl.getBoundingClientRect();
  const to = cart.getBoundingClientRect();
  if (!from.width || !to.width) return;

  const ghost = fromEl.cloneNode(true);
  ghost.className = "cart-fly";
  ghost.removeAttribute("loading");
  Object.assign(ghost.style, {
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
  });
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const end = 28 / Math.max(from.width, from.height);

  gsap
    .timeline({
      onComplete: () => {
        ghost.remove();
        cart.classList.remove("cart-btn--land");
        void cart.offsetWidth; // restart the keyframes
        cart.classList.add("cart-btn--land");
      },
    })
    .to(ghost, { x: dx, duration: 0.75, ease: "power1.inOut" }, 0)
    // Up first, then down into the cart: the arc.
    .to(ghost, { y: Math.min(dy, 0) - 90, duration: 0.35, ease: "power2.out" }, 0)
    .to(ghost, { y: dy, duration: 0.4, ease: "power2.in" }, 0.35)
    .to(ghost, { scale: end, rotate: -20, duration: 0.75, ease: "power2.in" }, 0)
    .to(ghost, { autoAlpha: 0, duration: 0.15 }, 0.62);
}

// A "+1" that floats up from the button and fades.
function plusOne(fromEl) {
  if (!fromEl || reduced()) return;
  const r = fromEl.getBoundingClientRect();
  const tag = document.createElement("span");
  tag.className = "cart-plus";
  tag.textContent = "+1";
  tag.style.left = `${r.left + r.width / 2}px`;
  tag.style.top = `${r.top}px`;
  document.body.appendChild(tag);
  gsap.fromTo(
    tag,
    { xPercent: -50, y: 0, scale: 0.6, autoAlpha: 0 },
    {
      y: -46,
      scale: 1,
      autoAlpha: 1,
      duration: 0.35,
      ease: "back.out(2.5)",
      onComplete: () =>
        gsap.to(tag, { y: -70, autoAlpha: 0, duration: 0.35, ease: "power1.in", onComplete: () => tag.remove() }),
    }
  );
}

export default function AddToCart({ product, pack = defaultPack(product), className = "" }) {
  const cart = useCart();
  const rootRef = useRef(null);
  const qty = cart.qtyOf(product.id, pack.size);

  const add = (e) => {
    const card = rootRef.current?.closest(".card, .pdp");
    const pic = card?.querySelector(".card__media img, .card__initial, .pdp__photo");
    flyToCart(pic);
    plusOne(e.currentTarget);
    cart.add(product.id, pack.size);
  };

  return (
    <div ref={rootRef} className={`atc${qty > 0 ? " atc--in" : ""} ${className}`}>
      {/* Both states share one slot and cross-fade, so the card never jumps. */}
      <button
        type="button"
        className="atc__add"
        onClick={add}
        tabIndex={qty > 0 ? -1 : 0}
        aria-hidden={qty > 0 || undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.4-1.1L21 8H6.2" />
          <circle cx="9.5" cy="20" r="1.3" />
          <circle cx="17" cy="20" r="1.3" />
        </svg>
        Add to cart
      </button>

      <div className="atc__stepper" aria-hidden={qty === 0 || undefined}>
        <button
          type="button"
          className="atc__step"
          onClick={() => cart.setQty(product.id, pack.size, qty - 1)}
          aria-label={qty === 1 ? `Remove ${product.name} from cart` : `One less ${product.name}`}
          tabIndex={qty > 0 ? 0 : -1}
        >
          {qty === 1 ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 19l1-12M9 7V4.5h6V7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 12h12" />
            </svg>
          )}
        </button>

        {/* Keyed on the count, so each change rolls the new number in. */}
        <span className="atc__qty" aria-live="polite">
          <span key={qty} className="atc__num">
            {qty}
          </span>
          <span className="visually-hidden"> in cart</span>
        </span>

        <button
          type="button"
          className="atc__step atc__step--plus"
          onClick={add}
          aria-label={`One more ${product.name}`}
          tabIndex={qty > 0 ? 0 : -1}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 6v12M6 12h12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
