# Cholan Rice & Millets — website outline

A React + Vite starting skeleton for the Cholan Rice site. Structure, routing,
content model and a full design-token system are in place. Images are
placeholders. Built to be redesigned — nothing here is precious.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run lint
```

## Where to change things

| I want to change…              | Edit this file                        |
| ------------------------------ | ------------------------------------- |
| Colours, fonts, spacing, radii | `src/index.css` (the `:root` block)   |
| Phone, email, address, socials | `src/data/site.js`                    |
| Products, prices, pack sizes   | `src/data/products.js`                |
| Blog posts                     | `src/data/posts.js`                   |
| Nav menu items                 | `src/components/Header.jsx`           |
| Footer links                   | `src/components/Footer.jsx`           |
| Page sections and copy         | the relevant file in `src/pages/`     |

**Retheming is meant to happen in one place.** Every colour, font and spacing
value on the site is a CSS custom property defined in the `:root` block of
`src/index.css`. Change `--brand-700` and the whole site follows.

## Pages

| Route                | File                       | Purpose                                    |
| -------------------- | -------------------------- | ------------------------------------------ |
| `/`                  | `pages/Home.jsx`           | 10 sections — see below                    |
| `/products`          | `pages/Products.jsx`       | Filter by category, search, sort           |
| `/products/:id`      | `pages/ProductDetail.jsx`  | Pack selector, enquiry, related products   |
| `/about`             | `pages/About.jsx`          | Story, values, milestone timeline          |
| `/process`           | `pages/Process.jsx`        | 6 stages, farm → delivery                  |
| `/blog`              | `pages/Blog.jsx`           | Featured post + grid, newsletter block     |
| `/contact`           | `pages/Contact.jsx`        | Enquiry form + contact details + map slot  |
| `/policies/:slug`    | `pages/Policy.jsx`         | shipping, returns, privacy, terms          |
| `*`                  | `pages/NotFound.jsx`       | 404                                        |

Homepage section order: hero → trust stats → categories → bestsellers →
grain story → health benefits → bulk/B2B → testimonials → blog preview → CTA.

## The hero

`src/components/CurtainStage.jsx` — one scroll-driven shot. The camera starts
on a Chola temple standing in its own landscape, flies through the lit doorway,
and arrives inside the curtained stage where the three packs stand.

**One scroll starts it and it plays itself** (2.6s), with the page held still
throughout. Beats are fractions of that playback, not scroll positions:

| Range | What happens |
| ----- | ------------ |
| 0.00-0.56 | the temple scales toward its doorway and passes the camera; the doorway's light grows to fill the frame |
| 0.26-0.46 | motion blur ramps in as the camera accelerates |
| 0.46-0.74 | the temple blows out through that light, and the curtain frame is behind it as the white clears |
| 0.64-0.92 | the packs rise, staggered centre-outward |
| 0.85-1.00 | the headline and CTAs arrive |

**The gateway is the gopuram alone**, a cut-out on transparency
(`temple-solo.webp`) on a plain cream ground. No painted landscape, no sky, no
courtyard — those went with the full scene it replaced.

It is `object-fit: contain`, not `cover`: cropping a cut-out slices through
the stonework itself rather than through expendable sky, so the whole gopuram
has to fit. It sits on the bottom (`object-position: 50% 100%`) with
`padding-top: 10%` reserving air for the titles — padding shrinks the
`contain` box, which is what sizes the temple. Measured, 10% leaves a 59px gap
below the headline while keeping the gopuram as large as it can be; 22% pushed
it to a 230px gap and a noticeably small temple.

Nothing is painted behind it. A background on `.curtain__pin` shows AROUND a
transparent cut-out, so the valley that used to sit there appeared as a band
of palms and hills either side of the temple — which is the background this
arrangement exists to remove.

There is no second layer. The earlier hero stacked a sharp cut-out over the
temple painted into a full scene, kept in register by matching `cover`
geometry; with a single asset there is nothing to register.

**The hero fills the space below the sticky header.** The header is `position:
sticky` and always occupies the top of the viewport, so the room left for the
temple is a viewport minus the header at every scroll position — which means
one height serves both of the pin's states:

| Element | Rule |
| ------- | ---- |
| `.curtain` | `min-height: calc(100vh - var(--header-h, 74px))` |
| `.curtain__pin` | `height: calc(100vh - var(--header-h, 74px))`, trigger starts at `top top+=headerH` |

**The section takes `min-height`, never a fixed `height`.** ScrollTrigger
inserts its pin-spacer INSIDE `.curtain`, and that spacer carries the pin's
height plus the scroll runway — 1725px against an 825px viewport-derived
height. A fixed height clips it, so the extra never reaches the document flow:
`.stats` landed at offsetTop 900 instead of 1800, and every section below was
painted over by the still-pinned hero (measured: 503px of the category cards
covered, their headings invisible behind the valley).

The symptom looks like a stacking-order problem and is not one — the boxes
genuinely overlap in the layout. Changing `z-index` does not fix it; the
section has to be allowed to grow.

The trigger's start offset is what keeps the pinned (fixed) stage below the
bar; pinning at a plain `"top top"` slides the temple up underneath it.

Note that a stylesheet rule cannot correct the pinned state after the fact:
ScrollTrigger writes `height` inline onto the element when it pins, so
whatever it measures at that moment is what it keeps. The height has to be
right *before* it pins.

There is no announcement bar. It was removed site-wide, so `--header-h` is now
just the nav (74px) and the phone number lives in the nav's WhatsApp CTA and
the footer. If a bar is ever reinstated it must be added back into
`--header-h`, and note that a *non-sticky* bar scrolling away above a sticky
nav needs two variables rather than one — the combined height is only correct
at scrollY 0.

**The nav bar is cream (`--surface-alt`), not white.** The hero opens on a warm
sunlit temple and the arrived stage is `#fef9ed`; a white bar read as a cold
strip pasted over both. The desktop bar keeps it at 0.94 alpha behind a blur;
the mobile bar and drawer use it opaque, because `backdrop-filter` makes the
header a containing block and would clamp the fixed drawer to its height.

**Backgrounds: the stage ground is cream (`#fef9ed`), not the temple's sky.**
The scene is opaque and `cover`-cropped, so it hides the background entirely
until it blows out; the only background ever seen is the one behind the
arrived stage, which the curtain artwork was cut against. Setting it to the
scene's sky blue left the packs and caption sitting on blue.

**The flight is a scale about a fixed origin.** The doorway sits at 50% across
and 68% down the artwork, so `transform-origin: 50% 68%` drives the camera
straight at it. Measure this again if the artwork is ever replaced: successive
temples have had their doorways at 66%, 78%, 70%, 72% and now 68%, and reusing the
wrong figure aims the camera at the lintel.

Find it by SHAPE, not by size. The obvious rule — largest connected near-white
blob — works only while the door is the brightest thing in the frame; in this
artworks the sky or the sun is brighter — in one, the sky ran to 187,008px
against the doorway's 21,868, so that rule returned a box spanning the whole
image. The doorway is instead the blob that is taller than it is wide, at
least 85% solid (a rectangle: the doorway scores 0.99 fill, diffuse sky and
sun glare score 0.36 and 0.11), and centred horizontally.

The aperture gradient in `.curtain__pin` aims at the same point, so move both
together.

**Scale runs to 22x, and that number matters.** The jamb has to leave the
viewport entirely or the camera reads as stopping at the doorway rather than
going through it. At 9x the stonework was still on screen when the stage
arrived, and the two cross-faded into a muddy dissolve.

**The scene is full-bleed** (`object-fit: cover`), filling the stage to all
four edges at every viewport and cropping whatever will not fit. At 1.75:1 it
is close enough to a typical screen that the loss is small. The anchor is
`50% 62%`, below centre: the sky is the most expendable part of this artwork
and the courtyard the least, so pulling the crop down keeps the steps and the
doorway the camera flies into.

An earlier version used `contain` to show every pixel, which letterboxes —
and the bands land on different axes depending on viewport (101px down each
side at 1440x900, but 132px top and bottom on a 390px phone), so a gradient
fill seams on whichever axis it does not run. Full bleed removes the problem
rather than filling it.

**The opening titles are held over the temple and leave as the flight
starts** (`.curtain__opening`, cleared at 0.02-0.18). Text riding a 22x zoom
smears into illegibility, so it lifts and fades rather than travelling with
the artwork — measured, it is fully gone by 460ms at scale 1.9.

**Every title sits in clear sky, never on the temple.** The clear zones were
measured on the rendered artwork rather than judged by eye, by scanning for
brightness AND low variance — foliage and carving are dark and busy, sky is
neither. On a 1440x900 stage the centre is clear to y328 (the spire), the left
margin to y452 and the right to y464 (palm fronds).

Measured clearance from each element to the artwork below it:

| | desktop | wide | tablet | phone |
| --- | --- | --- | --- | --- |
| headline | 77px | 90px | 161px | 115px |
| eyebrow | 47px | 60px | 138px | 92px |
| side labels | 66/74px | 87/95px | hidden | hidden |

The side labels are anchored to the top of the stage (`top: 26%`) rather than
centred, so the block grows downward into the clear band instead of drifting
with viewport height, and carry `max-height: 20%` so they can never run into
the foliage. They are hidden below 900px, where the margins are too narrow.

To re-check this after an artwork swap, hide `.curtain__opening` and scan the
bare screenshot — measuring with the text visible just finds the text itself,
which reads as "busy" and reports a false overlap.

The homepage `<h1>` is this opening headline, so the caption on the arrived
stage is an `<h2>` — one `<h1>` per page.

**There are no corner frames.** The stage was previously framed by
`border-l/-r.webp` curtain artwork; those are gone, along with the
`--border-w` inset that reserved space for them. `--gutter` replaces it as
plain breathing room for the packs and caption.

Note that `img { max-width: 100% }` in the global reset silently clamps any
attempt to over-scale the scene: the rule applies and the declared width is
correct, it is just capped on the way out. Lifting it needs an explicit
`max-width: none`.

**The hand-off is a white-out, not a cross-fade.** The doorway's glow grows
until it fills the frame, the gateway's opacity drops inside that white, then
the white clears onto the stage. Nothing is ever half gopuram and half stage.

**Every image is decoded before the shot can start.** `load` firing only means
the bytes arrived; the browser still decodes lazily at first paint, which
schedules decode work inside the animation and blocks frames — traced at
81.6ms of `ImageDecodeTask` during the shot, against 0.1ms with `img.decode()`
called up front. A `ready` flag gates the trigger, and while not ready the
wheel is left alone so the page scrolls normally rather than trapping the
reader.

**Nothing filtered may sit on or above the scaled layer.** A CSS `filter` on
the element being transformed — or on any ancestor — forces a full
re-rasterisation every frame, and `drop-shadow` is the worst offender because
it recomputes from the alpha channel. Measured during the flight:

| Setup | Dropped frames | p95 | Jitter |
| ----- | -------------- | --- | ------ |
| `drop-shadow` + blur on the `<img>` | 11 | 33.3ms | 5.02ms |
| blur on the full-viewport container | 12-16 | 33.3ms | 1.04ms |
| blur on the wrapper, no drop-shadow | 4-6 | 16.8ms | 0.43ms |

So the `<img>` carries `transform` only (plus `translateZ(0)` and
`backface-visibility: hidden` to pin it to its own compositor layer up front).
The motion blur goes on `.curtain__gate picture` — off the scaled node, and
sized to the artwork rather than the viewport. The temple's grounding shadow
is a composited radial ellipse on `.curtain__gate::after`, not a
`drop-shadow`.

Note that none of this is visible to a headless profile: frame timing showed a
flat 16.7ms p95 in every phase even at 6x CPU throttling, because the cost is
GPU and decode work rather than script. Profile with
`chromium.launch({ headless: false })` and CDP `Tracing` if this needs
revisiting.

**The shot starts from the first scroll gesture, not a scroll position.**
Firing on the pin's `onEnter` means the page has to scroll to the trigger
point first, so the stage drifts under the header on the way there — measured
at 0 -> 30 -> 60 -> 90 -> 120px over four frames. The wheel/touch handler now
claims the first gesture: `preventDefault`, start, and lock in the same event,
so the page holds at `scrollY` 0 for the whole flight.

Listeners are attached **once, up front**, with the handler checking a flag —
attaching them inside the trigger makes the lock reactive, and a trackpad's
burst of deltas lands before the listener exists. The claim is gated on
`atRest()` (`scrollY <= 4`), so a restored scroll position, an in-page anchor
or a return to the top all leave the wheel alone. Keyboard scrolling is never
intercepted. `{ passive: false }` is required for `preventDefault` to apply;
`overflow: hidden` on `<body>` is not an option because it jumps the scroll
position and re-triggers the pin.

The copy is deliberately sparse — one `<h1>` and two actions.

The gateway sits at 74% of the stage width on desktop (max 960px), with the
phone breakpoints giving width *back* — 92% at 900px, 96% at 560px. A
percentage of a small viewport is still a small temple. The artwork is wide
(2.64:1), so sizing tuned for a taller gopuram will not transfer.

The component is prefixed `.curtain__*` because `.stage` is already taken by
`Process.css`, and Vite bundles all CSS globally.

Assets: `temple-solo.webp` (1400x880, q88, 317kB) and `temple-solo-sm.webp`
(860x540, q86, 135kB) for the gateway, and `stage-rajabogam`,
`stage-karikalan`, `stage-gramiyam` for the packs. Source `ChatGPT Image
Sep 10, 2026, 04_28_32 PM.png` in `assets-source/packs/`, trimmed to its own
bounds with a hard alpha threshold so the soft shadow fringe goes too.

The scene is opaque, so quality trades cleanly against size. q86 is the
compromise — the image is scaled to 22x mid-flight, which magnifies encoding
artefacts well beyond normal viewing, though the motion blur covers the
extreme end of the zoom.

`src/components/Hero.jsx` (the full-width farm photograph) is a previous hero,
no longer mounted anywhere. It is kept with `farm.webp` and `farm-md.webp` in
case that photograph is wanted elsewhere; Vite tree-shakes it out of the
bundle.

## The banana grove

Two cut-out banana plants — `public/images/banana-plain.webp` and
`banana-fruit.webp` — are repeated to build a plantation in two places: behind
the homepage product grid (`.grove` in `src/pages/Home.css`) and behind the
hero gopuram (`.curtain__grove` in `src/components/CurtainStage.css`).

**Why cut-outs.** The source art was painted on an opaque dark-green gradient.
Tiling those rectangles would show obvious seams, so the plants were keyed out
first. Saturation was useless as a key — the background is itself saturated
green (5th-percentile saturation 0.535) — and brightness alone overlaps, since
one corner of the backdrop is as bright as mid-tone foliage. What separates
them cleanly is **local variance**: the backdrop is a smooth gradient (sd
0.4–2.1) while leaves and stems are busy (sd 11.8–22.0), and that holds no
matter how bright the patch is. The mask is thresholded on sd, dilated to
bridge smooth leaf interiors, hole-filled, reduced to its largest component,
eroded back, and feathered.

**Why it reads as a grove, not a tile.** Each copy differs in plant, size,
baseline and horizontal flip, and several sit past the section edges so no copy
is ever seen whole. Three depths (far/mid/near on the homepage, back/front in
the hero) get progressively smaller, paler, less saturated and more blurred, so
the field recedes. A gradient veil over the layer fades the plants into the
paper at the top — keeping headings on clean ground — and again at the very
bottom, so plants clipped by the section edge dissolve rather than ending on a
hard cut.

**Two traps worth knowing.**

*Geometry lives in custom properties.* Each plant's position and size come from
`--x`, `--y`, `--w` set inline in the markup. An inline custom property
outranks anything a stylesheet sets, so a media query **cannot** retune the
grove by redefining `--x`/`--y` — it has to set the real `left`/`bottom`
properties instead, which the inline style never touches.

*Override one axis and the other collapses.* The plants are sized on one axis
with the other left `auto`. When a media query overrode just the width, the
height resolved to zero and the plants vanished — and sizing by height instead
put the width at zero. `aspect-ratio: 0.67` on `.grove__plant` and
`.curtain__tree` (both assets are ~349x520) fixes this in both directions.

**The hero grove is a sibling of `.curtain__gate`, never a child.** The gate is
scaled ~22x during the flight; a grove inside it would be blown up with the
temple. As a sibling at `z-index: 2` it sits above the cream ground, below the
gopuram (5) and below the copy, and holds still while the camera flies.

**Small screens.** On the homepage, full-width cards leave no room for a
backdrop between them, so below 760px the section takes extra bottom padding
and the plants stand as a band in that strip, sized in pixels and spread across
the width. In the hero, the hazy back row is dropped below 800px so the temple
and headline keep the room.

## The grain's journey

**Two clocks, deliberately kept apart.** The centre column falls continuously
for the entire section — every frame of scroll, the artwork drifts downward and
never stalls. The changeover between beats is a separate, *brief* event at the
hand-off. Outside those windows nothing fades or slides, so the reader sees
only the fall; the transition is a moment, not a state.

Getting this wrong is easy: a cross-fade spread across each beat reads as a
permanent transition and the fall disappears inside it. `SWAP` (0.26) is the
fraction of a beat's slice the changeover occupies, and keeping it small is
what makes the fall legible.

The two motions live on **different elements** — `.grain__fall` carries the
drift, `.grain__art` carries the swap's opacity and scale. Stacking a
continuous translate and a per-beat transform on one element makes them
overwrite each other.

The fall tween runs `BEATS.length + 0.5` and the scroll runway matches, so the
last beat still has runway to fall through after the final swap; without the
tail it visibly stalls on beat four.

Measured within the pin: 0 non-advancing samples out of 25 (the fall never
stops) and fades present in only 3 of 25 (the three beat boundaries).

`src/components/GrainStory.jsx` — the homepage's process section, told as one
continuous scroll. It replaced the old four-card "From Farm to Your Table"
grid.

A single stage is PINNED for the whole section while four beats cross-fade
through it: seed -> grain -> purity -> pack. The frame never moves, only its
contents, which is what makes it read as one shot rather than four stacked
sections.

**Scrubbed, not triggered** — the opposite of the hero. The hero's flight is a
single gesture and plays on its own clock; this is a sequence the reader walks
through, so it binds to scroll position and can be stopped, reversed and dwelt
on anywhere. `scrub: 0.8` rather than `true`: the timeline chases the scroll
instead of snapping to it, which is what makes the movement glide.

Beats overlap deliberately. The outgoing text lifts and fades while the
incoming one is already arriving (`at` vs `at + 0.25`), so there is never a
frame of empty stage.

**The aside is a sibling of `.grain__text`, not a child.** A `.grain__text > *`
selector misses it, and all four asides then print on top of each other as
illegible overlapping italics — the `movers()` helper exists to catch both.

Layout follows the reference: number and title left, artwork centre, a short
italic aside right, a progress rail on the far right. Below 900px the beat
stacks (text above, artwork below), the aside and scroll cue are dropped, and
the rail turns horizontal along the bottom — mounted at the side it printed
straight over the artwork.

Under `prefers-reduced-motion` there is no pin and no scrub: `.grain--static`
lays the four beats out in normal flow and the story reads as blocks.

Assets: `story-seed`, `story-grain`, `story-purity`, `story-pack` (900px, q88,
plus `-sm` variants at 520px), all trimmed to their own bounds.

**`story-pack` needed keying.** Its source has a transparency checkerboard
baked in as real pixels, which rendered as a grey grid behind the packs. The
pattern is TWO neutral tones (luma ~197 and ~138), and keying only the light
one leaves the dark squares and, worse, breaks a flood fill because it cannot
cross them. `keyout3.js` keys both bands, floods from the border only (so grey
inside a pack label survives), then closes the remaining speckle at tone
boundaries by absorbing pixels with 6+ background neighbours.

## The heritage block

`src/pages/About.jsx` — the Chola gopuram cut-out on a white ground, paired
with the "Named for the Cholas" copy that explains where the business name
comes from. It sits between the story and the values sections.

No card and no tint behind it: the artwork is already a silhouette on
transparency, so a panel just boxes it in. The drop-shadow is deliberately
tight and low (`0 16px 18px`) — a wide soft one traces every notch of the
carving and reads as grey fog around the outline rather than ground under it.

On screens below 860px the grid stacks and the artwork moves to the top with
`order: -1`; it carries the section better than the heading does.

Assets: `gopuram.webp` (1000x716) and `gopuram-sm.webp` (640x459), trimmed to
their bounds. Source in `assets-source/packs/`.

## Product photography

`ProductCard` and `ProductDetail` show a real photo when `product.image` ends in
`.webp`, and fall back to the lettered placeholder otherwise. Dropping a `.webp`
cut-out into `public/images/` and pointing a product at it lights up its photo
everywhere.

The two Ponni pack shots were cut from retail photos on a teal-green backdrop.
Keying the Rajabogam pack needed care: its own artwork is green, so a plain "is
it green" test punched holes through the label. The backdrop is specifically
*teal* (blue above red) while the pack's greens are olive (blue at or below
red) — that is what separates them.

Cut-out sources are kept in `assets-source/packs/` (not shipped). Keep
originals there rather than in `dist/` — `npm run build` empties that folder.

## Commerce model

Catalog + enquiry, not a cart. Prices and pack sizes are shown; every "Enquire"
button opens WhatsApp with a prefilled message naming the product and the
selected pack. The contact form does the same — there is no backend yet.

To add a real cart later, the data layer in `src/data/products.js` is already
shaped for it (stable `id`, `packs[]` with `size` and `price`).

## Before going live

- [ ] Replace remaining `.ph` placeholder divs with real `<img>` — search `class="ph"` (the hero is done)
- [ ] Drop the remaining product photos into `public/images/` as `.webp` cut-outs and point each product's `image` at them (the two Ponni packs are done)
- [ ] Re-cut both pack shots from the original JPGs — the current ones are trimmed a few px short at the base (see **Product photography**)
- [ ] Replace placeholder policy text in `pages/Policy.jsx` with reviewed copy
- [ ] Verify all prices in `products.js` against current rates
- [ ] Set real social URLs in `site.js` (currently pointing at bare domains)
- [ ] Wire the contact form to a form service or API if you want email delivery
- [ ] Confirm the "Since 1998", "25+ years", "500+ farmer families" claims on the
      homepage and About page — these are placeholders I wrote, not verified facts
- [ ] **Resolve the founding-date conflict.** The storyboard's heritage panel
      reads "For over seven decades" and "SINCE 1950", but the site says 1998
      (`About.jsx` timeline) and "25+ years" (`Home.jsx` trust stats). Both
      cannot be right. I applied the storyboard's *headings* but deliberately
      left the dates alone rather than picking one — tell me which is correct
      and I will make it consistent everywhere.
- [ ] Add the Google Maps embed on the contact page
- [ ] Add `og:image` at `public/images/og-cover.jpg` for social sharing

## Notes

- Product data (names, pack sizes, prices) was taken from the live
  cholanrice.in storefront, so it reflects the real catalogue.
- Testimonials, blog posts, the company timeline and all statistics are
  invented placeholder copy. Replace them.
- No CSS framework. Plain CSS with custom properties, one stylesheet per
  component or page, all bundled globally by Vite.
