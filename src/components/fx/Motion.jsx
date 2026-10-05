import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  Site-wide motion: every page's content rises into place as it scrolls in,
  and each route change is covered by a two-colour wipe.

  Driven by selectors rather than per-page code, so new pages built from the
  shared pieces (section heads, grids, cards, buttons) animate for free.
  Pages that choreograph themselves are left alone: the About page (.ab) and
  the pinned home-page films (.curtain, .rs, .temple).
*/

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Things that arrive one after another when their group scrolls in.
const STAGGERED = [
  ".grid > *",
  ".products-grid > *",
  ".footer__top > *",
  ".footer__grid > *",
  ".contact > *",
  ".infocard",
  ".policy__block",
  ".pdp__info > *",
  ".filters",
  ".results-count",
  ".bulk > *",
  ".feature",
  ".newsletter",
  ".section-head-row > .btn",
  ".center > .row",
  ".marquee",
];

// Owned by their own animations.
const SKIP = ".ab, .curtain, .rs, .temple";

export default function Motion() {
  const { pathname } = useLocation();
  const wipeRef = useRef(null);
  const first = useRef(true);

  /* ---------- The page wipe ----------
     Two kinds:
       * The logo screen — the cream sheet with the Cholan mark over green
         and gold. Only on the very first load, and when the header logo is
         pressed to go back to the hero.
       * A plain wipe — green then gold, no mark — for every other route
         change.
     Both run before paint, so the new page is never seen uncovered. */
  const logoNext = useRef(false);
  const playing = useRef(null);

  const lift = (withLogo, hold = 0.35) => {
    const wipe = wipeRef.current;
    const cream = wipe.querySelector(".fx-wipe__panel--cream");
    const mark = wipe.querySelector(".fx-wipe__mark");
    // Top layer first.
    const panels = Array.from(wipe.querySelectorAll(".fx-wipe__panel")).reverse();
    playing.current?.kill();
    const tl = gsap.timeline({ onComplete: () => gsap.set(wipe, { autoAlpha: 0 }) });
    tl.set(wipe, { autoAlpha: 1 }).set(panels, { yPercent: 0 });
    if (withLogo) {
      tl.fromTo(mark, { autoAlpha: 0, y: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power2.out" })
        .to(mark, { autoAlpha: 0, y: -20, duration: 0.25, ease: "power2.in" }, 0.45 + hold)
        .to(panels, { yPercent: -100, duration: 0.75, stagger: 0.08, ease: "power4.inOut" }, 0.55 + hold);
    } else {
      tl.set(cream, { yPercent: -100 })
        .to(panels.filter((p) => p !== cream), { yPercent: -100, duration: 0.6, stagger: 0.07, ease: "power4.inOut" }, 0.05);
    }
    // Tell the page the sheet is clearing, so an entrance can play into view
    // rather than behind it.
    tl.call(() => window.dispatchEvent(new Event("fx:reveal")), null, withLogo ? 0.9 + hold : 0.3);
    playing.current = tl;
    return tl;
  };

  // The last path wiped for: StrictMode runs effects twice on mount, and a
  // second pass must not replace the logo screen with a plain wipe.
  const wipedFor = useRef(null);

  useLayoutEffect(() => {
    if (wipedFor.current === pathname) return;
    wipedFor.current = pathname;
    if (!wipeRef.current || reduced()) {
      first.current = false;
      window.dispatchEvent(new Event("fx:reveal"));
      return;
    }
    const withLogo = first.current || logoNext.current;
    const hold = first.current ? 0.6 : 0.35;
    first.current = false;
    logoNext.current = false;
    lift(withLogo, hold);
  }, [pathname]);

  // The header logo. Leaving another page, the route change plays the logo
  // screen; already on the home page, the screen closes over it, the page
  // jumps back to the hero underneath, and it lifts again.
  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest(".header .brand") || reduced()) return;
      if (window.location.pathname !== "/") {
        logoNext.current = true;
        return;
      }
      const wipe = wipeRef.current;
      const panels = Array.from(wipe.querySelectorAll(".fx-wipe__panel"));
      playing.current?.kill();
      playing.current = gsap
        .timeline()
        .set(wipe, { autoAlpha: 1 })
        .set(wipe.querySelector(".fx-wipe__mark"), { autoAlpha: 0 })
        .fromTo(panels, { yPercent: 100 }, { yPercent: 0, duration: 0.6, stagger: 0.07, ease: "power4.inOut" })
        .add(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
          lift(true);
        });
    };
    // Capture phase: the router navigates (and the wipe runs) inside its own
    // click handler, before a bubbling listener here would hear of it.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /* ---------- Scroll reveals ---------- */
  useEffect(() => {
    if (reduced()) return;
    // The whole shell, so the footer arrives too.
    const main = document.querySelector(".app-shell");
    if (!main) return;

    const ctx = gsap.context(() => {
      const free = (el) => !el.closest(SKIP);

      // Section heads: the eyebrow slides in, the heading is unveiled from
      // below, the lede follows.
      gsap.utils.toArray(".section-head, .pagehero .container", main).filter(free).forEach((head) => {
        const eyebrow = head.querySelector(".eyebrow");
        const title = head.querySelector("h1, h2");
        const lede = head.querySelector(".lede");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: head, start: "top 88%", once: true },
          defaults: { ease: "power3.out" },
        });
        if (eyebrow) tl.from(eyebrow, { autoAlpha: 0, x: -24, letterSpacing: "0.4em", duration: 0.8 }, 0);
        if (title)
          tl.fromTo(
            title,
            { clipPath: "inset(0 0 100% 0)", y: 36 },
            { clipPath: "inset(0 0 -20% 0)", y: 0, duration: 1, clearProps: "clipPath" },
            0.08
          );
        if (lede) tl.from(lede, { autoAlpha: 0, y: 20, duration: 0.8 }, 0.3);
      });

      // Groups: each batch that crosses in together staggers in.
      const items = gsap.utils.toArray(STAGGERED.join(","), main).filter(free);
      gsap.set(items, { autoAlpha: 0, y: 46 });
      ScrollTrigger.batch(items, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            // Hand transform back to CSS, so hover lifts and tilt work.
            clearProps: "transform",
          }),
      });

      // Pictures in the category tiles and blog cards ease out of a zoom as
      // they arrive.
      gsap.utils.toArray(".cattile__media img, .pdp__photo", main).filter(free).forEach((img) => {
        gsap.from(img, {
          scale: 1.25,
          duration: 1.4,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: { trigger: img, start: "top 92%", once: true },
        });
      });

      // Product packs drop into their pool of light with a small bounce.
      gsap.utils.toArray(".card__media img", main).filter(free).forEach((img) => {
        gsap.from(img, {
          y: -40,
          rotate: -6,
          duration: 1.1,
          ease: "bounce.out",
          delay: 0.15,
          clearProps: "transform",
          scrollTrigger: { trigger: img, start: "top 90%", once: true },
        });
      });
    }, main);

    // Late images move everything below them; measure again once settled.
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div className="fx-wipe" ref={wipeRef} aria-hidden="true">
      <div className="fx-wipe__panel fx-wipe__panel--gold" />
      <div className="fx-wipe__panel fx-wipe__panel--green" />
      <div className="fx-wipe__panel fx-wipe__panel--cream">
        <img className="fx-wipe__mark" src="/images/cholan-logo.png" alt="" />
      </div>
    </div>
  );
}
