import { Link } from "react-router-dom";
import SectionHead from "../components/SectionHead";
import CurtainStage from "../components/CurtainStage";
import RailStory from "../components/RailStory";
import TempleFlight from "../components/TempleFlight";
import ProductCard from "../components/ProductCard";
import { categories, featuredProducts } from "../data/products";
import { site } from "../data/site";
import { posts } from "../data/posts";
import "./Home.css";

const testimonials = [
  {
    quote:
      "The idly rice is exactly what my mother used to buy. Batter ferments beautifully and the idlis stay soft all day.",
    name: "Lakshmi R.",
    city: "Chennai",
    product: "Idly Rice",
  },
  {
    quote:
      "I switched my family to their millets six months ago. The varagu and thinai are clean, well graded and genuinely fresh.",
    name: "Suresh K.",
    city: "Coimbatore",
    product: "Millets",
  },
  {
    quote:
      "Ordered the 26 kg Ponni bag for our mess. Consistent quality every single time and the delivery is always on schedule.",
    name: "Anand M.",
    city: "Bangalore",
    product: "Ponni · 26 kg",
  },
  {
    quote:
      "The wood-pressed sesame oil smells like the real thing. Hard to find this quality outside a village mill.",
    name: "Priya V.",
    city: "Hyderabad",
    product: "Sesame Oil",
  },
];

export default function Home() {
  // One clean row of four; the rest live on the products page.
  const featured = featuredProducts().slice(0, 4);

  return (
    <>
      {/* ---------- 1. HERO ---------- */}
      <CurtainStage />

      {/*
        2. FROM THE FIELDS, BY RAIL — INTO THE FLIGHT OVER THANJAVUR

        The train over the paddy, out through the cloud onto the temple and
        the brand line, ending in the same cloud the flight below opens in, so
        the two read as one shot. The flight then carries the case for native
        grains, settling on the Brihadeeswarar head-on.
      */}
      <RailStory />

      <TempleFlight />

      {/* ---------- 3. SHOP BY CATEGORY ---------- */}
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Shop by category"
            title="What we stock"
            lede="Four ranges, all traceable back to the farm they came from."
            center
          />
          <div className="grid grid--4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="cattile"
              >
                <div className="cattile__media">
                  <img
                    src={`/images/categories/${cat.slug}.webp`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="cattile__body">
                  <h3>{cat.name}</h3>
                  <p>{cat.blurb}</p>
                  <span className="cattile__link">Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 4. FEATURED PRODUCTS ---------- */}
      <section className="section showcase">
        <div className="container">
          <div className="row wrap gap-16 section-head-row">
            <SectionHead
              eyebrow="Our products"
              title="A Grain for Every Moment"
              lede="Discover our range of premium rice and millets, crafted for every home and every meal."
            />
            <Link to="/products" className="btn btn--ghost btn--sm">
              View all products
            </Link>
          </div>
          <div className="grid grid--4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 5. BULK / B2B ---------- */}
      <section className="section section--deep">
        <div className="container bulk">
          <div className="bulk__copy">
            <span className="eyebrow">Bulk &amp; wholesale</span>
            <h2>Supplying messes, caterers and retailers</h2>
            <p className="lede">
              We supply 26 kg bags and bulk millet orders to hotels, hostels,
              caterers and provision stores across Tamil Nadu. Tell us your
              monthly requirement and we will quote a standing rate.
            </p>
            <div className="row wrap gap-12" style={{ marginTop: 24 }}>
              <Link to="/contact" className="btn btn--primary">
                Request a bulk quote
              </Link>
              <a href={`tel:${site.phoneRaw}`} className="btn btn--ghost">
                Call {site.phone}
              </a>
            </div>
          </div>
          <div className="bulk__media">
            <img
              src="/images/bulk-warehouse.webp"
              alt="Rice sacks stacked on pallets in the Cholan warehouse, loaded onto a lorry"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* ---------- 6. TESTIMONIALS ---------- */}
      <section className="section reviews">
        <div className="container">
          <SectionHead
            eyebrow="Customer stories"
            title="What our customers say"
            lede="Kitchens, messes and mothers across South India, in their own words."
            center
          />
        </div>

        {/*
          A slow, endless ribbon of reviews. The track holds the list four
          times over and slides by exactly half its length, so the loop point
          is invisible and the ribbon is never short of a wide screen. Only
          the first copy is read out; the repeats are hidden from assistive
          tech. Hovering pauses the ribbon so a review can be read.
        */}
        <div className="marquee">
          <div className="marquee__track">
            {[0, 1, 2, 3].flatMap((copy) =>
              testimonials.map((t) => (
                <figure
                  key={`${copy}-${t.name}`}
                  className="quote"
                  aria-hidden={copy > 0 || undefined}
                >
                  <div className="quote__stars" aria-label="5 out of 5">
                    ★★★★★
                  </div>
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <span className="quote__avatar" aria-hidden="true">
                      {t.name.charAt(0)}
                    </span>
                    <span className="quote__who">
                      <strong>{t.name}</strong>
                      <span>{t.city}</span>
                    </span>
                    <span className="quote__product">{t.product}</span>
                  </figcaption>
                </figure>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ---------- 7. BLOG PREVIEW ---------- */}
      <section className="section section--alt">
        <div className="container">
          <div className="row wrap gap-16 section-head-row">
            <SectionHead
              eyebrow="From the journal"
              title="Recipes, farming notes and nutrition"
            />
            <Link to="/blog" className="btn btn--ghost btn--sm">
              Read the blog
            </Link>
          </div>
          <div className="grid grid--3">
            {posts.slice(0, 3).map((post) => (
              <Link key={post.slug} to="/blog" className="postcard">
                <div className={`postcard__ph${post.imageFit === "contain" ? " postcard__ph--contain" : ""}`}>
                  <img src={post.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="postcard__body">
                  <span className="postcard__meta">
                    {post.category} · {post.readTime}
                  </span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
