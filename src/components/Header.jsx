import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { features, site } from "../data/site";
import CartButton from "../cart/CartButton";
import "./Header.css";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About Us" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  /*
    Only the homepage opens on a full-bleed hero, so only there can the bar
    be transparent — on inner pages the content starts immediately under it
    and a see-through bar would have text sliding beneath the nav.
  */
  const overHero = pathname === "/";

  // Close the mobile drawer from the tap that navigates, rather than in an effect.
  const closeMenu = () => setOpen(false);

  /*
    Publish the header's real height so full-bleed sections (the hero) can size
    themselves against the space actually left below it.

    One value now the announcement bar is gone: the header is sticky and is
    the whole of the chrome, so the offset at the top of the page and the
    space it occupies once scrolled are the same number.
  */
  useEffect(() => {
    const el = document.querySelector(".header");
    if (!el) return;
    const sync = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /*
    Over the hero the bar stays transparent at the top of the page, and fills
    in once the hero starts scrolling up beneath it — before the packs reach
    the links.
  */
  useEffect(() => {
    const threshold = () => (overHero ? window.innerHeight * 0.2 : 12);
    const onScroll = () => setScrolled(window.scrollY > threshold());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [overHero]);

  return (
    <>
      <header
        className={[
          "header",
          scrolled ? "header--scrolled" : "",
          // Transparent only while over the hero, unscrolled, and not showing
          // the drawer — an open drawer needs the bar solid behind it.
          overHero && !scrolled && !open ? "header--ghost" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="container header__inner">
          <Link
            to="/"
            className="brand"
            aria-label={`${site.name} home`}
            onClick={closeMenu}
          >
            <img
              className="brand__logo"
              src="/images/cholan-logo.png"
              alt={site.name}
              width="404"
              height="200"
            />
          </Link>

          <nav className={`nav${open ? " nav--open" : ""}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `nav__link${isActive ? " nav__link--active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__tools">
            {/* Not on the home page; everywhere else the cart is one tap away. */}
            {features.cart && !overHero && <CartButton />}
            <button
              className="hamburger"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="nav-backdrop" onClick={closeMenu} aria-hidden="true" />
      )}
    </>
  );
}
