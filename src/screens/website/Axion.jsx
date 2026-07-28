import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowRight, Clock, Link as LinkIcon, Menu, X } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import MobileMenu from './shared/MobileMenu.jsx';

/* Split out of the entry chunk — see the module's own header for why. */
const ShaderBackdrop = lazy(() => import('./shared/ShaderBackdrop.jsx'));

/**
 * Axion Studio — a light agency site in three sections. The only design in this
 * folder whose hero is generated rather than filmed: a live shader stack paints
 * the off-white backdrop, so the ripple behind the headline never loops.
 *
 * ─── Licensing ───────────────────────────────────────────────────────────────
 * The `shaders` package is not free software. Its licence allows personal,
 * non-commercial and evaluation use; *any* public-facing deployment, client work
 * or internal tool needs a paid Pro or Team seat. This template is the only thing
 * in the library that pulls it in — if this repo is ever deployed or used
 * commercially, either buy a seat or swap this hero's background out.
 *
 * ─── Fallback ────────────────────────────────────────────────────────────────
 * The engine is WebGPU-only. Where that is missing or blocked the canvas stays
 * transparent for good and fires `onUnavailable`, so the section keeps a static
 * gradient underneath that reads as the same backdrop. The shader is decorative;
 * nothing about the page depends on it drawing.
 */

const IMAGES = {
    aboutSmall: '/assets/axion/about-small.webp',
    aboutLarge: '/assets/axion/about-large.webp',
};

const CASES = [
    {
        title: 'Narrativ',
        video: '/assets/axion/narrativ.mp4',
        body: 'Winner of Site of the Month 2025 - an interactive 3D showcase driving record engagement',
        frameClass: 'aspect-[329/246] bg-[#1a1d2e]',
        pillClass: 'bg-white text-gray-900 group-hover:w-[148px]',
        label: 'Learn more',
        icon: 'link',
    },
    {
        title: 'Luminar',
        video: '/assets/axion/luminar.mp4',
        body: 'Transforming a dated platform into a conversion-focused brand experience',
        frameClass: 'aspect-square bg-[#6b6b6b]',
        pillClass: 'bg-gray-900 text-white group-hover:w-[168px]',
        label: 'View case study',
        icon: 'arrow',
    },
];

const NAV_LINKS = ['Projects', 'Studio', 'Journal', 'Connect'];

const SHELL = 'mx-auto w-full max-w-[1440px]';
const GUTTER = 'px-5 sm:px-8 lg:px-12';

/** The house easing. Everything not explicitly told otherwise uses it. */
const EASE = 'ease-[cubic-bezier(0.25,0.1,0.25,1)]';
/** The bottom sheet gets a sharper one so it snaps rather than drifts. */
const SHEET_EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]';

/*
 * The same two curves as raw timing functions, for components that take a CSS
 * value rather than a class — `shared/MobileMenu` sets its timing inline so the
 * duration stays a prop and reduced motion can zero it.
 *
 * Spelled out twice rather than interpolated into the classes above, because
 * Tailwind finds arbitrary values by scanning source text: `ease-[${EASE_FN}]`
 * is a string the scanner never sees, and the utility would not be generated.
 */
const EASE_FN = 'cubic-bezier(0.25,0.1,0.25,1)';
const SHEET_EASE_FN = 'cubic-bezier(0.32,0.72,0,1)';

const PARTNER_STARBURST =
    'm19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z';

const ABOUT_COPY = [
    'Through research, creative thinking and iteration we',
    'help growing brands realize their digital full potential.',
];

/* -------------------------------------------------------------------------- */

/**
 * Hover roll: two stacked copies of the label in a one-line window. On hover the
 * pair slides up half its own height, so copy two takes copy one's place.
 */
function TextRoll({ children }) {
    return (
        <span className="block h-[20px] overflow-hidden">
            <span
                className={`flex flex-col transition-transform duration-500 group-hover:-translate-y-1/2 ${EASE}`}
            >
                <span className="block h-[20px] leading-[20px] whitespace-nowrap">{children}</span>
                <span className="block h-[20px] leading-[20px] whitespace-nowrap" aria-hidden="true">
                    {children}
                </span>
            </span>
        </span>
    );
}

/** Pill button with a rolling label and an arrow that swings to the diagonal. */
function RollButton({ label, tone = 'orange', className = '' }) {
    const isOrange = tone === 'orange';
    return (
        <button
            type="button"
            className={`group flex w-fit cursor-pointer items-center gap-3 rounded-full border-none py-2 pr-2 text-[13px] font-medium sm:text-[14px] ${
                isOrange
                    ? 'bg-axion-orange pl-5 text-white hover:bg-axion-orange-dark sm:pl-6'
                    : 'bg-gray-900 pl-5 text-white'
            } transition-colors duration-500 ${EASE} ${className}`}
        >
            <TextRoll>{label}</TextRoll>
            <span
                className={`flex shrink-0 items-center justify-center rounded-full bg-white ${
                    isOrange ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-6 w-6'
                }`}
            >
                <ArrowRight
                    size={14}
                    className={`transition-transform duration-500 group-hover:-rotate-45 ${EASE} ${
                        isOrange ? 'text-axion-orange' : 'text-gray-900'
                    }`}
                />
            </span>
        </button>
    );
}

function BadgeRow({ number, label, borderClass }) {
    return (
        <div className={`${GUTTER} mb-6 flex items-center gap-3 sm:mb-8`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
                {number}
            </span>
            <span
                className={`rounded-full border px-3 py-1 text-[12px] font-medium text-gray-900 sm:px-4 sm:py-1.5 sm:text-[13px] ${borderClass}`}
            >
                {label}
            </span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

/** London wall-clock time, HH:MM, ticking every second. */
function useLondonTime() {
    const format = () =>
        new Date().toLocaleTimeString('en-GB', {
            timeZone: 'Europe/London',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

    const [time, setTime] = useState(format);

    useEffect(() => {
        const id = window.setInterval(() => setTime(format()), 1000);
        return () => window.clearInterval(id);
    }, []);

    return time;
}

/* -------------------------------------------------------------------------- */

function Navbar({ time, menuOpen, onToggleMenu }) {
    return (
        <div className={`${SHELL} relative z-20 p-2 sm:p-3`}>
            <nav className="flex items-center justify-between rounded-full bg-white p-[5px]">
                <div className="flex items-center gap-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold tracking-tight text-white sm:h-10 sm:w-10 sm:text-[11px]">
                        AX
                    </span>
                    <div className="hidden items-center gap-6 md:flex">
                        {NAV_LINKS.map(link => (
                            <a
                                key={link}
                                href="#"
                                className={`text-[14px] text-gray-900 no-underline transition-colors duration-300 hover:text-gray-500 ${EASE}`}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="hidden items-center gap-5 pr-1 md:flex">
                    <span className="hidden text-[13px] text-gray-600 lg:inline">
                        Taking on projects for Q1 2026
                    </span>
                    <span className="flex items-center gap-1.5 text-[13px] text-gray-600">
                        <Clock size={14} />
                        {time} in London
                    </span>
                    <RollButton label="Book a strategy call" tone="dark" />
                </div>

                <button
                    type="button"
                    onClick={onToggleMenu}
                    className="mr-1 cursor-pointer rounded-full border-none bg-gray-900 px-4 py-2 text-[13px] text-white md:hidden"
                >
                    <span className="flex items-center gap-2">
                        {menuOpen ? <X size={14} /> : <Menu size={14} />}
                        {menuOpen ? 'Close' : 'Menu'}
                    </span>
                </button>
            </nav>
        </div>
    );
}

function MobileSheet({ open, time, onClose }) {
    return (
        <MobileMenu
            variant="sheet"
            from="bottom"
            open={open}
            onClose={onClose}
            duration={500}
            ease={SHEET_EASE_FN}
            scrimEase={EASE_FN}
            className="md:hidden"
            panelClassName="mx-3 mb-3 rounded-2xl bg-white p-6"
        >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-[12px] text-gray-600">
                <Clock size={12} />
                {time} in London
            </span>

            <div className="mt-6 flex flex-col gap-3">
                {NAV_LINKS.map(link => (
                    <a
                        key={link}
                        href="#"
                        onClick={onClose}
                        className="text-[28px] font-medium text-gray-900 no-underline"
                    >
                        {link}
                    </a>
                ))}
            </div>

            <RollButton label="Start a project" className="mt-8 w-full justify-between" />
        </MobileMenu>
    );
}

/* -------------------------------------------------------------------------- */

function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]">
            {/*
             * Stand-in for the shader: the same off-white, with a warm bloom where
             * ChromaFlow's orange collects. Painted unconditionally and simply
             * covered by the opaque shader canvas when there is one — which means
             * it also covers the moment before the lazy chunk lands, and browsers
             * with no WebGPU at all, without either case needing to be detected.
             */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    background:
                        'radial-gradient(80% 60% at 70% 20%, rgba(255,95,3,0.10) 0%, transparent 60%), linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
                }}
            />

            <Suspense fallback={null}>
                <ShaderBackdrop />
            </Suspense>

            <div className="relative z-20 flex min-h-screen flex-col">
                <HeroChrome />
            </div>
        </section>
    );
}

/** Split out so `Hero` stays about the background and this about the content. */
function HeroChrome() {
    const time = useLondonTime();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <Navbar time={time} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(o => !o)} />

            <div className="flex-1" />

            <div className={`${SHELL} ${GUTTER} pb-14 sm:pb-16 lg:pb-20`}>
                <p className="m-0 mb-5 text-[13px] tracking-wide text-gray-900 sm:mb-8 sm:text-[14px]">
                    Axion Studio
                </p>

                <h1
                    className="m-0 font-medium leading-[1.08] tracking-[-0.03em] text-gray-900"
                    style={{ fontSize: 'clamp(1.75rem, 7vw, 4.2rem)' }}
                >
                    <span
                        className="hidden sm:inline"
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)' }}
                    >
                        We craft digital experiences
                        <br />
                        for brands ready to dominate
                        <br />
                        their category online.
                    </span>
                    <span className="sm:hidden">
                        We craft digital experiences for brands ready to dominate their category
                        online.
                    </span>
                </h1>

                <div className="mt-8 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
                    <RollButton label="Start a project" />

                    <div className="flex w-fit items-center gap-2.5 rounded-[4px] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                            className="h-5 w-5 fill-current text-axion-copper sm:h-6 sm:w-6"
                            aria-hidden="true"
                        >
                            <path d={PARTNER_STARBURST} />
                        </svg>
                        <span className="text-[13px] font-medium text-gray-900 sm:text-[14px]">
                            Certified Partner
                        </span>
                        <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white sm:px-2 sm:text-[11px]">
                            Featured
                        </span>
                    </div>
                </div>
            </div>

            <MobileSheet open={menuOpen} time={time} onClose={() => setMenuOpen(false)} />
        </>
    );
}

/* -------------------------------------------------------------------------- */

function About() {
    return (
        <section className="overflow-hidden bg-white pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-32 lg:pb-24">
            <div className={SHELL}>
                <BadgeRow number="1" label="Introducing Axion" borderClass="border-gray-200" />

                <h2
                    className={`${GUTTER} m-0 mb-12 font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 sm:mb-16 lg:mb-28`}
                    style={{ fontSize: 'clamp(1.5rem, 4vw, 3.2rem)' }}
                >
                    Strategy-led creatives, delivering
                    <br />
                    results in digital and beyond.
                </h2>

                {/* Two layouts rather than one that bends: stacked below lg, and a
                 * three-track grid above it where the columns align on different
                 * edges (small image and large image to the baseline, copy to the
                 * top) — something a single reflowing layout cannot express. */}
                <div className={`${GUTTER} lg:hidden`}>
                    <p className="m-0 text-[15px] leading-[1.6] font-medium text-gray-900 sm:text-[17px]">
                        {ABOUT_COPY.join(' ')}
                    </p>
                    <RollButton label="About our studio" className="mt-6" />

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5">
                        <img
                            src={IMAGES.aboutSmall}
                            alt=""
                            loading="lazy"
                            className="aspect-[438/346] w-full rounded-xl object-cover sm:w-[45%] sm:rounded-2xl"
                        />
                        <img
                            src={IMAGES.aboutLarge}
                            alt=""
                            loading="lazy"
                            className="aspect-[900/600] w-full rounded-xl object-cover sm:w-[55%] sm:rounded-2xl"
                        />
                    </div>
                </div>

                <div
                    className={`${GUTTER} hidden items-end gap-6 lg:grid xl:gap-8`}
                    style={{ gridTemplateColumns: '26% 1fr 48%' }}
                >
                    <img
                        src={IMAGES.aboutSmall}
                        alt=""
                        loading="lazy"
                        className="aspect-[438/346] w-full self-end rounded-2xl object-cover"
                    />

                    <div className="flex justify-end self-start">
                        <div>
                            <p className="m-0 text-[16px] leading-[1.65] font-medium whitespace-nowrap text-gray-900 xl:text-[18px]">
                                {ABOUT_COPY[0]}
                                <br />
                                {ABOUT_COPY[1]}
                            </p>
                            <RollButton label="About our studio" className="mt-6" />
                        </div>
                    </div>

                    <img
                        src={IMAGES.aboutLarge}
                        alt=""
                        loading="lazy"
                        className="aspect-[3/2] w-full self-end rounded-2xl object-cover"
                    />
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function CaseStudies() {
    return (
        <section className="bg-[#F5F5F5] pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28">
            <div className={SHELL}>
                <BadgeRow number="2" label="Featured client work" borderClass="border-gray-300" />

                <h2
                    className={`${GUTTER} m-0 mb-10 font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:mb-14 lg:mb-16`}
                    style={{ fontSize: 'clamp(1.75rem, 7vw, 4.2rem)' }}
                >
                    Our projects
                </h2>

                <div
                    className={`${GUTTER} grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:gap-7`}
                >
                    {CASES.map(item => (
                        <div key={item.title}>
                            <div
                                className={`group relative cursor-pointer overflow-hidden rounded-2xl ${item.frameClass}`}
                            >
                                <video
                                    className="h-full w-full object-cover"
                                    src={item.video}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />

                                <span
                                    className={`absolute bottom-4 left-4 flex h-9 w-9 items-center gap-2 overflow-hidden rounded-full pl-[11px] transition-all duration-300 ease-in-out ${item.pillClass}`}
                                >
                                    {item.icon === 'link' ? (
                                        <LinkIcon
                                            size={14}
                                            className="shrink-0 -rotate-45 transition-transform duration-300 ease-in-out group-hover:rotate-0"
                                        />
                                    ) : (
                                        <ArrowRight
                                            size={14}
                                            className="shrink-0 -rotate-45 transition-transform duration-300 ease-in-out group-hover:rotate-0"
                                        />
                                    )}
                                    <span className="text-[13px] font-medium whitespace-nowrap opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
                                        {item.label}
                                    </span>
                                </span>
                            </div>

                            <p className="m-0 mt-4 text-[13px] leading-relaxed text-gray-600 sm:text-[14px]">
                                {item.body}
                            </p>
                            <p className="m-0 mt-1 text-[14px] font-semibold text-gray-900 sm:text-[15px]">
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

export default function Axion() {
    return (
        <PageFrame title="Axion Studio — Strategy-led Creatives" className="bg-[#EFEFEF]">
            <BackButton fixed top={90} left={28} />

            <Hero />
            <About />
            <CaseStudies />
        </PageFrame>
    );
}
