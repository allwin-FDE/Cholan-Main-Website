import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../data/site";
import useScrollStep, { topUnderHeader } from "./fx/useScrollStep";
import "./CurtainStage.css";

gsap.registerPlugin(ScrollTrigger);

/*
  The hero. A static stage framed by carved pillars, the headline fading
  in on the yellow over the three packs. It scrolls away like any section.
*/

// A centred group: the big Karikalan bulk bag in front, flanked by the two
// smaller packs set back and angled out a little.
const PACKS = [
  { src: "/images/stage-chennai-pattinam.webp", alt: "Chennai Pattinam Ponni rice pack", cls: "side-l" },
  { src: "/images/stage-karikalan.webp", alt: "Karikalan 25 kg bulk pack", cls: "hero" },
  { src: "/images/stage-moongil.webp", alt: "Cholan Moongil Ponni 26 kg pack", cls: "side-r" },
];

const HEADLINE = "Carefully selected grains, packed with purpose.";

export default function CurtainStage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let stopWaiting = null;
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const words = gsap.utils.toArray(".curtain__w", root);
      const left = root.querySelector(".curtain__pack--side-l");
      const right = root.querySelector(".curtain__pack--side-r");

      // Reduced motion: no entrance. The stage is shown as it rests.
      if (reduced) return;

      /*
        Entrance. The centre bag and its floor are on the stage from the
        start; then, on their own:
          1. the headline fades up, word by word;
          2. the two flanking bags slide out from behind the centre bag, one
             each side.

        The packs carry their staging (rotation, offset) in CSS, so the
        entrance must NOT animate `transform` here — GSAP would overwrite the
        whole property. It animates the custom properties the CSS transform
        consumes instead.
      */
      gsap.set(words, { opacity: 0, y: 18, filter: "blur(6px)" });
      gsap.set([left, right], { opacity: 0 });
      // Tucked in behind the centre bag, to slide out from it.
      gsap.set(left, { "--slide": "45%" });
      gsap.set(right, { "--slide": "-45%" });

      // Held until the page-load sheet starts to lift (fx:reveal), so the
      // entrance plays in view; the timer is a fallback should that never come.
      const intro = gsap.timeline({ paused: true });
      const start = () => {
        window.removeEventListener("fx:reveal", start);
        clearTimeout(fallback);
        intro.play();
      };
      window.addEventListener("fx:reveal", start);
      const fallback = setTimeout(start, 3000);
      stopWaiting = () => {
        window.removeEventListener("fx:reveal", start);
        clearTimeout(fallback);
      };
      intro
        .to(words, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "filter",
        })
        .to([left, right], { opacity: 1, duration: 0.45, ease: "none" }, "-=0.25")
        .to([left, right], { "--slide": "0%", duration: 0.85, ease: "power3.out" }, "<");

      /*
        On the way out the stage drifts down and fades a little behind the
        page, so leaving the hero has depth instead of sliding off flat.
      */
      gsap.to(root.querySelector(".curtain__inner"), {
        yPercent: 16,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });

      /*
        The artwork decodes after first paint and moves every section below;
        re-measure the scroll triggers once it has landed.
      */
      const imgs = Array.from(root.querySelectorAll("img"));
      Promise.all(
        imgs.map((i) => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))
      ).then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    }, root);

    return () => {
      stopWaiting?.();
      ctx.revert();
    };
  }, []);

  /*
    One step between the hero and the rail, either way. While the page sits
    on the hero, a single downward wheel tick, swipe or key press glides
    straight to the start of the rail section; from the start of the rail
    (up to a quarter of a screen in, before its scene has moved on), a single
    upward one glides straight back to the top. The page never rests half-way
    between the two. Further into the rail, and below, scrolls as normal.
  */
  useScrollStep(rootRef, (dir, y) => {
    const rail = rootRef.current?.nextElementSibling;
    if (!rail) return null;
    const t = topUnderHeader(rail);
    if (dir > 0) return y < t - 2 ? t : null;
    return y > 2 && y <= t + window.innerHeight * 0.25 ? 0 : null;
  });

  return (
    <section className="curtain" ref={rootRef} aria-label={site.name}>
      <div className="curtain__pin">
        <div className="curtain__body">
          {/* Kolam-style motif on the yellow, behind the pillars and bags. */}
          <div className="curtain__kolam" aria-hidden="true" />
          <img className="curtain__pillar curtain__pillar--l" src="/images/hero-pillar-carved.webp" alt="" aria-hidden="true" />
          <img className="curtain__pillar curtain__pillar--r" src="/images/hero-pillar-carved.webp" alt="" aria-hidden="true" />

          <div className="curtain__inner">
            {/* The headline and its line, set straight on the stage. */}
            <div className="curtain__opening">
              {/* One span per word for the fade; the heading is read out
                  whole from its label. */}
              <h1 className="curtain__lede" aria-label={HEADLINE}>
                {HEADLINE.split(" ").flatMap((w, i) => [
                  i > 0 ? " " : null,
                  <span key={i} className="curtain__w" aria-hidden="true">
                    {w}
                  </span>,
                ])}
              </h1>
            </div>

            <div className="curtain__stage">
              <div className="curtain__packs">
                {PACKS.map((p) => (
                  <img
                    key={p.src}
                    className={`curtain__pack curtain__pack--${p.cls}`}
                    src={p.src}
                    alt={p.alt}
                    decoding="async"
                  />
                ))}
              </div>
              <div className="curtain__floor" aria-hidden="true" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
