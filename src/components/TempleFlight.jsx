import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./TempleFlight.css";
import { benefits } from "../data/benefits";

/*
  The flight over Thanjavur, played as a film.

  A rendered sequence (Comp 3): straight down through drifting cloud onto the
  temple compound with a kite crossing the frame, a white-out inside the
  cloud, then out over the Brihadeeswarar at golden hour, circling round to
  settle on the vimana head-on. It plays on its own clock once the section
  is in view — the scroll only moves the page — pauses when the section
  leaves the screen, and holds on the temple when it ends, with a replay.

  The source is 562 frames at 1920x1080, kept as every second frame (271)
  and drawn to a canvas:

  1. STREAMED IN ORDER. Frames load in playback order from a couple of
     screens before the section arrives, and the clock never runs ahead of
     what has loaded — if the network falls behind, the film holds its
     frame and resumes, rather than skipping.
  2. BLENDED. The playhead is fractional; between two loaded frames the later
     is drawn over the earlier at the fraction's alpha, so 18 fps of source
     plays as smooth motion on any refresh rate. Phones load every second
     frame to stay inside their memory budget; the blend covers the gap.
  3. DECODED AHEAD. Frames are decoded to ImageBitmaps off the main thread,
     in a window running ahead of the playhead, and closed once passed — the
     whole film decoded would be ~1 GB of pixels.
  4. SHARP AT REST. When the film ends (or is held), a full-resolution copy
     of the held frame is fetched and faded in over the streaming frame.

  The words run on their own short timeline, started with the film: an
  intro line while the kite crosses, then the title and the four benefits
  one after another. Quick enough not to keep anyone waiting, paused and
  resumed with the film.
*/

const FRAME_COUNT = 271;
const LAST = FRAME_COUNT - 1;
const FPS = 18;
const frameSrc = (size, i) => `/images/temple/${size}/${String(i).padStart(3, "0")}.webp`;

export default function TempleFlight() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const replayRef = useRef(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth <= 800;
    const size = small ? "sm" : "lg";
    const STEP = small ? 2 : 1;
    const c2d = canvas.getContext("2d", { alpha: false });
    const state = { frame: 0 };
    const rest = { frame: -1, img: null, alpha: 0 };
    let restFade = null;
    const hqCache = new Map();
    let cancelled = false;
    let lastDrawn = -1;

    /* ---------- Loading and decoding ---------- */

    const blobs = new Array(FRAME_COUNT).fill(null);
    const frames = new Array(FRAME_COUNT).fill(null);
    const decoding = new Set();
    const AHEAD = small ? 24 : 30;
    const BEHIND = 4;
    const MAX_DECODES = 4;

    const decode = (i) => {
      if (frames[i] || decoding.has(i) || !blobs[i]) return;
      decoding.add(i);
      createImageBitmap(blobs[i])
        .then((bm) => {
          decoding.delete(i);
          if (cancelled || i < state.frame - BEHIND - 8) return bm.close();
          frames[i] = bm;
          if (lastDrawn < 0 || Math.abs(i - state.frame) <= 2 * STEP) draw(true);
          pump();
        })
        .catch(() => decoding.delete(i));
    };

    // Keep the frames just ahead of the playhead decoded; close the ones
    // well behind it.
    let pumpQueued = false;
    function pump() {
      if (cancelled) return;
      const c = Math.floor(state.frame);
      for (let i = Math.max(0, c - BEHIND); i <= Math.min(LAST, c + AHEAD) && decoding.size < MAX_DECODES; i++) {
        if (i % STEP === 0 && blobs[i] && !frames[i]) decode(i);
      }
      for (let i = 0; i < FRAME_COUNT; i++) {
        const far = i < c - BEHIND - 8 || i > c + AHEAD + 8;
        if (frames[i] && far && i !== rest.frame) {
          frames[i].close();
          frames[i] = null;
        }
      }
    }
    const schedulePump = () => {
      if (pumpQueued) return;
      pumpQueued = true;
      requestAnimationFrame(() => {
        pumpQueued = false;
        pump();
      });
    };

    const load = (i) =>
      fetch(frameSrc(size, i))
        .then((r) => (r.ok ? r.blob() : null))
        .then((blob) => {
          if (cancelled || !blob) return;
          blobs[i] = blob;
          if (i >= state.frame - BEHIND && i <= state.frame + AHEAD) schedulePump();
        })
        .catch(() => {});

    // In playback order; the last frame early too, as the held shot.
    const order = [];
    for (let i = 0; i < FRAME_COUNT; i += STEP) order.push(i);
    if (!order.includes(LAST)) order.push(LAST);

    let started = false;
    const startLoading = () => {
      if (started) return;
      started = true;
      const queue = order.slice(1);
      const worker = async () => {
        while (queue.length && !cancelled) await load(queue.shift());
      };
      for (let k = 0; k < 6; k++) worker();
    };

    /* ---------- Drawing ---------- */

    const below = (i, reach) => {
      for (let j = i; j >= Math.max(0, i - reach); j--) if (frames[j]) return j;
      return -1;
    };
    const above = (i, reach) => {
      for (let j = i; j <= Math.min(LAST, i + reach); j++) if (frames[j]) return j;
      return -1;
    };
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
      const s = Math.max(cw / img.width, ch / img.height);
      const w = img.width * s;
      const h = img.height * s;
      return [(cw - w) / 2, (ch - h) / 2, w, h];
    };

    function draw(force = false) {
      c2d.imageSmoothingQuality = rest.frame >= 0 ? "high" : "medium";

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

      const f = Math.min(Math.max(state.frame, 0), LAST);
      if (!force && Math.abs(f - lastDrawn) < 0.002) return;

      const lo = below(Math.floor(f), 4);
      const hi = above(Math.ceil(f), 4);
      c2d.globalAlpha = 1;
      if (lo >= 0 && hi >= 0 && hi !== lo) {
        c2d.drawImage(frames[lo], ...cover(frames[lo]));
        const t = (f - lo) / (hi - lo);
        if (t > 0.01) {
          c2d.globalAlpha = Math.min(t, 1);
          c2d.drawImage(frames[hi], ...cover(frames[hi]));
          c2d.globalAlpha = 1;
        }
      } else {
        const n = lo >= 0 ? lo : hi >= 0 ? hi : nearest(Math.round(f));
        if (n < 0) return;
        c2d.drawImage(frames[n], ...cover(frames[n]));
      }
      lastDrawn = f;
    }

    /* ---------- Held frame: the full-quality copy ---------- */

    const loadHq = (i) => {
      if (hqCache.has(i)) return hqCache.get(i);
      const p = fetch(frameSrc("hq", i))
        .then((r) => {
          if (!r.ok) throw new Error(`hq ${i}: ${r.status}`);
          return r.blob();
        })
        .then((blob) => createImageBitmap(blob));
      p.catch(() => hqCache.delete(i));
      hqCache.set(i, p);
      return p;
    };

    const settle = (i) => {
      restFade?.kill();
      rest.frame = i;
      rest.img = null;
      rest.alpha = 0;
      draw(true);
      loadHq(i)
        .then((img) => {
          if (cancelled || rest.frame !== i) return;
          rest.img = img;
          restFade = gsap.to(rest, { alpha: 1, duration: 0.5, ease: "sine.out", onUpdate: () => draw(true) });
        })
        .catch(() => {});
    };

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
      draw(true);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ---------- Reduced motion: the temple head-on, words shown ---------- */

    if (reduced) {
      root.classList.add("temple--static");
      state.frame = LAST;
      load(LAST).then(() => {
        decode(LAST);
        settle(LAST);
      });
      return () => {
        cancelled = true;
        ro.disconnect();
      };
    }

    /* ---------- The words ---------- */

    const single = window.matchMedia("(max-width: 700px)").matches;
    const words = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    const cards = gsap.utils.toArray(".temple__card", root);
    words
      // The intro, while the kite crosses.
      .fromTo(".temple__intro-kicker", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.3)
      .fromTo(".temple__intro-title .temple__word > span", { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.4)
      .fromTo(".temple__intro-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 0.9)
      .to(".temple__intro-title .temple__word > span", { yPercent: -110, duration: 0.45, stagger: 0.03, ease: "power2.in" }, 2.9)
      .to(".temple__intro", { autoAlpha: 0, duration: 0.4, ease: "sine.in" }, 3.1)
      // The title, then the benefits one after another.
      .fromTo(".temple__heading .temple__word > span", { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.08 }, 3.3)
      .fromTo(".temple__heading-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 3.7);

    const CARD_START = 3.8;
    const CARD_GAP = single ? 2.6 : 0.5;
    cards.forEach((card, i) => {
      const at = CARD_START + i * CARD_GAP;
      words
        .fromTo(card, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at)
        .fromTo(
          card.querySelectorAll(".temple__card-n, .temple__card-body > *"),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.07 },
          at + 0.1
        )
        // The shimmer sweeps across once as the card lands.
        .add(() => card.classList.add("is-lit"), at + 0.2);
      // Phones: one at a time, each stepping aside for the next.
      if (single && i < cards.length - 1) {
        words.to(card, { autoAlpha: 0, y: -20, duration: 0.4, ease: "power2.in" }, at + CARD_GAP - 0.4);
      }
    });

    /* ---------- The clock ---------- */

    const fill = root.querySelector(".temple__progress-fill");
    let playing = false;
    let raf = 0;
    let last = 0;

    // The frame the playhead needs next, on the phone's stride.
    const needed = (f) => Math.min(LAST, Math.ceil(f / STEP) * STEP);

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!playing) return;

      const next = Math.min(LAST, state.frame + dt * FPS);
      // Never run ahead of what has decoded: hold, and let it catch up.
      if (!frames[needed(next)]) {
        schedulePump();
        return;
      }
      state.frame = next;
      unsettle();
      draw();
      schedulePump();
      fill.style.transform = `scaleX(${state.frame / LAST})`;

      if (state.frame >= LAST) {
        playing = false;
        settle(LAST);
        setEnded(true);
      }
    };

    const play = () => {
      words.play();
      if (playing || state.frame >= LAST) return;
      playing = true;
      last = performance.now();
    };
    const pause = () => {
      playing = false;
      words.pause();
    };

    // Replay from the cloud; the words stay up.
    const replay = () => {
      state.frame = 0;
      unsettle();
      setEnded(false);
      schedulePump();
      draw(true);
      playing = true;
      last = performance.now();
    };
    const replayBtn = replayRef.current;
    replayBtn?.addEventListener("click", replay);

    raf = requestAnimationFrame((t) => {
      last = t;
      tick(t);
    });

    const firstFrame = load(0).then(() => decode(0));

    // Start pulling the film a couple of screens before it arrives.
    const near = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && startLoading(), {
      rootMargin: "200% 0px",
    });
    near.observe(root);

    // Play while it is mostly on screen; pause when it leaves.
    const seen = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? firstFrame.then(play) : pause())),
      { threshold: 0.5 }
    );
    seen.observe(root);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      near.disconnect();
      seen.disconnect();
      words.kill();
      restFade?.kill();
      replayBtn?.removeEventListener("click", replay);
      frames.forEach((bm) => bm?.close());
      hqCache.forEach((p) => p.then((bm) => bm.close()).catch(() => {}));
    };
  }, []);

  // Each word in its own mask, so the lines rise into place.
  const words = (text) =>
    text.split(" ").flatMap((w, i) => [
      i > 0 ? " " : null,
      <span className="temple__word" key={i}>
        <span>{w}</span>
      </span>,
    ]);

  return (
    <section className="temple" ref={rootRef} aria-label="A flight over the Brihadeeswarar temple, Thanjavur">
      <div className="temple__stage">
        <canvas className="temple__canvas" ref={canvasRef} aria-hidden="true" />
        <div className="temple__vignette" aria-hidden="true" />

        <div className="temple__dim" aria-hidden="true" />
        <div className="temple__intro">
          <span className="temple__intro-kicker">Why millets</span>
          <h2 className="temple__intro-title">{words("Grains our grandparents ate, for a reason.")}</h2>
          <span className="temple__intro-rule" aria-hidden="true" />
        </div>
        <div className="temple__heading">
          <h2 className="temple__heading-title">{words("Why Millets")}</h2>
          <span className="temple__heading-rule" aria-hidden="true" />
        </div>
        <div className="temple__benefits">
          <ul className="temple__cards">
            {benefits.map((b) => (
              <li key={b.n} className="temple__card">
                <span className="temple__card-n" aria-hidden="true">{b.n}</span>
                <div className="temple__card-body">
                  <h3 className="temple__card-title">{b.title}</h3>
                  <p className="temple__card-measure">{b.measure}</p>
                  <p className="temple__card-text">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          ref={replayRef}
          className={`temple__replay${ended ? " is-on" : ""}`}
          tabIndex={ended ? 0 : -1}
          aria-hidden={!ended || undefined}
          aria-label="Replay the flight"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
          </svg>
          Replay
        </button>

        <div className="temple__progress" aria-hidden="true">
          <span className="temple__progress-fill" />
        </div>
      </div>
    </section>
  );
}
