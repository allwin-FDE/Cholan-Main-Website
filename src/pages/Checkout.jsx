import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useCart } from "../cart/CartContext";
import { formatINR, hasPhoto } from "../data/products";
import { site } from "../data/site";
import "./Checkout.css";

/*
  Checkout: the order summary and its total, the buyer's details, and a
  confirmation. There is no payment backend — placing the order opens
  WhatsApp with the whole order written out (reference, items, total,
  address, payment choice), and the page shows a confirmation.

  The buyer's details are remembered in this browser so a repeat order is a
  couple of taps. Only the details, never the order itself.
*/

const DETAILS_KEY = "cholan-checkout-details-v1";

const blank = {
  name: "",
  phone: "",
  method: "delivery", // or "pickup"
  address: "",
  city: "",
  pincode: "",
  landmark: "",
  payment: "cod", // or "upi"
  notes: "",
};

const loadDetails = () => {
  try {
    return { ...blank, ...JSON.parse(localStorage.getItem(DETAILS_KEY) || "{}"), notes: "" };
  } catch {
    return blank;
  }
};

const PAYMENT = {
  cod: "Cash on delivery",
  upi: "UPI / GPay on delivery",
};

// A short, readable reference: CR-280926-4821.
const makeRef = () => {
  const d = new Date();
  const ymd = [d.getDate(), d.getMonth() + 1, d.getFullYear() % 100].map((n) => String(n).padStart(2, "0")).join("");
  return `CR-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const validate = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, "").slice(-10))) e.phone = "Enter a 10-digit mobile number.";
  if (f.method === "delivery") {
    if (f.address.trim().length < 6) e.address = "Please enter your full address.";
    if (!f.city.trim()) e.city = "Please enter your city.";
    if (!/^\d{6}$/.test(f.pincode.trim())) e.pincode = "Enter a 6-digit pincode.";
  }
  return e;
};

const orderMessage = (ref, items, total, hasUnpriced, f) =>
  [
    `*New order ${ref}*`,
    "",
    ...items.map((i) => {
      const size = i.size ? ` (${i.size})` : "";
      const cost = i.total == null ? "price on request" : formatINR(i.total);
      return `• ${i.product.name}${size} × ${i.qty} — ${cost}`;
    }),
    "",
    `*Total: ${formatINR(total)}*${hasUnpriced ? " + items priced on request" : ""}`,
    "",
    `Name: ${f.name.trim()}`,
    `Phone: ${f.phone.trim()}`,
    f.method === "pickup"
      ? "Collection: Pickup from the mill"
      : `Deliver to: ${[f.address, f.landmark && `near ${f.landmark}`, f.city, f.pincode].filter(Boolean).map((s) => s.trim()).join(", ")}`,
    `Payment: ${PAYMENT[f.payment]}`,
    f.notes.trim() ? `Notes: ${f.notes.trim()}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

// The total counts up (or down) to each new value rather than jumping.
function AnimatedTotal({ value }) {
  const ref = useRef(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = formatINR(value);
      shown.current = value;
      return;
    }
    const counter = { v: shown.current };
    const tween = gsap.to(counter, {
      v: value,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        shown.current = Math.round(counter.v);
        el.textContent = formatINR(shown.current);
      },
    });
    return () => tween.kill();
  }, [value]);
  return <span ref={ref}>{formatINR(value)}</span>;
}

export default function Checkout() {
  const { items, count, subtotal, hasUnpriced, setQty, clear } = useCart();
  const [form, setForm] = useState(loadDetails);
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(null);
  const total = subtotal;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      // Take the buyer to the first field that needs attention.
      document.getElementById(`co-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    const ref = makeRef();
    const url = `https://wa.me/${site.phoneRaw}?text=${encodeURIComponent(
      orderMessage(ref, items, total, hasUnpriced, form)
    )}`;
    try {
      const { notes: _notes, ...keep } = form;
      localStorage.setItem(DETAILS_KEY, JSON.stringify(keep));
    } catch {
      /* not remembered this time */
    }
    window.open(url, "_blank", "noopener");
    setPlaced({ ref, url, total, count, hasUnpriced, method: form.method, name: form.name.trim() });
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- Placed ---------- */
  if (placed) {
    return (
      <section className="section co">
        <div className="container co-done">
          <div className="co-done__tick" aria-hidden="true">
            <svg viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="24" />
              <path d="M15 27l7 7 15-16" />
            </svg>
          </div>
          <span className="eyebrow">Order {placed.ref}</span>
          <h1>Thank you, {placed.name.split(" ")[0]}!</h1>
          <p className="lede">
            Your order of {placed.count} {placed.count === 1 ? "item" : "items"} has been sent to us on WhatsApp.
            We'll confirm availability and {placed.method === "pickup" ? "your pickup time" : "delivery"} shortly.
          </p>
          <div className="co-done__total">
            <span>Order total</span>
            <strong>{formatINR(placed.total)}</strong>
            {placed.hasUnpriced && <small>+ items priced on request</small>}
          </div>
          <div className="co-done__actions">
            <a href={placed.url} target="_blank" rel="noreferrer" className="btn btn--primary">
              WhatsApp didn't open? Send again
            </a>
            <Link to="/products" className="btn btn--ghost">
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Empty ---------- */
  if (items.length === 0) {
    return (
      <section className="section co">
        <div className="container co-empty">
          <span className="co-empty__icon" aria-hidden="true">🌾</span>
          <h1>Your cart is empty</h1>
          <p className="lede">Add a few packs and come back here to check out.</p>
          <Link to="/products" className="btn btn--primary">
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  /* ---------- Checkout ---------- */
  return (
    <section className="section co">
      <div className="container">
        <header className="co-head">
          <h1>Checkout</h1>
          <ol className="co-steps" aria-label="Progress">
            <li className="is-done">Cart</li>
            <li className="is-on" aria-current="step">Details</li>
            <li>Confirm</li>
          </ol>
        </header>

        <form className="co-grid" onSubmit={submit} noValidate>
          {/* ---- Details ---- */}
          <div className="co-form">
            <fieldset className="co-card">
              <legend>
                <span className="co-num">1</span> Your details
              </legend>
              <div className="co-row">
                <Field id="name" label="Full name" error={errors.name}>
                  <input id="co-name" value={form.name} onChange={set("name")} autoComplete="name" />
                </Field>
                <Field id="phone" label="Mobile number" error={errors.phone}>
                  <input
                    id="co-phone"
                    value={form.phone}
                    onChange={set("phone")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="98765 43210"
                  />
                </Field>
              </div>
            </fieldset>

            <fieldset className="co-card">
              <legend>
                <span className="co-num">2</span> Delivery
              </legend>
              <div className="co-choices">
                <Choice name="method" value="delivery" current={form.method} onChange={set("method")} title="Home delivery" note="Across Tamil Nadu" />
                <Choice name="method" value="pickup" current={form.method} onChange={set("method")} title="Pickup from the mill" note={site.address.line2} />
              </div>

              {form.method === "delivery" ? (
                <div className="co-reveal" key="delivery">
                  <Field id="address" label="House / street / area" error={errors.address}>
                    <textarea id="co-address" rows={2} value={form.address} onChange={set("address")} autoComplete="street-address" />
                  </Field>
                  <div className="co-row co-row--3">
                    <Field id="city" label="City" error={errors.city}>
                      <input id="co-city" value={form.city} onChange={set("city")} autoComplete="address-level2" />
                    </Field>
                    <Field id="pincode" label="Pincode" error={errors.pincode}>
                      <input id="co-pincode" value={form.pincode} onChange={set("pincode")} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
                    </Field>
                    <Field id="landmark" label="Landmark" optional>
                      <input id="co-landmark" value={form.landmark} onChange={set("landmark")} />
                    </Field>
                  </div>
                </div>
              ) : (
                <p className="co-reveal co-pickup" key="pickup">
                  Collect from {site.address.line1}, {site.address.line2} – {site.address.pincode}. {site.hours}.
                </p>
              )}
            </fieldset>

            <fieldset className="co-card">
              <legend>
                <span className="co-num">3</span> Payment
              </legend>
              <div className="co-choices">
                <Choice name="payment" value="cod" current={form.payment} onChange={set("payment")} title={PAYMENT.cod} note="Pay when it arrives" />
                <Choice name="payment" value="upi" current={form.payment} onChange={set("payment")} title={PAYMENT.upi} note="Scan and pay on arrival" />
              </div>
              <Field id="notes" label="Notes for us" optional>
                <textarea id="co-notes" rows={2} value={form.notes} onChange={set("notes")} placeholder="Preferred delivery time, bulk requirement…" />
              </Field>
            </fieldset>
          </div>

          {/* ---- Summary ---- */}
          <aside className="co-summary">
            <div className="co-card co-card--summary">
              <h2>
                Order summary <span className="co-count">{count}</span>
              </h2>

              <ul className="co-items">
                {items.map((i) => (
                  <li key={i.key} className="co-item">
                    <span className="co-item__thumb" data-cat={i.product.category}>
                      {hasPhoto(i.product) ? <img src={i.product.image} alt="" /> : i.product.name.charAt(0)}
                      <span className="co-item__qty-badge">{i.qty}</span>
                    </span>
                    <span className="co-item__info">
                      <strong>{i.product.name}</strong>
                      <span>
                        {i.size ? `${i.size} · ` : ""}
                        {formatINR(i.price)}
                      </span>
                      <span className="co-item__step">
                        <button type="button" onClick={() => setQty(i.id, i.size, i.qty - 1)} aria-label={`One less ${i.product.name}`}>
                          −
                        </button>
                        <span key={i.qty} className="atc__num">{i.qty}</span>
                        <button type="button" onClick={() => setQty(i.id, i.size, i.qty + 1)} aria-label={`One more ${i.product.name}`}>
                          +
                        </button>
                      </span>
                    </span>
                    <span className="co-item__total">{i.total == null ? "On request" : formatINR(i.total)}</span>
                  </li>
                ))}
              </ul>

              <dl className="co-sums">
                <div>
                  <dt>Subtotal ({count} {count === 1 ? "item" : "items"})</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
                <div>
                  <dt>{form.method === "pickup" ? "Pickup" : "Delivery"}</dt>
                  <dd className="co-muted">{form.method === "pickup" ? "Free" : "Confirmed on WhatsApp"}</dd>
                </div>
                <div className="co-sums__total">
                  <dt>Total</dt>
                  <dd>
                    <AnimatedTotal value={total} />
                  </dd>
                </div>
              </dl>
              {hasUnpriced && <p className="co-note">+ items priced on request — we'll add them when we confirm.</p>}

              <button type="submit" className="co-place">
                Place order · <AnimatedTotal value={total} />
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <p className="co-fine">
                Your order is sent to us on WhatsApp to confirm. No payment is taken online.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}

function Field({ id, label, error, optional, children }) {
  return (
    <div className={`co-field${error ? " co-field--error" : ""}`}>
      <label htmlFor={`co-${id}`}>
        {label}
        {optional ? <span className="co-optional"> (optional)</span> : <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <span className="co-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function Choice({ name, value, current, onChange, title, note }) {
  return (
    <label className={`co-choice${current === value ? " is-on" : ""}`}>
      <input type="radio" name={name} value={value} checked={current === value} onChange={onChange} />
      <span className="co-choice__dot" aria-hidden="true" />
      <span className="co-choice__text">
        <strong>{title}</strong>
        <small>{note}</small>
      </span>
    </label>
  );
}
