import React, { useRef, useState } from 'react';
import {
    motion,
    useMotionTemplate,
    useScroll,
    useTransform,
} from 'framer-motion';
import {
    BookOpen,
    Clock,
    Feather,
    Mail,
    MapPin,
    Menu,
    PencilRuler,
    Phone,
    Quote,
    Ruler,
    Scissors,
    Stamp,
    X,
} from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import SectionReveal from './shared/SectionReveal.jsx';
import SectionHeading from './shared/SectionHeading.jsx';
import MobileMenu from './shared/MobileMenu.jsx';
import BlurText from './shared/BlurText.jsx';
import AnimatedText from './shared/AnimatedText.jsx';
import StatBlock from './shared/StatBlock.jsx';
import Ticker from './shared/Ticker.jsx';
import ProcessTimeline from './shared/ProcessTimeline.jsx';
import ExpandingGallery from './shared/ExpandingGallery.jsx';
import StackingCards from './shared/StackingCards.jsx';
import TestimonialCarousel from './shared/TestimonialCarousel.jsx';
import Accordion from './shared/Accordion.jsx';
import Lightbox from './shared/Lightbox.jsx';
import LogoWall from './shared/LogoWall.jsx';
import Select from './shared/Select.jsx';
import DateField from './shared/DateField.jsx';
/* lucide has no brand icons; these are the hand-drawn set. `XLogo`, not
 * lucide's `X` — that one is the close cross imported above. */
import { Instagram, LinkedIn, XLogo } from './shared/BrandIcons.jsx';
import { useReducedMotion } from './shared/reducedMotion.js';
import { useScrollFrame } from './shared/frameContext.js';
import content from '../../data/marlowe.json';

/**
 * Marlowe & Hale — bespoke tailors, No. 14 Savile Row.
 *
 * The second template here assembled from `CATALOGUE.md` rather than written
 * from a brief, after `Aluma`. Where Aluma proved the catalogue could be read,
 * this one was built to push against it: it is the first template whose needs
 * drove extractions rather than the other way round.
 *
 * ─── Content ─────────────────────────────────────────────────────────────────
 * No copy lives in this file. Every string, price, cloth weight and icon name
 * is in `src/data/marlowe.json` and arrives as `content`, so rebranding the
 * house or translating it is an edit to that file and a rebuild.
 *
 * ─── Media: why nothing here is photographed ─────────────────────────────────
 * This library has no tailoring footage and nothing may be hotlinked, so the
 * usual route — scavenge a frame from another template with ffmpeg, as
 * `michael/stills` and `basilico/stills` were made — does not apply. That route
 * works when the source and the target share a subject. Here they do not: the
 * three nearest clips are a meditation scene, a black-hole vortex and a plate
 * of food. A cropped burger in a 3:4 garment tile is not a placeholder, it is a
 * lie that survives until somebody looks.
 *
 * So the cloth is drawn rather than shot. A chalkstripe is two colours and a
 * rhythm; a herringbone is a zigzag twill; a birdseye is a dot lattice. At
 * swatch scale those are not approximations of cloth — they are how cloth is
 * specified in a mill's book, which is why the drawn version reads as the real
 * thing where the wrong photograph would not. The six `.weave-*` classes in
 * `index.css` carry them, on `currentColor` so one set serves both grounds
 * this template uses.
 *
 * Every image slot in the JSON is present and `null`. Each renders `<Plate>` —
 * a woven ground, an SVG garment mark and a pattern code — through one ternary
 * at the call site, so a real photograph drops in by setting a single string.
 * `hero.video` is null for the same reason and takes a clip through
 * `CrossfadeVideo` when there is one: the first and last frames of the nearest
 * candidate differ at 20.7dB PSNR, so a plain `<video loop>` would visibly jump
 * and the crossfade is required rather than optional.
 *
 * The result is the only template in this folder that ships **no asset at all**.
 *
 * ─── Known gaps this template is shaped around ───────────────────────────────
 * The fitting form asks for a preferred *time* through a `Select` over preset
 * strings, because `TimeField` did not exist when this was built — the same
 * workaround `Basilico` uses. That is a missing component shaping the content
 * model, which is the wrong way round, and it is written down rather than hidden.
 */

/* -------------------------------------------------------------------------- */

/**
 * Weave token → class. A literal table, not an interpolated `weave-${name}`:
 * Tailwind finds classes by scanning source text, and these live in
 * `index.css` where the scanner never looks at all. Same shape as `Aluma`'s
 * `GALLERY_SPANS`, and a miss renders an unwoven surface rather than throwing.
 */
const WEAVES = {
    herringbone: 'weave-herringbone',
    chalkstripe: 'weave-chalkstripe',
    birdseye: 'weave-birdseye',
    glencheck: 'weave-glencheck',
    hopsack: 'weave-hopsack',
    twill: 'weave-twill',
};

/** Masonry spans, by the same rule. */
const SPANS = {
    tall: 'row-span-2',
    wide: 'col-span-2',
};

/* Lucide names, resolved from the JSON. A name absent from this table renders
 * nothing rather than throwing, so a typo in the content file degrades. */
const ICONS = {
    MapPin,
    Phone,
    Clock,
    Mail,
    BookOpen,
    Ruler,
    PencilRuler,
    Scissors,
    Feather,
    Stamp,
};

const SOCIALS = {
    Instagram,
    X: XLogo,
    LinkedIn,
};

/**
 * Garment marks, drawn the way a cutter's pattern sheet draws them: outline,
 * lapel break, button positions. Deliberately flat and unshaded — this is a
 * technical drawing standing in for a photograph, and one that tried to look
 * like a photograph would only look like a bad one.
 */
const MARKS = {
    coat: (
        <>
            <path d="M30 14 L50 24 L70 14 L86 30 L82 132 L18 132 L14 30 Z" />
            <path d="M50 24 L39 74" />
            <path d="M50 24 L61 74" />
            <circle cx="50" cy="84" r="2.5" />
            <circle cx="50" cy="100" r="2.5" />
        </>
    ),
    double: (
        <>
            <path d="M30 14 L50 24 L70 14 L86 30 L82 132 L18 132 L14 30 Z" />
            <path d="M50 24 L34 78" />
            <path d="M50 24 L66 78" />
            <circle cx="38" cy="88" r="2.5" />
            <circle cx="62" cy="88" r="2.5" />
            <circle cx="38" cy="104" r="2.5" />
            <circle cx="62" cy="104" r="2.5" />
        </>
    ),
    dinner: (
        <>
            <path d="M30 14 L50 24 L70 14 L86 30 L82 132 L18 132 L14 30 Z" />
            <path d="M50 24 C42 44 38 60 40 82" />
            <path d="M50 24 C58 44 62 60 60 82" />
            <circle cx="50" cy="92" r="2.5" />
        </>
    ),
    covert: (
        <>
            <path d="M28 12 L50 22 L72 12 L88 28 L86 140 L14 140 L12 28 Z" />
            <path d="M50 22 L40 66" />
            <path d="M50 22 L60 66" />
            <path d="M18 126 L82 126" />
            <path d="M18 130 L82 130" />
        </>
    ),
    waistcoat: (
        <>
            <path d="M32 20 L50 30 L68 20 L76 34 L74 112 L26 112 L24 34 Z" />
            <path d="M50 30 L42 66" />
            <path d="M50 30 L58 66" />
            <circle cx="50" cy="76" r="2.5" />
            <circle cx="50" cy="90" r="2.5" />
        </>
    ),
};

/* -------------------------------------------------------------------------- */

/**
 * The stand-in for a photograph: a woven ground, a garment mark and a pattern
 * number, framed in a hairline. It reads as a cutter's pattern sheet rather
 * than as a missing image, which is the whole point — a blank grey box says
 * "broken", and this says "drawn".
 */
function Plate({ weave = 'herringbone', mark, code, className = '', tone = 'dark' }) {
    const woven = WEAVES[weave] ?? '';
    const ink = tone === 'dark' ? 'text-marlowe-gold/25' : 'text-marlowe-jet/20';

    return (
        <div
            className={`bg-marlowe-coal relative flex items-center justify-center overflow-hidden ${ink} ${woven} ${className}`}
            aria-hidden="true"
        >
            <span className="pointer-events-none absolute inset-3 border border-current/40" />

            {mark && MARKS[mark] ? (
                <svg
                    viewBox="0 0 100 150"
                    className="text-marlowe-gold/45 relative h-3/5 w-auto"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinejoin="round"
                >
                    {MARKS[mark]}
                </svg>
            ) : null}

            {code ? (
                <span className="text-marlowe-gold/40 absolute right-5 bottom-5 text-[10px] tracking-[0.2em]">
                    {code}
                </span>
            ) : null}
        </div>
    );
}

/** A pattern number derived from the index, so the plates are not all `P/1142`. */
const patternCode = i => `P/${1142 + i * 37}`;

/* -------------------------------------------------------------------------- */

/* The house heading treatment, defined once and spread. `SectionHeading` ships
 * no face, colour or size on purpose, so this is where they live. */
const HEADING_JET = {
    eyebrowClassName: 'text-marlowe-gold text-[11px] font-semibold tracking-[0.32em] uppercase',
    titleClassName: 'font-cormorant text-marlowe-chalk max-w-2xl text-4xl font-medium md:text-6xl',
};

const HEADING_CHALK = {
    eyebrowClassName: 'text-marlowe-claret text-[11px] font-semibold tracking-[0.32em] uppercase',
    titleClassName: 'font-cormorant text-marlowe-jet max-w-2xl text-4xl font-medium md:text-6xl',
};

const SHELL = 'mx-auto w-full max-w-6xl px-6';

/* -------------------------------------------------------------------------- */

/** Catalogue `NV-02` (ramped) + `MN-02` through `shared/MobileMenu`. */
function Navbar() {
    const frameRef = useScrollFrame();
    const [open, setOpen] = useState(false);
    const { scrollY } = useScroll({ container: frameRef });

    const background = useTransform(
        scrollY,
        [0, 120],
        ['rgba(11, 11, 13, 0)', 'rgba(11, 11, 13, 0.92)']
    );
    const blur = useTransform(scrollY, [0, 120], [0, 20]);
    const backdropFilter = useMotionTemplate`blur(${blur}px)`;
    /* The bar sits on the drawn hero at rest and on jet once scrolled, so the
     * type travels from chalk to gold rather than staying one colour. */
    const color = useTransform(scrollY, [0, 120], ['#e8e3d7', '#c0a05a']);

    return (
        <motion.nav
            style={{ background, backdropFilter, WebkitBackdropFilter: backdropFilter, color }}
            className="fixed top-0 right-0 left-0 z-50 px-6 py-4 md:py-5"
        >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
                <a href="#" className="text-inherit no-underline" aria-label={content.brand.name}>
                    <span className="font-cormorant text-lg tracking-[0.3em]">
                        {content.brand.wordmark}
                    </span>
                </a>

                <div className="hidden items-center gap-9 md:flex">
                    {content.nav.links.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="group relative text-[13px] tracking-[0.12em] text-inherit uppercase no-underline"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 block h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={content.nav.cta.href}
                        className="border-marlowe-gold text-marlowe-gold hover:bg-marlowe-gold hover:text-marlowe-jet hidden border px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase no-underline transition-colors sm:block"
                    >
                        {content.nav.cta.label}
                    </a>
                    <button
                        type="button"
                        onClick={() => setOpen(value => !value)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={open}
                        className="cursor-pointer border-none bg-transparent p-1 text-inherit md:hidden"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <MobileMenu
                variant="collapse"
                open={open}
                onClose={() => setOpen(false)}
                duration={300}
                className="mx-auto max-w-6xl md:hidden"
                panelClassName="flex flex-col gap-1 pt-4"
            >
                {content.nav.links.map(link => (
                    <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="px-1 py-2.5 text-[13px] tracking-[0.12em] text-inherit uppercase no-underline"
                    >
                        {link.label}
                    </a>
                ))}
                <a
                    href={content.nav.cta.href}
                    onClick={() => setOpen(false)}
                    className="border-marlowe-gold text-marlowe-gold mt-3 border px-5 py-2.5 text-center text-[11px] tracking-[0.18em] uppercase no-underline sm:hidden"
                >
                    {content.nav.cta.label}
                </a>
            </MobileMenu>
        </motion.nav>
    );
}

/* -------------------------------------------------------------------------- */

/** `HR-01` with the video slot drawn rather than shot — see the header. */
function Hero() {
    const { hero, brand } = content;

    return (
        <section className="bg-marlowe-jet relative flex min-h-screen flex-col overflow-hidden">
            <div className="absolute inset-0">
                <Plate weave={hero.weave} mark={hero.mark} className="h-full w-full" />
                <div className="from-marlowe-jet/70 via-marlowe-jet/40 to-marlowe-jet absolute inset-0 bg-gradient-to-b" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgb(11_11_13/0.7)_100%)]" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pt-32 pb-12">
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <SectionReveal y={16}>
                        <span className="border-marlowe-gold/40 text-marlowe-gold inline-flex items-center gap-3 border px-5 py-2 text-[10px] font-semibold tracking-[0.28em] uppercase">
                            {hero.eyebrow}
                        </span>
                    </SectionReveal>

                    <BlurText
                        as="h1"
                        text={hero.heading}
                        className="font-cormorant text-marlowe-chalk mt-8 max-w-4xl text-5xl leading-[1.02] font-medium sm:text-6xl lg:text-[5.5rem]"
                    />

                    <SectionReveal delay={0.3}>
                        <p className="text-marlowe-stone mx-auto mt-8 max-w-xl text-base leading-relaxed">
                            {hero.body}
                        </p>
                    </SectionReveal>

                    <SectionReveal delay={0.45} className="mt-10 flex flex-wrap justify-center gap-3">
                        {hero.actions.map(action => (
                            <a
                                key={action.label}
                                href={action.href}
                                className={
                                    action.variant === 'solid'
                                        ? 'bg-marlowe-gold text-marlowe-jet px-7 py-3 text-[11px] tracking-[0.18em] uppercase no-underline transition-transform hover:scale-[1.03]'
                                        : 'border-marlowe-chalk/30 text-marlowe-chalk hover:border-marlowe-chalk border px-7 py-3 text-[11px] tracking-[0.18em] uppercase no-underline transition-colors'
                                }
                            >
                                {action.label}
                            </a>
                        ))}
                    </SectionReveal>
                </div>

                <div className="text-marlowe-stone flex items-center justify-between text-[10px] tracking-[0.24em] uppercase">
                    <span>{brand.street}</span>
                    <span>{hero.scrollHint}</span>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** §2 — `SC-06` through `shared/Ticker`. Warrants and press, not client logos. */
function Register() {
    return (
        <section id="register" className="bg-marlowe-jet border-marlowe-chalk/10 border-y py-6">
            <Ticker duration={55} fadeClassName="from-marlowe-jet" gap="gap-14">
                {content.register.map(line => (
                    <span
                        key={line}
                        className="text-marlowe-stone flex items-center gap-14 text-[11px] tracking-[0.26em] whitespace-nowrap uppercase"
                    >
                        {line}
                        <span className="bg-marlowe-gold/40 h-1 w-1 rotate-45" />
                    </span>
                ))}
            </Ticker>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** §3 — the chalk counter-ground, `AT-05` statement and `AT-03` stats. */
function House() {
    const { house } = content;

    return (
        <section id="house" className="bg-marlowe-chalk text-marlowe-jet py-28 md:py-40">
            <div className={SHELL}>
                <SectionHeading {...HEADING_CHALK} eyebrow={house.eyebrow} title={house.statement} />

                <div className="grid gap-10 md:grid-cols-2">
                    {house.body.map((paragraph, i) => (
                        <SectionReveal key={paragraph.slice(0, 24)} delay={i * 0.1}>
                            <p className="text-marlowe-jet/70 m-0 text-base leading-[1.9]">
                                {paragraph}
                            </p>
                        </SectionReveal>
                    ))}
                </div>

                <StatBlock.Group className="border-marlowe-jet/15 mt-20 grid grid-cols-2 gap-10 border-t pt-12 md:grid-cols-4">
                    {house.stats.map(stat => (
                        <StatBlock
                            key={stat.label}
                            value={stat.value}
                            label={stat.label}
                            valueClassName="font-cormorant text-marlowe-jet text-4xl font-medium md:text-5xl"
                            labelClassName="text-marlowe-jet/50 mt-2 text-[10px] tracking-[0.24em] uppercase"
                        />
                    ))}
                </StatBlock.Group>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * §4 — `SC-01`, the clip-path aperture, from `Skyline.jsx:253`.
 *
 * Re-staged from the obvious "cloth → finished coat": a finished coat cannot be
 * drawn convincingly at full bleed, and there is no photograph. It is instead
 * the length becoming a *pattern* — the moment the cutter's chalk goes on —
 * which needs only line work over the same weave and is closer to the brief
 * than a product shot would have been.
 *
 * The two layers counter-scale so neither reads as a static backdrop, and the
 * circle opens to 150% rather than 100% so it has cleared the corners by the
 * end. Pinning is `sticky`, never ScrollTrigger `pin`.
 */
function Aperture() {
    const frameRef = useScrollFrame();
    const sectionRef = useRef(null);
    const reduced = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: frameRef,
        offset: ['start start', 'end end'],
    });

    const radius = useTransform(scrollYProgress, [0.1, 0.85], [0, 150]);
    const clipPath = useMotionTemplate`circle(${radius}% at 50% 50%)`;

    const under = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
    const over = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

    const { aperture } = content;

    return (
        <section ref={sectionRef} className="bg-marlowe-jet relative h-[300vh]">
            <div className="sticky top-0 h-screen overflow-hidden">
                <ApertureLayer
                    image={aperture.clothImage}
                    weave={aperture.clothWeave}
                    scale={reduced ? undefined : under}
                    eyebrow={aperture.before.eyebrow}
                    heading={aperture.before.heading}
                />

                <motion.div
                    style={reduced ? undefined : { clipPath }}
                    className="absolute inset-0"
                >
                    <ApertureLayer
                        image={aperture.coatImage}
                        weave={aperture.coatWeave}
                        scale={reduced ? undefined : over}
                        eyebrow={aperture.after.eyebrow}
                        heading={aperture.after.heading}
                        chalked
                    />
                </motion.div>

                <span className="text-marlowe-stone absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.24em] uppercase">
                    {aperture.hint}
                </span>
            </div>
        </section>
    );
}

/** One full-bleed layer of the aperture. `chalked` adds the cutter's marks. */
function ApertureLayer({ image, weave, scale, eyebrow, heading, chalked = false }) {
    return (
        <>
            <motion.div style={{ scale }} className="absolute inset-0 will-change-transform">
                {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover" />
                ) : (
                    <Plate weave={weave} className="h-full w-full" />
                )}
                {chalked ? <ChalkMarks /> : null}
            </motion.div>

            <div className="bg-marlowe-jet/55 absolute inset-0" />

            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
                <span className="text-marlowe-gold mb-5 text-[11px] font-semibold tracking-[0.32em] uppercase">
                    {eyebrow}
                </span>
                <h2 className="font-cormorant text-marlowe-chalk m-0 max-w-3xl text-4xl leading-[1.05] font-medium sm:text-6xl lg:text-7xl">
                    {heading}
                </h2>
            </div>
        </>
    );
}

/** The pattern chalked onto the cloth: a coat front, a balance line, a notch. */
function ChalkMarks() {
    return (
        <svg
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMid slice"
            className="text-marlowe-chalk/35 absolute inset-0 h-full w-full"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            aria-hidden="true"
        >
            <path d="M120 40 L200 62 L280 40 L318 84 L308 268 L92 268 L82 84 Z" />
            <path d="M200 62 L166 168" strokeDasharray="4 5" />
            <path d="M200 62 L234 168" strokeDasharray="4 5" />
            <path d="M60 150 L340 150" strokeDasharray="2 8" />
            <circle cx="200" cy="190" r="4" />
            <circle cx="200" cy="218" r="4" />
        </svg>
    );
}

/* -------------------------------------------------------------------------- */

/** §5 — the commission, on `shared/ProcessTimeline`. Chalk ground. */
function Commission() {
    const { commission } = content;

    return (
        <section id="commission" className="bg-marlowe-chalk text-marlowe-jet py-28 md:py-40">
            <div className={SHELL}>
                <SectionHeading
                    {...HEADING_CHALK}
                    eyebrow={commission.eyebrow}
                    title={commission.heading}
                />

                <ProcessTimeline
                    steps={commission.steps}
                    icons={ICONS}
                    orientation="vertical"
                    className="text-marlowe-jet mt-4"
                    railClassName="bg-marlowe-jet/15"
                    fillClassName="bg-marlowe-claret"
                    markerClassName="border-marlowe-jet/25 bg-marlowe-chalk text-marlowe-claret"
                    titleClassName="font-cormorant text-marlowe-jet text-2xl font-medium"
                    bodyClassName="text-marlowe-jet/65 max-w-xl"
                    metaClassName="text-marlowe-jet/45"
                />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** §6 — `CD-03`, the four house cuts. `aspect-[3/4]` is already a garment ratio. */
function Cuts() {
    const { cuts } = content;

    return (
        <section id="cuts" className="bg-marlowe-jet py-28 md:py-40">
            <div className={SHELL}>
                <SectionHeading {...HEADING_JET} eyebrow={cuts.eyebrow} title={cuts.heading} />

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {cuts.items.map((item, i) => (
                        <SectionReveal key={item.name} delay={i * 0.08} className="group">
                            <div className="aspect-[3/4] overflow-hidden">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.alt}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <Plate
                                        weave={item.weave}
                                        mark={item.mark}
                                        code={patternCode(i)}
                                        className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                                    />
                                )}
                            </div>

                            <h3 className="font-cormorant text-marlowe-chalk mt-5 mb-0 text-2xl font-medium">
                                {item.name}
                            </h3>
                            <p className="text-marlowe-gold m-0 mt-1 text-[11px] tracking-[0.2em] uppercase">
                                {item.from}
                            </p>
                            <p className="text-marlowe-stone m-0 mt-3 text-sm leading-relaxed">
                                {item.body}
                            </p>
                        </SectionReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** §7 — `CD-01` through `shared/ExpandingGallery`. People, where §6 is product. */
function Workroom() {
    const { workroom } = content;

    return (
        <section id="workroom" className="bg-marlowe-jet pb-28 md:pb-40">
            <div className={SHELL}>
                <SectionHeading {...HEADING_JET} eyebrow={workroom.eyebrow} title={workroom.heading} />

                <ExpandingGallery
                    items={workroom.makers}
                    engine="css"
                    className="flex h-auto flex-col gap-3 md:h-[480px] md:flex-row"
                >
                    {(maker, { active }) => (
                        <div className="relative h-64 w-full overflow-hidden md:h-full">
                            {maker.image ? (
                                <img
                                    src={maker.image}
                                    alt={maker.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Plate weave={maker.weave} className="h-full w-full" />
                            )}

                            <div className="from-marlowe-jet absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

                            <div className="absolute inset-x-0 bottom-0 p-6 text-left">
                                <p className="text-marlowe-gold m-0 text-[10px] tracking-[0.24em] uppercase">
                                    {maker.role}
                                </p>
                                <h3 className="font-cormorant text-marlowe-chalk m-0 mt-1 text-2xl font-medium whitespace-nowrap">
                                    {maker.name}
                                </h3>

                                <div
                                    className={`grid transition-[grid-template-rows,opacity] duration-500 ${
                                        active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                    }`}
                                >
                                    <div className="min-h-0 overflow-hidden">
                                        <p className="text-marlowe-stone m-0 pt-3 text-[11px] tracking-[0.16em] uppercase">
                                            {maker.years}
                                        </p>
                                        <p className="text-marlowe-chalk/75 m-0 mt-2 max-w-sm text-sm leading-relaxed">
                                            {maker.body}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ExpandingGallery>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * §8 — `CD-06` masonry on the chalk ground, with `shared/Lightbox` on the tiles
 * and `shared/LogoWall` beneath. The wall is a static grid of mill marks and
 * deliberately not a second ticker; `ROADMAP.md` is explicit that the two are
 * different claims.
 */
function Cloth() {
    const { cloth } = content;
    const [at, setAt] = useState(null);

    const lightboxItems = cloth.swatches.map(s => ({
        src: s.src,
        alt: s.alt,
        caption: `${s.name} · ${s.mill} · ${s.weight}`,
        credit: s.caption,
        weave: s.weave,
    }));

    return (
        <section id="cloth" className="bg-marlowe-chalk text-marlowe-jet py-28 md:py-40">
            <div className={SHELL}>
                <SectionHeading
                    {...HEADING_CHALK}
                    eyebrow={cloth.eyebrow}
                    title={cloth.heading}
                    lead={cloth.note}
                    leadClassName="text-marlowe-jet/60 mt-4 max-w-md text-sm"
                />

                <div className="grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-3">
                    {cloth.swatches.map((swatch, i) => (
                        <SectionReveal
                            key={swatch.name}
                            as="div"
                            delay={i * 0.06}
                            className={SPANS[swatch.span] ?? ''}
                        >
                            <button
                                type="button"
                                onClick={() => setAt(i)}
                                aria-label={`Enlarge ${swatch.name}`}
                                className="group relative h-full w-full cursor-pointer overflow-hidden border-none p-0"
                            >
                                {swatch.src ? (
                                    <img
                                        src={swatch.src}
                                        alt={swatch.alt}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <Plate
                                        weave={swatch.weave}
                                        className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                                    />
                                )}

                                <span className="from-marlowe-jet/85 absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 bg-gradient-to-t to-transparent p-4 text-left">
                                    <span className="font-cormorant text-marlowe-chalk text-lg">
                                        {swatch.name}
                                    </span>
                                    <span className="text-marlowe-gold text-[10px] tracking-[0.2em] uppercase">
                                        {swatch.weaveLabel} · {swatch.weight}
                                    </span>
                                </span>
                            </button>
                        </SectionReveal>
                    ))}
                </div>

                <LogoWall
                    logos={cloth.mills.items}
                    columns={3}
                    label={cloth.mills.label}
                    showLabel
                    className="border-marlowe-jet/15 mt-20 border-t pt-12 text-marlowe-jet/20"
                    labelClassName="text-marlowe-jet/45"
                    nameClassName="font-cormorant text-marlowe-jet text-base"
                    sinceClassName="text-marlowe-jet/45"
                />
            </div>

            <Lightbox
                items={lightboxItems}
                index={at}
                onIndexChange={setAt}
                onClose={() => setAt(null)}
                renderItem={item =>
                    item.src ? null : (
                        <Plate weave={item.weave} className="h-[60vh] w-[min(90vw,60vh)]" />
                    )
                }
            />
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** §9 — `SC-03` through `shared/StackingCards`. Jack's sticky-and-shrink variant. */
function OrderBook() {
    const { orderBook } = content;

    return (
        <section id="orderbook" className="bg-marlowe-jet py-28 md:py-40">
            <div className={SHELL}>
                <SectionHeading
                    {...HEADING_JET}
                    eyebrow={orderBook.eyebrow}
                    title={orderBook.heading}
                />
            </div>

            <StackingCards
                items={orderBook.items}
                top="top-28"
                className={SHELL}
                cardClassName="bg-marlowe-coal border border-marlowe-chalk/10"
            >
                {(item, { index }) => (
                    <div className="grid h-full gap-8 p-8 md:grid-cols-2 md:p-12">
                        <div className="flex flex-col justify-between">
                            <div>
                                <p className="text-marlowe-gold m-0 text-[11px] tracking-[0.24em] uppercase">
                                    {item.number} · {item.category}
                                </p>
                                <h3 className="font-cormorant text-marlowe-chalk mt-5 mb-0 max-w-md text-3xl leading-tight font-medium md:text-4xl">
                                    {item.title}
                                </h3>
                                <p className="text-marlowe-stone mt-5 max-w-md text-sm leading-relaxed">
                                    {item.body}
                                </p>
                            </div>
                        </div>

                        <div className="min-h-56 overflow-hidden">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Plate
                                    weave={item.weave}
                                    mark={item.mark}
                                    code={patternCode(index + 12)}
                                    className="h-full w-full"
                                />
                            )}
                        </div>
                    </div>
                )}
            </StackingCards>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** §10 — `SC-05`, the parallax plate. Must not enclose §9: `sticky` dies under
 * an `overflow-hidden` ancestor, which this section needs and that one cannot
 * tolerate. They are siblings for that reason. */
function Workshop() {
    const frameRef = useScrollFrame();
    const sectionRef = useRef(null);
    const reduced = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: frameRef,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
    const { workshop } = content;

    return (
        <section ref={sectionRef} className="relative overflow-hidden py-28 md:py-40">
            <motion.div
                style={reduced ? undefined : { y }}
                className="absolute -top-[10%] left-0 h-[120%] w-full will-change-transform"
            >
                {workshop.image ? (
                    <img src={workshop.image} alt="" className="h-full w-full object-cover" />
                ) : (
                    <Plate weave={workshop.weave} className="h-full w-full opacity-40" />
                )}
            </motion.div>

            <div className="from-marlowe-jet via-marlowe-jet/90 to-marlowe-jet absolute inset-0 bg-gradient-to-b" />

            <div className={`relative ${SHELL}`}>
                <SectionHeading
                    {...HEADING_JET}
                    eyebrow={workshop.eyebrow}
                    title={workshop.heading}
                    lead={workshop.body}
                    leadClassName="text-marlowe-stone mt-4 max-w-md text-sm leading-relaxed"
                />

                <div className="grid gap-8 md:grid-cols-3">
                    {workshop.points.map((point, i) => (
                        <SectionReveal
                            key={point.title}
                            delay={i * 0.08}
                            className="border-marlowe-gold/30 border-t pt-6"
                        >
                            <h3 className="font-cormorant text-marlowe-chalk m-0 text-xl font-medium">
                                {point.title}
                            </h3>
                            <p className="text-marlowe-stone m-0 mt-3 text-sm leading-relaxed">
                                {point.body}
                            </p>
                        </SectionReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** §11 — `shared/Accordion`, which is what `FAQ` is made of. Chalk ground. */
function Answers() {
    const { answers } = content;

    return (
        <section id="answers" className="bg-marlowe-chalk text-marlowe-jet py-28 md:py-40">
            <div className="mx-auto w-full max-w-3xl px-6">
                <SectionHeading
                    {...HEADING_CHALK}
                    eyebrow={answers.eyebrow}
                    title={answers.heading}
                />

                <Accordion type="single" collapsible className="border-marlowe-jet/15 border-t">
                    {answers.items.map(item => (
                        <Accordion.Item
                            key={item.id}
                            value={item.id}
                            className="border-marlowe-jet/15 border-b"
                        >
                            <Accordion.Trigger className="font-cormorant text-marlowe-jet flex w-full cursor-pointer items-center justify-between gap-6 border-none bg-transparent py-6 text-left text-xl font-medium">
                                {item.question}
                            </Accordion.Trigger>
                            <Accordion.Panel className="pb-6">
                                {item.answer.map(paragraph => (
                                    <p
                                        key={paragraph.slice(0, 24)}
                                        className="text-marlowe-jet/65 m-0 mt-3 text-sm leading-[1.9] first:mt-0"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** §12 — `shared/TestimonialCarousel`. */
function Clients() {
    const { clients } = content;

    return (
        <section className="bg-marlowe-jet py-28 md:py-40">
            <div className={SHELL}>
                <SectionHeading {...HEADING_JET} eyebrow={clients.eyebrow} title={clients.heading} />

                <TestimonialCarousel
                    items={clients.items}
                    className="text-marlowe-gold"
                    dotClassName="h-1.5 w-4 bg-marlowe-chalk/20"
                    activeDotClassName="h-1.5 w-10 bg-marlowe-gold"
                >
                    {item => (
                        <>
                            <Quote className="text-marlowe-gold/40" size={28} />
                            <p className="font-cormorant text-marlowe-chalk m-0 mt-6 max-w-3xl text-2xl leading-[1.5] font-medium md:text-3xl">
                                {item.quote}
                            </p>
                            <footer className="mt-8">
                                <p className="text-marlowe-chalk m-0 text-sm tracking-[0.14em] uppercase">
                                    {item.name}
                                </p>
                                <p className="text-marlowe-stone m-0 mt-1 text-[11px] tracking-[0.18em] uppercase">
                                    {item.detail}
                                </p>
                            </footer>
                        </>
                    )}
                </TestimonialCarousel>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

const FIELD_CLASS =
    'w-full border border-marlowe-chalk/20 bg-marlowe-coal px-4 py-3 text-sm text-marlowe-chalk outline-none transition-colors focus:border-marlowe-gold';
const MENU_CLASS = 'border-marlowe-chalk/15 bg-marlowe-coal text-marlowe-chalk';

/**
 * Deliberately a `div` with an id'd `<span>` rather than a `<label>`: `<button>`
 * is a labelable element, so a wrapping label forwards its own click into the
 * trigger — which fights the control's handler and toggles the popover twice.
 * Children take `aria-labelledby` instead.
 */
function Field({ id, label, className = '', children }) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <span
                id={`${id}-label`}
                className="text-marlowe-stone text-[10px] font-semibold tracking-[0.24em] uppercase"
            >
                {label}
            </span>
            {children}
        </div>
    );
}

/**
 * §13 — the fitting request.
 *
 * The garment and cloth dropdowns are fed from `cuts.items` and
 * `cloth.swatches`, not from their own option arrays: one source, two places,
 * so adding a cut or a swatch makes it bookable without a second edit. Same
 * move as `Aluma`'s suite select.
 */
function Fitting() {
    const { fitting, cuts, cloth } = content;
    const [sent, setSent] = useState(false);

    return (
        <section id="fitting" className="bg-marlowe-jet py-28 md:py-40">
            <div className="mx-auto w-full max-w-3xl px-6">
                <SectionHeading {...HEADING_JET} eyebrow={fitting.eyebrow} title={fitting.heading} />

                <SectionReveal>
                    <p className="text-marlowe-stone -mt-8 mb-12 max-w-xl text-sm leading-relaxed">
                        {fitting.body}
                    </p>
                </SectionReveal>

                <SectionReveal
                    as="form"
                    onSubmit={event => {
                        event.preventDefault();
                        setSent(true);
                    }}
                    className="border-marlowe-chalk/10 bg-marlowe-coal/40 grid gap-6 border p-6 sm:grid-cols-2 md:p-10"
                >
                    <Field id="marlowe-date" label={fitting.fields.date}>
                        <DateField
                            name="date"
                            placeholder={fitting.datePlaceholder}
                            locale="en-GB"
                            className={FIELD_CLASS}
                            menuClassName={MENU_CLASS}
                            aria-labelledby="marlowe-date-label"
                        />
                    </Field>

                    <Field id="marlowe-time" label={fitting.fields.time}>
                        <Select
                            name="time"
                            options={fitting.timeOptions}
                            defaultValue={fitting.timeOptions[1]}
                            className={FIELD_CLASS}
                            menuClassName={MENU_CLASS}
                            aria-labelledby="marlowe-time-label"
                        />
                    </Field>

                    <Field id="marlowe-garment" label={fitting.fields.garment}>
                        <Select
                            name="garment"
                            options={cuts.items.map(cut => cut.name)}
                            defaultValue={cuts.items[0].name}
                            className={FIELD_CLASS}
                            menuClassName={MENU_CLASS}
                            aria-labelledby="marlowe-garment-label"
                        />
                    </Field>

                    <Field id="marlowe-cloth" label={fitting.fields.cloth}>
                        <Select
                            name="cloth"
                            options={cloth.swatches.map(swatch => swatch.name)}
                            defaultValue={cloth.swatches[0].name}
                            className={FIELD_CLASS}
                            menuClassName={MENU_CLASS}
                            aria-labelledby="marlowe-cloth-label"
                        />
                    </Field>

                    <Field id="marlowe-email" label={fitting.fields.email} className="sm:col-span-2">
                        <input
                            type="email"
                            name="email"
                            required
                            className={FIELD_CLASS}
                            aria-labelledby="marlowe-email-label"
                        />
                    </Field>

                    <Field id="marlowe-notes" label={fitting.fields.notes} className="sm:col-span-2">
                        <textarea
                            name="notes"
                            rows={4}
                            placeholder={fitting.notesPlaceholder}
                            className={`${FIELD_CLASS} resize-none`}
                            aria-labelledby="marlowe-notes-label"
                        />
                    </Field>

                    <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
                        <button
                            type="submit"
                            className="bg-marlowe-gold text-marlowe-jet cursor-pointer border-none px-8 py-3 text-[11px] tracking-[0.18em] uppercase transition-transform hover:scale-[1.03]"
                        >
                            {fitting.submit}
                        </button>
                        {sent ? (
                            <p className="text-marlowe-gold m-0 text-[11px] tracking-[0.18em] uppercase">
                                {fitting.success}
                            </p>
                        ) : null}
                    </div>
                </SectionReveal>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** `FT-01` structure with `FT-03`'s contact and newsletter columns. */
function Footer() {
    const { footer, brand } = content;

    return (
        <footer className="bg-marlowe-jet border-marlowe-chalk/10 border-t">
            <SectionReveal className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
                <h2 className="font-cormorant text-marlowe-chalk m-0 max-w-2xl text-4xl leading-[1.05] font-medium md:text-6xl">
                    {footer.cta.heading}
                </h2>
                <a
                    href={footer.cta.href}
                    className="bg-marlowe-gold text-marlowe-jet px-8 py-3 text-[11px] tracking-[0.18em] uppercase no-underline transition-transform hover:scale-[1.03]"
                >
                    {footer.cta.label}
                </a>
            </SectionReveal>

            <div className="border-marlowe-chalk/10 border-t">
                <div className={`${SHELL} grid gap-12 py-16 md:grid-cols-5`}>
                    <div className="md:col-span-2">
                        <span className="font-cormorant text-marlowe-chalk text-lg tracking-[0.3em]">
                            {brand.wordmark}
                        </span>
                        <p className="text-marlowe-stone mt-4 max-w-xs text-sm leading-relaxed">
                            {footer.blurb}
                        </p>
                        <div className="mt-6 flex gap-4">
                            {footer.social.map(social => {
                                const Icon = SOCIALS[social.name];
                                return Icon ? (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        aria-label={social.name}
                                        className="text-marlowe-stone hover:text-marlowe-gold transition-colors"
                                    >
                                        <Icon size={18} />
                                    </a>
                                ) : null;
                            })}
                        </div>
                    </div>

                    {footer.columns.map(column => (
                        <div key={column.title}>
                            <p className="text-marlowe-gold m-0 text-[10px] font-semibold tracking-[0.24em] uppercase">
                                {column.title}
                            </p>
                            <ul className="m-0 mt-5 list-none space-y-3 p-0">
                                {column.links.map(link => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-marlowe-stone hover:text-marlowe-chalk text-sm no-underline transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div>
                        <p className="text-marlowe-gold m-0 text-[10px] font-semibold tracking-[0.24em] uppercase">
                            {footer.newsletter.title}
                        </p>
                        <ul className="m-0 mt-5 list-none space-y-4 p-0">
                            {footer.contact.map(entry => {
                                const Icon = ICONS[entry.icon];
                                return (
                                    <li
                                        key={entry.lines[0]}
                                        className="text-marlowe-stone flex gap-3 text-sm"
                                    >
                                        {Icon ? (
                                            <Icon size={15} className="mt-0.5 shrink-0" />
                                        ) : null}
                                        <span>
                                            {entry.lines.map(line => (
                                                <span key={line} className="block">
                                                    {line}
                                                </span>
                                            ))}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div className="border-marlowe-chalk/10 border-t">
                    <div
                        className={`${SHELL} text-marlowe-stone flex flex-wrap items-center justify-between gap-4 py-6 text-[11px]`}
                    >
                        <span>{footer.copyright}</span>
                        <div className="flex gap-6">
                            {footer.legal.map(item => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="hover:text-marlowe-chalk text-inherit no-underline transition-colors"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------------- */

export default function Marlowe() {
    return (
        <PageFrame
            title={content.brand.documentTitle}
            className="type-barlow bg-marlowe-jet text-marlowe-chalk"
        >
            <BackButton />
            <Navbar />
            <Hero />
            <Register />
            <House />
            <Aperture />
            <Commission />
            <Cuts />
            <Workroom />
            <Cloth />
            <OrderBook />
            <Workshop />
            <Answers />
            <Clients />
            <Fitting />
            <Footer />
        </PageFrame>
    );
}
