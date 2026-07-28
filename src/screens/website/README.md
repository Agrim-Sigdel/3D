# 3D Website

Full single-page sites — a scene with an actual site built on top of it, as
opposed to the scene-only experiments in `../playground`.

Twenty-five designs live here. All but one are video- and motion-driven rather
than WebGL, and none opens a Three.js context — they are in this category
because they are complete sites, not because they have a scene. A design that
*does* want a scene should follow "Building the scene" below.

The exception is `Axion`, whose backdrop is a live WebGPU shader stack from the
`shaders` package. **That package is not free software**: personal, evaluation
and non-commercial use only, with any public-facing deployment, client work or
internal tool needing a paid seat. It is the one dependency in this repo with
that restriction, and `Axion.jsx` is the only file importing it — see the
licence note in its header before shipping anything built on this library.

`CATALOGUE.md` next to this file indexes what is already built — every nav,
hero, scroll effect, card grid and motion primitive across these designs, with
the file and line to read. Check it before writing a component from scratch.
`Aluma` is the worked example: a site assembled entirely from that index, whose
copy lives in `src/data/aluma.json` rather than in the component. `ROADMAP.md`
is the inverse — what is still missing, tiered by how much work each item is.

## Adding one

1. Drop the component in this folder, e.g. `Aurora.jsx`. Default-export a
   component that renders a full-viewport page — wrap it in `./shared/PageFrame`
   rather than hand-rolling `fixed inset-0`, so it picks up the title handling
   and the scroll container described below.

2. Register it in `src/templates.js` under the `website` category:

   ```js
   import Aurora from './screens/website/Aurora.jsx';

   // ...inside the website category's items array:
   {
       slug: 'aurora',
       name: 'Aurora',
       tagline: 'One line describing the design',
       accent: '#a78bfa',
       component: Aurora,
   }
   ```

   It appears at `/website/aurora` and on the index page automatically.

## Building the scene

Use `useThreeScene` — it owns the renderer, canvas mount, resize handling, the
animation loop and teardown, so a template only describes its own scene:

```jsx
import * as THREE from 'three';
import { useThreeScene, useLatest } from '../../hooks/useThreeScene.js';

export default function Aurora() {
    const [activeIdx, setActiveIdx] = useState(0);

    // Mirror state the loop needs to read. Putting activeIdx in `deps` instead
    // would rebuild the entire scene on every change.
    const state = useLatest({ activeIdx });

    const mountRef = useThreeScene(({ scene, camera }) => {
        camera.position.set(0, 0, 20);
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));

        const mesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(4, 1),
            new THREE.MeshStandardMaterial({ color: 0xa78bfa })
        );
        scene.add(mesh);

        const onMove = e => { /* ... */ };
        window.addEventListener('mousemove', onMove);

        return {
            frame: ({ time, delta }) => {
                mesh.rotation.y += delta;
                // return false to skip the draw this tick
            },
            resize: ({ width }) => { /* layout that depends on viewport */ },
            dispose: () => window.removeEventListener('mousemove', onMove),
        };
    }, { background: 0x08080b, cameraFov: 50 }, []);

    return <div className="fixed inset-0"><div ref={mountRef} className="absolute inset-0" /></div>;
}
```

Options: `background`, `alpha`, `antialias`, `powerPreference`,
`maxPixelRatio`, `cameraFov`, `cameraNear`, `cameraFar`, `toneMapping`,
`toneMappingExposure`.

The hook exists because each of these was a real bug in the playground screens:
a canvas and a live `requestAnimationFrame` loop leaked per interaction, GPU
buffers were never freed, and cleanup read a ref React had already cleared.
Going through the hook means you cannot reintroduce them.

Two rules it can't enforce for you:

- **Never call `setState` inside `frame`** — that re-renders at 60fps. Write
  per-frame values straight to the DOM (see how `NebulaField` positions its
  labels).
- **Never call `Math.random()` during render** — React 19 flags it, and values
  visibly flicker. Roll them once at module scope.

## What to reuse

- `./shared/PageFrame.jsx` — the full-viewport frame. Sets `document.title` and
  publishes its scrolling element on a context (see the scroll note below). Pass
  `scroll={false}` for a design that must not move.
- `./shared/FadeIn.jsx` — `whileInView` enter animation, with `as` / `delay` /
  `duration` / `x` / `y`.
- `./shared/WordsPullUp.jsx` — word-by-word pull-up reveal. The named
  `WordsPullUpMultiStyle` export takes `[{ text, className, newLine }]` for
  headings that change style mid-sentence.
- `./shared/AnimatedText.jsx` — scroll-linked per-character opacity reveal.
- `./shared/BlurText.jsx` — word-by-word blur-in, for headings over video.
- `./shared/Magnet.jsx` — magnetic cursor-follow wrapper.
- `./shared/FadingVideo.jsx` — a looping background video that crossfades
  through black at its loop point instead of cutting. Use it in place of a bare
  `<video loop>` on any clip whose first and last frames differ.
- `./shared/CrossfadeVideo.jsx` — the same problem where the frame must never go
  dark: two copies of the clip crossfading into each other rather than dipping
  through black, at the cost of decoding the file twice. `Aluma`'s hero uses it;
  `NaturaVista` still has a local copy predating the extraction.
- `./shared/Select.jsx`, `./shared/DateField.jsx`, `./shared/VideoPlayer.jsx` —
  the form and media controls. **Use these, never the native ones** — see "No
  native chrome" below.
- `./shared/BrandIcons.jsx` — Instagram, Twitter, GitHub, X, LinkedIn, Facebook.
  lucide dropped its brand set, so **those names do not exist in lucide-react**;
  a spec that lists them as lucide imports needs these instead. The three stroke
  ones are redrawn in lucide's 24×24 style and take the same `size` prop.
- `./shared/GlassHero.jsx` — the Asme newsletter hero, shared by two templates
  whose briefs describe the same screen with different headlines.
- `./shared/ShaderBackdrop.jsx` — Axion's WebGPU background, kept in its own
  module so it can be `React.lazy`-loaded (see "Weight" below).
- `../BackButton` — the corner back control every screen carries. Takes `fixed`
  (use it on anything that scrolls, or the control scrolls away with the
  content) and `top` / `left` to dodge a template's own chrome.
- `../../data/portfolio.js` — bio, roles, stack, projects. Import real content
  from here rather than retyping it; keep invented flavour text local to the
  component. A design built around a fictional persona (Jack, Prisma's Marcus
  Chen) keeps its own copy instead of bending the real bio to fit.

## The scroll gotcha

Templates are `position: fixed`, so **the window never scrolls** — its
`scrollY` is always 0. Anything scroll-driven has to measure the frame:

- Framer Motion: `useScroll({ target, container: useScrollFrame() })`. Without
  `container` the progress value sits at 0 and nothing animates.
- Hand-rolled maths: read `getBoundingClientRect()` / `scrollTop` against the
  frame element and listen for `scroll` on it, not on `window`.
- `useInView` needs nothing special — it observes the viewport, which the frame
  fills exactly.

`useScrollFrame` comes from `./shared/frameContext.js`, kept separate from
`PageFrame.jsx` so that file only exports a component and stays fast-refreshable.

Two more things this catches out:

- **GSAP ScrollTrigger** defaults its `scroller` to the document, so every
  trigger on a page would need rewiring to the frame. `Basilico` and `Coinwise`
  both use GSAP, but only for timelines that run on *time* — a load sequence, a
  yoyo float. Anything that runs on scroll uses Framer Motion instead.
- **Locking scroll for a modal** is not `document.body.style.overflow` — the
  body has nothing to lock. `PageFrame` already takes `scroll`, so pass
  `scroll={!isOpen}` (see `Basilico`) and let it own the property.

## No native chrome

`<select>`, `<input type="date">` and `<video controls>` hand their rendering to
the operating system, and no stylesheet can reach any of it. A macOS select
opens a system menu in the system font; Chrome's date input draws a calendar in
Chrome's accent colour and shows a `dd/mm/yyyy` placeholder that cannot be
replaced; Safari's video bar floats a translucent slab straight through the
radius of whatever contains it. Every engine does something different. Once a
template has agreed a typeface, a radius and a palette, these are the one place
all three are lost.

So none of them appear in this folder. Use `./shared/Select.jsx`,
`./shared/DateField.jsx` and `./shared/VideoPlayer.jsx`, which are structure and
behaviour only — `className` dresses the trigger, `menuClassName` the popover,
`tone` picks dark or light. A file input is fine as long as it is `hidden` with
a real button in front of it, the way `Wandor` does it.

Two things that bite when writing another one:

- **Never wrap one in a `<label>`.** `<button>` is a labelable element, so the
  label forwards its click into the trigger and the popover opens and shuts in
  the same gesture. Use a `div` with an id'd `<span>` and `aria-labelledby`.
- **Options need `onMouseDown` → `preventDefault()`.** Without it the press pulls
  focus off the trigger, the blur closes the menu, and the click lands on
  nothing.

`CATALOGUE.md` section `FC` lists them, including what re-implementing a native
control actually costs — the keyboard map, `aria-activedescendant`, and the
hidden input that keeps the field submitting under its `name`.

## The CSS-layer gotcha

Tailwind 4 puts its utilities in a cascade layer, and **an unlayered rule beats
every layered one regardless of specificity**. That cuts both ways in
`src/index.css`, so the file is deliberately split:

- The `.type-*` font scopes and the `.font-*` escape hatches stay **unlayered**,
  because they have to outrank a bare `font-*` utility. That is the whole point
  of them.
- The `.liquid-glass*` classes sit **inside `@layer components`**, because they
  set properties call sites routinely override with a utility. Unlayered, this
  class silently won every one of those fights: `position: relative` beat
  `absolute` (an overlay bar ended up in normal flow at the top of its card),
  `border: none` beat `border-white/20`, and the flat `background` beat
  `hover:bg-white/10`, so those hovers did nothing.

Rule of thumb: a class that exists to *win* goes unlayered; a class meant as a
starting point you then adjust with utilities goes in `@layer components`.

## Weight

The entry chunk is shared by the index page and all twenty-odd templates, so a
heavy dependency used by exactly one screen does not belong in it. The `shaders`
engine is ~680 kB minified — more than half the rest of the bundle — and is
loaded through `React.lazy` for that reason, which splits it into a chunk fetched
only when Axion mounts. Its hero paints a static gradient underneath the canvas
unconditionally, so there is nothing to see during the fetch and nothing to
detect on a browser without WebGPU.

Anything else this size should get the same treatment.

## Fonts

Faces load in `index.html` and are declared as `@theme` tokens in
`src/index.css`. Because this is one document rather than twenty-odd standalone
apps, a global `* { font-family }` reset would leak across templates — each
design instead puts a `.type-*` scope class on its root wrapper (`.type-kanit`,
`.type-almarai`, …). Those scopes deliberately use `* { }` so buttons and inputs
inherit, which also means they outrank a bare Tailwind `font-*` utility;
`.font-serif-accent`, `.font-pixel`, `.font-playfair` and the rest exist to
climb back out, and must stay *below* the scopes in the file — both score
(0,1,0), so source order is what decides.

One face is not from Google: **basis33**, the bitmap type Adam Roberts is built
on, is self-hosted from `public/assets/fonts` via an `@font-face`. Its only
distributor is a third-party font CDN, and loading a stylesheet from one at
runtime is a dependency this library does not need.

Tailwind 4 has no per-file config, so palette tokens carry their template's
prefix (`--color-wandor-dark`, `--color-prisma-primary`) instead of taking a
generic name every other screen in the library would also see.

The one prefix that does not match its template is Wander Gear's, which is
`gear-`. `wandor` and `--color-wandor-*` were already taken by a different
design, and a palette one letter away from another template's is a typo that
resolves silently to the wrong colour rather than to an error. Its route is
`wander-gear` for the same reason `axion-studio` is not `axion`.

## Assets

Everything these templates reference is mirrored under `public/assets/<slug>/`
and used by absolute path (`/assets/jack/portrait.png`). No template hotlinks a
remote host. Things to know:

- It is ~590 MB. The largest single item is still Jack's 21 marquee GIFs at
  180 MB; after that it is simply fifty-odd 1080p clips at 5–22 MB each. That is
  the designs as specified. If it has to shrink, transcoding the GIFs to looping
  H.264/WebM is the biggest single win, and re-encoding the clips at a higher
  CRF would take most of the rest.
- Four assets are generated rather than downloaded, because the briefs
  reference them without supplying a URL:
  - `michael/hero.mp4` — the brief streams HLS from Mux through hls.js. Pulled
    down with ffmpeg (the 1708×1212 rendition) and played from a plain
    `<video src>`; hls.js is not a dependency.
  - `michael/stills/*.webp` — fourteen bento, journal and exploration images
    that the brief names but never links. One frame each, cut from fourteen
    *different* clips elsewhere in this folder so the grid has real variety
    rather than fourteen near-identical frames of one nine-second loop.
  - `basilico/stills/*.webp` — the six frames of its editorial gallery, which
    the brief asks for and does not source. Cut from `basilico/hero-food.mp4` at
    spread timestamps, so the grid is the same kitchen as the hero card rather
    than stock photography of a different restaurant.
  - `orbis/texture.png` — the grain plate, generated at 1024² with a sparse
    distribution (mean luma ~12) tuned for its `mix-blend-lighten` at 0.6 over
    `#010828`. A brighter plate washes the navy out to grey.
- `wandor/hero-hevc.mp4` is the original HEVC Main 10 4K file, which only Safari
  decodes reliably — Chrome and Firefox report `readyState: 4` off the container
  and then paint a 0×0 frame, so the page renders white-on-white. `hero.mp4` is
  a 1080p H.264 transcode and the `<video>` lists both as `<source>`s so each
  browser picks one it can actually draw. When a video looks blank, check
  `videoWidth !== 0` rather than `readyState`.
- `wander-gear/` is the one directory named for a slug rather than clipped short
  (`knowitall`, `michael`, `axion`). `wander/` next to `wandor/` was one letter
  of difference standing between two unrelated designs' assets.
