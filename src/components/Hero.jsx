import { Link } from "react-router-dom";
import { site } from "../data/site";
import "./Hero.css";

/*
  Hero: the product photograph runs full width across the top, shown whole —
  no crop, no scrim, no text over it. The copy sits beneath it on cream.
*/

const MARKS = [
  { k: "Farm direct", v: "No middlemen" },
  { k: "Small-batch", v: "Milled to order" },
  { k: "Unpolished", v: "No added agents" },
  { k: "Tamil Nadu", v: "Delivered statewide" },
];

export default function Hero() {
  return (
    <section className="hero" aria-label={site.name}>
      <div className="hero__photo">
        {/* Same uncropped frame at both sizes — srcset only picks the
            resolution, so narrow screens do not download the 2168px file. */}
        <img
          src="/images/farm.webp"
          srcSet="/images/farm-md.webp 1400w, /images/farm.webp 2168w"
          sizes="100vw"
          alt="Cholan Ponni, Idli and Basmati rice packs on a wooden table before a paddy field and farmhouse"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="hero__rule" aria-hidden="true" />
            Rice · Millets · Cold-pressed oils
          </p>

          <h1 className="hero__headline">
            <span>Eat healthy millets.</span>
            <span className="hero__accent">Stay fit.</span>
          </h1>

          <p className="hero__sub">
            From the paddy fields of Tamil Nadu to your kitchen — traditional
            rice, native millets and wood-pressed oils.
          </p>

          <div className="hero__actions">
            <Link to="/products" className="hero__pill">
              <span>Browse Products</span>
            </Link>
          </div>

          <ul className="hero__strip">
            {MARKS.map((m) => (
              <li key={m.k}>
                <strong>{m.k}</strong>
                <span>{m.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
