import React, { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Check, Flower2, Leaf, Menu, Quote, X } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import MobileMenu from './shared/MobileMenu.jsx';
import SectionHeading from './shared/SectionHeading.jsx';
import SectionReveal from './shared/SectionReveal.jsx';
import TestimonialCarousel from './shared/TestimonialCarousel.jsx';
import RadioGroup from './shared/Radio.jsx';
import Slider from './shared/Slider.jsx';
import { useReducedMotion } from './shared/reducedMotion.js';
import { useScrollFrame } from './shared/frameContext.js';

/**
 * Mindful — a meditation app: left-aligned type on a dark, slow clip, and a
 * page underneath it that keeps the same unhurried pace.
 *
 * ─── The hero's three overlays ───────────────────────────────────────────────
 *
 * Legibility work, not decoration. The flat `black/30` sets a floor; the
 * left-anchored horizontal ramp is what actually buys the contrast, darkening
 * the hemisphere the text occupies while leaving the right of the frame as
 * footage; the bottom-anchored vertical one keeps the buttons off a bright
 * patch. Together they hold the copy at high contrast whichever second of the
 * loop is showing, which is why the design can leave the video ungraded.
 *
 * `bg-slate-900` on the wrapper is the same value as the clip's darkest region,
 * so the first paint and the first frame look alike and nothing shifts when the
 * video arrives.
 *
 * ─── One motion idea, inherited everywhere ───────────────────────────────────
 *
 * The brief writes the entrance as a Framer variant tree — `staggerChildren` on
 * a container, one shared child variant — so it is built that way rather than as
 * five delayed animations: the cascade is described once and every item inherits
 * it. `CONTAINER`/`ITEM` below are that pair, and every section on the page
 * reuses them rather than inventing its own timing.
 *
 * This is deliberately the opposite of `Vex`, which puts forty CSS transitions
 * on screen and no motion components at all. Both are correct; the deciding
 * factor is element count, and this page has sections of four and five items
 * where inheritance is worth more than the loops it costs.
 *
 * ─── The one thing that is not Framer ────────────────────────────────────────
 *
 * `Breathe`, the CTA's expanding ring. It runs forever, and a permanent
 * animation loop for a decorative pulse is the case CSS keyframes exist for.
 */

const HERO_VIDEO = '/assets/mindful/hero.mp4';
const STILL = name => `/assets/mindful/stills/${name}.webp`;

const NAV_LEFT = [
    { label: 'Home', href: '#top' },
    { label: 'Practices', href: '#practices' },
];
const NAV_RIGHT = [
    { label: 'Journal', href: '#voices' },
    { label: 'Community', href: '#plans' },
];

const NAV_ALL = [...NAV_LEFT, ...NAV_RIGHT];

/* Slow and decelerating — an ease that arrives rather than lands. */
const EASE = [0.16, 1, 0.3, 1];

const CONTAINER = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const ITEM = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/** The same cascade, tightened for sections entering mid-page. */
const SECTION = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const PRACTICE = [
    {
        time: 'On waking',
        title: 'Arrive before the day does',
        body: 'Six minutes of breath before the first screen. The whole practice rests on this one, and it is the one people skip.',
        still: 'practice-01',
    },
    {
        time: 'Mid-morning',
        title: 'One thing, fully',
        body: 'A single task held without switching. Not productivity — attention, practised in the place it is hardest.',
        still: 'practice-02',
    },
    {
        time: 'Late afternoon',
        title: 'Put the day down',
        body: 'The handover most people never make, which is why the evening keeps carrying the afternoon.',
        still: 'practice-03',
    },
    {
        time: 'Before sleep',
        title: 'Let the loop finish',
        body: 'A guided descent that ends the replay rather than arguing with it.',
        still: 'retreat',
    },
];

const SESSIONS = [
    { name: 'First Breath', minutes: 6, tags: ['Beginner', 'Breath'] },
    { name: 'The Long Exhale', minutes: 12, tags: ['Anxiety', 'Breath'] },
    { name: 'Unhooking', minutes: 18, tags: ['Focus'] },
    { name: 'Body Scan, Slow', minutes: 25, tags: ['Sleep', 'Body'] },
    { name: 'Sitting With It', minutes: 32, tags: ['Grief', 'Advanced'] },
    { name: 'The Hour', minutes: 60, tags: ['Retreat', 'Advanced'] },
];

const VOICES = [
    {
        name: 'Priya Raghunathan',
        title: 'Six months in',
        quote: 'I had tried four of these. This is the first one that did not feel like homework — it asks for six minutes and it means six minutes.',
    },
    {
        name: 'Tomas Lindqvist',
        title: 'Two years in',
        quote: 'The evening session ended a decade of lying awake rerunning meetings. I do not know how else to put it.',
    },
    {
        name: 'Adaeze Nwosu',
        title: 'A year in',
        quote: 'What changed was not the sitting. It was the ten minutes after, which I now notice I have.',
    },
];

const PLANS = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: '£9',
        note: 'per month, cancel any time',
        detail: 'Everything, billed as you go.',
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: '£69',
        note: 'per year — two months free',
        detail: 'Everything, and the retreat archive.',
        featured: true,
    },
    {
        id: 'lifetime',
        name: 'Lifetime',
        price: '£240',
        note: 'once',
        detail: 'Everything, permanently, including what we have not made yet.',
    },
];

/* -------------------------------------------------------------------------- */

function NavLink({ label, href }) {
    return (
        <a
            href={href}
            className="hidden text-sm font-medium tracking-wide text-white/90 no-underline transition-colors hover:text-white sm:block md:text-base"
        >
            {label}
        </a>
    );
}

/**
 * `NV-06` — links split around a centred circular mark, now with the mobile
 * menu it never had. `MobileMenu`'s `sheet` variant docks it to the bottom
 * edge, which is where a thumb is; an overlay would have covered a hero whose
 * whole argument is the footage.
 */
function Navbar({ menuOpen, onToggleMenu, onNavigate }) {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex w-full items-center justify-center gap-6 py-8 md:gap-16"
        >
            {NAV_LEFT.map(link => (
                <NavLink key={link.label} {...link} />
            ))}

            <a
                href="#top"
                aria-label="Mindful home"
                className="mx-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white text-white no-underline transition-colors hover:bg-white/10 md:mx-6"
            >
                <Flower2 size={24} strokeWidth={1.2} />
            </a>

            {NAV_RIGHT.map(link => (
                <NavLink key={link.label} {...link} />
            ))}

            <button
                type="button"
                onClick={onToggleMenu}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="absolute right-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-transparent text-white sm:hidden"
            >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <MobileMenu
                variant="sheet"
                from="bottom"
                open={menuOpen}
                onClose={onNavigate}
                stagger={60}
                staggerDelay={100}
                panelClassName="rounded-t-3xl bg-slate-950 px-8 pt-10 pb-12"
                className="sm:hidden"
            >
                {NAV_ALL.map((link, i) => (
                    <MobileMenu.Item key={link.label} index={i}>
                        <a
                            href={link.href}
                            onClick={onNavigate}
                            className="font-playfair block py-3 text-2xl font-normal text-white no-underline"
                        >
                            {link.label}
                        </a>
                    </MobileMenu.Item>
                ))}

                <MobileMenu.Item index={NAV_ALL.length}>
                    <a
                        href="#plans"
                        onClick={onNavigate}
                        className="bg-mindful-teal mt-6 inline-block rounded-full px-8 py-3.5 font-medium text-white no-underline"
                    >
                        Start Your Journey
                    </a>
                </MobileMenu.Item>
            </MobileMenu>
        </motion.nav>
    );
}

/* -------------------------------------------------------------------------- */

function Hero({ menuOpen, onToggleMenu, onNavigate }) {
    return (
        <section id="top" className="relative min-h-svh w-full overflow-hidden">
            <video
                src={HERO_VIDEO}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover"
            />
            <div className="pointer-events-none absolute inset-0 z-0 bg-black/30" />
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-transparent" />
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1536px] flex-col px-6 md:px-12 lg:px-24">
                <Navbar
                    menuOpen={menuOpen}
                    onToggleMenu={onToggleMenu}
                    onNavigate={onNavigate}
                />

                <motion.div
                    variants={CONTAINER}
                    initial="hidden"
                    animate="show"
                    className="flex max-w-2xl flex-1 flex-col justify-center pt-10 pb-24"
                >
                    <motion.p
                        variants={ITEM}
                        className="text-mindful-gold m-0 mb-6 text-sm font-medium tracking-wide md:text-base"
                    >
                        Small Steps. Lasting Change.
                    </motion.p>

                    <motion.h1
                        variants={ITEM}
                        className="font-playfair m-0 mb-8 text-3xl leading-[1.1] font-normal text-white md:text-4xl lg:text-5xl"
                    >
                        Calm Your Mind,
                        <br />
                        Transform Your Life.
                    </motion.h1>

                    <motion.div variants={ITEM} className="mb-8 flex items-center gap-4">
                        <Leaf size={20} strokeWidth={1.5} className="text-mindful-gold" />
                        <span className="bg-mindful-gold/30 h-px w-32" />
                    </motion.div>

                    <motion.p
                        variants={ITEM}
                        className="m-0 mb-10 max-w-lg text-lg leading-relaxed font-light text-white/80 md:text-xl"
                    >
                        Daily practices to reduce stress, build mindfulness, and create a life of
                        balance and purpose.
                    </motion.p>

                    <motion.div
                        variants={ITEM}
                        className="flex flex-col gap-4 sm:flex-row sm:items-center"
                    >
                        <a
                            href="#plans"
                            className="group bg-mindful-teal inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-medium text-white no-underline transition-colors hover:bg-[#47c4c9]"
                        >
                            Start Your Journey
                            <ArrowRight
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </a>

                        <a
                            href="#practices"
                            className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/40 bg-transparent px-8 py-4 font-medium text-white no-underline transition-colors hover:border-white hover:bg-white/5"
                        >
                            Learn More
                            <ArrowRight
                                size={18}
                                className="opacity-70 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                            />
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The day, as a vertical rail whose line fills as the section scrolls.
 *
 * ─── The rail is one element, not four ───────────────────────────────────────
 *
 * A gold line is drawn at full height behind the entries at 15% opacity, and a
 * second copy on top has its `scaleY` driven by the section's scroll progress.
 * Giving each entry its own progress-linked segment would mean four
 * `useScroll`s measuring four targets, and the joins between them would show.
 *
 * `transformOrigin: top` — scaling a line about its centre grows it in both
 * directions from the middle, which is not what "filling in" looks like.
 *
 * ─── `useScrollFrame()`, and a spring on top ─────────────────────────────────
 *
 * `container` is the frame. Without it `useScroll` measures the window, whose
 * `scrollY` is a constant zero here, and the line sits empty forever — the
 * failure is silent, which is what makes it worth stating at every call site.
 *
 * The spring is what keeps this page's pace: raw scroll progress makes the line
 * twitch with the trackpad, and a low-stiffness spring turns the same input
 * into something that follows rather than tracks.
 */
function Practices() {
    const railRef = useRef(null);
    const frame = useScrollFrame();
    const reduced = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: railRef,
        container: frame ?? undefined,
        offset: ['start 70%', 'end 60%'],
    });

    const smoothed = useSpring(scrollYProgress, {
        stiffness: 60,
        damping: 24,
        restDelta: 0.001,
    });
    const scaleY = useTransform(smoothed, [0, 1], [0, 1]);

    return (
        <section id="practices" className="relative bg-slate-950 py-24 md:py-32">
            <div className="mx-auto w-full max-w-[1536px] px-6 md:px-12 lg:px-24">
                <SectionHeading
                    eyebrow="The shape of a day"
                    title="Four moments, not forty"
                    lead="The programme is deliberately small. Four practices, each in the place the day actually needs it."
                    align="center"
                    layout="stacked"
                    className="mx-auto max-w-2xl"
                    eyebrowClassName="text-mindful-gold text-xs tracking-[0.3em] uppercase"
                    titleClassName="font-playfair text-3xl font-normal text-white md:text-4xl lg:text-5xl"
                    leadClassName="mt-5 max-w-xl text-base leading-relaxed font-light text-white/70"
                />

                <div ref={railRef} className="relative mt-20 md:mt-28">
                    {/* The unfilled rail. */}
                    <div className="bg-mindful-gold/15 absolute top-0 bottom-0 left-[11px] w-px md:left-1/2 md:-translate-x-1/2" />

                    {/* The filled one, scaled by progress. */}
                    <motion.div
                        aria-hidden="true"
                        className="bg-mindful-gold absolute top-0 bottom-0 left-[11px] w-px origin-top md:left-1/2 md:-translate-x-1/2"
                        style={{ scaleY: reduced ? 1 : scaleY }}
                    />

                    <ol className="m-0 flex list-none flex-col gap-16 p-0 md:gap-24">
                        {PRACTICE.map((entry, i) => (
                            <motion.li
                                key={entry.title}
                                variants={SECTION}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: '-15%' }}
                                className="relative grid grid-cols-[24px_1fr] gap-6 md:grid-cols-2 md:gap-16"
                            >
                                {/* The node, sitting on the rail. */}
                                <motion.span
                                    variants={ITEM}
                                    aria-hidden="true"
                                    className="bg-mindful-gold relative z-10 mt-2 block h-[7px] w-[7px] rounded-full md:absolute md:top-2 md:left-1/2 md:-translate-x-1/2"
                                />

                                <motion.div
                                    variants={ITEM}
                                    className={
                                        i % 2 === 0
                                            ? 'md:pr-16 md:text-right'
                                            : 'md:order-2 md:pl-16'
                                    }
                                >
                                    <p className="text-mindful-teal m-0 text-xs tracking-[0.25em] uppercase">
                                        {entry.time}
                                    </p>
                                    <h3 className="font-playfair m-0 mt-3 text-2xl font-normal text-white md:text-3xl">
                                        {entry.title}
                                    </h3>
                                    <p className="m-0 mt-4 text-base leading-relaxed font-light text-white/65">
                                        {entry.body}
                                    </p>
                                </motion.div>

                                <motion.div
                                    variants={ITEM}
                                    className={`col-start-2 md:col-start-auto ${
                                        i % 2 === 0 ? 'md:order-2 md:pl-16' : 'md:pr-16'
                                    }`}
                                >
                                    <img
                                        src={STILL(entry.still)}
                                        alt=""
                                        loading="lazy"
                                        className="h-48 w-full rounded-2xl object-cover md:h-64"
                                    />
                                </motion.div>
                            </motion.li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The session library, filtered by how long the reader actually has.
 *
 * ─── A slider, not a set of buckets ──────────────────────────────────────────
 *
 * "Under 10 / 10–30 / 30+" would be three buttons and no new component. The
 * slider is the honest control because the question it answers is continuous —
 * the reader has the time they have — and because it is the one interaction on
 * the page that is *about* time, which is what the whole product is about.
 *
 * It is `./shared/Slider`, not `<input type="range">`. `ROADMAP.md` puts a
 * native range in the same category as a native `<select>`: the track and thumb
 * are OS pseudo-elements with different names per engine, and a 2px rail with an
 * 18px dot cannot be expressed through them.
 *
 * ─── Filtering is derived, not stored ────────────────────────────────────────
 *
 * One piece of state — the slider's value — and the visible list is computed
 * from it during render. Keeping a second `filtered` array in state would be two
 * sources of truth for one fact.
 *
 * ─── The empty case is designed ──────────────────────────────────────────────
 *
 * Dragging below six minutes leaves nothing, and a grid that silently becomes
 * blank reads as a broken page. `ROADMAP.md` lists `EmptyState` as a missing
 * primitive; this is the case that needs one, and it is four lines rather than a
 * component because it says something specific about the content.
 */
function Sessions() {
    const [maxMinutes, setMaxMinutes] = useState(60);

    const visible = useMemo(
        () => SESSIONS.filter(session => session.minutes <= maxMinutes),
        [maxMinutes]
    );

    return (
        <section id="sessions" className="relative bg-slate-900 py-24 md:py-32">
            <div className="mx-auto w-full max-w-[1536px] px-6 md:px-12 lg:px-24">
                <SectionHeading
                    eyebrow="Library"
                    title="However long you have"
                    lead="Sixty sessions, filtered by the only thing that matters at the moment of choosing."
                    eyebrowClassName="text-mindful-gold text-xs tracking-[0.3em] uppercase"
                    titleClassName="font-playfair text-3xl font-normal text-white md:text-4xl lg:text-5xl"
                    leadClassName="mt-5 max-w-md text-base leading-relaxed font-light text-white/70"
                    action={
                        <div className="w-full sm:w-64">
                            <div className="mb-3 flex items-baseline justify-between gap-4">
                                {/* An id'd span, not a `<label>` — see `FormField`. */}
                                <span
                                    id="duration-label"
                                    className="text-xs tracking-[0.2em] text-white/50 uppercase"
                                >
                                    Up to
                                </span>
                                <span className="text-mindful-gold text-lg tabular-nums">
                                    {maxMinutes} min
                                </span>
                            </div>
                            <Slider
                                value={maxMinutes}
                                onChange={setMaxMinutes}
                                min={5}
                                max={60}
                                step={1}
                                bigStep={10}
                                aria-labelledby="duration-label"
                                format={n => `${n} minutes`}
                                className="text-mindful-gold"
                                trackClassName="h-0.5 bg-white/15"
                            />
                        </div>
                    }
                />

                <div className="mt-14 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map(session => (
                        <SectionReveal
                            key={session.name}
                            duration={0.6}
                            className="bg-slate-900 p-7"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="font-playfair m-0 text-xl font-normal text-white">
                                    {session.name}
                                </h3>
                                <span className="text-mindful-teal shrink-0 text-sm tabular-nums">
                                    {session.minutes}′
                                </span>
                            </div>

                            <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
                                {session.tags.map(tag => (
                                    <li
                                        key={tag}
                                        className="rounded-full border border-white/15 px-3 py-1 text-[11px] tracking-wider text-white/60 uppercase"
                                    >
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        </SectionReveal>
                    ))}
                </div>

                {visible.length === 0 && (
                    <p className="m-0 mt-14 border border-dashed border-white/15 p-12 text-center text-base font-light text-white/50">
                        Nothing this short yet. The shortest practice is six minutes — which is,
                        deliberately, about as brief as this can be and still be worth sitting for.
                    </p>
                )}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * Reviews, through `./shared/TestimonialCarousel`.
 *
 * `autoplay` is on here and off in its other callers, and this is the page it
 * suits: the quotes are short, the section is a pause between two dense ones,
 * and the component stops permanently the moment anyone touches it. It does not
 * run at all under reduced motion.
 */
function Voices() {
    return (
        <section id="voices" className="relative bg-slate-950 py-24 md:py-32">
            <div className="mx-auto w-full max-w-4xl px-6 text-center md:px-12">
                <TestimonialCarousel
                    items={VOICES}
                    autoplay
                    interval={9000}
                    labelFor={item => `${item.name}, ${item.title}`}
                    className="text-mindful-gold"
                    dotsClassName="mt-12 flex items-center justify-center gap-3"
                    dotClassName="h-1.5 w-4 rounded-full bg-white/20"
                    activeDotClassName="bg-mindful-gold h-1.5 w-10 rounded-full"
                >
                    {item => (
                        <blockquote className="m-0">
                            <Quote
                                size={32}
                                strokeWidth={1.2}
                                className="text-mindful-gold/40 mx-auto mb-8"
                                aria-hidden="true"
                            />
                            <p className="font-playfair m-0 text-2xl leading-relaxed font-normal text-white md:text-3xl">
                                {item.quote}
                            </p>
                            <footer className="mt-8">
                                <p className="m-0 text-sm font-light tracking-wide text-white">
                                    {item.name}
                                </p>
                                <p className="text-mindful-teal m-0 mt-1 text-xs tracking-[0.2em] uppercase">
                                    {item.title}
                                </p>
                            </footer>
                        </blockquote>
                    )}
                </TestimonialCarousel>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * Plans, as a radio group where the whole card is the control.
 *
 * ─── Why a radio group and not three buttons ─────────────────────────────────
 *
 * Because it is one choice among three, which is what a radio group *is*, and
 * getting that right buys behaviour three buttons would each have to fake: the
 * set is one tab stop rather than three, the arrows move between the options,
 * selection follows focus, and a screen reader announces "2 of 3" rather than
 * three unrelated buttons that happen to look related.
 *
 * `./shared/Radio`'s `Option` takes a function child precisely so the entire
 * card can be the hit area — a dot-plus-label component could not express this
 * layout at all.
 */
function Plans() {
    const [plan, setPlan] = useState('yearly');

    return (
        <section id="plans" className="relative bg-slate-900 py-24 md:py-32">
            <div className="mx-auto w-full max-w-[1536px] px-6 md:px-12 lg:px-24">
                <SectionHeading
                    eyebrow="Membership"
                    title="One price, everything in it"
                    lead="No tiers, no locked sessions, no upsell at the end of a practice."
                    align="center"
                    layout="stacked"
                    className="mx-auto max-w-2xl"
                    eyebrowClassName="text-mindful-gold text-xs tracking-[0.3em] uppercase"
                    titleClassName="font-playfair text-3xl font-normal text-white md:text-4xl lg:text-5xl"
                    leadClassName="mt-5 max-w-xl text-base leading-relaxed font-light text-white/70"
                />

                <RadioGroup
                    value={plan}
                    onChange={setPlan}
                    name="plan"
                    orientation="horizontal"
                    aria-label="Membership plan"
                    className="mt-14 grid gap-5 md:grid-cols-3"
                >
                    {PLANS.map((option, i) => (
                        <RadioGroup.Option
                            key={option.id}
                            value={option.id}
                            first={i === 0}
                            className="rounded-3xl border p-8 transition-colors duration-300 data-[state=checked]:border-mindful-gold data-[state=unchecked]:border-white/12 data-[state=unchecked]:hover:border-white/25"
                        >
                            {({ checked }) => (
                                <>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-playfair text-xl font-normal text-white">
                                            {option.name}
                                        </span>

                                        <span
                                            aria-hidden="true"
                                            className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                                                checked
                                                    ? 'bg-mindful-gold border-mindful-gold text-slate-900'
                                                    : 'border-white/30 text-transparent'
                                            }`}
                                        >
                                            <Check size={13} strokeWidth={3} />
                                        </span>
                                    </div>

                                    <p className="m-0 mt-6 text-4xl font-light text-white tabular-nums">
                                        {option.price}
                                    </p>
                                    <p className="m-0 mt-1 text-xs tracking-wider text-white/45">
                                        {option.note}
                                    </p>
                                    <p className="m-0 mt-6 text-sm leading-relaxed font-light text-white/65">
                                        {option.detail}
                                    </p>

                                    {option.featured && (
                                        <p className="text-mindful-teal m-0 mt-6 text-[11px] tracking-[0.2em] uppercase">
                                            Most people choose this
                                        </p>
                                    )}
                                </>
                            )}
                        </RadioGroup.Option>
                    ))}
                </RadioGroup>

                <div className="mt-10 text-center">
                    <a
                        href="#plans"
                        className="group bg-mindful-teal inline-flex items-center justify-center gap-3 rounded-full px-10 py-4 font-medium text-white no-underline transition-colors hover:bg-[#47c4c9]"
                    >
                        Begin with {PLANS.find(option => option.id === plan)?.name.toLowerCase()}
                        <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </a>
                    <p className="m-0 mt-4 text-xs text-white/40">
                        Thirty days, refunded without a conversation.
                    </p>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * Three rings expanding out of the mark on a four-second cycle, at the pace of
 * a slow breath.
 *
 * The one animation on this page that is not Framer. It runs forever, and a
 * permanent animation loop — three of them — for a decorative pulse is exactly
 * what CSS keyframes are cheaper at. `.animate-ping` in Tailwind is a 1s cycle
 * that reads as a notification badge; the inline `animationDuration` slows it to
 * something that reads as breathing, and the staggered `animationDelay` makes
 * the three read as one expanding wave.
 *
 * Under reduced motion the rings are simply not rendered. There is no static
 * state worth keeping — they carry no information.
 */
function Breathe() {
    const reduced = useReducedMotion();

    return (
        <span className="relative flex h-20 w-20 items-center justify-center">
            {!reduced &&
                [0, 1, 2].map(i => (
                    <span
                        key={i}
                        aria-hidden="true"
                        className="border-mindful-gold/40 absolute inline-flex h-full w-full animate-ping rounded-full border"
                        style={{
                            animationDuration: '4s',
                            animationDelay: `${i * 1.3}s`,
                        }}
                    />
                ))}

            <span className="border-mindful-gold/50 text-mindful-gold relative flex h-20 w-20 items-center justify-center rounded-full border">
                <Flower2 size={28} strokeWidth={1.2} />
            </span>
        </span>
    );
}

/**
 * `FT-06` — centred, and built around the breathing mark rather than a link
 * grid.
 *
 * Every other footer in this library is a directory: columns of links with a
 * bottom bar. This one is a full-height composition with the mark at its centre
 * and the navigation reduced to a single quiet row, because the last thing a
 * page about sitting still should end on is a wall of eighteen links.
 */
function Footer() {
    return (
        <footer className="relative overflow-hidden bg-slate-950">
            {/* A single soft field behind the mark. Blur rather than a gradient
             * stop, so the edge never resolves into a visible ring. */}
            <div
                aria-hidden="true"
                className="bg-mindful-teal/10 pointer-events-none absolute top-1/2 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
            />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center md:py-32">
                <SectionReveal duration={0.9}>
                    <Breathe />
                </SectionReveal>

                <SectionReveal delay={0.15} duration={0.9}>
                    <h2 className="font-playfair m-0 mt-10 text-3xl leading-tight font-normal text-white md:text-4xl">
                        Six minutes tomorrow morning.
                    </h2>
                    <p className="m-0 mt-5 max-w-md text-base leading-relaxed font-light text-white/60">
                        That is the whole ask. Everything else on this page is a description of
                        what happens after you keep it.
                    </p>
                </SectionReveal>

                <SectionReveal delay={0.3} duration={0.9}>
                    <a
                        href="#plans"
                        className="group bg-mindful-teal mt-10 inline-flex items-center gap-3 rounded-full px-10 py-4 font-medium text-white no-underline transition-colors hover:bg-[#47c4c9]"
                    >
                        Start Your Journey
                        <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </a>
                </SectionReveal>

                <nav
                    aria-label="Footer"
                    className="mt-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
                >
                    {[...NAV_ALL, { label: 'Privacy', href: '#top' }, { label: 'Contact', href: '#top' }].map(
                        link => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-light text-white/45 no-underline transition-colors hover:text-white"
                            >
                                {link.label}
                            </a>
                        )
                    )}
                </nav>

                <p className="m-0 mt-10 text-xs font-light text-white/25">
                    © {new Date().getFullYear()} Mindful. Small steps, lasting change.
                </p>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------------- */

export default function Mindful() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <PageFrame
            title="Mindful — Calm Your Mind, Transform Your Life"
            className="type-inter bg-slate-900"
        >
            {/* `fixed`, because the page scrolls now. */}
            <BackButton fixed top={96} left={24} />

            <Hero
                menuOpen={menuOpen}
                onToggleMenu={() => setMenuOpen(open => !open)}
                onNavigate={() => setMenuOpen(false)}
            />
            <Practices />
            <Sessions />
            <Voices />
            <Plans />
            <Footer />
        </PageFrame>
    );
}
