import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../data/site";
import "./CurtainStage.css";

gsap.registerPlugin(ScrollTrigger);

/*
  The hero. A static stage framed by carved pillars, the headline typed out
  on the yellow over the three packs. It scrolls away like any section.
*/

// A centred group: the big Karikalan bulk bag in front, flanked by the two
// smaller packs set back and angled out a little.
const PACKS = [
  { src: "/images/stage-rajabogam.webp", alt: "Cholan Rajabogam 5 kg pack", cls: "side-l" },
  { src: "/images/stage-karikalan.webp", alt: "Karikalan 25 kg bulk pack", cls: "hero" },
  { src: "/images/stage-gramiyam.webp", alt: "Gramiyam Bapatla Ponni 26 kg pack", cls: "side-r" },
];

const HEADLINE = "Carefully selected grains, packed with purpose.";

export default function CurtainStage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Entrance order: the centre bag first, then the two flanking it.
      const packs = gsap.utils
        .toArray(".curtain__pack", root)
        .sort((a, b) => b.classList.contains("curtain__pack--hero") - a.classList.contains("curtain__pack--hero"));
      const floor = root.querySelector(".curtain__floor");
      const opening = root.querySelector(".curtain__opening");

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /*
        Reduced motion: no entrance. The stage is shown as it rests.
      */
      const chars = gsap.utils.toArray(".curtain__ch", root);

      if (reduced) {
        gsap.set([opening, ...packs, floor, ...chars], { opacity: 1, "--rise": "0px" });
        gsap.set(opening, { y: 0 });
        return;
      }

      /* ---- Entrance ---- */

      /*
        The headline types itself out. Every letter is already laid out (just
        invisible), so the line never reflows as it grows; the caret is drawn
        on whichever letter was typed last. It starts once the opening wipe
        has lifted off the page, with a little irregularity per keystroke and
        a pause at the comma, so it reads as typed rather than revealed.
      */
      gsap.set(chars, { opacity: 0 });
      let caretAt = null;
      const caret = (el) => {
        caretAt?.classList.remove("is-caret");
        caretAt = el;
        el?.classList.add("is-caret");
      };
      /*
        The packs carry their staging (rotation, offset, scale) in CSS, so the
        entrance must NOT animate `transform` here — GSAP would overwrite the
        whole property and flatten the group back into a row. It animates a
        custom property the CSS transform consumes instead.
      */
      gsap.set(packs, { opacity: 0, "--rise": "50px" });
      gsap.set(floor, { opacity: 0, y: 16 });

      const intro = gsap.timeline({ defaults: { ease: "power2.out" } });
      intro
        /* Centre first, then the flanking pair — the group builds outward. */
        .to(
          packs,
          { opacity: 1, "--rise": "0px", duration: 0.5, stagger: 0.09 },
          0.15
        )
        .to(floor, { opacity: 1, y: 0, duration: 0.4 }, 0.45);

      let t = 1.3;
      chars.forEach((ch) => {
        intro.set(ch, { opacity: 1 }, t).add(() => caret(ch), t);
        t += ch.textContent === "," ? 0.32 : gsap.utils.random(0.04, 0.085);
      });
      // The caret blinks at the end of the line for a moment, then goes.
      intro.add(() => caret(null), t + 1.8);

      /*
        The artwork decodes after first paint and moves every section below;
        re-measure the scroll triggers once it has landed.
      */
      const imgs = Array.from(root.querySelectorAll("img"));
      Promise.all(
        imgs.map((i) => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))
      ).then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    }, root);

    return () => ctx.revert();
  }, []);

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
              {/* One span per letter for the typewriter; the heading is read
                  out whole from its label. */}
              <h1 className="curtain__lede" aria-label={HEADLINE}>
                {Array.from(HEADLINE).map((c, i) => (
                  <span key={i} className="curtain__ch" aria-hidden="true">
                    {c}
                  </span>
                ))}
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
