import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site, whatsappLink } from "../data/site";
import "./Story.css";

gsap.registerPlugin(ScrollTrigger);

/*
  ============================================================================
  FROM KINGDOM TO KITCHEN
  ============================================================================

  A ten-chapter scroll film. Every chapter is a pinned stage that plays while
  the reader scrolls through its runway, then hands the frame to the next one.

  Three rules hold the whole thing together:

  1. NOTHING MOVES ON ITS OWN. Every transform is scrubbed off the scroll
     position. A self-playing loop keeps asserting motion while the reader is
     stopped, which is exactly when the frame should be still. The only
     exceptions are the ambient drifts (steam, particles) that read as
     atmosphere rather than as narrative.

  2. CHAPTERS OVERLAP, THEY DO NOT CUT. Each pinned chapter holds a full
     viewport, so two chapters are never both visible — but the outgoing one
     dims and the incoming one is already in place behind it, so the join is
     a reveal rather than a swap.

  3. ONE TIMELINE PER CHAPTER. Each chapter owns a single ScrollTrigger with
     its own timeline. Nothing reaches across chapter boundaries, so a change
     to chapter 6 cannot desynchronise chapter 2.

  Scroll runways are expressed in viewport heights. They are the single
  biggest lever on pacing: too short and the animation snaps past, too long
  and the reader is scrolling through a frame that has stopped changing.
*/

/* Chapter runways, in viewport heights of scroll per pinned chapter. */
const RUNWAY = {
  temple: 1.6,
  king: 1.5,
  fields: 1.3,
  seed: 2.4, // three beats in one pin, so it needs the most
  purity: 1.5,
  pack: 1.8,
  feast: 1.4,
  family: 1.2,
  product: 1.3,
};

/*
  The doorway of the gopuram artwork, measured off the source PNG's alpha
  channel rather than eyeballed.

  The opening is horizontally centred at x=560 of 1122 — 49.9%, which is dead
  centre. That is what lets chapter 01 zoom straight in with no lateral
  correction: scaling about the image's own centre keeps the doorway locked.
  Vertically it sits at 78.5% of the artwork's height, which is NOT centre, so
  the zoom has to pull the image up as it scales or the opening walks off the
  bottom of the frame.
*/
const DOOR = { x: 49.9, y: 78.5 };

/* Chapter 04's three beats. */
const SEED_BEATS = [
  { n: "01", title: "The Seed", note: "A single grain, and everything it holds." },
  { n: "02", title: "The Paddy", note: "Root, shoot, and the long green wait." },
  { n: "03", title: "Nature Takes Its Time", note: "Ripened slowly, the way it always was." },
];

/* Floating rice motes for chapter 03. Fixed seeds, so the layout is stable
   across renders rather than reshuffling on every mount. */
const MOTES = [
  { x: 8, y: 22, s: 0.7, d: 0 },
  { x: 19, y: 64, s: 1, d: 1.4 },
  { x: 31, y: 38, s: 0.55, d: 2.8 },
  { x: 44, y: 78, s: 0.85, d: 0.7 },
  { x: 57, y: 30, s: 0.65, d: 2.1 },
  { x: 68, y: 58, s: 1.05, d: 3.4 },
  { x: 79, y: 20, s: 0.6, d: 1 },
  { x: 88, y: 70, s: 0.9, d: 2.4 },
  { x: 26, y: 12, s: 0.5, d: 4 },
  { x: 72, y: 88, s: 0.75, d: 1.8 },
];

/* Chapter 06's falling grains: a stream that multiplies into the first bag. */
const GRAINS = Array.from({ length: 14 }, (_, i) => ({
  i,
  x: -30 + (i % 5) * 15 + (i % 3) * 4,
  delay: i * 0.055,
  rot: -40 + i * 11,
  s: 0.5 + ((i * 37) % 60) / 100,
}));

const FOOTER_LINKS = [
  { to: "/products", label: "Products" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
];

const SOCIAL = [
  { href: site.social.instagram, label: "Instagram" },
  { href: site.social.linkedin, label: "LinkedIn" },
  { href: site.social.facebook, label: "Facebook" },
];

export default function Story() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const q = (sel) => root.querySelector(sel);
      const qa = (sel) => gsap.utils.toArray(sel, root);
      const vh = () => window.innerHeight;

      /*
        Reduced motion: no pins, no scrubs. The CSS already lays every chapter
        out as a readable static frame — each stage becomes a normal block and
        the elements that the timelines would have moved are reset to their
        resting values here. The story still reads top to bottom, as a
        sequence of stills.
      */
      if (reduced) {
        root.classList.add("story--static");
        gsap.set(
          qa(
            ".ch__fig, .ch__copy, .ch__title, .ch__sub, .ch__eyebrow, .seed__beat, .pack__bag, .purity__grain, .purity__half"
          ),
          { clearProps: "all", opacity: 1 }
        );
        return;
      }

      /* Shared ScrollTrigger config for a pinned chapter. */
      const pinned = (trigger, runway, extra = {}) => ({
        trigger,
        start: "top top",
        end: () => `+=${vh() * runway}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        ...extra,
      });

      /* ====================================================================
         CHAPTER 01 — TEMPLE ENTRANCE
         --------------------------------------------------------------------
         A slow push through the gopuram's doorway.

         The zoom scales the whole plate about the DOORWAY, not about the
         image's centre: transform-origin is set to the measured opening, so
         as scale runs 1 -> 2.4 the doorway stays nailed to the same screen
         point and the architecture spreads past the edges around it. Scaling
         about the centre instead would send the opening sliding down and out
         of frame, because it sits at 78.5% height, not 50%.

         The last third of the runway is the mask: a circle centred on the
         doorway opens from its own width out past the diagonal of the
         viewport, so the frame is wiped from the inside out. The next chapter
         is already painted underneath, so what floods in through the archway
         is chapter 02 — the doorway IS the transition.
         ==================================================================== */
      {
        const plate = q(".temple__plate");
        const glow = q(".temple__glow");
        const copy = q(".temple__copy");
        const warm = q(".temple__warm");
        const mask = q(".ch--temple .ch__mask");

        gsap.set(plate, { transformOrigin: `${DOOR.x}% ${DOOR.y}%` });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--temple", RUNWAY.temple),
        });

        tl
          /* The push. Eased rather than linear: a constant-rate zoom reads
             mechanical, and the slow start gives the title time to be read
             before the architecture starts moving. */
          .to(plate, { scale: 2.4, duration: 0.72, ease: "power1.in" }, 0)
          /* Copy lifts away and out of the way of the advancing stone. */
          .to(copy, { yPercent: -26, opacity: 0, duration: 0.3 }, 0)
          /* The interior light grows as we approach — the doorway is the
             brightest thing in frame by the time we reach it. */
          .to(glow, { opacity: 1, scale: 1.5, duration: 0.6 }, 0)
          /* Background warms from ivory toward gold as we close the distance. */
          .to(warm, { opacity: 1, duration: 0.55 }, 0.05)
          /* THE MASK. Opens from the doorway outward, revealing chapter 02.
             150vmax guarantees it clears the corners at any aspect ratio. */
          .fromTo(
            mask,
            { "--r": "0vmax" },
            { "--r": "150vmax", duration: 0.34, ease: "power2.in" },
            0.66
          );
      }

      /* ====================================================================
         CHAPTER 02 — THE KING
         --------------------------------------------------------------------
         He walks away from us, toward the temple, and the frame follows.

         The plate is one image, so the "cape parallax" is a second copy of
         the same picture masked to the cape region, drifting a few pixels
         against the body. Subtle by construction: at this scale a couple of
         percent of sway is all the eye needs to read cloth rather than card.
         ==================================================================== */
      {
        const fig = q(".king__fig");
        const cape = q(".king__cape");
        const copy = q(".ch--king .ch__copy");
        const haze = q(".king__haze");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--king", RUNWAY.king),
        });

        tl
          /* He begins low and slightly out of frame, then walks in and away:
             rising in the frame plus growing slightly reads as approach along
             the ground plane. */
          .fromTo(
            fig,
            { yPercent: 14, scale: 1.16, opacity: 0.75 },
            { yPercent: -4, scale: 1, opacity: 1, duration: 0.7, ease: "power1.out" },
            0
          )
          /* Cape sways against the walk — offset in time so it lags the body,
             which is what makes it read as fabric following rather than a
             rigid part of him. */
          .fromTo(
            cape,
            { xPercent: -1.4, rotate: -1.1 },
            { xPercent: 1.4, rotate: 1.1, duration: 0.5, ease: "sine.inOut" },
            0.05
          )
          .to(cape, { xPercent: -0.6, rotate: -0.5, duration: 0.4, ease: "sine.inOut" }, 0.55)
          .from(copy, { opacity: 0, y: 34, duration: 0.3, ease: "power2.out" }, 0.04)
          /* Haze builds behind him as the temple recedes. */
          .to(haze, { opacity: 0.85, scale: 1.12, duration: 0.6 }, 0.1)
          /* At ~70% he thins out and the fields come through. */
          .to(fig, { opacity: 0.15, filter: "blur(7px)", duration: 0.26 }, 0.7)
          .to(copy, { opacity: 0, y: -26, duration: 0.2 }, 0.7);
      }

      /* ====================================================================
         CHAPTER 03 — LAND / ORIGIN
         --------------------------------------------------------------------
         Masked reveal out of the king, then a slow pan down and pull back
         over the paddy.
         ==================================================================== */
      {
        const plate = q(".fields__plate");
        const copy = q(".ch--fields .ch__copy");
        const sun = q(".fields__sun");
        const motes = qa(".fields__mote");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--fields", RUNWAY.fields),
        });

        tl
          /* Starts pushed in and high, settles back and down: the camera
             craning down onto the field. */
          .fromTo(
            plate,
            { scale: 1.32, yPercent: -7 },
            { scale: 1.04, yPercent: 3, duration: 1, ease: "power1.inOut" },
            0
          )
          .from(copy, { opacity: 0, x: -40, duration: 0.3, ease: "power2.out" }, 0.05)
          /* Sunrise glow tracks horizontally across the frame. */
          .fromTo(sun, { xPercent: -30, opacity: 0.35 }, { xPercent: 30, opacity: 0.7, duration: 1 }, 0)
          .to(copy, { opacity: 0, y: -30, duration: 0.18 }, 0.82);

        /* Motes drift upward continuously — atmosphere, not narrative, so
           this one is allowed its own clock. Each gets its own duration and
           delay so they never pulse in unison. */
        motes.forEach((m, i) => {
          gsap.to(m, {
            y: () => -vh() * 0.5,
            x: `+=${(i % 2 ? 1 : -1) * (14 + (i % 4) * 9)}`,
            opacity: 0,
            duration: 9 + (i % 5) * 2.4,
            delay: MOTES[i].d,
            repeat: -1,
            ease: "none",
          });
        });
      }

      /* ====================================================================
         CHAPTER 04 — SEED TO PADDY
         --------------------------------------------------------------------
         Three beats, one pin, one fixed centre.

         Everything happens in the SAME screen position: the husk, the
         sprout and the ripe stalk are stacked in one grid cell, so the
         transformation is read as one object changing rather than three
         images taking turns. The copy on the left and the 01/03 counter on
         the right change under it.

         The hand-offs are scale/rotate morphs, not cross-fades: the outgoing
         asset shrinks into the incoming one's footprint while the incoming
         one expands out of it, so they share a silhouette at the moment of
         the swap.
         ==================================================================== */
      {
        const husk = q(".seed__husk");
        const sprout = q(".seed__sprout");
        const stalk = q(".seed__stalk");
        const beats = qa(".seed__beat");
        const marks = qa(".seed__mark");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--seed", RUNWAY.seed),
        });

        /*
          --- Beat 01: the seed falls in and settles ---

          xPercent: 17 corrects for the husk's position in its canvas. The
          husk and sprout were cut from one image and each kept the full
          canvas, so the husk's pixels sit 17.1% LEFT of centre (measured) and
          the sprout's the same distance right. With both on screen that
          cancels out, but in beat 01 the husk is alone and would sit visibly
          off to one side. It is shifted back to true centre here and returned
          to its register at the hand-off, where the sprout needs it in the
          canvas position the artwork assumes.
        */
        tl.fromTo(
          husk,
          { yPercent: -120, xPercent: 17, rotate: -22, opacity: 0 },
          { yPercent: 0, xPercent: 17, rotate: 8, opacity: 1, duration: 0.2, ease: "power2.out" },
          0
        )
          /* A slow continued rotation while it rests, so the frame is never
             completely dead during the reading pause. */
          .to(husk, { rotate: 0, duration: 0.12, ease: "sine.out" }, 0.2)

          /* --- 01 -> 02: the husk opens into the sprout --- */
          /* The husk does not disappear; it becomes the seed body the sprout
             grows out of, so it stays visible and only stops being the
             subject. It slides back into canvas register as it does, which is
             what lets the sprout grow from the right point. */
          .to(
            husk,
            { scale: 0.92, xPercent: 0, yPercent: 6, duration: 0.16, ease: "sine.inOut" },
            0.33
          )
          .fromTo(
            sprout,
            { scaleY: 0, opacity: 1, transformOrigin: "50% 92%" },
            { scaleY: 1, duration: 0.2, ease: "power2.out" },
            0.35
          )
          /* Leaves extend after the shoot has risen. */
          .fromTo(
            ".seed__leaf",
            { scaleY: 0.2, scaleX: 0.6, opacity: 0 },
            { scaleY: 1, scaleX: 1, opacity: 1, duration: 0.16, stagger: 0.04, ease: "power2.out" },
            0.44
          )

          /* --- 02 -> 03: sprout ripens into the stalk --- */
          .to([husk, sprout], { opacity: 0, scale: 0.8, duration: 0.14, ease: "sine.in" }, 0.64)
          .fromTo(
            stalk,
            { opacity: 0, scale: 0.8, yPercent: 8 },
            { opacity: 1, scale: 1, yPercent: 0, duration: 0.16, ease: "sine.out" },
            0.66
          )
          /* The ripe head bends under its own weight as the scroll continues. */
          .fromTo(
            stalk,
            { rotate: -3 },
            { rotate: 5, duration: 0.2, ease: "sine.inOut" },
            0.8
          );

        /* Copy + counter swap on the same cuts as the artwork. `visibility`
           rather than opacity: these are stacked in one cell and a waiting
           beat at opacity 0 still takes the pointer and is still read out. */
        const CUTS = [0, 0.35, 0.66];
        beats.forEach((b, i) => {
          const at = CUTS[i];
          const out = CUTS[i + 1];
          tl.set(b, { visibility: "visible" }, at).fromTo(
            b,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.09, ease: "power2.out" },
            at
          );
          if (out !== undefined) {
            tl.to(b, { opacity: 0, y: -18, duration: 0.07, ease: "power2.in" }, out - 0.07).set(
              b,
              { visibility: "hidden" },
              out
            );
          }
        });
        marks.forEach((m, i) => {
          tl.to(m, { opacity: 1, duration: 0.05 }, CUTS[i]);
          if (CUTS[i + 1] !== undefined)
            tl.to(m, { opacity: 0.28, duration: 0.05 }, CUTS[i + 1]);
        });
      }

      /* ====================================================================
         CHAPTER 05 — PURITY WITHIN
         --------------------------------------------------------------------
         The husk splits and the white grain steps forward.

         The source artwork is a single image of an already-open husk with the
         grain between the halves. To make it OPEN on scroll it is used three
         times: the same picture clipped to its left half, to its right half,
         and the grain isolated in the middle. The halves then travel apart
         while the grain rises between them, and because all three are the
         same plate at the same size they part along the seam that is already
         drawn in the art.
         ==================================================================== */
      {
        const L = q(".purity__half--l");
        const R = q(".purity__half--r");
        const grain = q(".purity__grain");
        const glow = q(".purity__glow");
        const copy = q(".ch--purity .ch__copy");
        const chaff = qa(".purity__chaff");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--purity", RUNWAY.purity),
        });

        tl.from(copy, { opacity: 0, y: 30, duration: 0.22, ease: "power2.out" }, 0)
          /* The halves part. Rotation as well as translation, so they hinge
             open at the base rather than sliding apart like drawer fronts. */
          .to(L, { xPercent: -34, rotate: -13, duration: 0.5, ease: "power2.inOut" }, 0.12)
          .to(R, { xPercent: 34, rotate: 13, duration: 0.5, ease: "power2.inOut" }, 0.12)
          /* The grain emerges and brightens. */
          .fromTo(
            grain,
            { scale: 0.86, opacity: 0.6 },
            { scale: 1.06, opacity: 1, duration: 0.42, ease: "power2.out" },
            0.2
          )
          .fromTo(glow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.25, duration: 0.45 }, 0.22)
          /* Chaff drifts outward on its own vectors. */
          .to(
            chaff,
            {
              xPercent: (i) => (i % 2 ? 1 : -1) * (60 + i * 26),
              yPercent: (i) => -40 - i * 18,
              rotate: (i) => (i % 2 ? 1 : -1) * (40 + i * 25),
              opacity: 0,
              duration: 0.5,
              ease: "power1.out",
            },
            0.24
          )
          /* The grain comes toward the camera and becomes the next chapter. */
          .to(grain, { scale: 2.9, duration: 0.26, ease: "power2.in" }, 0.74)
          .to([L, R, copy, glow], { opacity: 0, duration: 0.16 }, 0.76)
          .to(q(".ch--purity .ch__mask"), { opacity: 1, duration: 0.2 }, 0.8);
      }

      /* ====================================================================
         CHAPTER 06 — FROM PADDY TO PACK
         --------------------------------------------------------------------
         Grains rain down into the left bag; the other two slide in to meet it.
         ==================================================================== */
      {
        const grains = qa(".pack__grain");
        const bagL = q(".pack__bag--l");
        const bagM = q(".pack__bag--m");
        const bagR = q(".pack__bag--r");
        const copy = q(".ch--pack .ch__copy");
        const tag = q(".pack__tag");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--pack", RUNWAY.pack),
        });

        tl.from(copy, { opacity: 0, y: 28, duration: 0.16, ease: "power2.out" }, 0);

        /* The stream. Each grain falls the full height of the frame into the
           mouth of the left bag, staggered so they arrive as a run rather
           than a curtain. They fall fast and land, rather than easing to a
           stop in mid-air. */
        grains.forEach((g, i) => {
          const d = GRAINS[i];
          tl.fromTo(
            g,
            { yPercent: -260, opacity: 0, rotate: d.rot, xPercent: d.x },
            {
              yPercent: 40,
              opacity: 1,
              rotate: d.rot + 150,
              xPercent: d.x * 0.25,
              duration: 0.26,
              ease: "power1.in",
            },
            0.06 + d.delay * 0.5
          ).to(g, { opacity: 0, duration: 0.05 }, 0.06 + d.delay * 0.5 + 0.24);
        });

        tl
          /* The left bag fills and settles. A short overshoot on the settle —
             weight arriving, not a bounce. */
          .fromTo(
            bagL,
            { opacity: 0, scale: 0.9, yPercent: 8 },
            { opacity: 1, scale: 1, yPercent: 0, duration: 0.2, ease: "back.out(1.4)" },
            0.42
          )
          /* Middle and right arrive from opposite sides. */
          .fromTo(
            bagM,
            { opacity: 0, xPercent: 120, yPercent: 6 },
            { opacity: 1, xPercent: 0, yPercent: 0, duration: 0.24, ease: "power3.out" },
            0.56
          )
          .fromTo(
            bagR,
            { opacity: 0, xPercent: -120, yPercent: 6 },
            { opacity: 1, xPercent: 0, yPercent: 0, duration: 0.24, ease: "power3.out" },
            0.62
          )
          /* The composition settles together. */
          .to([bagL, bagM, bagR], { yPercent: -2, duration: 0.1, ease: "sine.inOut" }, 0.86)
          .fromTo(tag, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.84);
      }

      /* ====================================================================
         CHAPTER 07 — ROYAL TABLE
         --------------------------------------------------------------------
         A restrained dolly toward the rice. The mound of rice sits at the
         centre of the plate, so the push is about that point and everything
         else blurs a little as it passes.
         ==================================================================== */
      {
        const plate = q(".feast__plate");
        const blur = q(".feast__blur");
        const copy = q(".ch--feast .ch__copy");
        const warm = q(".feast__warm");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--feast", RUNWAY.feast),
        });

        tl
          /* 1 -> 1.45 only. The brief says do not over-zoom, and past ~1.5 a
             1600px plate starts showing its pixels. */
          .fromTo(plate, { scale: 1 }, { scale: 1.45, duration: 1, ease: "power1.inOut" }, 0)
          /* Surrounding food softens while the rice stays sharp: the blur
             layer is the same plate with the rice punched out of it. */
          .fromTo(blur, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.15)
          .from(copy, { opacity: 0, y: 30, duration: 0.2, ease: "power2.out" }, 0.03)
          .to(warm, { opacity: 0.55, duration: 0.7 }, 0.1)
          .to(copy, { opacity: 0, duration: 0.14 }, 0.86);
      }

      /* ====================================================================
         CHAPTER 08 — FAMILY
         --------------------------------------------------------------------
         The grand frame dissolves into a banana leaf. Deliberately the
         simplest chapter in the film: after seven chapters of gold and stone,
         the relief IS the effect.
         ==================================================================== */
      {
        const leaf = q(".family__leaf");
        const rice = q(".family__rice");
        const copy = q(".ch--family .ch__copy");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--family", RUNWAY.family),
        });

        tl.fromTo(
          leaf,
          { scale: 1.1, opacity: 0, rotate: -2 },
          { scale: 1, opacity: 1, rotate: 0, duration: 0.3, ease: "power2.out" },
          0
        )
          .fromTo(rice, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.26, ease: "back.out(1.2)" }, 0.16)
          .from(copy, { opacity: 0, y: 26, duration: 0.22, ease: "power2.out" }, 0.2)
          .to(q(".family__steam"), { opacity: 1, duration: 0.3 }, 0.3);
      }

      /* ====================================================================
         CHAPTER 09 — PRODUCT HERO
         --------------------------------------------------------------------
         The packs, presented. Shadows track the scroll so the light reads as
         moving over them rather than baked on.
         ==================================================================== */
      {
        const bags = qa(".product__bag");
        const copy = q(".ch--product .ch__copy");
        const silo = q(".product__silhouettes");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinned(".ch--product", RUNWAY.product),
        });

        tl.from(copy, { opacity: 0, y: 32, duration: 0.24, ease: "power2.out" }, 0)
          .from(
            bags,
            { opacity: 0, y: 46, duration: 0.3, stagger: 0.07, ease: "power2.out" },
            0.06
          )
          .fromTo(silo, { opacity: 0, scale: 1.08 }, { opacity: 0.22, scale: 1, duration: 0.5 }, 0)
          /* Shadow travel: a slow sweep across the runway. */
          .fromTo(
            ".product__shadow",
            { xPercent: -14, scaleX: 1.1, opacity: 0.16 },
            { xPercent: 14, scaleX: 0.92, opacity: 0.26, duration: 0.9, ease: "sine.inOut" },
            0.1
          );

        /* The float is ambient, so it runs on its own clock — but it is tiny
           and out of phase per bag, so it never reads as a synchronised
           bobbing. */
        bags.forEach((b, i) => {
          gsap.to(b, {
            y: i === 1 ? -11 : -7,
            duration: 3.4 + i * 0.45,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.5,
          });
        });
      }

      /* ====================================================================
         CHAPTER 10 — SIGNATURE
         --------------------------------------------------------------------
         Everything slows. Not pinned: the reader should be able to run off
         the bottom of the film into the footer without the page holding them.
         ==================================================================== */
      {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".ch--footer",
            start: "top 78%",
            end: "bottom bottom",
            scrub: 1.4,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(".sig__rule", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0)
          .fromTo(".sig__line", { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.12)
          .fromTo(".sig__nandi", { opacity: 0, scale: 1.06 }, { opacity: 0.16, scale: 1, duration: 0.5 }, 0)
          .fromTo(
            ".sig__col",
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" },
            0.3
          )
          .fromTo(".sig__logo", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.5);
      }

      /*
        Artwork decodes after first paint and every pin's geometry depends on
        the laid-out height, so re-measure once the images have actually
        landed. Without this the pins are built against a page whose images
        are still zero-height and every chapter boundary is wrong.
      */
      const imgs = Array.from(root.querySelectorAll("img"));
      Promise.all(
        imgs.map((i) => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))
      ).then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="story" ref={rootRef}>
      {/* ================= 01 — TEMPLE ENTRANCE ================= */}
      <section className="ch ch--temple" aria-label="A legacy that begins here">
        <div className="ch__stage">
          <div className="temple__warm" aria-hidden="true" />

          <div className="temple__plate">
            <div className="temple__glow" aria-hidden="true" />
            <img
              src="/images/chapter-gopuram.webp"
              alt="A South Indian temple gateway, its doorway open to the light beyond"
              className="temple__img"
              fetchPriority="high"
            />
          </div>

          <div className="ch__copy temple__copy">
            <span className="ch__eyebrow">Rooted in Tradition.</span>
            <h1 className="ch__title">A Legacy That Begins Here</h1>
          </div>

          {/* The doorway mask. Its radius is animated; the hole is centred on
              the measured opening so the reveal spreads from the archway. */}
          <div className="ch__mask" aria-hidden="true" />
        </div>
      </section>

      {/* ================= 02 — THE KING ================= */}
      <section className="ch ch--king" aria-label="Built on generations of tradition">
        <div className="ch__stage">
          <div className="king__haze" aria-hidden="true" />

          <figure className="ch__fig king__fig">
            <img
              src="/images/chapter-king.webp"
              alt="A Chola king walking toward a temple, seen from behind"
              loading="lazy"
              decoding="async"
            />
            {/* Second copy of the plate, clipped to the cape, drifting against
                the body to give the cloth its own movement. */}
            <img
              src="/images/chapter-king.webp"
              alt=""
              aria-hidden="true"
              className="king__cape"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div className="ch__copy ch__copy--left">
            <h2 className="ch__title">Built on Generations of Tradition.</h2>
            <p className="ch__sub">
              Before it reaches the table, every grain carries a story.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 03 — LAND / ORIGIN ================= */}
      <section className="ch ch--fields" aria-label="Where every grain begins">
        <div className="ch__stage">
          <div className="fields__plate">
            <img
              src="/images/chapter-field.webp"
              alt="Paddy fields at sunrise beside a village homestead"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="fields__haze" aria-hidden="true" />
          <div className="fields__sun" aria-hidden="true" />

          <div className="fields__motes" aria-hidden="true">
            {MOTES.map((m, i) => (
              <span
                key={i}
                className="fields__mote"
                style={{ left: `${m.x}%`, top: `${m.y}%`, "--s": m.s }}
              />
            ))}
          </div>

          <div className="ch__copy ch__copy--left">
            <h2 className="ch__title">Where Every Grain Begins.</h2>
            <p className="ch__sub">Carefully grown. Patiently nurtured.</p>
          </div>
        </div>
      </section>

      {/* ================= 04 — SEED TO PADDY ================= */}
      <section className="ch ch--seed" aria-label="Seed to paddy">
        <div className="ch__stage">
          <div className="seed__grid">
            {/* Left: the copy for each beat, stacked in one cell. */}
            <div className="seed__copy">
              {SEED_BEATS.map((b, i) => (
                <div
                  className="seed__beat"
                  key={b.n}
                  style={{ visibility: i === 0 ? "visible" : "hidden" }}
                >
                  <span className="ch__eyebrow">{b.n}</span>
                  <h2 className="ch__title ch__title--sm">{b.title}</h2>
                  <p className="ch__sub">{b.note}</p>
                </div>
              ))}
            </div>

            {/* Centre: the transformation, all in one fixed position. */}
            <div className="seed__centre">
              <div className="seed__stack">
                <img
                  src="/images/story-seed-husk.webp"
                  alt="A single rice seed"
                  className="seed__husk"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src="/images/story-seed-sprout.webp"
                  alt=""
                  aria-hidden="true"
                  className="seed__sprout"
                  loading="lazy"
                  decoding="async"
                />
                {/* The ripe stalk, built rather than photographed: the sprout
                    plate plus drawn grain heads, so chapter 04 can finish on
                    a bending ear without a third photograph. */}
                <div className="seed__stalk" aria-hidden="true">
                  <img src="/images/story-seed-sprout.webp" alt="" className="seed__stalk-body" />
                  <span className="seed__ear seed__ear--1" />
                  <span className="seed__ear seed__ear--2" />
                  <span className="seed__ear seed__ear--3" />
                </div>
              </div>
            </div>

            {/* Right: the progress counter. */}
            <ol className="seed__rail" aria-hidden="true">
              {SEED_BEATS.map((b, i) => (
                <li className="seed__mark" key={b.n} style={{ opacity: i === 0 ? 1 : 0.28 }}>
                  {b.n} / 03
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================= 05 — PURITY WITHIN ================= */}
      <section className="ch ch--purity" aria-label="Purity within">
        <div className="ch__stage">
          <div className="ch__copy ch__copy--left">
            <h2 className="ch__title">Purity Within.</h2>
            <p className="ch__sub">What matters is what remains.</p>
          </div>

          <div className="purity__centre">
            <div className="purity__glow" aria-hidden="true" />

            {/* Three cut-outs of the one plate, separated offline so each can
                move on its own — see the note in the stylesheet. */}
            <img
              src="/images/purity-half-l.webp"
              alt=""
              aria-hidden="true"
              className="purity__half purity__half--l"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/images/purity-half-r.webp"
              alt=""
              aria-hidden="true"
              className="purity__half purity__half--r"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/images/purity-grain.webp"
              alt="A golden husk opening to reveal the white rice grain inside"
              className="purity__grain"
              loading="lazy"
              decoding="async"
            />

            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="purity__chaff" style={{ "--i": i }} aria-hidden="true" />
            ))}
          </div>

          {/* Flooded white that carries into chapter 06. */}
          <div className="ch__mask ch__mask--flood" aria-hidden="true" />
        </div>
      </section>

      {/* ================= 06 — PADDY TO PACK ================= */}
      <section className="ch ch--pack" aria-label="From paddy to pack">
        <div className="ch__stage">
          <div className="ch__copy ch__copy--top">
            <h2 className="ch__title">From Paddy to Pack.</h2>
            <p className="ch__sub">Handled with care at every stage.</p>
          </div>

          <div className="pack__floor">
            <div className="pack__stream" aria-hidden="true">
              {GRAINS.map((g) => (
                <span key={g.i} className="pack__grain" style={{ "--s": g.s }} />
              ))}
            </div>

            <img
              src="/images/stage-karikalan.webp"
              alt="Karikalan rice pack"
              className="pack__bag pack__bag--l"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/images/stage-rajabogam.webp"
              alt="Cholan Rajabogam rice pack"
              className="pack__bag pack__bag--m"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/images/stage-gramiyam.webp"
              alt="Gramiyam Ponni rice pack"
              className="pack__bag pack__bag--r"
              loading="lazy"
              decoding="async"
            />
          </div>

          <p className="pack__tag">Made for Every Home.</p>
        </div>
      </section>

      {/* ================= 07 — ROYAL TABLE ================= */}
      <section className="ch ch--feast" aria-label="Tradition served every day">
        <div className="ch__stage">
          <div className="feast__plate">
            <img
              src="/images/chapter-feast.webp"
              alt="A long royal dining table laid with rice and dishes before a temple"
              loading="lazy"
              decoding="async"
            />
            {/* The same plate blurred, with the rice punched out, so the rice
                alone stays sharp as the camera pushes in. */}
            <img
              src="/images/chapter-feast.webp"
              alt=""
              aria-hidden="true"
              className="feast__blur"
              loading="lazy"
              decoding="async"
            />
            <div className="feast__steam" aria-hidden="true">
              <span /><span /><span />
            </div>
          </div>

          <div className="feast__warm" aria-hidden="true" />

          <div className="ch__copy ch__copy--bottom">
            <h2 className="ch__title">Tradition Served Every Day.</h2>
            <p className="ch__sub">The heart of every meal.</p>
          </div>
        </div>
      </section>

      {/* ================= 08 — FAMILY ================= */}
      <section className="ch ch--family" aria-label="From our fields to your table">
        <div className="ch__stage">
          <div className="family__centre">
            <img
              src="/images/banana-leaf.webp"
              alt=""
              aria-hidden="true"
              className="family__leaf"
              loading="lazy"
              decoding="async"
            />
            <div className="family__rice" aria-hidden="true">
              <span className="family__mound" />
              <div className="family__steam">
                <span /><span /><span />
              </div>
            </div>
          </div>

          <div className="ch__copy ch__copy--centre">
            <h2 className="ch__title">From Our Fields to Your Table.</h2>
            <p className="ch__sub">Made for moments that bring people together.</p>
          </div>
        </div>
      </section>

      {/* ================= 09 — PRODUCT HERO ================= */}
      <section className="ch ch--product" aria-label="Rooted in tradition, crafted for today">
        <div className="ch__stage">
          <div className="product__silhouettes" aria-hidden="true" />

          <div className="ch__copy ch__copy--centre product__copy">
            <h2 className="ch__title">
              Rooted in Tradition.
              <br />
              Crafted for Today.
            </h2>
          </div>

          <div className="product__row">
            {[
              { src: "/images/stage-karikalan.webp", alt: "Karikalan rice pack", cls: "l" },
              { src: "/images/stage-rajabogam.webp", alt: "Cholan Rajabogam rice pack", cls: "m" },
              { src: "/images/stage-gramiyam.webp", alt: "Gramiyam Ponni rice pack", cls: "r" },
            ].map((b) => (
              <div className={`product__slot product__slot--${b.cls}`} key={b.src}>
                <img src={b.src} alt={b.alt} className="product__bag" loading="lazy" decoding="async" />
                <span className="product__shadow" aria-hidden="true" />
              </div>
            ))}
          </div>

          <div className="product__cta">
            <Link to="/products" className="story__btn story__btn--solid">
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 10 — SIGNATURE ================= */}
      <footer className="ch ch--footer" aria-label="Goodness for generations">
        <img
          src="/images/chapter-nandi.webp"
          alt=""
          aria-hidden="true"
          className="sig__nandi"
          loading="lazy"
          decoding="async"
        />

        <div className="sig__inner">
          <span className="sig__rule" aria-hidden="true" />
          <p className="sig__line">Goodness for Generations.</p>

          <nav className="sig__cols" aria-label="Footer">
            <div className="sig__col">
              <h3>Explore</h3>
              <ul>
                {FOOTER_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sig__col">
              <h3>Follow</h3>
              <ul>
                {SOCIAL.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sig__col">
              <h3>Reach us</h3>
              <ul>
                <li>
                  <a href={`tel:${site.phoneRaw}`}>{site.phone}</a>
                </li>
                <li>
                  <a href={whatsappLink()} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <img src="/images/cholan-logo.png" alt={site.name} className="sig__logo" loading="lazy" />
        </div>
      </footer>
    </div>
  );
}
