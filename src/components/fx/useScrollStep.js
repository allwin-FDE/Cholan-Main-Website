import { useEffect } from "react";
import gsap from "gsap";

/*
  One scroll, one step.

  Turns a single wheel tick, swipe or key press into a glide to a chosen
  scroll position, instead of the page creeping a few pixels at a time. The
  caller decides where each step goes: `decide(dir, y)` gets the direction
  (1 = down, -1 = up) and the current scroll position, and returns the
  position to glide to — or null to let the page scroll normally.

  One glide runs at a time across the whole page, so two sections using this
  can never fight over the same gesture.
*/

let active = null;

const headerH = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 74;

// Where an element's top sits once scrolled to just under the sticky header.
export const topUnderHeader = (el) => Math.round(el.getBoundingClientRect().top + window.scrollY - headerH());

export default function useScrollStep(ref, decide) {
  useEffect(() => {
    if (!ref.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let touchY = null;

    const glide = (to) => {
      const pos = { y: window.scrollY };
      active = gsap.to(pos, {
        y: to,
        // Moves the moment the wheel turns, then settles softly.
        duration: reduced ? 0 : 1.1,
        ease: "power3.out",
        onUpdate: () => window.scrollTo({ top: pos.y, behavior: "instant" }),
        // Let the trailing wheel momentum die out before handing back.
        onComplete: () => setTimeout(() => (active = null), 150),
      });
    };

    // Returns true when the gesture was taken over.
    const step = (dir) => {
      const to = decide(dir, window.scrollY);
      if (to == null || Math.abs(to - window.scrollY) < 2) return false;
      glide(Math.max(0, to));
      return true;
    };

    const onWheel = (e) => {
      if (active) {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey || !e.deltaY) return;
      if (step(e.deltaY > 0 ? 1 : -1)) e.preventDefault();
    };

    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e) => {
      if (active) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (touchY == null) return;
      // Finger moving up = page moving down, and the reverse.
      const moved = touchY - e.touches[0].clientY;
      if (Math.abs(moved) < 8) return;
      touchY = null;
      if (step(moved > 0 ? 1 : -1) && e.cancelable) e.preventDefault();
    };

    const onKey = (e) => {
      if (active || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const down = ["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
      const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
      if ((down || up) && step(down ? 1 : -1)) e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
    // `decide` reads live positions on every call, so the listeners never
    // need rebinding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
