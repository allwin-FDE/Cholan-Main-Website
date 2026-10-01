import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categories, hasPhoto, priceFrom, products } from "../data/products";
import "./Products.css";

gsap.registerPlugin(Flip, ScrollTrigger);

const sortOptions = [
  { value: "featured", label: "Featured first" },
  { value: "name", label: "Name (A–Z)" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

// Shown first, in this order, under "Featured first".
const PINNED = ["idly-rice", "karikalan-rice", "moongil-rice"];
const pinRank = (p) => {
  const i = PINNED.indexOf(p.id);
  return i < 0 ? PINNED.length : i;
};

// Unpriced products sort last in both price orders, never first.
const priceAsc = (p) => priceFrom(p) ?? Infinity;
const priceDesc = (p) => priceFrom(p) ?? -Infinity;

export default function Products() {
  // Category lives in the URL so links like /products?category=millets work.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  /*
    Filtering and sorting shuffle the cards rather than swap them: the layout
    is recorded just before the change and the cards glide from there to
    their new places, while newcomers pop in.
  */
  const gridRef = useRef(null);
  const flipState = useRef(null);
  const capture = () => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    flipState.current = Flip.getState(grid.children, { props: "opacity" });
  };

  const setCategory = (slug) => {
    capture();
    if (slug === "all") setSearchParams({});
    else setSearchParams({ category: slug });
  };

  const visible = useMemo(() => {
    let list =
      activeCategory === "all"
        ? [...products]
        : products.filter((p) => p.category === activeCategory);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-asc":
        list.sort((a, b) => priceAsc(a) - priceAsc(b));
        break;
      case "price-desc":
        list.sort((a, b) => priceDesc(b) - priceDesc(a));
        break;
      default:
        // The pinned products lead; then products with real pack photos,
        // so the bags read as one run; bestsellers lead within each group.
        list.sort(
          (a, b) =>
            pinRank(a) - pinRank(b) ||
            Number(hasPhoto(b)) - Number(hasPhoto(a)) ||
            Number(!!b.featured) - Number(!!a.featured)
        );
    }

    return list;
  }, [activeCategory, query, sort]);

  useLayoutEffect(() => {
    const state = flipState.current;
    const grid = gridRef.current;
    flipState.current = null;
    if (!state || !grid) return;
    // Cards still waiting for their scroll-in (they sat below the fold) may
    // now be on screen: show them all; Flip fades them in from where they were.
    gsap.set(grid.children, { autoAlpha: 1, clearProps: "transform" });
    const flip = Flip.from(state, {
      targets: grid.children,
      duration: 0.6,
      ease: "power3.inOut",
      stagger: 0.02,
      // Cards only move; transform is handed back to CSS for hover and tilt.
      clearProps: "transform",
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { autoAlpha: 0, scale: 0.85, y: 30 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "back.out(1.6)", clearProps: "transform" }
        ),
      // The page got shorter or longer; the footer's triggers must re-measure.
      onComplete: () => ScrollTrigger.refresh(),
    });
    return () => flip.progress(1);
  }, [visible]);

  return (
    <>
      <section className="section products-page">
        <div className="container">
          {/* No banner: the page opens straight on the filters. The heading
              stays for screen readers and search engines. */}
          <h1 className="visually-hidden">Our products: rice, millets, oils and more</h1>

          <div className="filters">
            <div className="filters__chips">
              <button
                className={`chip${activeCategory === "all" ? " chip--on" : ""}`}
                onClick={() => setCategory("all")}
              >
                All ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.category === cat.slug
                ).length;
                return (
                  <button
                    key={cat.slug}
                    className={`chip${
                      activeCategory === cat.slug ? " chip--on" : ""
                    }`}
                    onClick={() => setCategory(cat.slug)}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            <div className="filters__tools">
              <input
                type="search"
                className="input"
                placeholder="Search products…"
                value={query}
                onChange={(e) => {
                  capture();
                  setQuery(e.target.value);
                }}
                aria-label="Search products"
              />
              <select
                className="input"
                value={sort}
                onChange={(e) => {
                  capture();
                  setSort(e.target.value);
                }}
                aria-label="Sort products"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="muted results-count">
            Showing {visible.length} of {products.length} products
          </p>

          {visible.length > 0 ? (
            <div className="products-grid" ref={gridRef}>
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>No products match that search</h3>
              <p className="muted">
                Try a different word, or clear the filters to see everything.
              </p>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  capture();
                  setQuery("");
                  setCategory("all");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
