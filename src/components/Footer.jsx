import { Link } from "react-router-dom";
import { site } from "../data/site";
import { categories } from "../data/products";
import "./Footer.css";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About Us" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact Us" },
];

const legalLinks = [
  { to: "/policies/privacy", label: "Privacy Policy" },
  { to: "/policies/terms", label: "Terms & Conditions" },
  { to: "/policies/shipping", label: "Shipping" },
  { to: "/policies/returns", label: "Refunds" },
];

// Line icons on a currentColor stroke (filled where noted).
const Icon = ({ d, fill }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d={d}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const icons = {
  phone: "M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2L20 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  facebook: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 13.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM17.5 6.5h.01",
  youtube: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z",
};

const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.address.line1}, ${site.address.line2} ${site.address.pincode}`
)}`;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="container footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label={`${site.name} home`}>
              <img src="/images/cholan-logo.png" alt={site.name} width="404" height="200" loading="lazy" />
            </Link>
            <span className="footer__motto">Pure Goodness Always</span>
            <p>Bringing the finest rice and millets from the fertile lands of the Chola region to homes across India.</p>
          </div>

          <nav className="footer__col" aria-label="Quick links">
            <h4>Quick Links</h4>
            <ul>
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer__col" aria-label="Our products">
            <h4>Our Products</h4>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/products?category=${c.slug}`}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/products">All Products</Link>
              </li>
            </ul>
          </nav>

          <div className="footer__col">
            <h4>Contact Us</h4>
            <ul className="footer__contact">
              <li>
                <Icon d={icons.phone} />
                <a href={`tel:${site.phoneRaw}`}>{site.phone}</a>
              </li>
              <li>
                <Icon d={icons.mail} />
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <Icon d={icons.pin} />
                <a href={mapUrl} target="_blank" rel="noreferrer">
                  {site.address.line1}, {site.address.line2} – {site.address.pincode}
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__col footer__news">
            <h4>Subscribe to Updates</h4>
            <p>Get the latest on our products, offers and stories from the Chola land.</p>
            <form
              className="footer__form"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Newsletter signup — connect this to your mailing list.");
              }}
            >
              <input type="email" required placeholder="Enter your email" aria-label="Email address" />
              <button type="submit" aria-label="Subscribe">
                <Icon d={icons.arrow} />
              </button>
            </form>

            <h4 className="footer__follow">Follow Us</h4>
            <div className="footer__social">
              <a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Icon d={icons.facebook} />
              </a>
              <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Icon d={icons.instagram} />
              </a>
              <a href={site.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                <Icon d={icons.youtube} fill />
              </a>
            </div>
          </div>
        </div>

        {/* A gold rule with a small ornament at its centre. */}
        <div className="footer__rule" aria-hidden="true">
          <span />
        </div>

        <div className="container footer__bar">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <nav className="footer__legal" aria-label="Policies">
            {legalLinks.map((l) => (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
