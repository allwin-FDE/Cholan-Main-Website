import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site, whatsappLink } from "../data/site";
import "./About.css";

gsap.registerPlugin(ScrollTrigger);

/*
  About — one light, cream page, built from the approved reference:

    1. The rule      a single quote, centred, between gold rules
    3. Our promise   four commitments in one card, icon over each
    4. Our journey   milestones on a spine that fills as you scroll
    5. Our products  the bags, and the way to the full range
    6. Visit us      a warm gold panel: call, WhatsApp, address, hours

  Contact details and milestones come from the site's own data rather than
  the reference mock-up, which carried placeholder numbers and addresses.
  Motion is reveal-on-arrival only, and none at all under reduced motion.
*/

const values = [
  { title: "Traceability", text: "We know where every grain comes from.", icon: "grain" },
  { title: "Minimal processing", text: "No unnecessary steps, no artificial polishing.", icon: "gear" },
  { title: "Fair sourcing", text: "We buy direct from farmer families, and pay them first.", icon: "leaf" },
  { title: "Consistency", text: "The same goodness in every pack.", icon: "badge" },
];

const timeline = [
  {
    year: "1998",
    title: "A single trading counter",
    text: "The family began trading paddy in Salem, supplying local provision stores.",
  },
  {
    year: "2006",
    title: "Our own milling",
    text: "We moved from trading to milling, taking control of grading and quality.",
  },
  {
    year: "2015",
    title: "The millet revival",
    text: "We began sourcing native millets and heritage rice as demand for them returned.",
  },
  {
    year: "2024",
    title: "Direct to your home",
    text: "Launched direct household delivery alongside our wholesale business.",
  },
];

const packs = [
  { img: "stage-karikalan", alt: "Karikalan rice, 25 kg bulk pack" },
  { img: "stage-rajabogam", alt: "Cholan Rajabogam rice bag" },
  { img: "stage-gramiyam", alt: "Gramiyam Bapatla Ponni rice, 26 kg bag" },
];

/* ---- Line icons, drawn to one 24px grid and one stroke weight ---- */

const ICONS = {
  // Two grains on a stem.
  grain: (
    <>
      <path d="M12 21V11" />
      <path d="M12 11c-3.6-.4-5.4-2.8-5.4-6.4 3.6.3 5.4 2.6 5.4 6.4Z" />
      <path d="M12 15c3.6-.4 5.4-2.8 5.4-6.4-3.6.3-5.4 2.6-5.4 6.4Z" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
      <circle cx="12" cy="12" r="6.4" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-14 15" />
      <path d="M5 19 13 11" />
    </>
  ),
  // A rosette with a star — the "same every time" seal.
  badge: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m12 7.6 1.35 2.75 3.03.44-2.19 2.13.52 3.02L12 14.52l-2.71 1.42.52-3.02-2.19-2.13 3.03-.44Z" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5h2.6l1.5 4-1.9 1.3a11 11 0 0 0 6.4 6.4l1.3-1.9 4 1.5v2.6a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  chat: (
    <>
      <path d="M4.2 19.8 5.3 16A8.3 8.3 0 1 1 8.4 19l-4.2.8Z" />
      <path d="M9.3 9.2c.3 2.4 2.2 4.3 4.6 4.8l1-1.1 1.6.7-.4 1.5c-3.7-.2-6.7-3.2-6.9-6.9l1.5-.4.7 1.6-1.1.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  arrow: <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />,
};

function Icon({ name, className = "" }) {
  return (
    <svg
      className={`ab-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.address.line1}, ${site.address.line2} ${site.address.pincode}, ${site.address.state}`
)}`;

// Each word in its own mask so a headline can rise into place. The space sits
// between the masks — inside an inline-block it would be trimmed.
const words = (text) =>
  text.split(" ").flatMap((w, i) => [
    i > 0 ? " " : null,
    <span className="ab-word" key={i}>
      <span>{w}</span>
    </span>,
  ]);

export default function About() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      /* ---- Headlines rise word by word as they arrive ---- */
      gsap.utils.toArray(".ab-rise", root).forEach((h) => {
        gsap.from(h.querySelectorAll(".ab-word > span"), {
          yPercent: 110,
          duration: 1,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: { trigger: h, start: "top 88%", once: true },
        });
      });

      /* ---- Everything marked data-reveal fades up ---- */
      const reveals = gsap.utils.toArray("[data-reveal]", root);
      gsap.set(reveals, { opacity: 0, y: 30 });
      ScrollTrigger.batch(reveals, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            // Hand transform back to the stylesheet, or button hovers die.
            clearProps: "transform",
          }),
      });

      /* ---- The quote's gold rules draw out from the mark ---- */
      gsap.from(".ab-quote__rule", {
        scaleX: 0,
        duration: 1.2,
        ease: "power3.inOut",
        scrollTrigger: { trigger: ".ab-quote", start: "top 85%", once: true },
      });

      /* ---- Journey: the spine fills, each stop lights as it's reached ---- */
      gsap.fromTo(
        ".ab-spine__fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".ab-spine", start: "top 62%", end: "bottom 62%", scrub: 0.6 },
        }
      );
      /*
        Each card waits off to its own side, small and faded, and is drawn in
        by the scroll as the line reaches its dot: it slides in toward the
        spine, its year counts up, and its title and text follow. Scrubbed,
        so scrolling back sends it out again — one card per stretch of
        scroll, never all at once.
      */
      const narrow = window.matchMedia("(max-width: 760px)").matches;
      gsap.utils.toArray(".ab-stop", root).forEach((stop) => {
        const card = stop.querySelector(".ab-stop__card");
        const fromRight = narrow || stop.classList.contains("ab-stop--right");
        const year = stop.querySelector(".ab-stop__year");
        const target = parseInt(year.textContent, 10);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stop,
            start: "top 82%",
            end: "top 50%",
            scrub: 0.6,
            onEnter: () => stop.classList.add("is-lit"),
            onLeaveBack: () => stop.classList.remove("is-lit"),
          },
        });
        tl.fromTo(
          card,
          { autoAlpha: 0, x: fromRight ? 80 : -80, scale: 0.92, rotate: fromRight ? 2 : -2 },
          { autoAlpha: 1, x: 0, scale: 1, rotate: 0, ease: "power3.out", duration: 1 }
        )
          .fromTo(
            card.querySelectorAll("h3, p"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, stagger: 0.15, ease: "power2.out", duration: 0.5 },
            0.35
          );
        // The year counts up from a few years before, to its own.
        if (!Number.isNaN(target)) {
          const n = { v: target - 12 };
          tl.to(
            n,
            {
              v: target,
              duration: 0.8,
              ease: "power2.out",
              onUpdate: () => (year.textContent = String(Math.round(n.v))),
            },
            0.1
          );
        }
      });

      /* ---- The bags rise into line ---- */
      gsap.from(".ab-pack", {
        y: 70,
        opacity: 0,
        duration: 1.05,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".ab-products__packs", start: "top 82%", once: true },
      });

      // Images decode late and move every trigger below them.
      const imgs = Array.from(root.querySelectorAll("img"));
      Promise.all(imgs.map((i) => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))).then(
        () => requestAnimationFrame(() => ScrollTrigger.refresh())
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="ab" ref={rootRef}>
      {/* ---------- 1. THE RULE ---------- */}
      <section className="ab-quote">
        <div className="container">
          <div className="ab-quote__mark" aria-hidden="true">
            <span className="ab-quote__rule" />
            <span className="ab-quote__glyph">“</span>
            <span className="ab-quote__rule" />
          </div>
          <h1 className="ab-quote__text ab-rise">
            {words("We refuse to sell grain")}
            <br />
            {words("we would not cook at home.")}
          </h1>
          <p className="ab-quote__caption" data-reveal>
            The same rice we trust in our home, now in yours.
          </p>
        </div>
      </section>

      {/* ---------- 3. OUR PROMISE ---------- */}
      <section className="ab-promise">
        <div className="container">
          <div className="ab-promise__card">
            <header className="ab-promise__head">
              <span className="ab-eyebrow" data-reveal>
                Our promise
              </span>
              {/* "Cholan" in Tamil, in outline, between the label and the
                  heading. */}
              <span className="ab-promise__mark" aria-hidden="true" lang="ta">
                சோழன்
              </span>
              <h2 className="ab-rise">{words("From generations of knowledge.")}</h2>
              <p data-reveal>
                Time-tested practices, modern care, and the same honest approach — so every grain
                you cook at home is one you can trust.
              </p>
            </header>

            <ul className="ab-promise__list">
              {values.map((v) => (
                <li className="ab-value" key={v.title} data-reveal>
                  <span className="ab-value__icon">
                    <Icon name={v.icon} />
                  </span>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- 4. OUR JOURNEY ---------- */}
      <section className="ab-journey">
        <div className="container">
          <header className="ab-journey__head">
            <span className="ab-eyebrow" data-reveal>
              Our journey
            </span>
            <h2 className="ab-rise">{words("How we got here.")}</h2>
          </header>

          <div className="ab-spine">
            <span className="ab-spine__track" aria-hidden="true">
              <span className="ab-spine__fill" />
            </span>
            <ol className="ab-spine__list">
              {timeline.map((t, i) => (
                <li className={`ab-stop ab-stop--${i % 2 ? "right" : "left"}`} key={t.year}>
                  <span className="ab-stop__dot" aria-hidden="true" />
                  <div className="ab-stop__card">
                    <span className="ab-stop__year">{t.year}</span>
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- 5. OUR PRODUCTS ---------- */}
      <section className="ab-products">
        <div className="container ab-products__inner">
          <div className="ab-products__copy">
            <span className="ab-eyebrow" data-reveal>
              Our products
            </span>
            <h2 className="ab-rise">{words("Packed fresh, against the order.")}</h2>
            <p data-reveal>
              Every bag of Cholan Rice &amp; Millets is packed against the order rather than
              stored, so you enjoy the same freshness we trust at home — from household packs to
              26 kg bags for messes and caterers.
            </p>
            <Link to="/products" className="ab-btn ab-btn--dark" data-reveal>
              View All Products <Icon name="arrow" />
            </Link>
          </div>

          {/* The wrapper takes the entrance; the image keeps the hover lift,
              so GSAP's inline transform never overrides it. */}
          <div className="ab-products__packs">
            {packs.map((p) => (
              <div className="ab-pack" key={p.img}>
                <img
                  className="ab-pack__img"
                  src={`/images/${p.img}.webp`}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 6. VISIT US ---------- */}
      <section className="ab-visit">
        <div className="container">
          <div className="ab-visit__panel">
            <div className="ab-visit__copy">
              <span className="ab-eyebrow" data-reveal>
                Visit us
              </span>
              <h2 className="ab-rise">{words("Come see the mill.")}</h2>
              <p data-reveal>
                We&rsquo;re happy to show you our process, our standards, and the care that goes
                into every pack. Call ahead and we will set aside the time.
              </p>
              <div className="ab-visit__actions" data-reveal>
                <a href={`tel:+${site.phoneRaw}`} className="ab-btn ab-btn--dark">
                  <Icon name="phone" /> {site.phone}
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="ab-btn ab-btn--outline"
                >
                  <Icon name="chat" /> WhatsApp <Icon name="arrow" />
                </a>
              </div>
            </div>

            <ul className="ab-visit__cards">
              <li data-reveal>
                <Icon name="pin" className="ab-visit__icon" />
                <div>
                  <span className="ab-visit__label">Our office</span>
                  <p>
                    {site.address.line1}
                    <br />
                    {site.address.line2} {site.address.pincode}
                    <br />
                    {site.address.state}
                  </p>
                  <a href={mapsLink} target="_blank" rel="noreferrer" className="ab-visit__link">
                    Get directions
                  </a>
                </div>
              </li>
              <li data-reveal>
                <Icon name="clock" className="ab-visit__icon" />
                <div>
                  <span className="ab-visit__label">Working hours</span>
                  <p>{site.hours}</p>
                </div>
              </li>
              <li data-reveal>
                <Icon name="mail" className="ab-visit__icon" />
                <div>
                  <span className="ab-visit__label">Email</span>
                  <p>
                    <a href={`mailto:${site.email}`} className="ab-visit__link">
                      {site.email}
                    </a>
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
