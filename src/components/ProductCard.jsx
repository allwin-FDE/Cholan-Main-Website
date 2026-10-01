import { Link } from "react-router-dom";
import { categories, formatINR, hasPhoto, priceFrom } from "../data/products";
import AddToCart from "../cart/AddToCart";
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
          <p className={`card__price${from == null ? " card__price--ask" : ""}`}>
            {multiplePacks && <span className="card__from">from</span>}
            {formatINR(from)}
          </p>

          <div className="card__actions">
            <Link to={url} className="card__details">
              Details
            </Link>
            <AddToCart product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}
