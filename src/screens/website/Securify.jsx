import React from 'react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';

/**
 * Securify — a locked hero whose headline is three separate absolutely-placed
 * words, each stepped down and across the frame at 18%, 38% and 58% of its
 * height. Sized in `vw`, so the composition holds its proportions at any width
 * instead of reflowing.
 *
 * Everything else is dropped into the gaps the stagger leaves behind: the copy in
 * the notch beside "your", the three stat blocks in the corners. Nothing is
 * centred and nothing is in a grid.
 *
 * All type is lowercase, and the only colour is black, white and neutral-900.
 */

const HERO_VIDEO = '/assets/securify/hero.mp4';

const NAV_LINKS = ['platform', 'solutions', 'company', 'support'];

const PILL = 'rounded-full bg-neutral-900/90 backdrop-blur';

const WORDS = [
    { text: 'protect', position: 'top-[18%] left-4 md:left-10' },
    { text: 'your', position: 'top-[38%] right-4 md:right-10' },
    { text: 'data', position: 'top-[58%] left-[18%] md:left-[28%]' },
];

/* -------------------------------------------------------------------------- */

function Logo() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="#ffffff"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path d="M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z" />
        </svg>
    );
}

/** A hairline rule, tilted — the only non-typographic mark on the page. */
function Rule({ tilt }) {
    return <span className={`hidden h-px w-24 bg-white/40 md:block ${tilt}`} aria-hidden="true" />;
}

function Stat({ value, label, tilt, leading, align }) {
    return (
        <>
            <div className={`flex items-center gap-3 ${align === 'right' ? 'justify-end' : ''}`}>
                {leading && <Rule tilt={tilt} />}
                <span className="text-4xl font-medium tracking-tight text-white md:text-5xl">
                    {value}
                </span>
                {!leading && <Rule tilt={tilt} />}
            </div>
            <p
                className={`m-0 mt-1 text-xs text-white/70 md:text-sm ${
                    align === 'right' ? 'text-right' : ''
                }`}
            >
                {label}
            </p>
        </>
    );
}

/* -------------------------------------------------------------------------- */

export default function Securify() {
    return (
        <PageFrame title="securify — protect your data" scroll={false} className="type-readex">
            <section className="relative h-screen w-full overflow-hidden bg-black">
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={HERO_VIDEO}
                    autoPlay
                    loop
                    muted
                    playsInline
                />

                <div className="absolute top-0 right-0 left-0 z-20 px-6 pt-6 md:px-10">
                    <nav className="flex items-center justify-between gap-4">
                        <div className={`${PILL} flex items-center gap-2 py-3 pr-6 pl-4`}>
                            <Logo />
                            <span className="text-sm font-normal tracking-tight text-white">
                                securify
                            </span>
                        </div>

                        <div className={`${PILL} hidden items-center gap-1 px-3 py-2 md:flex`}>
                            {NAV_LINKS.map(link => (
                                <a
                                    key={link}
                                    href="#"
                                    className="rounded-full px-5 py-2 text-sm text-neutral-300 no-underline transition-colors hover:text-white"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="cursor-pointer rounded-full border-none bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
                        >
                            get started
                        </button>
                    </nav>
                </div>

                {/* In the band between the nav pill and the first headline word. */}
                <BackButton top={84} left={24} />

                <div className="relative h-full w-full">
                    {WORDS.map(word => (
                        <h1
                            key={word.text}
                            className={`hero-title absolute m-0 text-[14vw] font-medium text-white md:text-[13vw] ${word.position}`}
                        >
                            {word.text}
                        </h1>
                    ))}

                    <p className="absolute top-[46%] left-6 z-10 m-0 max-w-[240px] text-[15px] leading-snug text-white/90 md:left-10">
                        we can guarding your data with utmost care, empowering you with privacy
                        everywhere
                    </p>

                    <div className="absolute top-[14%] right-6 z-10 md:right-24">
                        <Stat value="+65k" label="startups use" tilt="rotate-[20deg]" leading align="right" />
                    </div>

                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-48 bg-gradient-to-b from-transparent to-black" />

                    <div className="absolute bottom-20 left-6 z-10 md:bottom-24 md:left-20">
                        <Stat value="+1.5b" label="gb data was protected" tilt="rotate-[-20deg]" />
                    </div>

                    <div className="absolute right-6 bottom-16 z-10 md:right-20 md:bottom-20">
                        <Stat
                            value="+300k"
                            label="downloads"
                            tilt="rotate-[-20deg]"
                            leading
                            align="right"
                        />
                    </div>
                </div>
            </section>
        </PageFrame>
    );
}
