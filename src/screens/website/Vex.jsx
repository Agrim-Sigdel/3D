import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import SectionReveal from './shared/SectionReveal.jsx';
import MobileMenu from './shared/MobileMenu.jsx';
import SectionHeading from './shared/SectionHeading.jsx';
import StatBlock from './shared/StatBlock.jsx';
import FormField from './shared/FormField.jsx';
import Checkbox from './shared/Checkbox.jsx';
import { Instagram, LinkedIn, XLogo as XMark } from './shared/BrandIcons.jsx';
import { useReducedMotion } from './shared/reducedMotion.js';
import { usePointerFine } from './shared/media.js';
import { useScrollFrame } from './shared/frameContext.js';

/**
 * Vex — a venture firm: raw video, no dimming layer, and every piece of chrome
 * floated on near-black glass so white type stays legible against it.
 *
 * ─── One rule holds the whole page together ──────────────────────────────────
 *
 * **No Framer, anywhere.** The headline assembles character by character, the
 * manifesto assembles word by word, forty-odd blocks fade in, a portrait
 * follows the cursor, and four counters run — and not one of them is a motion
 * component. Every animation here is either a CSS transition on a state flip or
 * a `transform` written straight to the DOM from a `requestAnimationFrame`.
 *
 * That is the decision `CATALOGUE.md` records at `MO-04` and it is worth
 * keeping as the page grows rather than in spite of it: a per-character
 * `transitionDelay` is one string per span, where the equivalent in Framer is
 * forty animation loops. At this element count the difference is visible.
 *
 * The shared components this page does use — `SectionReveal` on its `css`
 * engine, `MobileMenu`, `AnimatedCounter` inside `StatBlock` — were all built
 * with that path available for exactly this reason.
 *
 * ─── What is local, and why ──────────────────────────────────────────────────
 *
 * `AssembledText` (the character sweep) and `PointerImage` (the portfolio's
 * cursor-tracked still) are Vex's own. Both are one mechanism used twice on one
 * page, which is short of the folder's rule about extracting on a second
 * *design's* use.
 */

const HERO_VIDEO = '/assets/vex/hero.mp4';
const STILL = name => `/assets/vex/stills/${name}.webp`;

const NAV_LINKS = [
    { label: 'Story', href: '#story' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Team', href: '#team' },
    { label: 'Contact', href: '#contact' },
];

const HEADING = 'Shaping tomorrow\nwith vision and action.';

const THESIS =
    'We are not a fund that waits for the round to be oversubscribed. We take the first meeting, ' +
    'we take the first cheque, and we stay through the years nobody writes about. Conviction is ' +
    'cheap in a bull market. Ours is measured in the companies still standing.';

const PORTFOLIO = [
    { name: 'Halden', sector: 'Climate infrastructure', stage: 'Series B', year: '2021', still: 'work-01' },
    { name: 'Northwind', sector: 'Industrial software', stage: 'Series A', year: '2022', still: 'work-02' },
    { name: 'Corvus', sector: 'Defence logistics', stage: 'Seed', year: '2023', still: 'work-03' },
    { name: 'Meridian Bio', sector: 'Diagnostics', stage: 'Series A', year: '2024', still: 'work-04' },
];

const TEAM = [
    {
        name: 'Ines Okonjo',
        role: 'Managing Partner',
        bio: 'Twelve years operating before eight investing. Led the first cheque into three of the four above.',
    },
    {
        name: 'Rafael Sant',
        role: 'Partner, Building',
        bio: 'Runs the studio side. Takes the CTO seat for the first eighteen months when a founder needs one.',
    },
    {
        name: 'Dagmar Holt',
        role: 'Partner, Advisory',
        bio: 'Twenty years in industrial supply chains. The reason Halden shipped on time.',
    },
    {
        name: 'Yusuf Bediako',
        role: 'Principal',
        bio: 'Sources everything nobody else has heard of yet. Reads more diligence than the rest of us combined.',
    },
];

const STATS = [
    { value: 41, label: 'Companies backed', suffix: '' },
    { value: 340, label: 'Under management', prefix: '$', suffix: 'M' },
    { value: 11, label: 'Years investing' },
    { value: 9, label: 'Still on the cap table', suffix: ' of 10' },
];

const SOCIALS = [
    { label: 'LinkedIn', Icon: LinkedIn },
    { label: 'X', Icon: XMark },
    { label: 'Instagram', Icon: Instagram },
];

const CHAR_DELAY = 30;
/** Nothing moves for this long after mount, so the first frame reads as static. */
const START_DELAY = 200;

const PAD = 'px-6 md:px-12 lg:px-16';

/* -------------------------------------------------------------------------- */

/**
 * Fades its children in once, `delay` ms after mount.
 *
 * `./shared/SectionReveal` on its CSS engine, which is the path that component
 * was written to offer: a state flip and a transition, no Framer, no animation
 * loop per element.
 *
 * `trigger="mount"` for the hero — nothing on the first viewport ever scrolls
 * into view. Everything below the fold passes `trigger="inView"` instead.
 *
 * Milliseconds in, seconds through: `SectionReveal` counts in seconds like
 * Framer, so the call sites keep their readable `delay={800}`.
 */
function TimedFade({ delay = 0, duration = 1000, trigger = 'mount', className = '', children }) {
    return (
        <SectionReveal
            engine="css"
            trigger={trigger}
            y={0}
            delay={delay / 1000}
            duration={duration / 1000}
            className={className}
        >
            {children}
        </SectionReveal>
    );
}

/**
 * Where each word starts within its line, counting the spaces between them, so a
 * glyph's delay still reflects its position in the whole line.
 *
 * Computed here rather than by advancing a counter inside `.map` — React 19
 * rejects a variable that is still being reassigned as the render finishes.
 */
function wordOffsets(words) {
    const offsets = [];
    let at = 0;
    for (const word of words) {
        offsets.push(at);
        at += word.length + 1;
    }
    return offsets;
}

/**
 * Text that assembles a glyph at a time, each character sliding in from the
 * left on its own `transitionDelay`.
 *
 * ─── Two triggers, one mechanism ─────────────────────────────────────────────
 *
 * `mount` for the hero, `inView` for the manifesto further down. They differ by
 * five lines — a timer versus an IntersectionObserver — and everything
 * expensive about the component is shared, so splitting them into two would
 * have duplicated the delay arithmetic and the word grouping for nothing.
 *
 * ─── Word grouping is load-bearing ───────────────────────────────────────────
 *
 * Characters are wrapped in `whitespace-nowrap` words with ordinary spaces left
 * as text between them. A flat run of `inline-block` glyphs hands the browser a
 * break opportunity at *every character*, and a heading this size in a
 * half-width column duly wraps in the middle of a word.
 *
 * ─── Reduced motion ──────────────────────────────────────────────────────────
 *
 * The text is simply there. Not "instantly assembled" — the per-character
 * transform is dropped entirely, because a stagger of zero-duration transitions
 * is still a visible cascade, which is the thing being asked against.
 */
function AssembledText({
    text,
    as: Tag = 'h1',
    trigger = 'mount',
    charDelay = CHAR_DELAY,
    startDelay = START_DELAY,
    travel = 18,
    className = '',
    style,
}) {
    const [started, setStarted] = useState(false);
    const reduced = useReducedMotion();
    const ref = useRef(null);
    const lines = text.split('\n');

    useEffect(() => {
        if (trigger !== 'mount') return undefined;
        const timer = window.setTimeout(() => setStarted(true), startDelay);
        return () => window.clearTimeout(timer);
    }, [trigger, startDelay]);

    useEffect(() => {
        if (trigger !== 'inView') return undefined;

        const element = ref.current;
        if (!element) return undefined;

        /* Against the viewport, not the scroll frame. Every template here is a
         * full-viewport fixed page, so the two are the same rectangle — the
         * reasoning `frameContext.js` gives for `useInView` needing no
         * equivalent to `useScrollFrame`. */
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '-15%' }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [trigger]);

    const shown = started || reduced;

    return (
        <Tag ref={ref} className={className} style={style}>
            {lines.map((line, lineIndex) => {
                const words = line.split(' ');
                const offsets = wordOffsets(words);
                /* Each line's glyphs are offset by the full width of the lines
                 * above, so the sweep reads as one pass across the whole block
                 * instead of restarting per line. */
                const lineDelay = lineIndex * line.length * charDelay;

                return (
                    <span key={`line-${lineIndex}`} className="block">
                        {words.map((word, wordIndex) => (
                            <React.Fragment key={`${lineIndex}-${wordIndex}`}>
                                <span className="inline-block whitespace-nowrap">
                                    {[...word].map((char, charIndex) => (
                                        <span
                                            key={charIndex}
                                            className="inline-block"
                                            style={
                                                reduced
                                                    ? undefined
                                                    : {
                                                          opacity: shown ? 1 : 0,
                                                          transform: shown
                                                              ? 'translateX(0)'
                                                              : `translateX(-${travel}px)`,
                                                          transitionProperty: 'opacity, transform',
                                                          transitionDuration: '500ms',
                                                          transitionDelay: `${
                                                              lineDelay +
                                                              (offsets[wordIndex] + charIndex) *
                                                                  charDelay
                                                          }ms`,
                                                      }
                                            }
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </span>
                                {wordIndex < words.length - 1 && ' '}
                            </React.Fragment>
                        ))}
                    </span>
                );
            })}
        </Tag>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * A still that follows the cursor while a portfolio row is hovered.
 *
 * ─── Nothing here re-renders ─────────────────────────────────────────────────
 *
 * The rule from `README.md`: never `setState` per frame. The pointer position
 * lives in refs and the smoothed value is written straight to `style.transform`
 * inside the rAF, exactly as `Lithos`'s spotlight and `VideoPlayer`'s progress
 * bar do. React renders this component when the *hovered row* changes — four
 * times a visit — and never on pointer move.
 *
 * ─── Why it lerps ────────────────────────────────────────────────────────────
 *
 * Writing the raw pointer position pins the image rigidly to the cursor, which
 * reads as a tooltip. The 0.12 follow makes it trail slightly and settle, which
 * is what makes it read as a physical thing being dragged along.
 *
 * ─── When it does not run ────────────────────────────────────────────────────
 *
 * Coarse pointers get nothing — there is no cursor to follow, and a touch
 * device would show the image pinned wherever the last tap landed. `Basilico`'s
 * custom cursor makes the same `pointer: fine` check. Reduced motion gets
 * nothing either: an image chasing the pointer is precisely the kind of
 * unrequested movement the preference is about.
 */
function PointerImage({ item }) {
    const ref = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 });
    const posRef = useRef({ x: 0, y: 0 });

    const reduced = useReducedMotion();
    const fine = usePointerFine();

    const active = fine && !reduced;

    useEffect(() => {
        if (!active) return undefined;

        let frame = 0;
        let seeded = false;

        const onMove = event => {
            targetRef.current = { x: event.clientX, y: event.clientY };
            /* The first sample jumps rather than lerping in from 0,0 — without
             * this the image flies across the page on the first hover. */
            if (!seeded) {
                posRef.current = { ...targetRef.current };
                seeded = true;
            }
        };

        const tick = () => {
            frame = requestAnimationFrame(tick);

            const pos = posRef.current;
            const target = targetRef.current;
            pos.x += (target.x - pos.x) * 0.12;
            pos.y += (target.y - pos.y) * 0.12;

            const element = ref.current;
            if (element) {
                element.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
            }
        };

        window.addEventListener('pointermove', onMove);
        frame = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('pointermove', onMove);
            cancelAnimationFrame(frame);
        };
    }, [active]);

    if (!active) return null;

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="pointer-events-none fixed top-0 left-0 z-30 hidden h-64 w-48 overflow-hidden rounded-lg lg:block"
            style={{
                opacity: item ? 1 : 0,
                /* Scale is on an inner element so the rAF owns `transform` on
                 * this one outright — two writers on one property is the bug
                 * this split exists to prevent. */
                transitionProperty: 'opacity',
                transitionDuration: '400ms',
            }}
        >
            <div
                className="h-full w-full origin-center"
                style={{
                    transform: item ? 'scale(1)' : 'scale(0.85)',
                    transitionProperty: 'transform',
                    transitionDuration: '500ms',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {item && (
                    <img
                        src={STILL(item.still)}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The nav, which now has a page under it.
 *
 * `NV-02`, taken the *stepped* way — `Outbox`'s boolean rather than `Skyline`'s
 * continuous ramp. The bar is already dark glass over a video at rest; what
 * changes past the threshold is that it gains a hairline and tightens, which is
 * a state, not a gradient. `CATALOGUE.md`: ramp when the change is a gradient,
 * subscribe when it is a step.
 *
 * Read off the frame, not the window. `window.scrollY` is a constant zero in
 * this library.
 */
function Navbar({ menuOpen, onToggleMenu, onNavigate }) {
    const [scrolled, setScrolled] = useState(false);
    const frame = useScrollFrame();

    useEffect(() => {
        const scroller = frame?.current;
        if (!scroller) return undefined;

        const onScroll = () => setScrolled(scroller.scrollTop > 50);
        onScroll();

        scroller.addEventListener('scroll', onScroll, { passive: true });
        return () => scroller.removeEventListener('scroll', onScroll);
    }, [frame]);

    return (
        <div className={`fixed inset-x-0 top-0 z-40 ${PAD} pt-6`}>
            <nav
                className={`liquid-glass-dark flex items-center justify-between rounded-xl px-4 transition-all duration-500 ${
                    scrolled ? 'border border-white/10 py-1.5' : 'border border-transparent py-2'
                }`}
            >
                <a href="#top" className="text-2xl font-semibold tracking-tight text-white no-underline">
                    VEX
                </a>

                <div className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm text-white no-underline transition-colors hover:text-gray-300"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="#contact"
                        className="hidden cursor-pointer rounded-lg border-none bg-white px-6 py-2 text-sm font-medium text-black no-underline transition-colors hover:bg-gray-100 sm:inline-block"
                    >
                        Start a Chat
                    </a>

                    <button
                        type="button"
                        onClick={onToggleMenu}
                        aria-expanded={menuOpen}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-white/10 text-white md:hidden"
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </nav>

            {/* `overlay` rather than `collapse`: this bar is fixed over a video,
             * and a menu that pushes content would push nothing. */}
            <MobileMenu
                variant="overlay"
                from="fade"
                open={menuOpen}
                onClose={onNavigate}
                stagger={60}
                staggerDelay={120}
                panelClassName="bg-black/95 backdrop-blur-md items-center justify-center gap-8"
                className="md:hidden"
            >
                {NAV_LINKS.map((link, i) => (
                    <MobileMenu.Item key={link.label} index={i}>
                        <a
                            href={link.href}
                            onClick={onNavigate}
                            className="text-3xl font-light text-white no-underline"
                        >
                            {link.label}
                        </a>
                    </MobileMenu.Item>
                ))}

                <MobileMenu.Item index={NAV_LINKS.length}>
                    <a
                        href="#contact"
                        onClick={onNavigate}
                        className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-black no-underline"
                    >
                        Start a Chat
                    </a>
                </MobileMenu.Item>
            </MobileMenu>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

function Hero() {
    return (
        <section id="top" className="relative h-svh w-full overflow-hidden">
            {/*
             * Inside the section, not under `PageFrame`.
             *
             * `PageFrame` is the containing block, and for an `overflow-y: auto`
             * element `inset-0` resolves against the *scrollable* padding box —
             * so a video parked directly under it grows to the full height of
             * the page the moment there is a page to scroll. It was correct
             * while this template was locked to one viewport and became a bug
             * the instant it was not.
             */}
            <video
                className="absolute inset-0 h-full w-full object-cover"
                src={HERO_VIDEO}
                autoPlay
                loop
                muted
                playsInline
            />

            <div className={`relative z-10 flex h-full flex-col ${PAD}`}>
                <div className="flex flex-1 flex-col justify-end pb-12 lg:grid lg:grid-cols-2 lg:items-end lg:pb-16">
                    <div>
                        <AssembledText
                            text={HEADING}
                            className="m-0 mb-4 text-4xl font-normal text-white md:text-5xl lg:text-6xl xl:text-7xl"
                            style={{ letterSpacing: '-0.04em' }}
                        />

                        <TimedFade delay={800}>
                            <p className="m-0 mb-5 text-base text-gray-300 md:text-lg">
                                We back visionaries and craft ventures that define what comes next.
                            </p>
                        </TimedFade>

                        <TimedFade delay={1200}>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="#contact"
                                    className="cursor-pointer rounded-lg border-none bg-white px-8 py-3 font-medium text-black no-underline"
                                >
                                    Start a Chat
                                </a>
                                <a
                                    href="#portfolio"
                                    className="liquid-glass-dark cursor-pointer rounded-lg border border-white/20 px-8 py-3 font-medium text-white no-underline transition-colors hover:bg-white hover:text-black"
                                >
                                    Explore Now
                                </a>
                            </div>
                        </TimedFade>
                    </div>

                    <TimedFade delay={1400} className="flex items-end justify-start lg:justify-end">
                        <div className="liquid-glass-dark rounded-xl border border-white/20 px-6 py-3">
                            <span className="text-lg font-light text-white md:text-xl lg:text-2xl">
                                Investing. Building. Advisory.
                            </span>
                        </div>
                    </TimedFade>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The manifesto. One `AssembledText` at `inView`, sized to fill the section.
 *
 * `AnimatedText` in `./shared` does a comparable scroll-linked reveal and is
 * deliberately not used: it is Framer, and it maps progress continuously, so
 * the words un-reveal when the reader scrolls back up. Here the sweep fires
 * once and stays, which is the right behaviour for a statement rather than a
 * scroll toy — and it keeps this page's no-motion-components rule intact.
 */
function Thesis() {
    return (
        <section id="story" className={`relative border-t border-white/10 py-28 md:py-40 ${PAD}`}>
            <TimedFade trigger="inView" delay={0} duration={800}>
                <p className="m-0 mb-10 text-xs tracking-[0.3em] text-gray-500 uppercase">
                    Our thesis
                </p>
            </TimedFade>

            <AssembledText
                text={THESIS}
                as="p"
                trigger="inView"
                charDelay={6}
                travel={10}
                className="m-0 max-w-4xl text-2xl leading-snug font-light text-white md:text-3xl lg:text-4xl"
                style={{ letterSpacing: '-0.02em' }}
            />

            <StatBlock.Group className="mt-20 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-4">
                {STATS.map((stat, i) => (
                    <TimedFade key={stat.label} trigger="inView" delay={i * 120} duration={700}>
                        <StatBlock
                            {...stat}
                            valueClassName="text-4xl font-normal tracking-tight text-white md:text-5xl"
                            labelClassName="mt-2 text-xs text-gray-500 md:text-sm"
                        />
                    </TimedFade>
                ))}
            </StatBlock.Group>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The portfolio, as an editorial index rather than a card grid.
 *
 * Rows are `<a>`s, so the whole line is one target and the keyboard gets the
 * same reveal the pointer does — `onFocus` sets the hovered item alongside
 * `onPointerEnter`. Three of the four templates that do something like this
 * elsewhere in the library are hover-only, which makes the section invisible
 * from the keyboard.
 *
 * The still only ever exists once, in `PointerImage`, rather than one hidden
 * `<img>` per row: four full-size decodes for something at most one of which is
 * ever on screen.
 */
function Portfolio() {
    const [hovered, setHovered] = useState(null);

    return (
        <section id="portfolio" className={`relative border-t border-white/10 py-24 md:py-32 ${PAD}`}>
            <TimedFade trigger="inView" duration={800}>
                <SectionHeading
                    reveal={false}
                    eyebrow="Portfolio"
                    title="Where the money went"
                    lead="Forty-one companies since 2014. These four are the ones we talk about."
                    titleClassName="text-4xl font-normal tracking-tight text-white md:text-5xl"
                    eyebrowClassName="text-xs tracking-[0.3em] text-gray-500 uppercase"
                    leadClassName="mt-4 max-w-md text-sm text-gray-400 md:text-base"
                    action={
                        <a
                            href="#portfolio"
                            className="group inline-flex items-center gap-2 text-sm text-gray-400 no-underline transition-colors hover:text-white"
                        >
                            Full index
                            <ArrowUpRight
                                size={15}
                                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </a>
                    }
                />
            </TimedFade>

            <div
                className="mt-14 border-t border-white/10"
                onPointerLeave={() => setHovered(null)}
            >
                {PORTFOLIO.map((item, i) => (
                    <TimedFade key={item.name} trigger="inView" delay={i * 90} duration={700}>
                        <a
                            href="#portfolio"
                            onPointerEnter={() => setHovered(item)}
                            onFocus={() => setHovered(item)}
                            onBlur={() => setHovered(null)}
                            className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-white/10 py-7 no-underline transition-colors hover:bg-white/[0.03] md:grid-cols-[1.4fr_1.4fr_0.8fr_auto] md:py-8"
                        >
                            <span className="text-2xl font-light text-white transition-transform duration-500 group-hover:translate-x-2 md:text-3xl">
                                {item.name}
                            </span>
                            <span className="col-span-2 text-sm text-gray-400 md:col-span-1 md:text-base">
                                {item.sector}
                            </span>
                            <span className="hidden text-sm text-gray-500 md:block">
                                {item.stage}
                            </span>
                            <span className="text-sm text-gray-500 tabular-nums">{item.year}</span>
                        </a>
                    </TimedFade>
                ))}
            </div>

            <PointerImage item={hovered} />
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The team. Four cards whose bio is folded away until the card is hovered or
 * focused.
 *
 * The reveal is a `grid-rows-[0fr] → [1fr]` collapse — the trick
 * `MobileMenu`'s `collapse` variant uses — because it animates to the bio's
 * natural height without measuring anything. A `max-height` guess either clips
 * the longest bio or leaves the others closing through empty space.
 *
 * Avatars are the initials, set on a plain disc. A team page for a firm this
 * size does not have four portrait photographs, and inventing them from the
 * hero clip would put the same city skyline behind four faces.
 */
function Team() {
    return (
        <section id="team" className={`relative border-t border-white/10 py-24 md:py-32 ${PAD}`}>
            <TimedFade trigger="inView" duration={800}>
                <SectionHeading
                    reveal={false}
                    layout="stacked"
                    eyebrow="Team"
                    title="Four people, one cheque book"
                    titleClassName="text-4xl font-normal tracking-tight text-white md:text-5xl"
                    eyebrowClassName="text-xs tracking-[0.3em] text-gray-500 uppercase"
                />
            </TimedFade>

            <ul className="m-0 mt-14 grid list-none grid-cols-1 gap-px border border-white/10 bg-white/10 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {TEAM.map((person, i) => (
                    <TimedFade key={person.name} trigger="inView" delay={i * 100} duration={700}>
                        <li className="h-full">
                            <div
                                tabIndex={0}
                                className="group flex h-full cursor-default flex-col bg-black p-7 transition-colors duration-500 outline-none hover:bg-[#0a0a0a] focus-visible:bg-[#0a0a0a]"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-sm tracking-wider text-white"
                                >
                                    {person.name
                                        .split(' ')
                                        .map(part => part[0])
                                        .join('')}
                                </span>

                                <p className="m-0 text-lg font-light text-white">{person.name}</p>
                                <p className="m-0 mt-1 text-xs tracking-[0.15em] text-gray-500 uppercase">
                                    {person.role}
                                </p>

                                {/* `min-h-0` on the inner div is load-bearing:
                                 * without it the row refuses to shrink below its
                                 * content and the bio never folds away. */}
                                <div className="grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
                                    <div className="min-h-0">
                                        <p className="m-0 pt-4 text-sm leading-relaxed text-gray-400">
                                            {person.bio}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </TimedFade>
                ))}
            </ul>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The contact form.
 *
 * Fields come from `./shared/FormField`, which renders its label as an id'd
 * `<span>` and wires `aria-labelledby` rather than wrapping the control in a
 * `<label>` — the trap in `README.md`. Nothing here is a native `<select>` or
 * date input.
 *
 * The submit is still a `preventDefault()` stub. `ROADMAP.md` lists form
 * submission as outstanding infrastructure across the whole library, and
 * inventing an endpoint for one template would not change that.
 */
function Contact() {
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = event => {
        event.preventDefault();

        const email = new FormData(event.currentTarget).get('email');
        if (!email || !String(email).includes('@')) {
            setError('Enter an address we can reply to.');
            return;
        }

        setError(null);
        setSent(true);
    };

    return (
        <section id="contact" className={`relative border-t border-white/10 py-24 md:py-32 ${PAD}`}>
            <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
                <TimedFade trigger="inView" duration={800}>
                    <div>
                        <p className="m-0 text-xs tracking-[0.3em] text-gray-500 uppercase">
                            Contact
                        </p>
                        <h2 className="m-0 mt-5 text-4xl font-normal tracking-tight text-white md:text-5xl">
                            Send the deck.
                            <br />
                            We read all of them.
                        </h2>
                        <p className="m-0 mt-6 max-w-sm text-sm leading-relaxed text-gray-400 md:text-base">
                            No warm intro required, and no form letter back. If it is not for us we
                            will tell you why within a fortnight.
                        </p>

                        <div className="mt-10 flex items-center gap-3">
                            {SOCIALS.map(({ label, Icon }) => (
                                <a
                                    key={label}
                                    href="#contact"
                                    aria-label={label}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white no-underline transition-colors hover:bg-white hover:text-black"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                </TimedFade>

                <TimedFade trigger="inView" delay={150} duration={800}>
                    <form
                        onSubmit={onSubmit}
                        className="liquid-glass-dark rounded-2xl border border-white/15 p-7 md:p-10"
                    >
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                label="Name"
                                labelClassName="text-xs tracking-[0.2em] text-gray-500 uppercase"
                            >
                                {ids => (
                                    <input
                                        {...ids}
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        className="w-full border-none border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-white"
                                        style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}
                                    />
                                )}
                            </FormField>

                            <FormField
                                label="Email"
                                required
                                error={error}
                                labelClassName="text-xs tracking-[0.2em] text-gray-500 uppercase"
                            >
                                {ids => (
                                    <input
                                        {...ids}
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        className="w-full border-none border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-white"
                                        style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}
                                    />
                                )}
                            </FormField>
                        </div>

                        <FormField
                            label="What are you building?"
                            className="mt-6"
                            labelClassName="text-xs tracking-[0.2em] text-gray-500 uppercase"
                        >
                            {ids => (
                                <textarea
                                    {...ids}
                                    name="pitch"
                                    rows={4}
                                    className="ui-scroll w-full resize-none border-none border-b border-white/20 bg-transparent py-2 text-white outline-none transition-colors focus:border-white"
                                    style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}
                                />
                            )}
                        </FormField>

                        <Checkbox
                            name="updates"
                            label="Send me the quarterly letter"
                            className="mt-8 text-gray-400"
                            boxClassName="border border-white/25 text-white"
                        />

                        <button
                            type="submit"
                            className="mt-8 w-full cursor-pointer rounded-lg border-none bg-white py-3.5 font-medium text-black transition-colors hover:bg-gray-100 sm:w-auto sm:px-10"
                        >
                            {sent ? 'Received — thank you' : 'Send'}
                        </button>
                    </form>
                </TimedFade>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * `FT-07` — the wordmark at the scale of the page, assembling as it arrives.
 *
 * The one footer in the library whose primary element is the logo used as
 * architecture rather than as a mark. `text-[26vw]` means it is always three
 * characters edge to edge, at any width, and the links sit in the band above
 * it. `leading-[0.75]` crops the type's own descender space so the glyphs sit
 * on the bottom edge rather than floating above it.
 *
 * It reuses `AssembledText`, which is the third use of that mechanism on this
 * page and the reason it is a component rather than three copies.
 */
function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-white/10 pt-20">
            <div className={`${PAD} pb-16`}>
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <TimedFade trigger="inView" duration={700}>
                        <div>
                            <p className="m-0 text-xs tracking-[0.3em] text-gray-500 uppercase">
                                Office
                            </p>
                            <p className="m-0 mt-4 text-sm leading-relaxed text-gray-400">
                                14 Wenlock Road
                                <br />
                                London N1 7GU
                            </p>
                        </div>
                    </TimedFade>

                    <TimedFade trigger="inView" delay={80} duration={700}>
                        <div>
                            <p className="m-0 text-xs tracking-[0.3em] text-gray-500 uppercase">
                                Enquiries
                            </p>
                            <a
                                href="#contact"
                                className="mt-4 block text-sm text-gray-400 no-underline transition-colors hover:text-white"
                            >
                                hello@vex.vc
                            </a>
                            <a
                                href="#contact"
                                className="mt-1 block text-sm text-gray-400 no-underline transition-colors hover:text-white"
                            >
                                press@vex.vc
                            </a>
                        </div>
                    </TimedFade>

                    <TimedFade trigger="inView" delay={160} duration={700}>
                        <nav aria-label="Footer">
                            <p className="m-0 text-xs tracking-[0.3em] text-gray-500 uppercase">
                                Index
                            </p>
                            <ul className="m-0 mt-4 flex list-none flex-col gap-1 p-0">
                                {NAV_LINKS.map(link => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-gray-400 no-underline transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </TimedFade>

                    <TimedFade trigger="inView" delay={240} duration={700}>
                        <div className="flex items-start gap-3">
                            {SOCIALS.map(({ label, Icon }) => (
                                <a
                                    key={label}
                                    href="#contact"
                                    aria-label={label}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white no-underline transition-colors hover:bg-white hover:text-black"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </TimedFade>
                </div>
            </div>

            {/* The mark, cropped to the page's bottom edge. `select-none` because
             * dragging across it selects three letters and nothing useful. */}
            <div className={`${PAD} select-none`}>
                <AssembledText
                    text="VEX"
                    as="p"
                    trigger="inView"
                    charDelay={110}
                    travel={40}
                    className="m-0 text-[26vw] leading-[0.75] font-semibold tracking-[-0.05em] text-white/10"
                />
            </div>

            <div className={`${PAD} flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6`}>
                <p className="m-0 text-xs text-gray-600">
                    © {new Date().getFullYear()} Vex Partners LLP. Authorised and regulated.
                </p>
                <p className="m-0 text-xs text-gray-600">Investing. Building. Advisory.</p>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------------- */

export default function Vex() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <PageFrame title="Vex — Investing. Building. Advisory." className="type-inter bg-black">
            {/* `fixed`, because the page scrolls now — otherwise the control
             * scrolls away with the hero. */}
            <BackButton fixed top={82} left={28} />

            <Navbar
                menuOpen={menuOpen}
                onToggleMenu={() => setMenuOpen(open => !open)}
                onNavigate={() => setMenuOpen(false)}
            />

            <Hero />
            <Thesis />
            <Portfolio />
            <Team />
            <Contact />
            <Footer />
        </PageFrame>
    );
}
