import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import WordsPullUp, { WordsPullUpMultiStyle } from './shared/WordsPullUp.jsx';
import AnimatedText from './shared/AnimatedText.jsx';

/**
 * Prisma — dark, cinematic three-section site for a creative collective.
 *
 * Hero / About / Features. The hero insets its video inside a rounded card so
 * the black page edge frames the footage, and grain is laid over the top under
 * `mix-blend-overlay` to keep the compression artefacts of a web video from
 * reading as flatness.
 */

const CREAM = '#E1E0CC';
const NAV_LINK = { color: 'rgba(225, 224, 204, 0.8)' };

const HERO_VIDEO = '/assets/prisma/hero.mp4';
const CARD_VIDEO = '/assets/prisma/canvas-card.mp4';

const NAV_ITEMS = ['Our story', 'Collective', 'Workshops', 'Programs', 'Inquiries'];

const EASE_OUT = [0.16, 1, 0.3, 1];

const FEATURES = [
    {
        number: '01',
        title: 'Project Storyboard.',
        icon: '/assets/prisma/icon-storyboard.webp',
        items: [
            'Sequence shots on a visual timeline',
            'Drop reference frames straight from your library',
            'Lock beats before a single frame is shot',
            'Share a read-only cut with the client',
        ],
    },
    {
        number: '02',
        title: 'Smart Critiques.',
        icon: '/assets/prisma/icon-critiques.webp',
        items: [
            'AI analysis of pacing, framing and colour',
            'Creative notes threaded to the exact timecode',
            'Integrations with the tools already in your edit',
        ],
    },
    {
        number: '03',
        title: 'Immersion Capsule.',
        icon: '/assets/prisma/icon-capsule.webp',
        items: [
            'Notifications silenced for the length of a session',
            'Ambient soundscapes tuned to the work',
            'Syncs the capsule to your calendar automatically',
        ],
    },
];

/* -------------------------------------------------------------------------- */

function Hero() {
    return (
        <section className="h-screen w-full p-4 md:p-6">
            <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={HERO_VIDEO}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

                {/* Pill hangs off the top edge of the card, rounded on the bottom only. */}
                <nav className="absolute top-0 left-1/2 z-20 -translate-x-1/2 rounded-b-2xl bg-black px-4 py-2 md:rounded-b-3xl md:px-8">
                    <ul className="m-0 flex list-none items-center gap-3 p-0 text-[10px] sm:gap-6 sm:text-xs md:gap-12 md:text-sm lg:gap-14">
                        {NAV_ITEMS.map(item => (
                            <li key={item}>
                                <a
                                    href="#"
                                    className="whitespace-nowrap no-underline transition-colors duration-300"
                                    style={NAV_LINK}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = CREAM;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = NAV_LINK.color;
                                    }}
                                >
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="absolute right-0 bottom-0 left-0 z-10 grid grid-cols-1 items-end gap-6 px-4 pb-4 sm:px-6 sm:pb-6 lg:grid-cols-12 lg:gap-4">
                    <div className="lg:col-span-8">
                        <h1
                            className="m-0 text-[26vw] leading-[0.85] font-medium tracking-[-0.07em] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw]"
                            style={{ color: CREAM }}
                        >
                            <WordsPullUp text="Prisma" showAsterisk />
                        </h1>
                    </div>

                    <div className="flex flex-col gap-5 pb-4 sm:gap-6 lg:col-span-4 lg:pb-10">
                        <motion.p
                            className="m-0 text-xs text-prisma-primary/70 sm:text-sm md:text-base"
                            style={{ lineHeight: 1.2 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT }}
                        >
                            Prisma is a worldwide network of visual artists, filmmakers and
                            storytellers bound not by place, status or labels but by passion and
                            hunger to unlock potential through our unique perspectives.
                        </motion.p>

                        <motion.button
                            type="button"
                            className="group flex w-fit cursor-pointer items-center gap-2 rounded-full border-none bg-prisma-primary py-1.5 pr-1.5 pl-5 text-sm font-medium text-black transition-all duration-300 hover:gap-3 sm:text-base"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.7, ease: EASE_OUT }}
                        >
                            Join the lab
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10">
                                <ArrowRight className="h-4 w-4" style={{ color: CREAM }} />
                            </span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function About() {
    return (
        <section className="bg-black px-4 py-20 sm:px-6 sm:py-28 md:py-36">
            <div className="mx-auto max-w-6xl rounded-2xl bg-[#101010] px-6 py-16 text-center sm:px-12 sm:py-20 md:rounded-[2rem] md:px-16 md:py-28">
                <p className="m-0 mb-8 text-[10px] tracking-[0.2em] text-prisma-primary uppercase sm:mb-12 sm:text-xs">
                    Visual arts
                </p>

                <WordsPullUpMultiStyle
                    className="mx-auto max-w-3xl text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl"
                    segments={[
                        { text: 'I am Marcus Chen,', className: 'font-normal text-[#E1E0CC]' },
                        {
                            text: 'a self-taught director.',
                            className: 'font-serif-accent italic text-[#E1E0CC]',
                        },
                        {
                            text: 'I have skills in color grading, visual effects, and narrative design.',
                            className: 'font-normal text-[#E1E0CC]',
                        },
                    ]}
                />

                <AnimatedText
                    className="mx-auto mt-12 max-w-2xl text-xs leading-relaxed text-[#DEDBC8] sm:mt-16 sm:text-sm md:text-base"
                    text="Over the last seven years, I have worked with Parallax, a Berlin-based production house that crafts cinema, series, and Noir Studio in Paris. Together, we have created work that has earned international acclaim at several major festivals."
                />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Cards scale up from 0.95 as the grid arrives, one after the next. */
function FeatureCard({ index, className = '', children }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

function Features() {
    return (
        <section className="relative min-h-screen overflow-hidden bg-black px-4 py-20 sm:px-6 sm:py-28">
            <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

            <div className="relative mx-auto max-w-7xl">
                <WordsPullUpMultiStyle
                    className="mb-12 text-center text-xl font-normal sm:mb-16 sm:text-2xl md:text-3xl lg:text-4xl"
                    segments={[
                        {
                            text: 'Studio-grade workflows for visionary creators.',
                            className: 'text-[#E1E0CC]',
                        },
                        {
                            text: 'Built for pure vision. Powered by art.',
                            className: 'text-gray-500',
                            newLine: true,
                        },
                    ]}
                />

                <div className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:h-[480px] lg:grid-cols-4">
                    <FeatureCard
                        index={0}
                        className="relative min-h-[360px] overflow-hidden rounded-2xl lg:min-h-0"
                    >
                        <video
                            className="absolute inset-0 h-full w-full object-cover"
                            src={CARD_VIDEO}
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                        <p
                            className="absolute right-5 bottom-5 left-5 m-0 text-base font-medium sm:text-lg"
                            style={{ color: CREAM }}
                        >
                            Your creative canvas.
                        </p>
                    </FeatureCard>

                    {FEATURES.map((feature, i) => (
                        <FeatureCard
                            key={feature.number}
                            index={i + 1}
                            className="flex flex-col rounded-2xl bg-[#212121] p-5 sm:p-6"
                        >
                            <img
                                src={feature.icon}
                                alt=""
                                loading="lazy"
                                className="h-10 w-10 rounded object-cover sm:h-12 sm:w-12"
                            />

                            <h3
                                className="mt-6 mb-5 text-base font-medium sm:text-lg"
                                style={{ color: CREAM }}
                            >
                                {feature.title}{' '}
                                <span className="text-gray-500">({feature.number})</span>
                            </h3>

                            <ul className="m-0 flex flex-1 list-none flex-col gap-3 p-0">
                                {feature.items.map(item => (
                                    <li key={item} className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-prisma-primary" />
                                        <span className="text-xs leading-relaxed text-gray-400">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                className="group mt-8 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-xs font-medium text-prisma-primary"
                            >
                                Learn more
                                <ArrowRight className="h-3.5 w-3.5 -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </button>
                        </FeatureCard>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

export default function Prisma() {
    return (
        <PageFrame title="Prisma — Visual Arts Collective" className="type-almarai bg-black">
            <BackButton fixed />
            <Hero />
            <About />
            <Features />
        </PageFrame>
    );
}
