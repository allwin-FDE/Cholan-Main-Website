import { Link } from "react-router-dom";
import { formatINR, getProduct, priceFrom } from "../data/products";
import { site } from "../data/site";
import "./PackShowcase.css";

// The two products we have real pack photography for.
const IDS = ["rajabogam-ponni", "ponni-broken-rice"];

export default function PackShowcase() {
  const packs = IDS.map(getProduct).filter(Boolean);
  if (!packs.length) return null;

  return (
    <section className="packs">
      <div className="container">
        <div className="packs__head">
          <span className="eyebrow">In the bag</span>
          <h2>The Cholan pack</h2>
          <p className="lede">
            Our two Ponni grades, milled and packed at our own facility in
            Coimbatore. Both available from 5 kg up to the 26 kg bag.
          </p>
        </div>

        <div className="packs__grid">
          {packs.map((p) => {
            const biggest = p.packs[p.packs.length - 1];
            const enquiry = `Hello Cholan Rice, I would like to enquire about "${p.name}". Please share price and availability.`;

            return (
              <article key={p.id} className="packcard">
                <Link to={`/products/${p.id}`} className="packcard__media">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>

                <div className="packcard__body">
                  <h3>
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </h3>
                  <p className="packcard__tagline">{p.tagline}</p>
                  <p className="packcard__desc">{p.description}</p>

                  <dl className="packcard__facts">
                    <div>
                      <dt>From</dt>
                      <dd>{formatINR(priceFrom(p))}</dd>
                    </div>
                    <div>
                      <dt>Largest pack</dt>
                      <dd>{biggest.size}</dd>
                    </div>
                    <div>
                      <dt>Sizes</dt>
                      <dd>{p.packs.map((x) => x.size).join(" · ")}</dd>
                    </div>
                  </dl>

                  <div className="packcard__actions">
                    <a
                      href={`https://wa.me/${site.phoneRaw}?text=${encodeURIComponent(enquiry)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--primary btn--sm"
                    >
                      Enquire
                    </a>
                    <Link
                      to={`/products/${p.id}`}
                      className="btn btn--ghost btn--sm"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
