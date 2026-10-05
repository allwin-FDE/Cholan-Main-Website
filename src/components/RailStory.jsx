import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./RailStory.css";

gsap.registerPlugin(ScrollTrigger);

/*
  Farm to home, by rail — the storyline that runs into the temple flight.

  One pinned stage, one scrubbed timeline, three beats:

    1. THE BRIDGE     built live from layers (far fields, bridge, blurred
                      paddy in front) so the scroll has depth. The full train
                      — engine and four coaches — crosses it and never stops.
    2. INTO THE CLOUD while the train is still running, the camera drifts in
                      and the scene whites out into cloud.
    3. THE TEMPLE     the temple rises through the cloud as the mist clears,
                      under the brand line, and the section scrolls away
                      on that shot into the temple flight below.
*/

// Scroll runway, in viewport heights.
// Scaled with the timeline, which now ends on the temple (63 units, was 76).
const RUNWAY_VH = 4;

// Timeline marks (units are arbitrary; everything is relative).
const WHITE_IN = 25; // cloud starts rolling over the bridge
const SKY_AT = 33; // the temple act begins

// Headline words, each in a mask so it can rise into place. The spaces sit
// between the masks: inside an inline-block they would collapse.
const words = (text) =>
  text.split(" ").flatMap((w, i) => [
    i > 0 ? " " : null,
    <span className="rs__word" key={i}>
      <span>{w}</span>
    </span>,
  ]);

export default function RailStory() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("rs--static");
      return;
    }

    const world = root.querySelector(".rs__world");
    const sky = root.querySelector(".rs__sky");
    const brand = root.querySelector(".rs__brand");
    const templePos = root.querySelector(".rs__temple-pos");
    const templeImg = root.querySelector(".rs__temple");
    const stackedMQ = window.matchMedia("(max-width: 800px)");

    /*
      The temple is sized to the room the brand line leaves it, so the two
      never meet — however big the screen, however the line wraps. CSS
      cannot know that room; it is measured on every refresh.

        * Stacked (phones, small tablets): the line sits above the temple, so
          the temple gets the height left under it.
        * Side by side (wider screens): the line sits on the left, so the
          temple gets the width to its right — pavilions and all — centred in
          that space, and no taller than the frame.

      Both allow for the 1.06 settle at the end, which grows the temple about
      its base.
    */
    const TEMPLE_SETTLE = 1.06;
    const GAP = 32;
    const fitTemple = () => {
      templePos.style.width = "";
      templePos.style.left = "";
      if (!templeImg.naturalWidth) return;
      const aspect = templeImg.naturalHeight / templeImg.naturalWidth;
      const skyH = sky.clientHeight;
      const cssW = templePos.offsetWidth;
      if (stackedMQ.matches) {
        const room = skyH * 0.97 - (brand.offsetTop + brand.offsetHeight) - 16;
        const maxW = room / (aspect * TEMPLE_SETTLE);
        if (maxW < cssW) templePos.style.width = `${Math.max(0, maxW)}px`;
        return;
      }
      const brandRight = brand.offsetLeft + brand.offsetWidth;
      const room = sky.clientWidth * 0.97 - brandRight - GAP;
      const byWidth = room / TEMPLE_SETTLE;
      const byHeight = (skyH * 0.94) / (aspect * TEMPLE_SETTLE);
      const w = Math.max(0, Math.min(cssW, byWidth, byHeight));
      templePos.style.width = `${w}px`;
      templePos.style.left = `${brandRight + GAP + room / 2}px`;
    };
    const train = root.querySelector(".rs__train");
    const bridge = root.querySelector(".rs__bridge");

    /*
      Train motion, in percent of the world's width per unit. Tuned so the
      whole train stands centred in the view at FULL_AT (desktop: the world
      is the screen; portrait: the screen shows the world's middle half, which
      is centred too). Measured from the train itself, so any length of train
      works, and re-read on every refresh, so rotating a phone re-tunes it.
    */
    const START = 100;
    const FULL_AT = 24;
    let speed = 0;
    const tune = () => {
      const trainPct = world.offsetWidth ? (train.offsetWidth / world.offsetWidth) * 100 : 80;
      const fullLeft = (100 - trainPct) / 2;
      speed = (START - fullLeft) / FULL_AT;
    };

    // The train runs on a transform, on its own GPU layer: moving it with
    // left repainted the whole scene every frame, which flickered.
    const setTrainX = gsap.quickSetter(train, "x", "px");
    let ww = 0;
    let lastT = -1;
    const run = (t) => {
      // Hidden under the cloud from here on — stop spending on it.
      if (t > SKY_AT + 1 || Math.abs(t - lastT) < 1e-4) return;
      lastT = t;
      setTrainX(((START - speed * t) / 100) * ww);
    };

    const ctx = gsap.context(() => {
      const headerH = () =>
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 74;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: () => `top top+=${headerH()}`,
          end: () => `+=${window.innerHeight * RUNWAY_VH}`,
          pin: ".rs__stage",
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            tune();
            fitTemple();
            ww = world.offsetWidth;
            lastT = -1;
            run(tl.time());
          },
        },
        onUpdate: () => run(tl.time()),
      });

      /* ---------- Beat 1: the bridge ---------- */

      // Depth: the nearer the layer, the further it travels.
      tl.fromTo(".rs__fields", { xPercent: 1 }, { xPercent: -2, duration: SKY_AT }, 0)
        .fromTo(".rs__bridge", { xPercent: 2 }, { xPercent: -3, duration: SKY_AT }, 0)
        // The board stands on the bridge, so it travels exactly as the
        // bridge does: the same share of the bridge's width, in pixels.
        .fromTo(
          ".rs__board",
          { x: () => bridge.offsetWidth * 0.02 },
          { x: () => bridge.offsetWidth * -0.03, duration: SKY_AT },
          0
        )
        .fromTo(".rs__paddy", { xPercent: 3 }, { xPercent: -7, duration: SKY_AT }, 0)
        // The opening line leaves as the train draws level.
        .to(".rs__intro", { autoAlpha: 0, y: -24, duration: 8, ease: "sine.in" }, 12);

      /* ---------- Beat 2: into the cloud ---------- */

      // The camera drifts in on the running train as the cloud closes over.
      tl.fromTo(world, { scale: 1 }, { scale: 1.14, duration: SKY_AT - 18, ease: "sine.in" }, 18)
        .to(".rs__paddy", { yPercent: 30, duration: SKY_AT - 18, ease: "sine.in" }, 18)
        .fromTo(".rs__white", { autoAlpha: 0 }, { autoAlpha: 1, duration: SKY_AT - WHITE_IN, ease: "sine.inOut" }, WHITE_IN);

      /* ---------- Beat 3: the temple, under the brand line ---------- */

      const T = SKY_AT;
      tl.set(".rs__sky", { autoAlpha: 1 }, T)
        .to(".rs__white", { autoAlpha: 0, duration: 8, ease: "sine.out" }, T)
        .fromTo(".rs__clouds", { scale: 1.18 }, { scale: 1, duration: 40, ease: "power1.out" }, T)
        .fromTo(".rs__clouds", { xPercent: 2 }, { xPercent: -3, duration: 48 }, T)
        // The temple rises through the cloud…
        .fromTo(".rs__temple", { yPercent: 55, scale: 0.94 }, { yPercent: 0, scale: 1, duration: 22, ease: "power2.out" }, T + 3)
        // …wrapped in mist that thins as it climbs clear.
        .fromTo(".rs__mist", { autoAlpha: 1, yPercent: 0 }, { autoAlpha: 0.15, yPercent: 18, duration: 20, ease: "sine.inOut" }, T + 9)
        // The brand line rises word by word as the temple clears the mist.
        .fromTo(".rs__brand-kicker", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 4, ease: "power2.out" }, T + 8)
        .fromTo(".rs__brand-title .rs__word > span", { yPercent: 140 }, { yPercent: 0, duration: 6, stagger: 0.8, ease: "power3.out" }, T + 9)
        .fromTo(".rs__brand-rule", { scaleX: 0 }, { scaleX: 1, duration: 6, ease: "power2.inOut" }, T + 14)
        .fromTo(".rs__brand-lede", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 5, ease: "power2.out" }, T + 15)
        // A beat to take it in; the section then scrolls away on the temple
        // and the brand line — no white-out, no empty frame.
        .to(".rs__temple", { scale: TEMPLE_SETTLE, duration: 8 }, T + 22);

      tl.fromTo(".rs__progress-fill", { scaleX: 0 }, { scaleX: 1, duration: tl.duration() }, 0);

      tune();
      fitTemple();
      ww = world.offsetWidth;
      run(0);

      // Layers decode late and shift every trigger below; re-measure once in.
      const imgs = Array.from(root.querySelectorAll("img"));
      Promise.all(imgs.map((i) => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))).then(() =>
        requestAnimationFrame(() => ScrollTrigger.refresh())
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="rs" ref={rootRef} aria-label="From our farms to your home, by rail">
      <div className="rs__stage">
        {/* Beat 1: the bridge, built from layers. */}
        {/* The frame is placed and centred by CSS; GSAP only ever moves the
            world inside it. Were GSAP to touch the centred box itself, it
            would fold the CSS centring into its own transform on first use
            and keep it after a resize or rotation. */}
        <div className="rs__frame">
          <div className="rs__world">
            <img className="rs__layer rs__fields" src="/images/rail/fields.webp" alt="" decoding="async" />
            <img className="rs__layer rs__bridge" src="/images/rail/bridge.webp" alt="" decoding="async" />
            {/* The station nameboard, on the far side of the track: the train
                runs past in front of it. */}
            <img
              className="rs__layer rs__board"
              src="/images/rail/cholan-board.webp"
              alt="Cholan station nameboard"
              decoding="async"
            />
            <img
              className="rs__layer rs__train"
              src="/images/rail/full-train6.webp"
              alt="A passenger train crossing the bridge over the paddy fields"
              decoding="async"
            />
            <img className="rs__layer rs__paddy" src="/images/rail/paddy.webp" alt="" decoding="async" />
          </div>
        </div>

        <div className="rs__intro">
          <h2 className="rs__title">Travels through a journey of care and quality.</h2>
        </div>

        {/* Beat 3: the temple in the clouds, under the brand line. */}
        <div className="rs__sky">
          <img className="rs__clouds" src="/images/rail/clouds.webp" alt="" decoding="async" />
          {/* Placed by the wrapper, animated on the image — as with the frame. */}
          <div className="rs__temple-pos">
            <img
              className="rs__temple"
              src="/images/rail/temple-cut.webp"
              alt="The Brihadeeswarar temple rising through the clouds"
              decoding="async"
            />
          </div>
          <div className="rs__mist" aria-hidden="true" />
          <div className="rs__ground" aria-hidden="true" />

          <div className="rs__brand">
            <span className="rs__brand-kicker">Cholan Rice &amp; Millets</span>
            <h2 className="rs__brand-title">
              <span className="rs__line">{words("Rooted in the")}</span>
              <span className="rs__line">{words("timeless legacy of")}</span>
              <span className="rs__line">{words("the Chola land.")}</span>
            </h2>
            <span className="rs__brand-rule" aria-hidden="true" />
            <p className="rs__brand-lede">
              Ponni and native paddy from the Cauvery delta, milled and packed for your kitchen.
            </p>
          </div>
        </div>

        <div className="rs__white" aria-hidden="true" />

        <div className="rs__progress" aria-hidden="true">
          <span className="rs__progress-fill" />
        </div>
      </div>
    </section>
  );
}
