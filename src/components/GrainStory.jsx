import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./GrainStory.css";

gsap.registerPlugin(ScrollTrigger);

/*
  The grain's journey, told as one continuous scroll.

  A single stage is PINNED for the whole section while the artwork and copy
  cross-fade through four beats. That is what makes it read as one shot rather
  than four stacked sections: the frame never moves, only its contents change.

  Two motions run on different clocks, and keeping them apart is the whole
  idea:

  1. FALLING — the centre column drifts downward for the entire section,
     every frame of the scroll. The seed is always falling.
  2. THE SWAP — the changeover from one beat to the next is compressed into
     a short window at the hand-off. Outside that window nothing fades or
     slides; the reader only sees the fall.

  Done naively the two fight each other: a cross-fade spread across the whole
  beat reads as a permanent transition and the fall disappears inside it. So
  the swap is deliberately brief and the falling never stops.

  Scrubbed, not triggered. The hero's flight plays on its own clock because it
  is a single gesture; this is the opposite — the reader is walking through a
  sequence and should be able to stop, reverse and dwell anywhere in it.
*/

/*
  The four beats, and how each one INHERITS the last.

  The artwork is a real chain, not four unrelated pictures — each asset
  contains the previous one, so the transitions track the shape they share
  instead of cross-fading:

    01 seed    the husk lies on a diagonal, sprout above
    02 grain   the SAME husk, upright and much larger
    03 purity  that husk split open, white rice revealed inside
    04 pack    the split husk again, small and high, shedding rice into bags

  So `from`/`to` below describe where the shared husk sits at each hand-off.
  Beat 02 enters rotated to match beat 01's diagonal and scaled down to the
  seed's husk size, then settles upright and large — the husk appears to turn
  and grow rather than to be replaced. Beat 03 enters at 02's exact resting
  size so the split reads as the same grain opening. Beat 04 enters large and
  drops back, because its husk is a small element high in the frame and the
  eye needs to follow it there.

  `from` is the incoming state, `to` its rest. The outgoing beat leaves via
  the NEXT beat's `from` mirrored, so the two are always registered on each
  other.
*/
const BEATS = [
  {
    n: "01",
    title: "The seed.",
    lede: "Where every harvest begins.",
    aside: "Small seeds create a greater tomorrow.",
    /*
      Beat 01 is the only one built from two layers: the husk (with roots and
      the pale shoot base) and the green sprout, split out of the original
      asset. The sprout withdrawing into that base IS the transition into
      beat 02 — nothing fades.
    */
    img: "story-seed-husk",
    sprout: "story-seed-sprout",
    alt: "A rice seed sprouting its first green shoots",
    // First beat: no entry, it is simply there.
    from: { scale: 1, rotate: 0, x: 0, y: 0 },
  },
  {
    n: "02",
    title: "A grain of promise.",
    lede: "Each grain carries nature's nourishment.",
    aside: "Nature packs goodness in every grain.",
    img: "story-grain",
    alt: "A single husked grain of paddy",
    /*
      The seed's husk runs at roughly -38deg and occupies about a third of
      the frame; this grain is the same husk upright and full-height. Entering
      from that angle and scale hands one to the other.
    */
    from: { scale: 0.42, rotate: -34, x: "-12%", y: "6%" },
  },
  {
    n: "03",
    title: "Purity within.",
    lede: "Carefully processed to reveal what matters.",
    aside: "The essence of nature, revealed.",
    img: "story-purity",
    alt: "A husk opening to reveal the white rice grain inside",
    /*
      Same husk, same upright angle, same size as beat 02 at rest — only the
      split is new. So it enters at scale 1 with no rotation and the change
      is purely the husk opening.
    */
    from: { scale: 1.04, rotate: 0, x: 0, y: 0 },
  },
  {
    n: "04",
    title: "From paddy to pack.",
    lede: "Goodness sealed for every home.",
    aside: "Tradition nourishes today.",
    img: "story-pack",
    alt: "Cholan rice packs with grain spilling from an open sack",
    /*
      The split husk is still here but small and high in the frame, with the
      bags beneath it. Entering large and pulling back follows that husk from
      beat 03's full-frame version down to its place above the packs.
    */
    from: { scale: 1.55, rotate: 0, x: 0, y: "-16%" },
  },
];

// Scroll runway per beat, in viewport heights. Longer means a slower, more
// deliberate read; shorter makes the beats snap past.
const VH_PER_BEAT = 1.15;

/*
  How much of each beat's slice the swap occupies (0-1).

  Wider than the 0.26 a plain cross-fade needed. The artwork now morphs —
  the husk turns, grows and splits from one asset into the next — and a
  shape change has to be watched to be believed. At 0.26 the two assets were
  only briefly co-visible and the morph passed too fast to register, which
  made it look like a jump cut with extra steps.
*/
const SWAP = 0.42;

/* How far the centre column travels per beat, in vh. The fall is continuous
   across the whole section, so this is the per-beat rate, not a total. */
const FALL_VH = 26;

/*
  Air streaks: the rush of air past the falling grain.

  Hand-placed rather than generated on a grid, and deliberately uneven — a
  regular pattern reads as a decorative border, where scattered lines of
  differing length, speed and distance from the centre read as air.

  `x` is the horizontal position as a percentage of the stage; `len` the
  streak's length in vh; `offset` how far through its own travel it starts
  (so no two are in step); `rate` how many times it crosses the frame over
  the section — higher reads as nearer and faster; `near` marks the ones
  close to the grain, which are drawn brighter.

  They are kept clear of the middle (roughly 38-62%) so they never cross the
  artwork itself — air moving past an object, not through it.
*/
const STREAKS = [
  { x: 12, len: 13, offset: 0, rate: 5, near: false },
  { x: 19, len: 8, offset: 0.42, rate: 4, near: false },
  { x: 26, len: 17, offset: 0.15, rate: 7, near: true },
  { x: 31, len: 10, offset: 0.68, rate: 4.5, near: false },
  { x: 35, len: 21, offset: 0.3, rate: 8, near: true },
  { x: 65, len: 19, offset: 0.08, rate: 7.5, near: true },
  { x: 69, len: 9, offset: 0.55, rate: 4.2, near: false },
  { x: 74, len: 15, offset: 0.24, rate: 6.5, near: true },
  { x: 81, len: 11, offset: 0.8, rate: 4, near: false },
  { x: 88, len: 14, offset: 0.36, rate: 5.5, near: false },
];

export default function GrainStory() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const beats = gsap.utils.toArray(".grain__beat", root);
      const marks = gsap.utils.toArray(".grain__mark", root);

      /*
        Reduced motion: no pin, no scrub. Every beat is laid out in normal
        flow and simply shown — the story still reads top to bottom.
      */
      if (reduced) {
        root.classList.add("grain--static");
        gsap.set(beats, { opacity: 1, clearProps: "transform" });
        /* Every beat lays out in normal flow here, so they must all render —
           the scrubbed path hides the waiting ones with `visibility`. */
        gsap.set(root.querySelectorAll(".grain__art"), { visibility: "visible" });
        return;
      }

      /*
        Everything that moves per beat. The aside is a SIBLING of
        `.grain__text`, not a child, so a `.grain__text > *` selector misses
        it — and four asides then print on top of each other.
      */
      const movers = (b) => b.querySelectorAll(".grain__text > *, .grain__aside");

      /*
        Only the first beat shows at rest; the rest are parked at the entry
        state their own beat defines.

        Hidden with `visibility`, not opacity. The assets are cut-outs that
        cover only 10-48% of the frame (measured), so a waiting beat stacked
        behind the current one would be plainly visible through the
        transparent gaps — z-order alone cannot hide them. And visibility is
        binary, so switching it costs no fade: it flips on the single frame
        where the outgoing and incoming husks are congruent, which is the
        frame that hides the cut.
      */
      beats.forEach((b, i) => {
        gsap.set(movers(b), {
          opacity: i === 0 ? 1 : 0,
          // Matches the 18px the swap animates across — at 42 the incoming
          // line arrived travelling noticeably faster than it settled.
          y: i === 0 ? 0 : 18,
        });
        gsap.set(b.querySelector(".grain__art"), {
          visibility: i === 0 ? "visible" : "hidden",
          ...(i === 0 ? { scale: 1, rotate: 0, x: 0, y: 0 } : BEATS[i].from),
        });
      });

      /*
        THE FALL, done as relative motion.

        The artwork does NOT move. The side copy travels UPWARD instead, and
        the seed reads as falling against it — the same illusion as a train
        window, where the world sliding past is what tells you that you are
        moving.

        Why this way round: a seed animated downward tracks the scroll, so it
        drifts toward the bottom of the frame and has to be reset or it leaves
        the stage (which is what forced the per-beat slicing the artwork used
        to need). Holding it still and moving everything else costs nothing to
        keep framed, and the illusion is stronger because the eye takes the
        large central object as the fixed reference and reads the motion as
        belonging to it.

        The drift goes on a wrapper, not on the copy itself: the swaps animate
        `y` on those same elements, and two tweens on one transform would
        overwrite each other.
      */
      const drifters = gsap.utils.toArray(".grain__drift", root);
      const vh = (n) => (n * window.innerHeight) / 100;
      gsap.set(marks[0], { opacity: 1 });
      gsap.set(marks.slice(1), { opacity: 0.32 });

      // The sticky header holds the top of the viewport, so the stage pins
      // beneath it — "top top" slides the artwork up under the bar.
      const headerH = () =>
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h")
        ) || 74;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: () => `top top+=${headerH()}`,
          // +0.5 matches the fall tween's tail, so the last beat has runway
          // left to keep falling through after the final swap.
          end: () => `+=${window.innerHeight * VH_PER_BEAT * (BEATS.length + 0.5)}`,
          pin: ".grain__stage",
          /*
            Smoothing on the scrub is what turns a scroll-locked slideshow
            into something that glides: the timeline chases the scroll
            position rather than snapping to it.

            1.1 rather than 0.8 — a longer catch-up absorbs the coarse steps a
            mouse wheel delivers (a notch is a jump, not a sweep), so the
            morph interpolates through them instead of stepping.
          */
          scrub: 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /*
        The upward drift, per beat.

        Each beat's copy runs its OWN slice: it enters low and rises past
        centre while that beat is on screen. Per-beat rather than one shared
        tween because a single tween across all four would be cumulative —
        every beat's copy would keep travelling for the whole timeline and
        the later ones would start far above the frame.

        It rises through the beat, so the copy on screen is always mid-travel
        and the seed never appears to stop falling.
      */
      const SPAN = BEATS.length + 0.5;
      drifters.forEach((el, i) => {
        // Two drifters per beat (text and aside), so the beat index is the
        // pair's index, not the element's.
        const beatIndex = Math.floor(i / 2);

        /*
          The travel is deliberately SHORT and centred on zero.

          It used to run +14.3vh to -14.3vh, which meant that at every beat
          boundary the outgoing copy sat at -14.3 while the incoming one
          started at +14.3 — a 28.6vh discontinuity happening in the middle
          of the hand-off, exactly where the eye is looking. Halving it and
          keeping it symmetrical about zero means the two are never far apart
          when they cross over, so the change reads as continuous drift
          rather than a reset.
        */
        const travel = FALL_VH * 0.28;

        tl.fromTo(
          el,
          { y: () => vh(travel) },
          {
            y: () => vh(-travel),
            duration: 1 + (beatIndex === BEATS.length - 1 ? 0.5 : 0),
            ease: "none",
          },
          beatIndex
        );
      });

      /*
        THE AIR STREAKS, on the scroll.

        Each streak crosses the frame `rate` times over the section, driven by
        the same scrub as everything else — so they move only while the reader
        does and hold still the moment scrolling stops. A CSS loop kept
        asserting "this is falling" while the page was stationary, which is
        precisely when nothing should move.

        `repeat` with a modulo-style wrap gives the recycling a CSS keyframe
        loop provided for free: each streak runs its crossing, then starts the
        next from above the frame again.

        Opacity is tied to the same tween rather than set once, so a streak
        fades in as it enters and out as it leaves instead of clipping at the
        stage edges.
      */
      const streaks = gsap.utils.toArray(".grain__streak", root);
      streaks.forEach((el, i) => {
        const s = STREAKS[i];
        const crossing = SPAN / s.rate;

        /*
          One tween per crossing rather than `repeat`, because each crossing
          needs its own fade in and out. Timeline positions cannot be
          negative, so the offset is applied by starting the first crossing
          partway in and letting the sequence run from there.
        */
        const first = -crossing * s.offset;
        for (let c = 0; c < Math.ceil(s.rate) + 1; c++) {
          const at = first + c * crossing;
          if (at + crossing <= 0 || at >= SPAN) continue;

          /*
            One tween per crossing, with the travel and both fades expressed
            as keyframes on it. Done as three separate tweens this came to 192
            for a decorative layer; as keyframes it is a third of that.
          */
          tl.to(
            el,
            {
              keyframes: {
                // Upward: enters from below the stage, exits above it.
                "0%": { y: () => vh(104), opacity: 0 },
                "14%": { opacity: 1 },
                "84%": { opacity: 1 },
                "100%": { y: () => vh(-26), opacity: 0 },
              },
              duration: crossing,
              ease: "none",
              immediateRender: false,
            },
            Math.max(at, 0)
          );
        }
      });

      /*
        The swaps. Each is a brief window centred on the hand-off between two
        beats; between them the timeline carries no fade at all, so the only
        thing moving is the fall.

        The outgoing text lifts away and the incoming text arrives from below,
        which is what carries the eye downward through the change — the text
        moving is the transition, as asked.
      */
      beats.forEach((beat, i) => {
        if (i === 0) return;
        const prev = beats[i - 1];
        const at = i - SWAP / 2; // centre the swap on the beat boundary
        const prevArt = prev.querySelector(".grain__art");
        const art = beat.querySelector(".grain__art");
        const entry = BEATS[i].from;

        /*
          The artwork hand-off.

          The two assets OVERLAP through the change and are moved onto each
          other: the outgoing one travels toward the incoming one's entry
          state while the incoming one travels from it to rest. Both use the
          same easing over the same window, so through the middle of the swap
          the shared husk is in the same place, at the same size and angle, in
          both images — which is what makes it read as one object continuing
          rather than two pictures trading places.

          The previous version faded out to a flat `scale: 1.05` regardless of
          what the next image held, so every hand-off looked identical and the
          shape visibly jumped.

          Longer and more overlapped than the copy's swap: a shape morph needs
          to be seen to be believed, where text only needs to get out of the
          way.
        */
        /*
          The sprout retracts FIRST, before anything else moves.

          Beat 01 only. It withdraws into the shoot base it grows from, which
          is why its transform-origin is 50% 88% and not the centre. Once it
          is gone the husk is a bare grain — which is exactly what beat 02 is,
          so the swap that follows has nothing left to disguise.
        */
        const sprout = prev.querySelector(".grain__sprout");
        if (sprout) {
          tl.to(
            sprout,
            {
              scaleY: 0.04,
              scaleX: 0.5,
              y: "8%",
              // Withdraws steadily rather than snapping shut at the end.
              duration: SWAP * 0.62,
              ease: "sine.inOut",
            },
            at - SWAP * 0.5
          );
        }

        /*
          The artwork hand-off — no opacity anywhere.

          Both assets stay fully opaque. The outgoing one travels to the
          incoming one's entry state and the incoming one continues from
          there to rest, so at the hand-off frame the husk is at an identical
          size and angle in both — and the change is hidden because the two
          images are momentarily congruent, not because either faded.

          Switching `visibility` on that congruent frame performs the cut:
          instant, no fade, invisible because the two match at that instant.

          Easing matters more than it looks. Running both halves on
          `power2.inOut` made the outgoing husk DECELERATE to a standstill at
          the cut and the incoming one ACCELERATE from one, so the shape
          visibly paused at the exact instant of the swap. `sine.in` into
          `sine.out` join at matching velocity, carrying the motion through.
        */
        const cut = at + SWAP * 0.95;

        tl.to(
          prevArt,
          {
            scale: entry.scale,
            rotate: entry.rotate,
            x: entry.x ?? 0,
            y: entry.y ?? 0,
            duration: SWAP * 0.95,
            ease: "sine.in",
          },
          at
        )
          // The cut, on the frame where the two are congruent.
          .set(art, { visibility: "visible" }, cut)
          .set(prevArt, { visibility: "hidden" }, cut)
          .fromTo(
            art,
            { ...entry },
            {
              scale: 1,
              rotate: 0,
              x: 0,
              y: 0,
              duration: SWAP * 0.95,
              ease: "sine.out",
            },
            cut
          )
          /*
            The copy's swap. `sine` rather than `power2`: power curves
            accelerate hard at one end, which reads as a snap on a scrubbed
            timeline where the reader controls the rate. Sine leaves and
            arrives gently at both ends.

            The travel is also much shorter — 42px of lift made the outgoing
            line visibly shoot away. 18px is enough to read as departure
            without drawing attention to itself.
          */
          .to(
            movers(prev),
            { opacity: 0, y: -18, duration: SWAP * 0.8, stagger: 0.03, ease: "sine.inOut" },
            at
          )
          .to(
            movers(beat),
            { opacity: 1, y: 0, duration: SWAP * 0.9, stagger: 0.04, ease: "sine.inOut" },
            at + SWAP * 0.5
          )
          // The progress rail keeps step.
          .to(marks[i - 1], { opacity: 0.32, duration: SWAP * 0.5 }, at + SWAP * 0.4)
          .to(marks[i], { opacity: 1, duration: SWAP * 0.5 }, at + SWAP * 0.4);
      });

      /*
        The header writes --header-h after its first paint, and the artwork
        decodes later still — both feed the pin's geometry, so re-measure once
        they have landed rather than keeping the cold-load numbers.
      */
      const imgs = Array.from(root.querySelectorAll("img"));
      Promise.all(
        imgs.map((i) => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))
      ).then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="grain" ref={rootRef} aria-label="From seed to pack">
      <div className="grain__stage">
        {/* Air rushing past the falling grain. Behind the artwork, and clear
            of the middle so the streaks never cross it. */}
        <div className="grain__air" aria-hidden="true">
          {STREAKS.map((s, i) => (
            <span
              key={i}
              className={`grain__streak${s.near ? " grain__streak--near" : ""}`}
              style={{ "--x": `${s.x}%`, "--len": `${s.len}vh` }}
            />
          ))}
        </div>

        {/* Progress rail */}
        <ol className="grain__rail" aria-hidden="true">
          {BEATS.map((b) => (
            <li key={b.n} className="grain__mark">
              {b.n}
            </li>
          ))}
        </ol>

        {BEATS.map((b) => (
          <article className="grain__beat" key={b.n}>
            {/*
              .grain__drift carries the continuous upward travel; the elements
              inside carry the swap. Separate elements so the two never
              overwrite each other's transform — the same split the artwork
              used when it was the thing moving.
            */}
            <div className="grain__drift grain__drift--text">
              <div className="grain__text">
                <span className="grain__num">{b.n}</span>
                <h2>{b.title}</h2>
                <p className="grain__lede">{b.lede}</p>
              </div>
            </div>

            {/* The artwork holds still — see the note on the drift in the
                effect. It only transforms on the hand-off. */}
            <figure className="grain__art">
              <div className="grain__layers">
                {b.sprout ? (
                  // Split asset: no -sm variants, and the sprout is a
                  // separate layer so it can retract on its own.
                  <>
                    <img
                      className="grain__husk"
                      src={`/images/${b.img}.webp`}
                      alt={b.alt}
                      decoding="async"
                    />
                    <img
                      className="grain__sprout"
                      src={`/images/${b.sprout}.webp`}
                      alt=""
                      aria-hidden="true"
                      decoding="async"
                    />
                  </>
                ) : (
                  <picture>
                    <source media="(max-width: 800px)" srcSet={`/images/${b.img}-sm.webp`} />
                    <img src={`/images/${b.img}.webp`} alt={b.alt} decoding="async" />
                  </picture>
                )}
              </div>
            </figure>

            <div className="grain__drift grain__drift--aside">
              <p className="grain__aside">{b.aside}</p>
            </div>
          </article>
        ))}

        <div className="grain__cue" aria-hidden="true">
          <span className="grain__cue-dot" />
          Scroll to continue
        </div>
      </div>
    </section>
  );
}
