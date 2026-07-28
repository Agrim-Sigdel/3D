import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import GlassHero from './shared/GlassHero.jsx';

/**
 * Know It All — the five-section build of the Asme site.
 *
 * The hero is `./shared/GlassHero`, the same shell the `asme` template uses;
 * everything below it belongs to this one. Each section is black with a single
 * piece of media, so the page reads as a sequence of held frames rather than a
 * scroll with a background.
 *
 * `Reveal` wraps the entrance the whole page shares. The `-100px` viewport margin
 * means a section commits a little *after* its top edge appears, so the motion
 * lands while the block is properly in frame instead of at the very bottom of it.
 */

const HERO_VIDEO = '/assets/knowitall/hero.mp4';
const FEATURED_VIDEO = '/assets/knowitall/featured.mp4';
const PHILOSOPHY_VIDEO = '/assets/knowitall/philosophy.mp4';

const SERVICES = [
    {
        video: '/assets/knowitall/service-1.mp4',
        tag: 'Strategy',
        title: 'Research & Insight',
        body: 'We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change.',
    },
    {
        video: '/assets/knowitall/service-2.mp4',
        tag: 'Craft',
        title: 'Design & Execution',
        body: 'From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary.',
    },
];

const PHILOSOPHY_BLOCKS = [
    {
        label: 'Choose your space',
        body: 'Every meaningful breakthrough begins at the intersection of disciplined strategy and remarkable creative vision. We operate at that crossroads, turning bold thinking into tangible outcomes that move people and reshape industries.',
    },
    {
        label: 'Shape the future',
        body: 'We believe that the best work emerges when curiosity meets conviction. Our process is designed to uncover hidden opportunities and translate them into experiences that resonate long after the first impression.',
    },
];

const VIEWPORT = { once: true, margin: '-100px' };

function Reveal({ y = 40, x = 0, delay = 0, duration = 0.8, className = '', children }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, x, y }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration, delay }}
        >
            {children}
        </motion.div>
    );
}

/**
 * The emphasis voice inside the headings: Instrument Serif, italic, dimmed.
 *
 * The tint is passed in whole rather than interpolated from a number — Tailwind
 * only generates classes it can find as literal text in the source, so a
 * `text-white/${n}` would compile to nothing.
 */
function Accent({ className = 'text-white/60', children }) {
    return <em className={`font-serif-accent italic ${className}`}>{children}</em>;
}

/* -------------------------------------------------------------------------- */

function About() {
    return (
        <section className="relative overflow-hidden bg-black px-6 pt-32 pb-10 md:pt-44 md:pb-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />

            <div className="relative mx-auto max-w-6xl">
                <Reveal y={20} duration={0.6}>
                    <p className="m-0 text-sm tracking-widest text-white/40 uppercase">About Us</p>
                </Reveal>

                <Reveal delay={0.1}>
                    <h2 className="m-0 mt-6 text-4xl leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
                        Pioneering <Accent>ideas</Accent> for
                        <br className="hidden md:block" /> minds that{' '}
                        <Accent>create, build, and inspire.</Accent>
                    </h2>
                </Reveal>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function FeaturedVideo() {
    return (
        <section className="overflow-hidden bg-black px-6 pt-6 pb-20 md:pt-10 md:pb-32">
            <Reveal
                y={60}
                duration={0.9}
                className="relative mx-auto aspect-video max-w-6xl overflow-hidden rounded-3xl"
            >
                <video
                    className="h-full w-full object-cover"
                    src={FEATURED_VIDEO}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-10">
                    <div className="liquid-glass max-w-md rounded-2xl p-6 md:p-8">
                        <p className="m-0 mb-3 text-xs tracking-widest text-white/50 uppercase">
                            Our Approach
                        </p>
                        <p className="m-0 text-sm leading-relaxed text-white md:text-base">
                            We believe in the power of curiosity-driven exploration. Every project
                            starts with a question, and every answer opens a new door to innovation.
                        </p>
                    </div>

                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="liquid-glass shrink-0 cursor-pointer self-start rounded-full px-8 py-3 text-sm font-medium text-white md:self-auto"
                    >
                        Explore more
                    </motion.button>
                </div>
            </Reveal>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Philosophy() {
    return (
        <section className="overflow-hidden bg-black px-6 py-28 md:py-40">
            <div className="mx-auto max-w-6xl">
                <Reveal>
                    <h2 className="m-0 mb-16 text-5xl tracking-tight text-white md:mb-24 md:text-7xl lg:text-8xl">
                        Innovation <Accent className="text-white/40">x</Accent> Vision
                    </h2>
                </Reveal>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                    <Reveal x={-40} y={0} className="aspect-[4/3] overflow-hidden rounded-3xl">
                        <video
                            className="h-full w-full object-cover"
                            src={PHILOSOPHY_VIDEO}
                            muted
                            autoPlay
                            loop
                            playsInline
                            preload="auto"
                        />
                    </Reveal>

                    <Reveal x={40} y={0}>
                        {PHILOSOPHY_BLOCKS.map((block, i) => (
                            <React.Fragment key={block.label}>
                                {i > 0 && <div className="my-8 h-px w-full bg-white/10" />}
                                <div>
                                    <p className="m-0 mb-4 text-xs tracking-widest text-white/40 uppercase">
                                        {block.label}
                                    </p>
                                    <p className="m-0 text-base leading-relaxed text-white/70 md:text-lg">
                                        {block.body}
                                    </p>
                                </div>
                            </React.Fragment>
                        ))}
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Services() {
    return (
        <section className="relative overflow-hidden bg-black px-6 py-28 md:py-40">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]" />

            <div className="relative mx-auto max-w-6xl">
                <Reveal y={30} duration={0.7}>
                    <div className="mb-12 flex items-end justify-between">
                        <h2 className="m-0 text-3xl tracking-tight text-white md:text-5xl">
                            What we do
                        </h2>
                        <span className="hidden text-sm text-white/40 md:block">Our services</span>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                    {SERVICES.map((service, i) => (
                        <Reveal
                            key={service.title}
                            y={50}
                            delay={i * 0.15}
                            className="liquid-glass group overflow-hidden rounded-3xl"
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <video
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src={service.video}
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                    preload="auto"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-xs tracking-widest text-white/40 uppercase">
                                        {service.tag}
                                    </span>
                                    <span className="liquid-glass flex shrink-0 rounded-full p-2 text-white">
                                        <ArrowUpRight size={16} />
                                    </span>
                                </div>
                                <h3 className="m-0 mt-4 mb-3 text-xl tracking-tight text-white md:text-2xl">
                                    {service.title}
                                </h3>
                                <p className="m-0 text-sm leading-relaxed text-white/50">
                                    {service.body}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

export default function KnowItAll() {
    return (
        <PageFrame title="Know It All — Asme" className="bg-black">
            <BackButton fixed top={92} left={24} />

            <GlassHero
                video={HERO_VIDEO}
                videoClassName="absolute inset-0 z-0 h-full w-full object-cover object-bottom"
                heading={
                    <>
                        Know it <em className="italic">all</em>.
                    </>
                }
                headingClassName="font-serif-accent m-0 mb-8 text-7xl tracking-tight whitespace-nowrap text-white md:text-8xl lg:text-9xl"
            />

            <About />
            <FeaturedVideo />
            <Philosophy />
            <Services />
        </PageFrame>
    );
}
