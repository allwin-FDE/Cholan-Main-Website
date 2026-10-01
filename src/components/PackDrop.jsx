import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./PackDrop.css";

gsap.registerPlugin(ScrollTrigger);

/*
  The hand-off between the hero and the grain's journey.

  The leaf wipe ends by uncovering whatever follows it. What it uncovers here
  is an empty stage with a shaft of light down the middle — and then the pack
  descends into it, out of that light, and keeps travelling down for the whole
  section as the reader scrolls.

  The whole point is that the bag reads as ARRIVING FROM ABOVE rather than as
  a picture that faded in. Three things carry that, and none of them is the
  bag's own movement:

    1. The light shaft it emerges from, which is brightest at the top of the
       frame and is the only thing on the stage before the bag appears.
    2. Streaks rushing UPWARD past it — the surroundings streaming past a
       falling object. This is the same device GrainStory uses for its falling
       seed, deliberately, so the two sections read as one continuous descent
       rather than as two unrelated animations.
    3. A ground shadow that tightens as it nears the floor.

  A bag moving down a frame, on its own, is ambiguous — it reads just as
  easily as the camera tilting up. The streaks and the shaft are what fix the
  direction.
*/

/*
  Scroll runway, in viewport heights.

  One viewport. The descent is a single gesture with no beats in it, so a
  longer runway just holds a pinned frame while very little changes; shorter
  than this and the bag lands almost as soon as it has appeared, which loses
  the fall entirely.
*/
const RUN_VH = 1.0;

/*
  Streaks rushing upward past the falling bag.

  `x` is the horizontal position in %, `len` the length in vh, `rate` how
  many times it crosses the frame over the section, and `offset` how far
  through its first crossing it starts — without that they would all enter
  together and pulse in lockstep.

  Kept clear of the middle (38-62%), as in GrainStory: this is air moving
  PAST the bag, not through it.
*/
const STREAKS = [
  { x: 9, len: 14, offset: 0.0, rate: 4.5, near: false },
  { x: 16, len: 9, offset: 0.48, rate: 3.6, near: false },
  { x: 23, len: 18, offset: 0.18, rate: 6.2, near: true },
  { x: 29, len: 11, offset: 0.72, rate: 4.0, near: false },
  { x: 34, len: 22, offset: 0.34, rate: 7.0, near: true },
  { x: 66, len: 20, offset: 0.1, rate: 6.6, near: true },
  { x: 71, len: 10, offset: 0.58, rate: 3.8, near: false },
  { x: 77, len: 16, offset: 0.26, rate: 5.8, near: true },
  { x: 84, len: 12, offset: 0.84, rate: 3.5, near: false },
  { x: 91, len: 15, offset: 0.4, rate: 5.0, near: false },
];

export default function PackDrop() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const bag = root.querySelector(".drop__bag");
      const shaft = root.querySelector(".drop__shaft");
      const shadow = root.querySelector(".drop__shadow");
      const copy = root.querySelector(".drop__copy");

      /*
        Reduced motion: no pin, no fall. The bag is simply standing on the
        stage, lit, with its copy beside it — a still of the moment the
        animation would have ended.
      */
      if (reduced) {
        gsap.set([bag, copy], { opacity: 1, y: 0 });
        gsap.set(shaft, { opacity: 0.5 });
        gsap.set(shadow, { opacity: 0.32, scaleX: 1 });
        return;
      }

      const vh = (n) => (window.innerHeight * n) / 100;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * RUN_VH}`,
          pin: ".drop__pin",
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /*
        The shaft is already lit when the section arrives — it is what the
        leaf wipe uncovers, and the bag drops OUT of it. Brightening as the
        bag passes through reads as the bag catching the light.

        It starts at 0.72, not the 0.22 this began with. The wipe hands over
        at this timeline's position 0, and at 0.22 against a cream ground the
        shaft was invisible: measured, the reveal landed on an effectively
        blank frame and held it until the bag fell into view. The leaf has to
        uncover SOMETHING, and the light is what it uncovers.
      */
      gsap.set(shaft, { opacity: 0.72 });
      tl.to(shaft, { opacity: 0.95, duration: 0.34 }, 0)
        .to(shaft, { opacity: 0.4, duration: 0.42 }, 0.5);

      /*
        THE FALL.

        From well above the frame to its resting place on the floor. The
        distance is expressed in vh and resolved in a function so it
        re-measures on resize rather than baking in the load-time viewport.

        `power2.out` on the travel, not `none`: a falling object arriving at a
        floor decelerates into it. The streaks stay linear, so the bag slowing
        against a constant airflow is what sells the landing.

        Duration 0.92, not 0.72: the brief is that the bag keeps travelling
        down for as long as the reader keeps scrolling. Measured at 0.72 it
        touched down at 44% of the runway and the remaining 56% was a pinned,
        frozen frame — the reader scrolls and nothing moves, which is worse
        than no pin at all. The last 8% is the settle after it lands, not
        dead air.
      */
      tl.fromTo(
        bag,
        { y: () => vh(-96), opacity: 1, scale: 0.86 },
        { y: 0, scale: 1, duration: 0.92, ease: "power2.out" },
        0
      );

      /*
        The contact shadow: wide and faint while the bag is high, tightening
        and darkening as it lands. This is the only cue for HOW FAR above the
        floor the bag is, since the bag itself is a flat cut-out.
      */
      gsap.set(shadow, { opacity: 0, scaleX: 1.9, scaleY: 0.6 });
      tl.to(
        shadow,
        { opacity: 0.34, scaleX: 1, scaleY: 1, duration: 0.92, ease: "power2.out" },
        0
      );

      /* The copy arrives as the bag settles, not during the fall — reading
         and watching at the same time means doing neither. */
      gsap.set(copy, { opacity: 0, y: 18 });
      tl.to(copy, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0.84);

      /*
        The streaks. One tween per crossing rather than `repeat`, because each
        crossing needs its own fade in and out — a repeating tween would clip
        hard at the stage edges. Timeline positions cannot be negative, so the
        offset starts the first crossing partway through.

        Upward, matching GrainStory: read as the surroundings streaming past
        the camera, which is what the bag's downward travel establishes.
      */
      const SPAN = 1;
      const streaks = gsap.utils.toArray(".drop__streak", root);
      streaks.forEach((el, i) => {
        const s = STREAKS[i];
        const crossing = SPAN / s.rate;
        const first = -crossing * s.offset;

        for (let c = 0; c < Math.ceil(s.rate) + 1; c++) {
          const at = first + c * crossing;
          if (at + crossing <= 0 || at >= SPAN) continue;

          tl.to(
            el,
            {
              keyframes: {
                "0%": { y: () => vh(104), opacity: 0 },
                "16%": { opacity: 1 },
                "82%": { opacity: 1 },
                "100%": { y: () => vh(-26), opacity: 0 },
              },
              duration: crossing,
              ease: "none",
            },
            Math.max(0, at)
          );
        }
      });

      /* The artwork decodes after first paint and feeds the pin's geometry,
         so re-measure once it has landed. */
      const imgs = Array.from(root.querySelectorAll("img"));
      Promise.all(
        imgs.map((i) => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))
      ).then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="drop" ref={rootRef} aria-label="Our rice, packed">
      <div className="drop__pin">
        {/* The shaft of light the bag descends out of. Behind everything. */}
        <div className="drop__shaft" aria-hidden="true" />

        {/* Airflow past the falling bag. Behind the bag, above the shaft. */}
        <div className="drop__air" aria-hidden="true">
          {STREAKS.map((s, i) => (
            <span
              key={i}
              className={`drop__streak${s.near ? " drop__streak--near" : ""}`}
              style={{ "--x": `${s.x}%`, "--len": `${s.len}vh` }}
            />
          ))}
        </div>

        <div className="drop__stage">
          <div className="drop__shadow" aria-hidden="true" />
          <img
            className="drop__bag"
            src="/images/stage-karikalan.webp"
            alt="Karikalan 25 kg rice pack"
            decoding="async"
          />
        </div>

        <div className="drop__copy">
          <p className="drop__eyebrow">Straight from the mill</p>
          <h2 className="drop__title">Sealed at the source.</h2>
        </div>
      </div>
    </section>
  );
}
