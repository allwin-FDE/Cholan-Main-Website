import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./TrainJourney.css";

gsap.registerPlugin(ScrollTrigger);

/*
  The journey out, as a scroll-scrubbed film.

  160 rendered frames of a train crossing the river at sunset: a wide shot,
  a slow push in onto the coaches, then a dissolve into open blue. The reader
  drives the playhead — nothing plays on its own clock.

  What makes it smooth rather than a flip-book:

  1. BLENDED FRAMES. The playhead is fractional. Frame 41.6 draws frame 41
     and then frame 42 over it at 60% alpha, so a slow scroll glides between
     renders instead of stepping from one to the next.
  2. A SMOOTHED SCRUB. The timeline chases the scroll (scrub 1.2) rather than
     snapping to it, which absorbs the coarse jumps a mouse wheel delivers.
  3. COARSE-TO-FINE LOADING. Frames load every 16th first, then every 8th,
     4th, 2nd, then the rest. The whole film is scrubbable early at low
     temporal resolution and sharpens as the rest arrive; a missing frame
     falls back to its nearest loaded neighbour, never to a blank.
  4. DECODED BEFORE USE. Every frame is `decode()`d off the main thread
     before it is eligible to draw, so a drawImage never stalls on a decode.

  What makes it sharp whenever the reader stops:

  5. IT NEVER RESTS ON A BLURRY FRAME. The push-in is a digital zoom, so
     sharpness falls steadily with it (measured: frame 0 scores ~740 on a
     Laplacian-variance test, frame 100 ~176, frame 130 ~13). Frames past
     SHARP_END are only ever passed THROUGH: the blurry stretch is given a
     short runway, and if the scroll stops inside it, ScrollTrigger's snap
     carries the page on to the finale (or back, if the reader was heading
     up). The dissolve's blue is soft by design and counts as a rest.
  6. A SINGLE CLEAN FRAME AT REST. Blending is for motion only; once the
     scrub settles, the nearest whole frame is drawn alone — no ghost of its
     neighbour — and a full-resolution, high-quality copy of it (`hq`) is
     fetched and faded in over the lighter streaming frame.
*/

const FRAME_COUNT = 160;
const frameSrc = (size, i) => `/images/train/${size}/${String(i).padStart(3, "0")}.webp`;

// Last frame sharp enough to stop on. Frames 0-SHARP_END (and the final
// blue) have high-quality copies in /images/train/hq.
const SHARP_END = 100;
const LAST = FRAME_COUNT - 1;
const hasHq = (i) => i <= SHARP_END || i === LAST;

/*
  Timeline units. Frames 0-SHARP_END play one unit per frame; the blurry
  push-in (SHARP_END to the end of the film) is squeezed into BLUR_DUR so the
  reader passes through it quickly; TAIL holds the finale.
*/
const BLUR_DUR = 22;
const TAIL = 18;
const TOTAL = SHARP_END + BLUR_DUR + TAIL;
// Timeline position of a frame.
const at = (frame) =>
  frame <= SHARP_END
    ? frame
    : SHARP_END + ((frame - SHARP_END) / (LAST - SHARP_END)) * BLUR_DUR;
// Where the finale's copy has fully arrived — the forward snap target.
const FINALE_REST = at(LAST) + 12;
// The backward snap target: beat 03 fully shown, on a sharp frame.
const BACK_REST = 84;

/*
  The copy, placed against the film in timeline units (the same as frames up
  to SHARP_END). `in` is where a beat starts arriving and `out` where it
  starts leaving; the text sits in the parts of the frame the shot leaves
  quiet at that moment. All three live on sharp frames.
*/
const BEATS = [
  {
    n: "01",
    kicker: "The journey",
    title: "Across the Kaveri, at golden hour.",
    lede: "Every harvest begins its trip home on the old line over the river.",
    place: "left",
    in: 0,
    out: 26,
  },
  {
    n: "02",
    kicker: "From the delta",
    title: "Out of the rice bowl, into the south.",
    lede: "Grain from Thanjavur's fields, carried to kitchens across Tamil Nadu and beyond.",
    place: "right",
    in: 32,
    out: 60,
  },
  {
    n: "03",
    kicker: "Carried with care",
    title: "Every coach, a promise kept.",
    lede: "Packed sealed at the source and moved unhurried, so it reaches you as it left the field.",
    place: "left",
    in: 66,
    out: 92,
  },
];

// Scroll runway for the whole film, in viewport heights.
const RUNWAY_VH = 4.6;

export default function TrainJourney() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = window.innerWidth <= 800 ? "sm" : "lg";
    const c2d = canvas.getContext("2d", { alpha: false });
    const frames = new Array(FRAME_COUNT).fill(null);
    const state = { frame: 0 };
    // At rest: the whole frame being held, its hq copy, and that copy's fade.
    const rest = { frame: -1, img: null, alpha: 0 };
    let restFade = null;
    const hqCache = new Map();
    let cancelled = false;
    let lastDrawn = -1;

    /* ---------- Loading ---------- */

    const load = (i) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = frameSrc(size, i);
        (img.decode ? img.decode() : Promise.resolve())
          .then(() => {
            if (cancelled) return;
            frames[i] = img;
            // A newly available frame may be the one the playhead wants.
            if (Math.abs(i - state.frame) < 20) draw(true);
          })
          .catch(() => {})
          .finally(resolve);
      });

    // Every 16th, then 8th, 4th, 2nd, then the odd ones — coarse to fine.
    const order = [];
    const seen = new Set();
    [16, 8, 4, 2, 1].forEach((step) => {
      for (let i = 0; i < FRAME_COUNT; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    });
    if (!seen.has(FRAME_COUNT - 1)) order.push(FRAME_COUNT - 1);

    let started = false;
    const startLoading = () => {
      if (started) return;
      started = true;
      const queue = order.slice(1); // frame 0 is already on its way
      const worker = async () => {
        while (queue.length && !cancelled) await load(queue.shift());
      };
      // A few in flight at once: enough to fill the pipe, few enough that
      // the early coarse frames are not starved by the fine ones.
      for (let k = 0; k < 6; k++) worker();
    };

    /* ---------- Drawing ---------- */

    const nearest = (i) => {
      if (frames[i]) return i;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    };

    const cover = (img) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      return [(cw - w) / 2, (ch - h) / 2, w, h];
    };

    function draw(force = false) {
      // Held still: one whole frame, the hq copy fading in over it.
      if (rest.frame >= 0) {
        const i = nearest(rest.frame);
        c2d.globalAlpha = 1;
        if (i >= 0) c2d.drawImage(frames[i], ...cover(frames[i]));
        if (rest.img) {
          c2d.globalAlpha = rest.alpha;
          c2d.drawImage(rest.img, ...cover(rest.img));
          c2d.globalAlpha = 1;
        }
        return;
      }

      const f = Math.min(Math.max(state.frame, 0), FRAME_COUNT - 1);
      if (!force && Math.abs(f - lastDrawn) < 0.002) return;

      const a = Math.floor(f);
      const t = f - a;
      const ia = nearest(a);
      if (ia < 0) return;

      c2d.globalAlpha = 1;
      c2d.drawImage(frames[ia], ...cover(frames[ia]));

      // Blend toward the next frame only when both real neighbours are in —
      // blending two stand-ins would smear rather than smooth.
      const b = a + 1;
      if (t > 0.01 && ia === a && b < FRAME_COUNT && frames[b]) {
        c2d.globalAlpha = t;
        c2d.drawImage(frames[b], ...cover(frames[b]));
        c2d.globalAlpha = 1;
      }
      lastDrawn = f;
    }

    /* ---------- Rest: swap in the full-quality frame ---------- */

    // A handful cached, so stopping back and forth nearby costs nothing;
    // each is a full 1920px bitmap once decoded, so no more than that.
    const loadHq = (i) => {
      if (hqCache.has(i)) return hqCache.get(i);
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc("hq", i);
      const p = (img.decode ? img.decode() : Promise.resolve()).then(() => img);
      p.catch(() => hqCache.delete(i));
      hqCache.set(i, p);
      if (hqCache.size > 4) hqCache.delete(hqCache.keys().next().value);
      return p;
    };

    const settle = () => {
      const i = Math.round(state.frame);
      if (!hasHq(i)) return;
      restFade?.kill();
      rest.frame = i;
      rest.img = null;
      rest.alpha = 0;
      draw(true); // drops the blend: one clean frame straight away
      loadHq(i)
        .then((img) => {
          if (cancelled || rest.frame !== i) return;
          rest.img = img;
          restFade = gsap.to(rest, {
            alpha: 1,
            duration: 0.35,
            ease: "sine.out",
            onUpdate: () => draw(true),
          });
        })
        .catch(() => {});
    };

    // Any movement hands the canvas back to the streaming frames.
    const unsettle = () => {
      if (rest.frame < 0) return;
      restFade?.kill();
      rest.frame = -1;
      rest.img = null;
      lastDrawn = -1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      c2d.imageSmoothingQuality = "high";
      draw(true);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ---------- Reduced motion: a still, and the words in flow ---------- */

    if (reduced) {
      root.classList.add("train--static");
      state.frame = 40;
      load(40).then(settle);
      return () => {
        cancelled = true;
        ro.disconnect();
      };
    }

    const firstFrame = load(0);

    // Start pulling the film a couple of screens before it arrives.
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && startLoading(),
      { rootMargin: "200% 0px" }
    );
    io.observe(root);

    /* ---------- The timeline ---------- */

    const ctx = gsap.context(() => {
      const headerH = () =>
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h")
        ) || 74;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: () => `top top+=${headerH()}`,
          end: () => `+=${window.innerHeight * RUNWAY_VH}`,
          pin: ".train__stage",
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          /*
            Never come to rest inside the blurry push-in. Anywhere on the
            sharp frames, or on the finale, the page stays where the reader
            left it; stop in between and it glides on to the finale — or back
            to beat 03 if the reader was scrolling up.
          */
          snap: {
            snapTo: (value, self) => {
              const t = value * TOTAL;
              if (t <= SHARP_END || t >= FINALE_REST) return value;
              return (self.direction < 0 ? BACK_REST : FINALE_REST) / TOTAL;
            },
            delay: 0.1,
            duration: { min: 0.35, max: 0.9 },
            ease: "power1.inOut",
            inertia: false,
          },
          // The scrub has caught up with the scroll: the film is still.
          onScrubComplete: settle,
        },
      });

      /*
        The playhead, in two legs. Linear within each: the film was rendered
        with its own pacing, and easing it would fight the camera move. The
        sharp leg runs one unit per frame; the blurry leg is compressed so it
        passes as a quick push rather than something to linger on.
      */
      const onMove = () => {
        unsettle();
        draw();
      };
      tl.to(state, { frame: SHARP_END, duration: SHARP_END, onUpdate: onMove }, 0)
        .to(state, { frame: LAST, duration: BLUR_DUR, onUpdate: onMove }, SHARP_END)
        // Pad the end so the finale holds on the settled blue.
        .to({}, { duration: TAIL }, at(LAST));

      const beats = gsap.utils.toArray(".train__beat", root);
      const marks = gsap.utils.toArray(".train__mark", root);

      beats.forEach((beat, i) => {
        const b = BEATS[i];
        const words = beat.querySelectorAll(".train__word > span");
        const rest = beat.querySelectorAll(".train__kicker, .train__lede, .train__rule");
        const first = i === 0;

        // Beat 01 is already on screen as the section pins; the others wait.
        gsap.set(words, { yPercent: first ? 0 : 110 });
        gsap.set(rest, { opacity: first ? 1 : 0, y: first ? 0 : 16 });
        gsap.set(beat, { autoAlpha: first ? 1 : 0 });

        if (!first) {
          tl.set(beat, { autoAlpha: 1 }, b.in)
            .to(words, { yPercent: 0, duration: 9, stagger: 0.9, ease: "power3.out" }, b.in)
            .to(rest, { opacity: 1, y: 0, duration: 8, stagger: 1.5, ease: "sine.out" }, b.in + 3)
            .to(marks[i], { opacity: 1, duration: 4 }, b.in)
            .to(marks[i - 1], { opacity: 0.35, duration: 4 }, b.in);
        }

        // Leaving: the title lifts out through its mask, the rest fades.
        tl.to(words, { yPercent: -110, duration: 8, stagger: 0.6, ease: "power2.in" }, b.out)
          .to(rest, { opacity: 0, y: -12, duration: 6, ease: "sine.in" }, b.out)
          .set(beat, { autoAlpha: 0 }, b.out + 10);
      });

      gsap.set(marks, { opacity: 0.35 });
      gsap.set(marks[0], { opacity: 1 });
      tl.to(marks[BEATS.length - 1], { opacity: 0.35, duration: 4 }, BEATS.at(-1).out);

      // The warm scrim follows the copy: dark under the sunset where the
      // text needs contrast, lifted for the close-up where it does not.
      tl.fromTo(".train__scrim", { opacity: 1 }, { opacity: 0.55, duration: 26 }, 66)
        .to(".train__scrim", { opacity: 0, duration: 12 }, SHARP_END + 2);

      // The finale, on the blue the film dissolves into.
      const fin = root.querySelector(".train__finale");
      const finWords = fin.querySelectorAll(".train__word > span");
      const finRest = fin.querySelectorAll(".train__kicker, .train__lede, .train__cta");
      gsap.set(fin, { autoAlpha: 0 });
      gsap.set(finWords, { yPercent: 110 });
      gsap.set(finRest, { opacity: 0, y: 18 });
      // Arrives as the train dissolves into the blue, and is complete by
      // FINALE_REST, where the snap lands.
      const finIn = at(148);
      tl.set(fin, { autoAlpha: 1 }, finIn)
        .to(finWords, { yPercent: 0, duration: 7, stagger: 0.8, ease: "power3.out" }, finIn)
        .to(finRest, { opacity: 1, y: 0, duration: 5, stagger: 1.5, ease: "sine.out" }, finIn + 3);

      // Film-wide details: progress line, and the cue that leaves early.
      tl.fromTo(".train__progress-fill", { scaleX: 0 }, { scaleX: 1, duration: TOTAL }, 0).to(
        ".train__cue",
        { opacity: 0, duration: 8 },
        6
      );

      // The header sets --header-h after first paint; re-measure once frame
      // 0 has landed so the pin uses the real numbers. Then settle, so the
      // opening shot is already the full-quality frame.
      firstFrame.then(() =>
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          settle();
        })
      );
    }, root);

    return () => {
      cancelled = true;
      ro.disconnect();
      io.disconnect();
      ctx.revert();
    };
  }, []);

  // Each word in its own mask, so titles rise into place line by line. The
  // space sits between the masks — inside an inline-block it is trimmed.
  const words = (text) =>
    text.split(" ").flatMap((w, i) => [
      i > 0 ? " " : null,
      <span className="train__word" key={i}>
        <span>{w}</span>
      </span>,
    ]);

  return (
    <section className="train" ref={rootRef} aria-label="The journey to your table">
      <div className="train__stage">
        <canvas className="train__canvas" ref={canvasRef} aria-hidden="true" />
        <div className="train__scrim" aria-hidden="true" />
        <div className="train__vignette" aria-hidden="true" />

        {BEATS.map((b) => (
          <article key={b.n} className={`train__beat train__beat--${b.place}`}>
            <span className="train__kicker">
              <span className="train__n">{b.n}</span>
              {b.kicker}
            </span>
            <h2 className="train__title">{words(b.title)}</h2>
            <span className="train__rule" aria-hidden="true" />
            <p className="train__lede">{b.lede}</p>
          </article>
        ))}

        <article className="train__finale">
          <span className="train__kicker">Journey's end</span>
          <h2 className="train__title">{words("Arriving fresh, at your table.")}</h2>
          <p className="train__lede">
            From the field, over the river, to the plate — the way rice should travel.
          </p>
          <Link to="/products" className="btn btn--gold train__cta">
            Explore our rice
          </Link>
        </article>

        <ol className="train__rail" aria-hidden="true">
          {BEATS.map((b) => (
            <li key={b.n} className="train__mark">
              {b.n}
            </li>
          ))}
        </ol>

        <div className="train__progress" aria-hidden="true">
          <span className="train__progress-fill" />
        </div>

        <div className="train__cue" aria-hidden="true">
          <span className="train__cue-line" />
          Scroll to ride along
        </div>
      </div>
    </section>
  );
}
