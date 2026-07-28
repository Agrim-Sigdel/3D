{
  # Component Roadmap

What has to exist before an arbitrary website can be assembled here rather than
written from scratch.

Three files, three jobs:

| File | Answers |
|---|---|
| `README.md` | How do I add a template, and what will bite me? |
| `CATALOGUE.md` | What already exists, and where is it? |
| **`ROADMAP.md`** | **What is missing, and in what order?** |

Counted against the 25 templates in this folder as they stand. Every "copies"
figure and every `file:line` below is a real occurrence, not an estimate — the
point of the tiering is that Tier 1 needs no design work at all, because the
code has already been written two, three or four times.

**70 components outstanding**, on top of the 15 that already exist — 85 in
total. Most projects will never need all of them; see
[Minimum viable kit](#minimum-viable-kit) for the short path.

| Tier | | Count |
|---|---|---|
| 0 | Done | 15 |
| 1 | Extract — code already written 2–8× | 10 |
| 2 | Generalise — works, welded to one template | 14 |
| 3 | Sections that cannot be built at all | 12 |
| 4 | Primitives that do not exist | 28 |
| 5 | Infrastructure | 6 |

---

## Status

| | Meaning |
|---|---|
| ✅ | In `./shared`, ready to import |
| ♻️ | Written 2+ times already — extraction, not authoring |
| 🔧 | Written once, welded to its template — needs generalising |
| ⬜ | Does not exist anywhere in the library |

---

## Tier 0 — Done (15) ✅

`PageFrame` · `frameContext` · `FadeIn` · `WordsPullUp` · `AnimatedText` ·
`BlurText` · `Magnet` · `FadingVideo` · `CrossfadeVideo` · `GlassHero` ·
`ShaderBackdrop` · `BrandIcons` · `Select` · `DateField` · `VideoPlayer`

---

## Tier 1 — Extract, don't write (10) ♻️

Highest value per hour in the whole document: the code exists, it is proven, and
the only work is choosing the prop surface. Building `Aluma` pushed several of
these to a third and fourth copy.

| Component | Copies | Occurrences |
|---|---|---|
| `MobileMenu` | **8** | `Adam.jsx:97` · `Verde.jsx:130` · `Measured.jsx:55` · `Axion.jsx:208` · `Outbox.jsx:168` · `Skyline.jsx:201` · `Basilico.jsx:286` · `Aluma.jsx:199` |
| `SectionReveal` | **5** | `shared/FadeIn.jsx` · `Aster.jsx:72` (`Rise`) · `KnowItAll.jsx:53` (`Reveal`) · `Vex.jsx:38` (`TimedFade`) · `index.css` `.anim-stagger` |
| `Ticker` | **4** | `Skyline.jsx:326` · `MichaelSmith.jsx:624` · `Jack.jsx:248` · `Aluma.jsx:347` |
| `SectionHeading` | **4** | `MichaelSmith.jsx:111` · `Basilico.jsx:414` · `Aluma.jsx:104` · `KnowItAll.jsx:74` |
| `StatBlock` | **4** | `Securify.jsx:51` · `MichaelSmith.jsx:605` · `Skyline.jsx` · `Aster.jsx` |
| `ExpandingGallery` | **3** | `Skyline.jsx:384` · `Outbox.jsx:395` · `Aluma.jsx:382` |
| `StackingCards` | 2 | `Jack.jsx:465` · `Outbox.jsx:364` |
| `VideoModal` | 2 | `Verde.jsx:176` · `NaturaVista.jsx:263` |
| `TestimonialCarousel` | 2 | `Basilico.jsx:680` · `Aluma.jsx:638` |
| `CrossfadeVideo` migration | — | Already extracted; `NaturaVista.jsx:61` still holds the original local copy |

Three notes before starting:

- **`MobileMenu` is three mechanisms, not one.** Full-screen slide-over, an
  in-flow `grid-rows-[0fr]→[1fr]` collapse, and an absolute panel on
  opacity/translate. They fail differently — the collapse pushes content and
  animates to content height without measuring; the slide-over covers. Ship all
  three behind one `variant` prop rather than picking a winner.
- **`SectionReveal` has one variant that is deliberately not Framer Motion.**
  `Vex`'s `TimedFade` is a CSS transition on a state flip because 40-odd motion
  components each bring their own animation loop. Keep that path.
- **`ExpandingGallery` exists in two engines** — Skyline/Aluma animate `flexGrow`
  through Framer, Outbox uses CSS `flex-[n]` with `transition-all`. The CSS one
  is cheaper; the Framer one composes with other motion values.

---

## Tier 2 — Generalise (14) 🔧

Works, but welded to one template. This is the tier that turns "copy a file" into
"assemble a page".

**Structure:** `Navbar` (7 archetypes, `NV-01`…`NV-07`) · `Hero` (6 shells,
`HR-01`…`HR-06`) · `Footer` (3, `FT-01`…`FT-03`)

**Grids:** `BentoGrid` · `ProductCardGrid` · `IconCardGrid` · `MasonryGrid`

**Scroll:** `ClipPathReveal` · `ConcentricStage` · `ParallaxColumns` ·
`ParallaxImage`

**Effects:** `SpotlightMask` · `CustomCursor` · `LoadingScreen`

`Footer` is the thin shelf: **only 3 of 25 templates have one.** Anything
multi-section built here will be writing its own until this tier lands.

---

## Tier 3 — Sections that cannot currently be built (12) ⬜

Nothing in 25 templates does any of these.

`PricingTable` · `FAQ` · `TeamGrid` · `BlogIndex` · `ArticleLayout` ·
`ComparisonTable` · `ProcessTimeline` · `LogoWall` · `ContactBlock` ·
`CTABanner` · `AnimatedCounter` · `CaseStudyLayout`

Worth knowing:

- **`Wandor` and `Orbis` both ship a "FAQ" nav link pointing at a section that
  was never built** (`Wandor.jsx:28`, `Orbis.jsx:26`). That is this tier in
  miniature — the navigation already promises content the library cannot make.
- **`LogoWall` is not `Ticker`.** The scrolling variant exists four times; a
  static grid of client marks does not exist at all.
- **`AnimatedCounter`** — stat blocks exist in four templates and every one of
  them is a static string.

---

## Tier 4 — Primitives that do not exist (28) ⬜

### Interaction (11)

`Tabs` · `Accordion` · `Lightbox` · `Tooltip` · `Toast` · `Modal` (generic) ·
`Drawer` · `Pagination` · `Breadcrumbs` · `Search` · `FilterSort`

**There is no `Lightbox` anywhere in the library.** Across 25 templates and six
gallery sections, no image can be enlarged.

### Display (7)

`Avatar` · `Badge` · `Progress` · `Spinner` · `Skeleton` · `EmptyState` ·
`CookieBanner`

### Form (10)

Every one of these is owed the treatment in
[No native chrome](README.md#no-native-chrome) — a native `<input type="range">`
or `<input type="checkbox">` is the same defect as the `<select>` that rule was
written for.

`Checkbox` · `Radio` · `Switch` · `Slider` · `Combobox` (searchable) ·
`DateRangePicker` · `TimeField` · `QuantityStepper` · `FileDropzone` ·
`FormField` (label, hint, error, required)

**`DateRangePicker` is already blocking.** `Aluma`'s enquiry form asks for an
arrival date plus a "nights" dropdown rather than arrival + departure, because
the range picker does not exist. That is a missing component shaping the content
model, which is the wrong way round.

---

## Tier 5 — Infrastructure (6) ⬜

| Gap | Evidence | Severity |
|---|---|---|
| **Reduced motion is ignored by JS animation** | `prefers-reduced-motion` guards CSS keyframes only (`index.css`). **Zero** files use Framer's `useReducedMotion`; the single `matchMedia` call is Basilico's `pointer: fine` check. Every Framer and GSAP animation across 10+ templates runs regardless. | **Bug, not backlog** |
| Form submission | `preventDefault()` stubs in `Aluma` and `Basilico`. Nothing is ever sent. | High |
| Responsive images | 0 files use `srcset` or `sizes`; 8 use `loading="lazy"`. Suite images ship at 1400px to phones. | High |
| SEO / meta | Only `document.title`, via `PageFrame`. No description, canonical or OG tags. | Medium |
| Error boundary | None. One bad content field white-screens the page. | Medium |
| i18n | `Aluma` proves the JSON content split works; there is no locale switch on top of it. | Low |

Reduced motion is the one to treat as a defect. It has already shipped, it
affects users who have explicitly asked for less movement, and the fix is
roughly a hook and a ternary per animated component.

---

## Minimum viable kit

If the goal is "build ordinary marketing sites soon" rather than "complete the
catalogue", this is the short path — **≈15 items**:

1. **All of Tier 1** (10). Pure extraction, no design decisions.
2. **Five primitives from Tier 4**: `Modal`, `Accordion`, `Tabs`, `Lightbox`,
   `FormField`.

Those five are chosen because most of Tier 3 is built out of them rather than
being new work: `FAQ` *is* an `Accordion`, `Gallery` needs a `Lightbox`,
`PricingTable` needs `Tabs` for the monthly/yearly switch, and every form
section needs `FormField`. Ship these and Tier 3 becomes composition.

---

## Rules any new component must follow

Learned the hard way in this folder; all of them are expanded in `README.md`.

1. **No native chrome.** No `<select>`, `<input type="date">`, `<video controls>`
   or any other control the OS draws. See `CATALOGUE.md` section `FC`.
2. **Never wrap a custom control in `<label>`.** `<button>` is labelable, so the
   label forwards its click into the trigger and the popover toggles twice. Use
   a `div` + id'd `<span>` + `aria-labelledby`.
3. **Scroll-driven means `useScrollFrame()`.** The window never scrolls in this
   library; `useScroll` without `container` reads a constant zero.
4. **Never `setState` per frame.** Write per-frame values straight to the DOM —
   see `VideoPlayer`'s progress bar and `Lithos`'s spotlight.
5. **Style comes in as props.** `className` for the trigger, `menuClassName` for
   any popover, `tone` for dark/light. A shared component must not carry a
   template's palette.
6. **Extract on the second use, not the first.** A component with one caller is
   a component with one guess about its API. When a `CATALOGUE.md` row reaches
   two implementations, that is the signal — and update the row.


}

{
  Create a fullscreen cinematic hero section for a mindfulness/focus app called "Lumora" using React, Tailwind CSS, and Lucide React icons.

## Font

Use **Instrument Serif** (Google Fonts, italic for the logo). Load it in index.html:
```
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

Set `font-family: 'Instrument Serif', serif` on html/body. Use `system-ui, sans-serif` inline for body text (subtext, buttons, stats, video labels).

---

## Background Video Layer

Stack 4 fullscreen looping videos absolutely positioned. Only the active one has `opacity-100`; others have `opacity-0`. Transition opacity over 1000ms ease-in-out. Videos autoPlay, muted, loop, playsInline.

**Video URLs (in order):**
1. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4`
2. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4`
3. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4`
4. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4`

**Labels:** Golden Hour, Still Water, Deep Woods, Quiet Dawn

---

## Transparent PNG Overlay (z-index 1)

Place this image over the videos as an absolutely positioned overlay covering the full viewport:
```
https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png
```

Apply a continuous "train-bob" animation: translateY oscillates between 0 and -6px over 3s ease-in-out infinite, with a constant scale(1.03) to prevent edges from showing during the motion.

---

## Liquid Glass Effect (CSS class `.liquid-glass`)

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
```

With a `::before` pseudo-element for a subtle gradient border:
```css
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

---

## Content Layer (z-index 2) - Flex Column Full Height

### Navigation (top)
- Left: "Lumora" in white, italic, text-xl (sm:text-2xl)
- Right (desktop md+): A `.liquid-glass` pill containing nav links ("How It Works", "Features", "Pricing", "Community") in white/90 text-sm with hover to white, plus a solid white "Get Started" button at the end
- Right (mobile): A `.liquid-glass` rounded hamburger button using Lucide `Menu`/`X` icons with a crossfade rotation animation (300ms). The Menu icon rotates out 90deg and scales to 75%; the X icon rotates in from -90deg

### Mobile Menu Overlay (fixed, z-50)
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Centered fullscreen panel with staggered entrance (each link delays 50ms more: 100ms, 150ms, 200ms, 250ms, 300ms)
- Links: white text-3xl, translate-y-4 to 0 on open
- "Get Started" button at bottom with scale animation
- Cubic-bezier easing: `cubic-bezier(0.4,0,0.2,1)`, duration 500ms

### Hero Content (centered, below nav)
- **Badge**: `.liquid-glass` rounded-full pill with text "Over 10,000 minds already finding their clarity"
- **Heading**: "Clarity in an Endlessly / Noisy Universe" (line break after "Endlessly"). Sizes: text-4xl / sm:text-5xl / md:text-7xl / lg:text-[5.5rem], leading-[1.1], max-w-4xl
- **Subtext**: "Rise above the chaos of pings, infinite scrolling, and relentless demands. Discover how to protect your presence and create with intention." max-w-xl, leading-relaxed
- **Email Input**: `.liquid-glass` rounded-full pill containing a text input ("Your Best Email") and a solid white "Get Early Access" button. Max-width 320px on mobile, sm:max-w-sm
- **Video Switcher**: Row of 4 text buttons with labels. Active button has solid color + bottom border. Inactive buttons are 50% opacity with transparent border, hover to 80%

### Dark Mode for "Deep Woods" (3rd video, index 2)
When the 3rd video is active, all hero content (badge, heading, subtext, input, video switcher) transitions to dark color `#182C41` with 700ms duration. The navbar and bottom stats remain white always.

### Bottom Stats (pushed to bottom via flex-1 spacer)
- Row of stats separated by `|` dividers (hidden on mobile): "60+ Deep Sessions", "12,000+ Creators", "4.8 User Satisfaction", "Intentional-First Design"
- text-white/70, text-xs sm:text-sm, system-ui font

---

## Video Switching Logic
- Track `activeVideo` state (default 0) and `isTransitioning` boolean
- On click, if not already active and not mid-transition, set new active video and start a 1000ms cooldown (matching the CSS crossfade duration)
- During cooldown, ignore additional clicks

---

## Responsive Behavior
- Mobile: Smaller text sizes, tighter padding, hamburger nav, stats wrap naturally
- Tablet/Desktop: Larger heading, more padding, inline nav pill, stats with pipe separators

---

## Section Container
```html
<section className="relative w-full h-screen overflow-hidden bg-black">
```

Black background prevents flash before videos load. Everything is a single viewport-height section with no scroll.

---

That's the complete specification. The entire app lives in a single `App.tsx` component with the CSS in `index.css`.
}
{
  You are an expert Frontend Engineer tasked with building "PIXZEN", an elite, world-class futuristic AI agency website. The design must feature an ultra-clean monochrome editorial aesthetic, massive premium typography, fluid interactions (GSAP & Framer Motion), and cinematic storytelling.

## CORE TECH STACK
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (using CSS variables in `globals.css`)
- **Animations**: GSAP (ScrollTrigger), Framer Motion, CSS Keyframes
- **Scrolling**: Lenis Smooth Scrolling (`lenis`)
- **Icons**: Lucide React
- **Language**: TypeScript

## GLOBAL DESIGN SYSTEM
- **Typography**: "Satoshi" (via Fontshare CDN in layout.tsx). Use tight line-heights and massive letter spacing (`tracking-widest`) for labels.
- **Color Palette**:
  - Background (Light): `#F5F3EF` (Warm white)
  - Secondary Background: `#EAE7E1` (Soft gray)
  - Text Foreground: `#0A0A0A` (Pure black)
  - Muted Text: `#8E8E8E`
- **Global Texture**: Implement a persistent SVG fractal noise/grain overlay fixed across the entire site (opacity `0.03`, `mix-blend-multiply`).

## CORE FEATURES & SECTIONS (BUILD WITH 100% ACCURACY)

### 1. Global Setup & Smooth Scrolling
- Wrap the entire application in a Lenis smooth scrolling component (`lerp: 0.05`).
- Ensure all sections use a border-top separator (`border-border`).

### 2. Floating Navbar (`Navbar.tsx`)
- Fixed at the top, transparent on load, applying a backdrop blur (`backdrop-blur-md bg-background/80`) after 50px of scroll.
- **Left**: "PIXZEN" logo (tracking `0.2em`).
- **Center**: Hidden on mobile. Desktop links have a sleek scale-x hover underline animation.
- **Right**: "LET'S TALK" pill button.
- **Mobile Menu**: Include a hamburger menu that toggles a full-screen, fading background overlay containing large navigation links.

### 3. Hero Section (`Hero.tsx`)
- **Layout**: Center-aligned, minimalist typography covering the full screen (`min-h-screen`).
- **Background Texture**: Absolute `<video>` element (`hero_bg_animation_hand.mp4`) washed out with `opacity-[0.85]` and `mix-blend-luminosity`, covered by a custom CSS `radial-gradient` Halftone Dot pattern overlay to create a premium printed-ink aesthetic.
- **Typography**: A single-line massive `h1` (`90px+` on desktop). 
- **Interaction**: Implement a dynamic typing effect that seamlessly cycles through 3 phrases ("Building Tomorrow", "Shaping Futures", "Driving Growth") with a blinking cursor. Include a bouncing "Scroll Down" chevron at the bottom.

### 4. Trusted Brands (`TrustedBrands.tsx`)
- **Layout**: An Infinite Scrolling CSS Marquee spanning the full width.
- **Interaction**: The row of `lucide-react` icons and brand names continuously scrolls left. Default to `opacity-40 grayscale`, transitioning to full opacity and pausing the animation on hover. Include gradient edge fades.

### 5. Our Expertise (`Services.tsx`)
- **Layout**: Interactive List & Sticky Media Reveal. Shifted to a 12-column grid layout with a 5/7 split for desktop.
- **Interaction**: The left column contains a list of services. As the user hovers over a service title, the right column (a sticky `framer-motion` container) smoothly crossfades to reveal a corresponding high-res image and description text.

### 6. Selected Work (`FeaturedWork.tsx`)
- **Layout**: Premium Sticky Stacking Cards. A centered deck of massive, full-bleed project cards.
- **Scroll Interaction**: As the user scrolls down, each card pins to the top of the screen (`position: sticky`). Using `framer-motion`'s `useScroll`, cards subtly scale down in the background as subsequent cards layer over them, enhancing depth.
- **Click Interaction**: Include a Case Study Modal. Clicking "View Case" slides up a beautifully animated `framer-motion` overlay containing project details, locking the background scroll.

### 7. About Vision & Marquee (`About.tsx`)
- **Scroll Reveal Text**: A massive manifesto text block. Use `SplitType` and GSAP `ScrollTrigger` with `scrub: 1` to highlight the words one by one as the user scrolls down the section.
- **Marquee**: A pure CSS infinite scrolling marquee below the text spanning the full width with massive uppercase brand values ("ARTIFICIAL INTELLIGENCE — BRAND STRATEGY...").

### 8. Insights (`Insights.tsx`)
- Clean, editorial table-like rows featuring category, title, date, and an arrow icon.
- **Interaction (CRITICAL)**: Implement a custom "Cursor Image Reveal". Create an absolute `next/image` thumbnail that is completely hidden by default. When the user hovers over a specific article row, the thumbnail must smoothly scale up and use `gsap.to` to physically follow their mouse cursor coordinates across the screen.

### 9. Contact / Sticky Footer (`Contact.tsx`)
- **Design**: Massive centered typography: "Let's Build The Future." with `mix-blend-difference` if overlaid on gradients. Add animated background gradients (`animate-pulse`, `blur-3xl`).
- **Interaction**: A pill button ("Start a Project") wrapped in a custom Magnetic Button effect. Use mouse coordinates and `gsap.to` to pull the button slightly towards the user's cursor when they hover nearby, snapping back via `elastic.out` when they leave.

### 10. Footer (`Footer.tsx`)
- Ultra minimal, multi-column directory footer. Clean borders, small muted typography, referencing "PIXZEN" and "hello@pixzen.ai".

## STRICT DEVELOPMENT RULES
- Do not use generic startup templates. This must feel like a premium, Awwwards-winning luxury digital agency.
- All animations must use `power4.out` or similar easing for premium buttery smoothness.
- Absolutely NO `any` types in TypeScript.
- Build fully responsive (stack to single columns on mobile).
- Ensure `globals.css` properly wires Tailwind v4 themes without needing a separate `tailwind.config.ts`.

}
{

  # Luxury Watch Maison — Detailed Technical & Design Specification Prompt

This prompt serves as a complete blueprint to recreate the luxury watch website (e.g., "Maison Horlogerie"). Use these exact specifications to recreate the design, animations, and frontend architecture flawlessly.

## 1. Project Overview & Tech Stack
- **Framework:** React 18+ via Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v3) + PostCSS
- **Animation Engine:** GSAP (Core + ScrollTrigger) & Framer Motion
- **Smooth Scrolling:** Lenis (`lenis` package)
- **Icons:** `lucide-react`
- **Architecture:** Single-page scroll application featuring complex pinned horizontal/vertical scroll interactions, background morphs, and parallax effects.

## 2. Visual Design System

### Typography
- **Primary Font (Headings/Display):** `Bodoni Moda` (Serif)
  - Usage: Massive section titles, Collection Names, Key Headings.
  - Weights: `700` (Bold) to `900` (Black).
- **Secondary Font (Body/Labels):** `Inter` (Sans-Serif)
  - Usage: Subtitles, Navigation, Body copy, Specs, Buttons.
  - Weights: `300` (Light) for body text, `700` (Bold) for subtitles and buttons.

### Color Palette
- **Base Backgrounds:** Pure Black (`#000000`) and Deep Charcoal (`#050505`).
- **Text:** White (`#FFFFFF`) with opacities (`/40`, `/60`, `/70`, `/80`) for visual hierarchy.
- **Accents:** Amber/Gold (`#F59E0B` or `amber-500`) for vintage/heritage elements.

**Dynamic Collection Colors (Tailwind Config):**
```javascript
colors: {
  aura: { light: '#3B82F6', mid: '#0F172A', dark: '#020617' },
  elixir: { light: '#FDE68A', mid: '#D4A017', dark: '#2D1B0E' },
  verdant: { light: '#86EFAC', mid: '#14532D', dark: '#02110A' },
  rose: { light: '#F9A8D4', mid: '#EC4899', dark: '#4A044E' }
}
```

## 3. Core Architecture & Global Setup

### Lenis Smooth Scroll
Initialize Lenis at the `App` root with GSAP ticker integration:
- `duration: 1.2`
- `easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`
- `smoothWheel: true`

### Navigation (`Navbar.tsx`)
- **State:** Fixed top layer (`z-50`).
- **Scroll Behavior:** Transitions from transparent to glassmorphism (`bg-white/5 backdrop-blur-md border-b border-white/10`) when scrolled past 50px.

## 4. Section-by-Section Specifications

### Section 1: Hero / Home (`Home.tsx`)
- **Layout:** `h-screen` `w-full` flex-centered.
- **Background:** Full-screen looping video (`hero_bg_watch.mp4`) with a linear gradient overlay (`from-black/80 via-black/40 to-black`).
- **Typography:** 
  - Subtitle: "The Pinnacle of Swiss Watchmaking" (Inter, text-sm, tracking-[0.4em], text-white/60).
  - Title: "Time Is An Art" (Bodoni Moda, massive 5xl to 9xl, flex-col stacked).
- **Animations (GSAP):**
  - Titles fade and slide up (`y: 100`, `opacity: 0` to `y: 0`, `opacity: 1`) staggered.
  - Parallax: The entire container scales down (`scale: 0.85`) and fades out on scroll via ScrollTrigger.

### Section 2: Collections Showcase (`CollectionsShowcase.tsx`)
- **Layout:** Pinned full-screen layout. ScrollTrigger pins the container for `+=1200px` to allow scrolling through 4 collections.
- **Mechanism:** As the user scrolls, `self.progress` maps to an `activeIndex` (0 to 3), triggering Framer Motion `AnimatePresence` swaps.
- **Left Column:** Collection Number, Name (Bodoni), Headline (Inter), Button.
- **Center Column:** Massive absolute centered image of the watch (height up to 90%), dropping in with `y: "100%", opacity: 0` and easing out.
- **Right Column:** Description and a 2x2 grid of specs (Movement, Power Reserve, Case Material, Water Resistance).
- **Background Morph & Particles:** A dynamic background div transitions colors based on the active index, overlaying floating particle SVGs (stars, gold dust, etc.).

**Collections Data:**
1. **ROYAL OCEAN** (Blue/Aura) — "Precision Beyond The Horizon"
2. **SAHARA HERITAGE** (Gold/Elixir) — "Timeless As The Desert Winds"
3. **ROSE ELEGANCE** (Rose/Rose) — "Luxury Worn Like Jewelry"
4. **NOIR CRIMSON** (Red) — "Built For Passion And Power"

### Section 3: Heritage (`Heritage.tsx`)
- **Layout:** Asymmetrical side-by-side flexbox. `bg-[#050505]`.
- **Left Side (Image):** A 50vh-80vh tall container with an `inset` clip-path mask reveal. Contains an image (`heritage.png`) with `grayscale` and `mix-blend-luminosity`. Parallax `y: "20%"` on scroll.
- **Right Side (Text):** 
  - Eyebrow: "Since 1884" (Amber/Gold tracking-wide).
  - Heading: "A Legacy of Perfection" (Bodoni).
  - Paragraph: Explaining the history.
  - Staggered GSAP reveal for all text elements.

### Section 4: Craftsmanship (`Craftsmanship.tsx`)
- **Layout:** High-height section (`150vh`) relying on `sticky top-0 h-screen` to keep content in frame while scrolling.
- **Background Layer:** Macro shot of watch gears (`craftsmanship.png`) scaling up and moving `y: "20%"` via GSAP scrub. Includes a rotating dashed border element (`animate-[spin_120s_linear_infinite]`) to simulate clockwork.
- **Foreground Text:** Center-aligned "Unseen Precision" that fades in at `start: "top 60%"` and fades out at `start: "bottom 80%"` using ScrollTrigger scrub.

### Section 5: Gallery (`Gallery.tsx`)
- **Layout:** Horizontal scroll section powered by GSAP. A standard `h-screen` container pinned using `ScrollTrigger`, containing a flex container that moves left (`x: -totalWidth`) based on scrub.
- **Velocity Skew Effect:** Implemented via `ScrollTrigger` and a `gsap.quickSetter` that applies `skewX` to `.gallery-item` based on scroll velocity (clamped between -15 and 15 degrees).
- **Fullscreen Modal:** Clicking an image opens a modal using Framer Motion `AnimatePresence`. The modal features left/right navigation arrows, a prominent close button, and a borderless image display with descriptive text beneath it.

### Section 6: Contact & Footer (`Contact.tsx`)
- **Animations:** Uses `framer-motion` combined with `useInView` from `react-intersection-observer` (threshold 0.3) for smooth `y: 30` fade-ins of form sections.
- **Form Layout:** Dark luxury aesthetic featuring transparent inputs with `border-b border-white/20`. Includes Name, Email, and Boutique Location (Geneva, Paris, New York, Tokyo) dropdown.
- **Footer:** A simple flex row displaying "Maison", social links (Instagram, Journal, Legal), and copyright text.

## 5. Animations & Micro-interactions
- **Custom Cursor:** Implement a custom fixed DOM element tracking mouse position with spring physics or GSAP `quickTo`, blending into the black background.
- **Buttons:** Pill-shaped, transparent borders (`border-white/20`), on hover transition to white background with black text and scale `1.05`.
- **Stagger & Masks:** Rely heavily on GSAP `clip-path: inset(...)` for image reveals, and `y: 50, opacity: 0` for text stagger.

## 6. Asset Specifications

Ensure 100% accuracy for the following video and image sources used throughout the site:

**Hero/Home Video (Background):**
- `https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_bg_watch.mp4`

**Collection Watches (Massive center images):**
1. Royal Ocean (Blue): `https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_blue.png`
2. Sahara Heritage (Gold): `https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_desert.png`
3. Rose Elegance (Rose): `https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_rose.png`
4. Noir Crimson (Red): `https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/watch_sensual.png`

**Static Local Images (Placed in `/public/images/`):**
- Heritage Image: `/images/heritage.png` (Used as the masked reveal background)
- Craftsmanship Image: `/images/craftsmanship.png` (Macro watch movement used for parallax background)
- Gallery Items:
  - `/images/gallery1.png`
  - `/images/gallery2.png`
  - `/images/gallery3.png`
  - `/images/gallery4.png`
  - `/images/gallery5.png`

## 7. Performance & Optimization
- **Lenis + GSAP:** Ensure `gsap.ticker.lagSmoothing(0)` and register `lenis.raf(time * 1000)` into the GSAP ticker to prevent jitter.
- **Images/Videos:** Use WebP format and compressed `.mp4`. Implement `pointer-events-none` on background overlays and particles to avoid repaints during scroll.
- **State Updates:** Inside the Pinned Collection section, wrap the `ScrollTrigger.create` `onUpdate` index change in a ref check to prevent unnecessary React renders on every pixel scroll.

## 8. Responsive Behavior
- Heavily utilize Tailwind's `md:` and `lg:` prefixes.
- On mobile: Collections Showcase stacks vertically (Image first, text below), particle counts are reduced, font sizes drop from `text-8xl` down to `text-5xl`. Parallax values are minimized to preserve layout stability on touch devices.

}

{

  # Wanderly - Premium Cinematic Travel Website Specification

**Description:** A cinematic travel website featuring an animated video hero and premium glassmorphism design.

This document serves as a comprehensive, production-ready specification to recreate the "Wanderly" travel and adventure website. It contains exact technical, visual, and architectural requirements.

## 1. Tech Stack & Architecture
- **Framework:** React 18+ with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (utility-first, responsive)
- **Animation:** Framer Motion (page transitions, scroll animations, micro-interactions)
- **Icons:** Lucide React (feather-style clean SVG icons)
- **Routing:** Single-page smooth scrolling anchor links.

## 2. Global Design System
### 2.1 Color Palette
- **Primary Dark (Backgrounds & Footer):** `#0A1A14` (Deep, rich forest green/black)
- **Primary Brand (Buttons, Accents):** `#1A4F36` (Emerald Green)
- **Primary Brand Hover:** `#226244` (Lighter Emerald)
- **Accent/Highlight:** `#FFC857` (Golden Yellow)
- **Background Light 1:** `#FFFFFF` (Pure White)
- **Background Light 2:** `#FAFAFA` (Off-white, used for alternating sections)
- **Background Light 3:** `#F9FAFB` (Tailwind `gray-50`)
- **Text Dark:** `#111827` (Tailwind `gray-900`)
- **Text Muted:** `#4B5563` (Tailwind `gray-600`) or `#6B7280` (`gray-500`)

### 2.2 Typography
- **Primary Font Family:** `Inter`, sans-serif
- **Headings (h1):** `font-bold`, `tracking-tight`, `leading-[1.05]`. Hero text uses sizes up to `88px` on large screens.
- **Section Headings (h2):** `font-bold`, `tracking-tight`, size `4xl` to `5xl`.
- **Body Text:** `font-light` to `font-normal`, `leading-relaxed`, size `lg` to `xl`.
- **Overline/Labels:** `uppercase`, `tracking-wider`, `text-xs` to `text-sm`, `font-semibold`.

### 2.3 Glassmorphism (Liquid Glass) Theme
Extensively used across the UI for overlays, cards, and navigation.
- **Base Glass:** `bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl`
- **Dark Glass (Nav):** `bg-black/40 backdrop-blur-md`
- **Text on Glass:** `text-white` for primary, `text-white/70` for secondary.

## 3. Section-by-Section Implementation Details

### 3.1 Global Navigation (`Navbar.tsx`)
- **Layout:** Fixed at top, `z-50`, max-width `7xl`, flex between.
- **Scroll Behavior:** Initially transparent with `py-6`. On scroll (>50px), morphs to `bg-black/40 backdrop-blur-md py-4` via Framer Motion.
- **Links:** Smooth scroll anchor links (`#destinations`, `#experiences`, etc.). Hover effects utilize a 0-width to full-width absolute white underline (`span`).
- **Mobile Menu:** Full-screen `bg-black/95 backdrop-blur-xl`, toggleable via Hamburger/X icon. Links stagger fade-in using `AnimatePresence`.

### 3.2 Hero Section (`Hero.tsx`)
- **Layout:** `h-[100vh] min-h-[700px]`, `flex items-center justify-center`.
- **Background:** Autoplaying, muted, looping, inline video (`object-cover`). Contains layered gradient overlays (`bg-gradient-to-r from-black/80` and `bg-gradient-to-t from-black/60`).
- **Scroll Parallax:** Video `y` position shifts `0%` to `20%` on scroll down. Entire Hero content `opacity` fades `1` to `0` using `useScroll` and `useTransform`.
- **Content:** Center aligned. 
  - Overline label: Plane icon + "Explore the World" in Golden Yellow `#FFC857`.
  - Main Title: "Journey Beyond the Ordinary" split into words, staggered fade-up animation.
  - Buttons: Solid Emerald button (`#1A4F36`) and a Glass Outline play button with a pinging border animation on hover.

### 3.3 Feature Grid (`FeatureCard.tsx`)
- **Layout:** Dedicated section immediately following Hero with `bg-[#0A1A14]` to seamlessly blend.
- **Card Design:** Single max-width glassmorphic card (`bg-white/10 backdrop-blur-md border border-white/20`) containing a 4-column grid.
- **Items:** 4 features (Handpicked Destinations, Unique Experiences, Trusted & Safe, 24/7 Support). Each has a glassmorphic circular icon container (`bg-white/10 border-white/20` with `#FFC857` icon) and white/translucent text. Hovering an item bumps it up (`y: -5`).

### 3.4 Destinations (`Destinations.tsx`)
- **Layout:** `bg-white` background, top/bottom padding 24/32. Bento-box CSS grid (`auto-rows-[300px]`).
- **Cards:** Relative containers with `overflow-hidden` and `rounded-[24px]`.
  - Image fills container (`object-cover`) and scales up `scale-110` on hover (duration `700ms`).
  - Dark gradient overlay intensifies on hover (`bg-black/20` to `bg-black/40`).
  - Text contents sit at bottom, translating up on hover to reveal description text.
- **Interactivity (Modal):** Clicking a card sets a `selectedDestination` state. Triggers a full-screen `AnimatePresence` modal:
  - **Backdrop:** `bg-black/60 backdrop-blur-sm`.
  - **Modal Card:** Spring animation (`type: "spring", damping: 25, stiffness: 300`), split 50/50 layout (image left, content right). Includes a "Book Now" CTA and close icon.

### 3.5 Experiences (`Experiences.tsx`)
- **Layout:** `bg-[#FAFAFA]`, 2-column grid.
- **Left Column:** Tall image (`h-[600px]`, `rounded-[32px]`). Contains a floating glassmorphic badge positioned `bottom-8 left-8 right-8` with an icon, title, and subtitle.
- **Right Column:** Text content, bullet points with circular emerald background icons, and a text-link CTA that expands arrow spacing on hover.

### 3.6 About/Brand Story (`About.tsx`)
- **Layout:** `bg-white`, centered minimal text block followed by a massive `h-[700px]` wide cinematic image container.
- **Image Container:** Has an absolute centered glassmorphic card (`bg-white/10 backdrop-blur-xl border border-white/20`) carrying the brand promise.

### 3.7 Plan My Trip (`PlanMyTrip.tsx`)
- **Layout:** Sits on a dark card (`bg-[#0A1A14]`) with a subtle, low-opacity (`20%`) airplane wing image background.
- **Form UI:** Glassmorphic wrapper (`bg-white/10 backdrop-blur-md`). 3 inline input fields (Destination, Dates, Guests) each wrapped in `bg-white/5` with Lucide icons.
- **CTA:** Bright Golden Yellow `#FFC857` submit button.

### 3.8 Travel Stories / Blog (`Blog.tsx`)
- **Layout:** `bg-[#FAFAFA]`, 3-column grid for latest articles.
- **Card Design:** Large image block (with hover `scale-105`), category in uppercase Emerald green, grey date, and bold 2-line clamped title.

### 3.9 Footer & Contact (`Contact.tsx` & `Footer.tsx`)
- **Contact Section:** `bg-[#FAFAFA]`. 2-column. Left side contains hover-interactive contact details (Mail, Phone, MapPin). Right side is a raised white card (`shadow-2xl`) containing a comprehensive inquiry form (Name, Email, Subject, Message, Send Button).
- **Footer Section:** `bg-[#0A1A14]`. 4-column layout (Brand + Newsletter, Nav Links, Contact Text). Newsletter input is a glass pill shape. Social links (Instagram, Twitter, Facebook) are bold, uppercase text links rather than icons.

## 4. Animation & Interaction Standards
- **Scroll Animations:** All new sections must utilize `<motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} />` to fade and slide up as they enter the viewport. Stagger children where applicable.
- **Hover States:** Buttons scale `1.02` on hover, `0.98` on tap. Icons inside CTA buttons translate right `translate-x-1`. Images inside cards zoom in slowly (`duration-700`).
- **Easing:** Default ease curve for primary transitions is `[0.16, 1, 0.3, 1]` (custom sleek decelerating curve).

## 5. Global CSS Requirements (`index.css`)
- Must include Tailwind directives.
- Must include `html { scroll-behavior: smooth; }` to ensure all anchor links glide smoothly.
- Optional base layer utility `.glass-card { @apply bg-white/10 backdrop-blur-md border border-white/20 shadow-lg; }`.

## 6. Development Workflow
1. Initialize Vite React TS project.
2. Install `framer-motion`, `lucide-react`, `tailwindcss`.
3. Configure `tailwind.config.js` to use `Inter` font.
4. Build bottom-up: generic UI -> complex sections -> wire up in `App.tsx`.

}