import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  categories,
  formatINR,
  getProduct,
  hasPhoto,
  products,
} from "../data/products";
import { site } from "../data/site";
import NotFound from "./NotFound";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProduct(id);
  const [packIndex, setPackIndex] = useState(0);

  if (!product) return <NotFound />;

  // Some products list no pack sizes (sold on enquiry): they get a stand-in
  // with no size and no price, so the page quotes nothing and asks instead.
  const pack = product.packs[packIndex] ?? { size: null, price: null };
  const category = categories.find((c) => c.slug === product.category);

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <section className="pdp">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category}`}>
              {category?.name}
            </Link>
            <span>/</span>
            <strong>{product.name}</strong>
          </nav>

          <div className="pdp__grid">
            <div className="pdp__media">
              {hasPhoto(product) ? (
                <img
                  className="pdp__photo"
                  src={product.image}
                  alt={product.name}
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <div className="ph pdp__ph">{product.name}</div>
              )}
            </div>

            <div className="pdp__info">
              {product.featured && <span className="pdp__badge">Bestseller</span>}
              <h1>{product.name}</h1>
              <p className="pdp__tagline">{product.tagline}</p>

              <div className="pdp__price">
                {formatINR(pack.price)}
                <span className="pdp__price-unit">
                  {pack.size == null ? "" : pack.price == null ? ` · ${pack.size}` : ` / ${pack.size}`}
                </span>
              </div>

              <p className="pdp__desc">{product.description}</p>

              {product.packs.length > 0 && (
                <div className="pdp__packs">
                  <span className="pdp__label">Select pack size</span>
                  <div className="pdp__pack-list">
                    {product.packs.map((p, i) => (
                      <button
                        key={p.size}
                        className={`packbtn${i === packIndex ? " packbtn--on" : ""}`}
                        onClick={() => setPackIndex(i)}
                      >
                        <strong>{p.size}</strong>
                        <span>{formatINR(p.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pdp__actions">
                <a href={`tel:${site.phoneRaw}`} className="btn btn--ghost">
                  Call to order
                </a>
              </div>

              <ul className="pdp__assurance">
                <li>Packed fresh after your order is confirmed</li>
                <li>Delivery across Tamil Nadu · bulk rates available</li>
                <li>No artificial polishing or colouring agents</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <h2 style={{ marginBottom: 32 }}>You may also like</h2>
            <div className="grid grid--4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
