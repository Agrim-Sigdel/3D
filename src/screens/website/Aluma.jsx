import React, { useRef, useState } from 'react';
import {
    motion,
    useMotionTemplate,
    useScroll,
    useTransform,
} from 'framer-motion';
import {
    ArrowRight,
    ArrowUpRight,
    Clock,
    Footprints,
    Mail,
    MapPin,
    Menu,
    Phone,
    Quote,
    Sailboat,
    Sparkles,
    Waves,
    X,
} from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import FadeIn from './shared/FadeIn.jsx';
import BlurText from './shared/BlurText.jsx';
import AnimatedText from './shared/AnimatedText.jsx';
import CrossfadeVideo from './shared/CrossfadeVideo.jsx';
import Select from './shared/Select.jsx';
import DateField from './shared/DateField.jsx';
import MobileMenu from './shared/MobileMenu.jsx';
import { useScrollFrame } from './shared/frameContext.js';
import content from '../../data/aluma.json';

/**
 * Aluma — a lakeside retreat, and the first template here assembled from
 * `CATALOGUE.md` rather than written from a brief. Each section names the
 * catalogue entry it is built on, so the two files stay honest about each other.
 *
 * ─── Content ─────────────────────────────────────────────────────────────────
 * There is no copy in this file. Every string, image path, price and icon name
 * lives in `src/data/aluma.json` and arrives as `content` — so rebranding the
 * site, translating it, or pointing it at different footage is an edit to that
 * file and a rebuild, with nothing here to touch.
 *
 * The JSON is imported rather than fetched. Vite resolves it at build time, so
 * there is no loading state, no waterfall and no way for the page to render
 * half-populated; the trade is that changing copy needs a rebuild. A CMS-backed
 * version would swap this one import for a fetch and add a skeleton — the
 * component below would not otherwise change, because nothing in it reaches
 * past `content`.
 *
 * Icons are the one thing JSON cannot hold. It carries lucide *names*, which
 * `ICONS` resolves; a name that is not in that table renders nothing rather
 * than throwing, so a typo in the content file degrades instead of white-
 * screening the page.
 *
 * ─── Media ───────────────────────────────────────────────────────────────────
 * Both clips are reused from other templates in this folder — this library has
 * no resort footage, and the JSON holds their paths precisely so real footage
 * can be dropped in without touching code.
 *
 * The hero runs on `MD-02` (`./shared/CrossfadeVideo`), not `MD-01`. Frame 0 of
 * that clip has the mountain buried in cloud and the last frame has it fully
 * clear, so a plain `loop` hard-cuts every 6.7 seconds; and `FadingVideo`'s dip
 * to black, at that frequency, is the opposite of what a hero this calm wants.
 * Two copies crossfading read as weather moving instead. Playback is at 0.6 so
 * the loop is eleven seconds rather than seven.
 */

/* Names in aluma.json resolve here. Keep in sync with the `icon` values used
 * in that file — anything missing renders as nothing, by design. */
const ICONS = {
    Waves,
    Footprints,
    Sailboat,
    Sparkles,
    MapPin,
    Phone,
    Clock,
    Mail,
};

function Icon({ name, ...rest }) {
    const Component = ICONS[name];
    return Component ? <Component {...rest} /> : null;
}

const HERO_PLAYBACK = 0.6;

const YEAR = new Date().getFullYear();

/* Gallery spans, keyed by the token the JSON uses. Keeping the mapping here
 * rather than putting Tailwind classes in the content file means the JSON stays
 * about editorial weight ("this one is the big one") and not about CSS. */
const GALLERY_SPANS = {
    'wide-tall': 'sm:col-span-2 sm:row-span-2',
    wide: 'sm:col-span-2',
    '': '',
};

/* -------------------------------------------------------------------------- */

/** Shared section heading. Catalogue `AT-02`. */
function SectionHeading({ eyebrow, heading, tone = 'dark', className = '', children }) {
    const light = tone === 'light';
    return (
        <FadeIn className={`mb-14 flex flex-wrap items-end justify-between gap-6 ${className}`}>
            <div>
                <p
                    className={`m-0 mb-4 text-xs font-semibold tracking-[0.3em] uppercase ${
                        light ? 'text-aluma-brass' : 'text-aluma-water'
                    }`}
                >
                    {eyebrow}
                </p>
                <h2
                    className={`font-cormorant m-0 max-w-2xl text-4xl leading-[1.05] font-medium md:text-6xl ${
                        light ? 'text-white' : 'text-aluma-ink'
                    }`}
                >
                    {heading}
                </h2>
            </div>
            {children}
        </FadeIn>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `NV-02` (ramped variant) + `MN-02` for the collapse. */
function Navbar() {
    const frameRef = useScrollFrame();
    const [open, setOpen] = useState(false);
    const { scrollY } = useScroll({ container: frameRef });

    const background = useTransform(
        scrollY,
        [0, 120],
        ['rgba(242, 240, 234, 0)', 'rgba(242, 240, 234, 0.88)']
    );
    const blur = useTransform(scrollY, [0, 120], [0, 20]);
    const backdropFilter = useMotionTemplate`blur(${blur}px)`;
    /* The bar sits on video at rest and on paper once scrolled, so the type has
     * to travel between the two as well. */
    const color = useTransform(scrollY, [0, 120], ['#ffffff', '#1b2b2a']);

    return (
        <motion.nav
            style={{ background, backdropFilter, WebkitBackdropFilter: backdropFilter, color }}
            className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 rounded-2xl px-5 py-3 md:top-6 md:px-7"
        >
            <div className="flex items-center justify-between">
                <a
                    href="#"
                    className="text-inherit no-underline"
                    aria-label={content.brand.name}
                >
                    <span className="text-lg font-semibold tracking-[0.4em]">
                        {content.brand.wordmark}
                    </span>
                </a>

                <div className="hidden items-center gap-9 md:flex">
                    {content.nav.links.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="group relative text-sm font-medium text-inherit no-underline"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 block h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={content.nav.cta.href}
                        className="bg-aluma-ink hidden rounded-full px-5 py-2.5 text-sm font-medium text-white no-underline transition-transform hover:scale-105 active:scale-95 sm:block"
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

            {/* `MN-02` — animates to content height with nothing measured. */}
            <MobileMenu
                variant="collapse"
                open={open}
                onClose={() => setOpen(false)}
                duration={300}
                className="md:hidden"
                panelClassName="flex flex-col gap-1 pt-4"
            >
                {content.nav.links.map(link => (
                    <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-2.5 text-sm font-medium text-inherit no-underline hover:bg-current/5"
                    >
                        {link.label}
                    </a>
                ))}
                <a
                    href={content.nav.cta.href}
                    onClick={() => setOpen(false)}
                    className="bg-aluma-ink mt-2 rounded-full px-5 py-2.5 text-center text-sm font-medium text-white no-underline sm:hidden"
                >
                    {content.nav.cta.label}
                </a>
            </MobileMenu>
        </motion.nav>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `HR-01` + `MD-02` + `MD-07` + `MO-08` + `AT-06` + `AT-07`. */
function Hero() {
    const { hero, brand } = content;

    return (
        <section className="bg-aluma-ink relative flex min-h-screen flex-col overflow-hidden">
            <CrossfadeVideo src={hero.video} playbackRate={HERO_PLAYBACK} crossfadeSeconds={2}>
                {/* `MD-07`: a vertical ramp to seat the type top and bottom, and
                 * a vignette so the corners do not glow under the nav. */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgb(0_0_0/0.45)_100%)]" />
            </CrossfadeVideo>

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pt-32 pb-12">
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <FadeIn y={16}>
                        <span className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-[11px] font-semibold tracking-[0.28em] text-white/90 uppercase backdrop-blur-md">
                            {hero.eyebrow}
                        </span>
                    </FadeIn>

                    {/* `MO-08` BlurText — built for headings over video. */}
                    <BlurText
                        as="h1"
                        text={hero.heading}
                        className="font-cormorant m-0 mt-8 max-w-4xl justify-center text-5xl leading-[0.95] font-medium text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]"
                    />

                    <FadeIn delay={0.35} className="mt-8 max-w-xl">
                        <p className="m-0 text-base leading-relaxed text-white/85 md:text-lg">
                            {hero.body}
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.5} className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        {hero.actions.map(action => (
                            <a
                                key={action.label}
                                href={action.href}
                                className={
                                    action.variant === 'solid'
                                        ? 'text-aluma-ink group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-semibold no-underline transition-transform hover:scale-105 active:scale-95'
                                        : 'inline-flex items-center gap-2.5 rounded-full border border-white/40 px-8 py-4 text-sm font-medium text-white no-underline transition-colors hover:border-white hover:bg-white/10'
                                }
                            >
                                {action.label}
                                <ArrowRight
                                    size={16}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </a>
                        ))}
                    </FadeIn>
                </div>

                {/* `AT-07` — the NaturaVista mouse pill, on `.animate-scroll-dot`. */}
                <FadeIn delay={0.7} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-semibold tracking-[0.28em] text-white/70 uppercase">
                        {hero.scrollHint}
                    </span>
                    <span className="flex h-6 w-4 justify-center rounded-full border border-white/50 pt-1">
                        <span className="animate-scroll-dot h-1.5 w-[2px] rounded-full bg-white" />
                    </span>
                </FadeIn>
            </div>

            <span className="sr-only">
                {brand.name}, {brand.place}, {brand.region}
            </span>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `MO-08` AnimatedText + `AT-03` stats. */
function Welcome() {
    const { welcome, stats } = content;

    return (
        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <p className="text-aluma-brass m-0 mb-8 text-xs font-semibold tracking-[0.3em] uppercase">
                {welcome.eyebrow}
            </p>

            {/* The one shared reveal that is scroll-*linked* rather than fired on
             * entry: characters lift as the paragraph crosses the frame. */}
            <AnimatedText
                text={welcome.statement}
                className="font-cormorant text-aluma-ink m-0 max-w-4xl text-2xl leading-[1.3] font-medium md:text-4xl"
            />

            <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
                {welcome.body.map((paragraph, i) => (
                    <FadeIn key={paragraph.slice(0, 24)} delay={i * 0.1}>
                        <p className="text-aluma-stone m-0 leading-relaxed">{paragraph}</p>
                    </FadeIn>
                ))}
            </div>

            <div className="border-aluma-ink/10 mt-20 grid grid-cols-2 gap-8 border-t pt-12 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <FadeIn key={stat.label} delay={i * 0.08}>
                        <p className="font-cormorant text-aluma-ink m-0 text-5xl leading-none font-medium">
                            {stat.value}
                        </p>
                        <p className="text-aluma-stone m-0 mt-3 text-sm">{stat.label}</p>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `SC-06` — framer variant, track duplicated so the wrap is seamless. */
function PressTicker() {
    const track = [...content.press, ...content.press];

    return (
        <section className="border-aluma-ink/10 relative overflow-hidden border-y py-6">
            <motion.div
                className="flex w-max items-center gap-14 pr-14"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 45, ease: 'linear', repeat: Infinity }}
            >
                {track.map((item, i) => (
                    <span
                        key={`${item}-${i}`}
                        className="text-aluma-stone text-xs font-semibold tracking-[0.25em] whitespace-nowrap uppercase"
                    >
                        {item}
                    </span>
                ))}
            </motion.div>

            <div className="from-aluma-mist pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent" />
            <div className="from-aluma-mist pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l to-transparent" />
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * Catalogue `CD-01`, the framer `flexGrow` variant.
 *
 * `flex: 4` is three values in a trench coat, so the tween is given
 * `flexGrow` against a fixed `flex-basis: 0` instead — 4 against 0.8 produces
 * the ratios the layout wants and interpolates cleanly.
 */
function Suites() {
    const [activeIdx, setActiveIdx] = useState(0);
    const { suites } = content;

    return (
        <section id="stay" className="bg-aluma-ink px-6 py-24 md:py-32">
            <div className="mx-auto max-w-[1400px]">
                <SectionHeading eyebrow={suites.eyebrow} heading={suites.heading} tone="light" />

                <div className="flex h-auto flex-col gap-3 md:h-[520px] md:flex-row">
                    {suites.items.map((suite, i) => {
                        const active = i === activeIdx;
                        return (
                            <motion.button
                                key={suite.name}
                                type="button"
                                onMouseEnter={() => setActiveIdx(i)}
                                onFocus={() => setActiveIdx(i)}
                                onClick={() => setActiveIdx(i)}
                                animate={{ flexGrow: active ? 4 : 0.8 }}
                                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                                style={{ flexBasis: 0, flexShrink: 1 }}
                                aria-expanded={active}
                                className="group relative h-72 min-w-0 cursor-pointer overflow-hidden rounded-3xl border-none p-0 text-left md:h-auto"
                            >
                                <img
                                    src={suite.image}
                                    alt={`${suite.name} — ${suite.kind}`}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div
                                    className={`absolute inset-0 transition-colors duration-700 ${
                                        active
                                            ? 'bg-gradient-to-t from-black/85 via-black/25 to-transparent'
                                            : 'bg-black/60'
                                    }`}
                                />

                                <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
                                    <span className="text-aluma-brass text-[11px] font-semibold tracking-[0.25em] uppercase">
                                        {suite.kind} · {suite.size}
                                    </span>

                                    {/* Collapsed panels are far too narrow for a
                                     * 3xl name, so on desktop they set it on its
                                     * side instead of truncating it. */}
                                    <h3
                                        className={`font-cormorant m-0 mt-2 text-3xl font-medium text-white md:text-4xl ${
                                            active
                                                ? ''
                                                : 'md:[writing-mode:vertical-rl] md:rotate-180'
                                        }`}
                                    >
                                        {suite.name}
                                    </h3>

                                    <div
                                        className={`overflow-hidden transition-[max-height,opacity] duration-700 ${
                                            active ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <p className="m-0 mt-4 max-w-md leading-relaxed text-white/85">
                                            {suite.body}
                                        </p>
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {suite.features.map(feature => (
                                                <span
                                                    key={feature}
                                                    className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/85"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-aluma-mist m-0 mt-6 text-sm">
                                            From {suite.from} a night
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `CD-04` — quarter-disc corner, icon named by the JSON. */
function Experiences() {
    const { experiences } = content;

    return (
        <section id="experiences" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <SectionHeading eyebrow={experiences.eyebrow} heading={experiences.heading} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {experiences.items.map((item, i) => (
                    <FadeIn
                        key={item.title}
                        delay={i * 0.1}
                        className="border-aluma-ink/10 relative overflow-hidden rounded-3xl border bg-white/60 p-8 backdrop-blur-sm"
                    >
                        <div className="from-aluma-water/15 to-aluma-brass/15 absolute top-0 right-0 flex h-24 w-24 items-start justify-end rounded-bl-full bg-gradient-to-br p-5">
                            <Icon name={item.icon} size={22} className="text-aluma-water" />
                        </div>

                        <h3 className="font-cormorant text-aluma-ink m-0 mt-16 mb-3 max-w-[16ch] text-2xl font-medium md:text-3xl">
                            {item.title}
                        </h3>
                        <p className="text-aluma-stone m-0 max-w-md leading-relaxed">{item.body}</p>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `SC-05` — parallax plate, measured against the frame. */
function Valley() {
    const frameRef = useScrollFrame();
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: frameRef,
        offset: ['start end', 'end start'],
    });
    const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
    const { valley } = content;

    return (
        <section ref={sectionRef} className="bg-aluma-ink relative overflow-hidden py-28 md:py-40">
            <motion.img
                src={valley.image}
                alt=""
                aria-hidden="true"
                style={{ y }}
                className="pointer-events-none absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover opacity-45"
            />
            <div className="from-aluma-ink via-aluma-ink/55 to-aluma-ink pointer-events-none absolute inset-0 bg-gradient-to-b" />

            <div className="relative mx-auto max-w-6xl px-6">
                <FadeIn>
                    <p className="text-aluma-brass m-0 mb-4 text-xs font-semibold tracking-[0.3em] uppercase">
                        {valley.eyebrow}
                    </p>
                    <h2 className="font-cormorant m-0 max-w-3xl text-4xl leading-[1.05] font-medium text-white md:text-6xl">
                        {valley.heading}
                    </h2>
                    <p className="m-0 mt-8 max-w-xl leading-relaxed text-white/80">{valley.body}</p>
                </FadeIn>

                <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
                    {valley.points.map((point, i) => (
                        <FadeIn key={point.title} delay={i * 0.12}>
                            <h3 className="font-cormorant m-0 text-xl font-medium text-white">
                                {point.title}
                            </h3>
                            <p className="m-0 mt-3 leading-relaxed text-white/70">{point.body}</p>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `CD-03` — image card grid. */
function Dining() {
    const { dining } = content;

    return (
        <section id="dining" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <SectionHeading eyebrow={dining.eyebrow} heading={dining.heading} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {dining.venues.map((venue, i) => (
                    <FadeIn key={venue.name} delay={i * 0.1} className="group">
                        <div className="aspect-[4/5] overflow-hidden rounded-3xl">
                            <img
                                src={venue.image}
                                alt={venue.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="pt-6">
                            <div className="flex items-baseline justify-between gap-3">
                                <h3 className="font-cormorant text-aluma-ink m-0 text-2xl font-medium">
                                    {venue.name}
                                </h3>
                                <span className="text-aluma-brass text-xs font-semibold tracking-[0.2em] uppercase">
                                    {venue.kind}
                                </span>
                            </div>
                            <p className="text-aluma-water m-0 mt-2 text-sm">{venue.hours}</p>
                            <p className="text-aluma-stone m-0 mt-3 leading-relaxed">{venue.body}</p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Second `MD-02` surface — split, video left, copy right. */
function Bathhouse() {
    const { spa } = content;

    return (
        <section className="bg-aluma-ink relative overflow-hidden">
            <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-stretch lg:grid-cols-2">
                <div className="relative min-h-[360px] lg:min-h-[600px]">
                    <CrossfadeVideo src={spa.video} playbackRate={0.75} crossfadeSeconds={1.6}>
                        <div className="absolute inset-0 bg-black/25" />
                    </CrossfadeVideo>
                </div>

                <div className="flex flex-col justify-center px-6 py-20 md:px-16">
                    <FadeIn>
                        <p className="text-aluma-brass m-0 mb-4 text-xs font-semibold tracking-[0.3em] uppercase">
                            {spa.eyebrow}
                        </p>
                        <h2 className="font-cormorant m-0 max-w-lg text-4xl leading-[1.05] font-medium text-white md:text-5xl">
                            {spa.heading}
                        </h2>
                        <p className="m-0 mt-8 max-w-md leading-relaxed text-white/80">{spa.body}</p>
                        <a
                            href={spa.action.href}
                            className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-white/40 px-7 py-3.5 text-sm font-medium text-white no-underline transition-colors hover:border-white hover:bg-white/10"
                        >
                            {spa.action.label}
                            <ArrowUpRight
                                size={16}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </a>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue-adjacent: the Basilico testimonial carousel, keyed to replay. */
function Testimonials() {
    const [index, setIndex] = useState(0);
    const { testimonials } = content;
    const active = testimonials.items[index];

    return (
        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <SectionHeading eyebrow={testimonials.eyebrow} heading={testimonials.heading} />

            <div className="border-aluma-ink/10 rounded-3xl border bg-white/60 p-10 backdrop-blur-sm md:p-16">
                <Quote className="text-aluma-water/35 mb-8" size={40} />

                <motion.blockquote
                    key={active.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="m-0"
                >
                    <p className="font-cormorant text-aluma-ink m-0 text-2xl leading-[1.35] font-medium md:text-3xl">
                        {active.quote}
                    </p>
                    <footer className="mt-8">
                        <p className="text-aluma-ink m-0 text-sm font-semibold">{active.name}</p>
                        <p className="text-aluma-stone m-0 mt-1 text-xs tracking-[0.2em] uppercase">
                            {active.detail}
                        </p>
                    </footer>
                </motion.blockquote>

                <div className="mt-12 flex items-center gap-3">
                    {testimonials.items.map((item, i) => (
                        <button
                            key={item.name}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Read what ${item.name} wrote`}
                            aria-current={i === index}
                            className={`h-1.5 cursor-pointer rounded-full border-none transition-all duration-500 ${
                                i === index ? 'bg-aluma-water w-10' : 'bg-aluma-ink/20 w-4'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `CD-06` — asymmetric masonry, spans named by the JSON. */
function Gallery() {
    const { gallery } = content;

    return (
        <section id="gallery" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <SectionHeading eyebrow={gallery.eyebrow} heading={gallery.heading} />

            <div className="grid auto-rows-[220px] grid-cols-2 gap-4 sm:grid-cols-4">
                {gallery.items.map((item, i) => (
                    <FadeIn
                        key={item.src}
                        delay={i * 0.06}
                        className={`group overflow-hidden rounded-2xl ${
                            GALLERY_SPANS[item.span] ?? ''
                        }`}
                    >
                        <img
                            src={item.src}
                            alt={item.alt}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

const FIELD_CLASS =
    'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white ' +
    'outline-none transition-colors focus:border-aluma-brass/70';

/* The popovers of `./shared/Select` and `./shared/DateField`, tinted to this
 * template. Both components ship structure and behaviour only. */
const MENU_CLASS = 'border-white/12 bg-[#162423]/95';

function Enquiry() {
    const [sent, setSent] = useState(false);
    const { enquiry, suites } = content;
    const { fields } = enquiry;

    return (
        <section id="enquiry" className="bg-aluma-ink relative overflow-hidden py-24 md:py-32">
            <div className="bg-aluma-brass/12 pointer-events-none absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]" />

            <div className="relative mx-auto max-w-3xl px-6">
                <FadeIn className="text-center">
                    <p className="text-aluma-brass m-0 mb-4 text-xs font-semibold tracking-[0.3em] uppercase">
                        {enquiry.eyebrow}
                    </p>
                    <h2 className="font-cormorant m-0 text-4xl leading-[1.05] font-medium text-white md:text-5xl">
                        {enquiry.heading}
                    </h2>
                    <p className="m-0 mt-6 leading-relaxed text-white/75">{enquiry.body}</p>
                </FadeIn>

                <FadeIn
                    delay={0.15}
                    className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md md:p-10"
                >
                    <form
                        onSubmit={event => {
                            event.preventDefault();
                            setSent(true);
                        }}
                        className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                    >
                        <Field id="aluma-arrival" label={fields.arrival}>
                            <DateField
                                name="arrival"
                                placeholder={enquiry.datePlaceholder}
                                locale="en-GB"
                                className={FIELD_CLASS}
                                menuClassName={MENU_CLASS}
                                aria-labelledby="aluma-arrival-label"
                            />
                        </Field>

                        <Field id="aluma-nights" label={fields.nights}>
                            <Select
                                name="nights"
                                options={enquiry.nightOptions}
                                defaultValue={enquiry.nightOptions[1]}
                                className={FIELD_CLASS}
                                menuClassName={MENU_CLASS}
                                aria-labelledby="aluma-nights-label"
                            />
                        </Field>

                        <Field id="aluma-guests" label={fields.guests}>
                            <Select
                                name="guests"
                                options={enquiry.guestOptions}
                                defaultValue={enquiry.guestOptions[1]}
                                className={FIELD_CLASS}
                                menuClassName={MENU_CLASS}
                                aria-labelledby="aluma-guests-label"
                            />
                        </Field>

                        {/* The room list is the suites list — one source, so a
                         * new suite in the JSON appears here automatically. */}
                        <Field id="aluma-suite" label={fields.suite}>
                            <Select
                                name="suite"
                                options={suites.items.map(suite => suite.name)}
                                defaultValue={suites.items[0].name}
                                className={FIELD_CLASS}
                                menuClassName={MENU_CLASS}
                                aria-labelledby="aluma-suite-label"
                            />
                        </Field>

                        <Field id="aluma-email" label={fields.email} className="sm:col-span-2">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="you@example.com"
                                aria-labelledby="aluma-email-label"
                                className={FIELD_CLASS}
                            />
                        </Field>

                        <Field id="aluma-notes" label={fields.notes} className="sm:col-span-2">
                            <textarea
                                rows={4}
                                name="notes"
                                placeholder={enquiry.notesPlaceholder}
                                aria-labelledby="aluma-notes-label"
                                className={`${FIELD_CLASS} resize-none`}
                            />
                        </Field>

                        <div className="flex flex-col items-center gap-4 sm:col-span-2 sm:flex-row sm:justify-between">
                            <p aria-live="polite" className="text-aluma-brass m-0 text-sm">
                                {sent ? enquiry.success : ' '}
                            </p>
                            <button
                                type="submit"
                                className="text-aluma-ink group inline-flex cursor-pointer items-center gap-2.5 rounded-full border-none bg-white px-8 py-4 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                            >
                                {enquiry.submit}
                                <ArrowRight
                                    size={16}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </button>
                        </div>
                    </form>
                </FadeIn>
            </div>
        </section>
    );
}

/**
 * A labelled field group.
 *
 * Deliberately a `div` with an id'd `<span>` rather than a `<label>`: `<button>`
 * is a labelable element, so a wrapping label forwards its own click to the
 * trigger inside — which would fight the control's handler and toggle the
 * popover twice. Children take `aria-labelledby` instead, which is what the
 * custom controls expect and works identically for the native inputs.
 */
function Field({ id, label, className = '', children }) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <span
                id={`${id}-label`}
                className="text-xs font-semibold tracking-[0.2em] text-white/60 uppercase"
            >
                {label}
            </span>
            {children}
        </div>
    );
}

/* -------------------------------------------------------------------------- */

/** Catalogue `FT-01` structure with `FT-03`'s contact and newsletter columns. */
function Footer() {
    const { footer, brand } = content;

    return (
        <footer className="bg-aluma-ink border-t border-white/10">
            <FadeIn className="mx-auto flex max-w-6xl flex-col items-center gap-9 px-6 py-24 text-center md:py-32">
                <h2 className="font-cormorant m-0 max-w-3xl text-4xl leading-[1.05] font-medium text-white md:text-6xl">
                    {footer.cta.heading}
                </h2>
                <a
                    href={footer.cta.href}
                    className="text-aluma-ink group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-semibold no-underline transition-transform hover:scale-105 active:scale-95"
                >
                    {footer.cta.label}
                    <ArrowUpRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                    />
                </a>
            </FadeIn>

            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 border-t border-white/10 px-6 py-16 lg:grid-cols-5">
                <div className="col-span-2">
                    <p className="m-0 text-sm font-semibold tracking-[0.4em] text-white">
                        {brand.wordmark}
                    </p>
                    <p className="m-0 mt-4 max-w-xs leading-relaxed text-white/60">
                        {footer.blurb}
                    </p>
                </div>

                {footer.columns.map(column => (
                    <div key={column.title}>
                        <p className="m-0 mb-4 text-xs font-semibold tracking-[0.25em] text-white/40 uppercase">
                            {column.title}
                        </p>
                        <ul className="m-0 flex list-none flex-col gap-3 p-0">
                            {column.links.map(link => (
                                <li key={link}>
                                    <a
                                        href="#enquiry"
                                        className="text-sm text-white/70 no-underline transition-colors hover:text-white"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="flex flex-col gap-5">
                    {footer.contact.map(item => (
                        <div key={item.lines[0]} className="flex gap-3">
                            <Icon
                                name={item.icon}
                                size={16}
                                className="text-aluma-brass mt-0.5 shrink-0"
                            />
                            <div>
                                {item.lines.map(line => (
                                    <p
                                        key={line}
                                        className="m-0 text-sm leading-relaxed text-white/70"
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mx-auto max-w-6xl border-t border-white/10 px-6 py-12">
                <div className="max-w-md">
                    <p className="m-0 text-sm font-semibold text-white">
                        {footer.newsletter.title}
                    </p>
                    <p className="m-0 mt-2 text-sm leading-relaxed text-white/60">
                        {footer.newsletter.body}
                    </p>
                    <form
                        onSubmit={event => event.preventDefault()}
                        className="mt-5 flex items-center gap-2"
                    >
                        <label className="sr-only" htmlFor="aluma-newsletter">
                            {footer.newsletter.placeholder}
                        </label>
                        <input
                            id="aluma-newsletter"
                            type="email"
                            placeholder={footer.newsletter.placeholder}
                            className={FIELD_CLASS}
                        />
                        <button
                            type="submit"
                            aria-label={footer.newsletter.action}
                            className="text-aluma-ink flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border-none bg-white transition-transform hover:scale-105 active:scale-95"
                        >
                            <Mail size={18} />
                        </button>
                    </form>
                </div>
            </div>

            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-8 text-xs text-white/40 sm:flex-row">
                <span>
                    © {YEAR} {footer.copyright} · Est. {brand.established}
                </span>
                <div className="flex gap-6">
                    {footer.legal.map(item => (
                        <a
                            key={item}
                            href="#enquiry"
                            className="text-white/40 no-underline hover:text-white/70"
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------------- */

export default function Aluma() {
    return (
        <PageFrame
            title={content.brand.documentTitle}
            className="type-jakarta bg-aluma-mist"
        >
            <BackButton fixed top={96} left={28} />
            <Navbar />
            <main>
                <Hero />
                <Welcome />
                <PressTicker />
                <Suites />
                <Experiences />
                <Valley />
                <Dining />
                <Bathhouse />
                <Testimonials />
                <Gallery />
                <Enquiry />
            </main>
            <Footer />
        </PageFrame>
    );
}
