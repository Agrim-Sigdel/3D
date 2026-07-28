import React, { useState } from 'react';
import { Menu, Play, X } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import SharedMobileMenu from './shared/MobileMenu.jsx';

/**
 * Adam Roberts — a locked single-viewport portfolio card over full-bleed video.
 *
 * The whole composition is one `flex-col` the height of the frame: navbar and
 * meta grid at the top, a `flex-1` spacer, then the headline and footer pinned
 * to the bottom edge. Nothing scrolls and nothing animates in on load; the page
 * is complete on first paint.
 *
 * Type is doing the work here. Inter carries the structure while basis33 — a
 * bitmap face — sets the surnames, the labels and two words inside the headline,
 * so the pixel grid reads as a second voice rather than a different font.
 */

const HERO_VIDEO = '/assets/adam/hero.mp4';

const NAV_ITEMS = ['ABOUT', 'PROCESS', 'PROJECTS', 'CATALOG', 'D.O.T', 'TALK'];

const SERVICES = [
    'Branding',
    'Creative Direction & Strategy',
    'UX/UI Design',
    'Web Development (React/Nextjs)',
    '3D, WebGL / Photography',
    'Video & Animation',
];

/** The brand blurb breaks at these exact points — it is set as four lines. */
const BLURB = ['Grilled Pixels is my', 'personal brand - I came up', 'with it in 2004 based on', '"cooking up ideas"'];

const AWARDS = [
    { name: 'FWA', count: 'x1', nameClass: 'text-sm font-bold tracking-tight sm:text-base' },
    { name: 'W.', count: 'x7', nameClass: 'text-lg font-bold sm:text-xl' },
    {
        name: 'CSSDesignAwards',
        count: 'x22',
        nameClass: 'text-[10px] font-bold tracking-tight sm:text-xs',
    },
];

const MENU_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* -------------------------------------------------------------------------- */

function Logo({ size = 28 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 256 256"
            fill="none"
            aria-label="Grilled Pixels"
            role="img"
        >
            <path
                d="M 160 88 L 194 34 L 216 0 L 256 0 L 256 40 L 221.5 93.5 L 200 128 L 256 128 L 256 256 L 96 256 L 96 168 L 64.246 220 L 40 256 L 0 256 L 0 216 L 34 162 L 56 128 L 0 128 L 0 0 L 160 0 Z"
                fill="white"
            />
        </svg>
    );
}

/** Column heading: an Inter line above a basis33 line, same optical weight. */
function StackedTitle({ top, bottom }) {
    return (
        <h2 className="m-0 text-lg leading-tight tracking-wide md:text-xl">
            <span className="block font-normal">{top}</span>
            <span className="font-pixel block text-2xl md:text-3xl">{bottom}</span>
        </h2>
    );
}

function MetaLabel({ children }) {
    return (
        <p className="font-pixel m-0 mb-3 text-base tracking-widest text-white/50 uppercase">
            {children}
        </p>
    );
}

/** One of the two basis33 words dropped into the Inter headline. */
function PixelWord({ children }) {
    return (
        <span className="font-pixel inline-block align-baseline text-[1.25em] leading-none font-normal">
            {children}
        </span>
    );
}

/* -------------------------------------------------------------------------- */

function MobileMenu({ open, onClose }) {
    return (
        <SharedMobileMenu
            variant="overlay"
            from="fade"
            open={open}
            onClose={onClose}
            duration={500}
            ease={MENU_EASE}
            stagger={60}
            staggerDelay={100}
            panelClassName="bg-black/95 backdrop-blur-md"
        >
            <div className="flex items-center justify-between px-6 py-6">
                <Logo />
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close menu"
                    className="cursor-pointer border-none bg-transparent p-2 text-white transition-opacity hover:opacity-70"
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center gap-8">
                {NAV_ITEMS.map((item, i) => (
                    <SharedMobileMenu.Item key={item} as="a" index={i} href="#" onClick={onClose}>
                        <span className="text-2xl tracking-widest text-white no-underline">
                            {item}
                        </span>
                    </SharedMobileMenu.Item>
                ))}
            </nav>
        </SharedMobileMenu>
    );
}

/* -------------------------------------------------------------------------- */

export default function Adam() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <PageFrame
            title="Adam Roberts - Design & Engineering"
            scroll={false}
            className="type-inter bg-black text-white"
        >
            <video
                className="absolute inset-0 h-full w-full object-cover lg:scale-[1.2]"
                src={HERO_VIDEO}
                autoPlay
                muted
                loop
                playsInline
            />

            {/* The navbar is logo-left, links-right, so the gap between them is
             * the one piece of empty chrome the control can sit in. Clear of the
             * logo, which starts at the `lg:px-14` gutter. */}
            <BackButton top={26} left={104} />

            <div className="relative z-10 flex h-full flex-col px-5 sm:px-6 md:px-10 lg:px-14">
                <header className="flex items-center justify-between py-6">
                    <Logo />

                    <nav className="hidden items-center gap-8 md:flex">
                        {NAV_ITEMS.map(item => (
                            <a
                                key={item}
                                href="#"
                                className="text-sm tracking-wide text-white no-underline transition-opacity hover:opacity-70"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                        className="cursor-pointer border-none bg-transparent p-2 text-white transition-opacity hover:opacity-70 md:hidden"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
                    <div>
                        <StackedTitle top="ADAM" bottom="ROBERTS" />
                        <p className="m-0 mt-3 text-[10px] text-white/50">*</p>
                        <p className="font-pixel m-0 mt-1 text-xs leading-relaxed text-white/60">
                            {BLURB.map(line => (
                                <span key={line} className="block">
                                    {line}
                                </span>
                            ))}
                        </p>
                    </div>

                    <div className="text-right lg:text-left">
                        <StackedTitle top="DESIGN &" bottom="ENGINEERING" />
                    </div>

                    <div>
                        <MetaLabel>What I Do</MetaLabel>
                        <p className="m-0 max-w-[220px] text-sm leading-relaxed text-white/90">
                            I create the top 1% of experiences for brands and digital products
                        </p>
                    </div>

                    <div className="text-right lg:text-left">
                        <MetaLabel>Services</MetaLabel>
                        <ul className="m-0 list-none space-y-0.5 p-0 text-sm leading-relaxed text-white/90">
                            {SERVICES.map(service => (
                                <li key={service}>{service}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex-1" />

                <div className="pb-4">
                    <div className="grid grid-cols-1 items-end gap-4 sm:gap-6 lg:grid-cols-2">
                        <h1
                            className="m-0 text-3xl font-normal tracking-wide uppercase sm:text-4xl md:text-5xl lg:text-[3.75rem] xl:text-[4.25rem]"
                            style={{ lineHeight: 0.72 }}
                        >
                            <span className="block">I BRING THE</span>
                            <span className="block">
                                <PixelWord>UNEXPECTED</PixelWord> TO
                            </span>
                            <span className="block">BRAND &amp; DIGITAL</span>
                            <span className="block">
                                <PixelWord>EXPERIENCES</PixelWord>
                            </span>
                        </h1>

                        <div className="flex flex-col justify-end gap-4 sm:gap-6">
                            <button
                                type="button"
                                className="flex cursor-pointer items-center gap-3 self-start border border-white/30 bg-white/5 px-6 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                            >
                                <Play size={14} fill="white" />
                                <span className="text-sm tracking-wider">PLAY SHOWREEL</span>
                            </button>

                            <div className="flex flex-wrap items-stretch gap-2 self-start text-sm text-white/80 sm:gap-3 lg:self-end">
                                {AWARDS.map(award => (
                                    <div
                                        key={award.name}
                                        className="flex items-center gap-2 bg-[#0B0B0B] px-3 py-2 sm:px-4"
                                    >
                                        <span className={award.nameClass}>{award.name}</span>
                                        <span className="text-xs text-white/50">{award.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 pt-4 sm:mt-5 sm:grid-cols-2 sm:gap-4">
                        <p className="m-0 text-xs text-white/60">
                            Open to freelance, contract or full-time.{' '}
                            <a
                                href="#"
                                className="text-red-500 no-underline transition-colors hover:text-red-400"
                            >
                                Schedule a call
                            </a>
                        </p>
                        <p className="m-0 text-xs text-white/60 sm:text-right">
                            5 full cases &bull; 82 archive fragments &bull; 22 catalog items
                        </p>
                    </div>
                </div>
            </div>

            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </PageFrame>
    );
}
