import React, { useRef, useState } from 'react';
import {
    motion,
    useMotionTemplate,
    useScroll,
    useTransform,
} from 'framer-motion';
import {
    ArrowUpRight,
    Camera,
    ChevronDown,
    CreditCard,
    Globe2,
    Hexagon,
    Menu,
    Palette,
    PenTool,
    ShoppingBag,
    Target,
    TrendingUp,
    Tv,
    X,
} from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import FadeIn from './shared/FadeIn.jsx';
import { useScrollFrame } from './shared/frameContext.js';
import { Github, Instagram, LinkedIn, Twitter } from './shared/BrandIcons.jsx';

/**
 * Skyline — a dark agency site whose hero is a 300vh scroll: a pencil sketch of
 * a city that a circular mask opens onto the photograph of the same city, with
 * the headline swapping from "Imagine the Future" to "Build the Reality" behind
 * the same mask. The brief has no brand name for it; the two skylines are the
 * whole identity, so it takes theirs.
 *
 * Every scroll-linked value here goes through `useScrollFrame()`. These pages
 * are `position: fixed`, so the window's own scroll never moves and a plain
 * `useScroll({ target })` would sit at 0 forever — see "The scroll gotcha" in
 * this folder's README.
 *
 * The expanding work gallery animates `flexGrow`, not the `flex` shorthand the
 * brief names. `flex: 4` is three values in a trench coat; handing a shorthand
 * to a tween gives it nothing continuous to interpolate. Growing from 0.8 to 4
 * against a fixed `flex-basis: 0` produces the described layout exactly.
 */

const CITY_OUTLINE = '/assets/skyline/city-outline.jpg';
const CITY_PHOTO = '/assets/skyline/city.jpg';

const NAV_LINKS = ['Services', 'Work', 'Agency', 'Contact'];

/* lucide has no brand set, so each client is an icon that stands in for one. */
const CLIENTS = [
    { name: 'Instagram', Icon: Camera },
    { name: 'Shopify', Icon: ShoppingBag },
    { name: 'HubSpot', Icon: Hexagon },
    { name: 'CNBC', Icon: Tv },
    { name: 'BUSINESS INSIDER', Icon: Globe2 },
    { name: 'stripe', Icon: CreditCard },
];

const SERVICES = [
    {
        Icon: Palette,
        title: 'UI/UX Design',
        body: 'Interfaces that carry a product rather than decorate it — research, flows, prototypes and a system your team can keep building on.',
    },
    {
        Icon: PenTool,
        title: 'Visual Graphic',
        body: 'Identity, art direction and the whole library of assets that comes after it, drawn to hold up at every size you will actually ship.',
    },
    {
        Icon: Target,
        title: 'Strategy',
        body: 'Positioning, audience and message worked out before a pixel moves, so the design has something specific to argue for.',
    },
    {
        Icon: TrendingUp,
        title: 'Business Growth',
        body: 'Funnels, launch campaigns and the measurement to tell which half of the work paid — then more of that half.',
    },
];

const PROJECTS = [
    {
        name: 'Pixzen',
        image: '/assets/skyline/work/pixzen.webp',
        tag: 'Brand & Product',
        body: 'A photography platform rebuilt around the one thing its users came for.',
    },
    {
        name: 'Wander',
        image: '/assets/skyline/work/wander.webp',
        tag: 'Web Experience',
        body: 'Travel booking that reads like a magazine and books like a kiosk.',
    },
    {
        name: 'Agentify',
        image: '/assets/skyline/work/agentify.webp',
        tag: 'SaaS Platform',
        body: 'An agent console dense with data and still calm to look at.',
    },
    {
        name: 'Future',
        image: '/assets/skyline/work/future.webp',
        tag: 'Campaign',
        body: 'A launch carousel built to survive being screenshotted out of context.',
    },
    {
        name: 'Genova',
        image: '/assets/skyline/work/genova.webp',
        tag: 'Identity',
        body: 'One mark, one grid, and a type scale that finally holds across markets.',
    },
];

const STATS = [
    { value: '10+', label: 'Years Experience' },
    { value: '150+', label: 'Global Clients' },
];

const FOOTER_COLUMNS = [
    { title: 'Company', links: ['About', 'Careers', 'Journal', 'Contact'] },
    { title: 'Services', links: ['UI/UX Design', 'Visual Graphic', 'Strategy', 'Growth'] },
];

/* Read once at module load rather than during render, which keeps the render
 * pure — the same reason `Math.random()` is banned in these templates. */
const YEAR = new Date().getFullYear();

const SOCIALS = [
    { name: 'Instagram', Icon: Instagram },
    { name: 'Twitter', Icon: Twitter },
    { name: 'LinkedIn', Icon: LinkedIn },
    { name: 'GitHub', Icon: Github },
];

/* -------------------------------------------------------------------------- */

function Navbar() {
    const frameRef = useScrollFrame();
    const [open, setOpen] = useState(false);
    const { scrollY } = useScroll({ container: frameRef });

    const background = useTransform(
        scrollY,
        [0, 50],
        ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.08)']
    );
    const blur = useTransform(scrollY, [0, 50], [8, 24]);
    const backdropFilter = useMotionTemplate`blur(${blur}px)`;

    return (
        <motion.nav
            style={{ background, backdropFilter, WebkitBackdropFilter: backdropFilter }}
            className={`fixed top-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 border border-white/10 px-5 py-3 transition-[border-radius] duration-300 ${
                open ? 'rounded-3xl' : 'rounded-full'
            }`}
        >
            <div className="flex items-center justify-between">
                <a href="#" className="text-lg font-black tracking-tighter text-white no-underline">
                    Skyline
                </a>

                <div className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map(link => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            className="group relative text-sm font-medium text-gray-300 no-underline transition-colors hover:text-white"
                        >
                            {link}
                            <span className="absolute -bottom-1 left-0 block h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href="#contact"
                        className="hidden rounded-full bg-white px-5 py-2 text-sm font-semibold text-black no-underline transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 sm:block"
                    >
                        Start Project
                    </a>
                    <button
                        type="button"
                        onClick={() => setOpen(value => !value)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={open}
                        className="cursor-pointer border-none bg-transparent p-2 text-white md:hidden"
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            <div
                className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 md:hidden ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="min-h-0">
                    <div className="flex flex-col gap-1 pt-4">
                        {NAV_LINKS.map(link => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                onClick={() => setOpen(false)}
                                className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 no-underline hover:bg-white/5 hover:text-white"
                            >
                                {link}
                            </a>
                        ))}
                        <a
                            href="#contact"
                            onClick={() => setOpen(false)}
                            className="mt-2 rounded-full bg-white px-5 py-2.5 text-center text-sm font-semibold text-black no-underline sm:hidden"
                        >
                            Start Project
                        </a>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}

/* -------------------------------------------------------------------------- */

/** One full-bleed layer of the hero: image, dimmer, headline. */
function CityLayer({ image, scale, eyebrow, heading, tone }) {
    return (
        <>
            <motion.div
                style={{ scale, backgroundImage: `url(${image})` }}
                className="absolute inset-0 bg-cover bg-center will-change-transform"
            />
            <div className={`absolute inset-0 ${tone}`} />
            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
                <span className="mb-6 text-xs font-bold tracking-widest text-white/60 uppercase">
                    {eyebrow}
                </span>
                <h1 className="m-0 max-w-4xl text-5xl leading-[1.1] font-black tracking-tighter text-white sm:text-7xl lg:text-8xl">
                    {heading}
                </h1>
            </div>
        </>
    );
}

function Hero() {
    const frameRef = useScrollFrame();
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: frameRef,
        offset: ['start start', 'end end'],
    });

    /* The aperture. 150% rather than 100% so the circle has cleared the
     * corners of a wide viewport by the time the scroll ends. */
    const clipPath = useTransform(
        scrollYProgress,
        [0, 1],
        ['circle(0% at 50% 50%)', 'circle(150% at 50% 50%)']
    );
    const baseScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
    const revealScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
    const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

    return (
        <section ref={sectionRef} className="relative h-[300vh]">
            <div className="sticky top-0 h-screen overflow-hidden">
                <CityLayer
                    image={CITY_OUTLINE}
                    scale={baseScale}
                    eyebrow="A digital studio"
                    heading="Imagine the Future"
                    tone="bg-skyline-bg/80"
                />

                <motion.div style={{ clipPath }} className="absolute inset-0">
                    <CityLayer
                        image={CITY_PHOTO}
                        scale={revealScale}
                        eyebrow="And then ship it"
                        heading="Build the Reality"
                        tone="bg-black/40"
                    />
                </motion.div>

                <motion.div
                    style={{ opacity: hintOpacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <ChevronDown size={28} className="animate-bounce text-white/70" />
                </motion.div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Clients() {
    /* Rendered twice end to end; the track travels exactly one copy's width, so
     * the wrap lands on an identical frame. */
    const track = [...CLIENTS, ...CLIENTS];

    return (
        <section className="relative py-24">
            <FadeIn className="mx-auto mb-14 flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-bold tracking-widest text-gray-400 uppercase backdrop-blur-md">
                    Interested
                </span>
                <h2 className="m-0 text-3xl font-black tracking-tighter text-white md:text-4xl">
                    Trusted by 300+ businesses
                </h2>
            </FadeIn>

            <div className="relative overflow-hidden">
                <motion.div
                    className="flex w-max items-center gap-16 pr-16"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
                >
                    {track.map(({ name, Icon }, i) => (
                        <span
                            key={`${name}-${i}`}
                            className="flex items-center gap-3 text-lg font-semibold whitespace-nowrap text-gray-600"
                        >
                            <Icon size={24} />
                            {name}
                        </span>
                    ))}
                </motion.div>

                <div className="from-skyline-bg pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r to-transparent" />
                <div className="from-skyline-bg pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l to-transparent" />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Services() {
    return (
        <section id="services" className="mx-auto max-w-6xl px-4 py-32 sm:px-6 lg:px-8">
            <FadeIn as="h2" className="m-0 mb-16 max-w-2xl text-4xl leading-tight font-black tracking-tighter text-white md:text-6xl">
                Services Built Specifically for your Business
            </FadeIn>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {SERVICES.map(({ Icon, title, body }, i) => (
                    <FadeIn
                        key={title}
                        delay={i * 0.1}
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
                    >
                        {/* Quarter disc pinned into the corner — the icon's
                         * background is the corner itself, not a chip on it. */}
                        <div className="absolute top-0 right-0 flex h-24 w-24 items-start justify-end rounded-bl-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 p-5">
                            <Icon size={24} className="text-blue-200" />
                        </div>

                        <h3 className="m-0 mt-16 mb-3 text-2xl font-black tracking-tighter text-white">
                            {title}
                        </h3>
                        <p className="m-0 max-w-sm leading-relaxed font-light text-gray-400">
                            {body}
                        </p>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Work() {
    const [activeIdx, setActiveIdx] = useState(0);

    return (
        <section id="work" className="mx-auto max-w-[1400px] px-4 py-32 sm:px-6 lg:px-8">
            <FadeIn className="mb-12 flex flex-wrap items-end justify-between gap-4">
                <h2 className="m-0 text-4xl font-black tracking-tighter text-white md:text-6xl">
                    Our Works
                </h2>
                <a
                    href="#work"
                    className="group flex items-center gap-2 text-sm font-medium text-gray-400 no-underline transition-colors hover:text-white"
                >
                    View All Projects
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
            </FadeIn>

            <div className="flex h-auto flex-col gap-3 md:h-[400px] md:flex-row">
                {PROJECTS.map((project, i) => {
                    const active = i === activeIdx;
                    return (
                        <motion.button
                            key={project.name}
                            type="button"
                            onMouseEnter={() => setActiveIdx(i)}
                            onFocus={() => setActiveIdx(i)}
                            onClick={() => setActiveIdx(i)}
                            animate={{ flexGrow: active ? 4 : 0.8 }}
                            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                            style={{ flexBasis: 0, flexShrink: 1 }}
                            className="group relative h-56 min-w-0 cursor-pointer overflow-hidden rounded-3xl border-none p-0 text-left md:h-auto"
                        >
                            <img
                                src={project.image}
                                alt={`${project.name} — ${project.tag}`}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div
                                className={`absolute inset-0 transition-colors duration-700 ${
                                    active ? 'bg-black/40' : 'bg-black/60'
                                }`}
                            />

                            <div className="relative flex h-full flex-col justify-end p-6">
                                <span className="text-xs font-bold tracking-widest text-blue-200 uppercase">
                                    {project.tag}
                                </span>
                                <h3
                                    className={`m-0 mt-2 text-3xl font-black tracking-tighter text-white ${
                                        active ? '' : 'md:[writing-mode:vertical-rl] md:rotate-180'
                                    }`}
                                >
                                    {project.name}
                                </h3>

                                {/* Only the open panel is wide enough to read in,
                                 * so the body and CTA live entirely inside it. */}
                                <div
                                    className={`overflow-hidden transition-[max-height,opacity] duration-700 ${
                                        active ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="m-0 mt-3 max-w-md leading-relaxed font-light text-gray-300">
                                        {project.body}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">
                                        View Case Study
                                        <ArrowUpRight size={16} />
                                    </span>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function About() {
    return (
        <section id="agency" className="relative py-32">
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[120px]" />

            <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                <FadeIn as="h2" className="m-0 text-4xl leading-tight font-black tracking-tighter text-white md:text-6xl">
                    Design is not just what it looks like. It&apos;s how it feels.
                </FadeIn>

                <FadeIn delay={0.15} className="flex flex-col gap-8">
                    <p className="m-0 leading-relaxed font-light text-gray-300">
                        We are a small studio that takes a small number of projects a year, which
                        is the only way we know to stay on one long enough for it to get good.
                        Strategy, identity and build happen in the same room.
                    </p>
                    <p className="m-0 leading-relaxed font-light text-gray-400">
                        The work ships. That is the measure — not the pitch deck, not the
                        moodboard, and not the version of it that only exists at 1440px.
                    </p>

                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                        {STATS.map(({ value, label }) => (
                            <div key={label}>
                                <p className="m-0 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-5xl font-black tracking-tighter text-transparent">
                                    {value}
                                </p>
                                <p className="m-0 mt-2 text-sm font-medium text-gray-400">{label}</p>
                            </div>
                        ))}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Footer() {
    return (
        <footer id="contact" className="border-t border-white/5 pt-32">
            <FadeIn className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 text-center sm:px-6 lg:px-8">
                <h2 className="m-0 max-w-3xl text-5xl leading-[1.1] font-black tracking-tighter text-white md:text-7xl">
                    Let&apos;s create something epic.
                </h2>
                <a
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-black no-underline transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
                >
                    Start a Project
                    <ArrowUpRight size={18} />
                </a>
            </FadeIn>

            <div className="mx-auto mt-32 grid max-w-6xl grid-cols-2 gap-10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
                <div className="col-span-2 lg:col-span-1">
                    <p className="m-0 text-2xl font-black tracking-tighter text-white">Skyline</p>
                    <p className="m-0 mt-3 max-w-xs text-sm leading-relaxed font-light text-gray-400">
                        A digital studio drawing the future and then building it, from two cities
                        and one shared file.
                    </p>
                </div>

                {FOOTER_COLUMNS.map(column => (
                    <div key={column.title}>
                        <p className="m-0 mb-4 text-xs font-bold tracking-widest text-gray-600 uppercase">
                            {column.title}
                        </p>
                        <ul className="m-0 flex list-none flex-col gap-3 p-0">
                            {column.links.map(link => (
                                <li key={link}>
                                    <a
                                        href="#contact"
                                        className="text-sm font-light text-gray-400 no-underline transition-colors hover:text-white"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <p className="m-0 mb-4 text-xs font-bold tracking-widest text-gray-600 uppercase">
                        Social
                    </p>
                    <div className="flex items-center gap-4">
                        {SOCIALS.map(({ name, Icon }) => (
                            <a
                                key={name}
                                href="#contact"
                                aria-label={name}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:text-white"
                            >
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-20 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/5 px-4 py-8 text-xs text-gray-600 sm:flex-row sm:px-6 lg:px-8">
                <span>© {YEAR} Skyline Studio. All rights reserved.</span>
                <div className="flex gap-6">
                    <a href="#contact" className="text-gray-600 no-underline hover:text-gray-400">
                        Privacy Policy
                    </a>
                    <a href="#contact" className="text-gray-600 no-underline hover:text-gray-400">
                        Terms of Service
                    </a>
                </div>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------------- */

export default function Skyline() {
    return (
        <PageFrame
            title="Skyline — Imagine the Future, Build the Reality"
            className="type-outfit bg-skyline-bg selection:bg-blue-500/30"
        >
            <BackButton fixed top={92} left={24} />
            <Navbar />
            <main>
                <Hero />
                <Clients />
                <Services />
                <Work />
                <About />
            </main>
            <Footer />
        </PageFrame>
    );
}
