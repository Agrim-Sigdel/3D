import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import { useScrollFrame } from './shared/frameContext.js';

/**
 * Michael Smith — a seven-section dark portfolio: loader, hero, bento works,
 * journal, a 300vh parallax gallery, stats, and a contact footer.
 *
 * ─── What was substituted, and why ───────────────────────────────────────────
 *
 * The brief specifies an HLS stream through hls.js. Everything this library
 * references is mirrored locally instead, so the stream was pulled down with
 * ffmpeg (the 1708×1212 rendition) and plays from a plain `<video src>`; hls.js
 * is not a dependency.
 *
 * It also names four bento images, four journal images and six exploration
 * images without giving a single URL. Those are stills cut from fourteen
 * *different* clips elsewhere in public/assets — one frame each — so the grid
 * has genuine variety rather than fourteen near-identical frames of one loop.
 *
 * GSAP drives the two things it is the right tool for: the hero entrance
 * timeline and the infinite footer marquee, neither of which touches scroll
 * position. The pin and the parallax do not use ScrollTrigger. Every template
 * here lives inside a `position: fixed` frame, so the window never scrolls and
 * ScrollTrigger would have to be told about a custom `scroller` and re-measured
 * against it. `position: sticky` pins natively inside that frame — it is exactly
 * `pin` with `pinSpacing: false` — and Framer Motion's `useScroll({ container })`
 * reads the frame directly for the columns. See "The scroll gotcha" in the
 * folder README.
 */

const HERO_VIDEO = '/assets/michael/hero.mp4';
const still = name => `/assets/michael/stills/${name}.webp`;

const LOADER_MS = 2700;
const LOADER_WORDS = ['Design', 'Create', 'Inspire'];
const ROLES = ['Creative', 'Fullstack', 'Founder', 'Scholar'];

const WORKS = [
    { title: 'Automotive Motion', image: still('automotive-motion'), span: 'md:col-span-7', ratio: 'aspect-[16/11]' },
    { title: 'Urban Architecture', image: still('urban-architecture'), span: 'md:col-span-5', ratio: 'aspect-[4/3]' },
    { title: 'Human Perspective', image: still('human-perspective'), span: 'md:col-span-5', ratio: 'aspect-[4/3]' },
    { title: 'Brand Identity', image: still('brand-identity'), span: 'md:col-span-7', ratio: 'aspect-[16/11]' },
];

/* Invented, like the persona — the brief lists these entries by shape only. */
const JOURNAL = [
    { title: 'Designing for the space between screens', read: '6 min read', date: 'Mar 2026', image: still('journal-1') },
    { title: 'What a year of motion work taught me', read: '4 min read', date: 'Jan 2026', image: still('journal-2') },
    { title: 'Notes on building a personal system', read: '8 min read', date: 'Nov 2025', image: still('journal-3') },
    { title: 'The case for slower interfaces', read: '5 min read', date: 'Sep 2025', image: still('journal-4') },
];

const EXPLORATIONS = [
    { title: 'Orbital Study', image: still('exp-1'), rotate: -3 },
    { title: 'Signal Drift', image: still('exp-2'), rotate: 2 },
    { title: 'Quiet Mass', image: still('exp-3'), rotate: -2 },
    { title: 'Long Exposure', image: still('exp-4'), rotate: 3 },
    { title: 'Second Light', image: still('exp-5'), rotate: -1.5 },
    { title: 'Held Frame', image: still('exp-6'), rotate: 2.5 },
];

const STATS = [
    { value: '20+', label: 'Years Experience' },
    { value: '95+', label: 'Projects Done' },
    { value: '200%', label: 'Satisfied Clients' },
];

const SOCIALS = ['Twitter', 'LinkedIn', 'Dribbble', 'GitHub'];

const NAV_LINKS = ['Home', 'Work', 'Resume'];

const REVEAL = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] },
};

/** A 4px dot screen, laid over every image at 20% under multiply. */
const HALFTONE = {
    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
    backgroundSize: '4px 4px',
};

/* -------------------------------------------------------------------------- */

/** Ring that animates its gradient, revealed on the parent's hover. */
function GradientRing() {
    return (
        <span
            className="accent-gradient animate-gradient-shift pointer-events-none absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
        />
    );
}

function Eyebrow({ children }) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-smith-stroke" />
            <span className="text-xs tracking-[0.3em] text-smith-muted uppercase">{children}</span>
        </div>
    );
}

/** Header block shared by Selected Works, Journal and Explorations. */
function SectionHeader({ eyebrow, lead, italic, subtext, action }) {
    return (
        <motion.div {...REVEAL} className="mb-10 flex items-end justify-between gap-8 md:mb-14">
            <div>
                <Eyebrow>{eyebrow}</Eyebrow>
                <h2 className="m-0 mt-5 text-4xl tracking-tight text-smith-text md:text-5xl lg:text-6xl">
                    {lead} <em className="font-serif-accent italic">{italic}</em>
                </h2>
                <p className="m-0 mt-4 max-w-md text-sm text-smith-muted md:text-base">
                    {subtext}
                </p>
            </div>

            {action && (
                <button
                    type="button"
                    className="group relative hidden shrink-0 cursor-pointer items-center gap-2 rounded-full border-none bg-smith-bg px-6 py-3 text-sm text-smith-text md:inline-flex"
                >
                    <GradientRing />
                    <span className="relative flex items-center gap-2 rounded-full">
                        {action}
                        <span aria-hidden="true">→</span>
                    </span>
                </button>
            )}
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */

function LoadingScreen({ onComplete }) {
    const [count, setCount] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        let rafId = 0;
        let startedAt = null;

        const step = now => {
            startedAt ??= now;
            const progress = Math.min((now - startedAt) / LOADER_MS, 1);
            setCount(Math.round(progress * 100));
            if (progress < 1) rafId = requestAnimationFrame(step);
        };
        rafId = requestAnimationFrame(step);

        const words = window.setInterval(
            () => setWordIndex(i => (i + 1) % LOADER_WORDS.length),
            900
        );

        return () => {
            cancelAnimationFrame(rafId);
            window.clearInterval(words);
        };
    }, []);

    useEffect(() => {
        if (count < 100) return undefined;
        const timer = window.setTimeout(onComplete, 400);
        return () => window.clearTimeout(timer);
    }, [count, onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-between bg-smith-bg p-6 md:p-10">
            <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="m-0 text-xs tracking-[0.3em] text-smith-muted uppercase"
            >
                Portfolio
            </motion.p>

            <div className="flex flex-1 items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={LOADER_WORDS[wordIndex]}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="font-serif-accent text-4xl text-smith-text/80 italic md:text-6xl lg:text-7xl"
                    >
                        {LOADER_WORDS[wordIndex]}
                    </motion.span>
                </AnimatePresence>
            </div>

            <div>
                <p className="font-serif-accent m-0 text-right text-6xl tabular-nums text-smith-text md:text-8xl lg:text-9xl">
                    {String(count).padStart(3, '0')}
                </p>
                <div className="mt-6 h-[3px] w-full bg-smith-stroke/50">
                    <div
                        className="accent-gradient h-full origin-left"
                        style={{
                            transform: `scaleX(${count / 100})`,
                            boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

function Navbar() {
    const frame = useScrollFrame();
    const [lifted, setLifted] = useState(false);
    const [active, setActive] = useState('Home');

    useEffect(() => {
        const scroller = frame?.current;
        if (!scroller) return undefined;
        const onScroll = () => setLifted(scroller.scrollTop > 100);
        scroller.addEventListener('scroll', onScroll, { passive: true });
        return () => scroller.removeEventListener('scroll', onScroll);
    }, [frame]);

    return (
        <nav className="fixed top-0 right-0 left-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
            <div
                className={`inline-flex items-center rounded-full border border-white/10 bg-smith-surface px-2 py-2 backdrop-blur-md ${
                    lifted ? 'shadow-md shadow-black/10' : ''
                }`}
            >
                {/* The gradient is the border: a 1.5px inset parent with the
                 * page colour filling the middle. */}
                <button
                    type="button"
                    aria-label="Home"
                    className="accent-gradient flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none p-[1.5px] transition-transform hover:scale-110"
                >
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-smith-bg">
                        <span className="font-serif-accent text-[13px] text-smith-text italic">
                            JA
                        </span>
                    </span>
                </button>

                <span className="mx-1 hidden h-5 w-px bg-smith-stroke sm:block" />

                {NAV_LINKS.map(link => (
                    <button
                        key={link}
                        type="button"
                        onClick={() => setActive(link)}
                        className={`cursor-pointer rounded-full border-none bg-transparent px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm ${
                            active === link
                                ? 'bg-smith-stroke/50 text-smith-text'
                                : 'text-smith-muted hover:bg-smith-stroke/50 hover:text-smith-text'
                        }`}
                    >
                        {link}
                    </button>
                ))}

                <span className="mx-1 hidden h-5 w-px bg-smith-stroke sm:block" />

                <button
                    type="button"
                    className="group relative cursor-pointer rounded-full border-none bg-transparent px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                >
                    <GradientRing />
                    <span className="relative flex items-center gap-1 rounded-full bg-smith-surface px-2 py-0.5 text-smith-text backdrop-blur-md">
                        Say hi <span aria-hidden="true">↗</span>
                    </span>
                </button>
            </div>
        </nav>
    );
}

/* -------------------------------------------------------------------------- */

function Hero() {
    const rootRef = useRef(null);
    const [roleIndex, setRoleIndex] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => setRoleIndex(i => (i + 1) % ROLES.length), 2000);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        const scope = rootRef.current;
        if (!scope) return undefined;

        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        timeline.from(scope.querySelectorAll('.name-reveal'), {
            opacity: 0,
            y: 50,
            duration: 1.2,
            delay: 0.1,
        });
        timeline.from(
            scope.querySelectorAll('.blur-in'),
            { opacity: 0, filter: 'blur(10px)', y: 20, duration: 1, stagger: 0.1 },
            0.3
        );

        return () => timeline.kill();
    }, []);

    return (
        <section ref={rootRef} className="relative h-screen w-full overflow-hidden">
            <video
                className="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                src={HERO_VIDEO}
                autoPlay
                muted
                loop
                playsInline
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute right-0 bottom-0 left-0 h-48 bg-gradient-to-t from-smith-bg to-transparent" />

            <Navbar />

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                <p className="blur-in m-0 mb-8 text-xs tracking-[0.3em] text-smith-muted uppercase">
                    COLLECTION &apos;26
                </p>

                <h1 className="name-reveal font-serif-accent m-0 mb-6 text-6xl leading-[0.9] tracking-tight text-smith-text italic md:text-8xl lg:text-9xl">
                    Michael Smith
                </h1>

                <p className="blur-in m-0 mb-4 text-lg text-smith-text md:text-xl">
                    A{' '}
                    <span
                        key={roleIndex}
                        className="font-serif-accent animate-role-fade-in inline-block italic"
                    >
                        {ROLES[roleIndex]}
                    </span>{' '}
                    lives in Chicago.
                </p>

                <p className="blur-in m-0 mb-12 max-w-md text-sm text-smith-muted md:text-base">
                    Designing seamless digital interactions by focusing on the unique nuances which
                    bring systems to life.
                </p>

                <div className="blur-in inline-flex flex-wrap justify-center gap-4">
                    <button
                        type="button"
                        className="group relative cursor-pointer rounded-full border-none bg-smith-text px-7 py-3.5 text-sm text-smith-bg transition-transform hover:scale-105"
                    >
                        See Works
                    </button>
                    <button
                        type="button"
                        className="group relative cursor-pointer rounded-full border-2 border-smith-stroke bg-smith-bg px-7 py-3.5 text-sm text-smith-text transition-transform hover:scale-105 hover:border-transparent"
                    >
                        <GradientRing />
                        <span className="relative">Reach out</span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
                <span className="text-xs tracking-[0.2em] text-smith-muted uppercase">SCROLL</span>
                <span className="relative h-10 w-px overflow-hidden bg-smith-stroke">
                    <span className="accent-gradient animate-scroll-down absolute inset-x-0 h-1/2" />
                </span>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function SelectedWorks() {
    return (
        <section className="bg-smith-bg py-12 md:py-16">
            <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
                <SectionHeader
                    eyebrow="Selected Work"
                    lead="Featured"
                    italic="projects"
                    subtext="A selection of projects I've worked on, from concept to launch."
                    action="View all work"
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
                    {WORKS.map(work => (
                        <motion.div
                            {...REVEAL}
                            key={work.title}
                            className={`group relative overflow-hidden rounded-3xl border border-smith-stroke bg-smith-surface ${work.span} ${work.ratio}`}
                        >
                            <img
                                src={work.image}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            <div
                                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply"
                                style={HALFTONE}
                            />

                            <div className="absolute inset-0 flex items-center justify-center bg-smith-bg/70 opacity-0 backdrop-blur-lg transition-opacity duration-300 group-hover:opacity-100">
                                <span className="accent-gradient animate-gradient-shift rounded-full p-[1.5px]">
                                    <span className="block rounded-full bg-white px-5 py-2 text-sm text-smith-bg">
                                        View — <em className="font-serif-accent italic">{work.title}</em>
                                    </span>
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Journal() {
    return (
        <section className="bg-smith-bg py-16 md:py-24">
            <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
                <SectionHeader
                    eyebrow="Journal"
                    lead="Recent"
                    italic="thoughts"
                    subtext="Working notes on craft, process and the things I keep relearning."
                    action="View all"
                />

                <div className="flex flex-col gap-4">
                    {JOURNAL.map(entry => (
                        <motion.a
                            {...REVEAL}
                            key={entry.title}
                            href="#"
                            className="flex items-center gap-6 rounded-[40px] border border-smith-stroke bg-smith-surface/30 p-4 no-underline transition-colors hover:bg-smith-surface sm:rounded-full"
                        >
                            <img
                                src={entry.image}
                                alt=""
                                loading="lazy"
                                className="h-16 w-16 shrink-0 rounded-full object-cover sm:h-20 sm:w-20"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block text-base text-smith-text sm:text-lg">
                                    {entry.title}
                                </span>
                                <span className="mt-1 block text-xs text-smith-muted">
                                    {entry.read}
                                </span>
                            </span>
                            <span className="shrink-0 pr-2 text-xs text-smith-muted sm:pr-6 sm:text-sm">
                                {entry.date}
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * One parallax column. Drifts at its own rate across the section's scroll so the
 * two columns separate as the pinned heading holds still behind them.
 */
function ParallaxColumn({ items, progress, distance, align, onOpen }) {
    const y = useTransform(progress, [0, 1], [0, distance]);

    return (
        <motion.div
            style={{ y }}
            className={`flex flex-col gap-12 md:gap-40 ${
                align === 'end' ? 'items-end' : 'items-start'
            }`}
        >
            {items.map(item => (
                <button
                    key={item.title}
                    type="button"
                    onClick={() => onOpen(item)}
                    className="pointer-events-auto aspect-square w-full max-w-[320px] cursor-pointer overflow-hidden rounded-2xl border border-smith-stroke bg-smith-surface p-0"
                    style={{ transform: `rotate(${item.rotate}deg)` }}
                >
                    <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                </button>
            ))}
        </motion.div>
    );
}

function Explorations() {
    const sectionRef = useRef(null);
    const frame = useScrollFrame();
    const [open, setOpen] = useState(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: frame ?? undefined,
        offset: ['start end', 'end start'],
    });

    return (
        <section ref={sectionRef} className="relative min-h-[300vh] bg-smith-bg">
            {/* `sticky` is the pin. Inside a fixed frame it needs no plugin and no
             * scroller to be told about. */}
            <div className="sticky top-0 z-10 flex h-screen flex-col items-center justify-center px-6 text-center">
                <Eyebrow>Explorations</Eyebrow>
                <h2 className="m-0 mt-5 text-4xl tracking-tight text-smith-text md:text-6xl lg:text-7xl">
                    Visual <em className="font-serif-accent italic">playground</em>
                </h2>
                <p className="m-0 mt-4 max-w-md text-sm text-smith-muted md:text-base">
                    Loose studies and offcuts — the work that never had a brief.
                </p>
                <button
                    type="button"
                    className="group relative mt-8 cursor-pointer rounded-full border-2 border-smith-stroke bg-smith-bg px-6 py-3 text-sm text-smith-text hover:border-transparent"
                >
                    <GradientRing />
                    <span className="relative">Dribbble</span>
                </button>
            </div>

            {/*
             * The columns sit above the pinned heading, and each hugs the outer
             * edge of its half — the brief caps the cards at 320px inside far
             * wider columns without saying where in them they sit, and pushed
             * outward they frame the heading instead of covering it.
             *
             * Only the cards take pointer events; the sheet between them stays
             * transparent to clicks so the Dribbble button underneath is reachable.
             */}
            <div className="pointer-events-none absolute inset-0 z-20 flex justify-center">
                <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-12 px-6 md:gap-40">
                    <ParallaxColumn
                        items={EXPLORATIONS.slice(0, 3)}
                        progress={scrollYProgress}
                        distance={-260}
                        align="start"
                        onOpen={setOpen}
                    />
                    <ParallaxColumn
                        items={EXPLORATIONS.slice(3)}
                        progress={scrollYProgress}
                        distance={260}
                        align="end"
                        onOpen={setOpen}
                    />
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(null)}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-smith-bg/90 p-6 backdrop-blur-lg"
                    >
                        <figure className="m-0 max-h-full">
                            <img
                                src={open.image}
                                alt={open.title}
                                className="max-h-[75vh] rounded-2xl object-contain"
                            />
                            <figcaption className="font-serif-accent mt-4 text-center text-xl text-smith-text italic">
                                {open.title}
                            </figcaption>
                        </figure>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Stats() {
    return (
        <section className="bg-smith-bg py-16 md:py-24">
            <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 sm:grid-cols-3 md:px-10 lg:px-16">
                {STATS.map(stat => (
                    <motion.div {...REVEAL} key={stat.label}>
                        <p className="font-serif-accent m-0 text-5xl text-smith-text italic md:text-6xl">
                            {stat.value}
                        </p>
                        <p className="m-0 mt-2 text-sm text-smith-muted">{stat.label}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Contact() {
    const marqueeRef = useRef(null);

    useEffect(() => {
        const track = marqueeRef.current;
        if (!track) return undefined;
        /* Two identical halves scroll by exactly one half, so the seam lands on
         * a duplicate and the loop is invisible. */
        const tween = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
        return () => tween.kill();
    }, []);

    const phrase = 'BUILDING THE FUTURE • ';

    return (
        <section className="relative overflow-hidden bg-smith-bg pt-16 pb-8 md:pt-20 md:pb-12">
            <video
                className="absolute inset-0 h-full w-full scale-y-[-1] object-cover"
                src={HERO_VIDEO}
                autoPlay
                muted
                loop
                playsInline
            />
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10">
                <div className="overflow-hidden py-6">
                    <div ref={marqueeRef} className="flex w-max whitespace-nowrap">
                        {[0, 1].map(half => (
                            <span
                                key={half}
                                className="font-serif-accent text-5xl text-smith-text/80 italic md:text-7xl"
                                aria-hidden={half === 1}
                            >
                                {phrase.repeat(10)}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mx-auto max-w-[1200px] px-6 py-16 text-center md:px-10 lg:px-16">
                    <a
                        href="mailto:hello@michaelsmith.com"
                        className="group relative inline-block rounded-full border-2 border-smith-stroke bg-smith-bg px-8 py-4 text-sm text-smith-text no-underline hover:border-transparent"
                    >
                        <GradientRing />
                        <span className="relative">hello@michaelsmith.com</span>
                    </a>
                </div>

                <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-smith-stroke px-6 pt-8 sm:flex-row md:px-10 lg:px-16">
                    <div className="flex flex-wrap items-center gap-6">
                        {SOCIALS.map(social => (
                            <a
                                key={social}
                                href="#"
                                className="text-sm text-smith-muted no-underline transition-colors hover:text-smith-text"
                            >
                                {social}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        <span className="text-sm text-smith-muted">Available for projects</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

export default function MichaelSmith() {
    const [loading, setLoading] = useState(true);

    return (
        <PageFrame
            title="Michael Smith — Portfolio"
            className="type-inter bg-smith-bg text-smith-text"
        >
            {/* Clear of the centred nav pill, which starts at pt-4. */}
            <BackButton fixed top={78} left={20} />

            {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

            <Hero />
            <SelectedWorks />
            <Journal />
            <Explorations />
            <Stats />
            <Contact />
        </PageFrame>
    );
}
