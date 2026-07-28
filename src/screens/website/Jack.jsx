import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import { useScrollFrame } from './shared/frameContext.js';
import FadeIn from './shared/FadeIn.jsx';
import AnimatedText from './shared/AnimatedText.jsx';
import Magnet from './shared/Magnet.jsx';

/**
 * Jack — five-section portfolio for a 3D creator.
 *
 * Hero, marquee, about, services, projects. Two of the sections read the
 * scroll position directly: the marquee counter-slides its two rows, and the
 * project cards stack by shrinking each card as the next one covers it. Both
 * measure against the PageFrame rather than the window, because the window
 * never moves here.
 */

const INK = '#0C0C0C';
const ICE = '#D7E2EA';

const PORTRAIT = '/assets/jack/portrait.png';

const NAV_LINKS = ['About', 'Price', 'Projects', 'Contact'];

const MARQUEE_IMAGES = [
    'hero-space-voyage-preview-eECLH3Yc',
    'hero-codenest-preview-Cgppc2qV',
    'hero-vex-ventures-preview-BczMFIiw',
    'hero-stellar-ai-v2-preview-DjvxjG3C',
    'hero-asme-preview-B_nGDnTP',
    'hero-transform-data-preview-Cx5OU29N',
    'hero-vitara-preview-Cjz2QYyU',
    'hero-terra-preview-BFjrCr7T',
    'hero-skyelite-preview-DHaZIgUv',
    'hero-aethera-preview-DknSlcTa',
    'hero-designpro-preview-D8c5_een',
    'hero-stellar-ai-preview-D3HL6bw1',
    'hero-xportfolio-preview-D4A8maiC',
    'hero-orbit-web3-preview-BXt4OttD',
    'hero-nexora-preview-cx5HmUgo',
    'hero-evr-ventures-preview-DZxeVFEX',
    'hero-planet-orbit-preview-DWAP8Z1P',
    'hero-new-era-preview-CocuDUm9',
    'hero-wealth-preview-B70idl_u',
    'hero-luminex-preview-CxOP7ce6',
    'hero-celestia-preview-0yO3jXO8',
].map(slug => `/assets/jack/marquee/${slug}`);

const ABOUT_DECOR = [
    {
        src: '/assets/jack/decor-moon.png',
        className:
            'top-[4%] left-[1%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]',
        delay: 0.1,
        x: -80,
    },
    {
        src: '/assets/jack/decor-p59.png',
        className:
            'bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]',
        delay: 0.25,
        x: -80,
    },
    {
        src: '/assets/jack/decor-lego.png',
        className:
            'top-[4%] right-[1%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]',
        delay: 0.15,
        x: 80,
    },
    {
        src: '/assets/jack/decor-group134.png',
        className:
            'bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]',
        delay: 0.3,
        x: 80,
    },
];

const SERVICES = [
    {
        number: '01',
        name: '3D Modeling',
        blurb: 'Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.',
    },
    {
        number: '02',
        name: 'Rendering',
        blurb: 'High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.',
    },
    {
        number: '03',
        name: 'Motion Design',
        blurb: 'Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.',
    },
    {
        number: '04',
        name: 'Branding',
        blurb: 'Crafting cohesive visual identities — from logos to full brand systems — that communicate a clear and memorable presence.',
    },
    {
        number: '05',
        name: 'Web Design',
        blurb: 'Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.',
    },
];

const shot = name => `/assets/jack/projects/${name}.webp`;

const PROJECTS = [
    {
        number: '01',
        name: 'Nextlevel Studio',
        category: 'Client',
        col1: [shot('nextlevel-a'), shot('nextlevel-b')],
        col2: shot('nextlevel-tall'),
    },
    {
        number: '02',
        name: 'Aura Brand Identity',
        category: 'Personal',
        col1: [shot('aura-a'), shot('aura-b')],
        col2: shot('aura-tall'),
    },
    {
        number: '03',
        name: 'Solaris Digital',
        category: 'Client',
        col1: [shot('solaris-a'), shot('solaris-b')],
        col2: shot('solaris-tall'),
    },
];

const HEADING_SIZE = { fontSize: 'clamp(3rem, 12vw, 160px)' };
const NUMBER_SIZE = { fontSize: 'clamp(3rem, 10vw, 140px)' };

/* -------------------------------------------------------------------------- */

function ContactButton({ className = '' }) {
    return (
        <button
            type="button"
            className={`cursor-pointer rounded-full border-none px-8 py-3 text-xs font-medium tracking-widest text-white uppercase sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base ${className}`}
            style={{
                background:
                    'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
                outline: '2px solid #fff',
                outlineOffset: '-3px',
            }}
        >
            Contact Me
        </button>
    );
}

function LiveProjectButton() {
    return (
        <button
            type="button"
            className="cursor-pointer rounded-full border-2 bg-transparent px-8 py-3 text-sm font-medium tracking-widest uppercase transition-colors duration-300 hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base"
            style={{ borderColor: ICE, color: ICE }}
        >
            Live Project
        </button>
    );
}

/* -------------------------------------------------------------------------- */

function HeroSection() {
    return (
        <section
            className="relative flex h-screen flex-col"
            style={{ background: INK, overflowX: 'clip' }}
        >
            <FadeIn
                as="nav"
                delay={0}
                y={-20}
                className="flex justify-between px-6 pt-6 text-sm font-medium tracking-wider uppercase md:px-10 md:pt-8 md:text-lg lg:text-[1.4rem]"
                style={{ color: ICE }}
            >
                {NAV_LINKS.map(link => (
                    <a
                        key={link}
                        href="#"
                        className="no-underline transition-opacity duration-200 hover:opacity-70"
                        style={{ color: ICE }}
                    >
                        {link}
                    </a>
                ))}
            </FadeIn>

            <div className="overflow-hidden">
                <FadeIn
                    as="h1"
                    delay={0.15}
                    y={40}
                    className="hero-heading m-0 mt-6 w-full text-[14vw] leading-none font-black tracking-tight whitespace-nowrap uppercase sm:mt-4 sm:text-[15vw] md:-mt-5 md:text-[16vw] lg:text-[17.5vw]"
                >
                    Hi, i’m jack
                </FadeIn>
            </div>

            {/* Portrait sits on its own positioned wrapper: FadeIn and Magnet both
                write `transform`, so the centring translate has to live outside them. */}
            <div className="absolute top-1/2 left-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:top-auto sm:bottom-0 sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]">
                <FadeIn delay={0.6} y={30}>
                    <Magnet
                        padding={150}
                        strength={3}
                        activeTransition="transform 0.3s ease-out"
                        inactiveTransition="transform 0.6s ease-in-out"
                    >
                        <img src={PORTRAIT} alt="Jack" className="block w-full" />
                    </Magnet>
                </FadeIn>
            </div>

            <div className="mt-auto flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
                <FadeIn
                    as="p"
                    delay={0.35}
                    y={20}
                    className="relative z-20 m-0 max-w-[160px] leading-snug font-light tracking-wide uppercase sm:max-w-[220px] md:max-w-[260px]"
                    style={{ color: ICE, fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
                >
                    a 3d creator driven by crafting striking and unforgettable projects
                </FadeIn>

                <FadeIn delay={0.5} y={20} className="relative z-20">
                    <ContactButton />
                </FadeIn>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

const ROW_1 = MARQUEE_IMAGES.slice(0, 11);
const ROW_2 = MARQUEE_IMAGES.slice(11);

function MarqueeSection() {
    const sectionRef = useRef(null);
    const row1Ref = useRef(null);
    const row2Ref = useRef(null);
    const frame = useScrollFrame();

    useEffect(() => {
        const section = sectionRef.current;
        const row1 = row1Ref.current;
        const row2 = row2Ref.current;
        const scroller = frame?.current;
        if (!section || !row1 || !row2 || !scroller) return undefined;

        /*
         * The original reads `window.scrollY - section.offsetTop + innerHeight`,
         * which is just "how far the section's top edge has risen into the
         * viewport". Measured off the frame that is `viewportHeight - rect.top`,
         * so the arithmetic is identical without touching window scroll.
         */
        const update = () => {
            const rect = section.getBoundingClientRect();
            const offset = (scroller.clientHeight - rect.top) * 0.3 - 200;
            row1.style.transform = `translateX(${offset}px)`;
            row2.style.transform = `translateX(${-offset}px)`;
        };

        update();
        scroller.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            scroller.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [frame]);

    /*
     * The two rows hold 63 tiles between them (21 clips × 3 copies) but only
     * four or five are ever on screen, so each one plays only while it is in
     * view and holds its poster otherwise.
     *
     * This matters more than it looks. The tiles used to be GIFs, which have no
     * decoder controls at all: all 63 animated continuously whether visible or
     * not. Paired with `preload="none"` the clip is not even fetched until it
     * approaches the viewport, which is what `loading="lazy"` did for the images.
     */
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return undefined;

        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    const video = entry.target;
                    if (entry.isIntersecting) video.play().catch(() => {});
                    else video.pause();
                }
            },
            { rootMargin: '200px' }
        );

        for (const video of section.querySelectorAll('video')) observer.observe(video);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="pt-24 pb-10 sm:pt-32 md:pt-40"
            style={{ background: INK, overflowX: 'clip' }}
        >
            <div className="flex flex-col gap-3">
                {[
                    { ref: row1Ref, images: ROW_1 },
                    { ref: row2Ref, images: ROW_2 },
                ].map(({ ref, images }, rowIndex) => (
                    <div
                        key={rowIndex}
                        ref={ref}
                        className="flex w-max gap-3"
                        style={{ willChange: 'transform' }}
                    >
                        {/* Tripled so the row still covers the viewport at either
                            end of its travel. */}
                        {[0, 1, 2].flatMap(copy =>
                            images.map(src => (
                                <video
                                    key={`${copy}-${src}`}
                                    src={`${src}.mp4`}
                                    poster={`${src}-poster.webp`}
                                    muted
                                    loop
                                    playsInline
                                    preload="none"
                                    width={420}
                                    height={270}
                                    className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
                                />
                            ))
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function AboutSection() {
    return (
        <section
            className="relative flex min-h-screen flex-col items-center justify-center px-5 py-20 sm:px-8 md:px-10"
            style={{ background: INK }}
        >
            {ABOUT_DECOR.map(decor => (
                <FadeIn
                    key={decor.src}
                    delay={decor.delay}
                    duration={0.9}
                    x={decor.x}
                    y={0}
                    className={`pointer-events-none absolute ${decor.className}`}
                >
                    <img src={decor.src} alt="" className="block w-full" />
                </FadeIn>
            ))}

            <div className="relative z-10 flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
                <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
                    <FadeIn
                        as="h2"
                        delay={0}
                        y={40}
                        className="hero-heading m-0 text-center leading-none font-black tracking-tight uppercase"
                        style={HEADING_SIZE}
                    >
                        About me
                    </FadeIn>

                    <AnimatedText
                        className="m-0 max-w-[560px] text-center leading-relaxed font-medium"
                        style={{ color: ICE, fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
                        text="With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let’s build something incredible together!"
                    />
                </div>

                <ContactButton />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function ServicesSection() {
    return (
        <section
            className="rounded-t-[40px] px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
            style={{ background: '#FFFFFF' }}
        >
            <h2
                className="m-0 mb-16 text-center leading-none font-black tracking-tight uppercase sm:mb-20 md:mb-28"
                style={{ ...HEADING_SIZE, color: INK }}
            >
                Services
            </h2>

            <div className="mx-auto max-w-5xl">
                {SERVICES.map((service, i) => (
                    <FadeIn
                        key={service.number}
                        delay={i * 0.1}
                        className="flex items-start gap-4 py-8 sm:gap-8 sm:py-10 md:py-12"
                        style={{
                            borderTop: i === 0 ? '1px solid rgba(12, 12, 12, 0.15)' : 'none',
                            borderBottom: '1px solid rgba(12, 12, 12, 0.15)',
                        }}
                    >
                        <span
                            className="leading-none font-black"
                            style={{ ...NUMBER_SIZE, color: INK }}
                        >
                            {service.number}
                        </span>
                        <div className="flex flex-1 flex-col gap-3">
                            <h3
                                className="m-0 font-medium uppercase"
                                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)', color: INK }}
                            >
                                {service.name}
                            </h3>
                            <p
                                className="m-0 max-w-2xl leading-relaxed font-light"
                                style={{
                                    fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)',
                                    color: INK,
                                    opacity: 0.6,
                                }}
                            >
                                {service.blurb}
                            </p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * One card in the stack. Each shrinks toward `targetScale` over the remainder
 * of the scroll, so a card that has been covered reads as sitting further back
 * than the one on top of it. The last card never scales.
 */
function ProjectCard({ project, index, total, progress }) {
    const targetScale = 1 - (total - 1 - index) * 0.03;
    const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

    return (
        <div className="sticky top-24 flex h-[85vh] items-start justify-center md:top-32">
            <motion.div
                className="relative w-full origin-top rounded-[40px] border-2 p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
                style={{
                    scale,
                    top: index * 28,
                    borderColor: ICE,
                    background: INK,
                }}
            >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4 sm:mb-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <span
                            className="leading-none font-black"
                            style={{ ...NUMBER_SIZE, color: ICE }}
                        >
                            {project.number}
                        </span>
                        <div className="flex flex-col gap-1">
                            <span
                                className="text-xs font-light tracking-widest uppercase sm:text-sm"
                                style={{ color: ICE, opacity: 0.6 }}
                            >
                                {project.category}
                            </span>
                            <span
                                className="font-medium uppercase"
                                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)', color: ICE }}
                            >
                                {project.name}
                            </span>
                        </div>
                    </div>
                    <LiveProjectButton />
                </div>

                <div className="flex gap-3 sm:gap-4">
                    <div className="flex w-[40%] flex-col gap-3 sm:gap-4">
                        <img
                            src={project.col1[0]}
                            alt=""
                            loading="lazy"
                            className="w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
                            style={{ height: 'clamp(130px, 16vw, 230px)' }}
                        />
                        <img
                            src={project.col1[1]}
                            alt=""
                            loading="lazy"
                            className="w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
                            style={{ height: 'clamp(160px, 22vw, 340px)' }}
                        />
                    </div>
                    <div className="w-[60%]">
                        <img
                            src={project.col2}
                            alt=""
                            loading="lazy"
                            className="h-full w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function ProjectsSection() {
    const listRef = useRef(null);
    const frame = useScrollFrame();
    const { scrollYProgress } = useScroll({
        target: listRef,
        container: frame ?? undefined,
        offset: ['start start', 'end end'],
    });

    return (
        <section
            className="relative z-10 -mt-10 rounded-t-[40px] px-5 py-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 md:-mt-14 md:rounded-t-[60px] md:px-10"
            style={{ background: INK }}
        >
            <h2
                className="hero-heading m-0 mb-16 text-center leading-none font-black tracking-tight uppercase sm:mb-20 md:mb-28"
                style={HEADING_SIZE}
            >
                Project
            </h2>

            <div ref={listRef} className="mx-auto max-w-6xl">
                {PROJECTS.map((project, i) => (
                    <ProjectCard
                        key={project.number}
                        project={project}
                        index={i}
                        total={PROJECTS.length}
                        progress={scrollYProgress}
                    />
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

export default function Jack() {
    return (
        <PageFrame
            title="Jack — 3D Creator"
            className="type-kanit"
            style={{ background: INK }}
        >
            {/* Dropped clear of the navbar — "About" sits in the default corner. */}
            <BackButton fixed top={290} />
            <HeroSection />
            <MarqueeSection />
            <AboutSection />
            <ServicesSection />
            <ProjectsSection />
        </PageFrame>
    );
}
