import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/*
  The playful layer, wired once for the whole site by event delegation, so it
  needs no per-component code and follows content as routes change.

    * Tilt      cards lean toward the pointer, with a glint of light where
                it sits (mouse and trackpad only).
    * Magnet    buttons are drawn a little toward the pointer.
    * Cursor    a ring trails the pointer and swells over anything clickable.
    * Grains    a tap or click on anything interactive throws a small burst
                of rice grains.
    * To top    a button that fills its ring as the page is read.
*/

const TILT = ".card, .cattile, .postcard, .quote, .infocard, .feature";
const MAGNET = ".btn, .card__details, .ab-btn, .chip, .cart-btn";
const CLICKABLE = "a, button, .chip, select, label[for], [role='button']";
// The pinned films handle their own pointer feel.
const SKIP = ".curtain, .rs, .temple";

const GRAIN_COLOURS = ["#e8bb56", "#d29b2c", "#f6ebcf", "#fffdf5", "#b07d1d"];

export default function Interactions() {
  const cursorRef = useRef(null);
  const [showTop, setShowTop] = useState(false);
  const ringRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups = [];
    const on = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts);
      cleanups.push(() => target.removeEventListener(type, fn, opts));
    };

    /* ---------- Grain burst: every device ---------- */
    const layer = document.createElement("div");
    layer.className = "fx-grains";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    cleanups.push(() => layer.remove());

    if (!reduced) {
      on(document, "pointerdown", (e) => {
        const hit = e.target.closest(CLICKABLE);
        if (!hit || hit.closest(SKIP) || hit.matches("input, textarea")) return;
        const n = 10;
        for (let i = 0; i < n; i++) {
          const g = document.createElement("span");
          g.className = "fx-grain";
          g.style.background = GRAIN_COLOURS[i % GRAIN_COLOURS.length];
          layer.appendChild(g);
          const angle = (Math.PI * 2 * i) / n + gsap.utils.random(-0.3, 0.3);
          const dist = gsap.utils.random(28, 64);
          gsap.set(g, { x: e.clientX, y: e.clientY, rotate: (angle * 180) / Math.PI + 90, scale: gsap.utils.random(0.7, 1.2) });
          gsap
            .timeline({ onComplete: () => g.remove() })
            .to(g, { x: `+=${Math.cos(angle) * dist}`, y: `+=${Math.sin(angle) * dist}`, duration: 0.45, ease: "power3.out" })
            .to(g, { y: "+=26", rotate: "+=120", autoAlpha: 0, duration: 0.45, ease: "power1.in" }, 0.3);
        }
      });
    }

    if (!fine || reduced) return () => cleanups.forEach((c) => c());

    /* ---------- Tilt ---------- */
    let tilted = null;
    let raf = 0;
    const untilt = () => {
      if (!tilted) return;
      tilted.classList.remove("fx-tilt");
      tilted.style.removeProperty("--rx");
      tilted.style.removeProperty("--ry");
      tilted = null;
    };

    /* ---------- Magnet ---------- */
    const magnets = new WeakMap();
    let pulled = null;
    const magnetFor = (el) => {
      if (!magnets.has(el)) {
        magnets.set(el, {
          x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
        });
      }
      return magnets.get(el);
    };
    const release = () => {
      if (!pulled) return;
      const el = pulled;
      pulled = null;
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)", clearProps: "transform" });
    };

    /* ---------- Cursor ---------- */
    const cursor = cursorRef.current;
    const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
    let cursorState = "";
    const setCursor = (state) => {
      if (state === cursorState) return;
      cursorState = state;
      cursor.dataset.state = state;
    };

    on(document, "pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const { clientX: x, clientY: y, target } = e;
      cursor.classList.add("is-on");
      cx(x);
      cy(y);

      const inSkip = target.closest?.(SKIP);

      // Cursor state.
      if (inSkip) setCursor("");
      else if (target.closest("input, textarea")) setCursor("text");
      else if (target.closest(CLICKABLE)) setCursor("link");
      else setCursor("");

      // Magnet.
      const m = inSkip ? null : target.closest(MAGNET);
      if (m !== pulled) release();
      if (m) {
        pulled = m;
        const r = m.getBoundingClientRect();
        // Measure without our own offset, or the pull would feed on itself.
        const ox = gsap.getProperty(m, "x");
        const oy = gsap.getProperty(m, "y");
        const q = magnetFor(m);
        q.x((x - (r.left - ox + r.width / 2)) * 0.28);
        q.y((y - (r.top - oy + r.height / 2)) * 0.36);
      }

      // Tilt.
      const t = inSkip ? null : target.closest(TILT);
      if (t !== tilted) untilt();
      if (!t) return;
      tilted = t;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (tilted !== t) return;
        const r = t.getBoundingClientRect();
        const px = (x - r.left) / r.width;
        const py = (y - r.top) / r.height;
        t.style.setProperty("--rx", `${((0.5 - py) * 7).toFixed(2)}deg`);
        t.style.setProperty("--ry", `${((px - 0.5) * 9).toFixed(2)}deg`);
        t.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        t.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        t.classList.add("fx-tilt");
      });
    });

    on(document, "pointerleave", () => {
      cursor.classList.remove("is-on");
      untilt();
      release();
    });
    on(document, "pointerdown", () => cursor.classList.add("is-down"));
    on(document, "pointerup", () => cursor.classList.remove("is-down"));
    // A route change swaps the page under a still pointer.
    on(window, "scroll", () => {
      untilt();
    }, { passive: true });

    document.documentElement.classList.add("fx-fine");
    cleanups.push(() => document.documentElement.classList.remove("fx-fine"));

    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
    };
  }, []);

  /* ---------- Back to top, with a reading ring ---------- */
  useEffect(() => {
    const ring = ringRef.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setShowTop(window.scrollY > window.innerHeight * 0.9);
      if (ring) ring.style.strokeDashoffset = String(1 - p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div className="fx-cursor" ref={cursorRef} aria-hidden="true" />

      <button
        type="button"
        className={`fx-top${showTop ? " fx-top--on" : ""}`}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle className="fx-top__track" cx="24" cy="24" r="21" />
          <circle ref={ringRef} className="fx-top__ring" cx="24" cy="24" r="21" pathLength="1" />
          <path className="fx-top__arrow" d="M24 31V17m-6 6 6-6 6 6" />
        </svg>
      </button>
    </>
  );
}
