import { useEffect, useRef, useState } from "react";
import "./TempleStage.css";

/*
  The Brihadeeswarar temple, rendered live.

  WHY THIS IS LAZY AND SELF-CONTAINED
  -----------------------------------
  three.js plus the Draco decoder is ~170 kB gzipped and the model is 5.6 MB.
  Loaded with the page that would take the homepage from 140 kB to nearly six
  megabytes, which on a phone connection is a long wait before anything at
  all renders.

  So nothing here is imported at the top of the module. three.js, the two
  loaders and the .glb are all fetched by dynamic `import()` inside an
  IntersectionObserver, which fires only when the section nears the viewport.
  A reader who never scrolls this far never downloads any of it, and the
  initial bundle is unchanged.

  WHAT IT COSTS TO RENDER
  -----------------------
  Measured, not assumed: the model reports 616 MILLION triangles, but 98 of
  its 290 meshes use EXT_mesh_gpu_instancing, so the GPU draws each carving
  once and repeats it. That comes to 290 draw calls and a 0.3 ms median frame
  — the same on a discrete Radeon and on SwiftShader's pure-CPU rasteriser.
  It is a well-optimised export and it renders comfortably.
*/

/* The resting three-quarter view, chosen by rendering the candidates and
   comparing them rather than by reasoning about coordinates. The model is
   48 x 67 x 177 m, most of that depth being the compound behind the vimana,
   so the camera looks at the tower rather than at the bounding box centre. */
const VIEW = {
  from: { pos: [95, 60, 95], look: [0, 28, -25], fov: 36 },
  to: { pos: [58, 30, 66], look: [0, 34, -12], fov: 38 },
};

export default function TempleStage() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  // Drives the overlay copy and the loading state in the DOM; the render loop
  // reads refs instead, so it never re-renders React.
  const [phase, setPhase] = useState("idle"); // idle | loading | ready | failed

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let disposed = false;
    let cleanup = () => {};

    /*
      Everything three.js-related lives inside this function so the imports
      are reached only when the observer fires. `rootMargin` starts the
      download before the section is on screen — 5.6 MB needs a head start,
      or the reader arrives at an empty frame.
    */
    async function boot() {
      setPhase("loading");
      try {
        const [THREE, { GLTFLoader }, { DRACOLoader }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/loaders/DRACOLoader.js"),
        ]);
        if (disposed) return;

        /*
          OPAQUE, not transparent — this is the fix for the stutter.

          Diagnosis, because the obvious suspects were all innocent: the
          section showed 14-18 frame gaps of 6-11 SECONDS while scrolling,
          but the CPU profile came back 98.9% idle, `renderer.render` measured
          1.1-1.4 ms, and capping the model from 616M triangles to 24M barely
          moved the number. The same page's grain story scrolled with a worst
          frame of 19.7 ms and zero stalls.

          What isolated it: hiding the canvas with `visibility: hidden` while
          leaving the render loop running dropped the stalls from 14 to ZERO.
          The GPU work was unchanged, so the cost was never drawing the
          temple — it was COMPOSITING a 1440x900 translucent canvas into the
          page on every scroll frame. A canvas with an alpha channel has to be
          blended against what is behind it rather than presented directly,
          and over a 200vh sticky section the compositor was redoing that
          blend continuously.

          So the canvas is opaque and clears to the sky colour itself. The
          gradient that used to show through from CSS is now drawn as the
          scene's background, which costs nothing and looks identical.
        */
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        });
        /* Capped at 2: beyond that the pixel count doubles again for detail
           nobody can see, and this is the heaviest thing on the page. */
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;

        const scene = new THREE.Scene();

        /*
          The sky, now drawn INSIDE the canvas rather than showing through it
          from CSS — the canvas is opaque, so `.chola__sky` is no longer
          visible behind it.

          A vertical gradient painted once into a 2x256 canvas texture, not a
          shader or a skybox: it is sampled as the scene background, costs one
          texture fetch, and reproduces the same dawn wash the stylesheet had.
        */
        const skyCanvas = document.createElement("canvas");
        skyCanvas.width = 2;
        skyCanvas.height = 256;
        const sctx = skyCanvas.getContext("2d");
        const grad = sctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, "#0d2417");
        grad.addColorStop(0.34, "#16341f");
        grad.addColorStop(0.62, "#23431f");
        grad.addColorStop(0.82, "#3b4f22");
        grad.addColorStop(1, "#55581f");
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, 2, 256);
        const skyTex = new THREE.CanvasTexture(skyCanvas);
        skyTex.colorSpace = THREE.SRGBColorSpace;
        scene.background = skyTex;

        /*
          Three lights, no HDRI. The model has no textures — it is ten
          flat-coloured PBR materials — so what gives the carving its relief
          is entirely the lighting. A single light flattens the tiers into
          one mass; the fill and the rim are what separate them.
        */
        scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x6b5a3a, 1.55));
        const sun = new THREE.DirectionalLight(0xfff0d8, 3.0);
        sun.position.set(60, 90, 70);
        scene.add(sun);
        const rim = new THREE.DirectionalLight(0xffd9a0, 1.25);
        rim.position.set(-70, 40, -40);
        scene.add(rim);

        const draco = new DRACOLoader();
        /* Served from /public, not from node_modules: the decoder is WASM
           fetched at runtime, so it has to be a static asset. */
        draco.setDecoderPath("/draco/");
        const loader = new GLTFLoader();
        loader.setDRACOLoader(draco);

        const gltf = await new Promise((res, rej) =>
          loader.load("/models/temple.glb", res, undefined, rej)
        );
        if (disposed) {
          renderer.dispose();
          draco.dispose();
          return;
        }

        /*
          THIN THE ORNAMENT BEFORE THE FIRST FRAME.

          This is what makes the section smooth, and it was found by
          profiling rather than by guessing. The symptoms were 11-second
          frame gaps; the CPU profile came back 98.9% IDLE with three.js
          totalling under 200 ms across 38 seconds, so nothing was blocking
          the main thread — the browser was waiting on the GPU to finish
          transforming geometry before it could present.

          And the geometry is wildly lopsided. Four instanced meshes are 84%
          of the model's 616 million triangles:

            Kirtimukha_01_s      1500 copies x 147,564 =  221M
            Yali_01_s            1252 copies x  94,096 =  118M
            Yali_01_g             984 copies x  94,096 =   93M
            Fig_Seated4_01001_s  1160 copies x  71,694 =   83M

          These are small wall ornaments — lion faces, yali beasts, seated
          figures — each modelled at ~100k triangles and then repeated over a
          thousand times across the walls. At this camera framing a single
          copy covers a few pixels, so almost all of that detail is being
          transformed only to be thrown away by the rasteriser.

          Rather than delete them (the walls would go visibly bare), the
          instance COUNT is capped. An InstancedMesh draws only its first
          `count` instances, so lowering it is a one-line, zero-allocation
          change that keeps the geometry and the transforms already baked
          into the file. The copies that survive are the ones the exporter
          wrote first, which are distributed across the walls rather than
          clustered, so the ornament still reads as continuous.
        */
        const ORNAMENT_CAP = 190;
        let trimmedFrom = 0;
        let trimmedTo = 0;
        gltf.scene.traverse((o) => {
          if (o.isInstancedMesh && o.count > ORNAMENT_CAP) {
            trimmedFrom += o.count;
            o.count = ORNAMENT_CAP;
            trimmedTo += o.count;
            /* The bounding sphere was computed for the full set; with fewer
               instances drawn it is now too large, which only costs a little
               over-conservative culling. Recomputing it per instance is not
               worth the load-time hit. */
          }
        });
        if (import.meta.env.DEV) {
          window.__cholaTrim = { from: trimmedFrom, to: trimmedTo };
        }

        scene.add(gltf.scene);

        const camera = new THREE.PerspectiveCamera(VIEW.from.fov, 1, 0.5, 2000);

        /* Scroll progress for the section, 0 at its top and 1 at its bottom.
           Read directly rather than through GSAP: this is one number feeding
           a render loop that already runs every frame, and a ScrollTrigger
           here would only duplicate what rAF is doing. */
        const progress = () => {
          const r = root.getBoundingClientRect();
          const span = r.height - window.innerHeight;
          if (span <= 0) return 0;
          return Math.min(1, Math.max(0, -r.top / span));
        };

        const lerp = (a, b, t) => a + (b - a) * t;
        const eased = (t) => t * t * (3 - 2 * t); // smoothstep

        /*
          `fit` widens the camera's distance on a narrow frame.

          A perspective camera's `fov` is VERTICAL, so a portrait viewport
          shows less horizontally at the same distance — measured on a
          390x844 frame the desktop framing cropped the vimana's sides and
          buried the copy in carving. Scaling the camera's distance by the
          aspect shortfall gives a narrow frame the whole tower, and leaves
          wide frames untouched.
        */
        let fit = 1;
        const size = () => {
          const r = canvas.getBoundingClientRect();
          const w = Math.max(1, Math.round(r.width));
          const h = Math.max(1, Math.round(r.height));
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          /* 1 at 16:9 and wider, rising toward ~1.9 on a tall phone. */
          fit = Math.min(1.9, Math.max(1, 1.62 / camera.aspect));
          camera.updateProjectionMatrix();
        };
        size();
        const ro = new ResizeObserver(size);
        ro.observe(canvas);

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* Render only while the section is on screen — a loop still running
           after the reader has scrolled away is wasted battery on the most
           expensive element of the page.

           Observed on the CANVAS, not on the section. The section is 200vh
           so it intersects the viewport for its entire length, which made
           this flag true throughout and gated nothing; the canvas is the
           sticky 100vh child that actually enters and leaves the frame. */
        let visible = true;
        const vis = new IntersectionObserver(
          ([e]) => {
            visible = e.isIntersecting;
            if (import.meta.env.DEV) window.__cholaVisible = visible;
          },
          { rootMargin: "100px" }
        );
        vis.observe(canvas);
        if (import.meta.env.DEV) {
          window.__cholaFrames = 0;
          window.__cholaVisible = visible;
        }

        /*
          `stopped` is separate from `disposed`, and both are needed.

          `disposed` is set by the effect's cleanup. But `boot()` is async, so
          a cleanup arriving while it is still awaiting its imports sets
          `disposed` at a moment when `cleanup` is still the initial no-op —
          it cannot cancel a loop that does not exist yet. `boot()` then
          resumes, starts a loop, and reassigns `cleanup`, leaving a live
          renderer nothing will ever tear down.

          Under StrictMode, which mounts every effect twice in development,
          that is exactly what happened: the first mount's late `boot()`
          overwrote `cleanup`, and the second mount's teardown then cancelled
          the loop belonging to the first. Measured, rAF went 118 calls in
          the first second, then 1, then 0 — the loop died and the canvas
          held one stale frame while the page scrolled past it. That frozen
          frame is what read as lag.

          So the loop checks its own flag, and `boot()` re-checks `disposed`
          immediately after publishing `cleanup`.
        */
        let stopped = false;
        let raf = 0;
        /* The damped progress the camera actually uses. Starts at the true
           value so the first frame is correctly framed rather than easing in
           from the wrong pose. */
        let shown = reduced ? 0 : eased(progress());
        const tick = () => {
          if (stopped) return;
          raf = requestAnimationFrame(tick);
          if (!visible) return;

          /*
            The camera follows a DAMPED copy of the scroll progress, not the
            raw value.

            A wheel notch moves the page in a jump, and a trackpad delivers
            uneven deltas, so a camera bound straight to scrollY inherits
            every one of those steps — which reads as stutter even at a solid
            60fps. Easing toward the target each frame turns those steps into
            a glide, and it costs one multiply.

            0.12 by feel: high enough to keep up with a fast flick, low
            enough to absorb a notch.
          */
          const target = reduced ? 0 : eased(progress());
          shown += (target - shown) * 0.12;
          /* Snap when close, so the loop is not forever chasing the last
             thousandth and re-rendering an identical frame. */
          if (Math.abs(target - shown) < 0.0005) shown = target;

          const t = shown;

          /* `fov` only changes with the section's progress and the viewport,
             so the projection matrix is rebuilt only when it actually moves
             — not every frame as it was. */
          const fov = lerp(VIEW.from.fov, VIEW.to.fov, t);
          if (fov !== camera.fov) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
          }

          /* `fit` scales the camera's distance from the subject, not the
             look-at point — pushing the target would swing the framing off
             the tower rather than simply stepping back from it. */
          camera.position.set(
            lerp(VIEW.from.pos[0], VIEW.to.pos[0], t) * fit,
            lerp(VIEW.from.pos[1], VIEW.to.pos[1], t) * fit,
            lerp(VIEW.from.pos[2], VIEW.to.pos[2], t) * fit
          );
          camera.lookAt(
            lerp(VIEW.from.look[0], VIEW.to.look[0], t),
            lerp(VIEW.from.look[1], VIEW.to.look[1], t),
            lerp(VIEW.from.look[2], VIEW.to.look[2], t)
          );

          renderer.render(scene, camera);
          if (import.meta.env.DEV) window.__cholaFrames++;
        };
        tick();
        setPhase("ready");

        cleanup = () => {
          stopped = true;
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          /* Geometry and materials have to go back explicitly — three.js
             holds GPU buffers that garbage collection cannot reach. */
          scene.traverse((o) => {
            if (o.isMesh) {
              o.geometry?.dispose();
              const m = o.material;
              if (Array.isArray(m)) m.forEach((x) => x?.dispose());
              else m?.dispose();
            }
          });
          skyTex.dispose();
          draco.dispose();
          renderer.dispose();
        };

        /* The teardown may have arrived during any of the awaits above, when
           `cleanup` was still the no-op and so could not act. Now that the
           real one is published, honour it. */
        if (disposed) cleanup();
      } catch (err) {
        if (!disposed) {
          setPhase("failed");
          /* Left in deliberately: a WebGL failure or a blocked .glb is
             invisible otherwise, and the section just looks broken. */
          console.error("[TempleStage] could not render the temple:", err);
        }
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          boot();
        }
      },
      /* A screen and a half of warning, so the 5.6 MB has time to arrive
         before the section is actually looked at. */
      { rootMargin: "150% 0px" }
    );
    io.observe(root);

    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  return (
    <section className="chola" ref={rootRef} aria-label="Brihadeeswarar temple">
      <div className="chola__pin">
        <div className="chola__sky" aria-hidden="true" />

        <canvas
          className="chola__canvas"
          ref={canvasRef}
          /* The canvas is decoration for the story the copy tells; the
             heading and prose beside it carry the meaning. */
          aria-hidden="true"
        />

        {/* Holds the frame before the model arrives, so the section is never
            an empty box. Removed once the first frame is rendered. */}
        {phase !== "ready" && (
          <div className="chola__wait" aria-hidden="true">
            <span className="chola__waitline" />
          </div>
        )}

        <div className="chola__copy">
          <p className="chola__eyebrow">Thanjavur, 1010 CE</p>
          <h2 className="chola__title">
            Built by the Cholas.
            <br />
            Named for them still.
          </h2>
          <p className="chola__lede">
            Rajaraja Chola raised the Brihadeeswarar temple from granite hauled
            across the Kaveri delta — the same soil, and the same rice, that
            fills our sacks a thousand years later.
          </p>
        </div>
      </div>
    </section>
  );
}
