import { Link } from "react-router-dom";
import { categories, formatINR, hasPhoto, priceFrom } from "../data/products";
import AddToCart from "../cart/AddToCart";
import { features, whatsappLink } from "../data/site";
import "./ProductCard.css";

const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name ?? "";

export default function ProductCard({ product }) {
  const from = priceFrom(product);
  // "from" only makes sense when there is a price and more than one pack.
  const multiplePacks = from != null && product.packs.length > 1;
  const url = `/products/${product.id}`;

  return (
    // The category sets the card's tint (see ProductCard.css).
    <article className="card" data-cat={product.category}>
      <Link to={url} className="card__media" tabIndex={-1} aria-hidden="true">
        {/* Products with a real photo show it; the rest get a lettered tile
            in the category's colours rather than a grey box. */}
        {hasPhoto(product) ? (
          <img src={product.image} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="card__monogram">
            <span className="card__initial">{product.name.charAt(0)}</span>
            <span className="card__mononame">{product.name}</span>
          </span>
        )}
        {product.featured && <span className="card__badge">★ Bestseller</span>}
        <span className="card__cat">{categoryName(product.category)}</span>
      </Link>

      <div className="card__body">
        <h3 className="card__title">
          <Link to={url}>{product.name}</Link>
        </h3>
        <p className="card__tagline">{product.tagline}</p>

        {product.packs.length > 0 && (
          <ul className="card__packs" aria-label="Pack sizes">
            {product.packs.map((p) => (
              <li key={p.size}>{p.size}</li>
            ))}
          </ul>
        )}

        <div className="card__foot">
          {features.prices && (
            <p className={`card__price${from == null ? " card__price--ask" : ""}`}>
              {multiplePacks && <span className="card__from">from</span>}
              {formatINR(from)}
            </p>
          )}

          <div className="card__actions">
            <Link to={url} className="card__details">
              Details
            </Link>
            {features.cart ? (
              <AddToCart product={product} />
            ) : (
              <a href={whatsappLink(product)} target="_blank" rel="noreferrer" className="card__enquire">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.4-.3Z"
                  />
                </svg>
                Enquire
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
