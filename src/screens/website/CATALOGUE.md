# Component Catalogue

An index of every reusable piece in this library, so a new design can be
assembled from things that already exist instead of rebuilt from the brief.

`README.md` next door is about *conventions* — how to add a template, the scroll
gotcha, the CSS-layer gotcha, where assets live. This file is about *inventory*:
what exists, where it lives, and which of it is already shared versus still
sitting inside the one template that needed it.

**Nothing here has been extracted.** Eleven modules in `./shared` are the only
componentised pieces; the rest is catalogued in place, with the file and line to
copy from. That is deliberate — the 24 templates work, and rewriting them onto a
kit would be a very large diff with nothing visible to show for it. Extract a
piece the day a *second* design needs it, and update its row here.

Entries carry stable IDs (`NV-02`, `SC-01`) so they can be referenced when
planning a build without pasting paths around.

For the other half of the picture — what is *missing*, and in what order to
build it — see `ROADMAP.md`.

## At a glance

| | Count |
|---|---|
| Website templates | 25 |
| Playground scenes | 5 |
| Shared modules | 15 |
| Named sub-components inside templates | ~130 |
| Utility classes in `src/index.css` | 62 |
| Templates carrying video | 20 of 24 |
| Templates with a nav or header | 19 of 24 |
| Templates with a footer | 3 of 24 |

Two numbers worth reading together: **20 of 24 templates carry video, and only 3
have a footer.** This library is deep in hero treatments and thin on everything
that comes after one. A new multi-section site will find plenty of `MD-*` and
`HR-*` to draw on and will mostly be writing its own `FT-*`.

---

## 1. Shell — `SH`

The frame every template renders into. Already shared; use as-is.

| ID | Component | Source | Notes |
|---|---|---|---|
| `SH-01` | `PageFrame` | `shared/PageFrame.jsx` | Fixed full-viewport page that scrolls internally. `scroll={false}` for locked designs. Publishes its scrolling element on context. |
| `SH-02` | `useScrollFrame`, `useDocumentTitle` | `shared/frameContext.js` | The ref to hand `useScroll({ container })`. Read the scroll gotcha in `README.md` before writing anything scroll-driven. |
| `SH-03` | `BackButton` | `../BackButton.jsx` | Corner control. `fixed` on anything that scrolls; `top`/`left` to dodge a template's own chrome. |

`SH-01` also owns modal scroll-locking: pass `scroll={!isOpen}` rather than
touching `document.body.style.overflow`, which does nothing here. See
`Basilico.jsx:960`.

---

## 2. Navigation — `NV`

Seven archetypes across 19 implementations. Fourteen are already their own
component inside their file; the rest are inline in a hero.

| ID | Archetype | Implementations |
|---|---|---|
| `NV-01` | Centred glass pill, logo and spacer either side | `Aster.jsx:87` · `Axon.jsx:32` (inline) · `shared/GlassHero.jsx` |
| `NV-02` | Floating pill whose chrome changes past a scroll threshold | `Skyline.jsx:142` (motion values, ramped) · `Outbox.jsx:114` (boolean, stepped) |
| `NV-03` | Sticky glass bar, full width | `Basilico.jsx:238` · `MichaelSmith.jsx:221` |
| `NV-04` | Full-width header, links + CTA + mobile drawer | `Verde.jsx:61` · `NaturaVista.jsx:150` · `Coinwise.jsx:74` |
| `NV-05` | Nav absolutely placed inside a bounded card | `WanderGear.jsx:63` · `Lithos.jsx:152` |
| `NV-06` | Split links around a centred circular logo | `Mindful.jsx:61` |
| `NV-07` | Pill with a hover text-roll CTA | `Axion.jsx:161` (see `TextRoll` at `Axion.jsx:78`, `RollButton` at `:94`) |

`NV-02` is the same feature solved two ways, and both are correct for their
case: Skyline ramps background opacity and blur continuously across `[0, 50]`
with `useTransform`, Outbox flips a boolean at 50 with `useMotionValueEvent`.
Ramp when the change is a gradient; subscribe when it is a step.

---

## 3. Mobile menu — `MN`

Three mechanisms, seven uses. Worth knowing all three — they fail differently.

| ID | Mechanism | Implementations |
|---|---|---|
| `MN-01` | Full-screen overlay sliding from `y: -100%`, `AnimatePresence` | `Outbox.jsx:168` · `Adam.jsx:97` |
| `MN-02` | `grid-rows-[0fr]` → `[1fr]` collapse, in flow | `Skyline.jsx:201` · `Basilico.jsx:281` |
| `MN-03` | Absolute panel on opacity + translate | `Verde.jsx:134` · `NaturaVista.jsx` (in `Header`) · `Coinwise.jsx:125` (dropdown) · `Axion.jsx:225` (bottom sheet) |

`MN-02` is the one to reach for when the menu must push content rather than
cover it, and it animates to *content height* without measuring anything.

---

## 4. Hero — `HR`

| ID | Shell | Implementations |
|---|---|---|
| `HR-01` | Full-bleed video, centred stack | `Aster.jsx:121` · `Axon.jsx:32` · `Vex.jsx:135` · `Mindful.jsx:61` |
| `HR-02` | Bounded video card inset from the page edge | `Verde.jsx:229` · `WanderGear.jsx:157` · `Prisma.jsx:64` · `Vortx.jsx:59` |
| `HR-03` | Split — type left, media card right | `Basilico.jsx:305` |
| `HR-04` | Locked composition, nothing scrolls | `Adam.jsx:142` · `Securify.jsx:74` · `Measured.jsx:119` |
| `HR-05` | Scroll-driven sticky stage (see `SC-01`, `SC-02`) | `Skyline.jsx:253` · `Outbox.jsx:193` |
| `HR-06` | Glass newsletter hero — **already shared** | `shared/GlassHero.jsx`, used by `Asme` and `KnowItAll` |

`HR-06` is the one piece of this section that has already earned extraction: two
briefs described the same screen with different headlines, so the shell moved to
`shared/` and each template passes its own copy in.

---

## 5. Media — `MD`

Twenty templates carry video. Seven distinct strategies for putting it on screen.

| ID | Strategy | Implementations |
|---|---|---|
| `MD-01` | **Shared.** Loop that crossfades through black at the seam | `shared/FadingVideo.jsx` — used by `Aster`, `NaturaVista` |
| `MD-02` | **Shared.** Dual-element crossfade — frame is never dark, costs a second decode | `shared/CrossfadeVideo.jsx` — used by `Aluma`. `NaturaVista.jsx:60` still holds the original local copy |
| `MD-03` | Oversized and edge-anchored, crop taken off one side | `Aster.jsx:129` (120%) · `Axon.jsx:45` (130%, top) · `Asme.jsx:29` (117%, top) |
| `MD-04` | Gradient-masked, dissolved into the page | `WanderGear.jsx:181` — note both `maskImage` and `WebkitMaskImage` |
| `MD-05` | Playing inside a shape | `Outbox.jsx:193` (circle) · `Outbox.jsx:454` (knockout text via `multiply` + `screen`) |
| `MD-06` | Cursor-spotlight mask, canvas painted per frame | `Lithos.jsx:52` (`useSpotlight`) · `Measured.jsx:168` |
| `MD-07` | Scrim and grain stacks | see below |

### `MD-07` scrim recipes

| Recipe | Source |
|---|---|
| Three-layer legibility stack (flat + horizontal ramp + vertical ramp) | `Mindful.jsx:80` |
| Vertical ramp + radial vignette | `Verde.jsx:268` |
| Top-half fade back to page colour, blends video into nav | `Coinwise.jsx:67` |
| Corner vignette, centre left clear | `Basilico.jsx:341` |
| `feTurbulence` grain over video, `mix-blend-overlay` | `Prisma.jsx:76` (`.noise-overlay`), `:201` (`.bg-noise`) |
| Generated grain plate over everything, `mix-blend-lighten` | `Orbis.jsx:363` |

`MD-01` and `MD-02` answer the same question and neither is a default. Use
`MD-01` when a beat of black at the seam is acceptable — it is one element and
one decode. Use `MD-02` when the frame must never go empty.

`MD-02` was promoted to `./shared` when `Aluma` became its second user, which is
the rule at the bottom of this file being applied. `NaturaVista` still carries
the local original and is **outstanding work**: swapping it for the shared module
is an import change and a deletion, and it is the last duplicate of this one.

How to tell which you need, without guessing — compare the clip's first and last
frame:

```sh
ffmpeg -i clip.mp4 -frames:v 1 first.png
ffmpeg -ss "$(ffprobe -v error -show_entries format=duration -of csv=p=0 clip.mp4 | awk '{print $1-0.08}')" \
       -i clip.mp4 -frames:v 1 last.png
```

If they match, a plain `<video loop>` is enough and both of these are wasted
work. Aluma's hero fails that test badly — the mountain is inside cloud at frame
0 and clear at the end — which is why it is on `MD-02`.

---

## 6. Motion — `MO`

Eight primitives. Five of them are section-entrance wrappers doing nearly the
same job — the clearest duplication in the library.

| ID | Primitive | Source |
|---|---|---|
| `MO-01` | `FadeIn` — **shared**, `whileInView`, `as`/`delay`/`duration`/`x`/`y` | `shared/FadeIn.jsx` |
| `MO-02` | `Rise` — blur + lift, on mount | `Aster.jsx:72` |
| `MO-03` | `Reveal` — `whileInView` with a `-100px` margin so it lands in frame | `KnowItAll.jsx:53` |
| `MO-04` | `TimedFade` — CSS transition on a state flip, no motion components | `Vex.jsx:38` |
| `MO-05` | Variant tree — `staggerChildren` declared once, inherited | `Mindful.jsx:36` |
| `MO-06` | GSAP load timeline | `Coinwise.jsx:223` · `Basilico.jsx:310` · `MichaelSmith` hero |
| `MO-07` | CSS entrance ladder — fixed delays, no JS | `index.css:431` (`.hero-anim`), `:476` (`.anim-stagger`) — used by `Vortx`, `Lithos`, `NaturaVista` |
| `MO-08` | Text reveals | see below |

### `MO-08` text reveals

| Reveal | Source |
|---|---|
| `WordsPullUp` / `WordsPullUpMultiStyle` — **shared**, word stagger | `shared/WordsPullUp.jsx` |
| `BlurText` — **shared**, word-by-word blur-in, for type over video | `shared/BlurText.jsx` |
| `AnimatedText` — **shared**, scroll-linked per-character opacity | `shared/AnimatedText.jsx` |
| Character assembly on CSS `transitionDelay` | `Vex.jsx:83` |
| Hover text roll (duplicate label, translate -50%) | `Axion.jsx:78` |

`MO-04` and `MO-08`'s Vex entry exist for the same reason: 40-odd motion
components each bring their own animation loop, and a per-character
`transitionDelay` is one string per span. Reach for CSS when the count is high
and the animation is fire-once.

---

## 7. Scroll-linked — `SC`

Only five templates read scroll: `Jack`, `MichaelSmith`, `Outbox`, `Skyline`,
`Basilico`. **All five go through `useScrollFrame()`** — without it the window's
`scrollY` is a constant zero and every one of these silently dies.

| ID | Effect | Implementations |
|---|---|---|
| `SC-01` | Clip-path aperture — a circle opens one layer onto another | `Skyline.jsx:253` (300vh) |
| `SC-02` | Concentric scaling stage | `Outbox.jsx:193` (400vh, four discs) |
| `SC-03` | Stacking cards — each shrinks as the next covers it | `Jack.jsx:433` · `Outbox.jsx:364` |
| `SC-04` | Parallax columns at differing rates | `MichaelSmith.jsx:487` |
| `SC-05` | Parallax image behind a section | `Basilico.jsx:642` |
| `SC-06` | Infinite ticker / counter-sliding marquee | `Skyline.jsx:326` (framer) · `MichaelSmith.jsx:628` (GSAP) · `Jack.jsx:248` (scroll-driven) |

`SC-03` is built twice and the two are worth diffing before a third: Jack drives
card scale from section progress, Outbox gives each card a fixed quarter of its
section and a per-index scale ladder (`Outbox.jsx:364`).

`SC-06` is built three times, once per engine — framer `animate`, GSAP tween,
and scroll position. The scroll-driven one is the only one that reverses when
the user scrolls up.

**Pinning:** use `position: sticky`, not ScrollTrigger's `pin`. It works natively
inside the frame and is exactly `pin` with `pinSpacing: false`.

---

## 8. Grids and cards — `CD`

| ID | Layout | Implementations |
|---|---|---|
| `CD-01` | Expanding accordion gallery — hovered panel grows, siblings shrink | `Skyline.jsx:384` · `Outbox.jsx:395` |
| `CD-02` | Bento grid, mixed spans | `MichaelSmith.jsx:388` |
| `CD-03` | Product card grid — image, name, price, blurb | `Basilico.jsx:489` |
| `CD-04` | 2×2 service cards with a quarter-disc icon in the corner | `Skyline.jsx:349` |
| `CD-05` | Feature cards | `Prisma.jsx:181` |
| `CD-06` | Editorial masonry / asymmetric spans | `Basilico.jsx:852` |

`CD-01` is the second clear duplicate. Skyline animates `flexGrow` through
framer (`style={{ flexBasis: 0 }}` + `animate={{ flexGrow }}`); Outbox uses
Tailwind `flex-[4] md:flex-[5]` / `flex-[1]` with `transition-all`. The CSS one
is cheaper; the framer one composes with other motion values. Pick per case.

---

## 9. Atoms — `AT`

| ID | Atom | Implementations |
|---|---|---|
| `AT-01` | Logo mark (inline SVG) | `Adam.jsx:49` · `Axon.jsx:16` · `Lithos.jsx:137` · `Measured.jsx:41` · `Securify.jsx:32` · `Vortx.jsx:39` · `Verde.jsx:40` |
| `AT-02` | Eyebrow / section heading | `MichaelSmith.jsx:101` (`Eyebrow`), `:111` (`SectionHeader`) · `Basilico.jsx:409` (`SectionHeading`) · `KnowItAll.jsx:74` (`Accent`) |
| `AT-03` | Stat block | `Securify.jsx:51` · `MichaelSmith.jsx:605` · `Skyline.jsx` (`STATS`) · `Aster.jsx` (`STATS`) |
| `AT-04` | Buttons | `Jack.jsx:141`, `:159` · `Axion.jsx:94` (`RollButton`) · `Wandor.jsx:26` (`NavButton`) · `index.css:486` (`.btn-cut*`, octagonal) |
| `AT-05` | Social row | `Orbis.jsx:74` (`SocialButton`) · `shared/GlassHero.jsx` · `Skyline.jsx` (`SOCIALS`) — icons from `shared/BrandIcons.jsx` |
| `AT-06` | Badge / chip / pill | `Aster.jsx:138` · `Coinwise.jsx:169` · `Skyline.jsx:314` |
| `AT-07` | Scroll hint | `NaturaVista.jsx:421` (mouse pill, `.animate-scroll-dot`) · `Skyline.jsx:298` (bouncing chevron) · `MichaelSmith.jsx:379` (travelling rail) |

`AT-05` has a trap worth repeating from `README.md`: **lucide-react has no brand
icons.** Instagram, Twitter, GitHub, X, LinkedIn and Facebook live in
`shared/BrandIcons.jsx` and take the same `size` prop. A brief listing them as
lucide imports is describing something that does not exist.

---

## 10. Form controls — `FC`

**Rule: nothing in this folder ships a native form or media control.**

`<select>`, `<input type="date">` and `<video controls>` all hand rendering to
the operating system. A template that has agreed a typeface, a radius and a
palette loses all three the moment one of them opens — a macOS system menu in
the system font, Chrome's calendar in Chrome's accent colour, Safari's
translucent player slab ignoring the modal's radius. None of it is reachable
from a stylesheet, and it is different on every engine.

These replace them. All three are structure and behaviour only: `className`
dresses the trigger, `menuClassName` the popover, and `tone` (`'dark'` |
`'light'`) picks the hover and selected treatment.

| ID | Control | Source | Replaces |
|---|---|---|---|
| `FC-01` | `Select` — ARIA combobox/listbox | `shared/Select.jsx` | `<select>` |
| `FC-02` | `DateField` — month grid, `Intl`-localised | `shared/DateField.jsx` | `<input type="date">` |
| `FC-03` | `VideoPlayer` — scrubber, clock, mute, fullscreen | `shared/VideoPlayer.jsx` | `<video controls>` |
| `FC-04` | Hidden input behind a custom trigger | `Wandor.jsx:109` | `<input type="file">` |
| `FC-05` | `.ui-scroll` — thin `currentColor` scrollbar | `index.css` | default scrollbars in popovers |

Used by `Aluma` (`FC-01` ×3, `FC-02`), `Basilico` (`FC-01` ×2, `FC-02`), `Verde`
and `NaturaVista` (`FC-03`).

What replacing a native control actually costs — all of it re-implemented rather
than dropped, because the native versions had it:

- **Keyboard.** `FC-01`: Up/Down/Home/End, Enter and Space commit, Escape and
  Tab close, and printable characters type-ahead on a ~500ms buffer so "3 n"
  still finds "3 nights". `FC-02`: arrows by day and week, PageUp/PageDown by
  month, Home/End to the ends of the week. `FC-03`: Space/K, arrows to seek, M,
  F.
- **Screen readers.** Focus stays on the trigger and the active option is
  *pointed at* with `aria-activedescendant`, which is what a collapsed select
  sounds like. Moving real focus into the list would not.
- **Form submission.** Both fields carry a hidden input, so they submit under
  their `name` exactly as before — `FC-02` in ISO `yyyy-mm-dd`, built in local
  time, because `toISOString()` shifts the date across a UTC boundary.

Two traps this hit, both worth knowing before writing another one:

- **Do not wrap these in a `<label>`.** `<button>` is a labelable element, so the
  label forwards its click into the trigger and the popover toggles twice. Use a
  `div` with an id'd `<span>` and pass `aria-labelledby` — see `Field` in
  `Aluma.jsx` and `Basilico.jsx`.
- **`onMouseDown` must `preventDefault()` on every option.** Otherwise the press
  moves focus off the trigger, the blur closes the menu, and the click lands on
  nothing.

---

## 11. Overlays — `OV`

| ID | Overlay | Implementations |
|---|---|---|
| `OV-01` | Video modal — click-outside, Escape, pause and rewind on close | `Verde.jsx:167` · `NaturaVista.jsx:255` |
| `OV-02` | Content modal + scroll lock | `Basilico.jsx:427` (locks via `SH-01`'s `scroll` prop) |
| `OV-03` | Custom cursor dot, swells over clickables | `Basilico.jsx:189` |
| `OV-04` | Loading screen | `MichaelSmith.jsx:142` — the only one |
| `OV-05` | `Magnet` — **shared**, magnetic cursor-follow wrapper | `shared/Magnet.jsx` |

`OV-01` is the third clear duplicate: Verde and NaturaVista are near-identical
apart from chrome colour. If a third design needs one, extract it then.

`OV-03` and `MD-06` are both cursor-tracked and both avoid `setState` per frame —
`OV-03` writes to motion values, `MD-06` writes to `style.maskImage` through a
ref. Neither re-renders React on pointer move, and neither should be rewritten
to.

---

## 12. Footers — `FT`

Only three templates have one, so this is the thinnest shelf in the library.

| ID | Footer | Source |
|---|---|---|
| `FT-01` | Oversized CTA headline + link columns + social + bottom bar | `Skyline.jsx:506` |
| `FT-02` | Knockout text — video plays inside the letters | `Outbox.jsx:454` |
| `FT-03` | Contact block + newsletter capture | `Basilico.jsx:879` · `MichaelSmith.jsx:624` |

---

## 13. Scene — `SN`

| ID | Piece | Source |
|---|---|---|
| `SN-01` | `useThreeScene`, `useLatest` — renderer, mount, loop, resize, teardown | `src/hooks/useThreeScene.js` |
| `SN-02` | Five reference scenes | `src/screens/playground/` — `PodiumHud` (themed, three podium geometries), `ContentHub`, `NebulaField`, `VolumetricRelics`, `StarObservatory` |

Exactly one website template opens a GPU context, and it is not Three.js:
`Axion` runs a WebGPU shader stack from the `shaders` package, lazy-loaded via
`shared/ShaderBackdrop.jsx`. **That package is not free software** — read the
licence note in `Axion.jsx`'s header before shipping anything on it.

Two rules `SN-01` cannot enforce: never `setState` inside `frame`, and never
`Math.random()` during render.

---

## 14. CSS kit — `index.css`

Sixty-two classes. Which layer a class sits in is load-bearing — see "The
CSS-layer gotcha" in `README.md`.

| Group | Lines | Notes |
|---|---|---|
| `.type-*` font scopes (8) | `125–162` | **Unlayered on purpose** — they must outrank a bare `font-*` utility |
| `.font-*` escape hatches (10) | `187–239` | Must stay *below* the scopes; both score (0,1,0), so source order decides |
| `.liquid-glass`, `-dark`, `-strong` | `279–384` | In `@layer components`, so a call site can override with a utility |
| `.btn-cut`, `-border`, `-sm` | `486–545` | Octagonal clip-path; the outline variant fakes its border with a `::before` |
| `.noise-overlay`, `.bg-noise` | `255–264` | `feTurbulence` grain, coarse and fine |
| `.hero-anim` + `-reveal`/`-fade`/`-zoom` | `431–450` | Lithos entrance ladder |
| `.anim-stagger`, `.anim-fade` | `476–484` | Generic fade-up / fade-in |
| `.accent-gradient`, `.hero-heading` | `555`, `242` | Gradient fills |
| `.animate-scroll-down`, `-dot`, `-role-fade-in`, `-gradient-shift` | `591–627` | All dropped under `prefers-reduced-motion` |

Palette tokens carry a template prefix. The one exception is Wander Gear's
`gear-`, explained in `README.md`.

---

## Building something new

The assembly order that matches how these templates are actually shaped:

1. **`SH-01`** with a `.type-*` scope and a background — decide `scroll` now, it
   changes everything downstream.
2. **One `NV-*`**, plus an `MN-*` if it collapses.
3. **One `HR-*`** and its **`MD-*`** treatment. This is where the library is
   deepest; it is unlikely a new hero needs inventing.
4. **Sections** from `CD-*`, wrapped in one `MO-*` entrance chosen *once* and
   used throughout. Add `SC-*` only if the design is genuinely scroll-driven —
   five of 24 are.
5. **One `FT-*`**, or write one. This shelf is thin.
6. Any form or media control from `FC-*`. Never a bare `<select>`,
   `<input type="date">` or `<video controls>` — see that section for why.
7. Palette as prefixed `@theme` tokens, faces in `index.html` + a `.type-*`
   scope. Assets mirrored to `public/assets/<slug>/`; nothing hotlinks.
8. Register in `src/templates.js`.

Before writing a component, check this file for its ID. If the row already lists
two implementations, that is the signal to extract into `./shared` rather than
add a third — and to replace the row with the new module.

## Worked example

`Aluma` (`/website/aluma`) is the first template built this way rather than from
a brief, and it is the readable version of everything above: each of its
sections is commented with the ID it came from, so this file and that one can be
read side by side.

What it draws on: `SH-01` · `NV-02` + `MN-02` · `HR-01` with `MD-02`, `MD-07`,
`MO-08` and `AT-06`/`AT-07` · `MO-08` `AnimatedText` with `AT-03` · `SC-06` ·
`CD-01` · `CD-04` · `SC-05` · `CD-03` · `CD-06` · `FT-01` merged with `FT-03`.

It also does one thing no other template here does: **it holds no copy.** Every
string, media path, price and icon name is in `src/data/aluma.json`, imported at
build time. Icons are the one thing JSON cannot carry, so it stores lucide
*names* and the component resolves them through a table — an unknown name
renders nothing instead of throwing. That split is what makes the same component
re-skinnable into a different property without opening the JSX.
