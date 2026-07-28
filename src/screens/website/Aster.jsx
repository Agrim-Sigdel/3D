import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, Globe, Play } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import FadingVideo from './shared/FadingVideo.jsx';
import BlurText from './shared/BlurText.jsx';

/**
 * Aster — a two-section space-travel site. Hero, then Capabilities, each over a
 * full-bleed video that crossfades through black at its loop point rather than
 * cutting (see `./shared/FadingVideo`).
 *
 * Neither video takes a dimming overlay. All the contrast white type needs comes
 * from the glass chrome it sits on, which is why every chip, card and pill here
 * is a `liquid-glass` variant.
 *
 * The brief pinned this to CDN React 18 with in-browser Babel and asked Tailwind
 * for a global `borderRadius.DEFAULT: 9999px`. It is built on the repo's React 19
 * instead, and the pill radius is written as `rounded-full` at each site — a
 * global default would turn every `rounded` corner in the rest of the library
 * into a capsule.
 */

const HERO_VIDEO = '/assets/aster/hero.mp4';
const CAPABILITIES_VIDEO = '/assets/aster/capabilities.mp4';

const NAV_LINKS = ['Home', 'Voyages', 'Worlds', 'Innovation', 'Plan Launch'];

const PARTNERS = ['Aeon', 'Vela', 'Apex', 'Orbit', 'Zeno'];

const STATS = [
    { Icon: Clock, value: '34.5 Min', label: 'Average Videos Watch Time' },
    { Icon: Globe, value: '2.8B+', label: 'Users Across the Globe' },
];

/** Material Icons glyphs, on a 24×24 grid. */
const CARD_ICONS = {
    image: 'M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z',
    movie: 'M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z',
    lightbulb:
        'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z',
};

const CAPABILITIES = [
    {
        icon: 'image',
        title: 'AI Scenery',
        tags: ['Natural Context', 'Photo Realism', 'Infinite Settings', 'Eco-Vibe'],
        body: 'AI analyzes your product to create indistinguishable natural environments — from Icelandic cliffs to misty forests.',
    },
    {
        icon: 'movie',
        title: 'Batch Production',
        tags: ['Scale Fast', 'Visual Consistency', 'Time Saver', 'Ready to Post'],
        body: 'Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.',
    },
    {
        icon: 'lightbulb',
        title: 'Smart Lighting',
        tags: ['Ray Tracing', 'Physical Shadows', 'Studio Quality', 'Sunlight Sync'],
        body: 'Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.',
    },
];

/** Shared entrance: everything arrives out of focus and settles. */
const RISE = {
    initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
};

function Rise({ delay, className = '', children }) {
    return (
        <motion.div
            className={className}
            initial={RISE.initial}
            animate={RISE.animate}
            transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */

function Navbar() {
    return (
        <nav className="fixed top-4 right-0 left-0 z-50 flex items-center justify-between px-8 lg:px-16">
            <div className="liquid-glass flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                <span className="font-serif-accent text-2xl leading-none text-white italic">a</span>
            </div>

            <div className="liquid-glass hidden items-center rounded-full px-1.5 py-1.5 md:flex">
                {NAV_LINKS.map(link => (
                    <a
                        key={link}
                        href="#"
                        className="font-barlow rounded-full px-3 py-2 text-sm font-medium text-white/90 no-underline"
                    >
                        {link}
                    </a>
                ))}
                <button
                    type="button"
                    className="ml-1 flex cursor-pointer items-center gap-1 rounded-full border-none bg-white px-4 py-2 text-sm font-medium whitespace-nowrap text-black"
                >
                    Claim a Spot
                    <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>

            {/* Balances the logo so the centre pill stays optically centred. */}
            <div className="h-12 w-12 shrink-0" aria-hidden="true" />
        </nav>
    );
}

/* -------------------------------------------------------------------------- */

function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-black">
            {/* Oversized and top-anchored: the focal point of this clip is the
             * top of frame, so the crop is taken off the bottom. */}
            <FadingVideo
                src={HERO_VIDEO}
                className="absolute top-0 left-1/2 z-0 -translate-x-1/2 object-cover object-top"
                style={{ width: '120%', height: '120%' }}
            />

            <div className="relative z-10 flex min-h-screen flex-col">
                <Navbar />

                <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
                    <Rise delay={0.4}>
                        <div className="liquid-glass flex items-center gap-3 rounded-full">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                                New
                            </span>
                            <span className="pr-3 text-sm text-white/90">
                                Maiden Crewed Voyage to Mars Arrives 2026
                            </span>
                        </div>
                    </Rise>

                    <BlurText
                        text="Venture Past Our Sky Across the Universe"
                        className="font-serif-accent m-0 max-w-2xl justify-center text-6xl leading-[0.8] tracking-[-4px] text-white italic md:text-7xl lg:text-[5.5rem]"
                    />

                    <Rise delay={0.8}>
                        <p className="font-barlow m-0 mt-4 max-w-2xl text-sm leading-tight font-light text-white md:text-base">
                            Discover the universe in ways once unimaginable. Our pioneering vessels
                            and breakthrough engineering bring deep-space exploration within
                            reach—secure and extraordinary.
                        </p>
                    </Rise>

                    <Rise delay={1.1}>
                        <div className="mt-6 flex items-center gap-6">
                            <button
                                type="button"
                                className="liquid-glass-strong flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
                            >
                                Start Your Voyage
                                <ArrowUpRight className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-sm font-medium text-white"
                            >
                                View Liftoff
                                <Play className="h-4 w-4" fill="currentColor" />
                            </button>
                        </div>
                    </Rise>

                    <Rise delay={1.3}>
                        <div className="mt-8 flex items-stretch gap-4">
                            {STATS.map(({ Icon, value, label }) => (
                                <div
                                    key={value}
                                    className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left"
                                >
                                    <Icon size={28} className="text-white" />
                                    <p className="font-serif-accent m-0 mt-6 text-4xl leading-none tracking-[-1px] text-white italic">
                                        {value}
                                    </p>
                                    <p className="font-barlow m-0 mt-2 text-xs font-light text-white">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Rise>
                </div>

                <Rise delay={1.4} className="flex flex-col items-center gap-4 pb-8">
                    <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
                        Collaborating with top aerospace pioneers globally
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
                        {PARTNERS.map(name => (
                            <span
                                key={name}
                                className="font-serif-accent text-2xl tracking-tight text-white italic md:text-3xl"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </Rise>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Capabilities() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-black">
            <FadingVideo
                src={CAPABILITIES_VIDEO}
                className="absolute inset-0 z-0 h-full w-full object-cover"
            />

            <div className="relative z-10 flex min-h-screen flex-col px-8 pt-24 pb-10 md:px-16 lg:px-20">
                <div className="mb-auto">
                    <p className="font-barlow m-0 mb-6 text-sm text-white/80">// Capabilities</p>
                    <h2 className="font-serif-accent m-0 text-6xl leading-[0.9] tracking-[-3px] text-white italic md:text-7xl lg:text-[6rem]">
                        Production
                        <br />
                        evolved
                    </h2>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {CAPABILITIES.map(card => (
                        <div
                            key={card.title}
                            className="liquid-glass flex min-h-[360px] flex-col rounded-[1.25rem] p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="liquid-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="h-6 w-6 text-white"
                                        aria-hidden="true"
                                    >
                                        <path d={CARD_ICONS[card.icon]} />
                                    </svg>
                                </div>

                                <div className="flex max-w-[70%] flex-wrap justify-end gap-1.5">
                                    {card.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="liquid-glass font-barlow rounded-full px-3 py-1 text-[11px] whitespace-nowrap text-white/90"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1" />

                            <div className="mt-6">
                                <h3 className="font-serif-accent m-0 text-3xl leading-none tracking-[-1px] text-white italic md:text-4xl">
                                    {card.title}
                                </h3>
                                <p className="font-barlow m-0 mt-3 max-w-[32ch] text-sm leading-snug font-light text-white/90">
                                    {card.body}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

export default function Aster() {
    return (
        <PageFrame title="Aster — Venture Past Our Sky" className="type-barlow bg-black">
            {/* Below the fixed navbar, whose right-hand slot is an invisible
             * spacer — there is nothing to collide with on this edge. */}
            <BackButton fixed top={80} left={20} />
            <Hero />
            <Capabilities />
        </PageFrame>
    );
}
