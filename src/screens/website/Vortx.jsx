import React from 'react';
import { ArrowRight } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import { Facebook, LinkedIn, XLogo } from './shared/BrandIcons.jsx';

/**
 * VortxLab Creations — one locked viewport, inset from the page edge so the
 * rounded corners of the video card show against black.
 *
 * Every button is an octagon: `clip-path` shaves 12px off each corner (8px on
 * the small ones). The outline variant can't use a real border — clip-path crops
 * it away — so it stacks a black `::before` one pixel inside a white parent and
 * lifts its own children above it. See `.btn-cut*` in src/index.css.
 *
 * Nothing here waits for scroll or hover: the eight elements fade up on a fixed
 * ladder of CSS animation delays, 0.1s to 1s.
 */

const HERO_VIDEO = '/assets/vortx/hero.mp4';

const SOCIALS = [
    { label: 'X', Icon: XLogo },
    { label: 'LinkedIn', Icon: LinkedIn },
    { label: 'Facebook', Icon: Facebook },
];

const HEADLINE = ['Forging Tomorrow', 'Virtual Horizon', 'VortxLab Creations'];

/* -------------------------------------------------------------------------- */

/**
 * The mark: four quarter-discs pinned to the corners of the box, meeting at the
 * edge midpoints and leaving a four-pointed gap through the middle.
 *
 * The brief describes this shape rather than supplying path data, so it is
 * constructed — each `A` sweeps a 128-radius quarter turn around its own corner.
 */
function Logo({ className = '' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="white"
            className={className}
            aria-label="VortxLab Creations"
            role="img"
        >
            <path d="M 0 0 L 128 0 A 128 128 0 0 1 0 128 Z" />
            <path d="M 256 0 L 256 128 A 128 128 0 0 1 128 0 Z" />
            <path d="M 256 256 L 128 256 A 128 128 0 0 1 256 128 Z" />
            <path d="M 0 256 L 0 128 A 128 128 0 0 1 128 256 Z" />
        </svg>
    );
}

/* -------------------------------------------------------------------------- */

export default function Vortx() {
    return (
        <PageFrame
            title="VortxLab Creations"
            scroll={false}
            className="type-inter bg-black p-3 md:p-4"
        >
            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-black">
                <video
                    className="anim-fade absolute inset-0 h-full w-full object-cover"
                    style={{ animationDelay: '0.2s' }}
                    src={HERO_VIDEO}
                    autoPlay
                    loop
                    muted
                    playsInline
                />

                {/* Beside the logo block, in the empty middle of the navbar. */}
                <BackButton top={44} left={116} />

                <nav className="relative z-10 flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
                    <div className="anim-stagger" style={{ animationDelay: '0.1s' }}>
                        <Logo className="h-14 w-14 md:h-16 md:w-16" />
                        <span className="mt-1 block text-[10px] font-light tracking-[0.4em] text-white md:text-xs">
                            V O R T X
                        </span>
                    </div>

                    <div
                        className="anim-stagger flex items-center gap-3"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <button
                            type="button"
                            className="btn-cut-border hidden cursor-pointer border-none px-5 py-2.5 text-sm text-white hover:bg-white/10 md:block"
                        >
                            <span>Neural Synergy</span>
                        </button>
                        <button
                            type="button"
                            className="btn-cut hidden cursor-pointer border-none bg-white px-5 py-2.5 text-sm text-black hover:bg-white/90 md:block"
                        >
                            Cyber Synthesis
                        </button>
                    </div>
                </nav>

                <div className="relative z-10 flex flex-1 flex-col justify-between px-6 pb-8 md:px-10 md:pb-10">
                    <div className="relative flex flex-1 items-center">
                        <div
                            className="anim-stagger absolute top-[18%] left-0 hidden flex-col gap-6 lg:flex"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <p className="m-0 max-w-[220px] text-base leading-relaxed text-white/80">
                                Come with us
                                <br />
                                exploring the
                                <br />
                                horizon
                            </p>

                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="h-4 w-4 rounded-full border border-white/40" />
                                    <span className="h-4 w-4 rounded-full border border-white/40" />
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-white/70">
                                        Perpetual
                                        <br />
                                        Immersion
                                    </span>
                                    <span className="text-xs text-white/50">01</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className="anim-stagger w-full text-center"
                            style={{ animationDelay: '0.5s' }}
                        >
                            <h1
                                className="m-0 text-3xl leading-[1.1] font-normal tracking-[-0.04em] text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
                            >
                                {HEADLINE.map(line => (
                                    <span key={line} className="block">
                                        {line}
                                    </span>
                                ))}
                            </h1>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 items-center gap-6 md:grid-cols-3">
                        <div
                            className="anim-stagger flex items-center justify-center md:justify-end"
                            style={{ animationDelay: '0.7s' }}
                        >
                            <p className="m-0 max-w-[260px] text-center text-sm leading-relaxed text-white md:ml-auto md:text-left">
                                We push past conventions, reshaping the virtual terrain with
                                next-level technologies.
                            </p>
                        </div>

                        <div
                            className="anim-stagger flex flex-col items-center gap-8 md:gap-24"
                            style={{ animationDelay: '0.85s' }}
                        >
                            <span className="text-2xl font-medium text-white md:text-3xl">
                                Net Dynamics
                            </span>
                            <button
                                type="button"
                                className="btn-cut group flex w-full max-w-[280px] cursor-pointer items-center justify-center gap-2 border-none bg-white py-3.5 text-black transition-colors hover:bg-white/90"
                            >
                                <span className="text-sm font-medium">Discover Now</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>

                        <div
                            className="anim-stagger flex items-center justify-center gap-3 md:justify-end"
                            style={{ animationDelay: '1s' }}
                        >
                            {SOCIALS.map(({ label, Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    aria-label={label}
                                    className="btn-cut-sm flex h-10 w-10 cursor-pointer items-center justify-center border-none bg-white text-black transition-colors hover:bg-white/90"
                                >
                                    <Icon size={16} className="h-4 w-4" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageFrame>
    );
}
