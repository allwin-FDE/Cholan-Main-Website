import { useState } from "react";
import { posts } from "../data/posts";
import "./Blog.css";

const allCategories = ["All", ...new Set(posts.map((p) => p.category))];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Each category has its own tint for its tag.
const catKey = (c) => c.toLowerCase().replace(/[^a-z]+/g, "-");

function Cover({ post, className }) {
  return (
    <div className={`${className} blog-cover${post.imageFit === "contain" ? " blog-cover--contain" : ""}`}>
      <img src={post.image} alt="" loading="lazy" decoding="async" />
    </div>
  );
}

export default function Blog() {
  const [filter, setFilter] = useState("All");

  const visible = filter === "All" ? posts : posts.filter((p) => p.category === filter);
  const [lead, ...rest] = visible;

  return (
    <>
      <section className="section blog">
        <div className="container">
          {/* ---- Intro, on the page itself ---- */}
          <header className="blog-intro">
            <div>
              <span className="eyebrow">The Cholan journal</span>
              <h1>
                Notes from the field <em>&amp;</em> the kitchen
              </h1>
              <p className="lede">Recipes, farming notes, nutrition and the occasional look behind the mill doors.</p>
            </div>

            <div className="blog-chips" role="group" aria-label="Filter by topic">
              {allCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filter === c}
                  className={`blog-chip${filter === c ? " is-on" : ""}`}
                  onClick={() => setFilter(c)}
                >
                  {c}
                  <span className="blog-chip__n">
                    {c === "All" ? posts.length : posts.filter((p) => p.category === c).length}
                  </span>
                </button>
              ))}
            </div>
          </header>

          {/* Keyed on the filter, so each change replays the entrance. */}
          <div key={filter} className="blog-list">
            {lead && (
              <article className="blog-feature">
                <Cover post={lead} className="blog-feature__media" />
                <div className="blog-feature__shade" aria-hidden="true" />
                <div className="blog-feature__body">
                  <span className="blog-feature__flag">Featured story</span>
                  <span className={`blog-tag blog-tag--${catKey(lead.category)}`}>{lead.category}</span>
                  <h2>{lead.title}</h2>
                  <p>{lead.excerpt}</p>
                  <span className="blog-meta blog-meta--light">
                    {formatDate(lead.date)} · {lead.readTime}
                  </span>
                  <span className="blog-feature__cta">
                    Read the story
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </article>
            )}

            {rest.length > 0 && (
              <div className="blog-grid">
                {rest.map((post, i) => (
                  <article key={post.slug} className="postcard blog-card" style={{ "--i": i }}>
                    <div className="blog-card__media-wrap">
                      <Cover post={post} className="blog-card__media" />
                      <span className={`blog-tag blog-tag--${catKey(post.category)}`}>{post.category}</span>
                    </div>
                    <div className="blog-card__body">
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <div className="blog-card__foot">
                        <span className="blog-meta">
                          {formatDate(post.date)} · {post.readTime}
                        </span>
                        <span className="blog-card__arrow" aria-hidden="true">
                          <svg viewBox="0 0 24 24" focusable="false">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---- Newsletter ---- */}
      <section className="section blog-news-wrap">
        <div className="container">
          <div className="blog-news">
            <div className="blog-news__copy">
              <span className="blog-news__icon" aria-hidden="true">🌾</span>
              <h2>Recipes and offers, once a month</h2>
              <p>No spam — just seasonal recipes, new varieties and the occasional discount for regulars.</p>
            </div>
            <form
              className="blog-news__form"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Newsletter signup — connect this to your mailing list.");
              }}
            >
              <input type="email" required placeholder="your@email.com" aria-label="Email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
