import React, { useRef, useState } from 'react';
import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import { useScrollFrame } from './shared/frameContext.js';

/**
 * Outbox — an agency site built on one gag: the O in its wordmark is a circle,
 * and the circle is the scroll. Four concentric discs grow out of the middle of
 * the letter until the outermost one has swallowed the viewport, and the site
 * continues inside it.
 *
 * Three things are load-bearing.
 *
 * **The B/X margins.** The two letters are positioned from the centre line with
 * `mr-[14vmin]` and `ml-[11vmin]` rather than symmetric values. Inter's `B` and
 * `X` have different side bearings, so mirroring the offset leaves a visible
 * gap on one side of the circle and an overlap on the other. These two numbers
 * are the ones that make both letters kiss it.
 *
 * **Blend modes.** The footer's knockout is not a mask: a black panel set to
 * `mix-blend-multiply` over the video turns everything black except the white
 * glyphs, which pass the video through untouched; the wrapper's
 * `mix-blend-screen` then drops that black back out against the page. Change
 * either mode and the whole effect reverts to white text on a video.
 *
 * **The frame, again.** Every `useScroll` here is passed `useScrollFrame()`.
 * The window behind these templates never scrolls, so without it all seven
 * scroll ranges below read a constant zero.
 *
 * The hero's shrink-away is tied to the last quarter of its own 400vh, and the
 * services section is pulled up by `-mt-[100vh]` so it is already sliding over
 * the hero while that shrink is happening.
 */

const HERO_VIDEO = '/assets/outbox/bg1.mp4';
const CIRCLE_VIDEO = '/assets/outbox/bg4.mp4';

const NAV_LINKS = ['Work', 'Services', 'About', 'Contact'];

/* Inner discs, outermost first. The outermost is the O and is handled apart —
 * it is the only one that carries a video and the only one that never fades. */
const INNER_CIRCLES = [
    { color: '#c93a1c', size: '34vmin', from: 0.05, to: 0.4, scale: [0.5, 4.2] },
    { color: '#8c2510', size: '26vmin', from: 0.1, to: 0.45, scale: [0.5, 3.6] },
    { color: '#521307', size: '18vmin', from: 0.15, to: 0.5, scale: [0.5, 3.0] },
];

const SERVICES = [
    {
        title: 'Brand Identity',
        body: 'Naming, marks, type and the rules that keep them honest once forty other people start using them.',
        surface: 'bg-slate-800',
        video: '/assets/outbox/bg5.mp4',
    },
    {
        title: 'Digital Marketing',
        body: 'Campaigns that earn their impressions — built around one idea, then cut for every place it has to land.',
        surface: 'bg-slate-700',
        video: '/assets/outbox/bg2.mp4',
    },
    {
        title: 'Web Experience',
        body: 'Sites people remember scrolling. Motion with a reason, and a build that stays fast under all of it.',
        surface: 'bg-outbox-orange',
        video: '/assets/outbox/bg3.mp4',
    },
];

const PROJECTS = [
    { name: 'EcoNexa', tag: 'Sustainability Platform', image: '/assets/outbox/work/econexa.webp' },
    { name: 'Bali Travel', tag: 'Editorial & Booking', image: '/assets/outbox/work/bali.webp' },
    { name: 'Calm', tag: 'Product Identity', image: '/assets/outbox/work/calm.webp' },
    { name: 'Northridge', tag: 'Property Brand', image: '/assets/outbox/work/northridge.webp' },
    { name: 'Naturally', tag: 'E-commerce', image: '/assets/outbox/work/naturally.webp' },
];

const FOOTER_LINKS = ['Instagram', 'LinkedIn', 'Dribbble', 'hello@outbox.studio'];

const YEAR = new Date().getFullYear();

/** The technical wash over the whole page. Two hairlines on a 44px repeat. */
const GRID_STYLE = {
    backgroundImage:
        'linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px),' +
        'linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)',
    backgroundSize: '44px 44px',
};

/** Every background clip in this design plays the same way. */
function BackdropVideo({ src, className }) {
    return (
        <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={className}
        />
    );
}

/* -------------------------------------------------------------------------- */

function Navbar() {
    const frameRef = useScrollFrame();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll({ container: frameRef });

    /* The chrome swap is a step, not a ramp, so this subscribes and sets state
     * at the threshold instead of driving a style every frame. */
    useMotionValueEvent(scrollY, 'change', value => setScrolled(value > 50));

    return (
        <>
            <nav
                className={`fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 rounded-full px-6 py-4 transition-all duration-300 md:top-6 md:w-[calc(100%-3rem)] ${
                    scrolled
                        ? 'border border-white/20 bg-white/10 backdrop-blur-xl'
                        : 'border border-transparent drop-shadow-lg'
                }`}
            >
                <div className="flex items-center">
                    <a
                        href="#"
                        className="mr-auto text-2xl font-black tracking-tighter text-white no-underline md:text-3xl"
                    >
                        OUT<span className="text-white/70">BOX</span>
                    </a>

                    <div className="mr-8 hidden items-center gap-8 lg:flex">
                        {NAV_LINKS.map(link => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                className="hover:text-outbox-orange text-xs font-bold tracking-[0.3em] text-white uppercase no-underline transition-colors"
                            >
                                {link}
                            </a>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen(value => !value)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={open}
                        className="cursor-pointer border-none bg-transparent p-1 text-white"
                    >
                        {open ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
                        className="bg-outbox-darkest fixed inset-0 z-40 flex flex-col items-center justify-center gap-4"
                    >
                        {NAV_LINKS.map(link => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                onClick={() => setOpen(false)}
                                className="hover:text-outbox-orange text-4xl font-black tracking-tighter text-white no-underline transition-transform duration-300 hover:scale-110 md:text-6xl"
                            >
                                {link}
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/* -------------------------------------------------------------------------- */

function Hero() {
    const frameRef = useScrollFrame();
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: frameRef,
        offset: ['start start', 'end end'],
    });

    /* The last quarter: the whole stage shrinks into a rounded card and leaves,
     * uncovering the services section that has been sliding up behind it. */
    const stageScale = useTransform(scrollYProgress, [0.75, 1], [1, 0.7]);
    const stageY = useTransform(scrollYProgress, [0.75, 1], ['0vh', '-6vh']);
    const stageRadius = useTransform(scrollYProgress, [0.75, 1], ['0px', '60px']);
    const stageOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

    const circleScale = useTransform(scrollYProgress, [0, 0.5], [0.5, 5]);
    const lettersOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

    const firstOpacity = useTransform(scrollYProgress, [0.15, 0.22, 0.38, 0.45], [0, 1, 1, 0]);
    const firstY = useTransform(scrollYProgress, [0.15, 0.22, 0.38, 0.45], [50, 0, 0, -50]);
    const secondOpacity = useTransform(scrollYProgress, [0.45, 0.55], [0, 1]);
    const secondY = useTransform(scrollYProgress, [0.45, 0.55], [50, 0]);

    return (
        <section ref={sectionRef} className="relative z-20 h-[400vh]">
            <motion.div
                style={{
                    scale: stageScale,
                    y: stageY,
                    borderRadius: stageRadius,
                    opacity: stageOpacity,
                }}
                className="bg-outbox-darker sticky top-0 h-screen overflow-hidden will-change-transform"
            >
                <BackdropVideo
                    src={HERO_VIDEO}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
                />

                {/* Discs, painted back to front: the inner three sit on top of
                 * the O until they have grown past it and faded. */}
                <motion.div
                    style={{ scale: circleScale }}
                    className="bg-outbox-orange absolute top-1/2 left-1/2 h-[44vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full will-change-transform"
                >
                    <BackdropVideo
                        src={CIRCLE_VIDEO}
                        className="pointer-events-none h-full w-full object-cover opacity-50 mix-blend-overlay"
                    />
                </motion.div>

                {INNER_CIRCLES.map(circle => (
                    <InnerCircle key={circle.color} progress={scrollYProgress} {...circle} />
                ))}

                <motion.div
                    style={{ opacity: lettersOpacity }}
                    className="pointer-events-none absolute inset-0 text-[30vmin] leading-none font-black tracking-tighter text-white"
                >
                    <span className="absolute top-1/2 right-[50%] mr-[14vmin] -translate-y-1/2">
                        B
                    </span>
                    <span className="absolute top-1/2 left-[50%] ml-[11vmin] -translate-y-1/2">
                        X
                    </span>
                </motion.div>

                <motion.div
                    style={{ opacity: firstOpacity, y: firstY }}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
                >
                    <h1 className="m-0 max-w-4xl text-center text-6xl leading-tight font-black tracking-tighter text-white md:text-8xl">
                        Think outside the box.
                    </h1>
                </motion.div>

                <motion.div
                    style={{ opacity: secondOpacity, y: secondY }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center"
                >
                    <h2 className="m-0 max-w-4xl text-4xl leading-tight font-black tracking-tighter text-white md:text-7xl">
                        Elevating Brands.
                        <br />
                        Defining Futures.
                    </h2>
                    <a
                        href="#contact"
                        className="group text-outbox-darkest inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold no-underline transition-transform hover:scale-105 active:scale-95"
                    >
                        Let&apos;s Talk
                        <ArrowRight
                            size={20}
                            className="transition-transform duration-300 group-hover:translate-x-1.5"
                        />
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
}

function InnerCircle({ progress, color, size, from, to, scale }) {
    const s = useTransform(progress, [from, to], scale);
    const opacity = useTransform(progress, [to - 0.1, to], [1, 0]);

    return (
        <motion.div
            style={{ scale: s, opacity, background: color, width: size, height: size }}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
        />
    );
}

/* -------------------------------------------------------------------------- */

function Services() {
    const frameRef = useScrollFrame();
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: frameRef,
        offset: ['start start', 'end end'],
    });

    return (
        <section
            id="services"
            ref={sectionRef}
            className="relative z-10 -mt-[100vh] h-[300vh]"
        >
            <div className="sticky top-0 flex h-screen flex-col items-center gap-10 px-6 pt-28 pb-10 md:flex-row md:gap-16 md:px-16 md:pt-0">
                <div className="w-full md:w-1/3">
                    <p className="text-outbox-orange m-0 mb-4 text-sm font-bold tracking-[0.3em] uppercase">
                        Services
                    </p>
                    <h2 className="m-0 text-4xl leading-tight font-black tracking-tighter text-white md:text-6xl">
                        Our Core Expertise.
                    </h2>
                    <p className="m-0 mt-6 max-w-sm text-lg leading-relaxed text-slate-200">
                        Three practices, one team. Most projects use all three, and none of them
                        gets handed over a wall.
                    </p>
                </div>

                <div className="relative h-[60vh] w-full md:w-2/3">
                    {SERVICES.map((service, i) => (
                        <ServiceCard
                            key={service.title}
                            progress={scrollYProgress}
                            index={i}
                            {...service}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/**
 * Each card owns a quarter of the section's scroll to slide in over, and gives
 * up 0.05 of scale to every card that lands on top of it afterwards. The last
 * one never shrinks, so its stops are a flat pair.
 */
const CARD_SCALE = [
    { at: [0.3, 0.55, 0.8], to: [1, 0.95, 0.9] },
    { at: [0.55, 0.8], to: [1, 0.95] },
    { at: [0, 1], to: [1, 1] },
];

function ServiceCard({ progress, index, title, body, surface, video }) {
    const enterFrom = 0.05 + index * 0.25;
    const enterTo = enterFrom + 0.25;

    const y = useTransform(progress, [enterFrom, enterTo], ['100%', '0%']);
    const scale = useTransform(progress, CARD_SCALE[index].at, CARD_SCALE[index].to);

    return (
        <motion.article
            style={{ y, scale, top: index * 40 }}
            className={`absolute inset-x-0 flex h-[calc(60vh-80px)] flex-col justify-end overflow-hidden rounded-3xl p-8 will-change-transform md:p-12 ${surface}`}
        >
            <BackdropVideo
                src={video}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="relative">
                <span className="text-sm font-bold tracking-[0.3em] text-white/70 uppercase">
                    0{index + 1}
                </span>
                <h3 className="m-0 mt-3 text-3xl font-black tracking-tighter text-white md:text-5xl">
                    {title}
                </h3>
                <p className="m-0 mt-4 max-w-md text-lg leading-relaxed text-white/90">{body}</p>
            </div>
        </motion.article>
    );
}

/* -------------------------------------------------------------------------- */

function Portfolio() {
    const [activeIdx, setActiveIdx] = useState(0);

    return (
        <section id="work" className="relative z-10 min-h-screen bg-[#111] px-6 py-28 md:px-16">
            <div className="mb-12">
                <p className="text-outbox-orange m-0 mb-4 text-sm font-bold tracking-[0.3em] uppercase">
                    Featured Work
                </p>
                <h2 className="m-0 text-4xl font-black tracking-tighter text-white md:text-6xl">
                    Selected Projects.
                </h2>
            </div>

            <div className="flex h-[75vh] flex-col gap-2 md:h-[60vh] md:flex-row">
                {PROJECTS.map((project, i) => {
                    const active = i === activeIdx;
                    return (
                        <button
                            key={project.name}
                            type="button"
                            onMouseEnter={() => setActiveIdx(i)}
                            onFocus={() => setActiveIdx(i)}
                            onClick={() => setActiveIdx(i)}
                            className={`relative min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-2xl border-none p-0 text-left transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                                active ? 'flex-[4] md:flex-[5]' : 'flex-[1]'
                            }`}
                        >
                            <img
                                src={project.image}
                                alt={`${project.name} — ${project.tag}`}
                                loading="lazy"
                                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                                    active ? 'opacity-100 blur-none' : 'opacity-50 blur-sm'
                                }`}
                            />
                            <div
                                className={`absolute inset-0 transition-colors duration-700 ${
                                    active ? 'bg-black/30' : 'bg-black/60'
                                }`}
                            />
                            <div className="relative flex h-full flex-col justify-end p-6">
                                <span className="text-outbox-orange text-xs font-bold tracking-[0.3em] uppercase">
                                    {project.tag}
                                </span>
                                <h3 className="m-0 mt-2 text-2xl font-black tracking-tighter whitespace-normal text-white md:text-4xl md:whitespace-nowrap">
                                    {project.name}
                                </h3>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Footer() {
    return (
        <footer
            id="contact"
            className="bg-outbox-darkest relative z-10 flex h-screen flex-col justify-between px-6 py-12 md:px-16"
        >
            <div className="flex flex-1 items-center justify-center">
                {/* Knockout stack. `screen` on the wrapper, `multiply` on the
                 * black panel; the white glyphs are the only thing either mode
                 * leaves alone, so the clip plays inside the letters. */}
                <div className="relative w-full mix-blend-screen">
                    <BackdropVideo
                        src={HERO_VIDEO}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    />
                    <h2 className="hover:text-outbox-orange m-0 bg-black text-center text-[12vw] leading-none font-black tracking-tighter text-white mix-blend-multiply transition-colors duration-500">
                        LET&apos;S TALK.
                    </h2>
                </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/70 md:flex-row">
                <span>© {YEAR} Outbox Studio</span>
                <div className="flex flex-col items-center gap-4 md:flex-row">
                    {FOOTER_LINKS.map(link => (
                        <a
                            key={link}
                            href="#contact"
                            className="text-white/70 no-underline transition-colors hover:text-white"
                        >
                            {link}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------------- */

export default function Outbox() {
    return (
        <PageFrame title="Outbox — Think Outside the Box" className="type-inter bg-outbox-darker">
            <BackButton fixed top={96} left={28} />

            {/* Above everything, including the navbar and the mobile sheet —
             * at 10% it reads as a texture on the page rather than a layer in
             * it, which only works if nothing paints over it. */}
            <div
                aria-hidden="true"
                style={GRID_STYLE}
                className="pointer-events-none fixed inset-0 z-[100] opacity-10"
            />

            <Navbar />
            <main className="relative">
                <Hero />
                <Services />
                <Portfolio />
            </main>
            <Footer />
        </PageFrame>
    );
}
